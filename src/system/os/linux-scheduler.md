---
icon: os
title: Linux 进程调度机制
description: CFS 调度器、nice/优先级、SCHED_FIFO、Android 线程优先级映射、调度与卡顿、cpuset
---

# Linux 进程调度机制

> 面试高频指数：中
> 调度器决定哪个线程在哪个 CPU 上运行，理解 CFS 与 Android 的线程优先级映射，是排查卡顿与功耗问题的底层能力。

## 1. 调度器是什么

```text
调度器（Scheduler）
内核中决定"哪个就绪线程获得 CPU"的组件

调度对象：线程（Thread/Task）
调度目标：
① 公平性：每个线程都有机会运行
② 响应性：交互线程及时响应
③ 吞吐量：充分利用 CPU
④ 低延迟：减少切换开销
```

## 2. CFS 调度器

### 2.1 基本思想

```text
CFS（Completely Fair Scheduler，完全公平调度）
Linux 2.6.23 起默认

核心思想：按权重分配 CPU 时间
- 每个线程有权重（weight，由 nice 决定）
- 维护虚拟运行时间（vruntime）
- 总是选择 vruntime 最小的线程运行
- 用红黑树（rbtree）组织就绪队列
```

```text
vruntime 计算：
vruntime += 实际运行时间 * (NICE_0_LOAD / weight)

权重越高（nice 越小）→ vruntime 增长越慢 → 运行机会越多
```

### 2.2 nice 与优先级

| nice 值 | 权重 | 说明 |
|---------|------|------|
| -20 | 88761 | 最高优先级 |
| -10 | 3451 | 高 |
| 0 | 1024 | 默认 |
| 10 | 305 | 低 |
| 19 | 15 | 最低 |

```text
nice 范围：-20 ~ 19（默认 0）
nice 越小 → 权重越大 → 分得 CPU 越多

注意：nice 只影响 CFS 内的相对权重，
不影响实时调度（SCHED_FIFO/RR）。
```

## 3. 调度策略

### 3.1 Linux 调度策略

| 策略 | 用途 | 抢占 |
|------|------|------|
| SCHED_NORMAL（CFS） | 普通线程 | 可抢占 |
| SCHED_BATCH | 批处理 | 较少抢占 |
| SCHED_IDLE | 低优先级 | 基本不抢占 |
| SCHED_FIFO | 实时（先进先出） | 不按时间片 |
| SCHED_RR | 实时（轮转） | 时间片轮转 |

```text
实时调度（SCHED_FIFO/RR）：
- 优先级 1-99（高于普通线程）
- FIFO：直到主动让出/阻塞
- RR：时间片轮转
- Android 音频等实时场景使用
```

### 3.2 Android 中的调度应用

```text
Android 调度相关：
- 渲染线程（RenderThread）：高优先级
- 主线程：正常优先级（可调整）
- 音频线程：实时调度（SCHED_FIFO）
- binder 线程：普通

卡顿排查：
- 优先级被压低（后台任务）
- 被实时线程抢占
- 调度延迟（sched_wakeup 延迟）
```

## 4. Android 线程优先级映射

### 4.1 应用层设置

```java
// Java 层设置线程优先级
Thread thread = new Thread(() -> {
    // 设置线程优先级（1-10，越高越优先）
    Process.setThreadPriority(Process.THREAD_PRIORITY_BACKGROUND);
    // 业务代码
});
thread.start();
```

| 常量 | 值 | 说明 |
|------|-----|------|
| THREAD_PRIORITY_DEFAULT | 0 | 默认 |
| THREAD_PRIORITY_LOWEST | 19 | 最低（nice 19） |
| THREAD_PRIORITY_BACKGROUND | 10 | 后台 |
| THREAD_PRIORITY_FOREGROUND | -2 | 前台 |
| THREAD_PRIORITY_DISPLAY | -4 | 显示相关 |
| THREAD_PRIORITY_URGENT_DISPLAY | -8 | 紧急显示 |

```text
映射关系：
Process.setThreadPriority(nice)
→ pthread_setschedparam → 内核 nice 值
-8 ~ 19 对应内核 nice 值（负数需 root 或系统权限）
```

### 4.2 进程组与 cgroup

```text
Android 还通过 cgroup 控制资源：
- cpuset：限制线程跑在哪些 CPU
- bg_non_interactive：后台任务组
- 前台/后台线程组调度权重不同

效果：
- 后台线程组降权，避免抢前台资源
- 渲染/输入线程高优保证流畅
```

## 5. 调度与卡顿

### 5.1 调度延迟

```text
卡顿的调度原因：
- 线程未及时被调度（等待时间长）
- 被高优任务抢占
- CPU 繁忙（负载高）
- 锁竞争导致阻塞（非调度问题）

测量：
systrace / perfetto 查看 sched 事件
- sched_wakeup → sched_switch 的间隔 = 调度延迟
```

### 5.2 优化实践

| 场景 | 优化 |
|------|------|
| 后台任务 | 降优先级（BACKGROUND） |
| 主线程 | 避免耗时操作 |
| 渲染线程 | 保持高优先级 |
| 音频 | 实时调度（系统级） |
| 锁竞争 | 减少临界区 |

## 6. 高频面试题

**Q1：CFS 调度器的核心思想？**
A：按权重公平分配 CPU。每个线程有 vruntime，选择 vruntime 最小的运行；nice 决定权重，nice 小权重高，vruntime 增长慢。

**Q2：nice 值的作用？范围？**
A：nice -20~19（默认 0），影响 CFS 权重。nice 越小优先级越高，分得 CPU 越多。不影响实时调度优先级。

**Q3：Android 怎么设置线程优先级？**
A：Process.setThreadPriority() 映射到内核 nice；渲染/前台高优，后台任务降优。配合 cgroup（cpuset、bg 组）控制系统资源分配。

**Q4：SCHED_FIFO 和 SCHED_RR 区别？**
A：都是实时调度（优先级 1-99）。FIFO 运行到主动让出或阻塞；RR 有时间片轮转。Android 音频等实时任务使用。

**Q5：如何用 systrace 排查调度导致的卡顿？**
A：查看 sched 事件：sched_wakeup 到 sched_switch 的调度延迟、线程优先级、CPU 负载、被谁抢占，定位调度延迟或锁阻塞。

## 7. 小结

- CFS：按 vruntime 公平调度，nice 决定权重。
- 调度策略：NORMAL/FIFO/RR 等，实时优先级更高。
- Android 线程优先级映射 nice，配合 cgroup 分组。
- 卡顿排查：调度延迟、抢占、锁竞争。
- 优化：合理设置优先级、减少临界区。
