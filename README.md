# Eric Clancy — Engineering & Crafts

Personal hub site for [ecec.dev](https://ecec.dev) — a portfolio and CV-style site
showcasing projects, AI/full-stack expertise, and links to GitHub/LinkedIn. Built with
React, TypeScript, Vite, and Tailwind CSS; deployed to a DigitalOcean droplet via Docker

- Nginx.

## Stack

- Vite + React 19 + TypeScript
- Tailwind CSS v4
- ESLint (`eslint-plugin-jsx-a11y` for accessibility) + Prettier
- Docker + Nginx for production hosting, host Nginx + certbot for TLS

## Local development

```powershell
npm install
npm run dev
```

## Scripts

- `npm run dev` — local dev server
- `npm run build` — typecheck + production build
- `npm run lint` — ESLint
- `npm run format` / `npm run format:check` — Prettier

## Content

Project and profile data live in `src/data/projects.ts` and `src/data/linkedin.ts`.
LinkedIn content is curated by hand (never scraped — see `.github/agents/content-updater.agent.md`).
`scripts/fetch-project-data.mjs` prints the current README/overview text of each source
project for comparison when refreshing content.

## Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for droplet provisioning and the CI/CD
deploy flow.

## Custom agents

`.github/agents/` contains agent definitions for content updates, design/accessibility
review, deployment, and SEO audits.
