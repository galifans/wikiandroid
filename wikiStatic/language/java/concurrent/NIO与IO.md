---
icon: network-wired
title: NIO 与 IO
---

# NIO 与 IO

> Java NIO 的核心组成：通道、缓冲区、选择器，以及与标准 IO 的差异。

## NIO 概述

Java NIO（New IO，Java 1.4 起）是替代标准 Java IO API 的新 IO 方式。与标准 IO 的核心差异：

| 对比项 | 标准 IO | NIO |
|--------|---------|-----|
| 操作对象 | 字节流 / 字符流 | 通道（Channel）+ 缓冲区（Buffer） |
| 阻塞性 | 阻塞式 IO | 支持非阻塞 IO |
| 多路复用 | 无 | 选择器（Selector）监听多个通道 |

## 三大核心组件

1. **Channels（通道）**：数据总是从通道读到缓冲区，或从缓冲区写入通道
2. **Buffers（缓冲区）**：数据承载容器
3. **Selectors（选择器）**：监听多个通道的事件（连接打开、数据到达），单线程可监听多个数据通道

## Channel 与 Buffer

**Channel 类似流，但不同**：

- 既可从通道读数据，也可写数据到通道（流的读写通常是单向的）
- 通道可以异步读写
- 通道的数据总要先读到一个 Buffer，或从一个 Buffer 写入

**Channel 实现**：

- `FileChannel`（文件 IO）
- `DatagramChannel`（UDP 网络 IO）
- `SocketChannel`（TCP 网络 IO）
- `ServerSocketChannel`（TCP 服务端）

**Buffer 实现**：`ByteBuffer`、`CharBuffer`、`DoubleBuffer`、`FloatBuffer`、`IntBuffer`、`LongBuffer`、`ShortBuffer`，覆盖所有基本数据类型；还有 `MappedByteBuffer` 表示内存映射文件。

## Selector（选择器）

Selector 允许**单线程处理多个 Channel**。适用场景：应用打开多个连接，但每个连接流量都很低（如聊天服务器）。

使用流程：

1. 向 Selector 注册 Channel
2. 调用 `select()` 方法——阻塞直到某个注册的通道有事件就绪
3. 返回后处理这些事件（新连接进来、数据接收等）

## 非阻塞 IO

NIO 可以非阻塞地使用 IO：线程从通道读取数据到缓冲区时，还可以做其他事情；数据写入缓冲区后，线程继续处理它。

## IO 中的设计模式

JDK 的 I/O 包中主要使用了两种设计模式：

- **Adapter 模式（适配器）**：如 `InputStreamReader` 把字节流适配为字符流
- **Decorator 模式（装饰器）**：如 `BufferedInputStream` 为流添加缓冲功能

## Android 相关

目前 **Okio** 已被集成进 Android 包，Okio 底层实现基于对 IO 的高效封装（Source/Sink 抽象 + Buffer），面试中也常被问到与 NIO 的关系。
