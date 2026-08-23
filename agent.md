# Agent 行为约束（agent.md）

> 本文件约束 AI 编程助手（如 GitHub Copilot / Cursor 等 Agent）在本仓库中的行为规范。
> 目的是让 Agent 的输出与站点风格、架构、流程保持一致，避免破坏性改动。

---

## 1. 工作前必读

- **先读 `architecture.md`**：任何涉及站点结构、导航、模块、文章的操作，必须先阅读该文档了解全站结构。
- 涉及导航/侧边栏时，再读 `src/.vuepress/navbar.ts` 与 `src/.vuepress/sidebar.ts`。
- 修改某模块内容前，先读该模块的 `README.md`（模块索引页）。

## 2. 语言与风格

- 与用户交流**使用简体中文**；代码、标识符、commit message 用英文。
- 站内所有用户可见文案一律**简体中文**（页面标题、描述、文章正文、导航文案）。
- 代码风格：TypeScript + 4 空格缩进（与现有 `src/.vuepress/*.ts` 保持一致）。

## 3. 品牌约束（不可破坏）

- 站点名恒为 **WikiAndroid**；**严禁**出现 "AndroidStuff" 或其他旧名。
- 品牌色：Android 绿渐变 `#3DDC84 → #0B7A3B`，图标为白色 W 字母。
- 版权署名：`Copyright © 2026 WikiAndroid`（如用户未明确要求，不得更改）。
- 页脚固定内容：`GitHub | MIT License`（指向 https://github.com/galifans/wikiandroid）。

## 4. 结构变更规范

- **新增文章**：在对应模块目录建 `.md`（frontmatter 含 `icon` + `title`）→ 更新模块 `README.md` 文章列表 → 如为精选文章同步更新首页 `src/README.md`。
- **新增模块**：建目录 + `README.md` → 更新 `navbar.ts` → 在 `sidebar.ts` 加一行 `"/xxx/": "structure"` → 按需更新首页 features。
- **调整导航**：只改 `navbar.ts`，侧边栏由目录自动生成、无需手工维护。
- **任何结构性变更完成后，必须同步更新 `architecture.md`**（第 2/3/6 节），防止文档漂移。

## 5. 文章 frontmatter 规范

```markdown
---
icon: <iconify 图标名，如 activity / map / rocket>
title: <页面标题>
description: <可选，SEO 描述>
index: false   # 仅模块索引页需要（如 roadmap/README.md）
---
```

- 首页 `src/README.md` 特殊：`home: true` + `heroText: WikiAndroid` + `features` 数组。

## 6. 质量与验证（每次修改必做）

- 修改后运行 `npm run build`，确认输出 `success VuePress build completed`。
- **broken-link warning 可接受**：指向「（待更新）」文章的链接会产生 warning，属正常现象，不阻塞构建。
- 但**新增的真实链接必须有效**（先确认目标文件存在）。
- 不要修改/提交 `src/.vuepress/.cache/`、`src/.vuepress/.temp/`、`src/.vuepress/dist/`（已被 .gitignore 忽略）。
- 终端 PATH 偶发丢失时（PowerShell 5.1），先执行：
  `$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")`

## 7. Git 与发布

- commit message 格式：`type(scope): 描述`，如 `feat(ui): 新增自定义 View 入门指南`、`fix(theme): 修正页脚版权`。
  type ∈ `feat / fix / docs / chore / refactor`。
- 推送 `origin main` 即触发 Cloudflare Pages 自动部署，无需其他发布步骤。
- 严禁提交任何密钥、token、敏感配置。

## 8. 技术栈约束（勿随意升级）

- 保持精确版本，**不要升级到不兼容版本**：
  - `vuepress@2.0.0-rc.30`（`@latest` 会解析到 1.x，禁止）
  - `vuepress-theme-hope@2.0.0-rc.107`
  - `@vuepress/bundler-vite@2.0.0-rc.30`（必须显式指定，否则报 "No bundler"）
  - `@vuepress/plugin-slimsearch@2.0.0-rc.130`（替代已废弃的 searchPro，不要换回）
  - `sass-embedded`（theme-hope 调色板依赖，不可移除）

## 9. 行为边界

- 大范围重写导航/重构前，先向用户说明方案与影响，得到确认后再动手。
- 对内容类修改（文章增删、导航调整），直接执行；对架构级改动（换框架、改构建流程），先征询用户。
- 用户通过修改 `architecture.md` 表达意图时（如"按 architecture.md 调整站点"），以 `architecture.md` 为准执行，并将代码结果同步回文档。
