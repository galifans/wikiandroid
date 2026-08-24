---
icon: mobile
title: 《APP研发录》第2章读书笔记
---

# 《APP研发录》第2章：网络底层与数据缓存

> 本章围绕网络底层封装、App 缓存策略、MockService 与用户登录（Cookie）四大主题，讲述一套完整的网络架构方案。

## 一、网络底层封装

### Request / Response 规范

- **GET**：参数以 `k=v` 键值对形式放 URL（便于做缓存）；参数尽量为简单类型
- **POST**：键值对放 Form 表单，复杂数据转为 JSON 字符串提交
- **统一 Response 结构**：`isError`（是否成功）、`errorType`（错误类型，0 为成功）、`errorMessage`（错误信息）、`result`（数据结果）
- 错误类型约定：**正数**为服务端自定义错误（如 1 = Cookie 过期）；**负数**为客户端网络异常

### 抛弃 AsyncTask 的原因

AsyncTask 不能灵活控制内部线程池，也无法取消请求：

- 页面 A 发起多个请求后跳转 B，A 的请求仍在线程池排队，阻塞 B 的请求
- 改用 **ThreadPoolExecutor + Runnable + Handler** 原生封装

### 网络底层优化点

1. **onFail 统一处理**：在 BaseActivity 中定义 `AbstractRequestCallback`，默认实现统一的错误提示，子类按需重写
2. **UrlConfigManager 优化**：启动时一次性将 url.xml 读入内存集合，避免频繁读文件；集合为空时再重新加载
3. **可选回调**：打点等无需结果的请求传 `null` 回调，底层需判空
4. **ProgressBar 处理**：统一定义在 BaseActivity；**不要把 Dialog 的 show/dismiss 封装进网络底层**（子线程不能操作 UI）

## 二、App 数据缓存设计

### 缓存策略

- 仅针对 **GET** 接口（POST 是修改数据，不缓存）
- 即时性低的数据缓存时间长（5~10 分钟），频繁变动的数据短缓存或不缓存
- 相同接口不同参数对应不同缓存（URL 作为 key，**key 需排序**保证唯一）
- 缓存存 **SD 卡**（数据量大，不存内存）
- 配置：url.xml 中为每个接口配置 `Expires` 过期时间

### 实现要点

- 请求前查缓存，命中直接回调；返回后写缓存（`CacheManager`）
- Application 启动时初始化缓存目录
- **强制更新**：`invoke` 方法增加 `forceUpdate` 参数，为 true 时把 Expires 置 0，跳过缓存

## 三、MockService

后端接口未就绪时模拟返回数据：

- url.xml 中通过 `MockClass` 属性指定对应的 Mock 类
- `MockService` 基类定义抽象方法 `getJsonData()`，各接口对应子类返回假 JSON
- 反射机制：`Class.forName(mockClass).newInstance()` 实例化后调用，有 MockClass 走本地假数据，否则走真实请求

## 四、用户登录与自动登录

### 登录的三种场景

1. 登录成功直接进入目标页
2. 跳转 B 页时发现未登录 → 先登录 → 回调后继续跳转（`startActivityForResult` + `setResult`）
3. 执行某操作时未登录 → 登录 → 返回后继续执行

通过上个页面传入的 `needCallback` 变量整合三种逻辑。

### 自动登录与 Cookie

**不保存明文密码**（易被窃取；对称加密也不可靠，源码泄露即可反推）。正确方案：

- 密码用**哈希散列（不可逆）**加密存储与传输，服务器比对哈希值
- 登录成功后服务端返回 **Cookie/Token**（放在 HTTP Response header 的 `Set-Cookie` 中），App 存本地
- 每次请求把本地 Cookie 放入请求 header；每次响应后取出新 Cookie 覆盖保存
- 用 Cookie 机制替代"每次启动模拟登录"，配合验证码等安全机制
