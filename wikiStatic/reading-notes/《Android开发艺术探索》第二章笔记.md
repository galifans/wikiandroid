---
icon: server
title: 《Android开发艺术探索》第二章笔记
---

# 《Android开发艺术探索》第二章：IPC 机制

> 进程间通信（IPC）是 Android 多进程架构的基石，本章覆盖多进程机制、序列化、Binder 与常用 IPC 方式。

## 一、多进程基础

### 进程与线程

- 线程是 CPU 调度的最小单元，是有限的系统资源
- 进程是执行单元（应用），一个进程可包含多个线程

### 开启多进程

通过给四大组件指定 `android:process` 属性开启：

- 进程名以 `:` 开头：**应用私有进程**，其他应用组件无法同进程
- 进程名不以 `:` 开头：**全局进程**，其他应用可通过相同 ShareUID + 相同签名共享进程

### 多进程带来的问题

| 问题 | 原因 |
|------|------|
| 静态成员 / 单例失效 | 每个进程独立虚拟机，同一类对象产生多份副本 |
| 线程同步失效 | 不同进程锁的不是同一对象 |
| SharedPreferences 不可靠 | 底层为 XML 读写，并发写会丢数据 |
| Application 多次创建 | 不同进程对应不同虚拟机与 Application |

## 二、序列化：Serializable 与 Parcelable

### Serializable（Java 原生）

- 空接口，声明 `serialVersionUID` 即可开启默认序列化
- 反序列化时校验 UID：不一致则抛出异常
- 静态成员变量与 `transient` 标记的成员**不参与序列化**
- 开销大（大量 I/O），适合存储与网络传输

### Parcelable（Android 推荐）

| 方法 | 作用 |
|------|------|
| `createFromParcel(Parcel)` | 从序列化对象还原原始对象 |
| `newArray(int size)` | 创建指定长度的对象数组 |
| `writeToParcel(Parcel, int flags)` | 写入序列化结构；`PARCELABLE_WRITE_RETURN_VALUE` 表示作为返回值 |
| `describeContents()` | 含文件描述符返回 `CONTENTS_FILE_DESCRIPTOR` |

- `Intent`、`Bundle`、`Bitmap` 等系统类已实现 Parcelable
- 效率高、适合内存间传递；存储/网络传输建议用 Serializable

## 三、Binder

### 本质与角色

- 继承自 `IBinder` 的跨进程通信方式
- 连接 ServiceManager 与各类 Manager/ManagerService 的桥梁
- 客户端通过 `bindService` 拿到 Binder 对象调用服务端方法

### AIDL 自动生成类的关键成员

- **Stub**：Binder 类。同进程时直接调用，跨进程时走 `transact`
- **Proxy**：Stub 内部代理类，客户端侧执行远程调用：
  1. 写入参数到 `_data`
  2. 调用 `transact` 发起 RPC（当前线程挂起）
  3. 从 `_reply` 取回结果
- `onTransact`：运行在服务端 Binder 线程池，通过 `code` 分发方法、权限校验（返回 false 表示拒绝）

> **注意**：远程调用会挂起调用线程，**耗时方法不可在 UI 线程发起**；服务端 Binder 方法应同步实现。

### 死亡代理

Binder 意外死亡时，通过 `linkToDeath` / `unlinkToDeath` 注册 `DeathRecipient` 监听，在 `binderDied()` 中重连。

## 四、常用 IPC 方式

| 方式 | 特点 |
|------|------|
| Bundle | 基于 Parcelable，适用于 Intent 传递 |
| 文件共享 | 简单，适合对同步要求不高的场景；**SharedPreferences 多进程不可靠** |
| Messenger | 轻量级 AIDL 封装，服务端**串行**处理请求 |
| AIDL | 支持基本类型、String、Parcelable、AIDL 接口；非基本类型参数需标 `in`/`out`/`inout` |
| ContentProvider | 表格形式组织数据，可观察数据变化 |
| Socket | 基于 TCP/UDP，适合网络间通信 |

### Binder 连接池

项目规模大时避免创建过多 Service：将多个业务模块的 AIDL 统一交由**一个 Service** 管理，通过 `queryBinder` 按标识返回对应 Binder 对象，避免重复创建 Service。
