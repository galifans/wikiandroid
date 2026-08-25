---
icon: boot
title: 系统与应用启动流程
shortTitle: 概览
dir:
  text: 系统与应用启动流程
  order: 3
---

# 🚀 系统与应用启动流程

从按下电源键到 App 首帧显示的完整链路。

## 文章列表

- [Android 系统启动流程](system-boot.md)
- [应用启动流程详解](app-launch.md)
- [Zygote 进程深入](zygote-deep.md)

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

### Zygote 孵化器
1. 预加载框架类与资源（COW 共享内存）
2. Socket 监听 AMS 请求，fork 创建应用进程
3. SystemServer 是 Zygote 的第一个子进程
