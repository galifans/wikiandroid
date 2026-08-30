import { hopeTheme } from "vuepress-theme-hope";
import navbar from "./navbar.js";
import sidebar from "./sidebar.js";

export default hopeTheme({
  // 站点域名
  hostname: "https://wikiandroid.com",

  // 作者信息
  author: {
    name: "WikiAndroid",
  },

  // 图标库（不依赖网络字体，使用内置样式）
  iconAssets: "iconify",

  // 仓库地址
  repo: "https://github.com/galifans/wikiandroid",
  docsDir: "src", // src 为站点内容源码目录；wikiStatic 存放书籍等静态资源

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
    '<a href="https://github.com/galifans/wikiandroid" target="_blank">GitHub</a> | <span>MIT License</span>',
  displayFooter: true,

  // 纯净模式：不显示首页 meta
  metaLocales: {
    editLink: "在 GitHub 上编辑此页",
  },

  // 页面信息（文章页顶部 作者/写作日期/阅读时间）
  // 仅保留 写作日期 + 阅读时间；去掉作者（站点即 WikiAndroid，每页重复）
  pageInfo: ["Date", "ReadingTime"],

  // 博客功能关闭（纯文档站）
  blog: false,

  // Markdown 扩展配置
  markdown: {
    // 代码块选项卡：::: code-tabs + @tab Java / @tab Kotlin，
    // 用于全站 Java/Kotlin 示例代码切换（默认激活第一个 tab，即 Java）
    codeTabs: true,
    tabs: true,
    // Mermaid 图表：```mermaid 围栏渲染为流程图/时序图等（依赖 mermaid 包）
    mermaid: true,
  },

  // 插件配置
  plugins: {
    // git 插件：关闭贡献者（页面底部已有 GitHub 链接，无需重复展示）
    git: {
      contributors: false,
    },
    // 本地搜索已移除（2026-08-30：slimsearch 中文检索跳转不准，用户决定去掉搜索框）
    // 代码块复制按钮
    copyCode: true,
    // 图片预览
    photoSwipe: true,
    // 阅读时间
    readingTime: true,
    // 旧路径重定向：Compose 从 /ui/compose/ 移入 /jetpack/compose/，
    // 保留旧链接可用（SEO 与站外收藏）
    redirect: {
      config: {
        "/ui/compose/": "/jetpack/compose/",
        "/ui/compose/compose-basics.html": "/jetpack/compose/compose-basics.html",
        "/ui/compose/compose-state.html": "/jetpack/compose/compose-state.html",
        "/ui/compose/compose-performance.html": "/jetpack/compose/compose-performance.html",
      },
    },
    // 版权信息
    copyright: {
      author: "WikiAndroid",
      license: "MIT",
      global: false,
    },
  },
});
