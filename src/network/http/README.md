---
icon: http
title: 网络与协议
shortTitle: 概览
dir:
  text: 网络与协议
  order: 1
---

# 🌐 HTTP 网络层

Android 网络请求栈的完整解析。

## 文章列表

- [Retrofit + OkHttp 架构解析](retrofit-okhttp.md)
- [HTTP/HTTPS 协议详解](http-protocol.md)
- [OkHttp 拦截器机制](okhttp-interceptor.md)
- [OkHttp 源码解析](okhttp-source.md)
- [Retrofit 源码解析](retrofit-source.md)

## 核心要点

### OkHttp
1. **拦截器链**：责任链模式（重试、桥接、缓存、连接、网络）
2. **连接池**：HTTP/1.1 keep-alive 复用
3. **HTTP/2 多路复用**
4. **缓存策略**：基于 Cache-Control 与 ETag
5. **源码架构**：Dispatcher 调度、RealCall 执行、连接池复用

### Retrofit
1. **动态代理**：接口方法 → HTTP 请求
2. **注解解析**：`@GET`、`@POST`、`@Path`、`@Query`
3. **转换器**：Gson / Moshi / kotlinx.serialization
4. **协程支持**：`suspend` 函数直接返回结果
5. **源码架构**：ServiceMethod 缓存、CallAdapter / Converter 工厂

### 网络协议
- TCP 三次握手 / 四次挥手
- HTTPS 与 TLS 握手
- HTTP/1.1 vs HTTP/2 vs HTTP/3
