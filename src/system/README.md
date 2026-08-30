---
icon: gears
title: 系统原理
index: false
---

# 系统原理

深入 Android 系统底层，理解机制背后的设计。

## 模块

| 模块 | 说明 | 入口 |
|------|------|------|
| Binder | 跨进程通信核心 | [Binder](/system/binder/) |
| AMS / WMS | 系统核心服务 | [AMS / WMS](/system/ams-wms/) |
| 启动流程 | 系统与应用启动 | [启动流程](/system/boot/) |
| APK | 打包与签名 | [APK](/system/apk/) |
| ART / DEX | 运行时与类加载 | [ART / DEX](/system/art/) |
| 操作系统 | 操作系统与 IPC | [操作系统](/system/os/) |
| 输入系统 | 输入事件读取与分发 | [输入系统](/system/input/) |
| 电源与功耗 | 电源管理 / WakeLock / Doze | [电源与功耗](/system/power/) |
| 网络与连接 | WiFi / 蓝牙 / 网络框架 | [网络与连接](/system/connectivity/) |
| 存储系统 | vold / 分区 / 应用存储 | [存储系统](/system/storage/) |
| 音频系统 | AudioFlinger / 音频焦点 | [音频系统](/system/audio/) |
| 图形显示系统 | SurfaceFlinger / VSYNC / HWC | [图形显示系统](/system/graphics/) |
| 安全体系 | 沙箱 / 权限 / 加密 / 启动安全 | [安全体系](/system/security/) |
| HAL 硬件抽象层 | Treble / HIDL / VINTF | [HAL 硬件抽象层](/system/hal/) |

## 知识框架

```
Linux 内核（进程/内存/驱动）
   ↑
Android 系统服务（AMS / WMS / PMS）
   ↑
Binder IPC（进程通信骨架）
   ↑
应用框架层（四大组件、View）
```

## 全部文章导航

### Binder 机制
- [Binder 跨进程通信机制详解](/system/binder/binder-mechanism.md)：驱动 / 代理 / 流程
- [Binder 驱动层深入](/system/binder/binder-driver.md)：binder_proc / mmap / BC_TRANSACTION
- [AIDL 深入解析](/system/binder/aidl-deep.md)：Stub / Proxy / 双向通信
- [Parcelable 序列化](/system/binder/parcelable.md)：与 Serializable 对比
- [IPC 方式对比](/system/binder/ipc-comparison.md)：Binder / Socket / Messenger
- [Binder 线程池与并发模型](/system/binder/binder-threadpool.md)：binder_thread / 线程池上限 / oneway
- [ServiceManager 深入解析](/system/binder/servicemanager-deep.md)：svclist / 服务注册与查询

### AMS / WMS
- [AMS 与 Activity 启动](/system/ams-wms/ams-activity-launch.md)：AMS 调度流程
- [WMS 窗口管理](/system/ams-wms/wms-principle.md)：窗口层级 / 添加删除
- [PMS 包管理机制](/system/ams-wms/pms-package-manager.md)：扫描解析 / 安装 / 权限
- [WMS 触摸事件分发深入](/system/ams-wms/wms-touch-dispatch.md)：InputDispatcher / 命中测试
- [Android 进程优先级与回收](/system/ams-wms/ams-process-priority.md)：oom_adj / LMK / 保活
- [广播机制底层原理](/system/ams-wms/broadcast-mechanism.md)：AMS 分发 / 有序广播 / 8.0 限制
- [ContentProvider 底层原理](/system/ams-wms/contentprovider-mechanism.md)：Provider 启动 / 跨进程访问

### 启动流程
- [系统启动流程](/system/boot/system-boot.md)：Bootloader → init → Zygote
- [应用启动流程](/system/boot/app-launch.md)：Launcher → AMS → ActivityThread
- [Zygote 进程深入](/system/boot/zygote-deep.md)：预加载 / fork / Socket 孵化
- [init 进程与 init.rc 深入](/system/boot/init-process.md)：init.rc / Service / 守护
- [属性系统 Property Service](/system/boot/property-service.md)：共享内存 / getprop / setprop
- [SystemServer 启动与系统服务注册](/system/boot/systemserver-startup.md)：服务启动 / Watchdog

### APK 打包与签名
- [APK 打包流程与签名机制](/system/apk/apk-build-process.md)：AAPT / D8 / 签名 v1-v3
- [APK 签名与校验机制](/system/apk/signature-verify.md)：v1-v4 / 密钥轮换 / 多渠道
- [多渠道打包](/system/apk/multi-channel.md)
- [APK 安装流程与原理](/system/apk/apk-install-process.md)：PackageInstaller / dex2oat / 安装器
- [APK 加固与安全防护](/system/apk/apk-reinforcement.md)：混淆 / 加壳 / 反调试
- [AAPT2 资源编译与打包](/system/apk/aapt2-resource.md)：compile / link / resources.arsc
- [AssetManager 资源加载机制](/system/apk/assetmanager.md)：资源查找 / 配置匹配 / 换肤

### ART / DEX / 类加载
- [ART 运行时与 GC](/system/art/art-runtime.md)：AOT / JIT / 回收器
- [ART 编译优化深入](/system/art/art-compilation.md)：Profile 引导 / dex2oat
- [ART 垃圾回收机制](/system/art/art-gc.md)
- [类加载器与双亲委托](/system/art/classloader.md)：DexClassLoader / PathClassLoader
- [DEX 文件格式](/system/art/dex-format.md)
- [ART 内存模型与对象布局](/system/art/art-memory-model.md)：对象头 / 压缩引用 / GC Roots
- [JNI 与 ART 交互机制](/system/art/jni-art.md)：JNIEnv / 引用管理 / 性能优化
- [隐藏 API 限制机制](/system/art/hidden-api.md)：黑白灰名单 / 反射检测 / 兼容

### 操作系统
- [操作系统核心概念](/system/os/os-core.md)：进程 / 线程 / 内存
- [Linux 内存管理深入](/system/os/linux-memory.md)：虚拟内存 / oom_adj / LMK
- [线程同步与 IPC](/system/os/thread-sync-ipc.md)：锁 / 信号量 / Linux IPC
- [Linux 进程调度机制](/system/os/linux-scheduler.md)：CFS / nice / 优先级映射
- [cgroup 与低内存回收](/system/os/cgroup-lmk.md)：cpuset / lmkd / 进程冻结
- [SELinux 与 Android 安全](/system/os/selinux.md)：MAC / policy / avc denied

### 输入系统
- [输入系统整体架构](/system/input/input-system.md)：IMS / EventHub / InputDispatcher 链路
- [InputReader 事件读取与加工](/system/input/input-reader.md)：触摸聚合 / 键位映射 / 设备配置
- [InputDispatcher 分发策略](/system/input/input-dispatcher.md)：分发状态机 / 输入 ANR / 排查

### 电源与功耗
- [电源管理架构](/system/power/power-architecture.md)：PMS / 电源状态机 / 亮灭屏
- [WakeLock 与唤醒机制](/system/power/wakelock.md)：类型 / 引用计数 / 泄露排查
- [Doze 模式与电池优化](/system/power/doze-battery.md)：状态机 / App Standby / 白名单

### 网络与连接
- [网络连接架构](/system/connectivity/connectivity-architecture.md)：ConnectivityService / NetworkAgent / 评分切换
- [WiFi 框架与连接流程](/system/connectivity/wifi.md)：WifiService / wpa_supplicant / 四步握手
- [蓝牙框架与协议栈](/system/connectivity/bluetooth.md)：GATT / 配对 / 权限

### 存储系统
- [存储系统架构](/system/storage/storage-architecture.md)：vold / StorageManagerService / FUSE / FBE
- [分区布局与文件系统](/system/storage/partition-filesystem.md)：动态分区 / A/B / ext4 / f2fs / dm-verity
- [应用存储与分区存储](/system/storage/app-storage.md)：Scoped Storage / MediaStore / SAF

### 音频系统
- [音频系统架构](/system/audio/audio-architecture.md)：AudioTrack / AudioFlinger / AudioPolicy / HAL
- [AudioFlinger 混音与输出](/system/audio/audioflinger.md)：共享内存 / 混音线程 / 低延迟
- [音频焦点与策略](/system/audio/audio-focus.md)：焦点类型 / LOSS 响应 / 流类型

### 图形显示系统
- [Android 图形架构](/system/graphics/graphics-architecture.md)：渲染 → BufferQueue → 合成 → 显示
- [SurfaceFlinger 合成机制](/system/graphics/surfaceflinger.md)：Layer / Transaction / 掉帧
- [VSYNC 与 Choreographer](/system/graphics/vsync-choreographer.md)：帧调度 / 16.6ms / 掉帧检测
- [HWC 硬件合成与显示](/system/graphics/hardware-composer.md)：Composer HAL / Overlay / 多屏

### 安全体系
- [Android 安全架构](/system/security/security-architecture.md)：沙箱 / 权限 / 签名 / 加密四层
- [Keystore 与密钥管理](/system/security/keystore.md)：硬件密钥 / TEE / 密钥约束
- [Verified Boot 与启动安全](/system/security/verified-boot.md)：AVB / dm-verity / 信任链

### HAL 硬件抽象层
- [HAL 架构与 Treble](/system/hal/hal-architecture.md)：HAL 演进 / 绑定式与直通式
- [HIDL 接口与实现](/system/hal/hidl.md)：.hal 接口 / HwBinder / 服务注册
- [VINTF 兼容性验证](/system/hal/vintf.md)：manifest / matrix / 启动校验
