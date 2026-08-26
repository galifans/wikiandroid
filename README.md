# WikiAndroid

> 面向 **Android 开发者与求职者**的系统化知识库：Kotlin、Jetpack、源码原理、性能优化、高频面试题全覆盖。本文档与 [`wikiStatic/`](wikiStatic/README.md) 静态资料同源；需要全文搜索、侧边栏导航、明暗主题时可访问 [wikiandroid.com](https://wikiandroid.com)。

---

## 三种学习方式

| 方式 | 说明 |
| --- | --- |
| **GitHub 直接阅读**（推荐） | 本文档即完整知识库：下方按 板块直接呈现核心内容，点击文章标题即可在 GitHub 内阅读全文 |
| **下载资料** | 直接下载 `wikiStatic/` 中的 md 学习资料，或 `wikiStatic/books/` 中的书籍 PDF |
| **在线学习（可选）** | 需要全文搜索、侧边栏导航、明暗主题时，访问 [wikiandroid.com](https://wikiandroid.com)（与本文档同源） |

---

## 知识库速览（直接阅读）

### 学习路线

| 路线 | 适合人群 | 预计周期 |
| --- | --- | --- |
| [Android 学习路线（2026 最新版）](wikiStatic/roadmap/android-roadmap.md) | 零基础入门 / 转行 Android | 6-12 个月 |
| [Kotlin 学习路线](wikiStatic/roadmap/kotlin-roadmap.md) | 已掌握 Java 的开发者 | 2-4 周 |
| [Jetpack Compose 学习路线](wikiStatic/roadmap/compose-roadmap.md) | 有 Android 基础，转向声明式 UI | 1-2 个月 |

### 语言基础

- **Kotlin**：[基础语法详解](wikiStatic/language/kotlin/kotlin-basics.md) · [协程从入门到进阶](wikiStatic/language/kotlin/kotlin-coroutines.md) · [泛型](wikiStatic/language/kotlin/kotlin-generics.md) · [扩展函数](wikiStatic/language/kotlin/kotlin-extensions.md)
- **Java**：[面向 Android 的 Java 核心回顾](wikiStatic/language/java/java-basics.md) · [集合](wikiStatic/language/java/java-collections.md) · [并发](wikiStatic/language/java/java-concurrency.md)
- **算法**：[刷题指南](wikiStatic/language/algorithm/algorithm-guide.md) · [LeetCode Top 100 精讲](wikiStatic/language/algorithm/leetcode-top100.md)

### Android 核心

| 组件 | 作用 | 入口文档 |
| --- | --- | --- |
| Activity | 用户交互界面 | [Activity](wikiStatic/android/activity/README.md) |
| Service | 后台长时间运行 | [Service](wikiStatic/android/service/README.md) |
| BroadcastReceiver | 全局消息接收 | [BroadcastReceiver](wikiStatic/android/broadcast/README.md) |
| ContentProvider | 跨进程数据共享 | [ContentProvider](wikiStatic/android/content-provider/README.md) |
| Fragment | 界面模块化 | [Fragment](wikiStatic/android/fragment/README.md) |
| Intent | 组件通信桥梁 | [Intent](wikiStatic/android/intent/README.md) |
| Application | 启动流程与全局初始化 | [Application](wikiStatic/android/app/README.md) |
| 资源系统 | 多语言 / 多屏幕适配 | [资源](wikiStatic/android/resource/README.md) |
| 权限系统 | 运行时权限机制 | [权限](wikiStatic/android/permission/README.md) |
| 通知机制 | 通知渠道 / PendingIntent | [通知](wikiStatic/android/notification/README.md) |
| 数据存储 | SharedPreferences / Room / DataStore | [存储](wikiStatic/android/storage/README.md) |
| 进程 | 进程生命周期与保活 | [进程](wikiStatic/android/process/README.md) |
| Context | 系统服务访问封装 | [Context](wikiStatic/android/context/README.md) |

### UI 与渲染

| 模块 | 说明 | 入口 |
| --- | --- | --- |
| View 绘制流程 | measure / layout / draw | [View](wikiStatic/ui/view/README.md) |
| 事件分发机制 | dispatchTouchEvent 链条 | [事件分发](wikiStatic/ui/event/README.md) |
| 自定义 View | 绘制与交互实战 | [自定义 View](wikiStatic/ui/custom-view/README.md) |
| 动画机制 | 属性动画 / 帧动画 | [动画](wikiStatic/ui/animation/README.md) |
| 布局优化 | ConstraintLayout / include | [布局优化](wikiStatic/ui/layout/README.md) |

### Jetpack 全家桶

| 分类 | 组件 | 入口 |
| --- | --- | --- |
| 声明式 UI | Jetpack Compose | [Compose](wikiStatic/jetpack/compose/README.md) |
| 生命周期 | Lifecycle / ViewModel / LiveData | [Lifecycle / ViewModel](wikiStatic/jetpack/lifecycle-viewmodel/README.md) |
| 数据持久化 | Room / DataStore | [Room / DataStore](wikiStatic/jetpack/room-datastore/README.md) |
| 导航与分页 | Paging / Navigation | [Paging / Navigation](wikiStatic/jetpack/paging-navigation/README.md) |
| 后台与注入 | WorkManager / Hilt | [WorkManager / Hilt](wikiStatic/jetpack/workmanager-hilt/README.md) |

### 网络与异步

| 模块 | 说明 | 入口 |
| --- | --- | --- |
| HTTP | OkHttp / Retrofit / 网络协议 | [HTTP](wikiStatic/network/http/README.md) |
| Handler | Handler 消息机制与源码 | [Handler](wikiStatic/network/handler/README.md) |
| 协程 | 协程 Flow / RxJava | [协程](wikiStatic/network/coroutine/README.md) |
| 线程 | 线程池与并发编程 | [线程](wikiStatic/network/thread/README.md) |

### 进阶实战

| 模块 | 说明 | 入口 |
| --- | --- | --- |
| 架构设计 | MVC / MVP / MVVM / MVI | [架构](wikiStatic/advanced/architecture/README.md) |
| 组件化 | 模块化与组件化拆分 | [组件化](wikiStatic/advanced/modular/README.md) |
| 插件化 | 插件化与热修复 | [插件化](wikiStatic/advanced/plugin/README.md) |
| 性能优化 | 启动 / 卡顿 / 内存 / 包体积 | [性能优化](wikiStatic/advanced/performance/README.md) |
| 稳定性 | 崩溃监控 / ANR / 日志 | [稳定性](wikiStatic/advanced/stability/README.md) |
| 音视频 | 音视频开发入门 | [音视频](wikiStatic/advanced/multimedia/README.md) |
| 跨端方案 | Flutter / RN / KMP 选型 | [跨端方案](wikiStatic/advanced/cross-platform/README.md) |

### 系统原理

| 模块 | 说明 | 入口 |
| --- | --- | --- |
| Binder | 跨进程通信核心 | [Binder](wikiStatic/system/binder/README.md) |
| AMS / WMS | 系统核心服务 | [AMS / WMS](wikiStatic/system/ams-wms/README.md) |
| 启动流程 | 系统与应用启动 | [启动流程](wikiStatic/system/boot/README.md) |
| APK | 打包与签名 | [APK](wikiStatic/system/apk/README.md) |
| ART / DEX | 运行时与类加载 | [ART / DEX](wikiStatic/system/art/README.md) |
| 操作系统 | 操作系统与 IPC | [操作系统](wikiStatic/system/os/README.md) |

### 工程实践

| 模块 | 说明 | 入口 |
| --- | --- | --- |
| Gradle | 构建系统与 AGP | [Gradle](wikiStatic/engineering/gradle/README.md) |
| Git | 版本管理与工作流 | [Git](wikiStatic/engineering/git/README.md) |
| CI/CD | 自动化构建发布 | [CI/CD](wikiStatic/engineering/cicd/README.md) |
| 测试 | 单元测试与 UI 测试 | [测试](wikiStatic/engineering/testing/README.md) |

### 面试指南

| 模块 | 内容 | 入口 |
| --- | --- | --- |
| 基础篇 | Java/Kotlin、四大组件、View | [基础篇](wikiStatic/interview/basics.md) |
| 进阶篇 | 性能优化、架构、组件化 | [进阶篇](wikiStatic/interview/advanced.md) |
| 源码篇 | Handler、Binder、启动流程 | [源码篇](wikiStatic/interview/source-code.md) |

### 实战项目

| 项目 | 技术栈 | 入口 |
| --- | --- | --- |
| 从零搭建完整 App | Kotlin + Compose + MVVM | [完整教程](wikiStatic/projects/from-scratch.md) |
| 开源项目源码解析 | 架构 / 性能 | [源码解析](wikiStatic/projects/open-source-analysis.md) |

## 书籍资源

> 来源：[TIM168/technical_books](https://github.com/TIM168/technical_books)，仅供学习交流。

### 算法

| 书籍 | 说明 | 下载 |
| --- | --- | --- |
| Hello 算法（Java 版） | 动画图解、一键运行的数据结构与算法入门书 | [hello-algo.pdf](wikiStatic/books/algorithm/hello-algo.pdf) |
| 程序员的数学 | 从数学视角理解编程，程序员必读 | [programmer-math.pdf](wikiStatic/books/algorithm/programmer-math.pdf) |

### Java

| 书籍 | 说明 | 下载 |
| --- | --- | --- |
| 深入理解 JAVA 内存模型 | JMM 原理详解，面试常考 | [java-memory-model.pdf](wikiStatic/books/java/java-memory-model.pdf) |
| 阿里巴巴 Java 开发手册（终极版） | 阿里规范，编码约定与最佳实践 | [alibaba-java-dev-manual.pdf](wikiStatic/books/java/alibaba-java-dev-manual.pdf) |

### 网络与并发

| 书籍 | 说明 | 下载 |
| --- | --- | --- |
| 多线程编程指南 | 多线程基础与并发实践 | [multithreading-guide.pdf](wikiStatic/books/network/multithreading-guide.pdf) |
| HttpClient 入门 | HTTP 客户端实战入门 | [httpclient-intro.pdf](wikiStatic/books/network/httpclient-intro.pdf) |

### 数据库

| 书籍 | 说明 | 下载 |
| --- | --- | --- |
| 程序员的 SQL 金典 | SQL 语法与优化经典 | [programmer-sql-classic.pdf](wikiStatic/books/database/programmer-sql-classic.pdf) |

## 精选文章

| 主题 | 文章 |
| --- | --- |
| 学习路线 | [Android 学习路线 2026](wikiStatic/roadmap/android-roadmap.md) · [Kotlin 学习路线](wikiStatic/roadmap/kotlin-roadmap.md) · [Compose 学习路线](wikiStatic/roadmap/compose-roadmap.md) · [Android 版本演进](wikiStatic/roadmap/android-version-history.md) |
| 语言与核心 | [Kotlin 基础语法](wikiStatic/language/kotlin/kotlin-basics.md) · [Kotlin 协程进阶](wikiStatic/language/kotlin/kotlin-coroutines.md) · [Activity 生命周期](wikiStatic/android/activity/activity-lifecycle.md) · [SQLite 深入指南](wikiStatic/android/storage/sqlite-guide.md) |
| UI 与渲染 | [View 绘制流程](wikiStatic/ui/view/view-draw-process.md) · [事件分发机制](wikiStatic/ui/event/event-dispatch.md) · [Choreographer 与帧同步](wikiStatic/ui/render/choreographer.md) · [硬件加速渲染](wikiStatic/ui/render/hardware-acceleration.md) |
| 源码与原理 | [Handler 消息机制源码](wikiStatic/network/handler/handler-source.md) · [Binder 驱动层深入](wikiStatic/system/binder/binder-driver.md) · [APK 签名与校验](wikiStatic/system/apk/signature-verify.md) · [APK 安装流程](wikiStatic/system/apk/apk-install-process.md) |
| 网络与协议 | [WebSocket 原理与实现](wikiStatic/network/http/websocket.md) · [OkHttp 源码解析](wikiStatic/network/http/okhttp-source.md) · [Retrofit 源码解析](wikiStatic/network/http/retrofit-source.md) |
| 系统与性能 | [Zygote 进程深入](wikiStatic/system/boot/zygote-deep.md) · [ART 编译优化](wikiStatic/system/art/art-compilation.md) · [启动优化实践](wikiStatic/advanced/performance/startup-optimization.md) · [内存优化与泄漏排查](wikiStatic/advanced/performance/memory-optimization.md) |
| 工程与进阶 | [Git 分支模型](wikiStatic/engineering/git/git-branch-model.md) · [跨端方案选型](wikiStatic/advanced/cross-platform/cross-platform-overview.md) · [Camera2 拍照流程](wikiStatic/advanced/multimedia/camera-capture.md) · [灰度发布](wikiStatic/engineering/cicd/gray-release.md) |
| 面试指南 | [行为面试题与回答套路](wikiStatic/interview/behavior-questions.md) · [面试准备计划](wikiStatic/interview/interview-plan.md) · [简历与项目经验建议](wikiStatic/interview/resume-guide.md) |

## 支持项目

如果这些内容对你有帮助，欢迎 **Star** 本仓库、分享给更多同学——这是对我们最大的鼓励！
在线学习请访问 [wikiandroid.com](https://wikiandroid.com)，体验更佳；也欢迎通过 [Issues](https://github.com/galifans/wikiandroid/issues) 反馈建议。

## 许可

MIT License · Copyright © 2026 WikiAndroid

