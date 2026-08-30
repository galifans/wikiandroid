---
icon: boot
title: init 进程与 init.rc 深入
description: init 进程职责、init.rc 语法、service/action/trigger、SELinux 初始化、属性服务、init 守护进程
---

# init 进程与 init.rc 深入

> 面试高频指数：高
> init 是 Android 用户空间的第一个进程（PID 1），它负责启动所有系统服务与守护进程，理解 init 是理解系统启动的根基。

## 1. init 进程是什么

```text
init（PID 1）
Linux 内核启动后第一个用户空间进程

职责：
① 解析并执行 init.rc 脚本
② 启动 Zygote、servicemanager 等关键进程
③ 属性服务（property service）
④ 信号处理（回收僵尸进程）
⑤ SELinux 初始化
⑥ 设备节点创建（ueventd）
```

## 2. init.rc 语法

### 2.1 基本结构

```text
init.rc 由三部分组成：
- Actions（动作）：触发条件 + 执行命令
- Services（服务）：启动并守护的进程
- Imports（导入）：引入其他 rc 文件
```

```rc
# 示例：触发条件
on boot
    # 启动属性服务
    start servicemanager

on property:sys.boot_completed=1
    # 开机完成的后续动作
```

### 2.2 常见命令

| 命令 | 作用 |
|------|------|
| `start <service>` | 启动服务 |
| `stop <service>` | 停止服务 |
| `mkdir` / `chmod` | 创建目录 / 修改权限 |
| `setprop` | 设置系统属性 |
| `write` | 写文件 |
| `symlink` | 创建软链接 |
| `exec` | 执行命令 |
| `trigger` | 触发另一个 Action |

### 2.3 常用触发器

```text
on early-init      # 最早的初始化
on init            # 基础初始化
on boot            # 启动阶段
on property:xxx=y  # 属性变化触发
```

## 3. Service 定义与守护

### 3.1 Service 块

```rc
service zygote /system/bin/app_process -Xzygote /system/bin --zygote --start-system-server
    class main
    socket zygote stream 660 root system
    onrestart restart zygote
    critical
```

**关键属性**：

| 属性 | 说明 |
|------|------|
| `class main` | 服务分类（main 类随系统启动） |
| `socket` | 创建 Unix socket |
| `onrestart` | 服务重启时执行的命令 |
| `critical` | 关键服务，崩溃导致系统重启 |
| `seclabel` | SELinux 标签 |
| `disabled` | 默认不启动 |

### 3.2 服务生命周期

```text
init 对 Service 的管理：
- 启动：fork + exec
- 守护：服务退出时按 restart 策略重启
- critical 服务：反复崩溃 → 触发系统重启（watchdog 概念）

关键服务：
- servicemanager（Binder 注册中心）
- zygote（应用进程孵化器）
- surfaceflinger（图形合成）
- audioserver / cameraserver 等
```

## 4. 属性服务（Property Service）

### 4.1 属性是什么

```text
属性（property）：key-value 全局键值对
- 存储：共享内存（Android 高版本）/ 文件
- 访问：getprop / setprop
- 系统属性用于状态共享（如 sys.boot_completed）
```

```bash
# 读取属性
adb shell getprop ro.build.version.sdk
# 设置属性
adb shell setprop debug.myapp.level 2
```

### 4.2 属性访问流程

```text
getprop：
进程 → /dev/__properties__（共享内存）→ 直接读

setprop：
进程 → 属性服务（init 中的 property service，Binder）
→ 权限校验（SELinux + 前缀白名单）
→ 写入共享内存 → 通知监听者
```

**注意**：属性服务在 Android 高版本迁移到独立的属性进程（`property_service`），但概念一致。

## 5. SELinux 初始化

```text
init 启动时完成 SELinux 初始化：
① 读取 policy（/sepolicy）
② 设置 enforcing / permissive 模式
③ 为关键进程设置安全上下文

Android 默认 enforcing 模式
- 内核态：检查系统调用
- 用户态：检查服务访问（Binder 调用、文件访问）

违规访问记录在 logcat：avc: denied
```

## 6. init 的其他职责

### 6.1 ueventd

```text
ueventd（init 的一部分/子进程）
- 监听内核 uevent
- 创建 /dev 下设备节点
- 处理固件加载
```

### 6.2 僵尸进程回收

```text
init 是 PID 1，所有孤儿进程的父进程。
- 使用 SIGCHLD 信号处理子进程退出
- waitpid 回收僵尸进程
- 维护进程表（service_list）
```

## 7. init 与 Zygote 的关系

```text
init 通过 init.rc 启动 zygote：

service zygote /system/bin/app_process ...
    class main
    socket zygote stream 660 root system
    onrestart restart zygote

Zygote 启动后：
① 预加载类与资源
② 监听 /dev/socket/zygote
③ 收到请求 → fork 应用进程

init → zygote → SystemServer → App 进程
（进程树关系）
```

## 8. 高频面试题

**Q1：init 进程的作用是什么？**
A：Android 用户空间第一个进程（PID 1）。解析 init.rc、启动关键服务（servicemanager/zygote）、管理属性服务、SELinux 初始化、回收僵尸进程。

**Q2：init.rc 的 Service 和 Action 区别？**
A：Service 定义守护进程（fork+exec，可 restart）；Action 是"触发器 + 命令列表"，在满足条件（on boot / on property）时执行命令。

**Q3：属性系统是什么？getprop/setprop 流程？**
A：全局 key-value 状态共享。getprop 直接读共享内存；setprop 走属性服务做权限校验后写入并通知监听者。

**Q4：critical 服务崩溃会怎样？**
A：critical 服务（如 zygote）异常退出会触发系统重启（init 重启 / watchdog）。普通服务按 restart 策略重启。

**Q5：为什么 zygote 崩溃系统会重启？**
A：zygote 是应用进程的孵化器，崩溃后无法创建新进程，Android 判定系统不可用 → 触发重启。init.rc 中 zygote 标记 critical + onrestart。

## 9. 小结

- init = PID 1，解析 init.rc，管理服务与属性。
- init.rc：Action（触发+命令）与 Service（守护进程）。
- 属性服务：共享内存 + 权限校验，全局键值状态。
- SELinux 在 init 阶段初始化并持续守护。
- init → zygote → SystemServer → App 的进程树。
