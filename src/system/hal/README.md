---
icon: device
title: HAL 硬件抽象层
shortTitle: 概览
dir:
  text: HAL 硬件抽象层
  order: 14
---

# HAL 硬件抽象层

> Project Treble 解耦 system 与 vendor：HAL 架构演进、HIDL 接口定义、VINTF 兼容性验证，理解系统升级不再依赖厂商的原理。

## 文章列表

- [HAL 架构与 Treble](hal-architecture.md) — HAL 演进 / 绑定式与直通式 / HIDL 与 AIDL HAL
- [HIDL 接口与实现](hidl.md) — .hal 接口 / HwBinder / 服务注册 / 版本管理
- [VINTF 兼容性验证](vintf.md) — manifest / compatibility matrix / 启动校验

## 相关知识

- [SELinux 与 Android 安全](../../system/os/selinux.md) — HAL 服务的访问控制
- [分区布局与文件系统](../../system/storage/partition-filesystem.md) — system/vendor 分区
