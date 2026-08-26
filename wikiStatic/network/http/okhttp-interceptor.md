---
icon: http
title: OkHttp 拦截器机制详解
description: 责任链模式、五大内置拦截器、自定义拦截器实战、缓存与重试机制
---

# OkHttp 拦截器机制详解

> 面试高频指数：极高
> 拦截器链是 OkHttp 的灵魂，责任链模式是 Android 面试的经典设计模式题。

## 1. 责任链模式

### 1.1 概念

责任链（Chain of Responsibility）：请求沿着**拦截器链**依次传递，每个拦截器
决定"处理"或"传给下一个"。

```text
用户请求
  │
  ▼
Interceptor1 ──→ Interceptor2 ──→ Interceptor3 ──→ 网络
      ▲               ▲                ▲
      └──── 响应反向传递 ───────────────┘
```

### 1.2 OkHttp 的实现

::: code-tabs

@tab:active Java

```java
// 核心接口
public interface Interceptor {
    Response intercept(Chain chain);
}

public interface Chain {
    Request request();
    Response proceed(Request request);   // 传给下一个拦截器
}
```

@tab Kotlin

```kotlin
// 核心接口
interface Interceptor {
    fun intercept(chain: Chain): Response
}

interface Chain {
    fun request(): Request
    fun proceed(request: Request): Response   // 传给下一个拦截器
}
```

:::

::: code-tabs

@tab:active Java

```java
// 责任链实现（简化）
class RealInterceptorChain implements Chain {
    private final List<Interceptor> interceptors;
    private final int index;
    private final Request request;

    public RealInterceptorChain(List<Interceptor> interceptors, int index, Request request) {
        this.interceptors = interceptors;
        this.index = index;
        this.request = request;
    }

    @Override
    public Response proceed(Request request) {
        // 递归调用下一个拦截器
        RealInterceptorChain next = new RealInterceptorChain(interceptors, index + 1, request);
        Interceptor interceptor = interceptors.get(index);
        return interceptor.intercept(next);
    }
}
```

@tab Kotlin

```kotlin
// 责任链实现（简化）
class RealInterceptorChain(
    private val interceptors: List<Interceptor>,
    private val index: Int,
    private val request: Request
) : Chain {

    override fun proceed(request: Request): Response {
        // 递归调用下一个拦截器
        val next = RealInterceptorChain(interceptors, index + 1, request)
        val interceptor = interceptors[index]
        return interceptor.intercept(next)
    }
}
```

:::

> 每个拦截器 `intercept` 中调用 `chain.proceed()` 就进入下一个；不调用则
> 中断链（可用于短路，如命中缓存直接返回）。

## 2. 内置拦截器链

::: code-tabs

@tab:active Java

```java
// OkHttpClient 构建的默认链（顺序固定）
// 1. 用户自定义 Application Interceptors
// 2. RetryAndFollowUpInterceptor   重试 + 重定向
// 3. BridgeInterceptor             桥接（补全请求头）
// 4. CacheInterceptor              缓存
// 5. ConnectInterceptor            连接
// 6. 用户自定义 Network Interceptors
// 7. CallServerInterceptor         网络读写
```

@tab Kotlin

```kotlin
// OkHttpClient 构建的默认链（顺序固定）
// 1. 用户自定义 Application Interceptors
// 2. RetryAndFollowUpInterceptor   重试 + 重定向
// 3. BridgeInterceptor             桥接（补全请求头）
// 4. CacheInterceptor              缓存
// 5. ConnectInterceptor            连接
// 6. 用户自定义 Network Interceptors
// 7. CallServerInterceptor         网络读写
```

:::

### 2.1 RetryAndFollowUpInterceptor

```text
职责：
  - 连接失败重试（IOException，最多 20 次，可配置 retryOnConnectionFailure）
  - 处理重定向（301/302/303/307/308，最多 20 次）
  - 处理鉴权失败（401，通过 Authenticator）
```

### 2.2 BridgeInterceptor

```text
职责：把用户请求"补全"成标准 HTTP 请求
  - 自动添加：Host、Connection、Accept-Encoding: gzip、User-Agent
  - Content-Length / Transfer-Encoding
  - 响应 gzip 解压（自动）
```

### 2.3 CacheInterceptor

::: code-tabs

@tab:active Java

```java
// 开启缓存
Cache cache = new Cache(cacheDir, 10 * 1024 * 1024);  // 10MB
OkHttpClient client = new OkHttpClient.Builder().cache(cache).build();
```

@tab Kotlin

```kotlin
// 开启缓存
val cache = Cache(cacheDir, maxSize = 10 * 1024 * 1024)  // 10MB
val client = OkHttpClient.Builder().cache(cache).build()
```

:::

```text
缓存策略：
  1. 请求带 Cache-Control: max-age → 缓存命中直接返回（不进网络）
  2. 响应带 ETag → 协商缓存：If-None-Match，304 用缓存
  3. 响应带 Last-Modified → If-Modified-Since
  4. 未过期：直接返回缓存（磁盘缓存）
```

::: code-tabs

@tab:active Java

```java
// 强制刷新（跳过缓存）
Request request = new Request.Builder()
    .url(url)
    .header("Cache-Control", "no-cache")   // 每次都走网络
    .build();

// 离线可用
Request request = new Request.Builder()
    .url(url)
    .header("Cache-Control", "only-if-cached")
    .build();
```

@tab Kotlin

```kotlin
// 强制刷新（跳过缓存）
val request = Request.Builder()
    .url(url)
    .header("Cache-Control", "no-cache")   // 每次都走网络
    .build()

// 离线可用
val request = Request.Builder()
    .url(url)
    .header("Cache-Control", "only-if-cached")
    .build()
```

:::

### 2.4 ConnectInterceptor

```text
职责：从连接池获取/创建连接（RealConnection）
  - 连接池命中：复用（keep-alive）
  - 未命中：TCP 连接 + TLS 握手
  - HTTP/2：多路复用
```

### 2.5 CallServerInterceptor

```text
职责：最后一个拦截器
  - 写请求头/请求体到 Socket
  - 读响应头/响应体
  - 处理 100-continue
```

## 3. 自定义拦截器实战

### 3.1 统一鉴权

::: code-tabs

@tab:active Java

```java
class AuthInterceptor implements Interceptor {
    private final Supplier<String> tokenProvider;

    public AuthInterceptor(Supplier<String> tokenProvider) {
        this.tokenProvider = tokenProvider;
    }

    @Override
    public Response intercept(Interceptor.Chain chain) {
        String token = tokenProvider.get();
        Request request;
        if (token != null) {
            request = chain.request().newBuilder()
                .header("Authorization", "Bearer " + token)
                .build();
        } else {
            request = chain.request();
        }
        return chain.proceed(request);
    }
}
```

@tab Kotlin

```kotlin
class AuthInterceptor(private val tokenProvider: () -> String?) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val token = tokenProvider()
        val request = if (token != null) {
            chain.request().newBuilder()
                .header("Authorization", "Bearer $token")
                .build()
        } else {
            chain.request()
        }
        return chain.proceed(request)
    }
}
```

:::

### 3.2 日志打印

::: code-tabs

@tab:active Java

```java
class LoggingInterceptor implements Interceptor {
    @Override
    public Response intercept(Interceptor.Chain chain) {
        Request request = chain.request();
        Log.d("OkHttp", "--> " + request.method() + " " + request.url());

        long t1 = System.nanoTime();
        Response response = chain.proceed(request);
        long ms = (System.nanoTime() - t1) / 1_000_000;

        Log.d("OkHttp", "<-- " + response.code() + " 耗时 " + ms + "ms");
        return response;
    }
}
```

@tab Kotlin

```kotlin
class LoggingInterceptor : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val request = chain.request()
        Log.d("OkHttp", "--> ${request.method} ${request.url}")

        val t1 = System.nanoTime()
        val response = chain.proceed(request)
        val ms = (System.nanoTime() - t1) / 1_000_000

        Log.d("OkHttp", "<-- ${response.code} 耗时 ${ms}ms")
        return response
    }
}
```

:::

### 3.3 统一错误处理 / 重试

::: code-tabs

@tab:active Java

```java
class RetryInterceptor implements Interceptor {
    private final int maxRetries;

    public RetryInterceptor() {
        this(3);
    }

    public RetryInterceptor(int maxRetries) {
        this.maxRetries = maxRetries;
    }

    @Override
    public Response intercept(Interceptor.Chain chain) {
        int attempt = 0;
        while (true) {
            try {
                return chain.proceed(chain.request());
            } catch (IOException e) {
                attempt++;
                if (attempt >= maxRetries) throw e;
                try {
                    Thread.sleep(1000L * attempt);  // 退避
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw new RuntimeException(ie);
                }
            }
        }
    }
}
```

@tab Kotlin

```kotlin
class RetryInterceptor(private val maxRetries: Int = 3) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        var attempt = 0
        while (true) {
            try {
                return chain.proceed(chain.request())
            } catch (e: IOException) {
                attempt++
                if (attempt >= maxRetries) throw e
                Thread.sleep(1000L * attempt)  // 退避
            }
        }
    }
}
```

:::

### 3.4 响应模拟（测试）

::: code-tabs

@tab:active Java

```java
class MockInterceptor implements Interceptor {
    @Override
    public Response intercept(Interceptor.Chain chain) {
        ResponseBody responseBody = "{\"code\":0,\"data\":\"mock\"}"
            .toResponseBody("application/json".toMediaType());
        return new Response.Builder()
            .request(chain.request())
            .protocol(Protocol.HTTP_1_1)
            .code(200)
            .message("OK")
            .body(responseBody)
            .build();
    }
}
```

@tab Kotlin

```kotlin
class MockInterceptor : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val responseBody = """{"code":0,"data":"mock"}""".toResponseBody(
            "application/json".toMediaType()
        )
        return Response.Builder()
            .request(chain.request())
            .protocol(Protocol.HTTP_1_1)
            .code(200)
            .message("OK")
            .body(responseBody)
            .build()
    }
}
```

:::

## 4. 高频面试题

**Q1：责任链模式在 OkHttp 中的体现？**
A：`Interceptor` 接口 + `RealInterceptorChain` 递归调用。每个拦截器调用
`chain.proceed()` 把请求传给下一个，响应反向传递。可插拔、可排序、职责单一。

**Q2：应用拦截器和网络拦截器的执行时机？**
A：应用拦截器在链头（用户请求），每个逻辑请求调用一次；网络拦截器在连接之后，
重定向/重试时会多次调用。日志、鉴权选应用拦截器，真实网络统计选网络拦截器。

**Q3：如何实现缓存？**
A：`CacheInterceptor` + `Cache`（磁盘 LRU）。响应头 `Cache-Control: max-age` 控制
强缓存；`ETag`/`Last-Modified` 控制协商缓存（304）。默认 GET 可缓存。

**Q4：拦截器能中断请求吗？**
A：能。不调用 `chain.proceed()` 直接返回 `Response` 即可短路（如缓存命中、
Mock 响应）。注意：未走网络的响应不会被 NetworkInterceptor 看到。

**Q5：OkHttp 重试机制是怎么实现的？**
A：`RetryAndFollowUpInterceptor` 捕获 `IOException` 判断是否可重试
（请求体可重发、非用户取消），默认最多 20 次重定向/重试（`followRedirects`、
`retryOnConnectionFailure` 可配置）。

## 5. 小结

- 拦截器链 = 责任链模式，7 个内置拦截器各司其职。
- 自定义拦截器：鉴权、日志、重试、Mock 信手拈来。
- 面试重点：责任链思想、应用/网络拦截器区别、缓存与重试机制。
