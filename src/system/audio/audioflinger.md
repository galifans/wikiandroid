---
icon: multimedia
title: AudioFlinger 混音与输出
description: Mixer 混音、PlaybackThread、共享内存传输、采样率转换、输出线程模型
---

# AudioFlinger 混音与输出

> 面试高频指数：低
> AudioFlinger 是 Android 音频的"混音器"：把多个应用的声音实时混合后输出到设备。它的线程模型决定了音频延迟与稳定性。

## 1. AudioFlinger 定位

```text
AudioFlinger（native 服务，system_server 内）
Android 音频核心服务

职责：
① 管理播放/录音 Track
② 混音（Mixer）
③ 输出线程调度
④ 采样率/格式转换
⑤ 与 HAL 交互读写设备
```

## 2. 共享内存传输

### 2.1 传输机制

```text
音频数据传输：
AudioTrack（应用进程）
  → ashmem 共享内存（AudioSharedMemory）
  → AudioFlinger 读取混音

流程：
应用 write() 数据到共享内存
→ AudioFlinger 混音线程消费
→ 完成后通知应用可继续写

特点：
- 避免跨进程拷贝（零拷贝）
- 环形缓冲区
- 帧计数同步（frame position）
```

### 2.2 Track 生命周期

```text
Track 状态：
NEW → STARTING → ACTIVE → STANDBY → STOPPED

- STARTING：等待混音线程接入
- ACTIVE：正常混音
- STANDBY：空闲降功耗
- STOPPED：停止

Track 断开（异常）：
- 应用死亡（Binder 断连）
- 混音线程检测 → 清理
```

## 3. 混音线程模型

### 3.1 线程类型

| 线程 | 用途 |
|------|------|
| PlaybackThread | 普通播放输出 |
| DuplicatingThread | 同时输出到多设备（投屏） |
| OffloadThread | 硬件解码播放（低功耗） |
| RecordThread | 录音输入 |
| MmapThread | 低延迟内存映射播放 |

```text
线程选择由 AudioPolicy 决定：
- 默认媒体 → PlaybackThread
- 硬件支持压缩格式 → OffloadThread
- 低延迟需求 → MmapThread
```

### 3.2 混音循环

```text
混音主循环（PlaybackThread）：
① 等待下一帧时间（按采样率定时）
② 收集所有 ACTIVE Track 数据
③ 按增益混音（Mixer 累加）
④ 格式转换（重采样/通道/位深）
⑤ 写入 HAL（或本地缓冲）
⑥ 更新帧位置，通知应用

每帧时间：
例如 48kHz 256 帧缓冲 ≈ 5.3ms
```

## 4. 混音细节

### 4.1 Mixer 工作

```text
Mixer 混音：
输出 = Σ(Track_i * Gain_i)

处理链：
Track 数据 → 增益 → 重采样（如需要）
→ 通道混合 → 累加 → 输出格式转换

增益来源：
- 应用音量（stream volume）
- 系统音量
- 淡入淡出（fade）
- 平衡（左右）
```

### 4.2 采样率转换

```text
SRC（Sample Rate Conversion）：
- 各 Track 采样率可能不同（44.1k/48k）
- 统一转换到输出采样率
- 高质量 SRC 用重采样器（多相滤波器）

性能影响：
- SRC 是 CPU 密集操作
- 尽量统一采样率避免转换
- 低延迟场景避免 SRC
```

## 5. 低延迟路径

### 5.1 Fast Mixer

```text
FastMixer（Android 4.4+）：
- 独立的高优先级混音线程
- 小缓冲、低延迟
- 处理"fast track"（低延迟需求）

适用场景：
- 游戏音效
- 实时通信
- 音乐演奏类应用

限制：
- 硬件需支持低延迟路径
- 采样率受限（通常 48kHz）
```

### 5.2 性能指标

```text
延迟测量：
- 输出延迟：write 到出声的时间
- 输入延迟：声音到 read 的时间
- 往返延迟：输入 + 输出（通话/游戏）

典型值：
- 低延迟路径：20-50ms
- 普通路径：50-100ms+
- iOS 约 10-20ms（对比参考）

优化手段：
- AAudio/Oboe
- 减少缓冲层级
- 禁用不必要效果
- 独占模式（EXCLUSIVE）
```

## 6. 常见问题

```text
音频问题排查：
① 声音断续（欠载）：
   - 缓冲太小
   - 混音线程被抢占
   - CPU 繁忙
② 延迟高：
   - 缓冲层级多
   - SRC 转换
   - 非低延迟路径
③ 无声：
   - 路由错误
   - HAL 故障
   - 音量/焦点问题
④ 回声：
   - AEC 未生效
   - 设备配置问题

工具：
dumpsys audio
logcat（AudioFlinger 标签）
```

## 7. 高频面试题

**Q1：音频数据怎么从应用到 AudioFlinger？**
A：通过共享内存（ashmem）零拷贝传输，应用写环形缓冲，AudioFlinger 混音线程消费，帧计数同步。

**Q2：混音线程有哪些类型？**
A：PlaybackThread（普通）、DuplicatingThread（多输出）、OffloadThread（硬件解码）、RecordThread（录音）、MmapThread（低延迟）。

**Q3：为什么会有采样率转换？**
A：各 Track 采样率不同（44.1k/48k），需统一到输出采样率；SRC 是 CPU 密集操作，影响延迟。

**Q4：如何降低音频延迟？**
A：用 AAudio/Oboe、小缓冲、低延迟路径（FastMixer/MmapThread）、避免 SRC、独占模式。

**Q5：声音断续是什么原因？**
A：缓冲区欠载（应用写入不及时）、混音线程被抢占、CPU 繁忙导致周期 miss；加大缓冲或优化线程优先级可缓解。

## 8. 小结

- AudioFlinger 是混音中枢，共享内存传输。
- 多线程模型适配不同场景。
- 混音 = 增益叠加 + 格式转换。
- SRC 与缓冲层级决定延迟。
- 低延迟用 AAudio/Oboe + 独占路径。
