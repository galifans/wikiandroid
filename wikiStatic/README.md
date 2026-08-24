# 📦 wikiStatic 静态资料库

> WikiAndroid 的**静态资料层**：存放可直接浏览 / 下载的 md 学习资料与书籍 PDF。
> 与 [wikiandroid.com](https://wikiandroid.com) 在线站点**同源**，目录结构是 GitHub 首页 README 与网站板块的内容架构真相源。

## 目录结构

> 由 `scripts/sync-wikistatic.ps1` 从 `src/` 自动同步，目录树自动刷新，请勿手工编辑标记区间。

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

- 内容以 `src/` 为创作源，修改后运行 `npm run sync:static`（即 `scripts/sync-wikistatic.ps1`）同步到本目录（自动刷新目录树）
- `books/` 仅存放 PDF 与索引文件，新增书籍流程见 [books/README.md](books/README.md)
- 禁止手工编辑目录树标记区间（`<!-- WIKISTATIC_TREE:BEGIN/END -->`）




