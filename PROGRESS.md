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
| 构建命令 | `npm run build` → 输出 `src/.vuepress/dist`（当前 248 页面） |
| 本地预览 | `npm run dev` → http://localhost:8080 |
| 当前状态 | ✅ 内容建设完成（183 篇文章），持续维护中 |

## 2. 进展时间线

### 2026-08-26（Android 核心板块 16 篇文章内容全面扩充完善）
- ✅ 用户反馈：网站刚建立，Android 核心板块很多文章内容敷衍，要求不投喂 md、由模型自行输出完整详细的学习资料，做到"非常完善"
- ✅ 全板块质量审计：16 篇文章按质量分级——6 篇偏薄（<110 行）需重写，10 篇达标需增强
- ✅ 批次 1（Activity 3 篇）：`activity-lifecycle.md` 重写（75→450 行：生命周期全景 mermaid、11 种典型场景回调顺序表、配置变更与状态保存 4 方案、四种启动模式、Intent Flags、Lifecycle 组件、Q1-Q8）；`task-stack.md` 增强（Task vs 进程/线程表、跨应用 Task、allowTaskReparenting、多窗口模式适配）；`activity-launch-process.md` 增强（冷启动耗时拆解、Android 12+ 启动变化、Activity Result API）
- ✅ 批次 2（Service 3 篇）：`service-basics.md` 重写（102→450 行：最大误区、两种使用方式、onStartCommand 返回值、绑定通信、8.0+ 后台限制、Service 与协程配合、Q1-Q6）；`foreground-service.md` 增强（FGS 类型总表、Android 15 超时机制、BOOT_COMPLETED 正确姿势）；`aidl.md` 增强（@Parcelize 现代写法、Binder 线程池安全）
- ✅ 批次 3（Broadcast + ContentProvider 3 篇）：`broadcast-basics.md` 增强（AMS 底层分发 sequenceDiagram、广播安全实践、onReceive 超时精确数值与 goAsync）；`register-comparison.md` 增强（静态注册替代方案表、动态注册进程优先级影响）；`content-provider-basics.md` 增强（applyBatch 批量操作、Provider onCreate 先于 Application 的源码时序图、App Startup 优化）
- ✅ 批次 4（Fragment 2 篇）：`fragment-basics.md` 重写（87→370 行：实例/View 生命周期分离核心概念、三个 FragmentManager 对比、commit 三种方式、四种通信方式、状态保存、ViewPager2、单 Activity 架构、Q1-Q7）；`fragment-pitfalls.md` 增强（新增 setMaxLifecycle/ViewPager2 离屏页、viewLifecycleOwner 时序两个坑点 + Q5/Q6）
- ✅ 批次 5（Storage/Process/Context 5 篇）：`sharedpreferences-deep.md` 重写（63→330 行：单例缓存、apply 的 QueuedWork ANR 根因、MODE_MULTI_PROCESS 真相、DataStore 替代）；`storage-comparison.md` 增强（新增分区存储 Scoped Storage 章节 + Q6-Q8）；`sp-vs-datastore.md` 已达标准；`process-lifecycle.md` 重写（102→400 行：五级优先级 mermaid、ADJ 全表、多进程问题表、保活方案演进与 8.0+ 现实、Q1-Q8）；`context-overview.md` 重写（75→350 行：继承体系 mermaid、ContextWrapper 代理、类型对比、泄漏案例、getSystemService 原理、Q1-Q8）
- ✅ 批次 6：`android/README.md` 篇数修正（17→16）+ 全部文章描述更新；8 个子模块 README 核心要点同步更新
- ✅ 文章风格统一：mermaid 图（stateDiagram/sequenceDiagram/flowchart）、对比表格、Kotlin 代码、高频面试题带详解、小结、跨板块交叉链接（/android/fragment/、/jetpack/、/system/ 等）
- ✅ `npm run build` 构建 248 页面成功；浏览器实测 context/fragment/process 新页面渲染正常（目录、mermaid、阅读时间均正确）；`npm run sync:static` 已同步 wikiStatic
- ⚠️ 注意：构建日志中的 `Missing aidl/gradle/proguard highlighter` 为 shiki 高亮语言缺失警告，不影响构建与渲染

### 2026-08-26（Jetpack Compose 移入 Jetpack 板块 + 旧链接重定向 + Google 文档风格字体 + 正文排版优化）
- ✅ 用户反馈：① Compose 应归入 Jetpack 板块（"需要更新一下位置"）；② 界面排版内容有些拥挤（正文行距太密）；③ 想用 Google 文档同款字体
- ✅ 结构迁移：`git mv src/ui/compose/* → src/jetpack/compose/`（README + compose-basics/state/performance 共 4 文件，内容不变）；compose README frontmatter `dir.order: 8 → 1`（Jetpack 侧边栏首位）
- ✅ 引用更新（7 处）：`navbar.ts`（UI 下拉删 Jetpack Compose → Jetpack 下拉首位）；`src/README.md` 首页（UI feature 描述去掉 Compose，Jetpack feature 文案含 Compose + 链接 `/jetpack/compose/`，底部文章列表链接）；`ui/README.md`（现代 UI 分支删除 Compose，改 `> 💡 声明式 UI 开发见 [Jetpack Compose](/jetpack/compose/)`）；`jetpack/README.md`（分类表加"声明式 UI"行 + 文章导航）；`roadmap/compose-roadmap.md`（链接）；`about/intro.md`（UI/Jetpack 描述）
- ✅ 旧链接重定向：`theme.ts` 新增 `plugins.redirect.config`（**注意：必须是 `Record<string,string>` 对象映射，不是数组**）——`/ui/compose/` → `/jetpack/compose/`、三个 `.html` 页逐一映射；构建生成 `dist/ui/compose/index.html` 等 redirect 文件；浏览器实测旧链接 302 落新地址
- ✅ 字体：Google Sans / Google Sans Text 是专有字体（官方 zh-CN 站实际回退 Noto Sans 家族），采用开源等价组合 **Roboto + Noto Sans SC**（`config.ts` head 加 preconnect + Google Fonts 样式表，权重 400;500;600;700 + display=swap 离线可回退）；`index.scss :root` 覆盖 `--vp-font` / `--vp-font-heading` 字体栈
- ✅ 排版：`index.scss` 新增 `.vp-page` 块——`p, li { line-height: 1.75 }`、`p { margin: 0.6em 0 }`、`h2 { margin-top: 1.5em }`（主题默认 line-height 1.6 + `p { margin: 0 }` 是"拥挤"根因）；浏览器实测 p 行高 28px、段距 9.6px、H2 26.4px/600
- ✅ 回归：/ui/ 侧边栏已无 Compose；Jetpack 下拉首位 = Jetpack Compose（概览/核心概念/性能/状态）；首页 Jetpack feature → /jetpack/compose/；页面信息（日期+阅读时间）不受影响
- ✅ `npm run build` 构建 248 页面成功；`npm run sync:static` 已同步 wikiStatic
- ⚠️ 注意：redirect 插件 `config` 类型为 `Record<string, string> | ((app) => Record<string, string>)`——用数组 `[{from,to}]` 构建虽成功但**不会生成任何 redirect 文件**（浪费一次构建）；主题内容容器是 `.vp-page`（本主题无 `.vp-doc` 类）

### 2026-08-26（页面 meta 精简：去作者 + 去贡献者 + 禁用 hover 悬浮提示）
- ✅ 用户反馈：① 页面顶部"WikiAndroid / 2026/8/26 / 大约 1 分钟"鼠标悬停弹出提示内容很鸡肋（文字本身已表达含义）；② 去掉作者（站点即 WikiAndroid，每页重复）；③ 去掉"贡献者: galifans"（底部已有 GitHub 链接）
- ✅ 顶部信息：`theme.pageInfo: ["Date", "ReadingTime"]` 去掉 Author——只剩"写作日期📅 + 阅读时间⌛"，作者不再渲染（浏览器实测 `page-author-info` 不存在）
- ✅ hover 悬浮提示：主题用 balloon.css（`[aria-label][data-balloon-pos]`）渲染 tooltip，在 `index.scss` 新增 `.page-info [aria-label][data-balloon-pos]` 禁用——`::before/::after` 隐藏（`display: none !important`）、`cursor: default`，仅作用于页面信息项不影响其他组件；实测 hover 无气泡弹出、图标与日期文本正常显示
- ✅ 贡献者：`plugins.git: { contributors: false }` 关闭——底部只剩"在 GitHub 上编辑此页 + 最近更新"，实测无"贡献者"
- ✅ 回归：/android/activity/ 概览页 + 首页均无作者/贡献者；首页无 page-info 不受影响
- ✅ `npm run build` 构建 248 页面成功；`npm run sync:static` 已同步 wikiStatic
- ⚠️ 注意：theme-hope 的 git 插件 contributors 配置项在 `plugins.git`（GitPluginOptions.contributors），而非 frontmatter

### 2026-08-26（侧边栏嵌套分组选中后字号回退修复）
- ✅ 用户反馈：java 板块选中"子级的子级"（如 JVM 分组内文章）后，子级分组（JVM）本身字体变大——要求字体全程不变化、不放大
- ✅ 根因：嵌套子分组字号规则用了 `:not(.active)`（`.vp-sidebar-group .vp-sidebar-group > .vp-sidebar-header:not(.active)`），选中后按钮带 active 类 → 规则失效 → 字号回退到主题继承值（侧边栏 0.94rem ≈ **15.04px**，实测选中前 14px → 选中后 15.04px）
- ✅ 修复：去掉 `:not(.active)`，嵌套子分组字号**无条件固定 14px**；选中加粗改用嵌套 `&.active { font-weight: 600 }`（特异性更高，覆盖 400 字重）——字号始终 14px，选中仅加粗
- ✅ 浏览器实测（/language/java/jvm/）：JVM（active）14px/600，其余嵌套分组 14px/400，深链接全部 14px（active 仅加粗），大类 Java 17px/600
- ✅ 回归：/android/context/ 板块全部链接 14px、单绿（仅当前页链接）保持
- ✅ `npm run build` 构建 248 页面成功；`npm run sync:static` 已同步 wikiStatic
- ⚠️ 教训：自定义字号/字重规则**不要用 `:not(.active)` 排除选中态**，否则选中后回退到主题继承值（0.94rem≈15.04px）导致"选中变大"；字号要无条件固定，选中态只改变字重等其他属性

### 2026-08-25（侧边栏层级优化：嵌套子分组取消加粗、选中态才加粗）
- ✅ 用户反馈：语言基础 > Java 下的嵌套子分组（Java 并发/Java 集合等）与大类 Java 同为黑色加粗、同字号，层级混乱；建议吸收 Google 官方文档风格——大类与子级偏灰黑、大类加粗、子级不加粗、子级选中后才加粗
- ✅ 实测官方文档（developer.android.google.cn）侧边栏：子级链接 `#202124` 灰黑 / 400 常规 / 14px；选中项 700 加粗 + 淡蓝背景（nav-active）
- ✅ 修改（`src/.vuepress/styles/index.scss`）：嵌套子分组 `.vp-sidebar-group .vp-sidebar-group > .vp-sidebar-header:not(.active)` 降为 14px + 400 常规（与大类 17px/600 区分）；新增 `.vp-sidebar-link.active, .vp-sidebar-header.active { font-weight: 600 }` 子级选中后加粗；焦点规则移除 `font-weight: 600`（子级点击仅变色反馈，不加粗）；文字色沿用主题 `var(--vp-c-text)`（亮色 #3c3c43 灰黑，暗色自动切换，不写死避免破坏暗色模式）
- ✅ 浏览器验证（/language/java/）：大类 Java 17px/600；嵌套子分组 Java 并发/基础/集合/JVM 全部 14px/400；JVM 页（嵌套分组内文章）JVM 按钮 active → 600 加粗 + 子级链接 600 加粗 + 绿高亮；焦点点击嵌套分组 → 绿背景但保持 400
- ✅ 回归验证：/android/activity/ 完整场景（点数据存储→点 Activity）仍仅「概览」一个绿元素；叶子链接仍无 `›` 箭头
- ✅ `npm run build` 构建 248 页面成功；`npm run sync:static` 已同步 wikiStatic

### 2026-08-25（侧边栏箭头修正 + 大类加粗 + 焦点双重高亮根因修复）
- ✅ 用户反馈 3 问题：① 所有子级右侧都有 `›` 箭头（哪怕无法展开）；② 大类可仿官方文档稍微加粗；③ 点击「数据存储」后再点「Activity」，Activity 与子级「概览」同时绿色背景（焦点双重高亮），要求找到根因
- ✅ 修复 1（箭头仅限有内容）：`::after` 从 `.vp-sidebar-link:has(> .vp-icon)` 移到 `&:has(> ul)`——叶子链接无箭头（浏览器实测数据存储 4 子级 `content: none`）；站内更深内容（如 /language/java/ 的 Java 并发/基础/集合/JVM）为 `li > section` 嵌套分组，自带主题 `.vp-arrow` chevron（display: block），"有内容"的子级仍有展开指示
- ✅ 修复 2（大类加粗）：`.vp-sidebar-header { font-weight: 600 }`（17px 加粗，仿官方文档层级，浏览器实测 600）
- ✅ 修复 3（焦点根因）：根因 = 按钮 `:focus` 自绘绿背景 **叠加** 主题路由类 `.active`（当前页所在分组按钮必 active）+ 其子级 active 链接的主题 accent-soft 背景 → 双重绿色。改用 `.vp-sidebar-header:focus:not(.active)`：非当前板块点击仍有绿色反馈（实测数据存储点击后 bg rgba(20,184,110,0.14)）；当前板块按钮（含 .active）点击仅 hover 浅灰（--vp-c-control），不再叠绿；最终任意场景仅剩**一个**绿色元素（当前页 active 条目/链接）
- ✅ 完整用户场景验证：点击数据存储 → 点击 Activity → 全侧边栏仅「概览」链接绿色，无按钮残留绿背景
- ✅ `npm run build` 构建 248 页面成功（13.56s）；`npm run sync:static` 已同步 wikiStatic
- ⚠️ 教训：侧边栏分组按钮的 `.active` 是**路由驱动**（当前页所在分组），与展开/折叠无关；自定义 :focus 样式必须 `:not(.active)` 避免与路由高亮叠加

### 2026-08-25（侧边栏子级标识：数字改右侧箭头）
- ✅ 用户反馈数字标号太丑，改为右侧 `›` 箭头（仿 Android 官方文档导航的 chevron 指示），表明"这是一个子级条目（点开还有内容）"
- ✅ 移除 counter 数字方案（.vp-sidebar-group > ul 的 counter-reset/increment 与 ::before 序号）
- ✅ 新方案：`.vp-sidebar-link:has(> .vp-icon)` 改 `display: block; position: relative`，`::after { content: "›"; position: absolute; right: 8px; top: 50%; transform: translateY(-50%) }`，灰色 `--vp-c-text-mute`；`&:hover::after, &.active::after` 变绿（`--vp-c-accent`）
- ✅ 悬挂缩进恢复图标版：`padding-left: calc(8px + 1em + 4px); text-indent: calc(-1em - 4px)`（14px 下 26px/-18px），换行对齐仍精确（浏览器实测「数据存储」4 子级文本两行均 45px，箭头位于链接右缘 272px 处）
- ✅ 兼容性验证：箭头不重叠文本（right: 8px 位于 padding 区）；折叠/展开、`:focus` 点击高亮均不受影响；interview 平铺链接同样获得箭头（视觉统一）
- ✅ `npm run build` 构建 248 页面成功；`npm run sync:static` 已同步 wikiStatic

### 2026-08-25（侧边栏焦点规则修正：当前页面唯一高亮）
- ✅ 修正 :has(> ul) 方案的副作用：该方案在"当前页所在分组"必然展开时，会导致大类 + 概览/子级**双重绿色高亮**（下拉导航到概览页时大类+概览都绿；选子级后大类+子级都绿）
- ✅ 改用 `.vp-sidebar-header:focus`（绿色 + accent-soft 背景 + 600 字重）：点击大类按钮（获得焦点）→ 大类绿色反馈；选择子级/概览（页面导航，按钮失焦）→ 大类自动取消，仅当前页面对应链接（active）绿色
- ✅ 行为总结：**焦点始终停留在当前页面条目**（大类点击瞬间 / 或子级/概览激活时），三类场景浏览器实测通过：① 下拉导航直达概览 → 仅概览绿；② 点击大类 → 大类绿；③ 选择子级 → 仅子级绿
- ⚠️ 注意：JS `element.click()` 不会聚焦按钮，验证 :focus 行为必须用真实用户点击（Playwright `getByRole().click()`）
- ✅ `npm run build` 成功；`npm run sync:static` 已同步 wikiStatic

### 2026-08-25（侧边栏层级与展开焦点优化）
- ✅ 字体层级区分：分组标题（栏目）17px vs 子级链接 14px（原 16.5/15px 过于接近），`src/.vuepress/styles/index.scss`
- ✅ 展开分组焦点（初版）：`.vp-sidebar-group:has(> ul) > .vp-sidebar-header` 绿色高亮——后因"当前页所在分组必展开"导致双重高亮，已在本日后续「焦点规则修正」条目中改用 `:focus` 方案
- ✅ 悬挂缩进自适应：`padding-left: calc(8px + 1em + 4px); text-indent: calc(-1em - 4px)` 随字号缩放（14px 下 -18px/26px），换行对齐仍精确（图标 27 / 文本两行 45）
- ✅ `npm run build` 成功；`npm run sync:static` 已同步 wikiStatic
- ⚠️ 教训：active 类基于路由（点击切换展开不会更新）；展开态（ul 存在与否）虽由点击驱动，但"当前页所在分组必展开"会致双重高亮（详见下一条目修正）

### 2026-08-25（侧边栏/标题换行对齐修复）
- ✅ 问题定位：侧边栏文件链接的图标为 inline-block（16px 图标 + 4px 间距），换行后第二行回到内容左边缘（图标之前），与第一行文本错位 20px；页面标题前的 icon 装饰渲染为空占位 + 8.8px margin，换行同样错位
- ✅ 侧边栏修复：`.vp-sidebar-link:has(> .vp-icon)` 悬挂缩进（`padding-left: 28px; text-indent: -20px`），图标 27px / 两行文本 46/47px 对齐（浏览器实测「RecyclerView 优化与 ListView 对比」「SharedPreferences 深度剖析」）
- ✅ 页面标题修复：`.vp-page-title h1 > .vp-icon { display: none }` 隐藏空 icon 装饰，标题文本从内容左边缘开始（1000px 窄视口实测两行 360/360 对齐，修复前 370/379 错位）
- ✅ `npm run build` 成功；`npm run sync:static` 已同步 wikiStatic
- ⚠️ 教训：`getClientRects()` 换行 rect 数量 = 行数，可精确测量每行左偏移；悬挂缩进只对 icon 宽度固定的场景可靠，icon 宽度不定时（如页面标题 icon 渲染失败）直接隐藏更稳

### 2026-08-25（导航体验优化：文案统一 + 顺序对应 + 概览子级 + 换行修复）
- ✅ 问题 1 文案统一：navbar 与侧边栏不一致的 3 处统一为页面标题（View 绘制流程→**View 体系**、OkHttp/Retrofit→**网络与协议**、C++→**C++ 知识点**），`src/.vuepress/navbar.ts`
- ✅ 问题 2 顺序对应：45 个子模块 README 添加 `dir.order`（严格按 navbar.ts 下拉顺序 1..N），8 大板块侧边栏顺序与下拉完全一致（浏览器逐板块验证 match=true）
- ✅ 问题 3 重名子级：45 个子模块 README 添加 `shortTitle: 概览` + `dir.text`，展开后第一个子级统一显示「概览」而非重复模块名（theme-hope 机制：文件链接文本 = `shortTitle ?? title`，分组标题 = `dir.text ?? shortTitle ?? title`）
- ✅ 问题 4 长标题换行：`src/.vuepress/styles/index.scss` 添加 `overflow-wrap: anywhere; word-break: break-word`，长标题（如「RecyclerView 优化与 ListView 对比」）换行不再溢出
- ✅ `npm run build` 构建 248 页面成功；`npm run sync:static` 已同步 wikiStatic；architecture.md 侧边栏规则表新增 frontmatter 说明

### 2026-08-25（导航一致性修复：navbar 与侧边栏对齐）
- ✅ 审计全部板块：navbar 手工维护的下拉与侧边栏（structure 自动生成）存在 4 处不一致，补齐缺失入口：语言基础 +C++、Android 核心 +Context/进程、UI 与渲染 +Bitmap/Window、系统原理 +操作系统（`src/.vuepress/navbar.ts`）
- ✅ 修复侧边栏"左侧未对齐"：5 个子模块 README（android/context、android/process、system/os、ui/bitmap、ui/window）缺少 `icon` frontmatter，导致侧边栏分组按钮无图标、与其他分组文字错位；已按模块风格补上（box/gears/server/image/window）
- ✅ `npm run build` 构建 248 页面成功；`npm run sync:static` 已同步 wikiStatic；`architecture.md` navbar 表格同步更新

### 2026-08-25（Android 知识点汇总归纳 + 内容缺口补齐）
- ✅ 读取桌面 `Android-Review-master/Docs/Android知识点汇总.md`（2494 行）全文，逐主题审计站内覆盖情况（19 大主题约 95% 已有对应文章）
- ✅ 新增 `src/interview/android-knowledge-summary.md`：「Android 知识点汇总」19 大主题系统回顾清单（考点表格 + 高频追问 + 全部详细文章链接），面试前查漏补缺
- ✅ 补齐三处内容缺口：Service `onStartCommand` 三种返回值表、ContentProvider 与 SQL 区别 / Binder 线程池 Q&A、WebView 本地资源替代（shouldInterceptRequest）加载优化
- ✅ `src/interview/README.md` 新增汇总文章入口；构建 248 页面成功；`npm run sync:static` 已同步 wikiStatic
- ✅ 修正 PROGRESS.md / architecture.md 文档漂移（150 → 248 页面，文章规模表按实际目录重新统计）

### 2026-08-24（脚本跨平台化：修复 Cloudflare 构建失败）
- ✅ 修复 Cloudflare Pages 构建失败（`sh: 1: powershell: not found`，exit 127）：CI 是 Linux 环境，PowerShell 脚本不可用
- ✅ `scripts/prepare-public.ps1` / `sync-wikistatic.ps1` → 重写为跨平台 Node 脚本 `prepare-public.mjs` / `sync-wikistatic.mjs`，`package.json` 改用 `node scripts/...`
- ✅ 目录树输出与旧版完全一致（无漂移），本地构建 150 页面成功

### 2026-08-24（书籍网站直链 + 首页 README 直接阅读改造）
- ✅ 网站直链下载：新增 `scripts/prepare-public.mjs`（`prebuild` 钩子，构建时自动把 `wikiStatic/books/` 复制到 `src/.vuepress/public/books/`）→ 书籍可在 wikiandroid.com 直接下载（Cloudflare CDN）；`src/.vuepress/public/books/` 已 gitignore
- ✅ 首页 README 改造：**移除所有 wikiandroid.com 板块跳转链接**，改为「知识库速览」直接内联各板块核心内容（表格 + 学习路径 + 最佳实践），全部链接指向仓库内 `wikiStatic/`（77 个链接已验证有效）
- ✅ `wikiStatic/books/README.md` 同步去掉网站直链，保持纯 GitHub 内阅读体验
- ✅ 构建 150 页面成功；Cloudflare Pages 单文件限制 25MiB（当前最大书 15.5MB）已记录到 architecture.md 7.7 节

### 2026-08-24（书籍板块 + wikiStatic 静态资料库）
- ✅ 新增「📚 书籍资源」板块：`src/books/README.md` 网站板块页（直链下载）+ navbar/sidebar 接入
- ✅ 建立 `wikiStatic/` 静态资料库：模块 md 镜像（147 个）+ `books/` 书籍 PDF（7 本已收录，约 33MB）
- ✅ 新增 `scripts/sync-wikistatic.mjs` + `npm run sync:static`：md 同步 + 根 README / wikiStatic README 目录树自动刷新（WIKISTATIC_TREE 标记区间）
- ✅ 根 `README.md` 重写：三种学习方式 + 内容板块表（同源）+ 书籍资源表 + wikiStatic 目录树 + Star 号召
- ✅ `agent.md` 新增第 11 节「wikiStatic 静态资料库与 README 同步规范」；`architecture.md` 同步更新
- ✅ 构建 150 页面成功（含书籍板块页），同步脚本验证通过

### 2026-08-23（首日建设）
- ✅ 完成站点框架搭建（VuePress + Theme Hope + Cloudflare Pages 部署）
- ✅ 品牌建设：favicon（绿色渐变 W 标志）、版权署名、首页 hero
- ✅ 补齐全部 71 篇占位文章（9 大模块），移除所有「（待更新）」标记
- ✅ 同步 `architecture.md` 文章状态表（全部 ✅）
- ✅ 统一项目名：`android-stuff` → `wikiandroid`（package.json / package-lock.json）
- ✅ 移除首页 hero 图片与项目介绍页技术栈小节（用户要求精简）

## 3. 内容建设记录

### 文章规模（构建渲染 248 页面，2026-08-25 按实际目录重新统计）
| 模块 | 文章数 | 说明 |
| --- | --- | --- |
| roadmap/ | 3 | 学习路线（Android / Kotlin / Compose） |
| language/ | 59 | Kotlin / Java / 设计模式 / 并发 / 集合 / JVM / 算法 / C++ |
| android/ | 16 | 四大组件 + Fragment + 存储 + 进程 / Context |
| ui/ | 18 | View / 事件 / 自定义 / 动画 / 布局 / Compose / Window / Bitmap / WebView |
| jetpack/ | 9 | Lifecycle / Room / Paging / WorkManager / Hilt |
| network/ | 14 | OkHttp / Retrofit / Handler / 协程 / 线程 |
| advanced/ | 16 | 架构 / 组件化 / 性能 / 稳定性 / 多媒体 / 插件化 |
| system/ | 16 | Binder / AMS / WMS / 启动 / APK / ART / OS |
| engineering/ | 9 | Gradle / Git / CI/CD / 测试 |
| interview/ | 7 | 面试指南（含知识点汇总） |
| projects/ | 2 | 实战项目 |
| reading-notes/ | 11 | 读书笔记 |
| books/ | 1 | 📚 书籍资源板块页（PDF 实体存 wikiStatic/books/，直链下载） |
| about/ | 3 | 关于本站 |
| **合计** | **183** | 非 README 文章页面（另有各模块 README 索引页） |

### 文章模板（每篇均包含）
- frontmatter：`icon`（iconify）+ `title` + `description`
- 正文：面试高频指数 ⭐、emoji 章节标题、Kotlin 代码示例、对比表格、高频面试题 Q&A（Q1-Q5）、小结
- 内容为**原创中文教育文章**（参考 GitHub 高星仓库知识结构，非翻译，版权安全）

## 4. 关键提交记录

| Commit | 说明 |
| --- | --- |
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
