# moeyua-blog-clone · 复刻笔记

原站: https://blog.moeyua.com （本次复刻目标页: /about）
复刻日期: 2026-09-04
工程目录: `~/projects/website-clones/moeyua-blog-clone/`

## 源信息 / 技术栈

- 原站: Astro v5.0.2 SSG + UnoCSS (attributify) + swup 页面过渡，部署于 Vercel/Cloudflare
- 原站使用的主题是作者自研开源主题 **Typography**（MIT）→ 直接用主题源码 = 真源码级 1:1 复刻
  - 主题仓库: https://github.com/Moeyua/astro-theme-typography （MIT, ⭐623）→ `theme/`（只读基准）+ `site/`（工作副本）
- 博客内容仓库 `moeyua/moeyua.github.io` 是旧的 Hexo 站，**不是**现站源码；现站内容源未公开
- 许可:
  - 主题代码 MIT（保留署名即可改/部署，页脚自带 Theme 署名行）
  - 文章/关于页文案版权归 Moeyua 本人（内容仓库无 LICENSE，默认保留所有权利）→ **仅本地学习，未经许可不得公开部署原内容**

## 目录结构

```
moeyua-blog-clone/
├── theme/          # 主题 git clone（只读基准，MIT）
├── site/           # 工作副本（pnpm 工程，astro 5 + 主题）
│   ├── src/.config/user.ts      # 镜像原站配置（标题/副标题/社交/SEO）
│   ├── src/content/spec/about.md# 关于页内容（来自原站 /about）
│   ├── src/content/posts/       # 文章目录（当前为空，按用户要求暂不灌文章）
│   └── public/                  # 原站图标/og 图/webmanifest + 文章图（images/）
├── scripts/
│   ├── extract-content.mjs      # 从 RECON 抓取页抽取文章/about 元数据+正文
│   └── html-to-md.mjs           # 渲染 HTML → Markdown 逆转换（文章恢复时用）
└── RECON/
    ├── original/                # 原站各页 HTML 抓取 + extracted-posts.json
    ├── screenshots/             # 原站 vs 克隆 三档截图 + diff
    └── *-recon.json / visual-diff-1440.json
```

## 配置镜像（user.ts，均取自原站渲染 HTML）

- title 講評世界 / subtitle Moeyua / description そして、次の曲が始まるのです
- locale zh-cn, theme system, pageSize 5
- social: github/twitter(@moeyua13)/mastodon(moresci.sale)/rss
- seo.link/meta: apple-touch-icon、favicon-32/16、manifest、mask-icon、theme-color 等
- 页脚三行与原站一致（© 年份为构建时动态值，原站构建于 2025 故显示 2025）

## 跑起来

```bash
cd site
pnpm install --registry=https://registry.npmmirror.com   # 已装好
pnpm build && pnpm preview --port 4321   # 或 pnpm dev
```

当前预览: http://127.0.0.1:4321/ （preview 进程已在后台运行）

## 保真度

| 维度 | 分(1-5) | 证据 |
|---|---|---|
| 结构 | 5 | 同主题同版本，路由 / /archive /categories /about /posts/* 全一致，均 200 |
| 视觉(about) | 5 | visual-diff: changedPixels 25/1296000（仅页脚年份数字），score 5 |
| 视觉(带文章首页) | 4 | 标题/日期/布局一致；摘要差异已定位为内容形态问题，文章恢复时按 html-to-md 流程解决 |
| 交互 | 4 | swup 过渡/暗色模式随系统；未做交互探针全量回归 |
| 内容 | - | 按用户要求文章暂不灌入；about 页 1:1 |
| 功能 | 5 | RSS/sitemap/robots 均生成；console 0 错误 |

## 背景 v3（2026-09-05，用户供真线稿+8步时间轴）

- 线稿：用户提供的 SVG（viewBox 0 0 1456 1080，5 组：ears-hair/face/body/plane/details）内嵌组件，每 path 加 pathLength=1，stroke 用 currentColor。
- 彩色 PNG：`site/src/assets/char-color.svg` 用**同一批路径**填色重排图层 → sharp 栅格化 `bg-character.webp`(67KB)/png → 与线稿像素对齐。
- 时间轴：0s 网格纸立即 → .1s 耳发 → .35s 脸 → .6s 身臂 → 1.0s 纸飞机 → 1.5s 细节+装饰层 → 2.1s 彩色淡入 0→.14 且线稿沉 .4→.12 → 2.8s 静止。实测终态 line .12 / color .14 / decor .13。
- 播放策略/移动端/reduced-motion 同 v2。git: 25f8127 之后三提。

## 背景 v2（2026-09-05，按用户规格）

结构：CSS 网格纸（global.css）+ 透明 WebP/PNG 彩色角色（sharp 栅格化自 `site/src/assets/char-color.svg`，脚本 `site/scripts/render-char.mjs`，webp 30KB）+ 同几何 SVG 线稿逐笔勾线（stroke-dasharray/dashoffset + pathLength=1）+ 装饰 SVG（轨迹/星芒/手写句）。
节奏：头身 0.05-1.25s → 纸飞机 1.25-2.0s → 彩色淡入 0→.14（2.05-2.85s），总 <3s。
播放策略：仅 `/` 且 sessionStorage 无 `bgPlayed` 时播；文章页/二次进入直接最终态；swup 不重载背景故不重播。prefers-reduced-motion 直接最终态。
布局：body 网格改 cols-[3fr_2fr]（正文左 60%）；角色右下 min(46vw,660px)；移动端 80vw 右移 -16% 且 --char-op .08。
坑：勾线动画选择器必须落在形状元素上（`#charStage.play .seg-a :is(path,circle,ellipse)`），加在 <g> 上无效（dashoffset 不继承）。
git：重构前快照 73dad98，完成后二提。

## 右栏个人简介卡（2026-09-05）

- `site/src/components/SiteProfile.astro`：布局参考 niracler 资料卡（频道行/头像+名/简介/编号列表），风格保持 Typography。
- 最终版（用户要求）：**竖排标题移除，简介顶替其位置**（LayoutDefault header = SiteProfile + SiteNavigation），全断点显示；风格用主题原生语言（左竖线 b-l-2px primary + 衬线粗体名 + 关于页同款 emoji 列表，无框无阴影）。
- 文案/头像在组件内明文可改；头像用 /apple-touch-icon.png。桌面/移动端截图 RECON/screenshots/title-replaced*.png。

## 归档页重设计（2026-09-05，最终版）

- 用户最终要求：**保留原版列表**（年份标题 + 下划线标题 + MM-DD），**只把日期分组头换成时间线样式**（参考 niracler.com/channel 的 `MM · DD WEEK ———— n posts`），其余（卡片/侧栏/滚动进场）全部回滚。
- `site/src/pages/archive.astro`：年 → 日期组（时间线头）→ 原版 ul 列表；时间线头用主题色/衬线字体，风格统一。
- 验证：构建通过，console 0 错误；截图 RECON/screenshots/archive-v2.png。

## 特效最终状态（2026-09-05 用户最终决定）

- 动画参数与原站 1:1：入场 `fade-in-down 1s linear`（lg 下 header/footer `fade-in-left`），swup 过渡 0.5s linear，smoothScrolling true。
- **点击导航重放同款入场特效**（原站没有、用户要求加），进出场/连点中断处理参考原站实测（scripts/probe-original-behavior.cjs）：
  - 原站行为：点击只有 main 0.5s 淡出→淡入，header/footer 不动；连点时 swup 安全中断、最后一次点击生效、类最终回到 `swup-enabled`。
  - 克隆实现：`swup:transition-start` 移除 `animation-prepared`（取消重放、让原生出场淡出不被打架）；`swup:page:view` 用 remove+reflow+add 重启动画（连点也能每次重放）；`animationend` 播完清理；`__entranceAnimHooked` 防叠监听。
- 实测对比：出场序列与原站逐帧一致（H:1/F:1 不动、M 0.5s 淡出）；进场三区域同款 1s 重放；快速连点两按钮 → 无卡死类、最后点击生效、正确渲染、console 0 错误。

## 性能/丝滑优化（特效卡顿修复，已回滚、留档参考）

- 原因：① 全部动画用 `linear` 缓动，掉帧直接可见；② 导航后 swup transition 与入场重放两套 opacity 控制同作用 main，偶发互抢；③ 全局 text-shadow + 未提升合成层，弱 GPU 动画首帧光栅化卡；④ swup `smoothScrolling` 主线程 JS 滚动。
- 修复（site/src/layouts/LayoutDefault.astro + astro.config.ts）：
  - 缓动改 `cubic-bezier(0.22,1,0.36,1)` ease-out；时长按用户观感偏好调慢：入场 1.4s、过渡 0.7s（原主题 1s/0.5s）
  - 动画期间 `will-change: transform, opacity` 预提升合成层
  - `html.animation-prepared .transition-swup-main { transition: none }` 消除双控制
  - `smoothScrolling: false`
- 证据（scripts/perf-measure.cjs，rAF 采样+longtask）：首载 rAF 饿死 4.7s → 94 帧/worst 43ms；点击过渡 97 帧 0 掉帧 worst 17ms（≈60fps）

## 管理后台（Decap CMS，自托管）

- `site/public/admin/`：index.html + config.yml + 自托管 decap-cms.js（5MB，不依赖 CDN）
- 集合：posts（title/pubDate/categories/description/draft/body，与主题 schema 对齐）+ spec/about
- 默认 backend: github（repo 占位待填）；自建 GitLab 改 gitlab+base_url 最自闭环
- 服务器部署：`deploy/nginx.conf` + `deploy/auto-deploy.mjs`（webhook → git pull + build）+ `deploy/DEPLOY.md`
- 坑：astro check 会对 public 下 5MB js 做类型检查 OOM → tsconfig exclude public

## Bug 修复历史：点击导航重放入场特效（已按用户要求回滚）

- 现象：首次加载有入场特效，点击导航只有 main 的 0.5s 淡入淡出。原主题即此行为。
- 曾实现：监听 `swup:page:view` 重加 `animation-prepared` 重放入场特效，验证通过。后用户决定要原站 1:1 特效，已回滚。

## 已知缺口 / TODO

- 文章未导入（用户要求先出网站）。恢复路径: `RECON/original/extracted-posts.json` → `scripts/html-to-md.mjs`（已验证可转换；注意 typora 文图片已本地化到 /images/）
- 页脚年份=构建年（2026），与原站显示 2025 不同，属构建时间差，非缺陷
- 原站 `/favicon.svg` 线上 404，克隆保留主题自带 favicon.svg（更完整）
- Cloudflare 邮箱混淆已还原为 mailto:mail@moeyua.com
- 未公开部署；如需上线须先替换为自有内容并保留主题 MIT 署名
