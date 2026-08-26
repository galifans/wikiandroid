---
icon: plugin
title: 插件化与热修复
shortTitle: 概览
dir:
  text: 插件化与热修复
  order: 3
---

# 插件化与热修复

动态化技术：让 App 拥有热更新能力。

## 文章列表

- [插件化原理分析](plugin-principle.md)
- [热修复方案对比](hotfix-comparison.md)
- [Hook 技术详解](hook-tech.md)

## 核心要点

### 插件化
1. **核心思想**：动态加载 APK（DexClassLoader / PathClassLoader）
2. **四大组件支持**：占位式（ProxyActivity）/ 静态代理
3. **代表框架**：VirtualAPK（滴滴）、Replugin（360）

### 热修复
1. **原理**：类加载替换（将补丁 Dex 插到 ClassLoader 最前面）
2. **代表框架**：Tinker（微信）、Sophix（阿里）
3. **对比维度**：成功率、包体积、兼容性

::: warning 注意
受 Google Play 政策限制，热修复在国内应用更普遍，海外上架需谨慎评估。
:::
