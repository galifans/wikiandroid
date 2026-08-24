---
icon: cicd
title: GitHub Actions 实战
description: CI/CD 概念、GitHub Actions 工作流结构、Android 构建流水线、产物上传与通知
---

# 🤖 GitHub Actions 实战

> 面试高频指数：⭐⭐⭐
> CI/CD 是现代工程标配，GitHub Actions 是最主流的自动化平台之一。

## 1. CI/CD 是什么

```text
CI（持续集成）：代码频繁合并，自动构建 + 测试，尽早发现问题
CD（持续交付/部署）：构建产物自动发布到目标环境

价值：
- 自动化（提交即构建）
- 反馈快（问题早发现）
- 可追溯（每次构建有记录）
- 解放人力（重复工作交给机器）
```

## 2. GitHub Actions 核心概念

```text
Workflow（工作流）：一个自动化流程（.github/workflows/*.yml）
  └─ Job（作业）：一组步骤（可并行/可依赖）
       └─ Step（步骤）：单条命令/动作
            └─ Action（动作）：可复用单元（checkout/setup-java）

触发事件（on）：
- push / pull_request：代码事件
- schedule：定时
- workflow_dispatch：手动触发
- release：发版触发
```

## 3. Android 构建流水线示例

```yaml
# .github/workflows/android-build.yml
name: Android Build

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      # ① 拉取代码
      - uses: actions/checkout@v4

      # ② 安装 JDK 17
      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: "17"

      # ③ 设置 Gradle 缓存（加速构建）
      - uses: gradle/actions/setup-gradle@v3

      # ④ 单元测试
      - name: Run unit tests
        run: ./gradlew testDebugUnitTest

      # ⑤ Lint 检查
      - name: Run lint
        run: ./gradlew lintDebug

      # ⑥ 构建 Debug APK
      - name: Build debug APK
        run: ./gradlew assembleDebug

      # ⑦ 上传构建产物
      - uses: actions/upload-artifact@v4
        with:
          name: app-debug
          path: app/build/outputs/apk/debug/app-debug.apk
```

## 4. 发布 Release 流程

```yaml
name: Release

on:
  push:
    tags: ["v*"]  # 打 tag 触发

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: "17"

      # 签名配置（Secrets 存储，不暴露明文）
      - name: Build release AAB
        run: ./gradlew bundleRelease
        env:
          SIGNING_KEYSTORE: ${{ secrets.KEYSTORE_BASE64 }}
          KEYSTORE_PASSWORD: ${{ secrets.KEYSTORE_PASSWORD }}
          KEY_ALIAS: ${{ secrets.KEY_ALIAS }}
          KEY_PASSWORD: ${{ secrets.KEY_PASSWORD }}

      # 创建 GitHub Release
      - uses: softprops/action-gh-release@v2
        with:
          files: app/build/outputs/bundle/release/app-release.aab
```

## 5. 其他实用技巧

```text
① 环境变量与 Secrets：
   - secrets.XXX：仓库设置中配置（加密）
   - 密钥 base64 编码存储，构建时解码

② 条件执行（if）：
   - 仅特定分支/路径执行（paths 过滤）
   - 失败时通知（if: failure()）

③ 并行构建（matrix）：
   - 多 JDK / 多 ABI / 多模块矩阵

④ 缓存：
   - Gradle 缓存（依赖 + 构建缓存）大幅提速

⑤ 通知：
   - 构建失败发到 Slack / 邮件 / DingTalk
```

## 6. 高频面试题

**Q1：CI/CD 的价值？**
A：自动化构建测试（早发现问题）、发布流程标准化、构建可追溯、
效率提升。CI 关注"持续集成验证"，CD 关注"自动交付部署"。

**Q2：GitHub Actions 的组成？**
A：Workflow（工作流）→ Job（作业）→ Step（步骤）→ Action（动作）。
由事件（push/PR/schedule）触发，YAML 定义在 .github/workflows/。

**Q3：如何加速 CI 构建？**
A：Gradle 缓存（依赖缓存 + 构建缓存）；并行 Job（matrix）；只构建
变更模块；Configuration Cache；远程构建缓存（Build Cache Node）。

**Q4：签名密钥如何安全使用？**
A：存 Secrets（GitHub 加密存储）；base64 编码放入环境变量；
CI 中解码临时文件，构建后清理；密钥不入库（.gitignore）。

**Q5：CI 中如何做质量门禁？**
A：单元测试 + Lint + 静态检查（Detekt）失败则构建失败；
覆盖率阈值（JaCoCo）；PR 必须通过 CI 才能合并（branch protection）。

## 7. 小结

- CI/CD：自动化构建测试与交付。
- Actions：Workflow → Job → Step → Action，YAML 定义。
- Android 流水线：checkout → JDK → 测试 → lint → 构建 → 上传。
- 实践：Secrets 管密钥、缓存加速、matrix 并行、失败通知。
- 面试重点：概念、流水线结构、加速与安全实践。
