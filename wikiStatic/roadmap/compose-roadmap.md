---
icon: compose
title: Jetpack Compose 学习路线
---

# Jetpack Compose 学习路线

> Jetpack Compose 是 Android 现代 UI 开发的官方声明式框架，正在逐步取代传统 View 体系。

## 一、Compose 基础（1-2 周）

- **声明式 UI 思想**：State 驱动 UI、重组（Recomposition）
- 基础组件：`Text`、`Button`、`Image`、`Column`、`Row`、`Box`
- **布局系统**：`Modifier`、约束布局、懒加载列表 `LazyColumn`

## 二、状态管理（1 周）

- `remember` 与 `mutableStateOf`
- 状态提升（State Hoisting）
- **ViewModel 与 Compose 集成**：`collectAsState`

## 三、Compose 进阶（1-2 周）

- 自定义布局与自定义绘制（Canvas、`drawBehind`）
- **动画**：`animate*AsState`、`AnimatedVisibility`、`AnimatedContent`
- **主题系统**：Material 3、深色模式
- 与 View 互操作：`AndroidView`、`ComposeView`

## 四、生产级实践（持续）

- Compose + 协程 + Hilt + Room 完整架构
- Compose 性能优化：稳定性（Stability）、`@Stable`、键值（Keys）
- 无障碍与测试

> 相关文章：[Compose 入门到进阶](/jetpack/compose/)
