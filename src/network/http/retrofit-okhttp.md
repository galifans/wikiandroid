---
icon: http
title: Retrofit + OkHttp 架构解析
description: Retrofit 动态代理原理、OkHttp 请求链路、连接池、协程支持完整解析
---

# Retrofit + OkHttp 架构解析

> 面试高频指数：极高
> 网络请求是 App 的核心，Retrofit + OkHttp 是 Android 事实标准的网络栈。

## 1. 整体架构

```text
调用方（协程/回调）
    │ 调用接口方法
    ▼
Retrofit（动态代理）
    │ 解析注解 → 生成 Request
    ▼
OkHttp Call
    │ 拦截器链（责任链）
    ▼
连接池 → Socket → 服务器
    │
    ▼
Response → 转换器（Gson/Moshi）→ 业务对象
```

## 2. Retrofit 原理：动态代理

### 2.1 为什么接口不需要实现类

::: code-tabs

@tab:active Java

```java
public interface ApiService {
    @GET("users/{id}")
    Call<User> getUser(@Path("id") int id);
}

// 使用
ApiService api = retrofit.create(ApiService.class);  // 没有实现类！
```

@tab Kotlin

```kotlin
interface ApiService {
    @GET("users/{id}")
    suspend fun getUser(@Path("id") id: Int): User
}

// 使用
val api = retrofit.create(ApiService::class.java)  // 没有实现类！
```

:::

### 2.2 动态代理机制

::: code-tabs

@tab:active Java

```java
// Retrofit.create 源码核心（简化）
public <T> T create(final Class<T> service) {
    return (T) Proxy.newProxyInstance(           // JDK 动态代理
        service.getClassLoader(),
        new Class<?>[]{service},
        new InvocationHandler() {
            @Override
            public Object invoke(Object proxy, Method method, Object[] args) {
                // 每个接口方法调用都会走到这里
                ServiceMethod serviceMethod = loadServiceMethod(method);  // 缓存解析结果
                OkHttpCall okHttpCall = new OkHttpCall<>(serviceMethod, args);
                return serviceMethod.adapt(okHttpCall);  // 适配为 Call/suspend/Observable
            }
        });
}
```

@tab Kotlin

```kotlin
// Retrofit.create 源码核心（简化）
fun <T> create(service: Class<T>): T {
    return Proxy.newProxyInstance(           // JDK 动态代理
        service.classLoader,
        arrayOf<Class<*>>(service),
        object : InvocationHandler {
            override fun invoke(proxy: Any, method: Method, args: Array<out Any>?): Any {
                // 每个接口方法调用都会走到这里
                val serviceMethod = loadServiceMethod(method)  // 缓存解析结果
                val okHttpCall = OkHttpCall<Any>(serviceMethod, args)
                return serviceMethod.adapt(okHttpCall)  // 适配为 Call/suspend/Observable
            }
        })
}
```

:::

关键点：

1. **`Proxy.newProxyInstance`**：运行时生成接口的代理对象。
2. **方法缓存**：`loadServiceMethod` 缓存已解析的方法（`ConcurrentHashMap`），避免重复解析。
3. **适配器**：`CallAdapter` 把 `OkHttpCall` 适配成协程 `suspend` / `Observable` / `Call`。

### 2.3 ServiceMethod 解析过程

```text
方法注解（@GET/@POST）→ 请求方式
方法参数注解（@Path/@Query/@Body）→ 参数位置
返回值类型 → CallAdapter 选择
参数转换器（Converter）→ 序列化/反序列化
```

## 3. OkHttp 请求链路

### 3.1 拦截器链（责任链模式）

```text
用户 Call
  ├─ ① Application Interceptors（自定义，最先执行）
  ├─ ② RetryAndFollowUpInterceptor（重试/重定向）
  ├─ ③ BridgeInterceptor（补全请求头）
  ├─ ④ CacheInterceptor（缓存处理）
  ├─ ⑤ ConnectInterceptor（建立连接）
  └─ ⑥ CallServerInterceptor（读写数据）
```

::: code-tabs

@tab:active Java

```java
// 添加应用拦截器（全局，可看到所有请求）
OkHttpClient client = new OkHttpClient.Builder()
    .addInterceptor(chain -> {               // 应用拦截器
        Request request = chain.request()
            .newBuilder()
            .header("Authorization", "Bearer " + token)
            .build();
        Response response = chain.proceed(request);
        // 统一处理错误码
        return response;
    })
    .addNetworkInterceptor(chain -> {        // 网络拦截器（仅真实网络请求）
        long t1 = System.nanoTime();
        Response response = chain.proceed(chain.request());
        Log.d("OkHttp", "耗时: " + (System.nanoTime() - t1) / 1e6 + "ms");
        return response;
    })
    .build();
```

@tab Kotlin

```kotlin
// 添加应用拦截器（全局，可看到所有请求）
val client = OkHttpClient.Builder()
    .addInterceptor { chain ->               // 应用拦截器
        val request = chain.request()
            .newBuilder()
            .header("Authorization", "Bearer $token")
            .build()
        val response = chain.proceed(request)
        // 统一处理错误码
        response
    }
    .addNetworkInterceptor { chain ->        // 网络拦截器（仅真实网络请求）
        val t1 = System.nanoTime()
        val response = chain.proceed(chain.request())
        Log.d("OkHttp", "耗时: ${(System.nanoTime() - t1) / 1e6}ms")
        response
    }
    .build()
```

:::

**应用拦截器 vs 网络拦截器**：

| 区别 | 应用拦截器 | 网络拦截器 |
| --- | --- | --- |
| 调用次数 | 请求**一次** | 重定向/重试会**多次** |
| 能看到 | 原始请求 | 实际网络请求（含重定向后） |
| 位置 | 链最前 | 链中间（连接之后） |
| 典型用途 | 加 Token、日志 | 统计真实网络耗时 |

### 3.2 连接池

::: code-tabs

@tab:active Java

```java
// OkHttp 默认：每个 Host 最多 5 个空闲连接，存活 5 分钟
new ConnectionPool(5, 5, TimeUnit.MINUTES)
```

@tab Kotlin

```kotlin
// OkHttp 默认：每个 Host 最多 5 个空闲连接，存活 5 分钟
ConnectionPool(maxIdleConnections = 5, keepAliveDuration = 5, TimeUnit.MINUTES)
```

:::

- HTTP/1.1：`keep-alive` 复用连接，避免重复 TCP 握手。
- HTTP/2：多路复用，一个连接并发多个请求。
- 连接池按 `Route`（地址+代理+TLS）分组。

### 3.3 请求执行流程

```text
RealCall.execute()（同步）
  └─ getResponseWithInterceptorChain()   // 构建拦截器链
       └─ chain.proceed(request)          // 依次经过每个拦截器
            └─ CallServerInterceptor      // 最终写请求、读响应
```

## 4. 协程支持

::: code-tabs

@tab:active Java

```java
// Retrofit 2.6+ 原生支持 suspend（Java 侧使用 Call 回调）
public interface ApiService {
    @GET("users/{id}")
    Call<User> getUser(@Path("id") int id);
}

// 内部原理：suspend 函数通过 suspendCancellableCoroutine 包装
// 请求完成回调 resume 协程，取消时 cancel Call
```

@tab Kotlin

```kotlin
// Retrofit 2.6+ 原生支持 suspend
interface ApiService {
    @GET("users/{id}")
    suspend fun getUser(@Path("id") id: Int): User
}

// 内部原理：suspend 函数通过 suspendCancellableCoroutine 包装
// 请求完成回调 resume 协程，取消时 cancel Call
```

:::

::: code-tabs

@tab:active Java

```java
// 使用（无需手动切线程，Java 走回调）
api.getUser(42).enqueue(new Callback<User>() {
    @Override
    public void onResponse(Call<User> call, Response<User> response) {
        if (response.isSuccessful()) {
            uiState.postValue(response.body());   // 自动切回主线程
        }
        // HTTP 错误码
    }

    @Override
    public void onFailure(Call<User> call, Throwable t) {
        // 网络错误
    }
});
```

@tab Kotlin

```kotlin
// 使用（无需手动切线程）
viewModelScope.launch {
    try {
        val user = api.getUser(42)      // 自动在 IO 线程执行
        uiState.value = user
    } catch (e: HttpException) {
        // HTTP 错误码
    } catch (e: IOException) {
        // 网络错误
    }
}
```

:::

## 5. 高频面试题

**Q1：Retrofit 动态代理原理？**
A：`create()` 使用 JDK `Proxy.newProxyInstance` 为接口生成代理对象，方法调用统一
进入 `InvocationHandler.invoke`，通过 `loadServiceMethod`（缓存）解析注解与参数，
构造 `OkHttpCall`，再由 `CallAdapter` 适配为 suspend/Observable/Call。

**Q2：为什么 Retrofit 接口方法第一次调用慢？**
A：首次调用需要解析注解生成 `ServiceMethod`（反射开销），之后走缓存
（`ConcurrentHashMap`）。可启动时预热接口。

**Q3：应用拦截器和网络拦截器的区别？**
A：应用拦截器在链头、每个请求只调一次、看到的是原始请求；网络拦截器在连接之后、
重定向/重试会多次调用、看到真实网络请求。日志、鉴权用应用拦截器；真实耗时统计用网络拦截器。

**Q4：OkHttp 如何复用连接？**
A：`ConnectionPool` 按 Route 缓存空闲连接；HTTP/1.1 用 keep-alive，HTTP/2 多路复用。
`CallServerInterceptor` 使用完连接归还池（`Exchange` 复用机制）。

**Q5：Retrofit suspend 函数内部如何处理协程取消？**
A：suspend 扩展通过 `suspendCancellableCoroutine` 实现，`Call.enqueue` 回调中
`resume`；协程取消时调用 `call.cancel()` 取消网络请求，避免资源浪费。

## 6. 小结

- Retrofit：动态代理 + 注解解析 + CallAdapter/Converter 可插拔。
- OkHttp：拦截器责任链 + 连接池 + HTTP/2 多路复用。
- 协程时代：`suspend` 函数直接返回结果，异常用 try-catch。
- 面试重点：动态代理原理、拦截器链、连接复用、协程适配。
