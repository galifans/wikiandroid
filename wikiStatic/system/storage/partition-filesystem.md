---
icon: server
title: 分区布局与文件系统
description: boot/system/vendor/data 分区、动态分区、ext4/f2fs、A/B 无缝更新、dm-verity
---

# 分区布局与文件系统

> 面试高频指数：中
> Android 设备的闪存被划分为多个分区，每个分区有专属职责。动态分区与 A/B 更新是现代设备的标配，理解分区即理解系统升级与启动。

## 1. 分区总览

### 1.1 传统分区布局

| 分区 | 内容 | 说明 |
|------|------|------|
| boot | 内核 + ramdisk | 启动镜像 |
| system | 系统镜像（framework/app） | 只读 |
| vendor | 厂商 HAL/驱动 | 只读，Treble 后独立 |
| data | 用户数据 | 可读写，加密 |
| cache | 缓存 | 可清除 |
| recovery | 恢复模式 | 刷机/恢复 |
| misc | 启动标志 | 引导信息 |
| aboot | bootloader（部分设备） | 引导加载 |

```text
只读分区挂载为 ro：
- 防篡改
- 配合 dm-verity 校验完整性
- OTA 用新镜像替换
```

### 1.2 动态分区（Android 10+）

```text
动态分区（Dynamic Partitions）：
- system/vendor/product 等合并为 super 分区
- super 内部按逻辑分区划分
- 空间按需分配，避免分区大小浪费

super 分区结构：
super
 ├── system（逻辑分区）
 ├── vendor（逻辑分区）
 ├── product（逻辑分区）
 └── odm（逻辑分区）

好处：
- 分区大小灵活
- 支持 A/B + 动态分区组合
```

## 2. A/B 无缝更新

### 2.1 A/B 原理

```text
A/B 无缝更新（Seamless Updates）：
- 系统分区有 A/B 两份（slot_a / slot_b）
- 当前运行 A，后台写 B
- 写完后切换槽位，重启生效
- 失败自动回滚 A

好处：
- 无"正在更新"黑屏期
- 更新失败可回滚
- 减少变砖风险
```

### 2.2 相关分区

```text
A/B 相关：
- boot_a / boot_b
- system_a / system_b
- vendor_a / vendor_b
- 动态分区下 super 含双槽逻辑分区

当前槽位：
getprop ro.boot.slot_suffix → _a / _b
```

## 3. 文件系统选择

### 3.1 常见文件系统

| 分区 | 文件系统 | 说明 |
|------|----------|------|
| system/vendor | ext4/erofs | 只读，erofs 压缩省空间 |
| data | ext4 / f2fs | 可写 |
| cache | ext4 | 可清除 |
| 外部存储 | vfat/exFAT | 兼容性（SD 卡） |

```text
f2fs（Flash Friendly File System）：
- 专为闪存设计（减少写放大）
- 随机读写性能好
- data 分区常用
- 配合 FBE 加密

erofs（Enhanced Read-Only File System）：
- 只读压缩文件系统
- 节省 system 空间
- 读取性能好
```

### 3.2 ext4 vs f2fs

| 对比 | ext4 | f2fs |
|------|------|------|
| 设计目标 | 传统磁盘 | 闪存 |
| 写放大 | 较高 | 低 |
| 随机写 | 一般 | 好 |
| 碎片化 | 需整理 | 天然避免 |
| 适用 | 兼容优先 | 性能优先 |

## 4. 启动与校验

### 4.1 启动链路

```text
启动分区读取顺序：
Bootloader（aboot）
→ boot 分区（内核 + ramdisk）
→ init 解析 fstab
→ 挂载 system/vendor/data
→ 启动 SystemServer

加密影响：
- data 分区 FBE 加密
- 解锁前挂载 DE 部分
- CE 部分需凭据
```

### 4.2 dm-verity

```text
dm-verity（设备映射完整性校验）：
- 只读分区按块校验哈希
- 防止系统镜像被篡改
- 哈希树存于分区尾部/独立分区

校验失败：
- 无法启动（安全模式）
- 或允许"恢复出厂"提示

配合 Verified Boot 形成完整信任链
```

## 5. 分区工具与操作

```text
常用操作：
adb shell df（挂载信息）
adb shell mount（挂载点）
fastboot flash system（刷分区）
adb remount（开发机重挂载）

开发注意事项：
- 修改只读分区需 remount/重新打包
- 动态分区用 fastboot flash super
- 刷机前备份 data
```

## 6. 高频面试题

**Q1：Android 主要分区有哪些？**
A：boot（内核）、system（系统）、vendor（厂商）、data（数据）、cache（缓存）、recovery（恢复）等；Android 10+ 用动态分区（super）整合只读分区。

**Q2：动态分区是什么？**
A：system/vendor/product 等合并进 super 分区，内部按逻辑分区划分，空间按需分配，支持 A/B 双槽。

**Q3：A/B 无缝更新怎么工作？**
A：后台写入另一槽位（B），完成后切换槽位重启，失败自动回滚原槽位（A），实现无缝更新与防变砖。

**Q4：为什么 data 分区用 f2fs？**
A：f2fs 专为闪存设计，减少写放大、随机写性能好、天然避免碎片化，适合频繁读写的 data 分区。

**Q5：dm-verity 的作用？**
A：对只读系统分区按块做哈希完整性校验，防止镜像被篡改，与 Verified Boot 组成启动信任链。

## 7. 小结

- 分区体系：boot/system/vendor/data 各司其职。
- 动态分区整合只读分区，空间灵活。
- A/B 双槽实现无缝更新与回滚。
- f2fs 适合 data，erofs 压缩只读分区。
- dm-verity + Verified Boot 保证完整性。
