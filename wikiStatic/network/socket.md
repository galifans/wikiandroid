---
icon: plug
title: Socket 编程基础
---

# Socket 编程基础

> Socket（套接字）是网络编程的抽象接口，对 TCP/IP 协议进行了封装。本章介绍 Java 中基于 TCP 和 UDP 的 Socket 编程基本流程。

## 一、Socket 概述

Socket 是应用层与传输层之间的抽象层，把 TCP/IP 协议族的复杂操作封装为几个简单的接口。常用的有两类：

| 类型 | 协议 | 特点 |
| --- | --- | --- |
| 流式套接字（Stream Socket） | TCP | 面向连接，可靠，有序 |
| 数据报套接字（Datagram Socket） | UDP | 无连接，不可靠，效率高 |

## 二、基于 TCP 的 Socket 编程

### 客户端流程

TCP 客户端的连接建立与流获取流程如下：

::: code-tabs

@tab:active Java

```java
Socket socket = new Socket("ip", 端口);

// 获取输入流（读取服务器数据）
InputStream is = socket.getInputStream();
DataInputStream dis = new DataInputStream(is);

// 获取输出流（发送数据到服务器）
OutputStream os = socket.getOutputStream();
DataOutputStream dos = new DataOutputStream(os);
```

@tab Kotlin

```kotlin
val socket = Socket("ip", 端口)

// 获取输入流（读取服务器数据）
val is = socket.getInputStream()
val dis = DataInputStream(is)

// 获取输出流（发送数据到服务器）
val os = socket.getOutputStream()
val dos = DataOutputStream(os)
```

:::

### 服务器端流程

TCP 服务端的监听与接受连接流程如下：

::: code-tabs

@tab:active Java

```java
ServerSocket serverSocket = new ServerSocket(端口);
Socket socket = serverSocket.accept(); // 阻塞等待客户端连接
// 获取流的方式与客户端一样
```

@tab Kotlin

```kotlin
val serverSocket = ServerSocket(端口)
val socket = serverSocket.accept() // 阻塞等待客户端连接
// 获取流的方式与客户端一样
```

:::

### 读取输入流

循环读取输入流数据的实现如下：

::: code-tabs

@tab:active Java

```java
byte[] buffer = new byte[1024];
while (true) {
    int count = is.read(buffer);
    if (count <= 0) {
        break;
    }
    // 对 buffer 保存或者做些其他操作
}
```

@tab Kotlin

```kotlin
val buffer = ByteArray(1024)
while (true) {
    val count = is.read(buffer)
    if (count <= 0) {
        break
    }
    // 对 buffer 保存或者做些其他操作
}
```

:::

## 三、基于 UDP 的 Socket 编程

UDP 客户端和服务器端的代码结构相同：

::: code-tabs

@tab:active Java

```java
DatagramSocket socket = new DatagramSocket(端口);
InetAddress serverAddress = InetAddress.getByName("ip");

// 发送
DatagramPacket packet = new DatagramPacket(buffer, length, host, port);
socket.send(packet);

// 接收
byte[] buf = new byte[1024];
DatagramPacket packet = new DatagramPacket(buf, 1024);
socket.receive(packet);
```

@tab Kotlin

```kotlin
val socket = DatagramSocket(端口)
val serverAddress = InetAddress.getByName("ip")

// 发送
val packet = DatagramPacket(buffer, length, host, port)
socket.send(packet)

// 接收
val buf = ByteArray(1024)
val packet = DatagramPacket(buf, 1024)
socket.receive(packet)
```

:::

## 四、TCP 与 UDP 编程对比

TCP 与 UDP 两种编程方式的对比说明如下：

| 对比项 | TCP | UDP |
| --- | --- | --- |
| 核心类 | Socket / ServerSocket | DatagramSocket / DatagramPacket |
| 是否区分客户端服务器 | 区分，服务器需 accept | 不区分，代码结构一致 |
| 数据边界 | 字节流，需自行处理粘包 | 报文边界天然保留 |
| 可靠性 | 可靠，有确认重传 | 不可靠，可能丢包 |
| 适用场景 | 文件传输、聊天、HTTP | 视频通话、实时游戏、DNS |
