import { navbar } from "vuepress-theme-hope";

export default navbar([
  { text: "🏠 首页", link: "/" },
  { text: "🗺️ 学习路线", link: "/roadmap/" },
  {
    text: "☕ 语言基础",
    children: [
      { text: "Kotlin", link: "/language/kotlin/" },
      { text: "Java", link: "/language/java/" },
      { text: "数据结构与算法", link: "/language/algorithm/" },
    ],
  },
  {
    text: "🧱 Android 核心",
    children: [
      { text: "Activity", link: "/android/activity/" },
      { text: "Service", link: "/android/service/" },
      { text: "BroadcastReceiver", link: "/android/broadcast/" },
      { text: "ContentProvider", link: "/android/content-provider/" },
      { text: "Fragment", link: "/android/fragment/" },
      { text: "数据存储", link: "/android/storage/" },
    ],
  },
  {
    text: "🎨 UI 与渲染",
    children: [
      { text: "View 绘制流程", link: "/ui/view/" },
      { text: "事件分发机制", link: "/ui/event/" },
      { text: "自定义 View", link: "/ui/custom-view/" },
      { text: "动画机制", link: "/ui/animation/" },
      { text: "布局优化", link: "/ui/layout/" },
      { text: "Jetpack Compose", link: "/ui/compose/" },
    ],
  },
  {
    text: "🧩 Jetpack",
    children: [
      { text: "Lifecycle / ViewModel", link: "/jetpack/lifecycle-viewmodel/" },
      { text: "Room / DataStore", link: "/jetpack/room-datastore/" },
      { text: "Paging / Navigation", link: "/jetpack/paging-navigation/" },
      { text: "WorkManager / Hilt", link: "/jetpack/workmanager-hilt/" },
    ],
  },
  {
    text: "🌐 网络与异步",
    children: [
      { text: "OkHttp / Retrofit", link: "/network/http/" },
      { text: "Handler 消息机制", link: "/network/handler/" },
      { text: "协程 Flow / RxJava", link: "/network/coroutine/" },
      { text: "线程池与并发", link: "/network/thread/" },
    ],
  },
  {
    text: "🚀 进阶实战",
    children: [
      { text: "架构设计", link: "/advanced/architecture/" },
      { text: "组件化与模块化", link: "/advanced/modular/" },
      { text: "插件化与热修复", link: "/advanced/plugin/" },
      { text: "性能优化", link: "/advanced/performance/" },
      { text: "稳定性保障", link: "/advanced/stability/" },
      { text: "音视频开发", link: "/advanced/multimedia/" },
    ],
  },
  {
    text: "⚙️ 系统原理",
    children: [
      { text: "Binder 机制", link: "/system/binder/" },
      { text: "AMS / WMS", link: "/system/ams-wms/" },
      { text: "系统与应用启动流程", link: "/system/boot/" },
      { text: "APK 打包与签名", link: "/system/apk/" },
      { text: "ART / DEX / 类加载", link: "/system/art/" },
    ],
  },
  {
    text: "🛠️ 工程实践",
    children: [
      { text: "Gradle 构建", link: "/engineering/gradle/" },
      { text: "Git 与版本管理", link: "/engineering/git/" },
      { text: "CI/CD", link: "/engineering/cicd/" },
      { text: "测试体系", link: "/engineering/testing/" },
    ],
  },
  { text: "💼 面试指南", link: "/interview/" },
  { text: "🤖 实战项目", link: "/projects/" },
  {
    text: "GitHub",
    link: "https://github.com/galifans/wikiandroid",
  },
]);
