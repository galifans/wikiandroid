---
icon: thread
title: 线程池与并发
shortTitle: 概览
dir:
  text: 线程池与并发
  order: 4
---

# 线程池与并发

并发编程基础与线程池深入理解。

## 文章列表

- [线程池详解](thread-pool.md)
- [Java 并发工具类](concurrency-tools.md)
- [锁机制详解](locks.md)
- [AsyncTask 与 IntentService 原理](asynctask-intentservice.md)
- [并发编程实战与线程中断](concurrency-practice.md)

## 核心要点

1. **Thread 基础**：`Thread`、`Runnable`、线程状态
2. **线程池**：`ThreadPoolExecutor` 七大参数、四种拒绝策略
3. **并发工具**：`CountDownLatch`、`CyclicBarrier`、`Semaphore`、`Atomic*`
4. **锁**：`synchronized` / `ReentrantLock` / `volatile` / CAS
5. **Android 线程**：主线程、`HandlerThread`、`IntentService`（历史）
6. **线程中断**：interrupt 协作式信号、中断标志、InterruptedException
7. **并发实战**：ThreadLocal 隔离、并发容器选型、生产者消费者、常见并发坑
