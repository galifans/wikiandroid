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
