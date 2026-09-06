// Decap CMS 配置（唯一来源）：字段与 src/content schema 一一对应
//
// - 本地开发：pnpm dev + `npx decap-server`，/admin/ 免 OAuth 直接编辑本机文件
//   （useLocalBackend=true 时注入 local_backend，由 src/pages/admin.astro 按环境决定）
// - 生产：Gitea 后端。部署前填好下面三个 TODO，并在 Gitea
//   「设置 → 应用 → OAuth2 应用」创建应用，回调地址填 https://<站点域名>/admin/

const SITE_URL = 'https://blog.example.com' // TODO: 部署时改成你的域名
const GITEA_URL = 'https://git.example.com' // TODO: 你的 Gitea 地址
const REPO = 'your-gitea-name/your-blog-repo' // TODO: 你的仓库（用户名/仓库名）

// 分类预设：后台下拉多选，避免分类名漂移；新增分类时往这里加
const CATEGORY_OPTIONS = ['随便写点', '技术文档', '读书摘录', '测试分类']

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
      app_id: 'TODO-填Gitea-OAuth-App-ClientID',
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
            widget: 'select',
            multiple: true,
            required: false,
            options: CATEGORY_OPTIONS,
            hint: `预设：${CATEGORY_OPTIONS.join(' / ')}；需要新分类时在 src/lib/cmsConfig.ts 的 CATEGORY_OPTIONS 里加`,
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
