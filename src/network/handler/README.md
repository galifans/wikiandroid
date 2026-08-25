---
icon: handler
title: Handler 消息机制
shortTitle: 概览
dir:
  text: Handler 消息机制
  order: 2
---

# 🔄 Handler 消息机制

Handler 是 Android 线程通信的核心机制，面试必考源码题。

## 文章列表

- [Handler 消息机制源码解析](handler-source.md)
- [HandlerThread 使用详解](handlerthread.md)
- [消息同步屏障与 IdleHandler](sync-barrier.md)

## 核心要点

1. **三件套**：Handler（发送/处理）、Looper（循环取消息）、MessageQueue（消息队列）
2. **原理**：Handler 发送消息到 MessageQueue，Looper 死循环取出并分发
3. **ThreadLocal**：每个线程持有独立 Looper
4. **主线程 Looper**：`Looper.prepareMainLooper()` + `ActivityThread.main()`
5. **epoll 机制**：MessageQueue 空闲时阻塞，不消耗 CPU
6. **同步屏障**：target 为 null 拦截同步消息，保证异步绘制优先
7. **IdleHandler**：队列空闲时执行，用于预加载 / 懒初始化
