// Decap CMS 配置：本地开发与线上生产均为「代理模式」——认证统一由 nginx Basic Auth
// （账号密码）承担，CMS 本身不再走 OAuth。
// - 本地开发：pnpm dev + `npx decap-server`（编辑本机文件）
// - 线上生产：/admin/ 与 /cms-proxy/ 均有 nginx Basic Auth 保护，
//   /cms-proxy/ 反代到服务器本机 decap-server(127.0.0.1:8081)，直接编辑 ~/blog/site
// 改动由 auto-publish 服务自动提交并构建上线。

export function getCmsConfig(useLocalBackend: boolean): Record<string, unknown> {
  return {
    // 本地开发注入 local_backend（decap-server 代理）；生产不注入
    local_backend: useLocalBackend ? true : undefined,
    backend: useLocalBackend
      ? { name: 'gitea', repo: 'blogadmin/blog' } // 本地代理模式下 backend 不参与请求，占位即可
      : { name: 'proxy', proxy_url: '/api/v1' },
    media_folder: 'public/images',
    public_folder: '/images',
    locale: 'zh_Hans',
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
