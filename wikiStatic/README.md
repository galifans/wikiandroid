# 📦 wikiStatic 静态资料库

> WikiAndroid 的**静态资料层**：存放可直接浏览 / 下载的 md 学习资料与书籍 PDF。
> 与 [wikiandroid.com](https://wikiandroid.com) 在线站点**同源**，目录结构是 GitHub 首页 README 与网站板块的内容架构真相源。

## 目录结构

> 由 `scripts/sync-wikistatic.mjs` 从 `src/` 自动同步，目录树自动刷新，请勿手工编辑标记区间。

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
│   │   ├── eventbus-analysis.md
│   │   └── repository-pattern.md
│   ├── cross-platform/
│   │   ├── README.md
│   │   └── cross-platform-overview.md
│   ├── modular/
│   │   ├── README.md
│   │   ├── modularization-practice.md
│   │   └── router-design.md
│   ├── multimedia/
│   │   ├── README.md
│   │   ├── exoplayer-deep.md
│   │   ├── mediacodec-ffmpeg.md
│   │   └── multimedia-basics.md
│   ├── performance/
│   │   ├── README.md
│   │   ├── apk-size-optimization.md
│   │   ├── battery-optimization.md
│   │   ├── jank-optimization.md
│   │   ├── leakcanary-analysis.md
│   │   ├── memory-optimization.md
│   │   ├── network-optimization.md
│   │   └── startup-optimization.md
│   ├── plugin/
│   │   ├── README.md
│   │   ├── hook-tech.md
│   │   ├── hotfix-comparison.md
│   │   └── plugin-principle.md
│   └── stability/
│       ├── README.md
│       ├── anr-guide.md
│       ├── apm-monitoring.md
│       ├── crash-monitoring.md
│       └── log-system.md
├── android/
│   ├── README.md
│   ├── activity/
│   │   ├── README.md
│   │   ├── activity-launch-process.md
│   │   ├── activity-lifecycle.md
│   │   └── task-stack.md
│   ├── app/
│   │   ├── README.md
│   │   ├── app-launch-process.md
│   │   ├── application-basics.md
│   │   └── manifest-guide.md
│   ├── broadcast/
│   │   ├── README.md
│   │   ├── broadcast-basics.md
│   │   └── register-comparison.md
│   ├── content-provider/
│   │   ├── README.md
│   │   └── content-provider-basics.md
│   ├── context/
│   │   ├── README.md
│   │   └── context-overview.md
│   ├── fragment/
│   │   ├── README.md
│   │   ├── fragment-basics.md
│   │   └── fragment-pitfalls.md
│   ├── intent/
│   │   ├── README.md
│   │   ├── intent-basics.md
│   │   └── intent-filter.md
│   ├── notification/
│   │   ├── README.md
│   │   ├── notification-basics.md
│   │   └── pendingintent.md
│   ├── permission/
│   │   ├── README.md
│   │   ├── permission-basics.md
│   │   └── permission-practice.md
│   ├── process/
│   │   ├── README.md
│   │   └── process-lifecycle.md
│   ├── resource/
│   │   ├── README.md
│   │   ├── resource-basics.md
│   │   └── resource-qualifiers.md
│   ├── service/
│   │   ├── README.md
│   │   ├── aidl.md
│   │   ├── foreground-service.md
│   │   └── service-basics.md
│   └── storage/
│       ├── README.md
│       ├── sharedpreferences-deep.md
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
│   │   ├── github-actions.md
│   │   ├── gray-release.md
│   │   └── jenkins-pipeline.md
│   ├── git/
│   │   ├── README.md
│   │   ├── git-cheatsheet.md
│   │   ├── git-rebase-workflow.md
│   │   └── git-workflow.md
│   ├── gradle/
│   │   ├── README.md
│   │   ├── custom-gradle-plugin.md
│   │   ├── dependency-config.md
│   │   ├── gradle-basics.md
│   │   ├── proguard-guide.md
│   │   └── version-catalog.md
│   └── testing/
│       ├── README.md
│       ├── mockk-testing.md
│       ├── test-pyramid.md
│       ├── ui-testing.md
│       └── unit-testing.md
├── interview/
│   ├── README.md
│   ├── experience/
│   ├── advanced.md
│   ├── android-knowledge-summary.md
│   ├── basics.md
│   ├── company-experience.md
│   ├── interview-plan.md
│   ├── resume-guide.md
│   └── source-code.md
├── jetpack/
│   ├── README.md
│   ├── compose/
│   │   ├── README.md
│   │   ├── compose-animation.md
│   │   ├── compose-basics.md
│   │   ├── compose-interop.md
│   │   ├── compose-layout.md
│   │   ├── compose-performance.md
│   │   └── compose-state.md
│   ├── lifecycle-viewmodel/
│   │   ├── README.md
│   │   ├── lifecycle.md
│   │   ├── savedstate.md
│   │   ├── viewmodel-livedata.md
│   │   └── viewmodel-source.md
│   ├── paging-navigation/
│   │   ├── README.md
│   │   ├── navigation-advanced.md
│   │   ├── navigation.md
│   │   └── paging3.md
│   ├── room-datastore/
│   │   ├── README.md
│   │   ├── datastore-guide.md
│   │   ├── room-advanced.md
│   │   └── room-guide.md
│   └── workmanager-hilt/
│       ├── README.md
│       ├── hilt-advanced.md
│       ├── hilt.md
│       └── workmanager.md
├── language/
│   ├── README.md
│   ├── algorithm/
│   │   ├── README.md
│   │   ├── coding-guide/
│   │   ├── data-structure/
│   │   ├── leetcode/
│   │   ├── lookup/
│   │   ├── sort/
│   │   ├── sword-offer/
│   │   ├── algorithm-guide.md
│   │   ├── binary-tree-traversal.md
│   │   ├── coder-interview-guide.md
│   │   ├── data-structure.md
│   │   ├── high-frequency-algorithms.md
│   │   ├── leetcode-classic.md
│   │   ├── leetcode-top100.md
│   │   ├── offer-classic.md
│   │   ├── search-algorithm.md
│   │   └── sort-algorithm.md
│   ├── cpp/
│   │   ├── README.md
│   │   ├── cpp-basics.md
│   │   ├── cpp-memory.md
│   │   └── jni-ndk.md
│   ├── design-pattern/
│   │   ├── README.md
│   │   ├── 策略模式.md
│   │   ├── 常见的面向对象设计原则.md
│   │   ├── 代理模式.md
│   │   ├── 单例模式.md
│   │   ├── 观察者模式.md
│   │   ├── 简单工厂.md
│   │   ├── 设计模式汇总.md
│   │   ├── 适配器模式.md
│   │   ├── 外观模式.md
│   │   ├── 原型模式.md
│   │   ├── 责任链模式.md
│   │   └── Builder模式.md
│   ├── java/
│   │   ├── README.md
│   │   ├── basics/
│   │   │   ├── README.md
│   │   │   ├── collection-overview.md
│   │   │   ├── java-advanced.md
│   │   │   ├── java-basics.md
│   │   │   └── java-exception.md
│   │   ├── collections/
│   │   │   ├── README.md
│   │   │   ├── 反射机制.md
│   │   │   ├── 集合框架总览.md
│   │   │   ├── ArrayList源码剖析.md
│   │   │   ├── HashMap源码剖析.md
│   │   │   ├── Hashtable与ConcurrentHashMap.md
│   │   │   ├── Java中的内存泄漏.md
│   │   │   ├── LinkedHashMap源码剖析.md
│   │   │   ├── LinkedList源码剖析.md
│   │   │   ├── String源码分析.md
│   │   │   └── Vector源码剖析.md
│   │   ├── concurrent/
│   │   │   ├── README.md
│   │   │   ├── 多线程安全使用集合.md
│   │   │   ├── 多线程基础.md
│   │   │   ├── 生产者消费者问题.md
│   │   │   ├── 守护线程与线程阻塞.md
│   │   │   ├── 死锁.md
│   │   │   ├── 线程中断与终止.md
│   │   │   ├── NIO与IO.md
│   │   │   ├── synchronized与可重入锁.md
│   │   │   ├── volatile与内存可见性.md
│   │   │   └── wait-notify线程通信.md
│   │   ├── jvm/
│   │   │   ├── README.md
│   │   │   ├── 泛型与类型擦除.md
│   │   │   ├── 垃圾回收算法.md
│   │   │   ├── JVM类加载机制.md
│   │   │   └── JVM内存区域与内存溢出.md
│   │   ├── java-basics.md
│   │   ├── java-collections.md
│   │   └── java-concurrency.md
│   └── kotlin/
│       ├── README.md
│       ├── kotlin-basics.md
│       ├── kotlin-coroutines.md
│       ├── kotlin-delegation.md
│       ├── kotlin-extensions.md
│       ├── kotlin-functional.md
│       └── kotlin-generics.md
├── network/
│   ├── README.md
│   ├── coroutine/
│   │   ├── README.md
│   │   ├── coroutine-principle.md
│   │   ├── flow-advanced.md
│   │   ├── rxjava-operators.md
│   │   └── structured-concurrency.md
│   ├── handler/
│   │   ├── README.md
│   │   ├── handler-source.md
│   │   ├── handlerthread.md
│   │   └── sync-barrier.md
│   ├── http/
│   │   ├── README.md
│   │   ├── http-protocol.md
│   │   ├── okhttp-interceptor.md
│   │   ├── okhttp-source.md
│   │   ├── retrofit-okhttp.md
│   │   └── retrofit-source.md
│   ├── thread/
│   │   ├── README.md
│   │   ├── asynctask-intentservice.md
│   │   ├── concurrency-practice.md
│   │   ├── concurrency-tools.md
│   │   ├── locks.md
│   │   └── thread-pool.md
│   ├── osi-tcpip.md
│   ├── socket.md
│   └── tcp-udp.md
├── projects/
│   ├── README.md
│   ├── from-scratch.md
│   └── open-source-analysis.md
├── reading-notes/
│   ├── README.md
│   ├── 《深入理解java虚拟机》第12章.md
│   ├── 《Android开发艺术探索》第八章笔记.md
│   ├── 《Android开发艺术探索》第二章笔记.md
│   ├── 《Android开发艺术探索》第三章笔记.md
│   ├── 《Android开发艺术探索》第十五章笔记.md
│   ├── 《Android开发艺术探索》第四章笔记.md
│   ├── 《Android开发艺术探索》第一章笔记.md
│   ├── 《APP研发录》第1章读书笔记.md
│   ├── 《APP研发录》第2章读书笔记.md
│   ├── 《Java编程思想》第二章读书笔记.md
│   └── 《Java编程思想》第一章读书笔记.md
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
│   │   ├── pms-package-manager.md
│   │   ├── wms-principle.md
│   │   └── wms-touch-dispatch.md
│   ├── apk/
│   │   ├── README.md
│   │   ├── apk-build-process.md
│   │   ├── multi-channel.md
│   │   └── signature-verify.md
│   ├── art/
│   │   ├── README.md
│   │   ├── art-compilation.md
│   │   ├── art-gc.md
│   │   ├── art-runtime.md
│   │   ├── classloader.md
│   │   └── dex-format.md
│   ├── binder/
│   │   ├── README.md
│   │   ├── aidl-deep.md
│   │   ├── binder-driver.md
│   │   ├── binder-mechanism.md
│   │   ├── ipc-comparison.md
│   │   └── parcelable.md
│   ├── boot/
│   │   ├── README.md
│   │   ├── app-launch.md
│   │   ├── system-boot.md
│   │   └── zygote-deep.md
│   └── os/
│       ├── README.md
│       ├── linux-memory.md
│       ├── os-core.md
│       └── thread-sync-ipc.md
└── ui/
    ├── README.md
    ├── animation/
    │   ├── README.md
    │   ├── property-animation.md
    │   ├── scene-transition.md
    │   └── tween-animation.md
    ├── bitmap/
    │   ├── README.md
    │   ├── bitmap-guide.md
    │   └── glide-source.md
    ├── custom-view/
    │   ├── README.md
    │   ├── canvas-path.md
    │   ├── custom-view-guide.md
    │   ├── custom-viewgroup.md
    │   └── touch-helper.md
    ├── event/
    │   ├── README.md
    │   ├── conflict-solution.md
    │   ├── event-dispatch.md
    │   └── input-system.md
    ├── layout/
    │   ├── README.md
    │   ├── layout-optimization.md
    │   └── screen-adaptation.md
    ├── render/
    │   ├── README.md
    │   └── render-principle.md
    ├── view/
    │   ├── README.md
    │   ├── measurespec.md
    │   ├── recyclerview-guide.md
    │   ├── recyclerview-source.md
    │   ├── view-draw-process.md
    │   ├── view-viewgroup.md
    │   └── webview-guide.md
    └── window/
        ├── README.md
        ├── window-mechanism.md
        └── windowmanager-deep.md
```
<!-- WIKISTATIC_TREE:END -->

## 目录说明

| 目录 | 说明 |
| --- | --- |
| `books/` | 📚 书籍 PDF 资源，点击直接下载，索引见 [books/README.md](books/README.md) |
| `roadmap/` `language/` `android/` `ui/` `jetpack/` `network/` `advanced/` `system/` `engineering/` `interview/` `projects/` `about/` | 📄 各知识模块 md 资料（与 wikiandroid.com 板块一一对应） |

## 使用方式

1. **在线学习**：访问 [wikiandroid.com](https://wikiandroid.com)（全文搜索 / 侧边栏 / 明暗主题，体验最佳）
2. **GitHub 阅读**：仓库根 [README.md](../README.md) 即学习索引
3. **下载资料**：点击目录树中的任意 md / PDF 即可直接下载

## 维护规则

- 内容以 `src/` 为创作源，修改后运行 `npm run sync:static`（即 `scripts/sync-wikistatic.mjs`）同步到本目录（自动刷新目录树）
- `books/` 仅存放 PDF 与索引文件，新增书籍流程见 [books/README.md](books/README.md)
- 禁止手工编辑目录树标记区间（`<!-- WIKISTATIC_TREE:BEGIN/END -->`）




