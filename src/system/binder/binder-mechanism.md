---
icon: binder
title: Binder 机制详解
---

# Binder 跨进程通信机制详解

> Binder 是 Android 中最重要的 IPC 机制，四大组件、系统服务都依赖它。本文从设计到原理完整解析。

## 一、为什么是 Binder？

Binder 与其他 IPC 方式的对比说明如下：

| 对比项 | Binder | Socket | 共享内存 |
|--------|--------|--------|----------|
| 性能 | 高（一次拷贝） | 低（两次拷贝） | 最高 |
| 安全性 | 高（内核校验 UID） | 中 | 低 |
| 易用性 | 面向对象接口 | 字节流 | 复杂 |

**结论**：性能与安全兼顾，Android 选择 Binder 作为主要 IPC 方式。

## 二、Binder 架构

```
Client ──代理(Proxy)──┐
                      ├── Binder 驱动（内核态）── Server（Stub）
ServiceManager ◄─────┘        │
        │                mmap 内存映射（一次拷贝）
        └── 服务注册与查询
```

**四大角色**：

| 角色 | 职责 |
|------|------|
| Client | 发起调用，持有 BinderProxy |
| Server | 提供服务，实现 Stub（本地对象） |
| ServiceManager | 服务注册中心（守护进程） |
| Binder 驱动 | 内核模块，负责数据传递与线程管理 |

## 三、通信流程（以 AIDL 为例）

以 AIDL 为例的通信调用代码如下：

::: code-tabs

@tab:active Java

```java
// 1. 获取服务代理
IBinder binder = ServiceManager.getService("my_service");
IMyService proxy = IMyService.Stub.asInterface(binder);

// 2. 调用方法（跨进程）
proxy.doSomething(data);  // 同步阻塞调用
```

@tab Kotlin

```kotlin
// 1. 获取服务代理
val binder = ServiceManager.getService("my_service")
val proxy = IMyService.Stub.asInterface(binder)

// 2. 调用方法（跨进程）
proxy.doSomething(data)  // 同步阻塞调用
```

:::

**调用链**：
```
Client 调用 → BinderProxy.transact() → Binder 驱动
→ Server 的 Binder.onTransact() → Stub 分发 → 业务方法
→ 结果经驱动返回 Client
```

## 四、内存映射（一次拷贝）

- Binder 通信通过 **mmap** 将内核缓冲区与 Server 用户空间映射到同一物理内存
- Client 数据 → 内核缓冲区（**一次拷贝**）→ Server 直接读取
- 相比传统两次拷贝（内核↔用户），性能显著提升

## 五、Binder 线程管理

- 每个进程有 **Binder 线程池**（默认最大 16 个线程）
- Server 收到请求后由线程池分配线程处理
- 主线程处理 Binder 调用可能引发死锁（谨慎在主线程做 Binder 耗时调用）

## 六、面试高频追问

1. Binder 相比其他 IPC 的优势？
2. Binder 一次拷贝如何实现？（mmap）
3. ServiceManager 的作用？
4. AIDL 的 `in` / `out` / `inout` 修饰符区别？
5. Binder 通信是同步还是异步？如何实现异步？（`oneway`）
6. Binder 驱动在哪一层？（Linux 内核）
7. 系统服务的注册与查询流程？

> 进阶阅读：[AIDL 深入解析](aidl-deep.md) | [Service 与 AIDL](/android/service/service-basics.md)
