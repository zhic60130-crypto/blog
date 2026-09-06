// Decap CMS 配置（唯一来源）：字段与 src/content schema 一一对应
//
// - 本地开发：pnpm dev + `npx decap-server`，/admin/ 免 OAuth 直接编辑本机文件
//   （useLocalBackend=true 时注入 local_backend，由 src/pages/admin.astro 按环境决定）
// - 生产：Gitea 后端。部署前填好下面三个 TODO，并在 Gitea
//   「设置 → 应用 → OAuth2 应用」创建应用，回调地址填 https://<站点域名>/admin/

const SITE_URL = 'https://kenkai.me'
const GITEA_URL = 'http://42.194.232.215:3100' // TODO: git.kenkai.me 的 DNS + 证书就绪后改成 https://git.kenkai.me
const REPO = 'blogadmin/blog'

// 分类在后台「分类」集合里新建和管理（src/content/categories/*.md），
// 文章的分类字段用 relation 控件从中选择，保证分类名一致。

export function getCmsConfig(useLocalBackend: boolean): Record<string, unknown> {
  return {
    site_url: SITE_URL,
    display_url: SITE_URL,
    locale: 'zh_Hans',

    ...(useLocalBackend ? { local_backend: true } : {}),
    backend: {
      name: 'gitea',
      repo: REPO,
      branch: 'main',
      base_url: GITEA_URL,
      // Gitea OAuth2 应用的 ClientID（PKCE 流程，无需 secret）
      app_id: '8be88d66-21f5-4151-8de2-2245b9bf7935',
    },

    media_folder: 'public/images',
    public_folder: '/images',

    collections: [
      {
        name: 'posts',
        label: '文章',
        label_singular: '文章',
        folder: 'src/content/posts',
        create: true,
        slug: '{{year}}-{{month}}-{{day}}-{{slug}}',
        fields: [
          { name: 'title', label: '标题', widget: 'string' },
          {
            name: 'pubDate',
            label: '发布日期',
            widget: 'datetime',
            format: 'YYYY-MM-DD',
            date_format: 'YYYY-MM-DD',
            time_format: false,
          },
          {
            name: 'categories',
            label: '分类',
            widget: 'list',
            field: { name: 'category', label: '分类名', widget: 'string' },
            required: false,
            hint: '点「添加」输入分类名；新分类直接填写，保存后自动生效（建议复用已有分类名）',
          },
          { name: 'description', label: '摘要', widget: 'text', required: false },
          { name: 'draft', label: '草稿', widget: 'boolean', default: false, required: false },
          { name: 'body', label: '正文', widget: 'markdown' },
        ],
      },
      {
        name: 'spec',
        label: '单页',
        label_singular: '页面',
        files: [
          {
            name: 'about',
            label: '关于页',
            file: 'src/content/spec/about.md',
            fields: [
              { name: 'title', label: '标题', widget: 'string', required: false },
              {
                name: 'pubDate',
                label: '发布日期',
                widget: 'datetime',
                format: 'YYYY-MM-DD',
                date_format: 'YYYY-MM-DD',
                time_format: false,
              },
              { name: 'body', label: '正文', widget: 'markdown' },
            ],
          },
          {
            name: 'profile',
            label: '简介卡（头像/名字/简介）',
            file: 'src/content/spec/profile.md',
            fields: [
              { name: 'name', label: '名字', widget: 'string' },
              { name: 'avatar', label: '头像（可上传新图）', widget: 'image' },
              { name: 'desc', label: '一句话简介', widget: 'text' },
              { name: 'body', label: '简介列表/正文', widget: 'markdown' },
            ],
          },
        ],
      },
    ],
  }
}
