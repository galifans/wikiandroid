---
icon: cross-platform
title: 跨端方案
shortTitle: 概览
dir:
  text: 跨端方案
  order: 7
---

# 跨端方案

Flutter、React Native、Compose Multiplatform 等跨平台技术全景。

## 文章列表

- [跨端开发方案全景](cross-platform-overview.md)

## 核心要点

1. **跨端本质**：一套代码多端运行，降低开发与维护成本
2. **主流方案**：Flutter（自绘引擎）、React Native（原生桥接）、Compose Multiplatform（Kotlin 共享）
3. **选型维度**：性能、生态、团队技术栈、热更新、原生能力
4. **架构对比**：渲染方式、线程模型、原生通信
5. **趋势**：KMP + Compose Multiplatform 让 Android 团队无缝跨端

## 方案对比

| 方案 | 渲染 | 性能 | 生态 | 适合团队 |
|------|------|------|------|---------|
| Flutter | 自绘（Skia/Impeller） | 高 | 强 | 新项目、重 UI |
| React Native | 原生组件桥接 | 中 | 强 | JS 团队 |
| Compose Multiplatform | 自绘（Skiko） | 高 | 增长中 | Kotlin/Android 团队 |
| 原生双端 | 系统原生 | 最高 | 最强 | 追求极致体验 |
