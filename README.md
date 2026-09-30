# Joinermill

Public website for Joinermill.

Joinermill discovers, validates, launches, and runs online businesses under owner supervision. Glen Hedstrom owns the company. Eva, an AI organization, operates it.

The site is static HTML and CSS at the repository root. Open `index.html`.

## GitHub Pages

Publish from the `main` branch, folder `/` (root).

**Settings → Pages → Build and deployment**

- Source: **Deploy from a branch**
- Branch: **main**
- Folder: **/ (root)**

`CNAME` contains `joinermill.com`. Use that as the custom domain when DNS for joinermill.com is pointed at GitHub Pages. This repository does not change DNS.

Until that DNS change, the site is served at:

https://evaisawesome2025.github.io/joinermill/

### If the account only allows GitHub Actions

**Settings → Pages → Source: GitHub Actions**, then deploy the repository root with `actions/upload-pages-artifact` and `actions/deploy-pages`. Branch publishing is the intended setup. GitHub reads `CNAME` when the site is published from a branch.

## Fonts

Fraunces and Source Sans 3 are used under the SIL Open Font License. See `fonts/fraunces-OFL.txt` and `fonts/source-sans-3-OFL.txt`.
