"""Find freely licensed portrait candidates for every person in content/people.json (REQ-12).

Nothing is downloaded here. For each person the script:
  1. searches Wikidata for the person and keeps the first result whose description names a
     research field (so "Tom Brown" the footballer is skipped), recording the item id and
     description so a person can confirm the match;
  2. takes that item's image (property P18), the portrait Wikidata editors chose;
  3. reads the file's licence, author, size and description from the Commons API;
  4. falls back to a Commons file search when there is no P18 image, marked "verify identity".

Output, for the owner's approval before any download:
  reports/portrait-candidates-<timestamp>.json   machine-readable, input to the download step
  reports/portrait-candidates-<timestamp>.html   contact sheet with Commons-hosted thumbnails

Usage: python3 -I scripts/find_portraits.py
"""
from __future__ import annotations

import datetime
import html
import json
import pathlib
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]
UA = "ai-history-timeline/1.0 (portrait credit lookup for a static history site; Python urllib)"
FIELDS = re.compile(
    r"scien|research|engineer|psycholog|mathemat|physic|neuro|logic|professor|academic|statistic|"
    r"machine learning|artificial intelligence|\bAI\b|inventor|biolog|entrepreneur",
    re.I,
)
FREE = re.compile(r"^(Public domain|CC0 1\.0|CC BY(-SA)? \d\.\d( [a-z]{2})?)$")


def get(url: str, params: dict) -> dict:
    """GET JSON, one request per second, backing off on 429/503 (honouring Retry-After)."""
    query = urllib.parse.urlencode({**params, "format": "json"})
    req = urllib.request.Request(f"{url}?{query}", headers={"User-Agent": UA})
    for attempt in range(6):
        try:
            with urllib.request.urlopen(req, timeout=30) as res:
                data = json.load(res)
            time.sleep(1.0)
            return data
        except urllib.error.HTTPError as err:
            if err.code not in (429, 503) or attempt == 5:
                raise
            time.sleep(float(err.headers.get("Retry-After") or 0) or 10 * (attempt + 1))
    raise RuntimeError("unreachable")


def strip_tags(text: str) -> str:
    return " ".join(html.unescape(re.sub(r"<[^>]+>", " ", text or "")).split())


def normalise_licence(short: str) -> str:
    """Commons short names to the site's licence names ("CC0" -> "CC0 1.0", "PD" variants -> "Public domain")."""
    s = (short or "").strip()
    if s.upper() in {"CC0", "CC0 1.0", "CC-ZERO"}:
        return "CC0 1.0"
    if s.lower().startswith("public domain") or s.upper().startswith("PD"):
        return "Public domain"
    return s


def wikidata_person(name: str):
    hits = get("https://www.wikidata.org/w/api.php", {
        "action": "wbsearchentities", "search": name, "language": "en", "type": "item", "limit": 10,
    }).get("search", [])
    for hit in hits:
        if FIELDS.search(hit.get("description", "")):
            return hit["id"], hit.get("description", "")
    return None, (hits[0].get("description", "") if hits else "no Wikidata result")


def p18_file(qid: str):
    claims = get("https://www.wikidata.org/w/api.php", {
        "action": "wbgetclaims", "entity": qid, "property": "P18",
    }).get("claims", {}).get("P18", [])
    for c in claims:
        value = c.get("mainsnak", {}).get("datavalue", {}).get("value")
        if value:
            return value
    return None


def commons_info(filename: str):
    pages = get("https://commons.wikimedia.org/w/api.php", {
        "action": "query", "titles": f"File:{filename}", "prop": "imageinfo",
        "iiprop": "url|size|mime|extmetadata", "iiurlwidth": 240,
    }).get("query", {}).get("pages", {})
    if not pages:
        return None
    info = next(iter(pages.values())).get("imageinfo", [None])[0]
    if not info:
        return None
    meta = info.get("extmetadata", {})
    val = lambda k: meta.get(k, {}).get("value", "")
    licence = normalise_licence(val("LicenseShortName"))
    return {
        "file": filename,
        "sourceUrl": "https://commons.wikimedia.org/wiki/File:" + urllib.parse.quote(filename.replace(" ", "_")),
        "originalUrl": info.get("url"),
        "thumbUrl": info.get("thumburl"),
        "width": info.get("width"),
        "height": info.get("height"),
        "mime": info.get("mime"),
        "author": strip_tags(val("Artist")) or strip_tags(val("Credit")),
        "licence": licence,
        "licenceUrl": val("LicenseUrl") or ("https://commons.wikimedia.org/wiki/Commons:Licensing#Material_in_the_public_domain" if licence == "Public domain" else ""),
        "licenceIsFree": bool(FREE.match(licence)),
        "description": strip_tags(val("ImageDescription"))[:200],
        "date": strip_tags(val("DateTimeOriginal"))[:40],
        "restrictions": strip_tags(val("Restrictions")),
    }


def commons_search(name: str):
    """Commons files for the name, keeping only titles that contain the surname: a bare search
    for "Donald Hebb" returned a photo of Donald Rumsfeld (seen 2026-10-22)."""
    hits = get("https://commons.wikimedia.org/w/api.php", {
        "action": "query", "list": "search", "srnamespace": 6, "srlimit": 10,
        "srsearch": f'"{name}" filetype:bitmap',
    }).get("query", {}).get("search", [])
    # Every part of the name must be in the title ("Ronald Williams" matched "Fred Williams" when
    # only the surname was required), ignoring initials such as the "I." in Michael I. Jordan.
    parts = [p.casefold() for p in name.replace(".", " ").split() if len(p) > 1]
    titles = [h["title"].removeprefix("File:") for h in hits]
    return [t for t in titles if all(p in t.casefold() for p in parts)]


def enwiki_free_image(qid: str):
    """The free lead image of the person's English Wikipedia article, found through the Wikidata
    item's own sitelink, so the identity is the article's."""
    entity = get("https://www.wikidata.org/w/api.php", {
        "action": "wbgetentities", "ids": qid, "props": "sitelinks", "sitefilter": "enwiki",
    }).get("entities", {}).get(qid, {})
    title = entity.get("sitelinks", {}).get("enwiki", {}).get("title")
    if not title:
        return None
    pages = get("https://en.wikipedia.org/w/api.php", {
        "action": "query", "titles": title, "prop": "pageimages", "piprop": "name", "pilicense": "free",
    }).get("query", {}).get("pages", {})
    return next(iter(pages.values()), {}).get("pageimage")


def is_photo_of(filename: str, name: str) -> bool:
    """A lead image counts only if it is a photo whose file name carries the surname: Donald Hebb's
    article leads with a diagram of brain lobes (seen 2026-10-22)."""
    surname = name.split()[-1].casefold()
    return filename.lower().endswith((".jpg", ".jpeg", ".png")) and surname in filename.casefold()


def main() -> int:
    people = json.loads((ROOT / "content" / "people.json").read_text())
    results = []
    for person in people:
        qid, desc = wikidata_person(person["name"])
        entry = {"id": person["id"], "name": person["name"], "wikidata": qid, "wikidataDescription": desc,
                 "how": None, "candidate": None, "alternatives": []}
        filename = p18_file(qid) if qid else None
        lead = None if filename or not qid else enwiki_free_image(qid)
        if filename:
            entry["how"] = "Wikidata image (P18)"
            entry["candidate"] = commons_info(filename)
        elif lead and is_photo_of(lead, person["name"]) and commons_info(lead):
            entry["how"] = "Wikipedia article image"
            entry["candidate"] = commons_info(lead)
        else:
            # A search hit must also describe a researcher: "Tom Brown" found a film actor.
            infos = [i for i in (commons_info(f) for f in commons_search(person["name"])[:4]) if i]
            infos = [i for i in infos if FIELDS.search(i["description"] + " " + i["file"])]
            files = [i["file"] for i in infos]
            if files:
                entry["how"] = "Commons search: verify identity"
                entry["candidate"] = commons_info(files[0])
                entry["alternatives"] = files[1:4]
            else:
                entry["how"] = "nothing found"
        c = entry["candidate"]
        print(f"{person['id']:22} {entry['how'] or '':32} {(c or {}).get('licence', '-'):18} {(c or {}).get('file', '-')}", flush=True)
        results.append(entry)

    stamp = datetime.datetime.now().strftime("%Y%m%d%H%M")
    out = ROOT / "reports"
    out.mkdir(exist_ok=True)
    (out / f"portrait-candidates-{stamp}.json").write_text(json.dumps(results, indent=2, ensure_ascii=False) + "\n")
    (out / f"portrait-candidates-{stamp}.html").write_text(contact_sheet(results, stamp))
    print(f"wrote reports/portrait-candidates-{stamp}.json and .html")
    return 0


def contact_sheet(results: list, stamp: str) -> str:
    cards = []
    for r in results:
        c = r["candidate"]
        flag = ""
        if not c:
            flag = "<p class='warn'>No candidate: placeholder with initials</p>"
        elif not c["licenceIsFree"]:
            flag = f"<p class='warn'>Licence not on the free list: {html.escape(c['licence'])}</p>"
        elif r["how"].startswith("Commons search"):
            flag = "<p class='warn'>Found by search: check it is the right person</p>"
        img = f"<img src='{html.escape(c['thumbUrl'] or '')}' alt='Candidate portrait of {html.escape(r['name'])}'>" if c else "<div class='none'>none</div>"
        detail = "" if not c else (
            f"<p><a href='{html.escape(c['sourceUrl'])}'>{html.escape(c['file'])}</a></p>"
            f"<p>{html.escape(c['author'] or 'author not given')} · {html.escape(c['licence'] or 'no licence')}</p>"
            f"<p class='small'>{c['width']}×{c['height']} · {html.escape(c['date'])}</p>"
            + (f"<p class='warn'>Restrictions: {html.escape(c['restrictions'])}</p>" if c["restrictions"] else "")
        )
        cards.append(
            f"<article><h2>{html.escape(r['name'])}</h2><p class='small'>Wikidata {html.escape(r['wikidata'] or '-')}: "
            f"{html.escape(r['wikidataDescription'])}</p>{img}{detail}{flag}</article>"
        )
    return f"""<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Portrait candidates {stamp}</title>
<style>body{{font:15px/1.4 system-ui,sans-serif;margin:24px;background:#f7f4ee;color:#1d1b18}}
main{{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:16px}}
article{{background:#fff;border:1px solid #ddd6c8;border-radius:8px;padding:12px}}
h2{{font-size:16px;margin:0 0 4px}} img{{width:100%;height:260px;object-fit:cover;object-position:top;border-radius:4px}}
.none{{height:260px;display:grid;place-items:center;background:#efebe3;color:#5c574e}}
.small{{font-size:12px;color:#5c574e}} .warn{{color:#a4361e;font-weight:600}} p{{margin:4px 0}}</style></head>
<body><h1>Portrait candidates for approval ({stamp})</h1><p>Thumbnails load from Wikimedia Commons; nothing has been downloaded.</p>
<main>{''.join(cards)}</main></body></html>
"""


if __name__ == "__main__":
    sys.exit(main())
