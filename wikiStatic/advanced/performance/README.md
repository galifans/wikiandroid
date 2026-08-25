---
icon: performance
title: 性能优化
shortTitle: 概览
dir:
  text: 性能优化
  order: 4
---

# ⚡ 性能优化

性能优化是进阶与面试的重中之重。

## 文章列表

- [启动优化实践](startup-optimization.md)
- [内存优化与泄漏排查](memory-optimization.md)
- [卡顿优化与掉帧分析](jank-optimization.md)
- [ANR 机制与优化](anr-optimization.md)
- [包体积优化](apk-size-optimization.md)
- [LeakCanary 源码分析](leakcanary-analysis.md)
- [网络优化实战](network-optimization.md)
- [电量优化实战](battery-optimization.md)

## 优化维度

| 维度 | 核心手段 |
|------|----------|
| 启动 | 减少冷启动耗时、启动器框架、异步初始化 |
| 卡顿 | 布局优化、减少主线程耗时、预加载 |
| 内存 | 泄漏排查（LeakCanary）、Bitmap 优化、内存缓存 |
| 电量 | 定位/网络/唤醒锁优化、Doze 适配 |
| 包体积 | R8 混淆、资源压缩、动态特性模块 |
| 网络 | HTTPDNS、连接复用、弱网适配、流量压缩 |
