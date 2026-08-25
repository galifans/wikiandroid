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
| 版权署名 | Copyright © 2026 WikiAndroid（MIT License） |
| 品牌色 | Android 绿渐变 `#3DDC84 → #0B7A3B`，图标为白色 W 字母 |

---

## 2. 目录结构总览（代码即真相）

```
galifans_vibe_coding/
├── architecture.md              # 本文档（站点结构权威索引）
├── PROGRESS.md                  # 项目进展与记忆（进展时间线 / 文章记录 / 踩坑经验）
├── agent.md                     # Agent 行为约束
├── README.md                    # 🏠 GitHub 首页（与 wikiandroid.com 同源：内容板块 + 书籍索引 + wikiStatic 目录树）
├── package.json                 # 依赖与脚本（dev / build / clean / sync:static）
├── .gitignore                   # 忽略 node_modules / .cache / .temp / dist
├── scripts/
│   ├── gen-icons.ps1            # 图标生成脚本（favicon.svg 同款设计 → PNG）
│   ├── prepare-public.mjs      # 构建前复制 wikiStatic/books/ → src/.vuepress/public/books/（网站直链下载）
│   └── sync-wikistatic.mjs     # wikiStatic 同步脚本（md 同步 + README 目录树自动刷新，跨平台 Node）
├── wikiStatic/                  # 📦 静态资料库（GitHub 直接浏览/下载，内容与 src/ 同源，详见第 8 节）
│   ├── README.md                # wikiStatic 总索引（含自动生成的目录树）
│   ├── books/                   # 📚 书籍资源（PDF 点击直接下载；来源 TIM168/technical_books）
│   │   ├── README.md            # 书籍索引（算法 / Java / 网络 / 数据库 …）
│   │   ├── algorithm/ java/ network/ database/              # 已收录 PDF
│   │   └── android/ architecture/ language/ system/         # 目录已建，PDF 待补充
│   └── <模块目录>/              # 各知识模块 md 镜像（roadmap / language / android / ui / jetpack / network / advanced / system / engineering / interview / projects / about）
└── src/                         # 站点源码根（VuePress docsDir）
    ├── README.md                # 🏠 首页（hero + 12 张功能卡片 + 精选文章）
    ├── .vuepress/               # 站点配置目录
    │   ├── config.ts            # 站点基础配置（title/description/head/favicon）
    │   ├── theme.ts             # 主题配置（author/footer/copyright/plugins）
    │   ├── navbar.ts            # 顶部导航栏（唯一手工维护的导航源）
    │   ├── sidebar.ts           # 侧边栏（全部模块用 "structure" 自动生成）
    │   └── public/              # 静态资源（logo.svg / favicon.svg / 图标 PNG）
    ├── roadmap/                 # 🗺️ 学习路线
    ├── language/                # ☕ 语言基础（kotlin / java / algorithm）
    ├── android/                 # 🧱 Android 核心（四大组件 + Fragment + 存储）
    ├── ui/                      # 🎨 UI 与渲染（view / event / custom-view / animation / layout / compose）
    ├── jetpack/                 # 🧩 Jetpack（lifecycle-viewmodel / room-datastore / paging-navigation / workmanager-hilt）
    ├── network/                 # 🌐 网络与异步（http / handler / coroutine / thread）
    ├── advanced/                # 🚀 进阶实战（architecture / modular / plugin / performance / stability / multimedia）
    ├── system/                  # ⚙️ 系统原理（binder / ams-wms / boot / apk / art）
    ├── engineering/             # 🛠️ 工程实践（gradle / git / cicd / testing）
    ├── interview/               # 💼 面试指南（7 篇平铺文章）
    ├── projects/                # 🤖 实战项目
    ├── books/                   # 📚 书籍资源板块页（PDF 实体存 wikiStatic/books/，双通道：网站直链 + GitHub）
    └── about/                   # 📎 关于本站（intro / contribution-guideline / faq）
```

**关键约定**：每个模块目录下都有一个 `README.md`，既是该模块的**索引页**（列出文章列表），
也是侧边栏 `structure` 自动生成时的**目录节点**。

---

## 3. 导航结构（navbar）

> 来源：`src/.vuepress/navbar.ts`（**唯一手工维护的导航源**，侧边栏无需手工维护）。

| # | 导航文案 | 路径 | 子项 | 说明 |
| --- | --- | --- | --- | --- |
| 1 | 🏠 首页 | `/` | — | 首页 |
| 2 | 🗺️ 学习路线 | `/roadmap/` | — | 3 条学习路线 |
| 3 | ☕ 语言基础 | — | Kotlin / Java / C++ / 设计模式 / 数据结构与算法 | 下拉菜单 |
| 4 | 🧱 Android 核心 | — | Activity / Service / BroadcastReceiver / ContentProvider / Fragment / Context / 进程 / 数据存储 | 下拉菜单 |
| 5 | 🎨 UI 与渲染 | — | View 绘制流程 / 事件分发机制 / 自定义 View / Bitmap / Window / 动画机制 / 布局优化 / Jetpack Compose | 下拉菜单 |
| 6 | 🧩 Jetpack | — | Lifecycle/ViewModel / Room/DataStore / Paging/Navigation / WorkManager/Hilt | 下拉菜单 |
| 7 | 🌐 网络与异步 | — | OkHttp/Retrofit / Handler 消息机制 / 协程 Flow/RxJava / 线程池与并发 | 下拉菜单 |
| 8 | 🚀 进阶实战 | — | 架构设计 / 组件化与模块化 / 插件化与热修复 / 性能优化 / 稳定性保障 / 音视频开发 | 下拉菜单 |
| 9 | ⚙️ 系统原理 | — | Binder 机制 / AMS/WMS / 系统与应用启动流程 / APK 打包与签名 / ART/DEX/类加载 / 操作系统 | 下拉菜单 |
| 10 | 🛠️ 工程实践 | — | Gradle 构建 / Git 与版本管理 / CI/CD / 测试体系 | 下拉菜单 |
| 11 | 💼 面试指南 | `/interview/` | — | 平铺 7 篇文章 |
| 12 | 🤖 实战项目 | `/projects/` | — | 平铺文章 |
| 13 | 📚 书籍资源 | `/books/` | — | 分类索引 + 直链下载（PDF 实体存 `wikiStatic/books/`） |
| 14 | GitHub | https://github.com/galifans/wikiandroid | — | 外链 |

> 注：`/about/` 不在导航栏中，通过首页「📎 关于本站」功能卡片与链接访问。

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
模块下的 `README.md` 充当侧边栏的父节点，其 `title` 作为节点名称。

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

> ✅ = 已完成文章　⏳ = 待更新文章（README 中标记「（待更新）」，链接暂为死链，构建时仅产生 warning，不阻塞）

### 🗺️ 学习路线 `/roadmap/`
- ✅ android-roadmap.md（Android 学习路线 2026）
- ✅ kotlin-roadmap.md（Kotlin 学习路线）
- ✅ compose-roadmap.md（Jetpack Compose 学习路线）

### ☕ 语言基础 `/language/`
| 子模块 | ✅ 已完成 |
| --- | --- |
| kotlin/ | kotlin-basics.md、kotlin-coroutines.md、kotlin-generics.md、kotlin-extensions.md |
| java/ | java-basics.md、java-collections.md、java-concurrency.md |
| algorithm/ | algorithm-guide.md、leetcode-top100.md |

### 🧱 Android 核心 `/android/`
| 子模块 | ✅ 已完成 |
| --- | --- |
| activity/ | activity-lifecycle.md、task-stack.md、activity-launch-process.md |
| service/ | service-basics.md、foreground-service.md、aidl.md |
| broadcast/ | broadcast-basics.md、register-comparison.md |
| content-provider/ | content-provider-basics.md |
| fragment/ | fragment-basics.md、fragment-pitfalls.md |
| storage/ | storage-comparison.md、sp-vs-datastore.md |

### 🎨 UI 与渲染 `/ui/`
| 子模块 | ✅ 已完成 |
| --- | --- |
| view/ | view-draw-process.md、view-viewgroup.md、measurespec.md |
| event/ | event-dispatch.md、conflict-solution.md |
| custom-view/ | custom-view-guide.md、custom-viewgroup.md |
| animation/ | property-animation.md |
| layout/ | layout-optimization.md |
| compose/ | compose-basics.md、compose-state.md、compose-performance.md |

### 🧩 Jetpack `/jetpack/`
| 子模块 | ✅ 已完成 |
| --- | --- |
| lifecycle-viewmodel/ | viewmodel-livedata.md、savedstate.md、lifecycle.md |
| room-datastore/ | room-guide.md、datastore-guide.md |
| paging-navigation/ | paging3.md、navigation.md |
| workmanager-hilt/ | workmanager.md、hilt.md |

### 🌐 网络与异步 `/network/`
| 子模块 | ✅ 已完成 |
| --- | --- |
| http/ | retrofit-okhttp.md、okhttp-interceptor.md、http-protocol.md |
| handler/ | handler-source.md、handlerthread.md |
| coroutine/ | flow-advanced.md、rxjava-operators.md |
| thread/ | thread-pool.md、locks.md、concurrency-tools.md |

### 🚀 进阶实战 `/advanced/`
| 子模块 | ✅ 已完成 |
| --- | --- |
| architecture/ | architecture-evolution.md、clean-architecture.md、repository-pattern.md |
| modular/ | modularization-practice.md |
| plugin/ | plugin-principle.md、hotfix-comparison.md |
| performance/ | startup-optimization.md、memory-optimization.md、jank-optimization.md、apk-size-optimization.md |
| stability/ | crash-monitoring.md、anr-guide.md |
| multimedia/ | multimedia-basics.md |

### ⚙️ 系统原理 `/system/`
| 子模块 | ✅ 已完成 |
| --- | --- |
| binder/ | binder-mechanism.md、aidl-deep.md |
| ams-wms/ | ams-activity-launch.md、wms-principle.md |
| boot/ | system-boot.md、app-launch.md |
| apk/ | apk-build-process.md、multi-channel.md |
| art/ | art-runtime.md、dex-format.md、classloader.md |

### 🛠️ 工程实践 `/engineering/`
| 子模块 | ✅ 已完成 |
| --- | --- |
| gradle/ | gradle-basics.md、version-catalog.md |
| git/ | git-workflow.md、git-cheatsheet.md |
| cicd/ | github-actions.md |
| testing/ | unit-testing.md、ui-testing.md |

### 💼 面试指南 `/interview/`（平铺）
- ✅ android-knowledge-summary.md（Android 知识点汇总：19 大主题回顾清单，链接全部详细文章）
- ✅ basics.md（基础篇）✅ advanced.md（进阶篇）✅ source-code.md（源码篇）
- ✅ interview-plan.md（面试准备计划）✅ resume-guide.md（简历建议）✅ company-experience.md（大厂面经实录）

### 🤖 实战项目 `/projects/`
- ✅ from-scratch.md（从零搭建 App）
- ✅ open-source-analysis.md（开源项目源码解析）

### � 书籍资源 `/books/`
- ✅ src/books/README.md（网站板块页：分类索引 + 直链下载；PDF 实体存 `wikiStatic/books/`，来源 TIM168/technical_books）

### 📎 关于本站 `/about/`
- ✅ intro.md　✅ contribution-guideline.md　✅ faq.md

**现状统计**：✅ 全部文章已完成（约 183 篇 + 各模块 README + 书籍板块页，构建 248 页面），无「（待更新）」占位文章，构建无 broken-link warning。

---

## 7. 常见修改操作手册

### 7.1 新增一篇普通文章
1. 在对应模块目录创建 `xxx.md`，frontmatter 写 `icon` + `title`（+ `description`）。
2. 更新该模块 `README.md` 的「文章列表」，去掉「（待更新）」或新增条目。
3. 若文章值得推荐，同步更新首页 `src/README.md` 的「📌 精选文章」对应小节。
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
- 版权行：`theme.ts` 的 `author.name`（theme-hope 据此自动生成 `Copyright © <year> <name>`）；`copyright.author` 同步改。
- 页脚：`theme.ts` 的 `footer`（当前为 `GitHub | MIT License`）。
- 站点标题：`config.ts` 的 `title`。
- 图标：替换 `public/logo.svg` / `public/favicon.svg`（用 `scripts/gen-icons.ps1` 重新生成 PNG）。

### 7.6 更新「待更新」文章为正式文章
- 创建文章文件，更新模块 README 移除「（待更新）」标记，即可消除对应 broken-link warning。

### 7.7 书籍资源管理（双通道下载）
- PDF **只存一份**在 `wikiStatic/books/<分类>/`（真相源）；
- 构建时 `prebuild`（`scripts/prepare-public.mjs`）自动复制到 `src/.vuepress/public/books/` → 发布为 `https://wikiandroid.com/books/*.pdf`（Cloudflare CDN 直链）；
- 三处索引同步维护：`wikiStatic/books/README.md`、`src/books/README.md`（网站板块页）、根 `README.md`（书籍表）——每本书给「网站直链 + GitHub 备用」双链接；
- **Cloudflare Pages 单文件上限 25 MiB**：收录书籍 PDF 必须小于 25 MiB（当前最大 hello-algo.pdf 15.5MB），超限书籍不收录、只保留源仓库链接；
- 新增书籍：PDF 放入 `wikiStatic/books/<分类>/` → 更新三处索引 → `npm run build` 验证 → 提交推送。

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

- ✅ 所有占位文章已补齐，「待更新」死链 warning 已消除。
- `theme.ts` 中 `iconAssets: "iconify"` 有弃用提示（新写法为 `plugins.icon.assets`），暂不影响功能。
- 终端偶发 PATH 丢失（PowerShell 5.1），运行 npm 前先刷新 PATH。
