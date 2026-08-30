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
| Activity 能力 | ActivityResult / Edge-to-Edge | [Activity 库](wikiStatic/jetpack/activity/README.md) |
| 兼容与基础 | AppCompat / Core / Collection | [AppCompat](wikiStatic/jetpack/appcompat/README.md) · [Core](wikiStatic/jetpack/core/README.md) · [Collection](wikiStatic/jetpack/collection/README.md) |
| 安全认证 | Biometric | [Biometric](wikiStatic/jetpack/biometric/README.md) |
| Fragment 原理 | FragmentManager 源码 | [Fragment 库](wikiStatic/jetpack/fragment/README.md) |

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

> 精选各技术方向的高质量 PDF 经典书籍，点击书名即可下载：
> - 小体积书籍存放在 `wikiStatic/books/`，网站直链下载（Cloudflare CDN）；
> - 经典大部头书籍存放在仓库顶层 `books/`，点击跳转 GitHub 下载。
> 仅供学习交流使用，请尊重原作者版权。

### 算法

| 书籍 | 说明 | 下载 |
| --- | --- | --- |
| Hello 算法（Java 版） | 动画图解、一键运行的数据结构与算法入门书 | [下载](wikiStatic/books/algorithm/hello-algo.pdf) |
| 程序员的数学 | 从数学视角理解编程，程序员必读 | [下载](wikiStatic/books/algorithm/programmer-math.pdf) |

### Android

| 书籍 | 说明 | 下载 |
| --- | --- | --- |
| Android 应用开发入门教程（经典版） | Android 入门经典教程 | [下载](books/Android/Android应用开发入门教程-经典版.pdf) |

### C++

| 书籍 | 说明 | 下载 |
| --- | --- | --- |
| Effective C++（第三版） | C++ 编程规范与最佳实践经典 | [下载](books/C%2B%2B/Effective%20C%2B%2B中文版%28第三版%29.pdf) |
| STL 源码剖析 | 深入 STL 内部实现原理 | [下载](books/C%2B%2B/STL源码剖析.pdf) |
| 深度探索 C++ 对象模型 | C++ 对象内存模型深入 | [下载](books/C%2B%2B/深度探索C%2B%2B对象模型.pdf) |

### C语言

| 书籍 | 说明 | 下载 |
| --- | --- | --- |
| The C Programming Language | C 语言之父 K&R 经典原著 | [下载](books/C语言/The%20C%20Programming%20Language.pdf) |
| C 和指针（第二版） | 指针与内存深入理解 | [下载](books/C语言/C和指针（第二版）.pdf) |
| C 专家编程 | C 语言进阶经典 | [下载](books/C语言/C专家编程.pdf) |

### HTML

| 书籍 | 说明 | 下载 |
| --- | --- | --- |
| HTML 入门教材 | HTML 入门基础 | [下载](books/HTML/HTML入门教材.pdf) |
| HTML 语言从零到精通 | HTML 从入门到精通 | [下载](books/HTML/HTML语言从零到精通.pdf) |

### HTTP

| 书籍 | 说明 | 下载 |
| --- | --- | --- |
| HttpClient 入门 | HTTP 客户端实战入门 | [网站下载](wikiStatic/books/network/httpclient-intro.pdf) · [GitHub](books/HTTP/HttpClient入门.pdf) |

### Java

| 书籍 | 说明 | 下载 |
| --- | --- | --- |
| 深入理解 JAVA 内存模型 | JMM 原理详解，面试常考 | [下载](wikiStatic/books/java/java-memory-model.pdf) |
| 阿里巴巴 Java 开发手册（终极版） | 阿里规范，编码约定与最佳实践 | [下载](wikiStatic/books/java/alibaba-java-dev-manual.pdf) |
| Maven 实战 | 构建工具实战经典 | [下载](books/Java/Maven实战.pdf) |
| 深入理解 Java 7 | JVM 与 Java 语言深入 | [下载](books/Java/深入理解Java7.pdf) |

### Javascript

| 书籍 | 说明 | 下载 |
| --- | --- | --- |
| JavaScript 高级程序设计（第 3 版） | JS「红宝书」经典 | [下载](books/Javascript/JavaScript高级程序设计（第3版）】中文%20高清%20完整%20详细书签版.pdf) |
| JavaScript DOM 编程艺术 | DOM 编程入门经典 | [下载](books/Javascript/JavaScript_DOM编程艺术.pdf) |
| 深入浅出 Node.js | Node.js 入门经典 | [下载](books/Javascript/深入浅出Node.js.pdf) |

### Linux

| 书籍 | 说明 | 下载 |
| --- | --- | --- |
| LINUX 内核设计与实现 | 内核原理经典 | [下载](books/Linux/LINUX内核设计与实现.pdf) |
| linux 内核深入剖析（基于 0.11） | 内核源码逐行剖析 | [下载](books/Linux/linux内核深入剖析基于0.11.pdf) |

### Python

| 书籍 | 说明 | 下载 |
| --- | --- | --- |
| Python 3.6 中文文档 | Python 官方文档中文版 | [下载](books/Python/Python3.6%20中文文档.pdf) |

### 大数据

| 书籍 | 说明 | 下载 |
| --- | --- | --- |
| Hadoop 实战 | Hadoop 入门实战经典 | [下载](books/大数据/Hadoop实战.pdf) |
| Hive 编程指南 | Hive 数据仓库权威指南 | [下载](books/大数据/Hive编程指南.pdf) |
| Spark 技术内幕 | Spark 内核架构深入解析 | [下载](books/大数据/Spark技术内幕%20%20深入解析Spark内核架构设计与实现原理.pdf) |
| Kafka 权威指南（中文版） | 消息中间件权威指南 | [下载](books/大数据/kafka权威指南中文版.pdf) |

### 多线程

| 书籍 | 说明 | 下载 |
| --- | --- | --- |
| 多线程编程指南 | 多线程基础与并发实践 | [网站下载](wikiStatic/books/network/multithreading-guide.pdf) · [GitHub](books/多线程/多线程编程指南.pdf) |

### 汇编语言

| 书籍 | 说明 | 下载 |
| --- | --- | --- |
| 汇编语言（王爽） | 汇编语言入门经典 | [下载](books/汇编语言/汇编语言王爽着.pdf) |

### 架构

| 书籍 | 说明 | 下载 |
| --- | --- | --- |
| 分布式计算——原理、算法和系统 | 分布式系统经典教材 | [下载](books/架构/分布式计算-原理、算法和系统.pdf) |
| 淘宝技术这十年 | 互联网架构演进纪实 | [下载](books/架构/淘宝技术这十年.pdf) |
| 支付宝架构与技术 | 支付系统架构实战 | [下载](books/架构/支付宝架构与技术.pdf) |

### 人工智能&机器学习

| 书籍 | 说明 | 下载 |
| --- | --- | --- |
| 机器学习（周志华） | 机器学习「西瓜书」经典 | [下载](books/人工智能%26机器学习/机器学习_周志华.pdf) |
| 深度学习 | 深度学习「花书」经典 | [下载](books/人工智能%26机器学习/深度学习.pdf) |

### 数据库

| 书籍 | 说明 | 下载 |
| --- | --- | --- |
| 程序员的 SQL 金典 | SQL 语法与优化经典 | [下载](wikiStatic/books/database/programmer-sql-classic.pdf) |
| SQL 完全手册 | SQL 语法与优化大全 | [下载](books/数据库/SQL完全手册.pdf) |
| MySQL 高效编程 | MySQL 实战编程经典 | [下载](books/数据库/《MySQL高效编程》.pdf) |

### 消息队列&搜索引擎

| 书籍 | 说明 | 下载 |
| --- | --- | --- |
| Elasticsearch 权威指南（中文版） | ES 入门权威指南 | [下载](books/消息队列%26搜索引擎/Elasticsearch%20权威指南（中文版）清晰PDF.pdf) |
| Elasticsearch in Action 全文检索 | ES 实战进阶 | [下载](books/消息队列%26搜索引擎/Elasticsearch%20in%20Action%20全文检索.pdf) |
| Apache Solr 参考指南 7.1 | Solr 官方参考手册 | [下载](books/消息队列%26搜索引擎/apache-solr-ref-guide-7.1.pdf) |

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

