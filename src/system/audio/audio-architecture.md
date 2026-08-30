---
icon: multimedia
title: 音频系统架构
description: AudioTrack/AudioRecord、AudioFlinger、AudioPolicy、音频 HAL、播放链路
---

# 音频系统架构

> 面试高频指数：中
> 从应用播放一段声音到扬声器出声，中间经过 AudioTrack、AudioFlinger 混音与 AudioPolicy 路由三层。这是 Android 音频架构的核心。

## 1. 音频架构分层

```text
应用层：MediaPlayer / SoundPool / AudioTrack
  ↓
Framework：AudioManager / AudioService
  ↓
Native：AudioFlinger（混音/输出）
        AudioPolicyService（策略/路由）
        AudioTrack（客户端）
  ↓
HAL：Audio HAL（vendor 实现）
  ↓
内核：ALSA 驱动 / 音频设备
```

| 组件 | 职责 |
|------|------|
| AudioTrack | 播放客户端（应用侧） |
| AudioRecord | 录音客户端（应用侧） |
| AudioFlinger | 混音、输出线程、路由 |
| AudioPolicyService | 策略、焦点、路由决策 |
| AudioService | Java 服务（音量/焦点/设备） |
| Audio HAL | 设备抽象（播放/录音/处理） |

## 2. 播放链路

### 2.1 播放流程

```text
播放链路：
AudioTrack.write(音频数据)
→ 共享内存传递到 AudioFlinger
→ Track 加入 Mixer
→ 混音线程混合所有 Track
→ 格式转换（采样率/通道）
→ 输出到 HAL（write）
→ 扬声器/耳机发声

关键点：
- 音频数据通过共享内存传输（零拷贝）
- 多应用音频在 AudioFlinger 混音
- 输出线程按设备策略选择
```

### 2.2 录音链路

```text
录音链路：
麦克风 → Audio HAL（read）
→ AudioFlinger 录音线程
→ AudioRecord 共享内存
→ 应用读取

特殊处理：
- 回声消除（AEC）
- 降噪（NS）
- 增益控制（AGC）
- 通话场景由 HAL/算法处理
```

## 3. AudioTrack 详解

### 3.1 创建与播放

```java
int sampleRate = 44100;
int channelConfig = AudioFormat.CHANNEL_OUT_STEREO;
int audioFormat = AudioFormat.ENCODING_PCM_16BIT;
int bufferSize = AudioTrack.getMinBufferSize(sampleRate, channelConfig, audioFormat);

AudioTrack track = new AudioTrack.Builder()
        .setAudioAttributes(new AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_MEDIA)
                .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                .build())
        .setAudioFormat(new AudioFormat.Builder()
                .setSampleRate(sampleRate)
                .setChannelMask(channelConfig)
                .setEncoding(audioFormat)
                .build())
        .setBufferSizeInBytes(bufferSize)
        .build();

track.play();
track.write(pcmData, 0, pcmData.length);
```

### 3.2 关键概念

```text
AudioTrack 要点：
- 缓冲区大小决定延迟（小→低延迟，大→抗抖）
- 两种模式：
  static：一次性数据（音效）
  streaming：持续写入（音乐）
- getMinBufferSize 是系统建议最小值
- 低延迟播放需小缓冲 + 高优先级线程
```

## 4. AudioFlinger 深入

### 4.1 混音原理

```text
混音（Mixing）：
- 多个 Track 同时播放
- 按增益叠加（线性叠加）
- 格式统一（重采样/通道转换）
- 输出到硬件支持格式

混音线程类型：
- PlaybackThread：普通播放
- DuplicatingThread：多输出（投屏+本机）
- OffloadThread：硬件解码播放（省电）
```

### 4.2 输出与延迟

```text
输出路径：
Mixer → AudioHAL.write → 设备

延迟来源：
- 应用缓冲（AudioTrack buffer）
- AudioFlinger 混音线程缓冲
- HAL 缓冲
- 硬件（DAC/扬声器）
- 路由切换

低延迟优化：
- AAudio / Oboe（原生音频）
- 小缓冲 + 高优先级
- 避免重采样
```

## 5. AudioPolicyService

### 5.1 策略决策

```text
AudioPolicy 职责：
① 路由决策（耳机/扬声器/蓝牙）
② 输出设备选择（按 usage）
③ 音频焦点管理
④ 音量策略
⑤ 设备切换处理

路由判断：
AudioAttributes.USAGE_* → 设备类型
- USAGE_MEDIA → 音乐设备
- USAGE_VOICE_COMMUNICATION → 通话设备
- USAGE_ALARM → 强制扬声器（部分）
```

### 5.2 设备切换

```text
插入耳机：
- 内核事件 → AudioService
- AudioPolicy 切换路由
- 播放继续（无缝切换）或暂停（策略）
- 通知应用（ACTION_AUDIO_BECOMING_NOISY）

蓝牙耳机：
- A2DP 连接 → 路由到蓝牙
- 通话走 HFP
```

## 6. Audio HAL

```text
Audio HAL 职责：
- 打开/关闭输出输入流
- 读写音频数据
- 设备参数控制（音量、采样率）
- 音频效果（EQ、环绕）

HAL 接口演进：
- legacy HAL（IStreamOut/IStreamIn）
- AIDL HAL（Android 13+ 逐步迁移）

音频效果：
- 均衡器（EQ）
- 混响（Reverb）
- 环绕（Virtualizer）
- 经 AudioEffect 框架加载
```

## 7. 高频面试题

**Q1：Android 音频架构分几层？**
A：应用（AudioTrack/AudioRecord）→ Framework（AudioService）→ native（AudioFlinger 混音 + AudioPolicy 策略）→ Audio HAL → 内核 ALSA。

**Q2：多应用同时播放音频怎么处理？**
A：AudioFlinger 混音线程把多个 Track 按增益叠加混合，统一输出到硬件；系统服务会优先策略管理焦点。

**Q3：AudioTrack 的缓冲大小有什么影响？**
A：缓冲小则延迟低但易欠载（声音断续），缓冲大则稳定但延迟高；低延迟播放用较小缓冲 + 高优先级线程。

**Q4：插入耳机时系统怎么处理？**
A：内核事件上报 → AudioService/AudioPolicy 切换路由到耳机；若当前播放适合暂停则发 ACTION_AUDIO_BECOMING_NOISY 广播。

**Q5：如何降低音频延迟？**
A：用 AAudio/Oboe 原生接口、减小缓冲区、避免重采样、保持高优先级播放线程，从应用到 HAL 全链路优化。

## 8. 小结

- 音频四层：应用 / Framework / AudioFlinger+Policy / HAL。
- 播放经共享内存到 AudioFlinger 混音后输出。
- 路由与焦点由 AudioPolicy 决策。
- 缓冲大小权衡延迟与稳定性。
- 低延迟用 AAudio/Oboe + 小缓冲。
