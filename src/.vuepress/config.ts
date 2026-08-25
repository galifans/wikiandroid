import { defineUserConfig } from "vuepress";
import { viteBundler } from "@vuepress/bundler-vite";
import theme from "./theme.js";

export default defineUserConfig({
  base: "/",

  // 使用 Vite 打包器（更快、现代）
  bundler: viteBundler(),

  lang: "zh-CN",
  title: "WikiAndroid",
  description: "面向 Android 开发者与求职者的系统化知识库，覆盖 Kotlin、Jetpack、源码原理、性能优化与高频面试题",

  // 站点图标（favicon）与元信息
  head: [
    ["link", { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
    [
      "link",
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/favicon-32.png",
      },
    ],
    [
      "link",
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png",
      },
    ],
    ["meta", { name: "theme-color", content: "#16A34A" }],
    // Google 官方文档同款字体：Roboto（英文/数字）+ Noto Sans SC（思源黑体，中文）
    // Google Sans 为 Google 私有字体不可公开加载，官方中文文档实际回退到 Noto Sans 家族
    [
      "link",
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
    ],
    [
      "link",
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossorigin: "",
      },
    ],
    [
      "link",
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600;700&family=Roboto:wght@400;500;600;700&display=swap",
      },
    ],
  ],

  theme,
});
