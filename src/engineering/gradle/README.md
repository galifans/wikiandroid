---
icon: gradle
title: Gradle 构建
---

# 📦 Gradle 构建

Android 构建系统的核心：Gradle + AGP。

## 文章列表

- [Gradle 基础与构建优化](gradle-basics.md)
- [Version Catalog 依赖管理](version-catalog.md)

## 核心要点

1. **AGP**：Android Gradle Plugin，与 Gradle 版本配套
2. **构建生命周期**：配置阶段 → 依赖解析 → 任务执行
3. **构建优化**：缓存、并行、Configuration Cache
4. **依赖管理**：Version Catalog（`libs.versions.toml`）
5. **变体（Build Variants）**：debug / release + 维度

## 常用命令

```bash
./gradlew assembleDebug      # 构建 debug
./gradlew assembleRelease    # 构建 release
./gradlew :app:installDebug  # 安装到设备
./gradlew lint               # 代码检查
./gradlew test               # 运行测试
```
