# Joinermill

Public website for Joinermill. Static files live at the repository root.

Joinermill discovers, validates, launches, and runs online businesses under owner supervision. Glen Hedstrom owns the company. Eva, an AI organization, operates it.

Open `index.html`.

## GitHub Pages

The site is meant to be served at <https://evaisawesome2025.github.io/joinermill/>.

Publish with **GitHub Actions**, not branch deploy.

**Settings → Pages → Build and deployment**

- Source: **GitHub Actions**
- Custom domain: leave empty for now

`.github/workflows/pages.yml` runs on every push to `main`. It asks GitHub to enable Pages, then uploads the site. The published artifact does not include `CNAME`.

Do not switch the source to **Deploy from a branch** while `joinermill.com` still points at Porkbun parking. A branch deploy reads the `CNAME` file and would send the `github.io` address to that parking page.

If a run fails with “Get Pages site failed” because Pages is not enabled, an admin has to save the source once:

1. Open <https://github.com/Evaisawesome2025/joinermill/settings/pages>.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Leave **Custom domain** empty.
4. Re-run the **Deploy GitHub Pages** workflow from the Actions tab.

## Custom domain, later

`CNAME` contains `joinermill.com`. DNS was not changed.

When the domain should serve this site, remove the Porkbun parking records and point the apex at GitHub Pages:

| Type | Name | Value |
| --- | --- | --- |
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |

Then, in Pages settings, set **Custom domain** to `joinermill.com` and save. Turn on **Enforce HTTPS** once GitHub offers it. With a GitHub Actions source, that form is what attaches the domain.

## Fonts

Fraunces and Source Sans 3 are under the SIL Open Font License. See `fonts/fraunces-OFL.txt` and `fonts/source-sans-3-OFL.txt`.
