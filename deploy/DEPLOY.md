# 自有服务器部署指南（静态站 + Decap 管理后台）

架构：Decap 后台（/admin/）编辑 → commit 到 Git 仓库 → webhook → 服务器 `git pull && pnpm build` → Nginx 即时生效。内容永远在 Git 里，服务器无数据库。

## 1. 推仓库

把 `site/` 这个工程推到你自己的 Git 仓库（GitHub / 自建 GitLab 均可）。
先改 `site/public/admin/config.yml` 里的 `backend.repo` 为你的仓库路径。

## 2. 服务器初始化

```bash
git clone <你的仓库> /srv/moeyua-blog && cd /srv/moeyua-blog
pnpm install --registry=https://registry.npmmirror.com
pnpm build
# Nginx root 指向 /srv/moeyua-blog/dist（配置见 deploy/nginx.conf）
```

## 3. 自动构建守护（webhook）

```bash
WEBHOOK_SECRET=<随机串> SITE_DIR=/srv/moeyua-blog \
  nohup node deploy/auto-deploy.mjs &          # 建议用 systemd 守护
```

GitHub 仓库 → Settings → Webhooks → Add：
- Payload URL: `https://你的域名/hook`（Nginx 反代到 127.0.0.1:9876）
- Secret: 同上 `<随机串>`（脚本也兼容直接传 x-webhook-secret 头）

Nginx 加一段：

```nginx
location = /hook {
    proxy_pass http://127.0.0.1:9876;
}
```

## 4. 使用

打开 `https://你的域名/admin/` → Login with GitHub → 写文章/改关于页 → Publish。
后台会直接 commit 到仓库分支，webhook 几秒内触发重新构建。

## 说明 / 注意

- **OAuth**：github backend 默认走 Netlify 公共 OAuth 网关（自托管站也能用）。
  若不想依赖它：自建 OAuth provider（如 `vigonotion/netlify-cms-oauth-provider`，Go 单文件），
  在 config.yml 里加 `base_url: https://你的OAuth地址`。
- **自建 GitLab**：backend 改 `name: gitlab` + `base_url: https://gitlab.你的域名`，GitLab 自己就是 OAuth 提供方，最自闭环。
- **后台保护**：/admin/ 虽需 OAuth 登录，仍建议在 Nginx 层加 IP 白名单或 Basic Auth（见 nginx.conf 注释）。
- Decap JS 已自托管在 `public/admin/decap-cms.js`（5MB），不依赖任何 CDN。
- `tsconfig.json` 已排除 `public/`，避免 astro check 对 decap-cms.js 做类型检查导致 OOM。
