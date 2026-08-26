---
icon: rocket
title: Application 与启动流程
shortTitle: 概览
dir:
  text: Application 与启动流程
  order: 7
---

# Application 与启动流程

Application 是每个 Android 应用的"根对象"，承载全局初始化；冷启动流程则是从点击图标到首帧渲染的完整链路，直接决定用户体验。理解这一模块，才能写出初始化合理、启动快速的应用。

## 文章列表

- [Application 详解与全局初始化](./application-basics.md)
- [App 启动流程：从点击图标到首帧](./app-launch-process.md)
- [Manifest 清单文件详解](./manifest-guide.md)

## 核心要点

1. **Application 生命周期**：整个应用进程只创建一个实例，`onCreate` 早于首个 Activity
2. **冷启动全链路**：Launcher 点击 → Zygote fork 进程 → Application → Activity → 首帧绘制
3. **启动优化**：异步化初始化、启动器（App Startup）、减少首帧工作量
4. **Manifest 配置**：组件声明、权限声明、`application` 标签全局属性、多进程配置
5. **进程与多进程**：`android:process` 配置独立进程，Application 会在每个进程各创建一次

## 关联阅读

- [进程与线程模型](/android/process/process-lifecycle.md)：Application 与进程生命周期的关系
- [Context 详解](/android/context/context-overview.md)：Application 是全局 Context
- [Activity 启动流程源码](/android/activity/activity-launch-process.md)：组件启动的底层机制
