---
icon: service
title: Android 进程优先级与回收
description: oom_adj 等级、AMS 进程管理、adj 调整时机、LMK 回收、cached 进程、前台服务保活
---

# Android 进程优先级与回收

> 面试高频指数：极高
> 为什么 App 切到后台一段时间会被杀？为什么前台服务能保活？核心就是 oom_adj 与 LMK。

## 1. 进程优先级体系

### 1.1 oom_adj 是什么

```text
oom_adj（Out-Of-Memory Adjustment）
Linux OOM killer 的评分调整值，范围 -1000 ~ 1000

adj 越低 → 越不容易被杀
adj 越高 → 越容易被回收
```

| adj | 等级 | 说明 |
|-----|------|------|
| -1000 | UNKNOWN_ADJ | 系统进程（不可杀） |
| -800 | NATIVE_ADJ | native 系统进程 |
| 0 | FOREGROUND_APP_ADJ | 前台应用 |
| 1 | VISIBLE_APP_ADJ | 可见应用 |
| 2 | PERCEPTIBLE_APP_ADJ | 可感知（播放音乐等） |
| 5 | BACKUP_APP_ADJ | 备份 |
| 6 | SERVICE_ADJ | 服务 |
| 7 | HOME_APP_ADJ | 桌面 |
| 8 | PREVIOUS_APP_ADJ | 上一个应用 |
| 9 | SERVICE_B_ADJ | 低优先级服务 |
| 10 | CACHED_APP_MIN_ADJ | 缓存进程（最低） |

## 2. AMS 如何管理进程优先级

### 2.1 ProcessRecord

```java
// AMS 用 ProcessRecord 记录进程状态
final class ProcessRecord {
    final ApplicationInfo info;  // 应用信息
    final int pid;               // 进程号
    int curAdj;                  // 当前 adj
    int setAdj;                  // 设置给 LMK 的 adj
    int maxAdj;                  // 最大 adj
    boolean hasForegroundActivities;  // 是否有前台 Activity
    boolean hasClientActivities;
    final ArrayList<ServiceRecord> services;  // 运行的服务
    ...
}
```

### 2.2 adj 计算时机

```text
时机：
① 组件状态变化（Activity 前后台切换、Service 启动/停止）
② 进程创建
③ 广播/Provider 关联变化
④ 用户切换、锁屏等系统事件

流程：
updateOomAdjLocked() → computeOomAdjLocked() → applyOomAdjLocked()
```

### 2.3 影响 adj 的因素

| 因素 | 影响 |
|------|------|
| 前台 Activity | adj = 0（前台） |
| 可见 Activity | adj = 1 |
| 前台 Service | adj = 2（可感知） |
| 绑定客户端 | 跟随客户端 adj（提升） |
| 最近任务 | cached 区间内调整 |
| 空进程 | cached 最低 |

## 3. LMK / lmkd 回收机制

### 3.1 低内存杀手

```text
lmkd（Low Memory Killer Daemon）
内核驱动 + 用户态守护进程

机制：
① AMS 将 adj 通过接口写入内核（setOomAdj）
② 内核维护各 adj 阈值
③ 内存不足时，lmkd 从最高 adj 开始杀
④ 通过 /proc/pid/oom_score_adj 读取评分
```

### 3.2 回收策略

```text
触发条件：
- 可用内存低于阈值（如 100MB）
- 根据文件缓存压力（free/cached）

选择目标：
- 优先杀 adj 最大（最不重要）的进程
- 同 adj 下优先杀占用内存大的
- 保护系统进程（adj < 0 基本不杀）
```

## 4. 进程保活的常见手段与原理

### 4.1 前台服务保活

```java
// 前台服务：adj 提升到 PERCEPTIBLE_APP_ADJ(2)
// 系统会优先回收 cached 进程，前台服务较难被杀
Context context = getApplicationContext();
Intent intent = new Intent(context, MyService.class);
context.startForegroundService(intent);
```

```text
但 Android 8.0+ 对后台启动服务严格限制；
Android 14+ 对前台服务类型也有约束（health/dataSync 等）。
```

### 4.2 各保活手段的本质

| 手段 | 本质 | 现状 |
|------|------|------|
| 前台服务 | 提升 adj | 有效但受限 |
| 双进程守护 | 互相拉起 | 已失效（进程被杀无法拉起） |
| 推送 | 系统级通道 | 推荐方式 |
| WorkManager | 系统调度 | 官方推荐 |
| 1 像素 Activity | 伪前台 | 已失效/违规 |

## 5. 进程死亡与重建

### 5.1 死亡流程

```text
lmkd 杀进程（SIGKILL）
→ AMS 收到进程死亡回调（ProcessRecord removed）
→ 清理组件状态（Activity/Service/Provider）
→ 用户回到该 App 时重新创建
```

### 5.2 重建恢复

```text
恢复机制：
- Activity：重建（onSaveInstanceState 恢复状态）
- Service：START_STICKY 可重启
- 进程：冷启动全新开始

注意：进程被杀后静态变量丢失，需要持久化保存关键状态
```

## 6. 高频面试题

**Q1：oom_adj 是什么？值越小越安全？**
A：是 OOM 评分调整值，范围 -1000~1000。越小越安全（越难被杀）：前台 0、可见 1、缓存进程 10。系统进程为负值基本不杀。

**Q2：为什么切后台一段时间 App 会被杀？**
A：切后台后进程进入 cached 区间（adj 8-10），内存不足时 LMK 按 adj 从高到低回收；同时系统可能主动 trimMemory / killBackgroundProcesses。

**Q3：前台服务为什么能保活？**
A：前台服务将进程 adj 提升到 PERCEPTIBLE_APP_ADJ（2），处于可感知级别，优先级高于 cached 进程；但 8.0+ 限制后台启动、14+ 限制服务类型。

**Q4：LMK 和 OOM Killer 是什么关系？**
A：LMK（lmkd）是 Android 在 Linux OOM Killer 之上的主动回收机制，提前按 adj 杀进程避免系统卡死；两者最终都依赖内核内存回收，LMK 更主动、可预测。

**Q5：如何让进程尽量不被杀？**
A：① 前台服务（合理使用）；② 监听 trimMemory 及时释放；③ 使用 WorkManager 做系统级调度；④ 关键数据持久化，被杀后能恢复。

## 7. 小结

- oom_adj 是进程被回收的优先级依据，前台 0 / 缓存 10。
- AMS 计算 adj（updateOomAdj），LMK 按 adj 回收。
- 前台服务提升 adj 保活，但系统限制越来越多。
- 合理设计：保活 + 状态恢复 + 内存优化。
