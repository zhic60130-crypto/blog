# 后台管理使用指南（Decap CMS）

## 一、本地管理（现在就能用）

1. 起代理服务（已在本会话后台运行；重启机器后重跑）：
   ```bash
   cd site
   npx decap-server        # 监听 127.0.0.1:8081，读写本机文件
   ```
2. 打开后台：http://127.0.0.1:4321/admin/ → 点 **Login**（local_backend 模式，免 OAuth）
3. 能管什么：
   - **文章**：新建/编辑/删除 `src/content/posts/*.md`，Markdown 所见即所得
   - **单页 → 简介卡**：名字 / 头像（可直接**上传新图**到 `public/images`）/ 一句话简介 / 简介列表
   - **单页 → 关于页**：关于页正文
   - **Media**：媒体库上传管理
4. 点 **Publish / Save** 后改动直接写进磁盘文件
5. ⚠️ 静态站特性：保存后需重新构建才上线
   ```bash
   cd site && pnpm build      # 本地预览刷新即可看到
   ```

## 二、换头像/名字/简介的两种方式

- **后台**：单页 → 简介卡 → 改字段/传图 → Publish → `pnpm build`
- **直接改文件**：`site/src/content/spec/profile.md`
  ```md
  ---
  name: 你的名字
  avatar: /images/xxx.png
  desc: 一句话简介
  ---
  - 💻 列表项随便写
  ```

## 三、上线后（服务器/GitHub 模式）

1. `site/public/admin/config.yml` 把 `backend.repo` 改成你的仓库
2. 按 `deploy/DEPLOY.md` 部署 + webhook 自动构建
3. 后台 Publish = commit 到仓库 → webhook 自动 build，全程不用碰服务器
   （local_backend 那行上线后可留可删：留着且没跑 decap-server 时后台自动走 git backend）

## 截图

- `RECON/screenshots/admin-local.png` 内容列表
- `RECON/screenshots/admin-profile.png` 简介卡编辑表单
