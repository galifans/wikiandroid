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

## 知识关系

```
网络请求：Retrofit → OkHttp → Okio → Socket
异步框架：协程（现代） / RxJava（历史） / Handler（系统消息）
并发基础：Thread / HandlerThread / 线程池 / 锁
```
