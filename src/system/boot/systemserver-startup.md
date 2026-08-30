---
icon: boot
title: SystemServer 启动与系统服务注册
description: SystemServer 启动流程、系统服务分类、服务注册与启动顺序、Watchdog、服务启动优化
---

# SystemServer 启动与系统服务注册

> 面试高频指数：高
> SystemServer 承载了 Android 几乎全部系统服务（AMS/WMS/PMS 等），理解其启动与注册机制是系统源码面试的核心。

## 1. SystemServer 是什么

```text
SystemServer
运行在 system_server 进程（zygote fork 的第二个进程）

职责：
① 启动 100+ 系统服务
② 管理服务生命周期
③ 维护系统全局状态
④ 注册服务到 ServiceManager
```

```text
进程树：
init → zygote → system_server（SystemServer）
                → App 进程（zygote fork）
```

## 2. SystemServer 启动流程

### 2.1 启动入口

```text
ZygoteInit.main → startSystemServer()
→ fork 出 system_server 进程
→ SystemServer.main()

SystemServer.main()：
① 初始化系统上下文
② 创建 SystemServer 实例
③ run() 启动所有服务
```

### 2.2 三个阶段

```text
SystemServer.run() 分三阶段启动服务：

Phase 0：基础服务
  - Looper（主线程消息循环）
  - PackageManagerService（PMS）
  - ActivityManagerService（AMS）

Phase 100：核心服务
  - WindowManagerService（WMS）
  - InputManagerService
  - PowerManagerService
  - NotificationManagerService 等

Phase 500/550：其他服务
  - 相机、传感器、网络等
```

## 3. 系统服务分类

### 3.1 服务类型

| 类型 | 示例 | 特点 |
|------|------|------|
| Binder 服务 | AMS、WMS、PMS | 跨进程可调用 |
| 本地服务 | 部分内部服务 | 进程内使用 |
| 守护进程 | servicemanager、zygote | 独立进程 |

### 3.2 常见核心服务

| 服务 | 接口 | 职责 |
|------|------|------|
| ActivityManagerService | IActivityManager | 组件/进程管理 |
| WindowManagerService | IWindowManager | 窗口管理 |
| PackageManagerService | IPackageManager | 包/权限管理 |
| PowerManagerService | IPowerManager | 电源管理 |
| InputManagerService | IInputManager | 输入管理 |
| NotificationManagerService | INotificationManager | 通知管理 |
| ContentService | IContentService | Provider/Observer |

## 4. 服务注册机制

### 4.1 注册到 ServiceManager

```java
// SystemServer 中注册服务
ServiceManager.addService(Context.ACTIVITY_SERVICE, ams);
ServiceManager.addService(Context.WINDOW_SERVICE, wms);
ServiceManager.addService(Context.PACKAGE_SERVICE, pms);
```

```text
服务注册后：
- 其他进程通过 getService 按名字获取
- ServiceManager 维护 svclist（名字 → 句柄）
- App 通过 Binder 代理调用
```

### 4.2 服务间依赖

```text
服务启动有先后依赖：
- PMS 先启动（解析已安装应用）
- AMS 需要 PMS（获取应用信息）
- WMS 需要 AMS（Activity 关联窗口）

使用服务局部变量传递依赖（非全局 ServiceManager 查找），
提升启动性能（减少 IPC）。
```

## 5. Watchdog 机制

### 5.1 Watchdog 是什么

```text
Watchdog（system_server 中的看门狗线程）
监控系统服务是否卡死

机制：
① 定期（默认 60s）检查服务线程响应
② 检查主线程 Handler 是否处理消息
③ 检测到卡死 → 记录堆栈 → 重启 system_server

目的：避免系统永久无响应，自动恢复
```

### 5.2 触发条件

```text
Watchdog 触发：
- 主线程 Handler 60s 未响应
- 关键服务线程阻塞
- 死锁（常见于 Binder 调用互相等待）

恢复：
- 捕获各线程堆栈（dumpsys / dropbox）
- 重启 system_server（系统软重启）
```

## 6. 服务启动优化

### 6.1 启动耗时优化手段

| 手段 | 说明 |
|------|------|
| 服务局部变量 | 减少 ServiceManager 查找 IPC |
| 延迟初始化 | 非关键服务延后启动 |
| 并行启动 | 部分服务多线程初始化 |
| PMS 扫描缓存 | 加速包扫描 |

### 6.2 冷启动时间线

```text
开机到桌面（Boot to Home）：
内核 → init → zygote → system_server（各服务）
→ Launcher 启动 → 桌面可见

优化方向：
- 减少服务串行启动
- 关键路径优先（Launcher 相关服务）
- 预编译（dex2oat）加速
```

## 7. 高频面试题

**Q1：SystemServer 是怎么启动的？**
A：zygote fork 出 system_server 进程 → SystemServer.main() → run() 分阶段启动 PMS/AMS/WMS 等 100+ 服务并注册到 ServiceManager。

**Q2：为什么 PMS 要先启动？**
A：PMS 负责解析已安装应用，AMS/WMS 等需要应用信息（package info）、四大组件信息，所以 PMS 是核心前置依赖。

**Q3：Watchdog 的作用与原理？**
A：看门狗线程定期检查系统服务与主线程是否响应，卡死超时（约 60s）则记录堆栈并重启 system_server，避免系统永久无响应。

**Q4：系统服务是怎么暴露给 App 的？**
A：通过 ServiceManager 注册（addService），App 用 getService 获取 Binder 代理后跨进程调用。常见如 ActivityManager.getService()。

**Q5：如何提升系统启动速度？**
A：服务局部变量传递依赖减少 IPC、延迟/并行初始化非关键服务、PMS 扫描缓存、热点预编译等。

## 8. 小结

- SystemServer = 系统服务容器，zygote fork 启动。
- 三阶段启动：基础 → 核心 → 其他服务。
- 服务经 ServiceManager 注册，App 按名获取。
- Watchdog 守护：卡死自动重启 system_server。
- 启动优化：局部变量、延迟初始化、并行化。
