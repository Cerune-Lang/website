# Cerune Docs deployment / 公開設定

Cerune Docs is a static Astro/Starlight site. This repository deploys its
`dist/` build to GitHub Pages with `.github/workflows/deploy.yml`.

- Production origin: **https://cerune.hokutaka.dev/**
- Repository: **Cerune-Lang/website**
- Hosting: **GitHub Pages**
- Publishing source: **GitHub Actions**
- Trigger: push to `main` (or manual `workflow_dispatch`)
- No deployment credentials or secrets are needed for GitHub Pages.

## 初回設定（GitHub・DNSの管理者が実施）

1. [Repository Settings → Pages](https://github.com/Cerune-Lang/website/settings/pages)
   を開く。
2. **Build and deployment → Source** を **GitHub Actions** に設定する。
3. 同じ画面の **Custom domain** に
   `cerune.hokutaka.dev` を入力して **Save** する。
   **DNSを編集する前にGitHub側を設定する。**
4. `hokutaka.dev` のDNSプロバイダーで次のレコードを作る。
   すでに `cerune` のA/AAAA/CNAMEレコードがある場合は競合を解消する。

   | Type | Name/Host | Value/Target |
   | ---- | --------- | ------------ |
   | CNAME | `cerune` | `cerune-lang.github.io` |

   `/website` は付けない。TXT検証の要求があればGitHubが案内する値を設定する。
   `tint.hokutaka.dev` やルートドメインのレコードは変更しない。
5. PRをマージした後、
   [Actions → Deploy Cerune Docs to GitHub Pages](https://github.com/Cerune-Lang/website/actions/workflows/deploy.yml)
   が成功することを確認する。もしPagesの設定前に自動実行されて失敗した場合は、
   設定後に **Run workflow** で再実行する。
6. DNSと証明書の反映後、Pages設定の **Enforce HTTPS** を有効化し、
   `https://cerune.hokutaka.dev/` と
   `https://cerune.hokutaka.dev/en/` を開いて確認する。

## 補足

- GitHub Actionsから公開する場合、リポジトリへの `CNAME` ファイルのコミットは不要。
  **Settings → Pages → Custom domain** に登録する。
- DNSが反映するまで時間がかかることがある（GitHubによると最大24時間程度）。
- サイトはルート `/` を前提にビルドされている。GitHub Pagesのデフォルト
  `/website/` URLを正式な公開URLとして使用しない。
- PR検証は既存の `.github/workflows/ci.yml` が担当する。
  `deploy.yml` は `main` のみで動作する。
- ドメイン管理者が別途GitHubのドメイン検証を設定する場合はGitHubの指示に従う。

参考: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site
