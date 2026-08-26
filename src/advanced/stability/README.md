---
icon: stability
title: 稳定性保障
shortTitle: 概览
dir:
  text: 稳定性保障
  order: 5
---

# 稳定性保障

崩溃监控、ANR 治理与线上问题排查。

## 文章列表

- [崩溃监控体系](crash-monitoring.md)
- [ANR 原理与治理](anr-guide.md)
- [APM 监控体系建设](apm-monitoring.md)
- [日志系统与线上问题排查](log-system.md)

## 核心要点

1. **崩溃类型**：Java 崩溃（Exception）/ Native 崩溃（信号）
2. **监控方案**：自有上报 / Bugly（腾讯）等
3. **ANR 定义**：主线程超时（输入 5s / 广播 10s / 服务 20s）
4. **治理流程**：采集 → 聚合 → 分析 → 修复 → 验证
5. **APM**：卡顿 / ANR / 网络 / 页面全链路监控 + 告警
6. **日志系统**：分级采集、环形存储、回捞、线上排查

## 稳定性指标

- 崩溃率（Crash Rate）
- ANR 率
- 无响应率
- 卡顿率
