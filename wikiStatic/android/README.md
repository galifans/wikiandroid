---
icon: android
title: Android 核心
index: false
---

# 🧱 Android 核心

Android 应用开发的核心基石：四大组件、Fragment、数据存储、进程与 Context。本板块共 **17 篇原创文章**，从应用层基础到源码级原理全覆盖。

## 四大组件

| 组件 | 作用 | 入口文档 |
|------|------|----------|
| Activity | 用户交互界面 | [Activity](/android/activity/) |
| Service | 后台长时间运行 | [Service](/android/service/) |
| BroadcastReceiver | 全局消息接收 | [BroadcastReceiver](/android/broadcast/) |
| ContentProvider | 跨进程数据共享 | [ContentProvider](/android/content-provider/) |

## 其他核心

- [Fragment](/android/fragment/)：界面模块化
- [数据存储](/android/storage/)：SharedPreferences / Room / DataStore
- [进程](/android/process/)：进程生命周期与保活
- [Context](/android/context/)：系统服务访问封装

## 📑 全部文章导航

### 🎬 Activity
- [Activity 生命周期与启动模式](/android/activity/activity-lifecycle.md)：生命周期回调、四种启动模式、状态保存与恢复
- [Activity 启动流程源码分析](/android/activity/activity-launch-process.md)：从 `startActivity` 到 `onResume` 的完整源码链路
- [Activity 任务栈与返回栈](/android/activity/task-stack.md)：Task / Back Stack 原理与启动模式配合

### ⚙️ Service
- [Service 详解：启动方式与绑定方式](/android/service/service-basics.md)：`startService` / `bindService` 生命周期与通信
- [前台服务与通知](/android/service/foreground-service.md)：前台服务适配、通知渠道与保活
- [AIDL 跨进程通信](/android/service/aidl.md)：接口定义、Stub/Proxy 生成与调用流程

### 📡 BroadcastReceiver
- [BroadcastReceiver 详解](/android/broadcast/broadcast-basics.md)：普通广播 / 有序广播 / 本地广播
- [动态注册与静态注册对比](/android/broadcast/register-comparison.md)：注册方式、版本适配与性能差异

### 🗃️ ContentProvider
- [ContentProvider 详解](/android/content-provider/content-provider-basics.md)：增删改查、权限机制与跨进程数据共享

### 🧩 Fragment
- [Fragment 生命周期与通信](/android/fragment/fragment-basics.md)：生命周期、回退栈与 Activity 通信
- [Fragment 常见坑点总结](/android/fragment/fragment-pitfalls.md)：`getActivity()` 空指针、状态丢失等实战踩坑

### 💾 数据存储
- [数据存储方案对比](/android/storage/storage-comparison.md)：SharedPreferences / Room / DataStore 全对比选型
- [SharedPreferences 深度剖析](/android/storage/sharedpreferences-deep.md)：实现原理、`apply`/`commit` 与性能优化
- [SharedPreferences 与 DataStore 对比](/android/storage/sp-vs-datastore.md)：差异分析、迁移方案与取舍

### 🔄 进程与 Context
- [Android 进程与保活](/android/process/process-lifecycle.md)：进程优先级、生命周期与保活方案
- [Context 详解](/android/context/context-overview.md)：Application / Activity / Service 的 Context 差异与使用规范

## 核心知识图谱

```
Android 核心
├── 四大组件（Activity / Service / BroadcastReceiver / ContentProvider）
├── Fragment 与 Intent
├── View 体系（见「UI 与渲染」）
├── 数据存储
├── Context 与进程
└── 进程与线程（见「网络与异步」）
```
