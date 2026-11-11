"""Inline GSAP into a how-it-works visual: <dir>/src.html -> <dir>/index.html (one self-contained file).

Usage: python3 tools/how-it-works/build.py explainers/neuron/how-it-works
"""
import pathlib
import sys

PLACEHOLDER = "<script>/*GSAP*/</script>"
GSAP = pathlib.Path(__file__).with_name("gsap-3.12.5.min.js")

target = pathlib.Path(sys.argv[1])
src = (target / "src.html").read_text(encoding="utf-8")
if src.count(PLACEHOLDER) != 1:
    sys.exit(f"{target}/src.html must contain {PLACEHOLDER} exactly once")
out = src.replace(PLACEHOLDER, "<script>" + GSAP.read_text(encoding="utf-8") + "</script>")
(target / "index.html").write_text(out, encoding="utf-8")
print(f"wrote {target / 'index.html'} ({len(out) // 1024} KB)")
