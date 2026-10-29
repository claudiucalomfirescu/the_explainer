"""Paper link and metadata checker (REQ-11).

For every paper in content/milestones/*.json:
  1. the link must resolve (HTTP 200 after redirects); 404, 5xx or a network error is FAIL;
     401/403/429 means the publisher refused a scripted request, which a person must confirm
     (MANUAL), never PASS;
  2. the paper's title, first author's family name and year must match the publisher record:
     Crossref for doi.org links, the arXiv API for arxiv.org/abs links. Any other link passes only
     if the page itself names the paper.

Known, sourced differences (a reissue's record year, a book's short title) are listed in
scripts/link_overrides.json and accept only the fields they name. Manual confirmations of
refused pages are listed in scripts/link_manual.json.

Usage: python3 -I scripts/check_links.py            # writes docs/link-check.md
Exit status: 0 all PASS or confirmed MANUAL; 1 any FAIL; 3 an unconfirmed MANUAL remains.
"""
from __future__ import annotations

import datetime
import html
import json
import pathlib
import re
import sys
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

ROOT = pathlib.Path(__file__).resolve().parents[1]
USER_AGENT = "ai-history-timeline-link-check/1.0 (static site source check)"
BLOCKED = {401, 403, 429}
ATOM = "{http://www.w3.org/2005/Atom}"


def normalize(text: str) -> str:
    text = unicodedata.normalize("NFKD", html.unescape(text))
    text = "".join(c for c in text if not unicodedata.combining(c)).casefold()
    return " ".join(re.sub(r"[^a-z0-9]+", " ", text).split())


# ---------------------------------------------------------------- real network (not used in tests)

def fetch_page(url: str):
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": "text/html,*/*"})
    try:
        with urllib.request.urlopen(req, timeout=30) as res:
            return res.status, res.geturl(), res.read(2_000_000).decode("utf-8", "replace")
    except urllib.error.HTTPError as err:
        return err.code, url, ""


_last_arxiv = [0.0]


def polite_fetch_page(url: str):
    """fetch_page, but arXiv API calls are spaced out and retried with growing gaps (3.5, 15, 45,
    90 s): arXiv's API terms ask for a 3 s gap, and it answers too-fast calls with an empty body
    or HTTP 429."""
    if "export.arxiv.org" not in url:
        return fetch_page(url)
    import time

    result = (0, url, "")
    for gap in (3.5, 15, 45, 90):
        wait = gap - (time.monotonic() - _last_arxiv[0])
        if wait > 0:
            time.sleep(wait)
        try:
            result = fetch_page(url)
        except OSError as err:  # arXiv drops connections when throttling
            result = (0, url, str(err))
        _last_arxiv[0] = time.monotonic()
        if result[0] == 200 and result[2].strip():
            return result
    return result


def fetch_json(url: str):
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=30) as res:
        return json.load(res)


# ---------------------------------------------------------------- records

def crossref_record(doi: str, fetch_json_fn):
    msg = fetch_json_fn(f"https://api.crossref.org/works/{urllib.parse.quote(doi)}")["message"]
    authors = msg.get("author") or []
    return {
        "title": (msg.get("title") or [""])[0],
        "first_author": authors[0].get("family", "") if authors else "",
        "year": (msg.get("issued", {}).get("date-parts") or [[None]])[0][0],
    }


def arxiv_record(arxiv_id: str, fetch_page_fn):
    status, _, text = fetch_page_fn(f"https://export.arxiv.org/api/query?id_list={arxiv_id}")
    if status != 200:
        raise OSError(f"arXiv API answered {status}")
    entry = ET.fromstring(text).find(f"{ATOM}entry")
    if entry is None:
        raise OSError("arXiv API returned no entry")
    first = entry.find(f"{ATOM}author/{ATOM}name").text or ""
    return {
        "title": " ".join((entry.find(f"{ATOM}title").text or "").split()),
        "first_author": first.split()[-1] if first.split() else "",
        "year": int(entry.find(f"{ATOM}published").text[:4]),
    }


def arxiv_meta_record(page_html: str):
    """The record from the citation_* meta tags of an arxiv.org/abs page (arXiv's own metadata),
    or None when the tags are missing."""
    def metas(name):
        return [html.unescape(v) for v in re.findall(rf'<meta\s+name="{name}"\s+content="([^"]*)"', page_html)]

    title, authors, date = metas("citation_title"), metas("citation_author"), metas("citation_date")
    if not (title and authors and date):
        return None
    first = authors[0].split(",")[0].strip()  # "Shazeer, Noam" -> "Shazeer"
    return {"title": title[0], "first_author": first, "year": int(date[0][:4])}


def compare(paper: dict, record: dict, override: dict | None) -> list[str]:
    """Differences between our paper entry and the record, minus those an override names."""
    accepted = (override or {}).get("record", {})
    ours = {"title": paper["title"], "first_author": paper["authors"][0], "year": paper["year"]}
    problems = []
    for field in ("title", "first_author", "year"):
        theirs = record[field]
        if field in accepted and accepted[field] == theirs:
            continue
        if field == "title" and normalize(ours["title"]) != normalize(str(theirs)):
            problems.append(f"title differs: record has {theirs!r}")
        elif field == "first_author" and normalize(str(theirs)) not in normalize(ours["first_author"]).split():
            problems.append(f"first author differs: record has {theirs!r}")
        elif field == "year" and ours["year"] != theirs:
            problems.append(f"year differs: record has {theirs}")
    return problems


# ---------------------------------------------------------------- one paper

def check_paper(paper: dict, fetch_page_fn, fetch_json_fn, overrides: dict) -> dict:
    url = paper["url"]
    override = overrides.get(url)
    try:
        status, final_url, text = fetch_page_fn(url)
    except Exception as err:  # network failure is a failed link, not a crash
        return {"status": "FAIL", "detail": f"link did not load: {err}"}
    if status not in BLOCKED and status != 200:
        return {"status": "FAIL", "detail": f"link answered HTTP {status}"}

    doi = re.match(r"^https://doi\.org/(.+)$", url)
    arxiv = re.match(r"^https://arxiv\.org/abs/([\w.]+?)(v\d+)?$", url)
    try:
        if doi:
            record, source = crossref_record(doi.group(1), fetch_json_fn), "Crossref"
        elif arxiv:
            record = arxiv_meta_record(text) if status == 200 else None
            record, source = record or arxiv_record(arxiv.group(1), fetch_page_fn), "arXiv"
        else:
            record, source = None, None
    except Exception as err:
        return {"status": "FAIL", "detail": f"record lookup failed: {err}"}

    if record is None:
        if status in BLOCKED:
            return {"status": "MANUAL", "detail": f"page refused the scripted request (HTTP {status}); no record source"}
        if normalize(paper["title"]) in normalize(re.sub(r"<[^>]+>", " ", text)):
            return {"status": "PASS", "detail": "page names the paper"}
        return {"status": "FAIL", "detail": "page does not name the paper"}

    problems = compare(paper, record, override)
    if problems:
        return {"status": "FAIL", "detail": f"{source}: " + "; ".join(problems)}
    note = f"{source} record matches" + (f" (accepted: {override['reason']})" if override else "")
    if status in BLOCKED:
        return {"status": "MANUAL", "detail": f"{note}; publisher refused the scripted request (HTTP {status})"}
    return {"status": "PASS", "detail": f"{note}; link resolves to {final_url}"}


# ---------------------------------------------------------------- whole site

def load_json(path: pathlib.Path, default):
    return json.loads(path.read_text()) if path.exists() else default


def main() -> int:
    overrides = load_json(ROOT / "scripts" / "link_overrides.json", {})
    manual = load_json(ROOT / "scripts" / "link_manual.json", {})
    rows, counts = [], {"PASS": 0, "MANUAL": 0, "FAIL": 0}
    unconfirmed = 0
    for file in sorted((ROOT / "content" / "milestones").glob("*.json")):
        m = json.loads(file.read_text())
        for paper in m["papers"]:
            result = check_paper(paper, polite_fetch_page, fetch_json, overrides)
            detail = result["detail"]
            if result["status"] == "MANUAL":
                if paper["url"] in manual:
                    detail += f". Confirmed by hand: {manual[paper['url']]}"
                else:
                    unconfirmed += 1
                    detail += ". NOT YET CONFIRMED BY HAND"
            counts[result["status"]] += 1
            rows.append((m["slug"], paper["title"], paper["url"], result["status"], detail))
            print(f"{result['status']:6} {m['slug']:22} {detail}", flush=True)

    now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
    lines = [
        "# Paper link check (REQ-11)",
        "",
        f"Generated by `scripts/check_links.py` on {now} (system clock). Do not edit by hand; re-run the script.",
        "",
        f"**Result:** {counts['PASS']} PASS, {counts['MANUAL']} MANUAL ({counts['MANUAL'] - unconfirmed} confirmed by hand), {counts['FAIL']} FAIL.",
        "",
        "PASS: the link resolves and the title, first author and year match the publisher record (Crossref or arXiv), or the page itself names the paper. "
        "MANUAL: the publisher refused the scripted request; the record still matched, and a person opened the page and confirmed it. "
        "Accepted differences are listed in `scripts/link_overrides.json` with their reason.",
        "",
        "| Milestone | Paper | Link | Result | Detail |",
        "|---|---|---|---|---|",
    ]
    for slug, title, url, status, detail in rows:
        lines.append(f"| {slug} | {title} | {url} | {status} | {detail.replace('|', '/')} |")
    (ROOT / "docs" / "link-check.md").write_text("\n".join(lines) + "\n")
    if counts["FAIL"]:
        return 1
    return 3 if unconfirmed else 0


if __name__ == "__main__":
    sys.exit(main())
