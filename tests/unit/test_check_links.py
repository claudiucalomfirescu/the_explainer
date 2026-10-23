"""Task 16: the paper link checker (REQ-11). Network calls are injected fakes, so every verdict is
driven by a planted response. A 403 from a publisher must never be reported as a pass.

Run: python3 -I -m unittest discover -s tests/unit -p "test_*.py"
"""
import pathlib
import sys
import unittest

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[2] / "scripts"))
import check_links as cl  # noqa: E402

PAPER_DOI = {
    "title": "Long Short-Term Memory",
    "authors": ["Sepp Hochreiter", "Jürgen Schmidhuber"],
    "year": 1997,
    "url": "https://doi.org/10.1162/neco.1997.9.8.1735",
}
CROSSREF_OK = {
    "message": {
        "title": ["Long Short-Term Memory"],
        "author": [{"family": "Hochreiter"}, {"family": "Schmidhuber"}],
        "issued": {"date-parts": [[1997, 11, 1]]},
    }
}
PAPER_ARXIV = {
    "title": "Attention Is All You Need",
    "authors": ["Ashish Vaswani", "Noam Shazeer"],
    "year": 2017,
    "url": "https://arxiv.org/abs/1706.03762",
}
ARXIV_ATOM = """<feed xmlns="http://www.w3.org/2005/Atom"><entry>
<published>2017-06-12T17:57:34Z</published>
<title>Attention Is All You
  Need</title>
<author><name>Ashish Vaswani</name></author><author><name>Noam Shazeer</name></author>
</entry></feed>"""


def page(status=200, text="<html></html>"):
    return lambda url: (status, url, text)


def json_of(data):
    return lambda url: data


def no_json(url):
    raise AssertionError("no metadata lookup expected")


class CheckPaper(unittest.TestCase):
    def test_matching_doi_passes(self):
        # REQ-11
        r = cl.check_paper(PAPER_DOI, page(200), json_of(CROSSREF_OK), {})
        self.assertEqual(r["status"], "PASS", r)

    def test_dead_link_fails(self):
        # REQ-11: a known-bad URL is reported failing
        r = cl.check_paper(PAPER_DOI, page(404), json_of(CROSSREF_OK), {})
        self.assertEqual(r["status"], "FAIL", r)

    def test_network_error_fails(self):
        # REQ-11
        def boom(url):
            raise OSError("connection refused")

        r = cl.check_paper(PAPER_DOI, boom, json_of(CROSSREF_OK), {})
        self.assertEqual(r["status"], "FAIL", r)

    def test_title_mismatch_fails(self):
        # REQ-11
        bad = {"message": dict(CROSSREF_OK["message"], title=["Short-Term Memory Is Long"])}
        r = cl.check_paper(PAPER_DOI, page(200), json_of(bad), {})
        self.assertEqual(r["status"], "FAIL", r)
        self.assertIn("title", r["detail"])

    def test_first_author_mismatch_fails(self):
        # REQ-11
        bad = {"message": dict(CROSSREF_OK["message"], author=[{"family": "Schmidhuber"}])}
        r = cl.check_paper(PAPER_DOI, page(200), json_of(bad), {})
        self.assertEqual(r["status"], "FAIL", r)
        self.assertIn("author", r["detail"])

    def test_year_mismatch_fails(self):
        # REQ-11
        bad = {"message": dict(CROSSREF_OK["message"], issued={"date-parts": [[1999]]})}
        r = cl.check_paper(PAPER_DOI, page(200), json_of(bad), {})
        self.assertEqual(r["status"], "FAIL", r)
        self.assertIn("year", r["detail"])

    def test_publisher_403_is_manual_never_pass(self):
        # REQ-11: a refused scripted request needs a person to confirm it
        for code in (401, 403, 429):
            r = cl.check_paper(PAPER_DOI, page(code), json_of(CROSSREF_OK), {})
            self.assertEqual(r["status"], "MANUAL", (code, r))

    def test_publisher_403_with_wrong_metadata_still_fails(self):
        # REQ-11: a blocked page does not hide a metadata mismatch
        bad = {"message": dict(CROSSREF_OK["message"], title=["Something else"])}
        r = cl.check_paper(PAPER_DOI, page(403), json_of(bad), {})
        self.assertEqual(r["status"], "FAIL", r)

    def test_arxiv_record_passes_and_year_is_checked(self):
        # REQ-11
        fetch = lambda url: (200, url, ARXIV_ATOM if "export.arxiv.org" in url else "<html></html>")
        self.assertEqual(cl.check_paper(PAPER_ARXIV, fetch, no_json, {})["status"], "PASS")
        wrong_year = dict(PAPER_ARXIV, year=2016)
        self.assertEqual(cl.check_paper(wrong_year, fetch, no_json, {})["status"], "FAIL")

    def test_arxiv_abs_page_meta_tags_are_the_record(self):
        # REQ-11: added with the meta-tag source (2026-10-22), because arXiv's API throttles
        abs_page = (
            '<meta name="citation_title" content="Attention Is All You Need" />'
            '<meta name="citation_author" content="Vaswani, Ashish" />'
            '<meta name="citation_date" content="2017/06/12" />'
        )

        def fetch(url):
            if "export.arxiv.org" in url:
                raise AssertionError("API must not be called when the page has the record")
            return (200, url, abs_page)

        self.assertEqual(cl.check_paper(PAPER_ARXIV, fetch, no_json, {})["status"], "PASS")
        self.assertEqual(cl.check_paper(dict(PAPER_ARXIV, year=2018), fetch, no_json, {})["status"], "FAIL")
        other_author = dict(PAPER_ARXIV, authors=["Noam Shazeer"])
        self.assertEqual(cl.check_paper(other_author, fetch, no_json, {})["status"], "FAIL")

    def test_override_accepts_only_the_named_difference(self):
        # REQ-11: a recorded reissue year is accepted; any other difference still fails
        reissue = {"message": dict(CROSSREF_OK["message"], issued={"date-parts": [[2005]]})}
        overrides = {PAPER_DOI["url"]: {"reason": "reissue record", "record": {"year": 2005}}}
        r = cl.check_paper(PAPER_DOI, page(200), json_of(reissue), overrides)
        self.assertEqual(r["status"], "PASS", r)
        self.assertIn("reissue record", r["detail"])
        both = {"message": dict(reissue["message"], title=["Other"])}
        self.assertEqual(cl.check_paper(PAPER_DOI, page(200), json_of(both), overrides)["status"], "FAIL")

    def test_plain_page_must_name_the_paper(self):
        # REQ-11: a non-DOI, non-arXiv link passes only if the page names the paper
        paper = dict(PAPER_DOI, url="https://example.org/paper")
        named = page(200, "<h1>Long Short-Term Memory</h1>")
        self.assertEqual(cl.check_paper(paper, named, no_json, {})["status"], "PASS")
        unnamed = page(200, "<h1>Some other page</h1>")
        self.assertEqual(cl.check_paper(paper, unnamed, no_json, {})["status"], "FAIL")
        self.assertEqual(cl.check_paper(paper, page(403), no_json, {})["status"], "MANUAL")


if __name__ == "__main__":
    unittest.main()
