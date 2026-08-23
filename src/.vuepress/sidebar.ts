import { sidebar } from "vuepress-theme-hope";

export default sidebar({
  // 各模块侧边栏按目录结构自动生成
  "/roadmap/": "structure",
  "/language/": "structure",
  "/android/": "structure",
  "/ui/": "structure",
  "/jetpack/": "structure",
  "/network/": "structure",
  "/advanced/": "structure",
  "/system/": "structure",
  "/engineering/": "structure",
  "/interview/": "structure",
  "/projects/": "structure",
  "/about/": "structure",
  // 首页无侧边栏
  "/": false,
});
