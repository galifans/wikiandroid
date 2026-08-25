---
icon: multimedia
title: 音视频开发
shortTitle: 概览
dir:
  text: 音视频开发
  order: 6
---

# 🎬 音视频开发

音视频技术栈：采集、编码、传输、播放。

## 文章列表

- [音视频开发入门](multimedia-basics.md)

## 核心要点

1. **采集**：Camera / AudioRecord / MediaCodec
2. **编码**：H.264 / H.265 / AAC，硬编（MediaCodec）与软编
3. **播放**：ExoPlayer（推荐）/ Media3
4. **渲染**：SurfaceView / TextureView / OpenGL ES
5. **推流拉流**：RTMP / RTSP / WebRTC

## 技术选型

| 场景 | 方案 |
|------|------|
| 播放器 | Media3 ExoPlayer |
| 直播推流 | 腾讯云 / 声网 / WebRTC |
| 音视频编辑 | FFmpeg（移动端编译） |
| 图形渲染 | OpenGL ES / Vulkan |
