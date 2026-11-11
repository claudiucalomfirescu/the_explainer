# Deploying the site (REQ-18)

The site is a folder of static files, so it runs on any static host. This guide puts it on two
free hosts, GitHub Pages and Vercel, and compares them. Every step here is yours to run: they
create accounts, a public repository and public pages.

Before you start, the project folder holds everything needed:
`.github/workflows/pages.yml` (GitHub Pages) and the Next.js project itself (Vercel needs no
extra file).

## 1. Create the GitHub repository

1. Commit the work in this folder if you have not (the project is its own git repository, on
   `main`).
2. On GitHub, create a new **public** repository named `ai-history-timeline`, with no README,
   licence or `.gitignore` (the project has its own).
3. Connect and push. In the Claude Code desktop app, ask for it ("add the remote and push"), or
   use GitHub Desktop (File → Add local repository → this folder → Publish repository, name
   `ai-history-timeline`, untick "Keep this code private").

The name matters: GitHub Pages serves a project repository at
`https://<your-user>.github.io/ai-history-timeline/`. The workflow reads that path from GitHub,
so another name also works.

## 2. Turn on GitHub Pages

1. In the repository: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Open **Actions**; the "Deploy to GitHub Pages" run starts on every push to `main` (or run it
   by hand with **Run workflow**). It installs, runs the unit tests, builds with the base path
   and site address GitHub reports, and publishes.
3. When it is green, the deploy step shows the address. Open it and click through a few cards.

What the workflow sets for you: `BASE_PATH` (for example `/ai-history-timeline`) and
`NEXT_PUBLIC_SITE_URL` (for example `https://<your-user>.github.io/ai-history-timeline`), which
share previews use.

## 3. Connect Vercel

1. Sign in at vercel.com with your GitHub account (the free Hobby plan covers personal,
   non-commercial use).
2. **Add New → Project →** import `ai-history-timeline`. Vercel detects Next.js; keep the
   defaults. Do not set `BASE_PATH`: Vercel serves the site at the domain root.
3. Deploy. Every push to `main` deploys again; pull requests get preview addresses.

Share previews use the production domain Vercel provides at build time, so
`NEXT_PUBLIC_SITE_URL` is only needed if you add your own domain (step 5).

## 4. Compare the two hosts

| Check | How | GitHub Pages | Vercel |
|---|---|---|---|
| Address | as deployed | `…github.io/ai-history-timeline/` | `ai-history-timeline….vercel.app` |
| First load on a phone | open `/` on your phone over mobile data | | |
| Speed score | PageSpeed Insights (pagespeed.web.dev), mobile, on `/` and `/hopfield/` | | |
| LinkedIn preview | LinkedIn Post Inspector (linkedin.com/post-inspector) on `/hopfield/` | | |
| X preview | paste `/hopfield/` into a draft post and check the card | | |
| Deploy time | from push to live, in the Actions tab or the Vercel dashboard | | |
| Limits | GitHub Pages: 1 GB site, about 100 GB a month bandwidth (soft). Vercel Hobby: about 100 GB a month transfer, non-commercial use only | | |

Pick one to share publicly, so links do not split between two addresses.

## 5. Custom domain (optional)

A domain costs about 10 to 15 US dollars a year.

- **GitHub Pages:** Settings → Pages → Custom domain, then the DNS records GitHub lists. The
  workflow picks up the new address and an empty base path automatically on the next run.
- **Vercel:** Project → Settings → Domains, then the DNS records Vercel lists. Add an environment
  variable `NEXT_PUBLIC_SITE_URL` = `https://<your-domain>` and redeploy, so share previews use
  the new domain.

## Checks already run locally

`pnpm test:hosts` builds both variants and crawls every page of each: the root build (as Vercel
serves it) and the Pages build served under `/ai-history-timeline/`. Every page, image, share
image and the animation must load with no error response.
