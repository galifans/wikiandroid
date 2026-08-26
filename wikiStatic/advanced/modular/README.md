---
icon: module
title: 组件化与模块化
shortTitle: 概览
dir:
  text: 组件化与模块化
  order: 2
---

# 组件化与模块化

大型项目的工程架构演进：从单体到组件化。

## 文章列表

- [组件化架构实践](modularization-practice.md)
- [路由框架设计](router-design.md)

## 核心要点

1. **模块划分**：`app`（壳工程）、`lib_xxx`（业务组件）、`core`（基础库）
2. **路由**：ARouter / 自研路由，组件间解耦通信
3. **编译模式切换**：`isModule` 变量控制单模块调试
4. **资源冲突**：前缀命名、`resourcePrefix`
5. **依赖管理**：版本统一（Version Catalog / buildSrc）
6. **路由设计**：APT 生成路由表、拦截器链、降级服务、SPI 服务暴露

## 分层示意

```
app（壳工程）
 ├── business:home / business:user（业务组件，可独立调试）
 └── core:network / core:ui（基础能力）
```
