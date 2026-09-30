# Joinermill

Public page for Joinermill. Static files live at the repository root (`index.html`).

EvaOS is an internal name and is not used on this site.

## GitHub Pages

Publish from the `main` branch, root folder:

1. Open **Settings → Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch**.
3. Branch: **main**. Folder: **/ (root)**.
4. Save.

The site is served at <https://evaisawesome2025.github.io/joinermill/>.

`.nojekyll` is present so Pages serves these files as written.

## Custom domain, later

`CNAME` contains `joinermill.com`. That tells GitHub Pages which domain to attach. DNS was not changed: `joinermill.com` still points at Porkbun parking, not at GitHub.

When you intend to serve the domain, remove the parking records at Porkbun and point the apex at GitHub Pages:

| Type | Name | Value |
| --- | --- | --- |
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |

Leave `CNAME` in the repo. Do not switch DNS until you want `joinermill.com` to replace the parking page. Until then, use the `github.io` address.

## Fonts

Young Serif (The Young Serif Project Authors) and Atkinson Hyperlegible (Braille Institute of America) are under the SIL Open Font License. License texts are in `fonts/`.
