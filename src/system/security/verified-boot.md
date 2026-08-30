---
icon: lock
title: Verified Boot 与启动安全
description: AVB 验证启动、dm-verity、启动信任链、防篡改、回滚保护
---

# Verified Boot 与启动安全

> 面试高频指数：低
> Verified Boot（验证启动）保证设备从开机到系统只运行可信代码，配合 dm-verity 防止系统分区被篡改。这是 Android 安全链的第一环。

## 1. 什么是 Verified Boot

```text
Verified Boot（验证启动）：
设备启动时逐级校验镜像完整性的机制

目标：
- 防止启动被篡改（恶意 bootloader/内核）
- 防止系统分区被修改
- 保证运行的是可信代码

Android 实现：AVB（Android Verified Boot）
- 基于 dm-verity
- 签名校验 + 哈希校验
```

## 2. 启动信任链

### 2.1 信任链结构

```text
信任链（Chain of Trust）：

BootROM（不可变，芯片内置）
  ↓ 校验签名
Bootloader（aboot）
  ↓ 校验签名 + 哈希
boot 分区（内核 + ramdisk）
  ↓ 校验
system / vendor / product（dm-verity）
  ↓
完整系统运行

每级校验下一级的签名，
根信任在芯片内置的 BootROM（RoT）
```

### 2.2 校验失败处理

```text
校验失败行为：
- 启动中止（无法开机）
- 或进入"橙色状态"警告（解锁设备）
- 部分设备允许"继续启动"（需用户确认）

设备状态：
- LOCKED（锁定）：强制校验
- UNLOCKED（解锁）：跳过校验（刷机用）

解锁后果：
- 失去 Verified Boot 保护
- 系统提示"设备已解锁"
- 部分安全功能降级
```

## 3. AVB 机制

### 3.1 AVB 结构

```text
AVB（Android Verified Boot）：
- 每个镜像带 vbmeta 描述符
- vbmeta 含：
  镜像哈希/签名
  公钥（验签）
  回滚索引（rollback index）
  哈希算法

vbmeta 链：
BootROM → boot vbmeta
        → system vbmeta
        → vendor vbmeta（独立分区可链式）
```

### 3.2 AVB 工具

```text
开发工具：
- avbtool：生成/签名 vbmeta
- 镜像打包时附加 vbmeta

生产流程：
编译镜像 → 计算哈希 → 签名 vbmeta
→ 写入分区
→ 设备启动校验

密钥：
- AVB 公钥烧入设备
- 私钥在厂商侧（安全保管）
```

## 4. dm-verity

### 4.1 原理

```text
dm-verity（Device Mapper Verity）：
内核块级完整性校验

原理：
- 只读分区按 4KB 块建立哈希树
- 每块读取时校验哈希
- 根哈希存于 vbmeta
- 篡改块 → 哈希不匹配 → IO 失败

覆盖：
- system / vendor / product
- 其他只读分区（按配置）

代价：
- 每块读多一次哈希计算
- 性能损耗小（可接受）
```

### 4.2 与 FBE 关系

```text
保护范围分工：
- dm-verity：保护只读系统分区（防篡改）
- FBE：保护 data 用户数据（防窃取）
- 两者互补，覆盖全部存储

data 分区：
- 不可用 dm-verity（需写入）
- 用 FBE 加密保护
- 校验由加密完整性保证
```

## 5. 回滚保护

### 5.1 Rollback Index

```text
回滚保护：
- 每个镜像有回滚索引（版本号）
- 设备记录最低允许版本
- 降级刷旧版本 → 索引低于记录 → 拒绝

作用：
- 防止降级到有漏洞的旧版本
- 防止"刷回旧版绕过补丁"

实现：
- 回滚索引存于防回滚存储（RPMB）
- 系统更新时同步提升
```

## 6. 常见问题

```text
Verified Boot 相关现象：
① "设备已解锁"警告：
   - 解锁了 bootloader
   - 或刷了自定义镜像
② 开机卡 logo：
   - 镜像校验失败
   - 签名不匹配
③ 刷机失败：
   - 回滚索引阻止降级
   - 需要官方工具/低版本固件
④ 系统更新失败：
   - vbmeta 签名问题
   - 分区损坏

排查：
- fastboot getvar unlocked
- fastboot getvar current-slot
- 查看启动日志（bootloader）
```

## 7. 高频面试题

**Q1：Verified Boot 是什么？**
A：启动时逐级校验镜像完整性的机制（AVB），从 BootROM 到 system 分区逐级验签，防止启动被篡改。

**Q2：dm-verity 原理？**
A：只读分区按 4KB 块建哈希树，读块时校验哈希，根哈希存 vbmeta；篡改导致校验失败、IO 拒绝。

**Q3：设备解锁（unlock）有什么影响？**
A：失去 Verified Boot 强制校验，可刷自定义镜像；系统警告"已解锁"，部分安全功能降级，回滚保护仍可能生效。

**Q4：回滚保护怎么实现？**
A：镜像携带回滚索引，设备记录最低版本；降级时索引低于记录即拒绝，防降级攻击绕过补丁。

**Q5：dm-verity 和 FBE 的区别？**
A：dm-verity 保护只读系统分区（防篡改）；FBE 加密 data 用户数据（防窃取）。两者覆盖系统与数据两端。

## 8. 小结

- Verified Boot 建立启动信任链（BootROM → 系统）。
- AVB 用 vbmeta 签名与哈希校验镜像。
- dm-verity 块级校验只读分区。
- 回滚索引防降级攻击。
- 解锁设备 = 放弃强制校验，安全降级。
