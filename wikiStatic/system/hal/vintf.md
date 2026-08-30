---
icon: device
title: VINTF 兼容性验证
description: VINTF manifest、compatibility matrix、设备启动校验、HAL 兼容性检查
---

# VINTF 兼容性验证

> 面试高频指数：低
> VINTF 是 Treble 的"兼容性合同"：设备声明提供哪些 HAL，系统声明需要哪些 HAL，启动时校验是否匹配。它保证系统升级与厂商组件可互换。

## 1. VINTF 是什么

```text
VINTF（Vendor Interface）：
Treble 的接口兼容性验证机制

组成：
- 设备 manifest（声明提供的能力）
- Framework compatibility matrix（声明需求）
- 启动时校验匹配

作用：
- 保证 system 与 vendor 可组合
- 系统升级兼容检查
- HAL 版本协商
```

## 2. Manifest

### 2.1 设备 Manifest

```text
设备 Manifest（/vendor/etc/vintf/manifest.xml）：
声明设备提供的 HAL 服务与版本

示例：
<manifest version="1.0" type="device">
    <hal format="hidl">
        <name>android.hardware.audio</name>
        <version>6.0</version>
        <interface>
            <name>IDevice</name>
            <instance>default</instance>
        </interface>
    </hal>
    <hal format="aidl">
        <name>android.hardware.camera.provider</name>
        <version>1</version>
        ...
    </hal>
</manifest>

关键信息：
- HAL 名称
- 版本
- 接口实例
- 格式（hidl/aidl）
```

### 2.2 Framework Manifest

```text
Framework Manifest（/system/etc/vintf/manifest.xml）：
声明系统侧提供的服务（如 MediaCodec）

- type="framework"
- 内容结构与设备 manifest 类似
- 用于交叉校验
```

## 3. Compatibility Matrix

### 3.1 Framework Matrix

```text
Framework Compatibility Matrix
（/system/etc/vintf/compatibility_matrix.xml）：
声明系统需要的 HAL

示例：
<compatibility-matrix version="1.0" type="framework">
    <hal format="hidl">
        <name>android.hardware.audio</name>
        <version>4.0-6.0</version>  <!-- 支持范围 -->
        <interface>
            <name>IDevice</name>
            <instance>default</instance>
        </interface>
    </hal>
</compatibility-matrix>

版本范围：
- 最低版本与最高版本
- 设备提供版本必须在范围内
```

### 3.2 设备 Matrix

```text
设备侧也有 matrix：
- 声明设备需要的 Framework 能力
- 双向校验

校验方向：
Framework matrix（需）↔ Device manifest（供）
Device matrix（需）     ↔ Framework manifest（供）
```

## 4. 启动校验

### 4.1 校验流程

```text
启动时 VINTF 校验：
① init 读取 manifest 与 matrix
② 校验双方声明是否匹配
③ 缺失 → 启动警告/失败（依赖配置）
④ 版本不符 → 降级或失败

失败处理：
- 关键 HAL 缺失 → 服务无法启动
- 非关键 → 功能降级
- 提供 libvintf 库可编程查询
```

### 4.2 校验工具

```text
工具与命令：
adb shell vintf --check  // 校验设备
adb shell vintf list    // 列出接口
dumpsys vintf           // 查看 VINTF 信息

VTS 中：
- vintf 校验是必测项
- 检查 manifest 格式与一致性
```

## 5. 版本协商

### 5.1 多版本支持

```text
版本协商：
- Framework 声明支持范围（如 audio 4.0-6.0）
- 设备实现某版本（如 6.0）
- 启动时按最高可用版本使用

降级场景：
- 设备实现 4.0，Framework 期望 6.0
- 不匹配 → 无法启动或功能缺失
- 因此厂商需跟进版本

AIDL HAL 版本：
- 简单整数版本
- AIDL 的稳定接口版本管理
```

## 6. 与系统升级的关系

```text
VINTF 对升级的意义：
- system 更新后启动校验
- HAL 接口兼容 → 升级成功
- 不兼容 → 升级被拒/回滚

对定制 ROM：
- 必须提供匹配的 manifest
- 否则启动失败
- 修改 HAL 需同步更新声明

Mainline（APEX）：
- 模块更新也经 VINTF 检查
- 保证模块间兼容
```

## 7. 高频面试题

**Q1：VINTF 是什么？**
A：Treble 的接口兼容性验证机制：设备 manifest 声明提供的 HAL，Framework matrix 声明需要的 HAL，启动时校验匹配。

**Q2：manifest 和 compatibility matrix 区别？**
A：manifest 声明"我提供什么"；matrix 声明"我需要什么"。两者双向校验，确保 system 与 vendor 可组合。

**Q3：HAL 版本不匹配会怎样？**
A：启动校验失败：关键 HAL 缺失导致服务无法启动，非关键则功能降级；系统更新时可能被拒绝或回滚。

**Q4：怎么查看设备 VINTF 信息？**
A：adb shell vintf --check 校验、vintf list 列出接口、dumpsys vintf 查看详情。

**Q5：为什么定制 ROM 要改 manifest？**
A：manifest 声明设备提供的 HAL 与版本；改了 HAL 不更新声明会导致 VINTF 校验失败，无法正常启动。

## 8. 小结

- VINTF 是 system/vendor 的兼容性合同。
- manifest 声明提供，matrix 声明需求。
- 启动时双向校验，版本范围协商。
- 校验失败 → 启动失败或功能降级。
- vintf 命令与 VTS 是主要验证手段。
