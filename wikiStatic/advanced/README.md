---
icon: rocket
title: 进阶实战
index: false
---

# 🚀 进阶实战

从"会开发"到"懂架构、会优化"的进阶之路。

## 模块

| 模块 | 说明 | 入口 |
|------|------|------|
| 架构设计 | MVC / MVP / MVVM / MVI | [架构](/advanced/architecture/) |
| 组件化 | 模块化与组件化拆分、路由 | [组件化](/advanced/modular/) |
| 插件化 | 插件化与热修复 | [插件化](/advanced/plugin/) |
| 性能优化 | 启动/卡顿/内存/包体积/网络/电量 | [性能优化](/advanced/performance/) |
| 稳定性 | 崩溃监控 / ANR / APM / 日志 | [稳定性](/advanced/stability/) |
| 音视频 | 音视频开发入门与深入 | [音视频](/advanced/multimedia/) |
| 跨端方案 | Flutter / RN / Compose Multiplatform | [跨端](/advanced/cross-platform/) |

## 成长路径

```
架构模式 → 组件化 → 性能优化 → 稳定性 → 专项（音视频/跨端）
```

## 📑 全部文章导航

### 🏗️ 架构设计
- [架构设计演进](/advanced/architecture/architecture-evolution.md)：MVC / MVP / MVVM / MVI
- [Clean Architecture 清洁架构](/advanced/architecture/clean-architecture.md)
- [Repository 仓库模式](/advanced/architecture/repository-pattern.md)
- [EventBus 源码分析](/advanced/architecture/eventbus-analysis.md)：注解 / 注册 / 发送事件

### 🧱 组件化
- [组件化与模块化实践](/advanced/modular/modularization-practice.md)：路由 / 资源隔离
- [路由框架设计](/advanced/modular/router-design.md)：APT 路由表 / 拦截器 / 降级 / SPI

### 🧩 插件化
- [插件化原理](/advanced/plugin/plugin-principle.md)：类加载 / 资源加载 / Hook
- [Hook 技术详解](/advanced/plugin/hook-tech.md)：代理 / 反射 Hook
- [热修复方案对比](/advanced/plugin/hotfix-comparison.md)：Tinker / AndFix / Sophix

### 🚀 性能优化
- [Android 启动优化实践](/advanced/performance/startup-optimization.md)
- [卡顿优化实战](/advanced/performance/jank-optimization.md)：掉帧 / 布局优化
- [内存优化与内存泄漏排查](/advanced/performance/memory-optimization.md)
- [APK 体积优化](/advanced/performance/apk-size-optimization.md)
- [LeakCanary 源码分析](/advanced/performance/leakcanary-analysis.md)
- [网络优化实战](/advanced/performance/network-optimization.md)：HTTPDNS / 连接复用 / 弱网 / 流量
- [电量优化实战](/advanced/performance/battery-optimization.md)：Doze / WakeLock / WorkManager

### 🛡️ 稳定性
- [崩溃监控方案](/advanced/stability/crash-monitoring.md)：Crash 捕获 / 上报
- [ANR 治理指南](/advanced/stability/anr-guide.md)：原理 / 定位 / 预防
- [APM 监控体系建设](/advanced/stability/apm-monitoring.md)：卡顿 / 网络 / 告警 / 定位
- [日志系统与线上问题排查](/advanced/stability/log-system.md)：分级采集 / 回捞 / 排查方法论

### 🎥 音视频
- [音视频开发入门](/advanced/multimedia/multimedia-basics.md)：采集 / 编码 / 播放
- [Media3 ExoPlayer 播放器深入](/advanced/multimedia/exoplayer-deep.md)：架构 / ABR / DRM / 渲染器
- [MediaCodec 与 FFmpeg 音视频处理](/advanced/multimedia/mediacodec-ffmpeg.md)：硬编硬解 / 编辑管线

### 🌉 跨端方案
- [跨端开发方案全景](/advanced/cross-platform/cross-platform-overview.md)：Flutter / RN / Compose Multiplatform / KMP
