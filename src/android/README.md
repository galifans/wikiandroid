---
icon: android
title: Android 核心
index: false
---

# 🧱 Android 核心

Android 应用开发的核心基石：四大组件、Fragment、数据存储、进程与 Context，以及 Intent 组件通信、应用启动流程、资源系统、权限系统与通知机制。本板块共 **27 篇原创文章**，从应用层基础到源码级原理全覆盖，每篇均包含源码分析、对比表格与高频面试题精讲。

## 四大组件

| 组件 | 作用 | 入口文档 |
|------|------|----------|
| Activity | 用户交互界面 | [Activity](/android/activity/) |
| Service | 后台长时间运行 | [Service](/android/service/) |
| BroadcastReceiver | 全局消息接收 | [BroadcastReceiver](/android/broadcast/) |
| ContentProvider | 跨进程数据共享 | [ContentProvider](/android/content-provider/) |

## 其他核心

- [Fragment](/android/fragment/)：界面模块化
- [Intent 与组件通信](/android/intent/)：显式/隐式 Intent、IntentFilter 匹配规则
- [Application 与启动流程](/android/app/)：Application 初始化、冷启动链路、Manifest 清单
- [数据存储](/android/storage/)：SharedPreferences / Room / DataStore
- [资源系统](/android/resource/)：R 文件、限定符、多语言与多屏幕适配
- [权限系统](/android/permission/)：运行时权限、权限组、申请最佳实践
- [通知机制](/android/notification/)：通知渠道、PendingIntent、前台服务通知
- [进程](/android/process/)：进程生命周期与保活
- [Context](/android/context/)：系统服务访问封装

## 📑 全部文章导航

### 🎬 Activity
- [Activity 生命周期与启动模式](/android/activity/activity-lifecycle.md)：生命周期全景图、典型场景回调顺序、四种启动模式、状态保存与恢复、Intent Flags
- [Activity 启动流程源码分析](/android/activity/activity-launch-process.md)：从 `startActivity` 到 `onResume` 的完整源码链路、冷启动耗时拆解
- [Activity 任务栈与返回栈](/android/activity/task-stack.md)：Task / Back Stack 原理、`allowTaskReparenting`、多窗口模式适配

### ⚙️ Service
- [Service 详解：启动方式与绑定方式](/android/service/service-basics.md)：`startService` / `bindService` 生命周期、Binder/Messenger 通信、后台限制与协程配合
- [前台服务与通知](/android/service/foreground-service.md)：前台服务类型总表、Android 14/15 适配、通知渠道与启动限制
- [AIDL 跨进程通信](/android/service/aidl.md)：接口定义、Stub/Proxy 生成、`@Parcelize` 现代写法与线程安全

### 📡 BroadcastReceiver
- [BroadcastReceiver 详解](/android/broadcast/broadcast-basics.md)：普通广播 / 有序广播 / 粘性广播、AMS 底层分发流程、超时机制与安全实践
- [动态注册与静态注册对比](/android/broadcast/register-comparison.md)：注册方式、版本适配、静态注册替代方案与进程优先级影响

### 🗃️ ContentProvider
- [ContentProvider 详解](/android/content-provider/content-provider-basics.md)：增删改查、权限机制、跨进程数据共享、批量操作与启动源码时机

### 🧩 Fragment
- [Fragment 生命周期与通信](/android/fragment/fragment-basics.md)：生命周期与 View 生命周期分离、事务机制、四种通信方式、单 Activity 架构
- [Fragment 常见坑点总结](/android/fragment/fragment-pitfalls.md)：状态丢失、重叠问题、`viewLifecycleOwner` 时序等 12 个实战踩坑

### 💾 数据存储
- [数据存储方案对比](/android/storage/storage-comparison.md)：SharedPreferences / Room / DataStore / 文件全对比选型、分区存储适配
- [SharedPreferences 深度剖析](/android/storage/sharedpreferences-deep.md)：源码级原理、`apply`/`commit` 区别、ANR 根因与 DataStore 替代
- [SharedPreferences 与 DataStore 对比](/android/storage/sp-vs-datastore.md)：六大维度差异分析、深挖原理与迁移方案

### � Intent 与组件通信
- [Intent 详解：显式与隐式](/android/intent/intent-basics.md)：Intent 结构、显式/隐式跳转、Flags 与任务栈、Extras 传递、安全最佳实践
- [IntentFilter 匹配规则](/android/intent/intent-filter.md)：action/category/data 三大匹配规则、源码解析流程、Deep Link 实战

### 🚀 Application 与启动流程
- [Application 详解与全局初始化](/android/app/application-basics.md)：创建链路、onCreate 初始化最佳实践、多进程陷阱、Context 关系
- [App 启动流程：从点击图标到首帧](/android/app/app-launch-process.md)：冷/温/热启动、Zygote fork 全链路、启动耗时测量与优化清单
- [Manifest 清单文件详解](/android/app/manifest-guide.md)：组件声明、权限体系、exported 规则、多进程配置与常见错误排查

### 💾 数据存储
- [数据存储方案对比](/android/storage/storage-comparison.md)：SharedPreferences / Room / DataStore / 文件全对比选型、分区存储适配
- [SharedPreferences 深度剖析](/android/storage/sharedpreferences-deep.md)：源码级原理、`apply`/`commit` 区别、ANR 根因与 DataStore 替代
- [SharedPreferences 与 DataStore 对比](/android/storage/sp-vs-datastore.md)：六大维度差异分析、深挖原理与迁移方案

### 🎨 资源系统
- [资源系统详解：R 文件、类型与加载](/android/resource/resource-basics.md)：AAPT 编译流程、资源 ID 结构、Resources/AssetManager 加载、主题与样式
- [资源限定符与多语言适配](/android/resource/resource-qualifiers.md)：限定符体系、最佳匹配算法、多语言 i18n 全流程、多屏幕适配

### 🛡️ 权限系统
- [权限机制与运行时权限详解](/android/permission/permission-basics.md)：沙箱模型、保护级别、权限组、申请机制、版本演进与底层校验
- [权限申请最佳实践与常见问题](/android/permission/permission-practice.md)：申请时机、批量申请、解释弹窗、特殊权限、合规建议

### 🔔 通知机制
- [通知机制详解：渠道、构建与样式](/android/notification/notification-basics.md)：Channel 机制、Builder 构建、样式类型、通知权限、前台服务通知
- [PendingIntent 详解](/android/notification/pendingintent.md)：与 Intent 区别、三种创建方式、FLAG 更新规则、安全最佳实践

### 🔄 进程与 Context
- [Android 进程与保活](/android/process/process-lifecycle.md)：五级进程优先级、OOM_ADJ 机制、多进程问题与保活方案演进
- [Context 详解](/android/context/context-overview.md)：继承体系、ContextWrapper 代理机制、类型对比、内存泄漏案例与 getSystemService 原理

## 核心知识图谱

```
Android 核心
├── 四大组件（Activity / Service / BroadcastReceiver / ContentProvider）
├── Fragment 与 Intent（组件通信）
├── Application 与启动流程（冷启动 / Manifest）
├── 资源系统（多语言 / 多屏幕适配）
├── 权限系统（运行时权限）
├── 通知机制（渠道 / PendingIntent）
├── 数据存储
├── Context 与进程
└── View 体系（见「UI 与渲染」）/ 进程与线程（见「网络与异步」）
```
