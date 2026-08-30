# WikiAndroid 站点架构文档

> **本文档是全站结构与导航的「权威索引」（Single Source of Truth）。**
> 对站点做任何结构性修改（新增 / 移动 / 删除模块或文章、调整导航、修改首页）之前，
> **必须先阅读本文档**；修改完成后，**必须同步更新本文档**，确保与代码保持一致。
> 代码目录结构是「实现真相」，本文档是「意图索引」，两者靠 `agent.md` 中的维护规则保证同步。

---

## 1. 站点概览

| 项目 | 值 |
| --- | --- |
| 站点名称 | WikiAndroid |
| 域名 | https://wikiandroid.com（备用：https://wikiandroid.pages.dev） |
| 内容语言 | 简体中文（zh-CN） |
| 技术栈 | VuePress 2.0.0-rc.30 + vuepress-theme-hope 2.0.0-rc.107 + Vite Bundler |
| 仓库 | https://github.com/galifans/wikiandroid（分支 main） |
| 部署方式 | Cloudflare Pages：`git push main` 自动触发构建部署 |
| 构建命令 | `npm run build` → 输出目录 `src/.vuepress/dist` |
| 本地预览 | `npm run dev` → http://localhost:8080 |
| 版权署名 | Copyright  2026 WikiAndroid（MIT License） |
| 品牌色 | Android 绿渐变 `#3DDC84 → #0B7A3B`，图标为白色 W 字母 |

---

## 2. 目录结构总览（代码即真相）

```
galifans_vibe_coding/
├── architecture.md              # 本文档（站点结构权威索引）
├── PROGRESS.md                  # 项目进展与记忆（进展时间线 / 文章记录 / 踩坑经验）
├── agent.md                     # Agent 行为约束
├── README.md                    # GitHub 首页（与 wikiandroid.com 同源：内容板块 + 书籍索引 + wikiStatic 目录树）
├── package.json                 # 依赖与脚本（dev / build / clean / sync:static）
├── .gitignore                   # 忽略 node_modules / .cache / .temp / dist
├── books/                       # 经典书籍库（16 大方向精选 PDF，GitHub 直接下载，不发布到网站）
│   └── README.md                # 经典书籍索引（Android / C++ / Java / 大数据 …）
├── scripts/
│   ├── gen-icons.ps1            # 图标生成脚本（favicon.svg 同款设计 → PNG）
│   ├── prepare-public.mjs      # 构建前复制 wikiStatic/books/ → src/.vuepress/public/books/（网站直链下载）
│   └── sync-wikistatic.mjs     # wikiStatic 同步脚本（md 同步 + README 目录树自动刷新，跨平台 Node）
├── wikiStatic/                  # 静态资料库（GitHub 直接浏览/下载，内容与 src/ 同源，详见第 8 节）
│   ├── README.md                # wikiStatic 总索引（含自动生成的目录树）
│   ├── books/                   # 网站直链书籍（仅收录 <25MiB 小体积 PDF；来源 TIM168/technical_books）
│   │   ├── README.md            # 书籍索引（算法 / Java / 网络 / 数据库 …）
│   │   ├── algorithm/ java/ network/ database/              # 已收录 PDF
│   │   └── algorithm/ database/ java/ network/             # 仅收录已入库的小体积 PDF
│   └── <模块目录>/              # 各知识模块 md 镜像（roadmap / language / android / ui / jetpack / network / advanced / system / engineering / interview / projects / about）
└── src/                         # 站点源码根（VuePress docsDir）
    ├── README.md                # 首页（hero + 12 张功能卡片 + 精选文章）
    ├── .vuepress/               # 站点配置目录
    │   ├── config.ts            # 站点基础配置（title/description/head/favicon）
    │   ├── theme.ts             # 主题配置（author/footer/copyright/plugins）
    │   ├── navbar.ts            # 顶部导航栏（唯一手工维护的导航源）
    │   ├── sidebar.ts           # 侧边栏（全部模块用 "structure" 自动生成）
    │   └── public/              # 静态资源（logo.svg / favicon.svg / 图标 PNG）
    ├── roadmap/                 # 学习路线
    ├── language/                # 语言基础（kotlin / java / algorithm）
    ├── android/                 # Android 核心（四大组件 + Fragment + Intent + 应用启动 + 资源/权限/通知 + 存储）
    ├── ui/                      # UI 与渲染（view / event / custom-view / animation / layout / render）
    ├── jetpack/                 # Jetpack（lifecycle-viewmodel / room-datastore / paging-navigation / workmanager-hilt / compose）
    ├── network/                 # 网络与异步（http / handler / coroutine / thread）
    ├── advanced/                # 进阶实战（architecture / modular / plugin / performance / stability / multimedia / cross-platform）
    ├── system/                  # 系统原理（binder / ams-wms / boot / apk / art / os）
    ├── engineering/             # 工程实践（gradle / git / cicd / testing）
    ├── interview/               # 面试指南（7 篇平铺文章）
    ├── projects/                # 实战项目
    ├── books/                   # 书籍资源板块页（小书网站直链 wikiStatic/books/ + 经典大书 GitHub books/）
    └── about/                   # 关于本站（intro / contribution-guideline / faq）
```

**关键约定**：每个模块目录下都有一个 `README.md`，既是该模块的**索引页**（列出文章列表），
也是侧边栏 `structure` 自动生成时的**目录节点**。

---

## 3. 导航结构（navbar）

> 来源：`src/.vuepress/navbar.ts`（**唯一手工维护的导航源**，侧边栏无需手工维护）。

| # | 导航文案 | 路径 | 子项 | 说明 |
| --- | --- | --- | --- | --- |
| 1 | 首页 | `/` | — | 首页 |
| 2 | 学习路线 | `/roadmap/` | — | 4 条学习路线 |
| 3 | 语言基础 | — | Kotlin / Java / C++ 知识点 / 设计模式 / 数据结构与算法 | 下拉菜单 |
| 4 | Android 核心 | — | Activity / Service / BroadcastReceiver / ContentProvider / Fragment / Intent / Application / 资源系统 / 权限系统 / 通知机制 / Context / 进程 / 数据存储 | 下拉菜单 |
| 5 | UI 与渲染 | — | View 体系 / 事件分发机制 / 自定义 View / Bitmap / Window / 动画机制 / 布局优化 / 渲染原理 | 下拉菜单 |
| 6 | Jetpack | — | Jetpack Compose / Lifecycle/ViewModel / Room/DataStore / Paging/Navigation / WorkManager/Hilt | 下拉菜单 |
| 7 | 网络与异步 | — | 网络与协议 / Handler 消息机制 / 协程 Flow/RxJava / 线程池与并发 / 计算机网络体系 / Socket 编程基础 / TCP 与 UDP 详解 | 下拉菜单 |
| 8 | 进阶实战 | — | 架构设计 / 组件化与模块化 / 插件化与热修复 / 性能优化 / 稳定性保障 / 音视频开发 / 跨端方案 | 下拉菜单 |
| 9 | 系统原理 | — | Binder 机制 / AMS/WMS / 系统与应用启动流程 / APK 打包与签名 / ART/DEX/类加载 / 操作系统 | 下拉菜单 |
| 10 | 工程实践 | — | Gradle 构建 / Git 与版本管理 / CI/CD / 测试体系 | 下拉菜单 |
| 11 | 面试指南 | `/interview/` | — | 平铺 8 篇文章 |
| 12 | 实战项目 | `/projects/` | — | 平铺文章 |
| 13 | 书籍资源 | `/books/` | — | 分类索引 + 直链下载（PDF 实体存 `wikiStatic/books/`） |
| 14 | GitHub | https://github.com/galifans/wikiandroid | — | 外链 |

> 注：`/about/` 不在导航栏中，通过首页「关于本站」功能卡片与链接访问。

---

## 4. 侧边栏规则（sidebar）

来源：`src/.vuepress/sidebar.ts`。所有模块一律配置为 `"structure"`，即**按目录结构自动生成**：

```
"/roadmap/": "structure",
"/language/": "structure",
...（每个顶层模块一行）
"/": false,          // 首页不显示侧边栏
```

**新增文章后无需修改 sidebar.ts**，只要放在对应模块目录下即可自动出现在侧边栏。
模块下的 `README.md` 充当侧边栏的父节点，其 frontmatter 控制显示与排序：

| frontmatter 字段 | 作用 |
| --- | --- |
| `icon` | 分组图标 |
| `title` | 分组标题（与 navbar 下拉文案保持一致） |
| `dir.text` | 分组标题（显式指定，与 `title` 同值） |
| `dir.order` | 分组在侧边栏中的顺序（**必须与 navbar.ts 下拉顺序严格一致**） |
| `shortTitle: 概览` | 分组展开后第一个子级（README 自身链接）显示为「概览」 |

> 注意：分组的顺序由 `dir.order` 控制（而非顶层 `order`）；`shortTitle` 同时会作用于面包屑（显示为「概览」）。
>
> 侧边栏样式（`src/.vuepress/styles/index.scss`）规则：
> - **箭头仅限有内容**：子级链接右侧的 `›` 小箭头（仿 Android 官方文档 chevron）只在 `:has(> ul)`（链接内嵌更深内容）时显示；叶子链接无箭头。站内更深内容实际是 `li > section` 嵌套分组（非 `a > ul`），自带主题 `.vp-arrow` chevron 作为展开指示
> - **层级区分**：大类（顶层分组标题）17px + `font-weight: 600` 加粗；嵌套子分组（如 Java 下的 Java 并发/集合）与子级链接同为 14px + 400 常规；**子级选中（active）后加粗 600**（`.vp-sidebar-link.active, .vp-sidebar-header.active`）
>   -  嵌套子分组字号规则**必须无条件固定 14px**（不能写 `:not(.active)`），否则选中后规则失效、字号回退到主题继承值 0.94rem≈15.04px 会"变大"；选中态用嵌套 `&.active { font-weight: 600 }` 只加粗、字号不变
> - **文字颜色**：默认 `var(--vp-c-text)`（亮色 #3c3c43 偏灰黑，暗色自动切换浅色）——不写死色值以适配暗色模式
> - **焦点规则**：`.vp-sidebar-header:focus:not(.active)` → 非当前板块点击有绿色反馈（accent 色 + accent-soft 背景），子级分组点击**不加粗**（加粗留给选中态）；当前板块按钮（路由类 `.active`）点击不叠绿，避免与子级 active 链接双重高亮——**任意场景仅当前页条目一个绿色**
> - **悬挂缩进**：`padding-left: calc(8px + 1em + 4px); text-indent: calc(-1em - 4px)` 保证长标题换行与图标对齐

---

## 5. 配置与插件清单

| 文件 | 职责 | 常见修改点 |
| --- | --- | --- |
| `src/.vuepress/config.ts` | 站点基础配置 | `title` / `description` / `head`（favicon、theme-color） |
| `src/.vuepress/theme.ts` | 主题配置 | `author.name`（决定版权行）、`footer`、`repo`、`plugins` |
| `src/.vuepress/navbar.ts` | 顶部导航 | 增删导航项 / 调整文案与顺序 |
| `src/.vuepress/sidebar.ts` | 侧边栏 | 新增顶层模块时添加一行 `"structure"` |
| `src/.vuepress/public/` | 静态资源 | `logo.svg`（首页 hero）、`favicon.svg` 等 |
| `package.json` | 依赖与脚本 | 一般不动，保持精确版本 |

**主题插件（theme.ts → plugins）**：slimsearch（本地搜索）、copyCode（复制按钮）、
photoSwipe（图片预览）、readingTime（阅读时间）、copyright（版权水印，`global: false`）。

---

## 6. 内容模块与文章状态

> ✓ = 已完成文章　待更新 = 待更新文章（README 中标记「（待更新）」，链接暂为死链，构建时仅产生 warning，不阻塞）

### 学习路线 `/roadmap/`
- ✓ android-roadmap.md（Android 学习路线 2026）
- ✓ kotlin-roadmap.md（Kotlin 学习路线）
- ✓ compose-roadmap.md（Jetpack Compose 学习路线）
- ✓ android-version-history.md（Android 版本演进与特性）

### 语言基础 `/language/`
| 子模块 | ✓ 已完成 |
| --- | --- |
| kotlin/ | kotlin-basics.md、kotlin-coroutines.md、kotlin-generics.md、kotlin-extensions.md、kotlin-functional.md、kotlin-delegation.md |
| java/ | java-basics.md、java-collections.md、java-concurrency.md（含 basics/ collections/ concurrent/ jvm/ 分组；jvm/ 含内存区域、类加载、垃圾回收、泛型、Java 内存模型与线程） |
| cpp/ | cpp-basics.md、cpp-memory.md、jni-ndk.md |
| design-pattern/ | 设计模式汇总 + 11 篇精讲（单例/代理/观察者/策略/责任链/适配器等） |
| algorithm/ | algorithm-guide.md、leetcode-top100.md、sort-algorithm.md、search-algorithm.md、binary-tree-traversal.md、high-frequency-algorithms.md、data-structure.md、coder-interview-guide.md、offer-classic.md 等 |

### Android 核心 `/android/`
| 子模块 | ✓ 已完成 |
| --- | --- |
| activity/ | activity-lifecycle.md、intent-filter.md、task-stack.md、activity-launch-process.md、activity-result-api.md、activity-config-changes.md |
| service/ | service-basics.md、foreground-service.md、aidl.md、service-threading.md |
| broadcast/ | broadcast-basics.md、register-comparison.md |
| content-provider/ | content-provider-basics.md、fileprovider.md、contentobserver.md |
| fragment/ | fragment-basics.md、fragment-pitfalls.md、fragment-communication.md |
| intent/ | intent-basics.md、intent-filter.md |
| app/ | application-basics.md、app-launch-process.md、manifest-guide.md |
| resource/ | resource-basics.md、resource-qualifiers.md、theme-style.md、drawable-guide.md |
| permission/ | permission-basics.md、permission-practice.md |
| notification/ | notification-basics.md、pendingintent.md |
| storage/ | storage-comparison.md、sharedpreferences-deep.md、sp-vs-datastore.md、sqlite-guide.md、scoped-storage.md |
| process/ | process-lifecycle.md、multi-process.md |
| context/ | context-overview.md |

### UI 与渲染 `/ui/`
| 子模块 | ✓ 已完成 |
| --- | --- |
| view/ | view-draw-process.md、view-viewgroup.md、measurespec.md、recyclerview-guide.md、recyclerview-source.md、webview-guide.md、viewpager2-guide.md |
| event/ | event-dispatch.md、view-sliding.md、conflict-solution.md、input-system.md、coordinate-system.md、multitouch.md |
| custom-view/ | custom-view-guide.md、custom-viewgroup.md、canvas-path.md、touch-helper.md、custom-attributes.md |
| animation/ | property-animation.md、tween-animation.md、scene-transition.md、interpolator-evaluator.md |
| layout/ | layout-optimization.md、screen-adaptation.md、constraintlayout-guide.md、layout-selection.md |
| window/ | window-mechanism.md、windowmanager-deep.md、systembar-adaptation.md、dialog-toast-popup.md |
| bitmap/ | bitmap-guide.md、glide-source.md、bitmap-compress.md |
| render/ | render-principle.md、choreographer.md、hardware-acceleration.md、surfaceview-textureview.md |

### Jetpack `/jetpack/`
| 子模块 | ✓ 已完成 |
| --- | --- |
| compose/ | compose-basics.md、compose-state.md、compose-performance.md、compose-layout.md、compose-animation.md、compose-interop.md、compose-runtime.md |
| lifecycle-viewmodel/ | viewmodel-livedata.md、savedstate.md、lifecycle.md、viewmodel-source.md |
| room-datastore/ | room-guide.md、room-advanced.md、datastore-guide.md |
| paging-navigation/ | paging3.md、navigation.md、navigation-advanced.md |
| workmanager-hilt/ | workmanager.md、hilt.md、hilt-advanced.md |
| activity/ | activity-result.md、activity-edge2edge.md |
| appcompat/ | appcompat-principle.md |
| biometric/ | biometric-guide.md |
| collection/ | collection-guide.md |
| core/ | core-ktx.md、startup-splashscreen.md |
| fragment/ | fragment-source.md |

### 网络与异步 `/network/`
| 子模块 | ✓ 已完成 |
| --- | --- |
| http/ | retrofit-okhttp.md、okhttp-interceptor.md、http-protocol.md、okhttp-source.md、retrofit-source.md、network-cache.md、websocket.md |
| handler/ | handler-source.md、handlerthread.md、sync-barrier.md |
| coroutine/ | flow-advanced.md、rxjava-operators.md、coroutine-principle.md、structured-concurrency.md |
| thread/ | thread-pool.md、locks.md、concurrency-tools.md、asynctask-intentservice.md、concurrency-practice.md |
| 根级 | osi-tcpip.md、socket.md、tcp-udp.md（基础协议） |

### 进阶实战 `/advanced/`
| 子模块 | ✓ 已完成 |
| --- | --- |
| architecture/ | architecture-evolution.md、clean-architecture.md、repository-pattern.md、eventbus-analysis.md、project-structure.md |
| modular/ | modularization-practice.md、router-design.md |
| plugin/ | plugin-principle.md、hotfix-comparison.md、hook-tech.md |
| performance/ | startup-optimization.md、memory-optimization.md、jank-optimization.md、anr-optimization.md、apk-size-optimization.md、leakcanary-analysis.md、network-optimization.md、battery-optimization.md |
| stability/ | crash-monitoring.md、anr-guide.md、apm-monitoring.md、log-system.md |
| multimedia/ | multimedia-basics.md、exoplayer-deep.md、mediacodec-ffmpeg.md、camera-capture.md |
| cross-platform/ | cross-platform-overview.md |

### 系统原理 `/system/`
| 子模块 | ✓ 已完成 |
| --- | --- |
| binder/ | binder-mechanism.md、binder-driver.md、aidl-deep.md、ipc-comparison.md、parcelable.md |
| ams-wms/ | ams-activity-launch.md、wms-principle.md、pms-package-manager.md、wms-touch-dispatch.md |
| boot/ | system-boot.md、app-launch.md、zygote-deep.md |
| apk/ | apk-build-process.md、multi-channel.md、signature-verify.md、apk-install-process.md、apk-reinforcement.md |
| art/ | art-runtime.md、art-compilation.md、art-gc.md、dex-format.md、classloader.md |
| os/ | os-core.md、linux-memory.md、thread-sync-ipc.md |

### 工程实践 `/engineering/`
| 子模块 | ✓ 已完成 |
| --- | --- |
| gradle/ | gradle-basics.md、dependency-config.md、version-catalog.md、proguard-guide.md、custom-gradle-plugin.md |
| git/ | git-workflow.md、git-rebase-workflow.md、git-cheatsheet.md、git-branch-model.md |
| cicd/ | github-actions.md、jenkins-pipeline.md、gray-release.md |
| testing/ | unit-testing.md、mockk-testing.md、ui-testing.md、test-pyramid.md |

### 面试指南 `/interview/`（平铺）
- ✓ android-knowledge-summary.md（Android 知识点汇总：19 大主题回顾清单，链接全部详细文章）
- ✓ basics.md（基础篇）✓ advanced.md（进阶篇）✓ source-code.md（源码篇）
- ✓ interview-plan.md（面试准备计划）✓ resume-guide.md（简历建议）✓ company-experience.md（大厂面经实录）
- ✓ behavior-questions.md（行为面试题与回答套路：STAR 法则 / 自我介绍 / 项目难点 / 离职原因 / 薪资谈判）

### 实战项目 `/projects/`
- ✓ from-scratch.md（从零搭建 App）
- ✓ open-source-analysis.md（开源项目源码解析）

### 书籍资源 `/books/`
- ✓ src/books/README.md（网站板块页：小体积书分类索引 + 直链下载（`wikiStatic/books/`）+ 经典大书 GitHub 下载（仓库顶层 `books/`））

### 关于本站 `/about/`
- ✓ intro.md　✓ contribution-guideline.md　✓ faq.md

**现状统计**：✓ 全部文章已完成（265 篇文章 + 80 个模块 README，构建 336 页面），无「（待更新）」占位文章，构建无 broken-link warning。

---

## 7. 常见修改操作手册

### 7.1 新增一篇普通文章
1. 在对应模块目录创建 `xxx.md`，frontmatter 写 `icon` + `title`（+ `description`）。
2. 更新该模块 `README.md` 的「文章列表」，去掉「（待更新）」或新增条目。
3. 若文章值得推荐，同步更新首页 `src/README.md` 的「 精选文章」对应小节。
4. 侧边栏无需改动（structure 自动生成）。
5. **运行 `npm run sync:static`**，同步 md 到 `wikiStatic/` 并刷新根 README 与 wikiStatic README 的目录树。

### 7.2 新增一个子模块（如 `android/xxx/`）
1. 创建 `src/android/xxx/README.md`（frontmatter：`icon` + `title`）。
2. 如需出现在顶部导航，在 `navbar.ts` 对应下拉组中加一项。
3. 如需首页展示，更新 `src/README.md` 的 features / 精选文章。
4. 运行 `npm run sync:static` 同步 wikiStatic。

### 7.3 新增一个顶层模块（如 `src/xxx/`）
1. 创建 `src/xxx/README.md`。
2. 在 `navbar.ts` 添加导航项（或下拉组）。
3. 在 `sidebar.ts` 添加一行 `"/xxx/": "structure"`。
4. 首页 features 如需要则加一张卡片。
5. 运行 `npm run sync:static` 同步 wikiStatic（模块镜像 + 目录树）。
6. **同步更新本文档**第 2 / 3 / 6 节。

### 7.4 调整导航栏
- 只改 `navbar.ts`（文案、顺序、分组、链接）。
- 侧边栏自动跟随目录，不受影响。
- 删除导航项不影响对应页面仍可通过链接/侧边栏访问。

### 7.5 修改品牌 / 版权 / 页脚
- 版权行：`theme.ts` 的 `author.name`（theme-hope 据此自动生成 `Copyright  <year> <name>`）；`copyright.author` 同步改。
- 页脚：`theme.ts` 的 `footer`（当前为 `GitHub | MIT License`）。
- 站点标题：`config.ts` 的 `title`。
- 图标：替换 `public/logo.svg` / `public/favicon.svg`（用 `scripts/gen-icons.ps1` 重新生成 PNG）。

### 7.5.1 页面 meta（作者 / 写作日期 / 阅读时间 / 贡献者）
- 顶部信息：`theme.ts` 的 `pageInfo` 数组（当前 `["Date", "ReadingTime"]`，已去掉 Author——站点即 WikiAndroid 无需每页重复作者；可选值见 `PageInfoType`）。
- hover 悬浮提示：主题用 balloon.css（`[aria-label][data-balloon-pos]`）渲染 tooltip，已在 `index.scss` 用 `.page-info [aria-label][data-balloon-pos]` 禁用（`::before/::after` 隐藏 + `cursor: default`），仅影响页面信息项。
- 底部贡献者：`theme.ts` 的 `plugins.git: { contributors: false }` 关闭（底部已有 GitHub 链接无需重复展示）；恢复时改为 `true`。

### 7.5.2 旧链接重定向（@vuepress/plugin-redirect）
- 位置：`theme.ts` → `plugins.redirect`（theme-hope 内置暴露 `RedirectPluginOptions | boolean`）。
- **`config` 必须是 `Record<string, string>` 对象映射（from → to），不是数组**（用 `[{from,to}]` 数组构建虽成功但不会生成任何 redirect 文件，会白跑一次构建）。
- 当前映射：Compose 移入 Jetpack 后旧路径 `/ui/compose/`、`/ui/compose/compose-*.html` → `/jetpack/compose/` 对应地址；构建后在 `dist/ui/compose/index.html` 等位置生成 meta-refresh 重定向页，旧链接 302 落到新地址。
- 新增迁移时：往 `plugins.redirect.config` 里追加 from→to 条目即可。

### 7.5.3 字体与正文排版（Google 文档风格）
- 字体：Google Sans / Google Sans Text 为专有字体（官方 developer.android.google.cn 中文站实际回退到 Noto Sans 家族），本站采用开源等价组合 **Roboto + Noto Sans SC**。
- 加载：`config.ts` head 添加 `preconnect`（fonts.googleapis.com / fonts.gstatic.com）+ Google Fonts 样式表（权重 400;500;600;700，`display=swap` 离线可优雅回退到系统字体）。
- 字体栈：`index.scss` `:root` 覆盖 `--vp-font` / `--vp-font-heading`（Roboto、Noto Sans SC、PingFang SC、Microsoft YaHei、system-ui…）。
- 排版：`index.scss` `.vp-page` 块——`p, li { line-height: 1.75 }`、`p { margin: 0.6em 0 }`、`h2 { margin-top: 1.5em }`（主题默认 line-height 1.6 + `p { margin: 0 }` 导致正文拥挤；本主题内容容器是 `.vp-page`，没有 `.vp-doc` 类）。

### 7.6 更新「待更新」文章为正式文章
- 创建文章文件，更新模块 README 移除「（待更新）」标记，即可消除对应 broken-link warning。

### 7.7 书籍资源管理（双通道：网站直链小书 + GitHub 经典大书）
- **小书（<25 MiB）**：实体存 `wikiStatic/books/<分类>/`（真相源），构建时 `prebuild`（`scripts/prepare-public.mjs`）自动复制到 `src/.vuepress/public/books/` → 发布为 `https://wikiandroid.com/books/*.pdf`（Cloudflare CDN 直链）；
- **经典大书**：实体存仓库顶层 `books/<分类>/`（GitHub 直接下载，不发布到网站——Cloudflare Pages 单文件上限 25 MiB，大书无法网站直链）；
- **Cloudflare Pages 单文件上限 25 MiB**：`wikiStatic/books/` 只收录 <25 MiB 的 PDF；大书一律进顶层 `books/`，仅提供 GitHub 下载链接；
- 三处索引同步维护：`books/README.md`（经典书库索引）、`src/books/README.md`（网站板块页）、根 `README.md`（书籍表）；
- 新增小书：PDF 放入 `wikiStatic/books/<分类>/` → 更新三处索引 → `npm run build` 验证 → 提交推送；
- 新增经典大书：PDF 放入 `books/<分类>/` → 更新 `books/README.md` + `src/books/README.md` + 根 `README.md` → 提交推送（无需 build，GitHub 渲染即时生效）。

---

## 8. 构建与发布流程

```bash
npm run build        # 1. 本地构建验证（prebuild 自动复制 wikiStatic/books/ → public/books/，输出 src/.vuepress/dist）
npm run dev          # 2.（可选）本地预览 http://localhost:8080
git add -A
git commit -m "feat(scope): 描述"
git push origin main # 3. 推送 main → Cloudflare Pages 自动构建部署
# 4. 验证 https://wikiandroid.com（带查询参数硬刷新避免缓存）
```

构建输出 97 个文章页面 + 各模块 README 页 + `books/` PDF 直链；`dist/` 与 `src/.vuepress/public/books/`（构建副本）已被 `.gitignore` 忽略，不入库。

---

## 9. 维护规则（防文档漂移）

1. **任何结构性变更后，必须同步更新本文档**（第 2 / 3 / 6 节为主）。
2. 代码（目录结构 + navbar.ts）为「实现真相」，本文档若与代码冲突，以代码为准并修正本文档。
3. 每篇文章的 frontmatter 建议：`icon`（iconify 图标名）+ `title` + `description`。
4. 站内链接优先用相对链接（同模块内）或绝对路径（跨模块，如 `/system/binder/`）。
5. 「（待更新）」文章产生 broken-link warning 属正常现象，不阻塞构建，但正式发布前建议补齐。

---

## 10. 已知问题与警告

- ✓ 所有占位文章已补齐，「待更新」死链 warning 已消除。
- `theme.ts` 中 `iconAssets: "iconify"` 有弃用提示（新写法为 `plugins.icon.assets`），暂不影响功能。
- 终端偶发 PATH 丢失（PowerShell 5.1），运行 npm 前先刷新 PATH。
