---
icon: boot
title: 属性系统 Property Service
description: 系统属性机制、属性存储共享内存、getprop/setprop、属性权限控制、属性与系统状态
---

# 属性系统（Property Service）

> 面试高频指数：中
> 系统属性是 Android 全局状态共享的"轻量级配置中心"，理解它有助于排查启动问题与系统状态。

## 1. 系统属性是什么

```text
系统属性（system property）= 全局 key-value 键值对

特点：
① 全局可见（所有进程可读）
② 进程间共享（共享内存）
③ 有权限控制（写权限受限）
④ 用于系统状态、配置、版本信息
```

**常见属性示例**：

| 属性 | 含义 |
|------|------|
| `ro.build.version.sdk` | SDK 版本（ro 只读） |
| `ro.product.model` | 机型 |
| `sys.boot_completed` | 是否完成开机 |
| `persist.sys.language` | 系统语言（persist 持久化） |
| `debug.xxx` | 调试开关 |
| `init.svc.zygote` | zygote 服务状态 |

## 2. 属性前缀规则

| 前缀 | 含义 | 谁可写 |
|------|------|--------|
| `ro.` | 只读，启动后不可改 | 仅系统 |
| `persist.` | 持久化，重启保留 | 系统/授权 |
| `sys.` | 系统运行时状态 | 系统 |
| `debug.` | 调试属性 | 系统（可开放） |
| `init.svc.` | init 服务状态 | init |
| 其他 | 通用属性 | 按权限 |

## 3. 属性存储与共享

### 3.1 存储结构（Android 8.0+）

```text
Android 8.0+ 属性系统重构：
- 属性存于共享内存（/dev/__properties__）
- 全局属性区域（system property area）
- 通过 mmap 映射到所有进程

旧版（Android 7-）：
- 属性存于 /dev/__properties__ 文件
- 同样共享内存方式

结构：
property_area（共享内存头部）
  └── 多个 property_info（名字 + 值）
  └── 上下文文件（SELinux 上下文）
```

### 3.2 读取流程（getprop）

```text
getprop 读取（无系统调用）：
① 进程已 mmap 共享内存区域
② 根据名字 hash 查找属性节点
③ 直接读取值（本地内存）

优点：读取零开销、无 IPC
```

```c
// native 读取
#include <cutils/properties.h>
char buf[PROPERTY_VALUE_MAX];
property_get("ro.build.version.sdk", buf, "0");
```

## 4. 写入流程（setprop）

### 4.1 权限校验

```text
setprop 写入流程：
① 调用方发起写请求
② 属性服务（property service）接收
③ 权限校验：
   - SELinux 检查（写属性上下文）
   - 前缀规则检查（ro. 只读保护）
   - UID 权限检查（普通 App 只能写带 selinux 授权的属性）
④ 校验通过 → 写入共享内存
⑤ 通知属性变化监听者（property_changed 回调）
```

### 4.2 普通 App 能否写属性？

```text
普通 App：
- 默认不可写系统属性
- 可以读写自己定义的（需 SELinux 授权，通常不可）
- 8.0+ 更严格：大部分 setprop 权限被移除

调试：
adb shell setprop（shell 用户有部分权限）
```

## 5. 属性与系统组件联动

### 5.1 init.rc 中监听属性

```rc
# 属性变为指定值时触发动作
on property:sys.boot_completed=1
    start some_service

on property:init.svc.zygote=restarting
    # zygote 重启处理
```

### 5.2 Java 层访问

```java
// Java 层读写属性
import android.os.SystemProperties;

// 读取
String sdk = SystemProperties.get("ro.build.version.sdk");

// 写入（普通 App 会抛 SecurityException）
SystemProperties.set("debug.myapp.level", "2");
```

```text
注意：SystemProperties 是 @hide API，
普通 App 无法直接调用，反射访问在 9.0+ 被隐藏 API 限制。
```

## 6. 属性与开机流程

```text
开机过程中属性变化：
init 设置 init.svc.* → 服务状态
SystemServer 启动各服务后设置 sys.*
全部启动完成 → sys.boot_completed=1
→ App 可判断开机完成（BOOT_COMPLETED 广播关联）

排查技巧：
adb shell getprop | grep -E "boot|init.svc"
查看启动卡在哪个服务
```

## 7. 高频面试题

**Q1：系统属性的存储与读取机制？**
A：属性存共享内存（/dev/__properties__），进程 mmap 映射后直接读，读取零 IPC；写入需属性服务校验权限后写共享内存并通知监听者。

**Q2：ro. 和 persist. 属性有什么区别？**
A：ro. 只读（启动后不可改，一般由系统固化）；persist. 持久化（写入 /data 重启保留）。sys./debug. 为运行时状态或调试用。

**Q3：为什么 App 不能随意 setprop？**
A：属性写入有权限控制（SELinux + 前缀规则 + UID），防止任意进程篡改系统状态。普通 App 默认无写权限，8.0+ 限制更严。

**Q4：sys.boot_completed 有什么用？**
A：系统开机完成标志。SystemServer 全部服务就绪后置 1，App 和 init.rc 可据此判断系统可用，触发后续动作（如开机广播关联）。

**Q5：getprop 读取有性能开销吗？**
A：没有。共享内存本地读取，无需 IPC。因此属性适合高频读取的状态/配置，但写入有校验开销。

## 8. 小结

- 属性 = 全局 key-value，共享内存存储，读取零开销。
- 前缀规则：ro. 只读、persist. 持久化、sys. 状态等。
- setprop 有权限校验（SELinux + UID + 前缀）。
- 属性驱动 init.rc 动作与开机状态（sys.boot_completed）。
