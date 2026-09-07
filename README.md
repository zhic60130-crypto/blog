# Blog

这是一个基于 Astro 的静态博客项目。站点源码位于 `site/` 目录，文章内容位于 `site/src/content/posts/`。

## 本地开发

```bash
cd site
pnpm install
pnpm dev
```

## 构建

```bash
cd site
pnpm build
```

构建产物会输出到 `site/dist/`。

## Cloudflare Pages 配置

在 Cloudflare Pages 中连接本仓库后，使用下面配置：

- Framework preset: `Astro`
- Root directory: `site`
- Build command: `pnpm build`
- Build output directory: `dist`
- Node.js version: `20`

## GitHub Pages

仓库保留了 GitHub Actions workflow：`.github/workflows/deploy.yml`。推送到 `main` 后会在 `site/` 下安装依赖、构建 Astro，并发布 `site/dist`。
