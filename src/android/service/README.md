---
icon: service
title: Service
shortTitle: 概览
dir:
  text: Service
  order: 2
---

# ⚙️ Service

Service 用于在后台执行长时间运行的任务。

## 文章列表

- [Service 详解：启动方式与绑定方式](service-basics.md)
- [前台服务与通知](foreground-service.md)
- [AIDL 跨进程通信](aidl.md)

## 核心要点

1. **启动方式**：`startService`（不通信）/ `bindService`（可通信）
2. **生命周期**：启动式与绑定式的差异、`onStartCommand` 返回值语义
3. **通信方式**：Binder / Messenger 对比，AIDL 跨进程调用（IPC）
4. **前台服务**：Android 8.0+ 必须配合通知；Android 14 声明类型、Android 15 超时机制
5. **后台限制**：8.0+ 后台服务限制、12+ FGS 启动限制，Service 与协程的正确配合
