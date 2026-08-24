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
