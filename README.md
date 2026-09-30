# Joinermill

Public website for Joinermill. Glen Hedstrom owns the company. Eva, an AI organization, operates it.

## Pages on this site

- <https://joinermill.com/> — public landing, the front door. File: `index.html`.
- <https://joinermill.com/app/> — Eva’s workspace. Message Eva, local time, and the organization. Files under `app/`.

The landing does not replace the workspace. **Enter Eva** on the landing opens `/app/` on the same domain.

## GitHub Pages

The site is served at <https://joinermill.com/> with HTTPS enforced. `CNAME` must stay `joinermill.com`. Do not remove it, and do not change the Pages custom domain or DNS from this repo.

Pages publishes the `main` branch from the repository root. Files under `app/` ship with that root, so `/app/` is on the same deploy. `.github/workflows/pages.yml` stages the same files, including `app/` and `CNAME`, when that workflow runs.

## Fonts

Fraunces and Source Sans 3 are under the SIL Open Font License. See `fonts/fraunces-OFL.txt` and `fonts/source-sans-3-OFL.txt`.
