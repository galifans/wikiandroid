---
icon: device
title: HIDL 接口与实现
description: .hal 接口定义、HwBinder、服务注册与获取、版本管理、回调机制
---

# HIDL 接口与实现

> 面试高频指数：低
> HIDL 是 Treble 的接口语言：定义 HAL 服务与 Framework 的通信契约。掌握接口、服务注册、版本化，即掌握 HAL 开发的核心。

## 1. HIDL 是什么

```text
HIDL（HAL Interface Definition Language）：
Treble 引入的 HAL 接口描述语言

特点：
① 面向接口编程（定义与实现分离）
② 版本化（每个包有版本号）
③ 支持 C++ 与 Java 绑定
④ 基于 HwBinder（Binder 变体）
⑤ 支持同步/异步/回调

定位：正在被 AIDL HAL 取代（Android 13+）
```

## 2. 接口定义

### 2.1 .hal 文件

```text
接口文件示例（android.hardware.example@1.0）：

package android.hardware.example@1.0;

interface IExample {
    // 同步方法
    status doSomething(int32_t input) generates (int32_t result);

    // 回调（异步）
    oneway notify(int32_t event);
};

结构：
- package：包名 + 版本（@major.minor）
- interface：接口
- 方法：参数 → 返回（generates）
- oneway：单向（无返回值）
```

### 2.2 类型系统

```text
HIDL 类型：
- 基础：int8/16/32/64、uint、float、double
- 字符串：string
- 二进制：vec<uint8_t>（字节数组）
- 结构体：struct
- 枚举：enum
- 联合：union
- 句柄：native_handle（文件描述符）
- 内存：IMemory（共享内存）

安全：
- 参数校验严格
- 越界防护
- 类型安全绑定
```

## 3. HwBinder

### 3.1 通信机制

```text
HwBinder：
HIDL 服务的 IPC 机制（Binder 变体）

区别：
- 独立协议（不与应用 Binder 混用）
- /dev/hwbinder 设备节点
- 高优先级（避免阻塞系统服务）
- 支持实时调度传递

流程：
客户端 getService
→ HwBinder 查找服务
→ 事务传输（Transaction）
→ 服务端处理返回
```

### 3.2 与 Binder 对比

| 对比 | Binder | HwBinder |
|------|--------|----------|
| 用途 | 应用/系统服务 | HAL 服务 |
| 设备节点 | /dev/binder | /dev/hwbinder |
| 优先级 | 普通 | 高（实时可选） |
| 版本 | 无 | 有（接口版本） |
| 语言 | AIDL | HIDL |

## 4. 服务注册与获取

### 4.1 服务端注册

```text
HAL 服务启动（服务端）：
1. 实现接口（继承生成的 Stub）
2. 注册服务：
   defaultPassthroughServiceImplementation()  // 直通
   or
   registerAsService("default")                // 绑定式

示例（C++）：
sp<IExample> service = new ExampleImpl();
service->registerAsService("default");

服务名：default（默认）/ vendor.xxx
```

### 4.2 客户端获取

```text
客户端获取服务：
sp<IExample> svc = IExample::getService();  // 默认实例
sp<IExample> svc = IExample::getService("custom_name");

获取失败处理：
- 服务未启动
- 版本不匹配
- VINTF 未声明

框架侧访问：
- Framework 通过 HwServiceManager
- 或 hidl::manager
```

## 5. 版本管理

### 5.1 版本演进

```text
接口版本化：
- package@1.0 → 1.1 → 2.0 ...
- minor 版本：向后兼容（可新增）
- major 版本：不兼容（需迁移）

示例：
android.hardware.audio@4.0
android.hardware.audio@6.0（演进）

客户端策略：
- 尝试新版本
- 失败降级旧版本
- 通过 VINTF 声明支持范围
```

### 5.2 回调与异步

```text
回调机制：
- 接口可声明回调接口（callback interface）
- 服务端持客户端回调代理
- 用于异步结果/事件上报

示例：
interface IExampleCallback {
    void onEvent(int32_t code);
};

使用：
- 注册回调（setCallback）
- 事件发生时调用回调
- 跨进程传输（HwBinder）
```

## 6. 测试与验证

```text
HAL 验证：
- VTS（Vendor Test Suite）
  验证 HAL 接口兼容性
- 每个版本接口有对应测试
- 厂商必须通过 VTS 才能认证

本地测试：
- hidl_test / 自写测试客户端
- getService 后调用接口
- 检查返回状态

日志：
- logcat（hidl 标签）
- 事务失败 → status 错误码
```

## 7. 高频面试题

**Q1：HIDL 是什么？**
A：Treble 的 HAL 接口描述语言，定义 Framework 与 HAL 服务的通信契约，支持版本化与 C++/Java 绑定。

**Q2：HwBinder 和 Binder 区别？**
A：HwBinder 用于 HAL 服务（/dev/hwbinder），支持接口版本与高优先级；Binder 用于应用与系统服务。

**Q3：HAL 服务怎么注册和获取？**
A：服务端实现接口后 registerAsService("default")；客户端 getService() 获取，失败通常因服务未启动或版本不匹配。

**Q4：HIDL 版本怎么管理？**
A：package@major.minor；minor 向后兼容，major 不兼容；客户端优先新版本、失败降级，VINTF 声明支持范围。

**Q5：VTS 是什么？**
A：Vendor Test Suite，验证 HAL 接口实现是否符合 HIDL 接口定义与 Android 兼容性要求，厂商认证必需。

## 8. 小结

- HIDL 定义 HAL 接口契约，基于 HwBinder。
- 接口、类型、版本、回调构成完整体系。
- 服务注册（registerAsService）+ 获取（getService）。
- 版本管理：minor 兼容、major 迁移。
- VTS 验证 HAL 兼容性；AIDL HAL 逐步替代。
