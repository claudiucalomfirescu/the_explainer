"""Download, crop and credit the approved portraits (Phase 3, Task 22, REQ-12).

Inputs
  scripts/portraits_approved.json   the owner-approved list (docs/portraits-approval.md): person id,
                                    Commons file, credit line, crop box
  reports/portrait-candidates-*.json  the Commons records found by find_portraits.py: licence,
                                    licence link and file page come from here, never retyped

Stages
  fetch <raw-dir>   download each file as a Commons thumbnail (640 px wide, or the original when
                    smaller) into a new, empty folder; only JPEG or PNG bytes are kept
  build <raw-dir>   crop each image to its box, fit it to 4:5, resize to 320 x 400, save
                    public/images/people/<id>.jpg (metadata stripped), and write the portrait
                    credit into content/people.json

Usage: python3 -I scripts/fetch_portraits.py fetch reports/portraits-raw-<ts>
       python3 -I scripts/fetch_portraits.py build reports/portraits-raw-<ts>
"""
from __future__ import annotations

import json
import pathlib
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]
UA = "ai-history-timeline/1.0 (portrait download for a static history site; Python urllib)"
OUT_W, OUT_H = 320, 400


def approved():
    return json.loads((ROOT / "scripts" / "portraits_approved.json").read_text())


def candidates():
    latest = sorted((ROOT / "reports").glob("portrait-candidates-*.json"))[-1]
    return {r["id"]: r["candidate"] for r in json.loads(latest.read_text()) if r["candidate"]}


def api_thumb(filename: str) -> str:
    query = urllib.parse.urlencode({
        "action": "query", "titles": f"File:{filename}", "prop": "imageinfo",
        "iiprop": "url", "iiurlwidth": 640, "format": "json",
    })
    page = next(iter(json.loads(download(f"https://commons.wikimedia.org/w/api.php?{query}"))["query"]["pages"].values()))
    info = page["imageinfo"][0]
    return info.get("thumburl") or info["url"]


def download(url: str) -> bytes:
    for attempt in range(5):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=60) as res:
                return res.read(10_000_000)
        except urllib.error.HTTPError as err:
            if err.code not in (429, 503) or attempt == 4:
                raise
            time.sleep(float(err.headers.get("Retry-After") or 0) or 10 * (attempt + 1))
    raise RuntimeError("unreachable")


def is_image(data: bytes) -> bool:
    return data[:2] == b"\xff\xd8" or data[1:4] == b"PNG"


def fetch(raw: pathlib.Path) -> int:
    # Downloads go only into this folder. Re-running resumes: files already fetched are kept.
    raw.mkdir(parents=True, exist_ok=True)
    for a in approved():
        if (raw / f"{a['id']}.img").exists():
            continue
        url = api_thumb(a["file"])
        data = download(url)
        if not is_image(data):
            print(f"REFUSED {a['id']}: not a JPEG or PNG ({url})")
            return 1
        (raw / f"{a['id']}.img").write_bytes(data)
        print(f"fetched {a['id']:20} {len(data) // 1024:5} KB  {url}", flush=True)
        time.sleep(1.0)
    return 0


def build(raw: pathlib.Path) -> int:
    from PIL import Image, ImageOps

    records = candidates()
    people_file = ROOT / "content" / "people.json"
    people = json.loads(people_file.read_text())
    by_id = {p["id"]: p for p in people}
    out_dir = ROOT / "public" / "images" / "people"
    out_dir.mkdir(parents=True, exist_ok=True)

    for a in approved():
        rec = records[a["id"]]
        assert rec["file"] == a["file"], f"{a['id']}: approved file differs from the Commons record"
        img = ImageOps.exif_transpose(Image.open(raw / f"{a['id']}.img")).convert("RGB")
        w, h = img.size
        left, top, right, bottom = a["crop"]  # fractions of width and height
        box = [left * w, top * h, right * w, bottom * h]
        # Fit the box to 4:5 by shrinking whichever side is too long, keeping its centre.
        bw, bh = box[2] - box[0], box[3] - box[1]
        if bw / bh > OUT_W / OUT_H:
            new_w = bh * OUT_W / OUT_H
            cx = (box[0] + box[2]) / 2
            box[0], box[2] = cx - new_w / 2, cx + new_w / 2
        else:
            new_h = bw * OUT_H / OUT_W
            box[3] = box[1] + new_h  # keep the top edge: faces sit near the top
        face = img.crop(tuple(round(v) for v in box)).resize((OUT_W, OUT_H), Image.LANCZOS)
        target = out_dir / f"{a['id']}.jpg"
        face.save(target, "JPEG", quality=85, optimize=True, progressive=True)  # no EXIF carried over
        by_id[a["id"]]["portrait"] = {
            "file": f"images/people/{a['id']}.jpg",
            "author": a["author"],
            "licence": rec["licence"],
            "licenceUrl": rec["licenceUrl"].rstrip("/") + ("/" if "creativecommons.org" in rec["licenceUrl"] else ""),
            "sourceUrl": rec["sourceUrl"],
        }
        print(f"built   {a['id']:20} {target.stat().st_size // 1024:4} KB  from {w}x{h}, box {[round(v) for v in box]}")

    people_file.write_text(json.dumps(people, indent=2, ensure_ascii=False) + "\n")
    return 0


if __name__ == "__main__":
    if len(sys.argv) != 3 or sys.argv[1] not in {"fetch", "build"}:
        print(__doc__)
        sys.exit(2)
    stage, folder = sys.argv[1], ROOT / sys.argv[2]
    sys.exit(fetch(folder) if stage == "fetch" else build(folder))
