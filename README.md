# 🟢 WikiAndroid

> 面向 **Android 开发者与求职者**的系统化知识库：Kotlin、Jetpack、源码原理、性能优化、高频面试题全覆盖。
> **无需跳转，直接向下阅读即可学习**。本文档与 [`wikiStatic/`](wikiStatic/README.md) 静态资料同源，全部链接均指向仓库内文件；需要全文搜索 / 侧边栏 / 明暗主题时可访问 [wikiandroid.com](https://wikiandroid.com)（内容一致）。

---

## 🚀 三种学习方式

| 方式 | 说明 |
| --- | --- |
| 📖 **GitHub 直接阅读**（推荐） | 本文档即完整知识库：下方按板块直接呈现核心内容，点击文章标题即可在 GitHub 内阅读全文 |
| 📦 **下载资料** | 直接下载 `wikiStatic/` 中的 md 学习资料，或 `wikiStatic/books/` 中的书籍 PDF |
| 🌐 **在线学习（可选）** | 需要全文搜索、侧边栏导航、明暗主题时，访问 [wikiandroid.com](https://wikiandroid.com)（与本文档同源） |

---

## 📖 知识库速览（直接阅读）

> 以下内容与 `wikiStatic/` 目录一一对应，点击标题即可在 GitHub 内阅读全文，无需离开本页。

### 🗺️ 学习路线 → [`wikiStatic/roadmap/`](wikiStatic/roadmap/README.md)

| 路线 | 适合人群 | 预计周期 |
| --- | --- | --- |
| [Android 学习路线（2026 最新版）](wikiStatic/roadmap/android-roadmap.md) | 零基础入门 / 转行 Android | 6-12 个月 |
| [Kotlin 学习路线](wikiStatic/roadmap/kotlin-roadmap.md) | 已掌握 Java 的开发者 | 2-4 周 |
| [Jetpack Compose 学习路线](wikiStatic/roadmap/compose-roadmap.md) | 有 Android 基础，转向声明式 UI | 1-2 个月 |

> 💡 建议：先动手再理论（每个知识点配 Demo）、重视源码（Handler / Binder 是面试深水区）、坚持输出（博客 / 开源项目沉淀）。

### ☕ 语言基础 → [`wikiStatic/language/`](wikiStatic/language/README.md)

- **Kotlin**：[基础语法详解](wikiStatic/language/kotlin/kotlin-basics.md) · [协程从入门到进阶](wikiStatic/language/kotlin/kotlin-coroutines.md) · [泛型](wikiStatic/language/kotlin/kotlin-generics.md) · [扩展函数](wikiStatic/language/kotlin/kotlin-extensions.md)
- **Java**：[面向 Android 的 Java 核心回顾](wikiStatic/language/java/java-basics.md) · [集合](wikiStatic/language/java/java-collections.md) · [并发](wikiStatic/language/java/java-concurrency.md)
- **算法**：[刷题指南](wikiStatic/language/algorithm/algorithm-guide.md) · [LeetCode Top 100 精讲](wikiStatic/language/algorithm/leetcode-top100.md)

### 🧱 Android 核心 → [`wikiStatic/android/`](wikiStatic/android/README.md)

| 组件 | 作用 | 入口文档 |
| --- | --- | --- |
| Activity | 用户交互界面 | [Activity](wikiStatic/android/activity/README.md) |
| Service | 后台长时间运行 | [Service](wikiStatic/android/service/README.md) |
| BroadcastReceiver | 全局消息接收 | [BroadcastReceiver](wikiStatic/android/broadcast/README.md) |
| ContentProvider | 跨进程数据共享 | [ContentProvider](wikiStatic/android/content-provider/README.md) |
| Fragment | 界面模块化 | [Fragment](wikiStatic/android/fragment/README.md) |
| 数据存储 | SharedPreferences / Room / DataStore | [存储](wikiStatic/android/storage/README.md) |

### 🎨 UI 与渲染 → [`wikiStatic/ui/`](wikiStatic/ui/README.md)

| 模块 | 说明 | 入口 |
| --- | --- | --- |
| View 绘制流程 | measure / layout / draw | [View](wikiStatic/ui/view/README.md) |
| 事件分发机制 | dispatchTouchEvent 链条 | [事件分发](wikiStatic/ui/event/README.md) |
| 自定义 View | 绘制与交互实战 | [自定义 View](wikiStatic/ui/custom-view/README.md) |
| 动画机制 | 属性动画 / 帧动画 | [动画](wikiStatic/ui/animation/README.md) |
| 布局优化 | ConstraintLayout / include | [布局优化](wikiStatic/ui/layout/README.md) |
| Jetpack Compose | 声明式 UI 开发 | [Compose](wikiStatic/ui/compose/README.md) |

> 学习路径：View 体系基础 → 绘制流程 → 事件分发 → 自定义 View → 动画 → 性能优化，再到 Compose。

### 🧩 Jetpack 全家桶 → [`wikiStatic/jetpack/`](wikiStatic/jetpack/README.md)

| 分类 | 组件 | 入口 |
| --- | --- | --- |
| 生命周期 | Lifecycle / ViewModel / LiveData | [Lifecycle / ViewModel](wikiStatic/jetpack/lifecycle-viewmodel/README.md) |
| 数据持久化 | Room / DataStore | [Room / DataStore](wikiStatic/jetpack/room-datastore/README.md) |
| 导航与分页 | Paging / Navigation | [Paging / Navigation](wikiStatic/jetpack/paging-navigation/README.md) |
| 后台与注入 | WorkManager / Hilt | [WorkManager / Hilt](wikiStatic/jetpack/workmanager-hilt/README.md) |

### 🌐 网络与异步 → [`wikiStatic/network/`](wikiStatic/network/README.md)

| 模块 | 说明 | 入口 |
| --- | --- | --- |
| HTTP | OkHttp / Retrofit / 网络协议 | [HTTP](wikiStatic/network/http/README.md) |
| Handler | Handler 消息机制与源码 | [Handler](wikiStatic/network/handler/README.md) |
| 协程 | 协程 Flow / RxJava | [协程](wikiStatic/network/coroutine/README.md) |
| 线程 | 线程池与并发编程 | [线程](wikiStatic/network/thread/README.md) |

> 知识关系：`Retrofit → OkHttp → Okio → Socket`；异步框架：协程（现代）/ RxJava（历史）/ Handler（系统消息）。

### 🚀 进阶实战 → [`wikiStatic/advanced/`](wikiStatic/advanced/README.md)

| 模块 | 说明 | 入口 |
| --- | --- | --- |
| 架构设计 | MVC / MVP / MVVM / MVI | [架构](wikiStatic/advanced/architecture/README.md) |
| 组件化 | 模块化与组件化拆分 | [组件化](wikiStatic/advanced/modular/README.md) |
| 插件化 | 插件化与热修复 | [插件化](wikiStatic/advanced/plugin/README.md) |
| 性能优化 | 启动 / 卡顿 / 内存 / 包体积 | [性能优化](wikiStatic/advanced/performance/README.md) |
| 稳定性 | 崩溃监控 / ANR / 日志 | [稳定性](wikiStatic/advanced/stability/README.md) |
| 音视频 | 音视频开发入门 | [音视频](wikiStatic/advanced/multimedia/README.md) |

> 成长路径：架构模式 → 组件化 → 性能优化 → 稳定性 → 专项（音视频 / 跨端）。

### ⚙️ 系统原理 → [`wikiStatic/system/`](wikiStatic/system/README.md)

| 模块 | 说明 | 入口 |
| --- | --- | --- |
| Binder | 跨进程通信核心 | [Binder](wikiStatic/system/binder/README.md) |
| AMS / WMS | 系统核心服务 | [AMS / WMS](wikiStatic/system/ams-wms/README.md) |
| 启动流程 | 系统与应用启动 | [启动流程](wikiStatic/system/boot/README.md) |
| APK | 打包与签名 | [APK](wikiStatic/system/apk/README.md) |
| ART / DEX | 运行时与类加载 | [ART / DEX](wikiStatic/system/art/README.md) |

> 知识框架：Linux 内核 → Android 系统服务（AMS/WMS/PMS）→ Binder IPC → 应用框架层。

### 🛠️ 工程实践 → [`wikiStatic/engineering/`](wikiStatic/engineering/README.md)

| 模块 | 说明 | 入口 |
| --- | --- | --- |
| Gradle | 构建系统与 AGP | [Gradle](wikiStatic/engineering/gradle/README.md) |
| Git | 版本管理与工作流 | [Git](wikiStatic/engineering/git/README.md) |
| CI/CD | 自动化构建发布 | [CI/CD](wikiStatic/engineering/cicd/README.md) |
| 测试 | 单元测试与 UI 测试 | [测试](wikiStatic/engineering/testing/README.md) |

> 最佳实践：Version Catalog 统一依赖、Git 分支规范、GitHub Actions 自动化、关键逻辑单测 + 核心流程 UI 测试。

### 💼 面试指南 → [`wikiStatic/interview/`](wikiStatic/interview/README.md)

| 模块 | 内容 | 入口 |
| --- | --- | --- |
| 基础篇 | Java/Kotlin、四大组件、View | [基础篇](wikiStatic/interview/basics.md) |
| 进阶篇 | 性能优化、架构、组件化 | [进阶篇](wikiStatic/interview/advanced.md) |
| 源码篇 | Handler、Binder、启动流程 | [源码篇](wikiStatic/interview/source-code.md) |

> 准备路线：基础回顾（2 周）→ 源码深挖（2 周）→ 项目复盘（1 周）→ 模拟面试 → 投递面试。

### 🤖 实战项目 → [`wikiStatic/projects/`](wikiStatic/projects/README.md)

| 项目 | 技术栈 | 入口 |
| --- | --- | --- |
| 从零搭建完整 App | Kotlin + Compose + MVVM | [完整教程](wikiStatic/projects/from-scratch.md) |
| 开源项目源码解析 | 架构 / 性能 | [源码解析](wikiStatic/projects/open-source-analysis.md) |

> 建议：做透一个项目而非做很多半成品；项目要有技术亮点（性能优化 / 架构设计 / 自研工具）；配套技术博客记录决策过程。

## 📚 书籍资源

> 存放于 `wikiStatic/books/`，点击书名即可在仓库内直接下载（网页版与 GitHub 同步提供下载）。
> 来源：[TIM168/technical_books](https://github.com/TIM168/technical_books)，仅供学习交流，请尊重版权。

### 🧮 算法

| 书籍 | 说明 | 下载 |
| --- | --- | --- |
| Hello 算法（Java 版） | 动画图解、一键运行的数据结构与算法入门书 | [hello-algo.pdf](wikiStatic/books/algorithm/hello-algo.pdf) |
| 程序员的数学 | 从数学视角理解编程，程序员必读 | [programmer-math.pdf](wikiStatic/books/algorithm/programmer-math.pdf) |

### ☕ Java

| 书籍 | 说明 | 下载 |
| --- | --- | --- |
| 深入理解 JAVA 内存模型 | JMM 原理详解，面试常考 | [java-memory-model.pdf](wikiStatic/books/java/java-memory-model.pdf) |
| 阿里巴巴 Java 开发手册（终极版） | 阿里规范，编码约定与最佳实践 | [alibaba-java-dev-manual.pdf](wikiStatic/books/java/alibaba-java-dev-manual.pdf) |

### 🌐 网络与并发

| 书籍 | 说明 | 下载 |
| --- | --- | --- |
| 多线程编程指南 | 多线程基础与并发实践 | [multithreading-guide.pdf](wikiStatic/books/network/multithreading-guide.pdf) |
| HttpClient 入门 | HTTP 客户端实战入门 | [httpclient-intro.pdf](wikiStatic/books/network/httpclient-intro.pdf) |

### 🗄️ 数据库

| 书籍 | 说明 | 下载 |
| --- | --- | --- |
| 程序员的 SQL 金典 | SQL 语法与优化经典 | [programmer-sql-classic.pdf](wikiStatic/books/database/programmer-sql-classic.pdf) |

> 📌 更多书籍陆续收录中：Android / 架构 / 语言 / 系统分类目录已建好，PDF 待补充（来源同 TIM168/technical_books）。

## 📦 wikiStatic 目录结构

> **内容架构真相源**：由 `scripts/sync-wikistatic.mjs` 从 `src/` 同步生成，目录树自动刷新，请勿手工编辑标记区间。

<!-- WIKISTATIC_TREE:BEGIN -->
```text
wikiStatic/
├── README.md
├── about/
│   ├── README.md
│   ├── contribution-guideline.md
│   ├── faq.md
│   └── intro.md
├── advanced/
│   ├── README.md
│   ├── architecture/
│   │   ├── README.md
│   │   ├── architecture-evolution.md
│   │   ├── clean-architecture.md
│   │   └── repository-pattern.md
│   ├── modular/
│   │   ├── README.md
│   │   └── modularization-practice.md
│   ├── multimedia/
│   │   ├── README.md
│   │   └── multimedia-basics.md
│   ├── performance/
│   │   ├── README.md
│   │   ├── apk-size-optimization.md
│   │   ├── jank-optimization.md
│   │   ├── memory-optimization.md
│   │   └── startup-optimization.md
│   ├── plugin/
│   │   ├── README.md
│   │   ├── hotfix-comparison.md
│   │   └── plugin-principle.md
│   └── stability/
│       ├── README.md
│       ├── anr-guide.md
│       └── crash-monitoring.md
├── android/
│   ├── README.md
│   ├── activity/
│   │   ├── README.md
│   │   ├── activity-launch-process.md
│   │   ├── activity-lifecycle.md
│   │   └── task-stack.md
│   ├── broadcast/
│   │   ├── README.md
│   │   ├── broadcast-basics.md
│   │   └── register-comparison.md
│   ├── content-provider/
│   │   ├── README.md
│   │   └── content-provider-basics.md
│   ├── fragment/
│   │   ├── README.md
│   │   ├── fragment-basics.md
│   │   └── fragment-pitfalls.md
│   ├── service/
│   │   ├── README.md
│   │   ├── aidl.md
│   │   ├── foreground-service.md
│   │   └── service-basics.md
│   └── storage/
│       ├── README.md
│       ├── sp-vs-datastore.md
│       └── storage-comparison.md
├── books/
│   ├── README.md
│   ├── algorithm/
│   │   ├── hello-algo.pdf
│   │   └── programmer-math.pdf
│   ├── android/
│   │   └── README.md
│   ├── architecture/
│   │   └── README.md
│   ├── database/
│   │   └── programmer-sql-classic.pdf
│   ├── java/
│   │   ├── alibaba-java-dev-manual.pdf
│   │   └── java-memory-model.pdf
│   ├── language/
│   │   └── README.md
│   ├── network/
│   │   ├── httpclient-intro.pdf
│   │   └── multithreading-guide.pdf
│   └── system/
│       └── README.md
├── engineering/
│   ├── README.md
│   ├── cicd/
│   │   ├── README.md
│   │   └── github-actions.md
│   ├── git/
│   │   ├── README.md
│   │   ├── git-cheatsheet.md
│   │   └── git-workflow.md
│   ├── gradle/
│   │   ├── README.md
│   │   ├── gradle-basics.md
│   │   └── version-catalog.md
│   └── testing/
│       ├── README.md
│       ├── ui-testing.md
│       └── unit-testing.md
├── interview/
│   ├── README.md
│   ├── advanced.md
│   ├── basics.md
│   ├── interview-plan.md
│   ├── resume-guide.md
│   └── source-code.md
├── jetpack/
│   ├── README.md
│   ├── lifecycle-viewmodel/
│   │   ├── README.md
│   │   ├── lifecycle.md
│   │   ├── savedstate.md
│   │   └── viewmodel-livedata.md
│   ├── paging-navigation/
│   │   ├── README.md
│   │   ├── navigation.md
│   │   └── paging3.md
│   ├── room-datastore/
│   │   ├── README.md
│   │   ├── datastore-guide.md
│   │   └── room-guide.md
│   └── workmanager-hilt/
│       ├── README.md
│       ├── hilt.md
│       └── workmanager.md
├── language/
│   ├── README.md
│   ├── algorithm/
│   │   ├── README.md
│   │   ├── algorithm-guide.md
│   │   └── leetcode-top100.md
│   ├── java/
│   │   ├── README.md
│   │   ├── java-basics.md
│   │   ├── java-collections.md
│   │   └── java-concurrency.md
│   └── kotlin/
│       ├── README.md
│       ├── kotlin-basics.md
│       ├── kotlin-coroutines.md
│       ├── kotlin-extensions.md
│       └── kotlin-generics.md
├── network/
│   ├── README.md
│   ├── coroutine/
│   │   ├── README.md
│   │   ├── flow-advanced.md
│   │   └── rxjava-operators.md
│   ├── handler/
│   │   ├── README.md
│   │   ├── handler-source.md
│   │   └── handlerthread.md
│   ├── http/
│   │   ├── README.md
│   │   ├── http-protocol.md
│   │   ├── okhttp-interceptor.md
│   │   └── retrofit-okhttp.md
│   └── thread/
│       ├── README.md
│       ├── concurrency-tools.md
│       ├── locks.md
│       └── thread-pool.md
├── projects/
│   ├── README.md
│   ├── from-scratch.md
│   └── open-source-analysis.md
├── roadmap/
│   ├── README.md
│   ├── android-roadmap.md
│   ├── compose-roadmap.md
│   └── kotlin-roadmap.md
├── system/
│   ├── README.md
│   ├── ams-wms/
│   │   ├── README.md
│   │   ├── ams-activity-launch.md
│   │   └── wms-principle.md
│   ├── apk/
│   │   ├── README.md
│   │   ├── apk-build-process.md
│   │   └── multi-channel.md
│   ├── art/
│   │   ├── README.md
│   │   ├── art-runtime.md
│   │   ├── classloader.md
│   │   └── dex-format.md
│   ├── binder/
│   │   ├── README.md
│   │   ├── aidl-deep.md
│   │   └── binder-mechanism.md
│   └── boot/
│       ├── README.md
│       ├── app-launch.md
│       └── system-boot.md
└── ui/
    ├── README.md
    ├── animation/
    │   ├── README.md
    │   └── property-animation.md
    ├── compose/
    │   ├── README.md
    │   ├── compose-basics.md
    │   ├── compose-performance.md
    │   └── compose-state.md
    ├── custom-view/
    │   ├── README.md
    │   ├── custom-view-guide.md
    │   └── custom-viewgroup.md
    ├── event/
    │   ├── README.md
    │   ├── conflict-solution.md
    │   └── event-dispatch.md
    ├── layout/
    │   ├── README.md
    │   └── layout-optimization.md
    └── view/
        ├── README.md
        ├── measurespec.md
        ├── view-draw-process.md
        └── view-viewgroup.md
```
<!-- WIKISTATIC_TREE:END -->

## 📌 精选文章

| 主题 | 文章 |
| --- | --- |
| 学习路线 | [Android 学习路线 2026](wikiStatic/roadmap/android-roadmap.md) · [Kotlin 学习路线](wikiStatic/roadmap/kotlin-roadmap.md) · [Compose 学习路线](wikiStatic/roadmap/compose-roadmap.md) |
| 语言与核心 | [Kotlin 基础语法](wikiStatic/language/kotlin/kotlin-basics.md) · [Kotlin 协程进阶](wikiStatic/language/kotlin/kotlin-coroutines.md) · [Activity 生命周期](wikiStatic/android/activity/activity-lifecycle.md) |
| 源码与原理 | [Handler 消息机制源码](wikiStatic/network/handler/handler-source.md) · [Binder 机制详解](wikiStatic/system/binder/binder-mechanism.md) · [APK 打包与签名](wikiStatic/system/apk/apk-build-process.md) |
| 性能与进阶 | [启动优化实践](wikiStatic/advanced/performance/startup-optimization.md) · [内存优化与泄漏排查](wikiStatic/advanced/performance/memory-optimization.md) |

## ⭐ 支持项目

如果这些内容对你有帮助，欢迎 **Star ⭐** 本仓库、分享给更多同学——这是对我们最大的鼓励！
在线学习请访问 [wikiandroid.com](https://wikiandroid.com)，体验更佳；也欢迎通过 [Issues](https://github.com/galifans/wikiandroid/issues) 反馈建议。

## 📄 许可

MIT License · Copyright © 2026 WikiAndroid




