# 🟢 WikiAndroid

> 面向 **Android 开发者与求职者**的系统化知识库：Kotlin、Jetpack、源码原理、性能优化、高频面试题全覆盖。
> 本仓库 README、[`wikiStatic/`](wikiStatic/README.md) 静态资料与 [wikiandroid.com](https://wikiandroid.com) 在线站点**内容同源**：
> 阅读本文档即可完整学习，也可直接下载 `wikiStatic/` 中的 md 资料与书籍 PDF。

---

## 🚀 三种学习方式

| 方式 | 说明 |
| --- | --- |
| 📖 **GitHub 阅读** | 本文档即学习索引：下方内容板块 + `wikiStatic` 目录树，可直接点击浏览 / 下载 |
| 📦 **下载资料** | 下载 `wikiStatic/` 中的 md 学习资料；`wikiStatic/books/` 书籍 PDF 点击书名直接下载 |
| 🌐 **在线学习** | 访问 [wikiandroid.com](https://wikiandroid.com)（全文搜索、侧边栏、明暗主题，阅读体验最佳） |

## 🗂️ 内容板块

> 与 [wikiandroid.com](https://wikiandroid.com) 各板块一一对应（同源），点击在线入口可跳转阅读。

| 板块 | 内容 | 在线入口 |
| --- | --- | --- |
| 🗺️ 学习路线 | Android / Kotlin / Jetpack Compose 系统学习路线 | [roadmap](https://wikiandroid.com/roadmap/) |
| ☕ 语言基础 | Kotlin、Java、数据结构与算法 | [language](https://wikiandroid.com/language/) |
| 🧱 Android 核心 | 四大组件、Fragment、数据存储 | [android](https://wikiandroid.com/android/) |
| 🎨 UI 与渲染 | View 绘制、事件分发、自定义 View、动画、Compose | [ui](https://wikiandroid.com/ui/) |
| 🧩 Jetpack | Lifecycle、Room、DataStore、Paging、WorkManager、Hilt | [jetpack](https://wikiandroid.com/jetpack/) |
| 🌐 网络与异步 | OkHttp、Retrofit、Handler、协程、线程池 | [network](https://wikiandroid.com/network/) |
| 🚀 进阶实战 | 架构设计、组件化、插件化、性能优化、稳定性 | [advanced](https://wikiandroid.com/advanced/) |
| ⚙️ 系统原理 | Binder、AMS/WMS、启动流程、APK、ART/DEX | [system](https://wikiandroid.com/system/) |
| 🛠️ 工程实践 | Gradle、Git、CI/CD、测试体系 | [engineering](https://wikiandroid.com/engineering/) |
| 💼 面试指南 | 高频面试题、面试准备计划、简历建议 | [interview](https://wikiandroid.com/interview/) |
| 🤖 实战项目 | 从零搭建 App、开源项目解析 | [projects](https://wikiandroid.com/projects/) |
| 📚 书籍资源 | 精选 PDF 书籍，点击直接下载 | [books](https://wikiandroid.com/books/) |

## 📚 书籍资源

> 存放于 `wikiStatic/books/`，点击书名直接下载。来源：[TIM168/technical_books](https://github.com/TIM168/technical_books)，仅供学习交流，请尊重版权。

### 🧮 算法

| 书籍 | 说明 | 下载 |
| --- | --- | --- |
| Hello 算法（Java 版） | 动画图解、一键运行的数据结构与算法入门书 | [⬇️ 下载](wikiStatic/books/algorithm/hello-algo.pdf) |
| 程序员的数学 | 从数学视角理解编程，程序员必读 | [⬇️ 下载](wikiStatic/books/algorithm/programmer-math.pdf) |

### ☕ Java

| 书籍 | 说明 | 下载 |
| --- | --- | --- |
| 深入理解 JAVA 内存模型 | JMM 原理详解，面试常考 | [⬇️ 下载](wikiStatic/books/java/java-memory-model.pdf) |
| 阿里巴巴 Java 开发手册（终极版） | 阿里规范，编码约定与最佳实践 | [⬇️ 下载](wikiStatic/books/java/alibaba-java-dev-manual.pdf) |

### 🌐 网络与并发

| 书籍 | 说明 | 下载 |
| --- | --- | --- |
| 多线程编程指南 | 多线程基础与并发实践 | [⬇️ 下载](wikiStatic/books/network/multithreading-guide.pdf) |
| HttpClient 入门 | HTTP 客户端实战入门 | [⬇️ 下载](wikiStatic/books/network/httpclient-intro.pdf) |

### 🗄️ 数据库

| 书籍 | 说明 | 下载 |
| --- | --- | --- |
| 程序员的 SQL 金典 | SQL 语法与优化经典 | [⬇️ 下载](wikiStatic/books/database/programmer-sql-classic.pdf) |

> 📌 更多书籍陆续收录中：Android / 架构 / 语言 / 系统分类目录已建好，PDF 待补充（来源同 TIM168/technical_books）。

## 📦 wikiStatic 目录结构

> **内容架构真相源**：由 `scripts/sync-wikistatic.ps1` 从 `src/` 同步生成，目录树自动刷新，请勿手工编辑标记区间。

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
    │   ├── custom-viewgroup.md
    │   └── custom-view-guide.md
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



