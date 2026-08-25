---
icon: apk
title: APK 打包与签名
shortTitle: 概览
dir:
  text: APK 打包与签名
  order: 4
---

# 📦 APK 打包与签名

从源码到 APK 的构建流程与签名机制。

## 文章列表

- [APK 打包流程与签名机制](apk-build-process.md)
- [多渠道打包方案](multi-channel.md)

## 核心要点

1. **打包流程**：AAPT2 资源编译 → Kotlin/Java 编译 → D8 转 Dex → 资源链接 → 打包 → 签名 → 对齐（zipalign）
2. **构建工具链**：AGP（Android Gradle Plugin）+ Gradle
3. **签名**：v1（JAR）/ v2（APK Signature Scheme）/ v3（密钥轮换）
4. **混淆**：R8（代码压缩、混淆、优化）
