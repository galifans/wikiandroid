---
icon: binder
title: Binder 机制
---

# 🔗 Binder 机制

Binder 是 Android 跨进程通信的核心，也是源码面试的"深水区"。

## 文章列表

- [Binder 跨进程通信机制详解](binder-mechanism.md)
- [AIDL 深入解析](aidl-deep.md)
- [Android IPC 方式对比](ipc-comparison.md)
- [Parcelable 序列化](parcelable.md)

## 核心要点

1. **为什么用 Binder**：性能（一次拷贝）、安全（UID 校验）、稳定
2. **架构组成**：Client / Server / ServiceManager / Binder 驱动
3. **通信流程**：代理对象 → Binder 驱动 → 目标对象
4. **内存映射**：mmap 实现一次拷贝
5. **Binder 线程池**：服务端多线程处理请求
