---
home: true
icon: home
title: 主页
heroText: WikiAndroid
tagline: 面向 Android 开发者与求职者的系统化知识库，覆盖 Kotlin、Jetpack、源码原理、性能优化与高频面试题
actions:
  - text: 开始阅读
    link: /roadmap/
    type: primary
  - text: GitHub
    link: https://github.com/galifans/wikiandroid
    type: default
features:
  - title: 学习路线
    icon: map
    details: Android / Kotlin / Jetpack Compose 系统学习路线，从入门到进阶一步到位
    link: /roadmap/
  - title: 语言基础
    icon: coffee
    details: Kotlin 语法、泛型、扩展函数、协程；Java 基础回顾；数据结构与算法
    link: /language/kotlin/
  - title: Android 核心
    icon: android
    details: 四大组件、Fragment、Intent、Binder 通信、数据存储，夯实应用层地基
    link: /android/activity/
  - title: UI 与渲染
    icon: palette
    details: View 绘制流程、事件分发、自定义 View、动画机制与布局优化
    link: /ui/view/
  - title: Jetpack 全家桶
    icon: boxes
    details: Compose、Lifecycle、Room、Paging、Navigation、WorkManager、Hilt、ActivityResult、AppCompat、Biometric、Core
    link: /jetpack/compose/
  - title: 网络与异步
    icon: globe
    details: OkHttp、Retrofit、Handler 消息机制、协程 Flow、线程池与并发编程
    link: /network/http/
  - title: 进阶实战
    icon: rocket
    details: 架构设计、组件化、插件化、性能优化、稳定性保障与音视频开发
    link: /advanced/architecture/
  - title: 系统原理
    icon: gears
    details: Binder、AMS/WMS、系统启动流程、APK 打包签名、ART/DEX 类加载
    link: /system/binder/
  - title: 工程实践
    icon: tools
    details: Gradle 构建、Git 工作流、CI/CD、单元测试与 UI 测试体系
    link: /engineering/gradle/
  - title: 面试指南
    icon: briefcase
    details: 高频面试题汇总（基础/进阶/源码）、面试准备计划与简历建议
    link: /interview/
  - title: 实战项目
    icon: robot
    details: 从零搭建完整 App 的实战拆解与优质开源项目推荐
    link: /projects/
  - title: 书籍资源
    icon: book
    details: 精选各方向 PDF 经典书籍，全部收录仓库 books/ 目录，点击书名 GitHub 直接下载
    link: /books/
  - title:  关于本站
    icon: info
    details: 项目介绍、贡献指南与常见问题
    link: /about/
---

## 内容规模

> **9 大知识模块 · 265+ 篇原创文章**，覆盖 Android 面试全考点（应用层 → 源码 → 性能 → 工程化）；
> 另有 **39 本 PDF 技术书籍**（GitHub 下载）与 **6 篇大厂面经**。

## 精选文章

### 学习路线
- [Android 学习路线（2026 最新版）](/roadmap/android-roadmap.md)
- [Kotlin 学习路线](/roadmap/kotlin-roadmap.md)
- [Jetpack Compose 学习路线](/roadmap/compose-roadmap.md)
- [Android 版本演进与特性](/roadmap/android-version-history.md)

### 语言基础：Kotlin / Java / JVM / 并发
- [Kotlin 基础语法详解](/language/kotlin/kotlin-basics.md)
- [Kotlin 协程从入门到进阶](/language/kotlin/kotlin-coroutines.md)
- [Kotlin 泛型详解](/language/kotlin/kotlin-generics.md)
- [Kotlin 扩展函数](/language/kotlin/kotlin-extensions.md)
- [Kotlin 函数式编程：lambda / 高阶函数 / 集合操作](/language/kotlin/kotlin-functional.md)
- [Kotlin 委托：by lazy / by viewModels / 属性委托](/language/kotlin/kotlin-delegation.md)
- [面向 Android 的 Java 核心回顾](/language/java/java-basics.md)
- [Java 集合框架（HashMap / ArrayList / ConcurrentHashMap 源码剖析）](/language/java/collections/)
- [Java 并发基础：线程 / volatile / synchronized / 死锁](/language/java/concurrent/)
- [JVM 内存区域与内存溢出](/language/java/jvm/JVM内存区域与内存溢出.md)
- [JVM 类加载机制](/language/java/jvm/JVM类加载机制.md)
- [垃圾回收算法](/language/java/jvm/垃圾回收算法.md)
- [C++ 基础与 JNI / NDK 开发](/language/cpp/cpp-basics.md)
- [C++ 内存管理：智能指针 / RAII](/language/cpp/cpp-memory.md)
- [设计模式汇总（12 篇精讲，结合 Android 源码实例）](/language/design-pattern/)

### Android 核心
- [Activity 生命周期与启动模式](/android/activity/activity-lifecycle.md)
- [Activity 启动流程源码分析](/android/activity/activity-launch-process.md)
- [Activity Result API 与回调通信](/android/activity/activity-result-api.md)
- [配置变更与状态保存](/android/activity/activity-config-changes.md)
- [Service 详解：启动方式与绑定方式](/android/service/service-basics.md)
- [AIDL 跨进程通信](/android/service/aidl.md)
- [BroadcastReceiver 详解](/android/broadcast/broadcast-basics.md)
- [ContentProvider 详解](/android/content-provider/content-provider-basics.md)
- [Fragment 生命周期与通信](/android/fragment/fragment-basics.md)
- [Fragment 通信方式全解](/android/fragment/fragment-communication.md)
- [Intent 详解：显式与隐式](/android/intent/intent-basics.md)
- [IntentFilter 匹配规则](/android/intent/intent-filter.md)
- [Application 详解与全局初始化](/android/app/application-basics.md)
- [App 启动流程：从点击图标到首帧](/android/app/app-launch-process.md)
- [Manifest 清单文件详解](/android/app/manifest-guide.md)
- [资源系统详解](/android/resource/resource-basics.md)
- [资源限定符与多语言适配](/android/resource/resource-qualifiers.md)
- [主题与样式机制](/android/resource/theme-style.md)
- [Drawable 全面指南](/android/resource/drawable-guide.md)
- [权限机制与运行时权限详解](/android/permission/permission-basics.md)
- [权限申请最佳实践与常见问题](/android/permission/permission-practice.md)
- [通知机制详解：渠道、构建与样式](/android/notification/notification-basics.md)
- [PendingIntent 详解](/android/notification/pendingintent.md)
- [SharedPreferences 深度剖析](/android/storage/sharedpreferences-deep.md)
- [SQLite 深入指南](/android/storage/sqlite-guide.md)
- [分区存储适配实战](/android/storage/scoped-storage.md)
- [Android 进程与保活](/android/process/process-lifecycle.md)
- [多进程实践与原理](/android/process/multi-process.md)
- [Context 详解](/android/context/context-overview.md)

### UI 与渲染
- [View 绘制流程详解](/ui/view/view-draw-process.md)
- [MeasureSpec 完全解析](/ui/view/measurespec.md)
- [RecyclerView 使用指南与源码解析](/ui/view/recyclerview-guide.md)
- [WebView 使用与优化](/ui/view/webview-guide.md)
- [ViewPager2 使用指南](/ui/view/viewpager2-guide.md)
- [事件分发机制详解](/ui/event/event-dispatch.md)
- [输入系统：从触摸事件到应用分发](/ui/event/input-system.md)
- [多指触控与手势识别](/ui/event/multitouch.md)
- [自定义 View 实战](/ui/custom-view/custom-view-guide.md)
- [Canvas / Path 绘图详解](/ui/custom-view/canvas-path.md)
- [自定义属性与 XML 解析](/ui/custom-view/custom-attributes.md)
- [属性动画机制](/ui/animation/property-animation.md)
- [补间动画与场景过渡动画](/ui/animation/tween-animation.md)
- [布局优化与屏幕适配](/ui/layout/layout-optimization.md)
- [ConstraintLayout 完全指南](/ui/layout/constraintlayout-guide.md)
- [Window 机制详解](/ui/window/window-mechanism.md)
- [系统栏适配与沉浸式](/ui/window/systembar-adaptation.md)
- [Bitmap 详解与图片压缩](/ui/bitmap/bitmap-guide.md)
- [Bitmap 压缩与内存优化](/ui/bitmap/bitmap-compress.md)
- [Glide 图片加载源码解析](/ui/bitmap/glide-source.md)
- [渲染原理：CPU 到 GPU 的绘制管线](/ui/render/render-principle.md)
- [Choreographer 与帧同步](/ui/render/choreographer.md)
- [硬件加速渲染原理](/ui/render/hardware-acceleration.md)
- [SurfaceView 与 TextureView](/ui/render/surfaceview-textureview.md)

### Jetpack 全家桶
- [Jetpack Compose 入门到进阶](/jetpack/compose/compose-basics.md)
- [Compose 状态管理与重组机制](/jetpack/compose/compose-state.md)
- [Compose 布局系统：测量与约束](/jetpack/compose/compose-layout.md)
- [Compose Runtime 原理：重组与快照](/jetpack/compose/compose-runtime.md)
- [Lifecycle / ViewModel / LiveData](/jetpack/lifecycle-viewmodel/lifecycle.md)
- [ViewModel 源码解析](/jetpack/lifecycle-viewmodel/viewmodel-source.md)
- [SavedStateHandle 状态保存](/jetpack/lifecycle-viewmodel/savedstate.md)
- [Room 数据库详解](/jetpack/room-datastore/room-guide.md)
- [Room 进阶：迁移 / 关系 / 协程](/jetpack/room-datastore/room-advanced.md)
- [DataStore 使用指南](/jetpack/room-datastore/datastore-guide.md)
- [Paging 3 分页加载](/jetpack/paging-navigation/paging3.md)
- [Navigation 导航组件](/jetpack/paging-navigation/navigation.md)
- [WorkManager 后台任务](/jetpack/workmanager-hilt/workmanager.md)
- [Hilt 依赖注入](/jetpack/workmanager-hilt/hilt.md)
- [Hilt 进阶：自定义绑定 / 限定符](/jetpack/workmanager-hilt/hilt-advanced.md)
- [ActivityResult API 详解](/jetpack/activity/activity-result.md)
- [Edge-to-Edge 全面屏适配](/jetpack/activity/activity-edge2edge.md)
- [AppCompat 兼容原理](/jetpack/appcompat/appcompat-principle.md)
- [BiometricPrompt 生物识别](/jetpack/biometric/biometric-guide.md)
- [Collection 集合库详解](/jetpack/collection/collection-guide.md)
- [Core KTX 扩展库](/jetpack/core/core-ktx.md)
- [App Startup 与 SplashScreen](/jetpack/core/startup-splashscreen.md)
- [FragmentManager 源码解析](/jetpack/fragment/fragment-source.md)

### 网络与异步
- [计算机网络体系（OSI / TCP-IP）](/network/osi-tcpip.md)
- [TCP 与 UDP 详解](/network/tcp-udp.md)
- [OkHttp / Retrofit 详解](/network/http/retrofit-okhttp.md)
- [OkHttp 源码解析：Dispatcher / 拦截器 / 连接池](/network/http/okhttp-source.md)
- [Retrofit 源码解析：动态代理 / CallAdapter / Converter](/network/http/retrofit-source.md)
- [WebSocket 原理与 OkHttp 实现](/network/http/websocket.md)
- [Handler 消息机制源码解析](/network/handler/handler-source.md)
- [Handler 同步屏障与异步消息](/network/handler/sync-barrier.md)
- [协程 Flow 进阶](/network/coroutine/flow-advanced.md)
- [协程原理：挂起恢复与状态机](/network/coroutine/coroutine-principle.md)
- [结构化并发：Scope / SupervisorJob / async-await](/network/coroutine/structured-concurrency.md)
- [线程池详解](/network/thread/thread-pool.md)
- [锁机制详解](/network/thread/locks.md)
- [并发编程实践：中断 / ThreadLocal / 死锁](/network/thread/concurrency-practice.md)

### 进阶实战
- [架构设计演进（MVC / MVP / MVVM / MVI）](/advanced/architecture/architecture-evolution.md)
- [组件化与模块化实践](/advanced/modular/modularization-practice.md)
- [路由框架设计与实现](/advanced/modular/router-design.md)
- [插件化原理](/advanced/plugin/plugin-principle.md)
- [Android 启动优化实践](/advanced/performance/startup-optimization.md)
- [内存优化与内存泄漏排查](/advanced/performance/memory-optimization.md)
- [卡顿优化实战](/advanced/performance/jank-optimization.md)
- [APK 体积优化](/advanced/performance/apk-size-optimization.md)
- [网络优化实践：HTTPDNS / 连接复用 / 弱网](/advanced/performance/network-optimization.md)
- [耗电优化：Doze / WakeLock / WorkManager](/advanced/performance/battery-optimization.md)
- [LeakCanary 源码分析](/advanced/performance/leakcanary-analysis.md)
- [EventBus 源码分析](/advanced/architecture/eventbus-analysis.md)
- [崩溃监控与 ANR 治理](/advanced/stability/crash-monitoring.md)
- [APM 监控体系：崩溃 / 卡顿 / ANR 采集与上报](/advanced/stability/apm-monitoring.md)
- [日志系统设计：分级 / 回捞 / 链路追踪](/advanced/stability/log-system.md)
- [ExoPlayer 架构深度解析](/advanced/multimedia/exoplayer-deep.md)
- [MediaCodec 硬编硬解与 FFmpeg](/advanced/multimedia/mediacodec-ffmpeg.md)
- [Camera2 拍照流程与原理](/advanced/multimedia/camera-capture.md)
- [跨端方案选型：Flutter / RN / Compose Multiplatform](/advanced/cross-platform/cross-platform-overview.md)

### 系统原理
- [Binder 跨进程通信机制详解](/system/binder/binder-mechanism.md)
- [Binder 驱动源码剖析：一次拷贝 / binder_ioctl](/system/binder/binder-driver.md)
- [AIDL 深入解析](/system/binder/aidl-deep.md)
- [Parcelable 序列化](/system/binder/parcelable.md)
- [AMS 与 Activity 启动](/system/ams-wms/ams-activity-launch.md)
- [PMS 包管理服务解析](/system/ams-wms/pms-package-manager.md)
- [WMS 窗口管理](/system/ams-wms/wms-principle.md)
- [触摸事件分发：InputManagerService 全流程](/system/ams-wms/wms-touch-dispatch.md)
- [系统启动流程](/system/boot/system-boot.md)
- [Zygote 进程深度解析](/system/boot/zygote-deep.md)
- [APK 打包流程与签名机制](/system/apk/apk-build-process.md)
- [APK 签名机制：v1-v4 / 密钥轮换 / 多渠道](/system/apk/signature-verify.md)
- [APK 安装流程与原理](/system/apk/apk-install-process.md)
- [APK 加固与安全防护](/system/apk/apk-reinforcement.md)
- [ART 运行时与 GC](/system/art/art-runtime.md)
- [ART 编译模式：AOT / JIT / Profile 引导](/system/art/art-compilation.md)
- [类加载器与双亲委托](/system/art/classloader.md)
- [Linux 内存管理与 LMKD 杀进程](/system/os/linux-memory.md)

### 工程实践
- [Gradle 构建系统与 AGP](/engineering/gradle/gradle-basics.md)
- [Gradle 依赖项配置](/engineering/gradle/dependency-config.md)
- [ProGuard 混淆配置](/engineering/gradle/proguard-guide.md)
- [自定义 Gradle 插件：Transform + ASM](/engineering/gradle/custom-gradle-plugin.md)
- [Git 工作流与最佳实践](/engineering/git/git-workflow.md)
- [Git Rebase 工作流：交互式变基 / cherry-pick](/engineering/git/git-rebase-workflow.md)
- [Git 常用命令速查](/engineering/git/git-cheatsheet.md)
- [Git 分支模型与工作流](/engineering/git/git-branch-model.md)
- [GitHub Actions CI/CD](/engineering/cicd/github-actions.md)
- [Jenkins Pipeline 构建 Android 流水线](/engineering/cicd/jenkins-pipeline.md)
- [灰度发布实践：分组 / 开关 / 回滚](/engineering/cicd/gray-release.md)
- [单元测试实战](/engineering/testing/unit-testing.md)
- [MockK 单元测试框架](/engineering/testing/mockk-testing.md)
- [UI 测试实战](/engineering/testing/ui-testing.md)
- [测试金字塔与覆盖率门禁](/engineering/testing/test-pyramid.md)

### 面试与项目
- [面试基础篇（Java/Kotlin、四大组件、View）](/interview/basics.md)
- [面试进阶篇（性能、架构、组件化）](/interview/advanced.md)
- [面试源码篇（Handler、Binder、启动流程）](/interview/source-code.md)
- [面试准备计划](/interview/interview-plan.md)
- [简历与项目经验建议](/interview/resume-guide.md)
- [大厂面试经验实录（阿里 / 美团 / 网易）](/interview/company-experience.md)
- [行为面试题与回答套路](/interview/behavior-questions.md)
- [从零搭建完整 App（Kotlin + Compose + MVVM）](/projects/from-scratch.md)
- [开源项目源码解析](/projects/open-source-analysis.md)

### 算法与数据结构
- [算法刷题指南](/language/algorithm/algorithm-guide.md)
- [数据结构（Java 实现）](/language/algorithm/data-structure.md)
- [十大排序算法总结](/language/algorithm/sort-algorithm.md)
- [LeetCode Top 100 精讲](/language/algorithm/leetcode-top100.md)
- [剑指 Offer 经典题解析](/language/algorithm/offer-classic.md)

## 关于本站

WikiAndroid 是一份面向 **Android 开发者**与**求职者**的开源知识库，从面试复习出发，逐步扩展为覆盖 Android 核心技术、工程实践与前沿技术的系统化学习指南。

- [项目介绍](/about/intro.md)
- [贡献指南](/about/contribution-guideline.md)
- [常见问题](/about/faq.md)

> 如果觉得内容有帮助，欢迎在 [GitHub](https://github.com/galifans/wikiandroid) 上点个 Star，这是对我们最大的鼓励！
