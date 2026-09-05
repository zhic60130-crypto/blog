# 安全检测报告 · moeyua-blog-clone

检测日期: 2026-09-05
方法: 产物泄露扫描 + 密钥残留 grep + `pnpm audit`（全量/生产）+ GitHub Advisory 查询 + 部署脚本代码审计 + webhook 验签实测

## 总体结论

**线上暴露面极小**：产物是纯静态 HTML/JS/CSS，无数据库、无服务端渲染、无第三方分析脚本。
142 条依赖告警中，**绝大多数只存在于构建期**（输入为自撰内容，不构成线上风险）。
真正需要处理的都在部署层，已修复/已给配置，见下。

## 一、本工程代码问题（已修复）

| # | 问题 | 严重度 | 状态 |
|---|---|---|---|
| 1 | auto-deploy.mjs 默认密钥 `change-me`、`!==` 非常量时间比较、把 GitHub HMAC 头当原始令牌比对（等于没验签） | 高 | ✅ 已修复：强制 ≥32 位密钥否则拒启动；`timingSafeEqual`；真 HMAC-SHA256 验签（兼容 GitLab token / 原始令牌）；1MB body 上限。**已实测**：无签 403 / 错签 403 / 正确 200 |
| 2 | nginx 示例仅 HTTP、无安全头、/admin 默认公开 | 中 | ✅ 配置已加固：HTTPS 重定向模板、安全头（nosniff/DENY/Referrer-Policy/CSP）、/admin IP 白名单或 Basic Auth 模板。**需在服务器上启用** |

## 二、第三方告警（按"是否影响线上"分级）

### 影响线上但风险可控
| 包 | 告警 | 判定 |
|---|---|---|
| decap-cms ≤3.8.3 | GHSA-xp8g-32qh-mv28 中危，后台预览窗存储型 XSS，**官方尚无补丁** | 前提：攻击者需持有低权限作者账号。本站单用户（仅你自己能 OAuth 登录）→ 风险极低。缓解：Nginx 对 /admin 做 IP 白名单；关注官方补丁后更新 `public/admin/decap-cms.js` |
| @astrojs/rss | 中危，RSS 字段 XML 注入 | 内容自撰 → 低；随 astro 升级解决 |
| rollup | 高危，打包产物 DOM Clobbering | 前提：攻击者能往文章注入恶意 HTML（与上条同源）→ 单用户不成立 |
| katex | 中危，\htmlData 属性名未校验 | 配置中 `latex.katex: false` 未启用 + 内容自撰 → 不影响 |

### 仅构建期 / 不影响线上（信息项）
fast-xml-parser（critical，sitemap 构建期解析自产数据）、sharp/libvips、svgo、vite、braces、micromatch、minimatch、lodash、browserslist、serialize-javascript、devalue、h3、path-to-regexp、astro low×2（X-Forwarded-Host 反射仅影响 SSR/dev；transition:* XSS 本站未用该模式）等。
→ 均不进入线上产物或线上不可达。供应链风险为 npm 生态固有风险，靠 **lockfile 锁定 + 定期 `pnpm update`** 管控。

## 三、产物卫生（已检查，干净）

- dist 无 source map / .env / 私钥 / 隐藏文件 ✅
- 源码无密钥/token 残留 ✅（webhook 密钥只从环境变量读取）
- 无 Google Analytics / 追踪脚本 ✅
- 构建脚本仅 esbuild/sharp 等必要原生包 ✅

## 四、上线前你要做的（按优先级）

1. `certbot` 上 HTTPS（nginx.conf 模板已备好）
2. 启用 `/admin/` 的 IP 白名单或 Basic Auth
3. `WEBHOOK_SECRET=$(openssl rand -hex 32)`，勿用弱口令
4. `admin/config.yml` 的 `repo` 改成你的真实仓库
5. 之后每季度：`pnpm audit` + 关注 decap-cms 补丁（替换 public/admin/decap-cms.js 即可）

## 五、非技术提醒

- about 页邮箱为明文 mailto（原站用 Cloudflare 混淆，复刻时还原）——有被爬虫收集垃圾邮件的风险，知悉即可
- 原站文章/文案版权归 Moeyua，公开部署前请替换为自有内容
