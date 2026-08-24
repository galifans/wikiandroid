---
icon: gears
title: 系统原理
index: false
---

# ⚙️ 系统原理

深入 Android 系统底层，理解机制背后的设计。

## 模块

| 模块 | 说明 | 入口 |
|------|------|------|
| Binder | 跨进程通信核心 | [Binder](/system/binder/) |
| AMS / WMS | 系统核心服务 | [AMS / WMS](/system/ams-wms/) |
| 启动流程 | 系统与应用启动 | [启动流程](/system/boot/) |
| APK | 打包与签名 | [APK](/system/apk/) |
| ART / DEX | 运行时与类加载 | [ART / DEX](/system/art/) |
| 操作系统 | 操作系统与 IPC | [操作系统](/system/os/) |

## 知识框架

```
Linux 内核（进程/内存/驱动）
   ↑
Android 系统服务（AMS / WMS / PMS）
   ↑
Binder IPC（进程通信骨架）
   ↑
应用框架层（四大组件、View）
```

## 📑 全部文章导航

### 🔗 Binder 机制
- [Binder 跨进程通信机制详解](/system/binder/binder-mechanism.md)：驱动 / 代理 / 流程
- [AIDL 深入解析](/system/binder/aidl-deep.md)：Stub / Proxy / 双向通信
- [Parcelable 序列化](/system/binder/parcelable.md)：与 Serializable 对比
- [IPC 方式对比](/system/binder/ipc-comparison.md)：Binder / Socket / Messenger

### ⚙️ AMS / WMS
- [AMS 与 Activity 启动](/system/ams-wms/ams-activity-launch.md)：AMS 调度流程
- [WMS 窗口管理](/system/ams-wms/wms-principle.md)：窗口层级 / 添加删除

### 🚀 启动流程
- [系统启动流程](/system/boot/system-boot.md)：Bootloader → init → Zygote
- [应用启动流程](/system/boot/app-launch.md)：Launcher → AMS → ActivityThread

### 📦 APK 打包与签名
- [APK 打包流程与签名机制](/system/apk/apk-build-process.md)：AAPT / D8 / 签名 v1-v3
- [多渠道打包](/system/apk/multi-channel.md)

### 🧠 ART / DEX / 类加载
- [ART 运行时与 GC](/system/art/art-runtime.md)：AOT / JIT / 回收器
- [ART 垃圾回收机制](/system/art/art-gc.md)
- [类加载器与双亲委托](/system/art/classloader.md)：DexClassLoader / PathClassLoader
- [DEX 文件格式](/system/art/dex-format.md)

### 🖥️ 操作系统
- [操作系统核心概念](/system/os/os-core.md)：进程 / 线程 / 内存
- [线程同步与 IPC](/system/os/thread-sync-ipc.md)：锁 / 信号量 / Linux IPC
