# Usage: python3 -I scripts/run_probes.py "$PWD" [probe ids...]   (restores every file it mutates)
"""Mutation probes for Phase 1: plant each defect, run the test that should catch it, restore.
A probe whose anchor is absent is BROKEN PROBE, never a verdict."""
import hashlib, shutil, subprocess, sys, json
ROOT = sys.argv[1]
P = [
 # (id, file, old, new, kind, test-args)
 ("U1 duplicate slug", "src/lib/validate.ts", "if (sameSlug) errors.push", "if (false && sameSlug) errors.push", "unit", "tests/unit/validate.test.js"),
 ("U2 later inspiration", "src/lib/validate.ts", "cited.data.order >= data.order", "cited.data.order > 999999", "unit", "tests/unit/validate.test.js"),
 ("U3 unknown person", "src/lib/validate.ts", "if (!personIds.has(p.person))", "if (false)", "unit", "tests/unit/validate.test.js"),
 ("U4 missing portrait file", "src/lib/validate.ts", "!opts.fileExists(person.portrait.file)", "false", "unit", "tests/unit/validate.test.js"),
 ("U5 empty inspirations", "src/lib/validate.ts", "data.cameFrom.length === 0 && data.order !== firstOrder", "false", "unit", "tests/unit/validate.test.js"),
 ("U6 duplicate person id", "src/lib/validate.ts", "if (personIds.has(person.id)) errors.push", "if (false) errors.push", "unit", "tests/unit/validate.test.js"),
 ("S1 idea word limit", "src/lib/schema.ts", "refine(maxWords(50)", "refine(maxWords(500)", "unit", "tests/unit/schema.test.js"),
 ("S2 idea sentence limit", "src/lib/schema.ts", "refine(sentencesBetween(1, 2)", "refine(sentencesBetween(1, 9)", "unit", "tests/unit/schema.test.js"),
 ("S3 summary sentences", "src/lib/schema.ts", "refine(sentencesBetween(2, 4)", "refine(sentencesBetween(1, 9)", "unit", "tests/unit/schema.test.js"),
 ("S4 step count", "src/lib/schema.ts", ".min(3).max(8)", ".min(1).max(99)", "unit", "tests/unit/schema.test.js"),
 ("S5 short title 40", "src/lib/schema.ts", "shortTitle: text.max(40)", "shortTitle: text.max(400)", "unit", "tests/unit/schema.test.js"),
 ("S6 person note 40 words", "src/lib/schema.ts", "maxWords(40)", "maxWords(400)", "unit", "tests/unit/schema.test.js"),
 ("C1 wrong year", "content/milestones/05-hopfield.json", '"order": 50,\n  "year": 1982,', '"order": 50,\n  "year": 1983,', "unit", "tests/unit/content.test.js"),
 ("C2 person dropped", "content/milestones/07-backpropagation.json", '"person": "ronald-williams"', '"person": "geoffrey-hinton"', "unit", "tests/unit/content.test.js"),
 ("C3 inspiration dropped", "content/milestones/07-backpropagation.json", '"milestone": "perceptrons-critique"', '"label": "perceptrons-critique"', "unit", "tests/unit/content.test.js"),
 ("C4 et al. flag dropped", "content/milestones/11-word2vec.json", '"moreAuthors": true,', '"moreAuthors": false,', "unit", "tests/unit/content.test.js"),
 ("C5 wrong era", "content/milestones/12-attention.json", '"era": "attention-transformers"', '"era": "deep-learning"', "unit", "tests/unit/content.test.js"),
 ("L1 year not compared", "scripts/check_links.py", 'elif field == "year" and ours["year"] != theirs:', 'elif field == "year" and False:', "py", "tests/unit"),
 ("L2 403 counted as pass", "scripts/check_links.py", 'if status in BLOCKED:\n        return {"status": "MANUAL", "detail": f"{note};', 'if False:\n        return {"status": "MANUAL", "detail": f"{note};', "py", "tests/unit"),
 ("L3 dead link accepted", "scripts/check_links.py", 'if status not in BLOCKED and status != 200:', 'if False:', "py", "tests/unit"),
 ("L4 override accepts anything", "scripts/check_links.py", 'if field in accepted and accepted[field] == theirs:', 'if accepted:', "py", "tests/unit"),
 ("P1 any licence accepted", "src/lib/schema.ts", 'licence: text.regex(FREE_LICENCE, "licence must be public domain, CC0, CC BY or CC BY-SA"),', "licence: text,", "unit", "tests/unit/portraits.test.js -t 'portrait credit rules'"),
 ("P2 any source accepted", "src/lib/schema.ts", '.regex(/^https:\\/\\/commons\\.wikimedia\\.org\\/wiki\\/File:/, "source must be a Wikimedia Commons file page"),', ",", "unit", "tests/unit/portraits.test.js -t 'portrait credit rules'"),
 ("P3 NC licence slips through", "src/lib/schema.ts", "const FREE_LICENCE = /^(Public domain|CC0 1\\.0|CC BY(-SA)? \\d\\.\\d( [a-z]{2})?)$/;", "const FREE_LICENCE = /^(Public domain|CC0 1\\.0|CC BY(-SA|-NC)? \\d\\.\\d( [a-z]{2})?)$/;", "unit", "tests/unit/portraits.test.js -t 'portrait credit rules'"),
 ("P4 alt text loses the name", "src/components/person.tsx", 'alt={`Portrait of ${name}`}', 'alt="Portrait"', "e2e", "tests/e2e/portraits.spec.js"),
 ("P5 credit drops the source link", "src/components/person.tsx", '<a href={portrait.sourceUrl} className="underline underline-offset-2">', '<a className="underline underline-offset-2">', "e2e", "tests/e2e/portraits.spec.js"),
 ("P6 credit shrinks below 12 px", "src/components/person.tsx", 'className="mt-1 text-xs leading-tight text-muted-foreground"', 'className="mt-1 text-[10px] leading-tight text-muted-foreground"', "e2e", "tests/e2e/portraits.spec.js"),
 ("P7 portrait path ignores the base path", "src/components/person.tsx", "src={asset(portrait.file)}", 'src={"/missing/" + portrait.file}', "e2e", "tests/e2e/portraits.spec.js"),
 ("H1 self-links in the weights", "src/lib/hopfield.ts", "if (i !== j) w[i][j] += p[i] * p[j];", "w[i][j] += p[i] * p[j];", "unit", "tests/unit/hopfield.test.js"),
 ("H2 a zero input flips the neuron", "src/lib/hopfield.ts", "input > 0 ? 1 : input < 0 ? -1 : s[i]", "input > 0 ? 1 : input < 0 ? -1 : -s[i]", "unit", "tests/unit/hopfield.test.js"),
 ("H3 recall stops after one sweep", "src/lib/hopfield.ts", "if (s.changed === 0) break;", "if (k >= 0) break;", "unit", "tests/unit/hopfield.test.js"),
 ("H4 scramble flips four, not five", "src/components/hopfield-widget.tsx", "const SCRAMBLE = 5;", "const SCRAMBLE = 4;", "e2e", "tests/e2e/visuals.spec.js"),
 ("H5 status not announced", "src/components/hopfield-widget.tsx", 'aria-live="polite"', 'aria-live="off"', "e2e", "tests/e2e/visuals.spec.js"),
 ("H6 animation loads with the page", "src/components/transformer-embed.tsx", "useState(false)", "useState(true)", "e2e", "tests/e2e/visuals.spec.js"),
 ("H7 animation on every card", "src/components/deeper.tsx", '{visual === "transformer" && <TransformerEmbed />}', "<TransformerEmbed />", "e2e", "tests/e2e/visuals.spec.js"),
 ("H8 controls squeeze beside the grid", "src/components/hopfield-widget.tsx", 'className="min-w-56 flex-1 space-y-3 [&_[aria-disabled=true]]:opacity-50"', 'className="min-w-0 flex-1 space-y-3 [&_[aria-disabled=true]]:opacity-50"', "e2e", "tests/e2e/phone.spec.js"),
 ("V1 images ignore the base path", "src/lib/paths.ts", 'return `${base}/${publicPath.replace(/^\\/+/, "")}`;', 'return `/${publicPath.replace(/^\\/+/, "")}`;', "pages", "tests/e2e/hosts.spec.js"),
 ("V2 build ignores BASE_PATH", "next.config.ts", 'const basePath = process.env.BASE_PATH ?? "";', 'const basePath = "";', "pages", "tests/e2e/hosts.spec.js"),
 ("D1 workflow without .nojekyll", ".github/workflows/pages.yml", "      - run: touch out/.nojekyll\n", "", "unit", "tests/unit/deploy.test.js"),
 ("D2 workflow with a fixed base path", ".github/workflows/pages.yml", "BASE_PATH: ${{ steps.pages.outputs.base_path }}", "BASE_PATH: /ai-history", "unit", "tests/unit/deploy.test.js"),
 ("D3 tests run after publishing", ".github/workflows/pages.yml", "      - run: pnpm test\n", "", "unit", "tests/unit/deploy.test.js"),
 ("N2 skip link goes nowhere", "src/app/template.tsx", 'id="card"', 'id="card-x"', "e2e", "tests/e2e/a11y.spec.js"),
 ("N3 widget text at 14 px", "src/components/hopfield-widget.tsx", '<p className="mt-1">\n        Click squares', '<p className="mt-1 text-sm">\n        Click squares', "e2e", "tests/e2e/phone.spec.js"),
 ("N4 no focus ring on neurons", "src/components/hopfield-widget.tsx", "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary aria-disabled:cursor-wait", "outline-none aria-disabled:cursor-wait", "e2e", "tests/e2e/a11y.spec.js"),
 ("N5 blank share image for every card", "src/app/og/[file]/route.tsx", 'const slug = file.replace(/\\.png$/, "");', "const slug = file;", "e2e", "tests/e2e/urls.spec.js"),
 ("N7 Space reloads without the base path", "src/components/timeline.tsx", "router.push(href, { scroll: false });", "window.location.assign(href);", "pages", "tests/e2e/hosts.spec.js"),
 ("N9 bonus badge dropped", "src/components/timeline.tsx", "{m.bonus && (", "{false && (", "e2e", "tests/e2e/timeline.spec.js"),
 ("N10 widget ignores reduced motion", "src/components/hopfield-widget.tsx", "const delay = reduce ? 0 : STEP_MS;", "const delay = STEP_MS;", "e2e", "tests/e2e/visuals.spec.js"),
 ("N11 home loses og:url", "src/app/page.tsx", 'description: SITE_DESCRIPTION, url: "/",', "description: SITE_DESCRIPTION,", "e2e", "tests/e2e/urls.spec.js"),
 ("N12 Recall disabled, focus lost", "src/components/hopfield-widget.tsx", "onClick={runRecall} aria-disabled={running}", "onClick={runRecall} disabled={running}", "e2e", "tests/e2e/visuals.spec.js"),
 ("N13 duplicate memory stored", "src/components/hopfield-widget.tsx", "if (memories.some((m) => m.every((v, i) => v === state[i]))) {", "if (false) {", "e2e", "tests/e2e/visuals.spec.js"),
 ("N14 og site name dropped", "src/lib/og.tsx", "export const OG_BASE = { siteName: SITE_NAME, locale: \"en_GB\" } as const;", "export const OG_BASE = {} as const;", "e2e", "tests/e2e/urls.spec.js"),
 ("E1 Space handler", "src/components/timeline.tsx", 'if (e.key === " ")', 'if (e.key === "NOPE")', "e2e", "tests/e2e/card.spec.js"),
 ("E2 aria-current", "src/components/timeline.tsx", 'aria-current={isActive ? "true" : undefined}', "aria-current={undefined}", "e2e", "tests/e2e/urls.spec.js"),
 ("E3 reduced motion", "src/app/template.tsx", "hasNavigated && !reduce", "hasNavigated", "e2e", "tests/e2e/card.spec.js"),
 ("E4 scroll card into view", "src/app/template.tsx", "if (top < 0 || top > window.innerHeight)", "if (top < -1e9)", "e2e", "tests/e2e/card.spec.js"),
 ("E8 no jump when visible", "src/app/template.tsx", "if (top < 0 || top > window.innerHeight)", "if (top > -1e9)", "e2e", "tests/e2e/card.spec.js"),
 ("E5 go deeper open by default", "src/components/deeper.tsx", "<Collapsible>", "<Collapsible defaultOpen>", "e2e", "tests/e2e/card.spec.js"),
 ("E6 strip keeps marker in view", "src/components/timeline.tsx", 'strip.scrollTo({ left, behavior: first || reduce ? "instant" : "smooth" });', "void left;", "e2e", "tests/e2e/phone.spec.js"),
 ("E7 share image tag", "src/app/[slug]/page.tsx", "type: \"article\", images: ogImageMeta(m.slug, title)", "type: \"article\"", "e2e", "tests/e2e/urls.spec.js"),
]
def sha(p): return hashlib.sha256(open(p,'rb').read()).hexdigest()
def run(cmd): return subprocess.run(cmd, cwd=ROOT, shell=True, capture_output=True, text=True)
results=[]
only = set(sys.argv[2:])
for pid,f,old,new,kind,t in P:
    if only and pid.split()[0] not in only: continue
    path=f"{ROOT}/{f}"; orig=open(path).read(); h0=sha(path)
    if orig.count(old)!=1:
        results.append((pid,"BROKEN PROBE (anchor count %d)"%orig.count(old))); print(results[-1], flush=True); continue
    try:
        open(path,'w').write(orig.replace(old,new))
        assert sha(path)!=h0
        if kind=="unit":
            r=run(f"pnpm exec vitest run {t}")
        elif kind=="pages":
            b=run("pnpm build:pages")
            if b.returncode!=0: results.append((pid,"BROKEN PROBE (build failed; mutation not testable)")); print(results[-1], flush=True); continue
            r=run(f"pnpm exec playwright test --project=pages {t}")
        elif kind=="py":
            r=run(f'python3 -I -m unittest discover -s {t} -p "test_*.py"')
        else:
            b=run("pnpm build")
            if b.returncode!=0: results.append((pid,"BROKEN PROBE (build failed; mutation not testable)")); print(results[-1], flush=True); continue
            r=run(f"pnpm exec playwright test {t}")
        results.append((pid, "CAUGHT" if r.returncode!=0 else "MISSED"))
    finally:
        open(path,'w').write(orig); assert sha(path)==h0
    print(results[-1], flush=True)
print(json.dumps(results, indent=1))
