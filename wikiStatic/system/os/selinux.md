---
icon: os
title: SELinux 与 Android 安全
description: SELinux MAC 模型、安全上下文、policy 规则、avc denied、enforcing/permissive、Android 加固
---

# SELinux 与 Android 安全

> 面试高频指数：中
> SELinux 是 Android 安全模型的核心（强制访问控制），理解其机制有助于排查权限问题与理解系统加固。

## 1. 为什么需要 SELinux

### 1.1 DAC 的局限

```text
传统 Linux 权限（DAC：自主访问控制）：
- 基于 UID/GID + rwx 权限位
- 缺陷：root 用户无所不能；进程逃逸即全权

Android 引入 SELinux（MAC：强制访问控制）：
- 所有进程有安全上下文（domain）
- 所有对象有安全标签（type）
- 访问必须匹配 policy 规则
- 即使 root 也无权越界
```

| 对比 | DAC | SELinux（MAC） |
|------|-----|----------------|
| 控制主体 | UID/GID | 安全上下文（domain） |
| 权限粒度 | 文件 rwx | 精细到操作 |
| root 权限 | 全权 | 仍受 policy 约束 |
| 默认策略 | 允许 | 拒绝（白名单） |

## 2. 核心概念

### 2.1 安全上下文

```text
安全上下文格式：
user:role:type:level

示例：
u:r:untrusted_app:s0:c512,c768
u:object_r:app_data_file:s0

关键字段：
- type（类型）：决定访问规则
- 进程 type 也叫 domain
```

### 2.2 常见 domain 与 type

| domain/type | 说明 |
|-------------|------|
| untrusted_app | 普通应用进程 |
| system_app | 系统应用 |
| system_server | 系统服务进程 |
| zygote | 孵化器 |
| app_data_file | 应用私有数据 |
| sdcard_type | 存储卡文件 |

## 3. Policy 规则

### 3.1 规则语法

```text
SELinux policy 规则（allow 语句）：

allow <source_type> <target_type> : <class> <permission>;

示例：
allow untrusted_app app_data_file : file { read write open };

含义：允许 untrusted_app 对 app_data_file 类型的文件
执行 read/write/open 操作
```

### 3.2 规则文件

```text
Android policy 来源：
- 内核内嵌 policy（sepolicy）
- /system/sepolicy 等目录的 .te 文件
- 编译期打包进内核/ramdisk

.te 文件示例（app.te）：
allow untrusted_app app_data_file:dir create_dir_perms;
```

## 4. enforcing / permissive

### 4.1 两种模式

| 模式 | 行为 | 用途 |
|------|------|------|
| Enforcing | 违规拒绝 + 记录 | 生产环境 |
| Permissive | 违规只记录不拒绝 | 调试、开发 |

```text
查看模式：
adb shell getenforce
→ Enforcing / Permissive

Android 默认 Enforcing（Android 5.0+）
```

### 4.2 违规日志 avc denied

```text
排查权限问题看 logcat：

avc: denied { read } for pid=1234
  comm="app" name="file.txt"
  scontext=u:r:untrusted_app:s0
  tcontext=u:object_r:system_data_file:s0
  tclass=file permissive=0

解读：
- denied { 操作 }
- scontext：调用方 context（domain）
- tcontext：目标对象 context（type）
- tclass：对象类别（file/dir/binder 等）
- permissive=0：enforcing 模式（拒绝）
```

## 5. Binder 与 SELinux

### 5.1 Binder 调用检查

```text
Android 对 Binder 服务调用也做 SELinux 检查：

服务端进程 domain + 服务名 → 查 policy
（通过 service_contexts 映射）

示例规则：
allow untrusted_app activity_service : binder call;

App 调用系统服务（AMS 等）必须匹配规则，
否则 SecurityException / avc denied
```

### 5.2 常见问题

```text
常见 SELinux 导致的问题：
- 文件访问被拒（app_data_file 之外的路径）
- Binder 服务调用被拒
- 自定义服务/守护进程未配置规则
- 设备厂商修改导致的兼容问题

解决：
- 检查 avc denied 日志
- 补充 policy（add allow 规则）
- 使用 seapp_contexts 调整应用 domain
```

## 6. SELinux 与 App 安全

### 6.1 应用隔离

```text
SELinux 在 Android 中的应用隔离：
- 每个应用进程独立 domain（untrusted_app 细分）
- 应用数据目录独立 type（app_data_file + 专属）
- 不能访问其他应用数据（DAC 之外的第二层保护）

即使 root 进程也不能直接读应用私有数据
（无对应 policy 规则）
```

### 6.2 与权限系统的配合

```text
两层安全体系：
① Android 权限系统（permission）：应用层声明
② SELinux：内核强制访问控制

关系：
- 权限通过 → 还需 SELinux 允许
- SELinux 是最后的底线
- 提权漏洞往往需要同时绕过两者
```

## 7. 高频面试题

**Q1：SELinux 是什么？和传统权限的区别？**
A：强制访问控制（MAC），基于安全上下文与 policy 白名单；即使 root 也受 policy 约束，比 DAC（UID/rwx）更安全。

**Q2：enforcing 和 permissive 模式区别？**
A：Enforcing 违规即拒绝并记录；Permissive 只记录不拒绝（调试用）。Android 5.0+ 默认 Enforcing。

**Q3：avc denied 日志怎么排查？**
A：看 scontext（调用方 domain）、tcontext（目标 type）、tclass（对象类别）、操作，在 policy 中补充对应 allow 规则，或调整应用 context。

**Q4：SELinux 对 Binder 调用有影响吗？**
A：有。Binder 服务调用需要匹配 policy（binder call 规则），通过 service_contexts 映射服务名，违规会抛 SecurityException。

**Q5：为什么 root 也读不了应用私有数据？**
A：SELinux 按 type 隔离，root 进程若无对应 allow 规则，访问 app_data_file 仍被拒绝。这是 MAC 强于 DAC 的体现。

## 8. 小结

- SELinux = MAC 强制访问控制，白名单策略。
- 安全上下文（domain/type）+ policy 规则。
- Enforcing 拒绝 + avc 日志，Permissive 调试。
- Binder 调用受 SELinux 约束。
- 与 Android 权限系统双层防护。
