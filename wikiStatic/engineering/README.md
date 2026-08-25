---
icon: tools
title: 工程实践
index: false
---

# 🛠️ 工程实践

构建、版本管理、自动化与测试，打造高效工程体系。

## 模块

| 模块 | 说明 | 入口 |
|------|------|------|
| Gradle | 构建系统与 AGP | [Gradle](/engineering/gradle/) |
| Git | 版本管理与工作流 | [Git](/engineering/git/) |
| CI/CD | 自动化构建发布 | [CI/CD](/engineering/cicd/) |
| 测试 | 单元测试与 UI 测试 | [测试](/engineering/testing/) |

## 最佳实践

- 使用 **Version Catalog** 统一依赖版本
- Git 分支规范（feature / develop / release）
- 接入 GitHub Actions 自动化构建
- 关键逻辑覆盖单元测试，核心流程覆盖 UI 测试

## 📑 全部文章导航

### 🏗️ Gradle
- [Gradle 构建系统与 AGP](/engineering/gradle/gradle-basics.md)：构建流程 / 生命周期
- [Gradle 依赖项配置](/engineering/gradle/dependency-config.md)：implementation / api / 冲突解决
- [ProGuard 混淆配置](/engineering/gradle/proguard-guide.md)：规则 / 公共模板
- [Version Catalog 版本目录](/engineering/gradle/version-catalog.md)
- [自定义 Gradle 插件](/engineering/gradle/custom-gradle-plugin.md)：Extension / Task / Transform 插桩

### 🔀 Git
- [Git 工作流与最佳实践](/engineering/git/git-workflow.md)：分支模型 / 协作规范
- [Git 高级操作与工作流](/engineering/git/git-rebase-workflow.md)：Rebase / Cherry-Pick / 冲突
- [Git 常用命令速查](/engineering/git/git-cheatsheet.md)

### 🔄 CI/CD
- [GitHub Actions CI/CD](/engineering/cicd/github-actions.md)：工作流 / 缓存 / 发布
- [Jenkins 流水线实战](/engineering/cicd/jenkins-pipeline.md)：Pipeline / 分布式构建
- [灰度发布与发布策略](/engineering/cicd/gray-release.md)：放量 / 回滚 / 功能开关

### 🧪 测试
- [单元测试实战](/engineering/testing/unit-testing.md)：JUnit / Mockito / Robolectric
- [MockK 单元测试实战](/engineering/testing/mockk-testing.md)：协程 / object / 验证
- [UI 测试实战](/engineering/testing/ui-testing.md)：Espresso / Compose 测试
- [测试金字塔与测试策略](/engineering/testing/test-pyramid.md)：分层 / 覆盖率 / 门禁
