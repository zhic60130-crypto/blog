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
        name: 'Posts',
        href: '/',
      },
      {
        // 导航文案改为「动态」（i18n 无此 key 时原样显示）
        name: '动态',
        href: '/archive',
      },
      {
        name: 'Categories',
        href: '/categories',
      },
      {
        name: 'About',
        href: '/about',
      },
    ],
    categoryMap: [],
    footer: [
      '© %year <a target="_blank" href="%website">%author</a>',
      'Theme <a target="_blank" href="https://github.com/Moeyua/astro-theme-typography">Typography</a> by <a target="_blank" href="https://moeyua.com">Moeyua</a>',
      'Proudly published with <a target="_blank" href="https://astro.build/">Astro</a>',
    ],
  },
  appearance: {
    theme: 'system',
    locale: 'zh-cn',
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
      { name: 'theme-color', content: '#ffffff' },
    ],
  },
}
