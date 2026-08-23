---
icon: boot
title: 系统与应用启动流程
---

# 🚀 系统与应用启动流程

从按下电源键到 App 首帧显示的完整链路。

## 文章列表

- [Android 系统启动流程](system-boot.md)（待更新）
- [应用启动流程详解](app-launch.md)（待更新）

## 核心要点

### 系统启动
```
Boot ROM → BootLoader → Linux 内核
→ init 进程 → Zygote → SystemServer → 系统服务（AMS/WMS/PMS）
→ Launcher 启动
```

### 应用启动
```
点击图标 → Launcher 发起 → AMS → Zygote fork 进程
→ ActivityThread.main() → 创建 Application → 创建 Activity
→ ViewRootImpl → 首帧
```
