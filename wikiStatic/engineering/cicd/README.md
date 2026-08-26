---
icon: cicd
title: CI/CD
shortTitle: 概览
dir:
  text: CI/CD
  order: 3
---

# CI/CD

自动化构建、测试与发布流水线。

## 文章列表

- [GitHub Actions 实战](github-actions.md)
- [Jenkins 流水线实战](jenkins-pipeline.md)
- [灰度发布与发布策略](gray-release.md)

## 核心要点

1. **CI**：代码提交自动触发构建 + 测试 + lint
2. **CD**：自动发布到应用市场 / 分发平台
3. **GitHub Actions**：workflow → job → step 结构
4. **Jenkins**：Master/Agent 架构 + Pipeline 即代码
5. **灰度发布**：小流量 → 逐步放量 → 全量，功能开关止血
6. **常用平台**：GitHub Actions / GitLab CI / Jenkins

## 典型流水线

```mermaid
flowchart LR
    A[Push 代码] --> B[Checkout]
    B --> C[安装 JDK + Android SDK]
    C --> D[单元测试]
    D --> E[Lint 检查]
    E --> F[构建 Release APK/AAB]
    F --> G[上传产物]
    G --> H[通知/分发]
```
