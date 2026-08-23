---
icon: cicd
title: CI/CD
---

# 🤖 CI/CD

自动化构建、测试与发布流水线。

## 文章列表

- [GitHub Actions 实战](github-actions.md)（待更新）

## 核心要点

1. **CI**：代码提交自动触发构建 + 测试 + lint
2. **CD**：自动发布到应用市场 / 分发平台
3. **GitHub Actions**：workflow → job → step 结构
4. **常用平台**：GitHub Actions / GitLab CI / Jenkins

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
