---
icon: globe
title: 网络与异步
index: false
---

# 🌐 网络与异步

网络通信、消息机制与并发编程。

## 模块

| 模块 | 说明 | 入口 |
|------|------|------|
| HTTP | OkHttp / Retrofit / 网络协议 | [HTTP](/network/http/) |
| Handler | Handler 消息机制与源码 | [Handler](/network/handler/) |
| 协程 | 协程 Flow / RxJava | [协程](/network/coroutine/) |
| 线程 | 线程池与并发编程 | [线程](/network/thread/) |

## 基础协议

- [计算机网络体系](osi-tcpip.md) — OSI 七层 / TCP/IP 四层模型、物理层、链路层、网络层
- [TCP 与 UDP 详解](tcp-udp.md) — 三次握手、四次挥手、面向字节流与面向报文、可靠性保障
- [Socket 编程基础](socket.md) — 基于 TCP / UDP 的 Socket 编程流程

## 知识关系

```
网络请求：Retrofit → OkHttp → Okio → Socket
异步框架：协程（现代） / RxJava（历史） / Handler（系统消息）
并发基础：Thread / HandlerThread / 线程池 / 锁
```

## 📑 全部文章导航

### 🌐 基础协议
- [计算机网络体系（OSI / TCP-IP）](/network/osi-tcpip.md)：七层模型、各层协议
- [TCP 与 UDP 详解](/network/tcp-udp.md)：三次握手 / 四次挥手 / 可靠性
- [Socket 编程基础](/network/socket.md)：TCP / UDP Socket 流程

### 📡 HTTP
- [HTTP 协议详解](/network/http/http-protocol.md)：报文 / 缓存 / HTTPS
- [Retrofit + OkHttp 详解](/network/http/retrofit-okhttp.md)：请求流程 / 拦截器链
- [OkHttp 拦截器深入](/network/http/okhttp-interceptor.md)：自定义拦截器实战

### 🔄 Handler 消息机制
- [Handler 消息机制源码解析](/network/handler/handler-source.md)：Looper / MessageQueue / 阻塞
- [HandlerThread 详解](/network/handler/handlerthread.md)：串行任务场景

### 🌀 协程与 RxJava
- [协程 Flow 进阶](/network/coroutine/flow-advanced.md)：冷热流 / 背压 / 操作符
- [RxJava 操作符详解](/network/coroutine/rxjava-operators.md)：变换 / 过滤 / 组合

### 🧵 线程与并发
- [线程池详解](/network/thread/thread-pool.md)：七大参数 / 四种拒绝策略
- [Java 并发工具类](/network/thread/concurrency-tools.md)：CountDownLatch / Semaphore / Atomic
- [锁机制详解](/network/thread/locks.md)：synchronized / ReentrantLock / CAS
- [AsyncTask 与 IntentService 原理](/network/thread/asynctask-intentservice.md)
