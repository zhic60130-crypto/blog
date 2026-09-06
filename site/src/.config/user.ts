import type { UserConfig } from '~/types'

// Mirror of the live blog.moeyua.com configuration,
// derived from the site's rendered HTML (2026-09 crawl).
export const userConfig: Partial<UserConfig> = {
  site: {
    title: '講評世界',
    subtitle: 'Moeyua',
    author: 'Moeyua',
    description: 'そして、次の曲が始まるのです',
    website: 'https://blog.moeyua.com',
    pageSize: 5,
    // 社交图标按用户要求移除（需要时往这里加回 { name, href } 即可）
    socialLinks: [],
    navLinks: [
      {
        // 首页=关于内容；文章列表迁至 /blog；「关于」按用户要求换成「首页」
        name: '首页',
        href: '/',
      },
      {
        name: 'Posts',
        href: '/blog',
      },
      {
        name: '动态',
        href: '/archive',
      },
      {
        name: 'Categories',
        href: '/categories',
      },
    ],
    categoryMap: [],
    // 页脚三行按用户要求移除（MIT 主题署名建议保留在仓库 LICENSE/README 中）
    footer: [],
  },
  appearance: {
    theme: 'system',
    locale: 'zh-cn',
    // 亮色背景调成暖纸色（用户要求：纯白太刺眼），primary 等其余颜色沿用默认值
    colorsLight: {
      background: '#f9f4e6',
    },
  },
  seo: {
    twitter: '@moeyua13',
    link: [
      { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
      { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
      { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
      { rel: 'manifest', href: '/site.webmanifest' },
      { rel: 'mask-icon', href: '/safari-pinned-tab.svg' },
    ],
    meta: [
      { name: 'apple-mobile-web-app-title', content: 'Moeyua' },
      { name: 'application-name', content: 'Moeyua' },
      { name: 'msapplication-TileColor', content: '#da532c' },
      { name: 'theme-color', content: '#f9f4e6' },
    ],
  },
}
