---
home: true
icon: home
title: 主页
heroText: WikiAndroid
tagline: 面向 Android 开发者与求职者的系统化知识库，覆盖 Kotlin、Jetpack、源码原理、性能优化与高频面试题
actions:
  - text: 🚀 开始阅读
    link: /roadmap/
    type: primary
  - text: 💻 GitHub
    link: https://github.com/galifans/wikiandroid
    type: default
features:
  - title: 🗺️ 学习路线
    icon: map
    details: Android / Kotlin / Jetpack Compose 系统学习路线，从入门到进阶一步到位
    link: /roadmap/
  - title: ☕ 语言基础
    icon: coffee
    details: Kotlin 语法、泛型、扩展函数、协程；Java 基础回顾；数据结构与算法
    link: /language/kotlin/
  - title: 🧱 Android 核心
    icon: android
    details: 四大组件、Fragment、Intent、Binder 通信、数据存储，夯实应用层地基
    link: /android/activity/
  - title: 🎨 UI 与渲染
    icon: palette
    details: View 绘制流程、事件分发、自定义 View、动画机制与布局优化
    link: /ui/view/
  - title: 🧩 Jetpack 全家桶
    icon: boxes
    details: Jetpack Compose、Lifecycle、ViewModel、Room、DataStore、Paging、Navigation、WorkManager、Hilt
    link: /jetpack/compose/
  - title: 🌐 网络与异步
    icon: globe
    details: OkHttp、Retrofit、Handler 消息机制、协程 Flow、线程池与并发编程
    link: /network/http/
  - title: 🚀 进阶实战
    icon: rocket
    details: 架构设计、组件化、插件化、性能优化、稳定性保障与音视频开发
    link: /advanced/architecture/
  - title: ⚙️ 系统原理
    icon: gears
    details: Binder、AMS/WMS、系统启动流程、APK 打包签名、ART/DEX 类加载
    link: /system/binder/
  - title: 🛠️ 工程实践
    icon: tools
    details: Gradle 构建、Git 工作流、CI/CD、单元测试与 UI 测试体系
    link: /engineering/gradle/
  - title: 💼 面试指南
    icon: briefcase
    details: 高频面试题汇总（基础/进阶/源码）、面试准备计划与简历建议
    link: /interview/
  - title: 🤖 实战项目
    icon: robot
    details: 从零搭建完整 App 的实战拆解与优质开源项目推荐
    link: /projects/
  - title: 📚 书籍资源
    icon: book
    details: 精选 Android、Java、算法、网络、数据库等方向的 PDF 书籍，点击即可下载
    link: /books/
  - title: 📖 读书笔记
    icon: feather
    details: 《Android 开发艺术探索》《Java 编程思想》《深入理解 Java 虚拟机》等经典书籍读书笔记
    link: /reading-notes/
  - title: 📎 关于本站
    icon: info
    details: 项目介绍、贡献指南与常见问题
    link: /about/
---

## 📊 内容规模

> **9 大知识模块 · 200+ 篇原创文章**，覆盖 Android 面试全考点（应用层 → 源码 → 性能 → 工程化）；
> 另有 **11 篇经典书籍读书笔记**、**7 本可下载 PDF 书籍**与 **6 篇大厂面经**。

## 📌 精选文章

### 🗺️ 学习路线
- [Android 学习路线（2026 最新版）](/roadmap/android-roadmap.md)
- [Kotlin 学习路线](/roadmap/kotlin-roadmap.md)
- [Jetpack Compose 学习路线](/roadmap/compose-roadmap.md)

### ☕ 语言基础：Kotlin / Java / JVM / 并发
- [Kotlin 基础语法详解](/language/kotlin/kotlin-basics.md)
- [Kotlin 协程从入门到进阶](/language/kotlin/kotlin-coroutines.md)
- [Kotlin 泛型详解](/language/kotlin/kotlin-generics.md)
- [Kotlin 扩展函数](/language/kotlin/kotlin-extensions.md)
- [面向 Android 的 Java 核心回顾](/language/java/java-basics.md)
- [Java 集合框架（HashMap / ArrayList / ConcurrentHashMap 源码剖析）](/language/java/collections/)
- [Java 并发基础：线程 / volatile / synchronized / 死锁](/language/java/concurrent/)
- [JVM 内存区域与内存溢出](/language/java/jvm/JVM内存区域与内存溢出.md)
- [JVM 类加载机制](/language/java/jvm/JVM类加载机制.md)
- [垃圾回收算法](/language/java/jvm/垃圾回收算法.md)
- [设计模式汇总（12 篇精讲，结合 Android 源码实例）](/language/design-pattern/)

### 🧱 Android 核心
- [Activity 生命周期与启动模式](/android/activity/activity-lifecycle.md)
- [Activity 启动流程源码分析](/android/activity/activity-launch-process.md)
- [Service 详解：启动方式与绑定方式](/android/service/service-basics.md)
- [AIDL 跨进程通信](/android/service/aidl.md)
- [BroadcastReceiver 详解](/android/broadcast/broadcast-basics.md)
- [ContentProvider 详解](/android/content-provider/content-provider-basics.md)
- [Fragment 生命周期与通信](/android/fragment/fragment-basics.md)
- [Intent 详解：显式与隐式](/android/intent/intent-basics.md)
- [IntentFilter 匹配规则](/android/intent/intent-filter.md)
- [Application 详解与全局初始化](/android/app/application-basics.md)
- [App 启动流程：从点击图标到首帧](/android/app/app-launch-process.md)
- [Manifest 清单文件详解](/android/app/manifest-guide.md)
- [资源系统详解](/android/resource/resource-basics.md)
- [资源限定符与多语言适配](/android/resource/resource-qualifiers.md)
- [权限机制与运行时权限详解](/android/permission/permission-basics.md)
- [权限申请最佳实践与常见问题](/android/permission/permission-practice.md)
- [通知机制详解：渠道、构建与样式](/android/notification/notification-basics.md)
- [PendingIntent 详解](/android/notification/pendingintent.md)
- [SharedPreferences 深度剖析](/android/storage/sharedpreferences-deep.md)
- [Android 进程与保活](/android/process/process-lifecycle.md)
- [Context 详解](/android/context/context-overview.md)

### 🎨 UI 与渲染
- [View 绘制流程详解](/ui/view/view-draw-process.md)
- [MeasureSpec 完全解析](/ui/view/measurespec.md)
- [事件分发机制详解](/ui/event/event-dispatch.md)
- [自定义 View 实战](/ui/custom-view/custom-view-guide.md)
- [属性动画机制](/ui/animation/property-animation.md)
- [布局优化与屏幕适配](/ui/layout/layout-optimization.md)
- [Window 机制详解](/ui/window/window-mechanism.md)
- [Bitmap 详解与图片压缩](/ui/bitmap/bitmap-guide.md)
- [Jetpack Compose 入门到进阶](/jetpack/compose/compose-basics.md)

### 🧩 Jetpack 全家桶
- [Lifecycle / ViewModel / LiveData](/jetpack/lifecycle-viewmodel/lifecycle.md)
- [Room 数据库详解](/jetpack/room-datastore/room-guide.md)
- [DataStore 使用指南](/jetpack/room-datastore/datastore-guide.md)
- [Paging 3 分页加载](/jetpack/paging-navigation/paging3.md)
- [Navigation 导航组件](/jetpack/paging-navigation/navigation.md)
- [WorkManager 后台任务](/jetpack/workmanager-hilt/workmanager.md)
- [Hilt 依赖注入](/jetpack/workmanager-hilt/hilt.md)

### 🌐 网络与异步
- [计算机网络体系（OSI / TCP-IP）](/network/osi-tcpip.md)
- [TCP 与 UDP 详解](/network/tcp-udp.md)
- [OkHttp / Retrofit 详解](/network/http/retrofit-okhttp.md)
- [Handler 消息机制源码解析](/network/handler/handler-source.md)
- [协程 Flow 进阶](/network/coroutine/flow-advanced.md)
- [线程池详解](/network/thread/thread-pool.md)
- [锁机制详解](/network/thread/locks.md)

### 🚀 进阶实战
- [架构设计演进（MVC / MVP / MVVM / MVI）](/advanced/architecture/architecture-evolution.md)
- [组件化与模块化实践](/advanced/modular/modularization-practice.md)
- [插件化原理](/advanced/plugin/plugin-principle.md)
- [Android 启动优化实践](/advanced/performance/startup-optimization.md)
- [内存优化与内存泄漏排查](/advanced/performance/memory-optimization.md)
- [卡顿优化实战](/advanced/performance/jank-optimization.md)
- [APK 体积优化](/advanced/performance/apk-size-optimization.md)
- [LeakCanary 源码分析](/advanced/performance/leakcanary-analysis.md)
- [EventBus 源码分析](/advanced/architecture/eventbus-analysis.md)
- [崩溃监控与 ANR 治理](/advanced/stability/crash-monitoring.md)

### ⚙️ 系统原理
- [Binder 跨进程通信机制详解](/system/binder/binder-mechanism.md)
- [AIDL 深入解析](/system/binder/aidl-deep.md)
- [Parcelable 序列化](/system/binder/parcelable.md)
- [AMS 与 Activity 启动](/system/ams-wms/ams-activity-launch.md)
- [WMS 窗口管理](/system/ams-wms/wms-principle.md)
- [系统启动流程](/system/boot/system-boot.md)
- [APK 打包流程与签名机制](/system/apk/apk-build-process.md)
- [ART 运行时与 GC](/system/art/art-runtime.md)
- [类加载器与双亲委托](/system/art/classloader.md)

### 🛠️ 工程实践
- [Gradle 构建系统与 AGP](/engineering/gradle/gradle-basics.md)
- [Gradle 依赖项配置](/engineering/gradle/dependency-config.md)
- [ProGuard 混淆配置](/engineering/gradle/proguard-guide.md)
- [Git 工作流与最佳实践](/engineering/git/git-workflow.md)
- [Git 常用命令速查](/engineering/git/git-cheatsheet.md)
- [GitHub Actions CI/CD](/engineering/cicd/github-actions.md)
- [单元测试实战](/engineering/testing/unit-testing.md)
- [UI 测试实战](/engineering/testing/ui-testing.md)

### 💼 面试与项目
- [面试基础篇（Java/Kotlin、四大组件、View）](/interview/basics.md)
- [面试进阶篇（性能、架构、组件化）](/interview/advanced.md)
- [面试源码篇（Handler、Binder、启动流程）](/interview/source-code.md)
- [面试准备计划](/interview/interview-plan.md)
- [简历与项目经验建议](/interview/resume-guide.md)
- [大厂面试经验实录（阿里 / 美团 / 网易）](/interview/company-experience.md)
- [从零搭建完整 App（Kotlin + Compose + MVVM）](/projects/from-scratch.md)
- [开源项目源码解析](/projects/open-source-analysis.md)

### 📚 经典读书笔记
- [《Android 开发艺术探索》笔记合集（Activity / IPC / View / Window / 性能）](/reading-notes/)
- [《深入理解 Java 虚拟机》第 12 章：内存模型与线程](/reading-notes/《深入理解java虚拟机》第12章.md)
- [《Java 编程思想》第一章：对象导论](/reading-notes/《Java编程思想》第一章读书笔记.md)

### 🧮 算法与数据结构
- [算法刷题指南](/language/algorithm/algorithm-guide.md)
- [数据结构（Java 实现）](/language/algorithm/data-structure.md)
- [十大排序算法总结](/language/algorithm/sort-algorithm.md)
- [LeetCode Top 100 精讲](/language/algorithm/leetcode-top100.md)
- [剑指 Offer 经典题解析](/language/algorithm/offer-classic.md)

## 🎯 关于本站

WikiAndroid 是一份面向 **Android 开发者**与**求职者**的开源知识库，从面试复习出发，逐步扩展为覆盖 Android 核心技术、工程实践与前沿技术的系统化学习指南。

- [项目介绍](/about/intro.md)
- [贡献指南](/about/contribution-guideline.md)
- [常见问题](/about/faq.md)

> 如果觉得内容有帮助，欢迎在 [GitHub](https://github.com/galifans/wikiandroid) 上点个 Star ⭐，这是对我们最大的鼓励！
