---
icon: os
title: cgroup 与低内存回收
description: cgroup 资源隔离、cpuset/memory 子系统、lmkd 深入、adj 与 cgroup 联动、内存回收策略
---

# cgroup 与低内存回收

> 面试高频指数：中
> cgroup 是现代 Android 资源隔离的基石，lmkd 依赖它做内存回收。理解两者是排查内存问题的关键。

## 1. cgroup 是什么

```text
cgroup（Control Group）
Linux 内核的资源控制机制

作用：对一组进程进行资源限制与统计
- CPU 份额
- 内存上限
- IO 带宽
- CPU 亲和性（cpuset）

Android 用它实现前后台资源隔离。
```

```text
cgroup v1（Android 早期）：
/sys/fs/cgroup/{cpu,memory,cpuset,...}/组名/任务列表

cgroup v2（Android 11+ 逐步迁移）：
统一层级，单一 cgroup 树
```

## 2. Android 中的 cgroup 布局

### 2.1 常见子系统

| 子系统 | 作用 | Android 用途 |
|--------|------|--------------|
| cpuset | CPU 亲和性 | 前台/后台跑不同 CPU |
| cpu | CPU 份额 | 前后台调度权重 |
| memory | 内存限制 | 限制/统计内存 |
| schedtune | 调度权重（v1） | 性能模式 |
| freezer | 冻结进程 | 进程冻结 |

### 2.2 典型分组

```text
Android 进程分组：
- top-app：前台应用（最高优）
- foreground：前台服务
- background：后台应用
- system：系统服务
- zygote：孵化器
- 等等

每个组配置：
- cpuset：允许的 CPU 集合
- cpu：权重（shares）
- memory：内存限制（部分）
```

## 3. cpuset 与调度

### 3.1 cpuset 的作用

```text
cpuset：限制线程可以在哪些 CPU 上运行

例如：
top-app：大核 + 小核（全量）
background：仅小核（低功耗）

效果：
- 后台任务不抢占前台 CPU
- 功耗优化（小核省电）
- 提高前台响应性
```

### 3.2 与线程优先级联动

```text
完整链路：
线程优先级/adj → AMS 分配 cgroup 组
→ cpuset 限制 CPU + cpu.shares 权重
→ 调度器综合调度

前台切换：进程移入 top-app 组
后台切换：移入 background 组（限小核 + 降权）
```

## 4. lmkd 深入

### 4.1 lmkd 是什么

```text
lmkd（Low Memory Killer Daemon）
Android 的内存回收守护进程

职责：
① 监控内存压力
② 按 adj 选择回收目标
③ 触发进程回收（SIGKILL）
④ 处理内存不足事件（PSI）

PSI（Pressure Stall Information）：
内核提供的内存压力指标，lmkd 用它判断何时回收
```

### 4.2 回收策略

```text
Android 10+ 基于 PSI 的回收：
- 内存压力等级（低/中/高）
- 压力高 → 从最高 adj 组开始杀
- 按组回收（先杀组内 adj 最大的）

回收目标排序（adj 高 → 低）：
cached 进程 → 空进程 → 后台服务
→ 可见 → 前台（基本不杀）
```

### 4.3 lmkd 与 cgroup v2

```text
Android 11+ lmkd 基于 cgroup v2：
- 使用 memory.events（PSI 事件）
- 按 memory.max 限制组
- 组内进程统一回收（SIGKILL 整组）

对比旧版（v1 + oom_adj）：
- 更细粒度、更及时
- 支持按组回收与内存上限
```

## 5. 进程冻结（freezer）

### 5.1 冻结机制

```text
进程冻结（Android 12+ 引入）：
- 后台进程放入 frozen 状态
- 不再被调度、不占 CPU/内存带宽
- 但保留内存（避免重建）

冻结条件：
- 完全后台、无前台组件、无活跃 binder
- 系统负载高时冻结更多

效果：
- 省电、减少内存压力
- 降低后台对前台的干扰
```

## 6. 内存回收链路

```text
完整内存回收链路：
App 内存压力 / 系统内存不足
→ lmkd 检测（PSI）
→ 选择回收目标（adj 排序）
→ 冻结（可选）或 SIGKILL
→ 内存释放
→ 系统恢复

同时配合：
- 内核 page cache 回收（正常先回收）
- direct reclaim（直接回收）
- kswapd（后台回收）
```

## 7. 高频面试题

**Q1：cgroup 是什么？Android 用它做什么？**
A：内核资源控制机制，限制 CPU/内存/IO/亲和性。Android 用 cpuset/cpu/memory 子系统做前后台资源隔离，保证前台流畅。

**Q2：cpuset 的作用？**
A：限制线程运行的 CPU 集合。前台 top-app 用大核、后台 background 只用小核，实现省电与前台优先。

**Q3：lmkd 的回收机制？**
A：基于 PSI 监控内存压力，压力高时按 adj 从高到低选择进程回收（SIGKILL）；Android 11+ 基于 cgroup v2 支持按组回收。

**Q4：oom_adj 和 cgroup 什么关系？**
A：adj 决定回收优先级（哪个先杀）；cgroup 决定资源份额与 CPU 亲和（运行在哪、权重多少）。两者配合：AMS 算 adj 分到对应 cgroup 组。

**Q5：进程冻结是什么？**
A：Android 12+ 将完全后台进程置为 frozen，不调度不占资源但保留内存，省电且减少干扰；有活动时解冻。

## 8. 小结

- cgroup：内核资源控制，Android 做前后台隔离。
- cpuset 限 CPU、cpu.shares 调权重、memory 限内存。
- lmkd：PSI 监控 + adj 排序回收，v2 按组回收。
- 进程冻结：后台进程不调度但保留内存。
- 排查内存问题：dumpsys meminfo、lmkd 日志、cgroup 状态。
