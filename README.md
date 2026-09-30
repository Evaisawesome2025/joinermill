# Joinermill

Public page for Joinermill. Static files live at the repository root (`index.html`).

EvaOS is an internal name and is not used on this site.

## GitHub Pages

The site is the repository root and is meant to be served at <https://evaisawesome2025.github.io/joinermill/>.

Pages is a repository setting. Publishing the files does not turn it on, and the credential used for this repo cannot change that setting (the Pages API returns 403). An admin needs to save it once:

1. Open <https://github.com/Evaisawesome2025/joinermill/settings/pages>.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Leave **Custom domain** empty. Do not choose **Deploy from a branch** yet.
4. Open the **Actions** tab, open the failed **Deploy GitHub Pages** run, and click **Re-run jobs**.

`.github/workflows/pages.yml` publishes the root of `main` on every push after that. `.nojekyll` is present so the files are served as written.

Branch deploy (`main` / `/ (root)`) would also publish this folder, and it would apply `CNAME` immediately. Leave that for the cutover below. `joinermill.com` still points at Porkbun parking, so attaching it now would send people to the parking page.

## Custom domain, later

`CNAME` contains `joinermill.com`. DNS was not changed.

When you intend to serve the domain, remove the Porkbun parking records and point the apex at GitHub Pages:

| Type | Name | Value |
| --- | --- | --- |
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |

Leave `CNAME` in the repo. Do not switch DNS until you want `joinermill.com` to replace the parking page. Until then, use the `github.io` address.

After those records answer on GitHub's addresses, open Pages settings, set **Custom domain** to `joinermill.com`, and save. Turn on **Enforce HTTPS** once GitHub offers it. With a GitHub Actions source, that form is what attaches the domain.

## Fonts

Young Serif (The Young Serif Project Authors) and Atkinson Hyperlegible (Braille Institute of America) are under the SIL Open Font License. License texts are in `fonts/`.
