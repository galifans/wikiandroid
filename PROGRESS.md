# WikiAndroid 项目进展（PROGRESS.md）

> **本文档是项目进展与记忆的「权威记录」（Single Source of Truth）。**
> 所有对本站的改动（新增文章、结构变更、修复、部署）完成后，
> **必须同步更新本文档**，确保任何时间打开仓库都能快速恢复上下文。
> 由 `agent.md` 第 10 节约束强制同步。

---

## 1. 项目概览

| 项目 | 值 |
| --- | --- |
| 站点名称 | WikiAndroid |
| 域名 | https://wikiandroid.com（备用：https://wikiandroid.pages.dev） |
| 仓库 | https://github.com/galifans/wikiandroid（分支 main） |
| 部署方式 | Cloudflare Pages：`git push main` 自动触发构建部署（约 2-4 分钟） |
| 构建命令 | `npm run build` → 输出 `src/.vuepress/dist`（当前 351 页面） |
| 本地预览 | `npm run dev` → http://localhost:8080 |
| 当前状态 | ✓ 内容建设完成（274 篇文章），持续维护中 |

## 2. 进展时间线

### 2026-08-27（Phase 2 内容优化：图表/代码块配文字讲解、简单表格转文字、mermaid 缩小加边框、仅 Kotlin 代码块默认 Kotlin）
- ✓ 用户反馈：① 当前网站内容满屏幕都是 mermaid 图 + 表格 + 代码块，文字相关描述太少了；② 部分表格内容可以转成文字描述介绍；③ mermaid 图有点太大且没有边框，需要缩小并加边框；④ 如果代码块仅支持 Kotlin 写法，应优化为默认 Kotlin 展示、Java 切换按钮灰化不可点击
- ✓ 用户确认范围：全站分批优化，本次先做 Jetpack 板块（11 个模块 28 篇文章）；表格转文字标准 = 仅转最简短的说明性表格（≤3 行）；文字风格 = 每个图表/代码块前后加讲解段落
- ✓ 文字描述增强（**28 篇 jetpack 文章 + 1 篇 ui**）：为每个 mermaid 图、code-tabs 代码块、简单表格补充讲解段落——图/代码块前加"前置讲解"（forward reference，如"下面的流程图展示了……"），表格后加"后置总结"（backward reference，如"上面这张表说明了……"），累计新增约 240 处讲解段落；`compose-animation.md` 第 8 节简单表格直接转为 5 点要点文字
- ✓ 仅 Kotlin 代码块处理：新增 `scripts/scan-kotlin-only.mjs`（扫描仅含 Kotlin 围栏的 code-tabs）与 `scripts/convert-kotlin-only.mjs`（自动转换），41 个仅 Kotlin 块全部转为"默认 Kotlin + Java 按钮灰化禁用"；新增自定义 `src/.vuepress/components/CodeTabs.ts` 组件（检测空 tab 槽位 → 该按钮 disabled + 灰化样式 + aria-disabled + title 提示"此代码块仅支持 Kotlin 写法"，onClick/onKeydown 早退）+ `src/.vuepress/client.ts` 注册；`src/.vuepress/styles/index.scss` 追加 `.vp-code-tab-nav.disabled` 灰化样式（color text-mute / cursor not-allowed / opacity 0.55）
- ✓ mermaid 缩小 + 边框：`src/.vuepress/styles/index.scss` 追加 `.mermaid-content` 样式——`width: fit-content; max-width: 100%; margin: 1em auto; border: 1px solid var(--vp-c-border); border-radius: 8px; padding: 12px 16px; background: var(--vp-c-bg-alt); overflow-x: auto` + svg `display: block; max-width: 100%; height: auto`（实测 1593px → 561px 宽）
- ✓ 质量验证：`node scripts/validate-tabs.cjs` 全站 **ALL OK**；`npm run build` 351 页面构建成功（30s）；浏览器实测 appcompat-principle.html / fragment-source.html——讲解段落全部渲染、mermaid SVG 正常、code-tabs 6/3 个正常
- 教训：① multi_replace 批量替换遇 "Multiple matches found" 时逐个核对——本次 fragment-source.md 的 sequenceDiagram intro 因 oldString 匹配两处而静默跳过，浏览器抽查才发现并补上；② 验证 CSS/内容改动必须用 `?t=` 缓存穿透 URL（浏览器缓存导致首次验证误判）；③ 表格转文字只转 ≤3 行说明性表格，大表格保留表格形式（更易扫读）

### 2026-08-27（全站 mermaid 图表渲染修复：安装 mermaid 依赖 + 开启渲染 + 修复 7 处语法错误）
- ✓ 用户反馈：页面中有很多 mermaid 代码块，看不到渲染后的图表——要么成功渲染，要么去掉（不做半成品）
- ✓ 基础设施：`package.json` 新增 devDependency `mermaid@^11.14.0`（浏览器实际加载 11.17.2，页面模块 `/assets/mermaid.esm.min-*.js`）；`src/.vuepress/theme.ts` 开启 `markdown: { mermaid: true }`（theme-hope rc.107 内置 `@vuepress/plugin-markdown-chart` 的 Mermaid 组件自动接线）；默认 securityLevel=strict（非 loose）
- ✓ 新增校验脚本：`scripts/validate-mermaid.mjs`——**必须配 jsdom 环境**（无 DOM 时 mermaid 内部 DOMPurify.sanitize 为 undefined，parse 报"DOMPurify.sanitize is not a function"掩盖真实词法错误）；jsdom 环境 + `securityLevel:"loose"` 与浏览器渲染行为一致；`node scripts/validate-mermaid.mjs` → 307 个 mermaid 块 **ALL OK**
- ✓ 修复 7 处语法错误（8 块，涉及 7 个文件）：`binder-driver.md`（`E[/dev/binder<br>设备文件]` 平行四边形标签内裸 `/` 词法错误 → 引号包裹）；`router-design.md`（`Router.getInstance().build(path).navigation()` 括号+点 → 引号）；`behavior-questions.md`（节点文本内 ASCII 引号 `考"会什么"` → 全角『』+ 引号）；`collection-guide.md`（`|hash[]|` 边标签方括号 → 引号）；`compose-layout.md`（`placeable.placeRelative(x, y)` → 引号）；`hilt-advanced.md`（**3 行含 `@` 符号** → 引号，`@Inject/@Provides/@Singleton/@Named` 裸写会触发 LINK_ID 错误）；`zygote-deep.md`（flowchart 中使用 **`Note over`（仅 sequenceDiagram 合法）** → 改为无连线注释节点）；`canvas-path.md`（`onDraw(canvas)` → 引号）
- ✓ 浏览器实测：binder-driver 5/5 块渲染为 SVG、修复前页尾错误 svg 消失；router-design/behavior-questions/collection-guide/compose-layout/hilt-advanced/zygote-deep/canvas-path/retrofit-source/glide-source 全部渲染正常（块数与源码一致、无错误 svg、含文本节点）；`npm run build` 351 页面构建成功；`npm run sync:static` 已同步 wikiStatic
-  教训：① Node mermaid.parse 不带 DOM 无法校验语法（DOMPurify 掩盖一切），校验脚本必须跑 jsdom；② 渲染失败时错误 svg 会追加到 BODY 底部（`dv-{id}` 临时容器），无论哪块失败都在页尾——用 svg id（v-N 对应组件挂载序）定位失败块；③ flowchart 中 `Note over` 是非法语法（sequenceDiagram 专属）；④ 标签内含 `/`、`()`、`[]`、`"`、`@`、`→` 等字符必须用引号包裹 `["..."]`；⑤ 修复任何 mermaid 块后必须全站重新校验 + 构建 + 浏览器抽查，防止同类错误遗漏

### 2026-08-26（Jetpack 板块对照 androidx 官方库补齐：Activity/AppCompat/Biometric/Collection/Core/Fragment/Compose Runtime）
- ✓ 用户需求：重新审视 jetpack 板块文章质量，参考 https://github.com/androidx/androidx，充分完善——该新增就新增 Activity、AppCompat、Biometric、Collection、Compose Runtime、Core、DataStore、Fragment、Lifecycle、Navigation、Paging、Room、WorkManager（对照 androidx 官方 13 个核心库全覆盖）
- ✓ 审视结论：原 19 篇文章（compose 6 / lifecycle-viewmodel 4 / room-datastore 3 / paging-navigation 3 / workmanager-hilt 3）质量良好（code-tabs 双语、面试导向、结构完整），对照 androidx 官方 13 库缺口为 7 个：Activity、AppCompat、Biometric、Collection、Compose Runtime（原理层）、Core、Fragment（库层）；DataStore/Lifecycle/Navigation/Paging/Room/WorkManager 已有覆盖
- ✓ 新增 6 个子模块（共 11 个）：`activity/`（ActivityResult API 详解、Edge-to-Edge 全面屏适配）、`appcompat/`（AppCompat 兼容原理）、`biometric/`（BiometricPrompt 生物识别）、`collection/`（Collection 集合库详解）、`core/`（Core KTX 扩展库、App Startup 与 SplashScreen）、`fragment/`（FragmentManager 源码解析，库层角度，与 android/fragment 基础篇交叉引用不重复）
- ✓ compose/ 补充原理层：`compose-runtime.md`（编译器插件与重组机制、快照系统、Slot Table、稳定性推断、remember/derivedStateOf 原理）——补齐 Compose Runtime 库覆盖
- ✓ 共新增 9 篇文章 + 6 个子模块 README，每篇风格统一：面试高频指数、code-tabs Java 默认/Kotlin 切换、mermaid 图、对比表格、Q1-Q5 面试题（::: details 查看答案）、小结、相关阅读跨板块链接；Java 无等价写法场景（Compose/协程/DataStore Serializer 等）用注释说明并给出语义等价写法
- ✓ 修复 dir.order 冲突：原 compose=1 与 lifecycle-viewmodel=1 重复，调整为 compose=1、lifecycle-viewmodel=2、room-datastore=3、paging-navigation=4、workmanager-hilt=5、activity=6、appcompat=7、biometric=8、collection=9、core=10、fragment=11（11 个模块 order 全站唯一）
- ✓ 同步更新：`src/jetpack/README.md`（分类表 5→9 行 + 全部文章导航新增 4 个分类）、`architecture.md`（jetpack 模块表 +6 行）、`navbar.ts`（Jetpack 下拉 5→11 项，与侧边栏顺序一致）、根 `README.md`（Jetpack 分类表 +4 行）、`src/README.md`（hero 卡片组件描述 + 精选文章 +9 行）
- ✓ `node scripts/validate-tabs.cjs` 全站 **ALL OK**；`npm run build` 构建 351 页面成功（336 → 351）；`npm run sync:static` 已同步 wikiStatic（348 md）；浏览器实测：activity-result.html（code-tabs 6 个 Java/Kotlin 切换正常）、compose-runtime.html（mermaid 10 个 SVG）、fragment-source.html（侧边栏与 navbar 全部 11 项）渲染正常
-  教训：新增子模块必须全局盘点 dir.order（本次发现 compose/lifecycle-viewmodel 历史冲突）；navbar.ts 是手工维护的，新增子模块后必须同步下拉项；Fragment 板块注意与 android/fragment 基础篇区分定位（库层源码 vs 使用层）

### 2026-08-26（全站示例代码块支持 Java/Kotlin 切换）
- ✓ 用户需求：网站所有示例代码块补充 Java/Kotlin 切换功能——默认 Java，代码块右上角有切换按钮；除编程基础或必须使用 C/C++ 的示例外，不要其他语言风格的代码
- ✓ 基础设施：`src/.vuepress/theme.ts` 开启 `markdown: { codeTabs: true, tabs: true }`（theme-hope rc.107 内置 `@vuepress/plugin-markdown-tab`）；`src/.vuepress/styles/index.scss` 追加 `.vp-code-tabs-nav` 样式实现右上角右对齐 + 高亮；浏览器实测切换正常（默认 Java、点击 Kotlin 切换面板）
- ✓ 转换语法：`::: code-tabs` + `@tab:active Java`（`@tab` 与 `:active` 无空格）+ ```java 围栏 + `@tab Kotlin` + ```kotlin 围栏 + `:::`，全部顶格、行间留空行
- ✓ 全站转换：**8 大板块 754 个代码块**全部转为 code-tabs（android 222 / language 184 / ui 178 / jetpack 123 / network 107 / advanced 80 / system 37 / engineering+projects+roadmap 30），每个 Java 块补 Kotlin 版本、每个 Kotlin 块补 Java 版本，语义等价忠实互译
- ✓ 例外保留：C/C++ 块（language/cpp 23 个、system 6 个，编程基础/JNI/NDK 场景）原样不动；Kotlin DSL 构建脚本 4 处（build.gradle.kts 配置，非程序示例）豁免；其余语言（mermaid/xml/groovy/shell 等）一律不动
- ✓ 新增工具脚本：`scripts/code-tabs-spec.md`（转换规范）、`scripts/validate-tabs.cjs`（校验 java/kotlin 围栏全部在 code-tabs 内、容器配对完整，支持 Kotlin DSL 豁免清单）、`scripts/count-langs.cjs`（分板块语言统计）、`scripts/fence-check.cjs`（围栏定位排查）
- ✓ `node scripts/validate-tabs.cjs` 全站 **ALL OK**（0 残留游离 java/kotlin 围栏）；`npm run build` 构建 336 页面成功；`npm run sync:static` 已同步 wikiStatic；浏览器实测 ui/view/measurespec.html 与 jetpack/room-datastore/datastore-guide.html 切换正常
-  教训：`@tab Java :active` 写法会渲染字面 `:active` 文本，必须用 `@tab:active Java`；Compose/协程等纯 Kotlin 场景的 Java 版本用等价 View 体系/回调/线程池写法并注释说明

### 2026-08-26（全站去 emoji + 内容全方面扩充 31 篇：Android 核心 + UI 与渲染 重点）
- ✓ 用户需求：① 站内大量 emoji 表情图标「AI 味太重」，全部优化去除；② 继续完善文章内容，全方面扩展至少 30 篇，重点放在 Android 核心板块和 UI 与渲染 两个板块
- ✓ 全站 emoji 清理：grep 正则 `[\p{Extended_Pictographic}\u{FE0F}]` + `\u2b50` 扫描全站 md，用 `scripts/strip-emoji.mjs` 批量去除装饰性 emoji（保留表格、代码等必要场景，改写文案使其通顺）；清理后 0 残留，**全站禁用 emoji 成为新约定**
- ✓ Android 核心（+11 篇）：activity（activity-result-api.md、activity-config-changes.md）、fragment（fragment-communication.md）、content-provider（fileprovider.md、contentobserver.md）、storage（sqlite-guide.md、scoped-storage.md）、process（multi-process.md）、resource（theme-style.md、drawable-guide.md）、service（service-threading.md）
- ✓ UI 与渲染（+13 篇）：layout（constraintlayout-guide.md、layout-selection.md）、animation（interpolator-evaluator.md）、view（viewpager2-guide.md）、event（coordinate-system.md、multitouch.md）、custom-view（custom-attributes.md）、render（choreographer.md、hardware-acceleration.md、surfaceview-textureview.md）、bitmap（bitmap-compress.md）、window（systembar-adaptation.md、dialog-toast-popup.md）
- ✓ 其他板块（+7 篇）：system/apk（apk-install-process.md、apk-reinforcement.md）、advanced/multimedia（camera-capture.md）、network/http（websocket.md）、engineering/git（git-branch-model.md）、roadmap（android-version-history.md）、interview（behavior-questions.md）
- ✓ 每篇风格统一：intro 引言、mermaid 图、对比表格、Kotlin 代码、高频面试题 Q1-Q5（`::: details 查看答案`）、小结、相关阅读跨板块链接；全部通过校验（details/闭合各 5、无全角 `::：`、无 emoji）
- ✓ 同步更新：android/ui 板块 README（计数 28→39、24→37）、子模块 README（apk/http/git/multimedia）、父级 README（advanced/engineering/network/system）、roadmap/interview README、首页 `src/README.md`（精选文章扩充）、根 `README.md`（精选文章表 +8 行）、`architecture.md`（模块表 + navbar 表 + 现状统计 231→265 篇 / 305→336 页）
- ✓ `npm run build` 构建 336 页面成功；`npm run sync:static` 已同步 wikiStatic；浏览器实测新页面渲染正常
-  教训：全角冒号 `::：` 闭合标签在批量生成文章中反复出现（本批又命中 3 篇 8 处），**每批文章后必须用 node 校验脚本全局排查**；❌✅ 属于 Extended_Pictographic，emoji 正则须同时覆盖

### 2026-08-26（七大板块内容扩充：语言/UI/Jetpack/网络/进阶/系统/工程 +45 篇文章 +2 子模块）
- ✓ 用户需求：完善「语言基础、UI与渲染、Jetpack、网络与异步、进阶实战、系统原理、工程实践」七大板块，内容多多益善，新增板块与子级随意加，保持 UI 风格统一
- ✓ 语言基础（+3 篇）：`kotlin-functional.md`（函数式编程：lambda/高阶函数/集合操作）、`kotlin-delegation.md`（by lazy / by viewModels / 属性委托）、`cpp-memory.md`（智能指针/RAII/内存模型）；同步更新 kotlin/ cpp/ README
- ✓ UI 与渲染（+8 篇 + 新子模块 `render/` order 7）：`recyclerview-guide.md`（RecyclerView 使用）、`recyclerview-source.md`（缓存复用源码）、`webview-guide.md`（WebView 优化）、`input-system.md`（输入系统全链路）、`canvas-path.md`（Canvas/Path 绘图）、`touch-helper.md`（TouchHelper）、`tween-animation.md`、`scene-transition.md`、`screen-adaptation.md`、`windowmanager-deep.md`、`glide-source.md`、`render-principle.md`（渲染原理：CPU→GPU 管线）；navbar 下拉新增「渲染原理」
- ✓ Jetpack（+7 篇）：`compose-state.md`、`compose-performance.md`（Compose 状态/性能）、`viewmodel-source.md`（ViewModel 源码）、`savedstate.md`（SavedStateHandle）、`room-advanced.md`（迁移/关系/协程）、`navigation-advanced.md`、`hilt-advanced.md`（自定义绑定/限定符）
- ✓ 网络与异步（+6 篇）：`okhttp-source.md`（Dispatcher/拦截器责任链/连接池/缓存源码）、`retrofit-source.md`（动态代理/ServiceMethod/CallAdapter/Converter）、`coroutine-principle.md`（CPS/状态机/COROUTINE_SUSPENDED/Dispatchers）、`structured-concurrency.md`（Scope/SupervisorJob/async-await）、`sync-barrier.md`（同步屏障/异步消息/IdleHandler/epoll）、`concurrency-practice.md`（中断/ThreadLocal/并发容器/死锁）
- ✓ 进阶实战（+8 篇 + 新子模块 `cross-platform/` order 7）：`router-design.md`（路由表/APT/Postcard/SPI）、`network-optimization.md`（HTTPDNS/连接复用/HTTP2-3/弱网）、`battery-optimization.md`（Doze/WakeLock/定位优化）、`apm-monitoring.md`（APM 架构/崩溃/卡顿/ANR/上报）、`log-system.md`（日志分级/环形文件/回捞/请求ID）、`exoplayer-deep.md`（ExoPlayer 架构/ABR/Renderer/DRM）、`mediacodec-ffmpeg.md`（硬编硬解/PTS 同步/FFmpeg）、`cross-platform-overview.md`（Flutter 自绘/RN 桥接/CMP/KMP 选型）；navbar 下拉新增「跨端方案」
- ✓ 系统原理（+7 篇）：`binder-driver.md`（内核驱动/binder_proc-node-ref/mmap 一次拷贝/BC_TRANSACTION）、`pms-package-manager.md`（PMS 扫描/安装流程/权限/resolveActivity）、`wms-touch-dispatch.md`（IMS/InputReader/InputDispatcher/命中测试/输入 ANR）、`zygote-deep.md`（预加载/COW/fork 孵化/ActivityThread.main）、`art-compilation.md`（AOT/JIT/Profile 引导/dex2oat）、`linux-memory.md`（虚拟内存/回收/oom_adj/LMKD/PSI）、`signature-verify.md`（v1-v4 签名/密钥轮换/多渠道重签）
- ✓ 工程实践（+6 篇）：`custom-gradle-plugin.md`（三种插件形式/Extension/Task/Transform+ASM）、`git-rebase-workflow.md`（Rebase vs Merge/交互式变基/cherry-pick/stash）、`jenkins-pipeline.md`（Master-Agent/声明式 Pipeline/Android 流水线/凭据）、`gray-release.md`（UID 哈希分组/功能开关/监控回滚）、`mockk-testing.md`（coEvery/coVerify/spyk/runTest）、`test-pyramid.md`（金字塔/覆盖率 JaCoCo/TDD/质量门禁）
- ✓ 每篇文章风格统一：intro 引言、mermaid 图（flowchart/sequenceDiagram/stateDiagram）、对比表格、Kotlin 代码、高频面试题 Q1-Q5（`::: details 查看答案`）、小结、跨板块交叉链接
- ✓ 同步更新：各板块 README 文章导航（network/advanced/system/engineering 全文重排）、`navbar.ts`（+渲染原理、+跨端方案）、根 `README.md`（进阶实战 +跨端方案行、系统原理 +操作系统行、精选文章重写）、`src/README.md`（内容规模 200+→220+、四大板块精选 +27 篇）、`architecture.md`（navbar 表 4 行、模块文章表 8 个板块）
- ✓ `npm run build` 构建 311 页面成功（264 → 311，无 broken link warning）；`npm run sync:static` 已同步 wikiStatic；浏览器实测：侧边栏新子模块顺序正确、navbar 下拉新增项可点击、新页面渲染正常
-  教训：生成文章时 `::: details 查看答案` 闭合标签偶发写成全角 `：`（`::：`），每批文章后必须全局 grep 排查；新增子模块前必须盘点全部 `dir.order` 避免冲突（advanced 1-7、system 1-6 已核验唯一）

### 2026-08-26（移除读书笔记板块，知识点迁移至对应板块）
- ✓ 用户需求：读书笔记板块永久移除——个人读书笔记不权威，与站点「权威知识汇聚网站」定位不符；**但知识点不能消失，需迁移到对应板块**
- ✓ 删除 `src/reading-notes/` 全部 11 篇笔记与 README，知识点以专题文章形式迁移：
  - 新增 6 篇权威专题文章：`android/activity/intent-filter.md`（Intent 匹配规则）、`ui/event/view-sliding.md`（View 滑动与弹性滑动）、`advanced/architecture/project-structure.md`（项目结构与工程规范）、`network/http/network-cache.md`（网络请求设计与缓存策略）、`language/java/jvm/Java内存模型与线程.md`（JMM/volatile/happens-before）、`advanced/performance/anr-optimization.md`（ANR 机制与优化）
  - 扩充 2 篇：`language/java/java-basics.md`（+类与类之间的关系、对象存储位置与基本类型）、`system/binder/ipc-comparison.md`（+Binder 连接池）
  - 已覆盖无需迁移：Activity 启动模式/异常回收（activity-lifecycle）、多进程/序列化/IPC 对比（process-lifecycle、binder 系列）、View 绘制/MeasureSpec（view 系列）、Window 机制（window-mechanism/windowmanager-deep）、自定义 View 分类（custom-view-guide）、布局优化（layout-optimization）、内存优化/MAT（memory-optimization）
- ✓ 同步更新：6 个子模块 README 文章列表（activity/event/architecture/network-http/performance/jvm）；`architecture.md` 模块表 6 处 + 现状统计（231 篇 / 305 页）；`PROGRESS.md` 规模表（language 63 / android 28 / ui 24 / advanced 26 / network 21，合计 231）
- ✓ 引用清理：`navbar.ts` 移除「 读书笔记」入口；`sync-wikistatic.mjs` 移除 `reading-notes`；根 `README.md` 移除读书笔记章节；`src/README.md` 移除卡片/计数/精选区
- ✓ 重建后页面数 311 → 305（-11 笔记 +6 新文章），文章数 236 → 231；`npm run sync:static` 自动清理 wikiStatic/reading-notes/ 并刷新目录树

### 2026-08-26（Android 核心知识体系系统扩充：+5 大板块 +11 篇文章）
- ✓ 用户需求：Android 核心只有 8 个板块远不够，要求系统整理并补充缺失知识面，新增大类与子级
- ✓ 缺口分析：对照完整 Android 核心知识体系，识别出 5 个必学但缺失的板块——Intent 组件通信（组件桥梁）、Application 与启动流程（冷启动/清单文件）、资源系统（多语言/多屏幕适配）、权限系统（运行时权限）、通知机制（渠道/PendingIntent）
- ✓ 新增子模块（11 篇文章 + 5 个 README）：
  - `intent/`（order 6）：intent-basics.md（显式/隐式、Flags、Extras、安全）、intent-filter.md（action/category/data 匹配规则、Deep Link）
  - `app/`（order 7）：application-basics.md（Application 生命周期与初始化）、app-launch-process.md（冷启动全链路与优化）、manifest-guide.md（Manifest 详解）
  - `resource/`（order 8）：resource-basics.md（R 文件/AAPT/加载机制）、resource-qualifiers.md（限定符/多语言适配）
  - `permission/`（order 9）：permission-basics.md（权限分级/运行时权限/版本演进）、permission-practice.md（申请最佳实践/特殊权限）
  - `notification/`（order 10）：notification-basics.md（渠道/构建/样式/通知权限）、pendingintent.md（PendingIntent 详解）
- ✓ 顺序重排：原有 order 6-8（context/process/storage）顺延为 11-13，新模块插入 Fragment 之后，形成 13 个子模块的完整知识顺序（四大组件 → Fragment → Intent → Application → 资源 → 权限 → 通知 → Context → 进程 → 存储）
- ✓ 同步更新：`src/android/README.md`（16 → 27 篇，新增全部文章导航与知识图谱）、`navbar.ts` Android 核心下拉 8 → 13 项扁平链接、根 `README.md` 表格 +5 行（wikiStatic 链接）、`src/README.md` 精选 +11 篇、`architecture.md` 子模块表 + navbar 表
- ✓ `npm run build` 264 页面成功（248 → 264，无 broken link）；`npm run sync:static` 261 文件同步；浏览器实测：侧边栏 13 板块顺序正确、下拉 13 项扁平可点击、新页面渲染正常
-  修正：新建子模块时若 `dir.order` 与现有模块冲突会导致侧边栏排序混乱，须先全局盘点所有子模块 order 再分配

### 2026-08-26（侧边栏根级链接与子模块分组视觉对齐：17px 加粗统一）
- ✓ 用户反馈：`network` 板块侧边栏中「Socket 编程基础 / TCP 与 UDP 详解 / 计算机网络体系」是子级条目，但没加粗、字号小一号，未对齐「网络与协议 / Handler / 协程 / 线程」等子模块分组
- ✓ 根因：板块根目录松散文件渲染为 `li > a.vp-sidebar-link`（14px/400），子模块目录渲染为 `li > section.vp-sidebar-group`（分组标题 17px/600）——两者都是板块第一层级条目，视觉却不一致
- ✓ 修复：`index.scss` 独立顶层规则 `.vp-sidebar > .vp-sidebar-links > li > .vp-sidebar-link` 改为 `font-size: 1.0625rem(17px) + font-weight: 600`，与子模块分组标题完全对齐；选中态保持 600
- ✓ 浏览器实测：network 侧边栏 7 个条目（4 分组 + 3 根级链接）全部 17px/600，完全一致；该规则对全部板块根目录松散文件（reading-notes 笔记、interview、projects、roadmap 等）同样生效
- ✓ `npm run build` 248 页面成功；`npm run sync:static` 已同步
-  修正上一轮结论：根级链接不应设 14px（那是"子级子链接"的规格），而应对齐并列的"子模块分组标题"17px/600

### 2026-08-26（导航栏网络下拉风格统一：去分组 + 顺序对齐 + 侧边栏根级链接字号修复）
- ✓ 用户反馈：① 下拉顺序不对；② 左侧（侧边栏）当前页未加粗、字体不对；③ 下拉出现「基础协议」不可点击分组标题——要求与其他板块下拉统一风格
- ✓ 根因 1：navbar 嵌套 children 会渲染成「不可点击的分组标题」，其他板块下拉都是扁平可点击项，风格不统一
- ✓ 根因 2：主题自带规则 `.vp-sidebar > .vp-sidebar-links > li > .vp-sidebar-link { font-size: 1.1em }` 特异性更高，把模块根目录松散文件（network 的 osi-tcpip/socket/tcp-udp）字号放大到 ≈16.5px，与子级链接 14px 不一致；且该规则必须写在 `.vp-sidebar` 块**外**（独立顶层选择器），否则 SCSS 嵌套会多一层祖先选择器导致匹配不上（第一次修复失败的原因）
- ✓ 修复：① navbar.ts 网络下拉去掉「基础协议」分组，改为 7 个扁平链接，顺序与侧边栏一致（网络与协议 → Handler → 协程 → 线程 → 计算机网络体系 → Socket → TCP 与 UDP）；② index.scss 新增独立顶层规则 `.vp-sidebar > .vp-sidebar-links > li > .vp-sidebar-link { font-size: 0.875rem; font-weight: 400; &.active { font-weight: 600 } }`
- ✓ 浏览器实测：下拉 7 项全部 14px 可点击、顺序与侧边栏一致；侧边栏根级链接 14px（原 16.5px）、当前页加粗 600；该修复对所有板块根目录松散文件（如 reading-notes 笔记）同样生效
- ✓ `npm run build` 248 页面成功；`npm run sync:static` 已同步

### 2026-08-26（导航栏网络下拉补齐基础协议，与侧边栏对齐）
- ✓ 用户反馈：`/network/socket.html` 页面左侧边栏有「Socket 编程基础 / TCP 与 UDP 详解 / 计算机网络体系」，但导航栏「 网络与异步」下拉框不包含——要求必须对应
- ✓ 根因：侧边栏用 `structure` 自动包含板块根目录顶层文章，而 `navbar.ts` 是手工配置，network 下拉漏了 `osi-tcpip.md` / `socket.md` / `tcp-udp.md` 三篇基础协议文章
- ✓ 修复：`navbar.ts` 网络下拉新增「基础协议」分组（计算机网络体系 → /network/osi-tcpip.html、TCP 与 UDP 详解 → /network/tcp-udp.html、Socket 编程基础 → /network/socket.html），置于下拉首位
- ✓ 排查确认：仅有下拉框的板块（语言基础 / Android 核心 / UI 与渲染 / Jetpack / 网络与异步 / 进阶实战 / 系统原理 / 工程实践）中，只有 network 存在顶层文章遗漏；单链接板块（学习路线 / 面试指南 / 实战项目 / 读书笔记）无下拉框不在此列
- ✓ `npm run build` 248 页面成功；浏览器实测下拉含基础协议分组、点击跳转 osi-tcpip 正常；`npm run sync:static` 已同步
-  经验教训已入记忆：**navbar.ts 手工配置，下拉框必须逐项覆盖侧边栏顶层入口**，新增板块根目录顶层文章时必查下拉框

### 2026-08-26（GitHub 首页 README 板块结构同步修复）
- ✓ 用户反馈：GitHub 仓库首页 README 中 Android 核心表格仍缺 进程/Context 两行，UI 与渲染仍显示 Jetpack Compose——板块结构未更新
- ✓ 根因：根 `README.md`（GitHub 首页）为**手工维护**，不随 `npm run sync:static` 自动更新；上次 Compose 迁移（2a1574d）与 Android 核心升级（263a5ed）只更新了 `src/README.md`（网站首页）与各子模块 README，遗漏根 `README.md`
- ✓ 修复内容：① Android 核心表格补 进程（wikiStatic/android/process/README.md）+ Context（wikiStatic/android/context/README.md）两行；② UI 与渲染表格删除 Jetpack Compose 行；③ Jetpack 全家桶表格新增"声明式 UI | Jetpack Compose"行（wikiStatic/jetpack/compose/README.md）
- ✓ 顺带清理：删除 sync 脚本遗留的空目录 `wikiStatic/ui/compose/`（sync-wikistatic.mjs 只删 md 不删空目录；git 不跟踪空目录故不影响 GitHub）
- ✓ 提交推送：`263a5ed..0202a5a main -> main`（1 file changed）
-  经验教训：**根 README.md 是手工维护的**——今后任何板块结构变更（新增子模块、移动目录）必须同步检查并更新根 README.md 的三张速览表（Android 核心 / UI 与渲染 / Jetpack 全家桶），再走 build → sync:static → commit 流程

### 2026-08-26（Android 核心板块 16 篇文章内容全面扩充完善）
- ✓ 用户反馈：网站刚建立，Android 核心板块很多文章内容敷衍，要求不投喂 md、由模型自行输出完整详细的学习资料，做到"非常完善"
- ✓ 全板块质量审计：16 篇文章按质量分级——6 篇偏薄（<110 行）需重写，10 篇达标需增强
- ✓ 批次 1（Activity 3 篇）：`activity-lifecycle.md` 重写（75→450 行：生命周期全景 mermaid、11 种典型场景回调顺序表、配置变更与状态保存 4 方案、四种启动模式、Intent Flags、Lifecycle 组件、Q1-Q8）；`task-stack.md` 增强（Task vs 进程/线程表、跨应用 Task、allowTaskReparenting、多窗口模式适配）；`activity-launch-process.md` 增强（冷启动耗时拆解、Android 12+ 启动变化、Activity Result API）
- ✓ 批次 2（Service 3 篇）：`service-basics.md` 重写（102→450 行：最大误区、两种使用方式、onStartCommand 返回值、绑定通信、8.0+ 后台限制、Service 与协程配合、Q1-Q6）；`foreground-service.md` 增强（FGS 类型总表、Android 15 超时机制、BOOT_COMPLETED 正确姿势）；`aidl.md` 增强（@Parcelize 现代写法、Binder 线程池安全）
- ✓ 批次 3（Broadcast + ContentProvider 3 篇）：`broadcast-basics.md` 增强（AMS 底层分发 sequenceDiagram、广播安全实践、onReceive 超时精确数值与 goAsync）；`register-comparison.md` 增强（静态注册替代方案表、动态注册进程优先级影响）；`content-provider-basics.md` 增强（applyBatch 批量操作、Provider onCreate 先于 Application 的源码时序图、App Startup 优化）
- ✓ 批次 4（Fragment 2 篇）：`fragment-basics.md` 重写（87→370 行：实例/View 生命周期分离核心概念、三个 FragmentManager 对比、commit 三种方式、四种通信方式、状态保存、ViewPager2、单 Activity 架构、Q1-Q7）；`fragment-pitfalls.md` 增强（新增 setMaxLifecycle/ViewPager2 离屏页、viewLifecycleOwner 时序两个坑点 + Q5/Q6）
- ✓ 批次 5（Storage/Process/Context 5 篇）：`sharedpreferences-deep.md` 重写（63→330 行：单例缓存、apply 的 QueuedWork ANR 根因、MODE_MULTI_PROCESS 真相、DataStore 替代）；`storage-comparison.md` 增强（新增分区存储 Scoped Storage 章节 + Q6-Q8）；`sp-vs-datastore.md` 已达标准；`process-lifecycle.md` 重写（102→400 行：五级优先级 mermaid、ADJ 全表、多进程问题表、保活方案演进与 8.0+ 现实、Q1-Q8）；`context-overview.md` 重写（75→350 行：继承体系 mermaid、ContextWrapper 代理、类型对比、泄漏案例、getSystemService 原理、Q1-Q8）
- ✓ 批次 6：`android/README.md` 篇数修正（17→16）+ 全部文章描述更新；8 个子模块 README 核心要点同步更新
- ✓ 文章风格统一：mermaid 图（stateDiagram/sequenceDiagram/flowchart）、对比表格、Kotlin 代码、高频面试题带详解、小结、跨板块交叉链接（/android/fragment/、/jetpack/、/system/ 等）
- ✓ `npm run build` 构建 248 页面成功；浏览器实测 context/fragment/process 新页面渲染正常（目录、mermaid、阅读时间均正确）；`npm run sync:static` 已同步 wikiStatic
-  注意：构建日志中的 `Missing aidl/gradle/proguard highlighter` 为 shiki 高亮语言缺失警告，不影响构建与渲染

### 2026-08-26（Jetpack Compose 移入 Jetpack 板块 + 旧链接重定向 + Google 文档风格字体 + 正文排版优化）
- ✓ 用户反馈：① Compose 应归入 Jetpack 板块（"需要更新一下位置"）；② 界面排版内容有些拥挤（正文行距太密）；③ 想用 Google 文档同款字体
- ✓ 结构迁移：`git mv src/ui/compose/* → src/jetpack/compose/`（README + compose-basics/state/performance 共 4 文件，内容不变）；compose README frontmatter `dir.order: 8 → 1`（Jetpack 侧边栏首位）
- ✓ 引用更新（7 处）：`navbar.ts`（UI 下拉删 Jetpack Compose → Jetpack 下拉首位）；`src/README.md` 首页（UI feature 描述去掉 Compose，Jetpack feature 文案含 Compose + 链接 `/jetpack/compose/`，底部文章列表链接）；`ui/README.md`（现代 UI 分支删除 Compose，改 `>  声明式 UI 开发见 [Jetpack Compose](/jetpack/compose/)`）；`jetpack/README.md`（分类表加"声明式 UI"行 + 文章导航）；`roadmap/compose-roadmap.md`（链接）；`about/intro.md`（UI/Jetpack 描述）
- ✓ 旧链接重定向：`theme.ts` 新增 `plugins.redirect.config`（**注意：必须是 `Record<string,string>` 对象映射，不是数组**）——`/ui/compose/` → `/jetpack/compose/`、三个 `.html` 页逐一映射；构建生成 `dist/ui/compose/index.html` 等 redirect 文件；浏览器实测旧链接 302 落新地址
- ✓ 字体：Google Sans / Google Sans Text 是专有字体（官方 zh-CN 站实际回退 Noto Sans 家族），采用开源等价组合 **Roboto + Noto Sans SC**（`config.ts` head 加 preconnect + Google Fonts 样式表，权重 400;500;600;700 + display=swap 离线可回退）；`index.scss :root` 覆盖 `--vp-font` / `--vp-font-heading` 字体栈
- ✓ 排版：`index.scss` 新增 `.vp-page` 块——`p, li { line-height: 1.75 }`、`p { margin: 0.6em 0 }`、`h2 { margin-top: 1.5em }`（主题默认 line-height 1.6 + `p { margin: 0 }` 是"拥挤"根因）；浏览器实测 p 行高 28px、段距 9.6px、H2 26.4px/600
- ✓ 回归：/ui/ 侧边栏已无 Compose；Jetpack 下拉首位 = Jetpack Compose（概览/核心概念/性能/状态）；首页 Jetpack feature → /jetpack/compose/；页面信息（日期+阅读时间）不受影响
- ✓ `npm run build` 构建 248 页面成功；`npm run sync:static` 已同步 wikiStatic
-  注意：redirect 插件 `config` 类型为 `Record<string, string> | ((app) => Record<string, string>)`——用数组 `[{from,to}]` 构建虽成功但**不会生成任何 redirect 文件**（浪费一次构建）；主题内容容器是 `.vp-page`（本主题无 `.vp-doc` 类）

### 2026-08-26（页面 meta 精简：去作者 + 去贡献者 + 禁用 hover 悬浮提示）
- ✓ 用户反馈：① 页面顶部"WikiAndroid / 2026/8/26 / 大约 1 分钟"鼠标悬停弹出提示内容很鸡肋（文字本身已表达含义）；② 去掉作者（站点即 WikiAndroid，每页重复）；③ 去掉"贡献者: galifans"（底部已有 GitHub 链接）
- ✓ 顶部信息：`theme.pageInfo: ["Date", "ReadingTime"]` 去掉 Author——只剩"写作日期 + 阅读时间"，作者不再渲染（浏览器实测 `page-author-info` 不存在）
- ✓ hover 悬浮提示：主题用 balloon.css（`[aria-label][data-balloon-pos]`）渲染 tooltip，在 `index.scss` 新增 `.page-info [aria-label][data-balloon-pos]` 禁用——`::before/::after` 隐藏（`display: none !important`）、`cursor: default`，仅作用于页面信息项不影响其他组件；实测 hover 无气泡弹出、图标与日期文本正常显示
- ✓ 贡献者：`plugins.git: { contributors: false }` 关闭——底部只剩"在 GitHub 上编辑此页 + 最近更新"，实测无"贡献者"
- ✓ 回归：/android/activity/ 概览页 + 首页均无作者/贡献者；首页无 page-info 不受影响
- ✓ `npm run build` 构建 248 页面成功；`npm run sync:static` 已同步 wikiStatic
-  注意：theme-hope 的 git 插件 contributors 配置项在 `plugins.git`（GitPluginOptions.contributors），而非 frontmatter

### 2026-08-26（侧边栏嵌套分组选中后字号回退修复）
- ✓ 用户反馈：java 板块选中"子级的子级"（如 JVM 分组内文章）后，子级分组（JVM）本身字体变大——要求字体全程不变化、不放大
- ✓ 根因：嵌套子分组字号规则用了 `:not(.active)`（`.vp-sidebar-group .vp-sidebar-group > .vp-sidebar-header:not(.active)`），选中后按钮带 active 类 → 规则失效 → 字号回退到主题继承值（侧边栏 0.94rem ≈ **15.04px**，实测选中前 14px → 选中后 15.04px）
- ✓ 修复：去掉 `:not(.active)`，嵌套子分组字号**无条件固定 14px**；选中加粗改用嵌套 `&.active { font-weight: 600 }`（特异性更高，覆盖 400 字重）——字号始终 14px，选中仅加粗
- ✓ 浏览器实测（/language/java/jvm/）：JVM（active）14px/600，其余嵌套分组 14px/400，深链接全部 14px（active 仅加粗），大类 Java 17px/600
- ✓ 回归：/android/context/ 板块全部链接 14px、单绿（仅当前页链接）保持
- ✓ `npm run build` 构建 248 页面成功；`npm run sync:static` 已同步 wikiStatic
-  教训：自定义字号/字重规则**不要用 `:not(.active)` 排除选中态**，否则选中后回退到主题继承值（0.94rem≈15.04px）导致"选中变大"；字号要无条件固定，选中态只改变字重等其他属性

### 2026-08-25（侧边栏层级优化：嵌套子分组取消加粗、选中态才加粗）
- ✓ 用户反馈：语言基础 > Java 下的嵌套子分组（Java 并发/Java 集合等）与大类 Java 同为黑色加粗、同字号，层级混乱；建议吸收 Google 官方文档风格——大类与子级偏灰黑、大类加粗、子级不加粗、子级选中后才加粗
- ✓ 实测官方文档（developer.android.google.cn）侧边栏：子级链接 `#202124` 灰黑 / 400 常规 / 14px；选中项 700 加粗 + 淡蓝背景（nav-active）
- ✓ 修改（`src/.vuepress/styles/index.scss`）：嵌套子分组 `.vp-sidebar-group .vp-sidebar-group > .vp-sidebar-header:not(.active)` 降为 14px + 400 常规（与大类 17px/600 区分）；新增 `.vp-sidebar-link.active, .vp-sidebar-header.active { font-weight: 600 }` 子级选中后加粗；焦点规则移除 `font-weight: 600`（子级点击仅变色反馈，不加粗）；文字色沿用主题 `var(--vp-c-text)`（亮色 #3c3c43 灰黑，暗色自动切换，不写死避免破坏暗色模式）
- ✓ 浏览器验证（/language/java/）：大类 Java 17px/600；嵌套子分组 Java 并发/基础/集合/JVM 全部 14px/400；JVM 页（嵌套分组内文章）JVM 按钮 active → 600 加粗 + 子级链接 600 加粗 + 绿高亮；焦点点击嵌套分组 → 绿背景但保持 400
- ✓ 回归验证：/android/activity/ 完整场景（点数据存储→点 Activity）仍仅「概览」一个绿元素；叶子链接仍无 `›` 箭头
- ✓ `npm run build` 构建 248 页面成功；`npm run sync:static` 已同步 wikiStatic

### 2026-08-25（侧边栏箭头修正 + 大类加粗 + 焦点双重高亮根因修复）
- ✓ 用户反馈 3 问题：① 所有子级右侧都有 `›` 箭头（哪怕无法展开）；② 大类可仿官方文档稍微加粗；③ 点击「数据存储」后再点「Activity」，Activity 与子级「概览」同时绿色背景（焦点双重高亮），要求找到根因
- ✓ 修复 1（箭头仅限有内容）：`::after` 从 `.vp-sidebar-link:has(> .vp-icon)` 移到 `&:has(> ul)`——叶子链接无箭头（浏览器实测数据存储 4 子级 `content: none`）；站内更深内容（如 /language/java/ 的 Java 并发/基础/集合/JVM）为 `li > section` 嵌套分组，自带主题 `.vp-arrow` chevron（display: block），"有内容"的子级仍有展开指示
- ✓ 修复 2（大类加粗）：`.vp-sidebar-header { font-weight: 600 }`（17px 加粗，仿官方文档层级，浏览器实测 600）
- ✓ 修复 3（焦点根因）：根因 = 按钮 `:focus` 自绘绿背景 **叠加** 主题路由类 `.active`（当前页所在分组按钮必 active）+ 其子级 active 链接的主题 accent-soft 背景 → 双重绿色。改用 `.vp-sidebar-header:focus:not(.active)`：非当前板块点击仍有绿色反馈（实测数据存储点击后 bg rgba(20,184,110,0.14)）；当前板块按钮（含 .active）点击仅 hover 浅灰（--vp-c-control），不再叠绿；最终任意场景仅剩**一个**绿色元素（当前页 active 条目/链接）
- ✓ 完整用户场景验证：点击数据存储 → 点击 Activity → 全侧边栏仅「概览」链接绿色，无按钮残留绿背景
- ✓ `npm run build` 构建 248 页面成功（13.56s）；`npm run sync:static` 已同步 wikiStatic
-  教训：侧边栏分组按钮的 `.active` 是**路由驱动**（当前页所在分组），与展开/折叠无关；自定义 :focus 样式必须 `:not(.active)` 避免与路由高亮叠加

### 2026-08-25（侧边栏子级标识：数字改右侧箭头）
- ✓ 用户反馈数字标号太丑，改为右侧 `›` 箭头（仿 Android 官方文档导航的 chevron 指示），表明"这是一个子级条目（点开还有内容）"
- ✓ 移除 counter 数字方案（.vp-sidebar-group > ul 的 counter-reset/increment 与 ::before 序号）
- ✓ 新方案：`.vp-sidebar-link:has(> .vp-icon)` 改 `display: block; position: relative`，`::after { content: "›"; position: absolute; right: 8px; top: 50%; transform: translateY(-50%) }`，灰色 `--vp-c-text-mute`；`&:hover::after, &.active::after` 变绿（`--vp-c-accent`）
- ✓ 悬挂缩进恢复图标版：`padding-left: calc(8px + 1em + 4px); text-indent: calc(-1em - 4px)`（14px 下 26px/-18px），换行对齐仍精确（浏览器实测「数据存储」4 子级文本两行均 45px，箭头位于链接右缘 272px 处）
- ✓ 兼容性验证：箭头不重叠文本（right: 8px 位于 padding 区）；折叠/展开、`:focus` 点击高亮均不受影响；interview 平铺链接同样获得箭头（视觉统一）
- ✓ `npm run build` 构建 248 页面成功；`npm run sync:static` 已同步 wikiStatic

### 2026-08-25（侧边栏焦点规则修正：当前页面唯一高亮）
- ✓ 修正 :has(> ul) 方案的副作用：该方案在"当前页所在分组"必然展开时，会导致大类 + 概览/子级**双重绿色高亮**（下拉导航到概览页时大类+概览都绿；选子级后大类+子级都绿）
- ✓ 改用 `.vp-sidebar-header:focus`（绿色 + accent-soft 背景 + 600 字重）：点击大类按钮（获得焦点）→ 大类绿色反馈；选择子级/概览（页面导航，按钮失焦）→ 大类自动取消，仅当前页面对应链接（active）绿色
- ✓ 行为总结：**焦点始终停留在当前页面条目**（大类点击瞬间 / 或子级/概览激活时），三类场景浏览器实测通过：① 下拉导航直达概览 → 仅概览绿；② 点击大类 → 大类绿；③ 选择子级 → 仅子级绿
-  注意：JS `element.click()` 不会聚焦按钮，验证 :focus 行为必须用真实用户点击（Playwright `getByRole().click()`）
- ✓ `npm run build` 成功；`npm run sync:static` 已同步 wikiStatic

### 2026-08-25（侧边栏层级与展开焦点优化）
- ✓ 字体层级区分：分组标题（栏目）17px vs 子级链接 14px（原 16.5/15px 过于接近），`src/.vuepress/styles/index.scss`
- ✓ 展开分组焦点（初版）：`.vp-sidebar-group:has(> ul) > .vp-sidebar-header` 绿色高亮——后因"当前页所在分组必展开"导致双重高亮，已在本日后续「焦点规则修正」条目中改用 `:focus` 方案
- ✓ 悬挂缩进自适应：`padding-left: calc(8px + 1em + 4px); text-indent: calc(-1em - 4px)` 随字号缩放（14px 下 -18px/26px），换行对齐仍精确（图标 27 / 文本两行 45）
- ✓ `npm run build` 成功；`npm run sync:static` 已同步 wikiStatic
-  教训：active 类基于路由（点击切换展开不会更新）；展开态（ul 存在与否）虽由点击驱动，但"当前页所在分组必展开"会致双重高亮（详见下一条目修正）

### 2026-08-25（侧边栏/标题换行对齐修复）
- ✓ 问题定位：侧边栏文件链接的图标为 inline-block（16px 图标 + 4px 间距），换行后第二行回到内容左边缘（图标之前），与第一行文本错位 20px；页面标题前的 icon 装饰渲染为空占位 + 8.8px margin，换行同样错位
- ✓ 侧边栏修复：`.vp-sidebar-link:has(> .vp-icon)` 悬挂缩进（`padding-left: 28px; text-indent: -20px`），图标 27px / 两行文本 46/47px 对齐（浏览器实测「RecyclerView 优化与 ListView 对比」「SharedPreferences 深度剖析」）
- ✓ 页面标题修复：`.vp-page-title h1 > .vp-icon { display: none }` 隐藏空 icon 装饰，标题文本从内容左边缘开始（1000px 窄视口实测两行 360/360 对齐，修复前 370/379 错位）
- ✓ `npm run build` 成功；`npm run sync:static` 已同步 wikiStatic
-  教训：`getClientRects()` 换行 rect 数量 = 行数，可精确测量每行左偏移；悬挂缩进只对 icon 宽度固定的场景可靠，icon 宽度不定时（如页面标题 icon 渲染失败）直接隐藏更稳

### 2026-08-25（导航体验优化：文案统一 + 顺序对应 + 概览子级 + 换行修复）
- ✓ 问题 1 文案统一：navbar 与侧边栏不一致的 3 处统一为页面标题（View 绘制流程→**View 体系**、OkHttp/Retrofit→**网络与协议**、C++→**C++ 知识点**），`src/.vuepress/navbar.ts`
- ✓ 问题 2 顺序对应：45 个子模块 README 添加 `dir.order`（严格按 navbar.ts 下拉顺序 1..N），8 大板块侧边栏顺序与下拉完全一致（浏览器逐板块验证 match=true）
- ✓ 问题 3 重名子级：45 个子模块 README 添加 `shortTitle: 概览` + `dir.text`，展开后第一个子级统一显示「概览」而非重复模块名（theme-hope 机制：文件链接文本 = `shortTitle ?? title`，分组标题 = `dir.text ?? shortTitle ?? title`）
- ✓ 问题 4 长标题换行：`src/.vuepress/styles/index.scss` 添加 `overflow-wrap: anywhere; word-break: break-word`，长标题（如「RecyclerView 优化与 ListView 对比」）换行不再溢出
- ✓ `npm run build` 构建 248 页面成功；`npm run sync:static` 已同步 wikiStatic；architecture.md 侧边栏规则表新增 frontmatter 说明

### 2026-08-25（导航一致性修复：navbar 与侧边栏对齐）
- ✓ 审计全部板块：navbar 手工维护的下拉与侧边栏（structure 自动生成）存在 4 处不一致，补齐缺失入口：语言基础 +C++、Android 核心 +Context/进程、UI 与渲染 +Bitmap/Window、系统原理 +操作系统（`src/.vuepress/navbar.ts`）
- ✓ 修复侧边栏"左侧未对齐"：5 个子模块 README（android/context、android/process、system/os、ui/bitmap、ui/window）缺少 `icon` frontmatter，导致侧边栏分组按钮无图标、与其他分组文字错位；已按模块风格补上（box/gears/server/image/window）
- ✓ `npm run build` 构建 248 页面成功；`npm run sync:static` 已同步 wikiStatic；`architecture.md` navbar 表格同步更新

### 2026-08-25（Android 知识点汇总归纳 + 内容缺口补齐）
- ✓ 读取桌面 `Android-Review-master/Docs/Android知识点汇总.md`（2494 行）全文，逐主题审计站内覆盖情况（19 大主题约 95% 已有对应文章）
- ✓ 新增 `src/interview/android-knowledge-summary.md`：「Android 知识点汇总」19 大主题系统回顾清单（考点表格 + 高频追问 + 全部详细文章链接），面试前查漏补缺
- ✓ 补齐三处内容缺口：Service `onStartCommand` 三种返回值表、ContentProvider 与 SQL 区别 / Binder 线程池 Q&A、WebView 本地资源替代（shouldInterceptRequest）加载优化
- ✓ `src/interview/README.md` 新增汇总文章入口；构建 248 页面成功；`npm run sync:static` 已同步 wikiStatic
- ✓ 修正 PROGRESS.md / architecture.md 文档漂移（150 → 248 页面，文章规模表按实际目录重新统计）

### 2026-08-24（脚本跨平台化：修复 Cloudflare 构建失败）
- ✓ 修复 Cloudflare Pages 构建失败（`sh: 1: powershell: not found`，exit 127）：CI 是 Linux 环境，PowerShell 脚本不可用
- ✓ `scripts/prepare-public.ps1` / `sync-wikistatic.ps1` → 重写为跨平台 Node 脚本 `prepare-public.mjs` / `sync-wikistatic.mjs`，`package.json` 改用 `node scripts/...`
- ✓ 目录树输出与旧版完全一致（无漂移），本地构建 150 页面成功

### 2026-08-24（书籍网站直链 + 首页 README 直接阅读改造）
- ✓ 网站直链下载：新增 `scripts/prepare-public.mjs`（`prebuild` 钩子，构建时自动把 `wikiStatic/books/` 复制到 `src/.vuepress/public/books/`）→ 书籍可在 wikiandroid.com 直接下载（Cloudflare CDN）；`src/.vuepress/public/books/` 已 gitignore
- ✓ 首页 README 改造：**移除所有 wikiandroid.com 板块跳转链接**，改为「知识库速览」直接内联各板块核心内容（表格 + 学习路径 + 最佳实践），全部链接指向仓库内 `wikiStatic/`（77 个链接已验证有效）
- ✓ `wikiStatic/books/README.md` 同步去掉网站直链，保持纯 GitHub 内阅读体验
- ✓ 构建 150 页面成功；Cloudflare Pages 单文件限制 25MiB（当前最大书 15.5MB）已记录到 architecture.md 7.7 节

### 2026-08-24（书籍板块 + wikiStatic 静态资料库）
- ✓ 新增「 书籍资源」板块：`src/books/README.md` 网站板块页（直链下载）+ navbar/sidebar 接入
- ✓ 建立 `wikiStatic/` 静态资料库：模块 md 镜像（147 个）+ `books/` 书籍 PDF（7 本已收录，约 33MB）
- ✓ 新增 `scripts/sync-wikistatic.mjs` + `npm run sync:static`：md 同步 + 根 README / wikiStatic README 目录树自动刷新（WIKISTATIC_TREE 标记区间）
- ✓ 根 `README.md` 重写：三种学习方式 + 内容板块表（同源）+ 书籍资源表 + wikiStatic 目录树 + Star 号召
- ✓ `agent.md` 新增第 11 节「wikiStatic 静态资料库与 README 同步规范」；`architecture.md` 同步更新
- ✓ 构建 150 页面成功（含书籍板块页），同步脚本验证通过

### 2026-08-23（首日建设）
- ✓ 完成站点框架搭建（VuePress + Theme Hope + Cloudflare Pages 部署）
- ✓ 品牌建设：favicon（绿色渐变 W 标志）、版权署名、首页 hero
- ✓ 补齐全部 71 篇占位文章（9 大模块），移除所有「（待更新）」标记
- ✓ 同步 `architecture.md` 文章状态表（全部 ✓）
- ✓ 统一项目名：`android-stuff` → `wikiandroid`（package.json / package-lock.json）
- ✓ 移除首页 hero 图片与项目介绍页技术栈小节（用户要求精简）

## 3. 内容建设记录

### 文章规模（构建渲染 311 页面，2026-08-26 按实际目录重新统计）
| 模块 | 文章数 | 说明 |
| --- | --- | --- |
| roadmap/ | 3 | 学习路线（Android / Kotlin / Compose） |
| language/ | 63 | Kotlin / Java / 设计模式 / 并发 / 集合 / JVM / 算法 / C++ |
| android/ | 28 | 四大组件 + Fragment + Intent + App + 资源 + 权限 + 通知 + 存储 + 进程 / Context |
| ui/ | 24 | View / 事件 / 自定义 / 动画 / 布局 / Window / Bitmap / 渲染原理 / WebView |
| jetpack/ | 19 | Compose / Lifecycle / Room / Paging / WorkManager / Hilt |
| network/ | 21 | OkHttp / Retrofit / Handler / 协程 / 线程 / 基础协议 |
| advanced/ | 26 | 架构 / 组件化 / 路由 / 性能 / 稳定性 / 多媒体 / 跨端 / 插件化 |
| system/ | 23 | Binder / AMS / WMS / PMS / 启动 / APK / ART / OS |
| engineering/ | 15 | Gradle / Git / CI/CD / 测试 |
| interview/ | 7 | 面试指南（含知识点汇总） |
| projects/ | 2 | 实战项目 |
| books/ | 1 |  书籍资源板块页（PDF 实体存 wikiStatic/books/，直链下载） |
| about/ | 3 | 关于本站 |
| **合计** | **231** | 非 README 文章页面（另有各模块 README 索引页） |

### 文章模板（每篇均包含）
- frontmatter：`icon`（iconify）+ `title` + `description`
- 正文：面试高频指数 、emoji 章节标题、Kotlin 代码示例、对比表格、高频面试题 Q&A（Q1-Q5）、小结
- 内容为**原创中文教育文章**（参考 GitHub 高星仓库知识结构，非翻译，版权安全）

## 4. 关键提交记录

| Commit | 说明 |
| --- | --- |
| `6ce7032` | feat(jetpack): 28 篇文章图表/代码块补充文字讲解、简单表格转文字，mermaid 缩小加边框，仅 Kotlin 代码块默认 Kotlin 且 Java 按钮灰化 |
| `272848f` | fix(nav): 统一导航文案并优化侧边栏（概览命名 / 板块顺序与 navbar 严格对应 / 长标题换行） |
| `2c77f78` | fix(nav): 补齐导航栏缺失入口（语言 +C++ / Android +Context、进程 / UI +Bitmap、Window / 系统 +操作系统）并修复 5 个模块侧边栏图标缺失导致的对齐问题 |
| `ff89888` | feat(interview): 新增 Android 知识点汇总归纳文章并补齐内容缺口（Service START 模式表 / ContentProvider 与 SQL 区别 / WebView 本地资源替代） |
| `8c8b091` | feat(books): 书籍网站直链下载（prebuild 自动发布）+ 首页 README 改为直接阅读的知识库速览 |
| `5258508` | feat(books): 新增书籍资源板块与 wikiStatic 静态资料库（三端同源 + 目录树自动同步） |
| `5abf1bb` | feat(content): 补齐全部占位文章并同步架构文档（121 文件，+14,225 行） |
| `91599d7` | style(home): 移除首页 hero 图片与项目介绍技术栈 |
| `21cbb6d` | chore: 统一项目名为 wikiandroid |

## 5. 踩坑与经验记录（供后续参考）

- **markdown 中 `<xxx>` 放在代码块外会被当作 HTML 标签** → VuePress build 报 "Element is missing end tag"。修复：正文里的占位符用反引号包成行内代码（如 `` `git branch <name>` ``）。XML 代码块内不受影响。
- **Cloudflare Pages 构建环境是 Linux**：任何构建钩子（prebuild）都不能调用 `powershell`/`pwsh`，必须用跨平台 Node 脚本（`node scripts/xxx.mjs`）。本地能跑的 PowerShell 脚本不代表 CI 能跑。
- **PowerShell 5.1 偶发 PATH 丢失**：跑 npm 前先执行
  `$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")`
- **验证部署**：用 pages.dev 域名 + `?ts=N` 查询参数绕 CDN 缓存；wikiandroid.com 有缓存延迟。
- **shiki 缺 aidl/gradle highlighter 警告**：无害，不阻塞构建。
- **首页 hero 图片**：`src/README.md` 的 `heroImage` 字段控制，已移除。
- **版权署名**：`theme.ts` 的 `author.name` / `copyright.author` 控制。

## 6. 未来计划（候选，待用户确认）

- [ ] 可选：扩充更多模块（如「音视频开发」「Kotlin Multiplatform」「大前端/跨端」）
- [x] 可选：补充 README 精选文章推荐位（已实现：根 README 含精选文章表）
- [ ] 可选：多语言支持（zh-CN / en）
- [ ] 可选：图标库 `iconAssets: "iconify"` 弃用提示修复（新写法 `plugins.icon.assets`）
