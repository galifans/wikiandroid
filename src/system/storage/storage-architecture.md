---
icon: server
title: 存储系统架构
description: vold、分区布局、FUSE 挂载、存储挂载点、外部存储虚拟化
---

# 存储系统架构

> 面试高频指数：中
> Android 的存储体系由 vold 守护进程驱动：分区管理、挂载、FUSE 虚拟化外部存储。理解它能解释"内部/外部存储"的真实形态。

## 1. 存储架构全景

```text
应用层：Context.getFilesDir() / getExternalFilesDir()
  ↓
Framework：StorageManagerService（SMS）
  ↓
Native：vold（volume daemon，存储守护进程）
  ├── 分区挂载（fstab）
  ├── 磁盘管理（FUSE / ext4 / f2fs）
  ├── 加密（FBE/FDE）
  └── 存储卷管理（VolumeManager）
  ↓
内核：块设备 / 文件系统驱动
```

## 2. StorageManagerService

### 2.1 服务职责

```text
StorageManagerService 核心职责：
① 与 vold 通信（挂载/卸载/格式化）
② 管理存储卷（内部存储/外置 SD/OTG）
③ 存储状态广播（挂载/卸载/损坏）
④ 应用存储配额与权限
⑤ 存储统计（StorageStatsManager）
⑥ FUSE 挂载协调
```

### 2.2 卷管理

```text
存储卷（Volume）：
- 内部存储（emulated）：/storage/emulated/0
- 外置存储（SD 卡）：/storage/XXXX-XXXX
- USB OTG：/storage/YYYY-YYYY

卷状态机：
UNMOUNTED → CHECKING → MOUNTED
→ UNMOUNTING → EJECTING
损坏 → UNMOUNTABLE
```

## 3. vold 深入

### 3.1 vold 职责

```text
vold（Volume Daemon）：
运行在 native 层的守护进程

职责：
① 解析 fstab 挂载系统分区
② 管理外部存储挂载
③ 磁盘加密（FBE/FDE）
④ 存储事件上报（Netlink/uevent）
⑤ 格式化与分区

与 SMS 通信：
- Binder（VolumeManager 接口）
- 挂载/卸载/状态变化
```

### 3.2 存储事件流

```text
事件流示例（插入 SD 卡）：
内核 uevent（设备插入）
→ vold 检测
→ 分区检查 + 挂载
→ 通知 SMS
→ SMS 广播（MEDIA_MOUNTED）
→ 应用收到 VolumeInfo 变化
```

## 4. FUSE 与外部存储

### 4.1 为什么用 FUSE

```text
FUSE（Filesystem in Userspace）：
把文件系统实现搬到用户态

Android 用 FUSE 的原因：
① 统一权限控制（按 UID 过滤）
② 模拟多用户存储隔离
③ 无需内核模块支持
④ 应用看到的是"自己的"外部存储

路径映射：
/storage/emulated/0/...（FUSE 挂载）
→ 实际数据在 /data/media/0/...
```

### 4.2 FUSE 流程

```text
应用读写外部存储：
open /storage/emulated/0/foo.txt
→ FUSE 内核模块转发
→ FUSE daemon（sdcard）
→ 权限检查（UID 匹配）
→ 实际访问 /data/media/0/foo.txt

好处：应用无法绕过权限直接访问他人文件
代价：多一层转发（性能略有损耗）
```

## 5. 存储加密

### 5.1 FBE / FDE

```text
存储加密方案：
- FDE（Full Disk Encryption，Android 5.0）
  整盘加密，开机需密码解锁
- FBE（File-Based Encryption，Android 7.0+）
  按文件加密，不同用户/凭据不同密钥
  → 设备加密（DE）与应用数据加密（CE）分离
  → 支持 Direct Boot

FBE 目录划分：
- DE 空间（设备加密）：闹钟、来电等开机可用
- CE 空间（凭据加密）：应用数据，解锁后可用
```

### 5.2 密钥管理

```text
FBE 密钥链：
主密钥 → 设备主密钥（DE）
         → 凭据主密钥（CE，受锁屏密码保护）

解锁后：
- CE 密钥注入内核
- 应用数据可访问
- 重启后需再次解锁
```

## 6. 存储状态与广播

| 状态 | 说明 |
|------|------|
| MEDIA_MOUNTED | 挂载完成可读写 |
| MEDIA_UNMOUNTED | 已卸载 |
| MEDIA_EJECTING | 正在卸载（准备移除） |
| MEDIA_BAD_REMOVAL | 未安全移除 |
| MEDIA_UNMOUNTABLE | 无法挂载（损坏） |

```text
应用监听：
ACTION_MEDIA_MOUNTED / ACTION_MEDIA_EJECTED 等
（Android 8.0+ 隐式广播限制，需动态注册）
```

## 7. 高频面试题

**Q1：vold 是什么？**
A：存储守护进程，负责分区挂载、外部存储管理、磁盘加密与格式化，与 StorageManagerService 通过 Binder 通信。

**Q2：为什么 Android 用 FUSE 做外部存储？**
A：用户态实现权限控制（按 UID 隔离）、多用户存储隔离、无需内核模块；应用通过 FUSE 访问 /storage/emulated/0 实际落到 /data/media。

**Q3：FBE 和 FDE 区别？**
A：FDE 整盘加密需开机解锁；FBE 按文件加密，分 DE（设备加密，开机可用）与 CE（凭据加密，解锁可用），支持 Direct Boot。

**Q4：内部存储和外部存储的本质区别？**
A：内部存储是 /data 下应用私有目录（其他应用不可见）；外部存储是 /storage/emulated 经 FUSE 虚拟化的共享存储（多应用可见）。

**Q5：SD 卡插入后系统怎么处理？**
A：内核 uevent → vold 检测挂载 → SMS 广播 MEDIA_MOUNTED → 应用收到状态变化。

## 8. 小结

- 存储链路：应用 → SMS → vold → 内核文件系统。
- vold 管分区挂载、外置存储、加密。
- FUSE 虚拟化外部存储，实现权限与多用户隔离。
- FBE 按文件加密，DE/CE 分离支持 Direct Boot。
- 存储状态广播帮助应用感知卷变化。
