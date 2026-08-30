---
icon: multimedia
title: 音频焦点与策略
description: AudioManager 焦点机制、AudioFocus 请求与丢失、音量策略、路由控制
---

# 音频焦点与策略

> 面试高频指数：中
> 音频焦点（AudioFocus）保证多个应用不会同时嘈杂出声。谁获得焦点、如何响应丢失，是应用音频开发的关键协作规范。

## 1. 音频焦点是什么

```text
音频焦点（Audio Focus）：
系统级"谁在用声音"的协调机制

目的：
- 避免多应用同时播放（嘈杂）
- 让重要声音优先（通话 > 音乐）
- 应用间礼貌协作

本质：
- AudioManager 申请/释放焦点
- 系统仲裁（同类型可共存，不同类型抢占）
- 丢失焦点需暂停/降音量
```

## 2. 焦点机制

### 2.1 焦点请求

```java
AudioManager am = (AudioManager) getSystemService(Context.AUDIO_SERVICE);
AudioFocusRequest focusRequest = new AudioFocusRequest.Builder(
        AudioManager.AUDIOFOCUS_GAIN)
        .setAudioAttributes(attributes)          // 播放属性
        .setOnAudioFocusChangeListener(listener) // 焦点变化回调
        .build();
int result = am.requestAudioFocus(focusRequest);
if (result == AudioManager.AUDIOFOCUS_REQUEST_GRANTED) {
    // 获得焦点，开始播放
}
```

### 2.2 焦点类型

| 类型 | 含义 | 应用行为 |
|------|------|----------|
| AUDIOFOCUS_GAIN | 长期独占 | 正常播放 |
| AUDIOFOCUS_GAIN_TRANSIENT | 短暂（提示音） | 暂停后恢复 |
| AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK | 短暂可降音 | 调低音量继续 |
| AUDIOFOCUS_GAIN_TRANSIENT_EXCLUSIVE | 独占（通话） | 完全打断 |

```text
注意：
- Android 8.0+ 必须用 AudioFocusRequest
- 播放前请求焦点，播放完释放
- 不请求焦点的播放会被系统忽略（部分场景）
```

## 3. 焦点丢失响应

### 3.1 回调处理

```java
private AudioManager.OnAudioFocusChangeListener listener = focusChange -> {
    switch (focusChange) {
        case AudioManager.AUDIOFOCUS_LOSS:            // 永久丢失
            pausePlayback();
            break;
        case AudioManager.AUDIOFOCUS_LOSS_TRANSIENT:  // 短暂丢失
            pausePlayback(); // 稍后恢复
            break;
        case AudioManager.AUDIOFOCUS_LOSS_TRANSIENT_CAN_DUCK:
            duckVolume();    // 调低音量
            break;
        case AudioManager.AUDIOFOCUS_GAIN:            // 重新获得
            resumePlayback();
            break;
    }
};
```

### 3.2 丢失场景

```text
典型场景：
- 来电（通话独占）→ 音乐暂停
- 语音助手 → 音乐暂停或降音
- 导航提示 → 音乐降音（duck）
- 闹钟 → 抢占焦点

处理规范：
- LOSS：必须停止（否则系统可能静音）
- TRANSIENT：暂停等待恢复
- CAN_DUCK：降低音量（或直接暂停）
```

## 4. 音量与流类型

### 4.1 流类型

| 流类型 | 用途 |
|--------|------|
| STREAM_VOICE_CALL | 通话 |
| STREAM_SYSTEM | 系统音 |
| STREAM_RING | 铃声 |
| STREAM_MUSIC | 媒体 |
| STREAM_ALARM | 闹钟 |
| STREAM_NOTIFICATION | 通知 |
| STREAM_ACCESSIBILITY | 无障碍 |

```text
注意：
- 播放使用 AudioAttributes 而不是流类型
- 系统根据 attributes 映射到流
- 音量调节按流类型独立
```

### 4.2 音量控制

```java
AudioManager am = (AudioManager) getSystemService(Context.AUDIO_SERVICE);
// 调节音量（按当前活跃流）
am.adjustStreamVolume(AudioManager.STREAM_MUSIC,
        AudioManager.ADJUST_RAISE, 0);
// 设置音量
am.setStreamVolume(AudioManager.STREAM_MUSIC, 10, 0);
// 查询最大音量
int max = am.getStreamMaxVolume(AudioManager.STREAM_MUSIC);
```

```text
音量策略：
- 音量键调节"当前活跃流"
- 应用可引导用户调对应流
- 音量曲线（对数/线性）由 HAL 决定
```

## 5. 路由控制

### 5.1 输出设备

```text
路由决策（AudioPolicy）：
- 播放属性 → 默认设备
- 用户可手动切换（设置/快捷面板）
- 蓝牙/耳机/扬声器

应用控制：
- 设置音频设备（setPreferredDevice，API 23+）
- 监听设备变化（AudioDeviceCallback）
- 处理 ACTION_AUDIO_BECOMING_NOISY（拔耳机）
```

### 5.2 播放前检查

```java
// 检查是否有音频输出设备
AudioDeviceInfo[] outputs = am.getDevices(AudioManager.GET_DEVICES_OUTPUTS);
boolean hasOutput = outputs.length > 0;
// 检查蓝牙 A2DP
for (AudioDeviceInfo device : outputs) {
    if (device.isSink() && device.getType() == AudioDeviceInfo.TYPE_BLUETOOTH_A2DP) {
        // 蓝牙耳机输出
    }
}
```

## 6. 播放器协作规范

```text
音频应用规范清单：
① 播放前 requestAudioFocus
② 播放完 releaseAudioFocus
③ 正确处理 LOSS/TRANSIENT/DUCK
④ 使用 AudioAttributes 声明用途
⑤ 处理耳机拔出（BECOMING_NOISY）
⑥ 后台播放用前台服务

常见问题：
- 不请求焦点 → 与导航/通话冲突
- 丢失焦点不暂停 → 被系统降权/静音
- 焦点请求类型不当 → 过度抢占
```

## 7. 高频面试题

**Q1：音频焦点是什么？为什么需要？**
A：系统协调多应用声音的机制，避免同时出声；通过 AudioManager 申请焦点，系统仲裁，丢失焦点需暂停或降音。

**Q2：焦点类型有哪些？**
A：GAIN（长期独占）、GAIN_TRANSIENT（短暂）、GAIN_TRANSIENT_MAY_DUCK（降音）、GAIN_TRANSIENT_EXCLUSIVE（通话类独占）。

**Q3：AUDIOFOCUS_LOSS 时应该怎么做？**
A：停止播放并清理；恢复播放需重新请求焦点（GAIN 回调时恢复）。不处理可能导致被系统静音。

**Q4：导航语音和音乐同时播怎么协调？**
A：导航申请 GAIN_TRANSIENT_MAY_DUCK，音乐收到 CAN_DUCK 降低音量继续播，导航结束释放焦点音乐恢复。

**Q5：拔掉耳机后怎么处理？**
A：监听 ACTION_AUDIO_BECOMING_NOISY 广播，暂停播放或提示用户，避免从扬声器突然外放。

## 8. 小结

- 音频焦点协调多应用发声。
- 焦点类型决定打断方式（独占/短暂/降音）。
- 丢失焦点必须响应（暂停/降音/恢复）。
- AudioAttributes 声明用途，系统映射流与路由。
- 处理耳机拔出与设备切换是应用责任。
