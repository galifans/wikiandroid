import { hopeTheme } from "vuepress-theme-hope";
import navbar from "./navbar.js";
import sidebar from "./sidebar.js";

export default hopeTheme({
  // 站点域名
  hostname: "https://wikiandroid.pages.dev",

  // 作者信息
  author: {
    name: "AndroidStuff",
  },

  // 图标库（不依赖网络字体，使用内置样式）
  iconAssets: "iconify",

  // 仓库地址
  repo: "https://github.com/galifans/wikiandroid",
  docsDir: "src",

  // 深色模式切换
  darkmode: "toggle",

  // 全屏按钮
  fullscreen: true,

  // 导航栏
  navbar,

  // 侧边栏（按目录结构自动生成）
  sidebar,

  // 页脚
  footer:
    '<a href="https://github.com/galifans/wikiandroid" target="_blank">GitHub</a> | <span>MIT License</span> | <span>Powered by VuePress Theme Hope</span>',
  displayFooter: true,

  // 纯净模式：不显示首页 meta
  metaLocales: {
    editLink: "在 GitHub 上编辑此页",
  },

  // 博客功能关闭（纯文档站）
  blog: false,

  // 插件配置
  plugins: {
    // 本地搜索（slimsearch）
    slimsearch: true,
    // 代码块复制按钮
    copyCode: true,
    // 图片预览
    photoSwipe: true,
    // 阅读时间
    readingTime: true,
    // 版权信息
    copyright: {
      author: "AndroidStuff",
      license: "MIT",
      global: false,
    },
  },
});
