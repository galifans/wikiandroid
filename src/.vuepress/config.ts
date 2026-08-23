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

  theme,
});
