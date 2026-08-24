---
icon: multimedia
title: 音视频开发入门
description: 音视频技术栈全景：采集、编码、播放、渲染、推流拉流、Media3/MediaCodec/FFmpeg
---

# 🎬 音视频开发入门

> 面试高频指数：⭐⭐⭐
> 音视频是 Android 的"硬核"方向，掌握整体技术栈与关键 API 是入门第一步。

## 1. 音视频技术全景

```text
采集 → 编码 → 封装 → 传输 → 解码 → 渲染

采集：Camera / AudioRecord / 屏幕录制
编码：H.264 / H.265 / AAC（硬编 MediaCodec / 软编 x264/FFmpeg）
封装：MP4 / FLV / TS（MediaMuxer / FFmpeg）
传输：RTMP / RTSP / HLS / WebRTC
解码：MediaCodec / ExoPlayer / FFmpeg
渲染：SurfaceView / TextureView / OpenGL ES
```

## 2. 播放：Media3 ExoPlayer（推荐）

```kotlin
// 依赖
// implementation("androidx.media3:media3-exoplayer:1.4.1")
// implementation("androidx.media3:media3-ui:1.4.1")

// 使用
val player = ExoPlayer.Builder(context).build()
player.setMediaItem(MediaItem.fromUri(videoUrl))
player.prepare()

// 绑定 UI
playerView.player = player
player.playWhenReady = true
```

```text
ExoPlayer 优势：
- 模块化（Source/Decoder/Renderer 可插拔）
- 自适应码率（HLS/DASH）
- 自定义能力强（DRM、字幕、音效）
- Media3 是官方推荐（替代旧 MediaPlayer）
```

## 3. 采集与硬编：Camera + MediaCodec

```kotlin
// ① 预览
cameraProvider.bindToLifecycle(
    lifecycleOwner,
    cameraSelector,
    preview,      // PreviewView 显示
    recorder      // 录制
)

// ② 硬编码（MediaCodec）
val format = MediaFormat.createVideoFormat(
    MediaFormat.MIMETYPE_VIDEO_AVC,  // H.264
    width, height
).apply {
    setInteger(MediaFormat.KEY_BIT_RATE, 2_000_000)  // 2Mbps
    setInteger(MediaFormat.KEY_FRAME_RATE, 30)        // 30fps
    setInteger(MediaFormat.KEY_I_FRAME_INTERVAL, 1)   // 关键帧间隔 1s
    setInteger(MediaFormat.KEY_COLOR_FORMAT, MediaCodecInfo.CodecCapabilities.COLOR_FormatSurface)
}

val encoder = MediaCodec.createEncoderByType(MediaFormat.MIMETYPE_VIDEO_AVC)
encoder.configure(format, null, null, MediaCodec.CONFIGURE_FLAG_ENCODE)
// 输入用 Surface（Camera 预览直通编码器）
encoder.createInputSurface().let { camera2Surface ->
    // Camera 输出到该 Surface
}
encoder.start()
```

## 4. 音视频编辑：FFmpeg

```bash
# FFmpeg 常用命令（移动端通过 JNI 调用）
# 转码
ffmpeg -i input.mp4 -c:v libx264 -c:a aac output.mp4
# 裁剪
ffmpeg -i input.mp4 -ss 00:00:10 -t 5 -c copy output.mp4
# 拼接
ffmpeg -f concat -i list.txt -c copy output.mp4
# 提取音频
ffmpeg -i input.mp4 -vn -c:a copy audio.aac
```

```text
移动端 FFmpeg 方案：
- 交叉编译 FFmpeg（Android NDK）
- 封装 JNI 层提供 Java/Kotlin API
- 处理耗时（解码/编码）放子线程
```

## 5. 推流与拉流

```text
直播链路：
采集（Camera + AudioRecord）
  → 编码（MediaCodec 硬编 H.264 + AAC）
  → 封装（FLV 格式）
  → 推流（RTMP 协议 → CDN）
  → 分发（边缘节点）
  → 拉流（HTTP-FLV / HLS）
  → 解码播放（ExoPlayer 等）

协议对比：
| 协议 | 延迟 | 场景 |
|------|------|------|
| RTMP | 1-3s | 推流/直播 |
| HTTP-FLV | 1-3s | 直播播放（国内主流） |
| HLS | 5-10s | 点播/直播（切片） |
| WebRTC | <500ms | 连麦/实时通话 |
```

## 6. 渲染方式对比

| 方案 | 原理 | 适用 |
| --- | --- | --- |
| SurfaceView | 独立 Surface，专用缓冲区 | 视频播放（性能最优） |
| TextureView | 作为 View 渲染，支持变换 | 需要动画/截图 |
| OpenGL ES | 自定义渲染管线 | 滤镜、特效、自定义渲染 |
| Vulkan | 新一代 GPU API | 高性能渲染 |

## 7. 高频面试题

**Q1：视频播放为什么用 SurfaceView 而不是普通 View？**
A：SurfaceView 使用独立 Surface（专用缓冲区，在系统合成层），
视频解码输出直接上屏，不经过 View 的 measure/draw，性能高；
普通 View 走 CPU/GPU 绘制管线，视频帧拷贝开销大。

**Q2：硬编和软编的区别？**
A：硬编（MediaCodec）：专用硬件编码器，快、省电，兼容性需判断；
软编（x264/FFmpeg）：CPU 编码，兼容性好，但耗电发热。直播常用硬编。

**Q3：H.264 和 H.265 的区别？**
A：H.265（HEVC）压缩率比 H.264 高约 50%，同画质码率更低；
但硬件支持更晚、编码复杂度高。4K 高分辨率场景用 H.265。

**Q4：直播延迟怎么降低？**
A：选低延迟协议（RTMP/HTTP-FLV）；关闭缓冲策略（ExoPlayer
loadControl 配置）；关键帧间隔控制；CDN 节点就近；WebRTC 用于
实时互动场景。

**Q5：如何实现视频截帧/缩略图？**
A：MediaMetadataRetriever（系统 API，简单场景）；MediaCodec 解码
指定帧（高性能）；FFmpeg 抽帧（灵活）。注意异步处理 + 复用。

## 8. 小结

- 全景：采集 → 编码 → 封装 → 传输 → 解码 → 渲染。
- 播放首选 Media3 ExoPlayer；硬编 MediaCodec；渲染 SurfaceView。
- 直播：RTMP 推流 + HTTP-FLV/HLS 拉流，WebRTC 低延迟互动。
- 面试重点：SurfaceView 原理、硬软编、协议选型。
