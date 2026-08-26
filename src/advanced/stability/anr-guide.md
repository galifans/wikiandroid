---
icon: stability
title: ANR 原理与治理
description: ANR 定义与触发条件、ANR 类型、定位方法、traces 分析、ANR 治理实践
---

# ANR 原理与治理

> 面试高频指数：高
> ANR 是稳定性面试的必考点，理解触发条件与定位手段是关键。

## 1. 什么是 ANR

```text
ANR（Application Not Responding）：应用无响应

本质：主线程在规定时间内未完成任务

触发条件（主线程超时）：
| 类型 | 超时时间 |
|------|----------|
| 输入事件（按键/触摸） | 5 秒 |
| 广播（onReceive） | 前台 10s / 后台 60s |
| 服务（Service） | 前台 20s / 后台 200s |
| ContentProvider | 20s |

注意：不是"卡死"才 ANR，主线程被任何耗时任务阻塞超过阈值即触发
```

## 2. ANR 常见原因

```text
① 主线程 IO：网络请求、磁盘读写、数据库查询
② 锁竞争/死锁：主线程等待子线程锁
③ 广播处理慢：onReceive 中做耗时操作
④ Binder 阻塞：等待系统服务响应（AMS/PMS）
⑤ 启动耗时：Application/Activity 初始化过慢
⑥ 子线程耗尽：线程池打满，主线程等结果
⑦ GC 频繁：内存抖动导致大量 GC（阻塞主线程）
```

## 3. ANR 的定位方法

### 3.1 系统日志

```bash
# ① 查看 ANR 日志
adb shell dumpsys activity processes | grep -A 50 "ANR"
# 或
adb logcat | grep -E "ANR in|am_anr"

# ② 查看 traces 文件（主线程堆栈）
adb shell cat /data/anr/traces.txt
# Android 12+ 路径可能变化：
adb shell ls /data/anr/
```

```text
traces.txt 内容：
- 所有进程的线程堆栈
- 重点关注：主线程（"main"）状态
  状态标志：
  - RUNNABLE：在跑（看栈顶方法）
  - BLOCKED：等待锁（谁持锁？）
  - WAITING：等待（wait/join/condition）
  - NATIVE：native 调用（Binder 等待？）
```

### 3.2 代码监控

::: code-tabs

@tab:active Java

```java
// 主动监控主线程状态（线上 ANR 预警）
// 原理：主线程空闲时发消息，超时未执行 → 可能 ANR
new Handler(Looper.getMainLooper()).post(() -> {
    mainThreadIdle = true;
});

// 或者：监控消息执行时间（同卡顿监控）
// 主线程消息执行 > 5s → 抓取堆栈上报
```

@tab Kotlin

```kotlin
// 主动监控主线程状态（线上 ANR 预警）
// 原理：主线程空闲时发消息，超时未执行 → 可能 ANR
Handler(Looper.getMainLooper()).post {
    mainThreadIdle = true
}

// 或者：监控消息执行时间（同卡顿监控）
// 主线程消息执行 > 5s → 抓取堆栈上报
```

:::

## 4. 典型 ANR 分析示例

```text
场景：点击按钮 → ANR

traces 主线程堆栈：
"main" prio=5 tid=1 Blocked
  at com.example.MainActivity.onLoginClick(MainActivity.java:42)
  - waiting to lock <0x1234> (a java.lang.Object)
  at com.example.LoginManager.login(LoginManager.java:20)
  - locked <0x1234> (a java.lang.Object)

分析：
① 主线程 BLOCKED（等待锁 0x1234）
② 锁被谁持有？搜索 traces 中 locked 同一地址的线程
③ 发现子线程持有锁未释放（如网络回调中持锁）
④ 修复：主线程不等待子线程锁（回调主线程/去掉锁）

其他常见栈顶：
- SQLiteDatabase.query → 主线程数据库查询
- OkHttp execute → 主线程网络
- BinderProxy.transact → 系统服务阻塞
```

## 5. ANR 治理实践

```text
① 主线程禁止 IO：
   - 网络：协程/线程池 + 回调
   - 数据库：Room 支持挂起（自动切 IO 线程）
   - 文件/SharedPreferences：异步（DataStore）

② 初始化优化：
   - Application.onCreate 精简（异步/延迟）
   - 启动页轻量

③ 锁优化：
   - 主线程避免等待锁（避免子线程持锁阻塞主线程）
   - 减少锁粒度

④ 广播优化：
   - onReceive 中只做轻量操作（启动服务/跳转）
   - 耗时逻辑移到子线程

⑤ 监控预警：
   - 主线程消息耗时监控（>3s 预警）
   - 线上 ANR 率指标 + 堆栈采集
```

::: code-tabs

@tab:active Java

```java
// 正确的做法示例
void onLoginClick() {
    // ✗ 主线程网络（会 ANR）
    // User user = api.login(name, pwd);

    // ✓ 异步执行（协程的 withContext(IO) 等价：线程池 + 回调主线程）
    executor.execute(() -> {
        User user = api.login(name, pwd);
        runOnUiThread(() -> {
            // 回到主线程更新 UI
            tvResult.setText(user != null ? user.getName() : "失败");
        });
    });
}
```

@tab Kotlin

```kotlin
// 正确的做法示例
fun onLoginClick() {
    // ✗ 主线程网络（会 ANR）
    // val user = api.login(name, pwd)

    // ✓ 协程异步
    lifecycleScope.launch {
        val user = withContext(Dispatchers.IO) {
            api.login(name, pwd)
        }
        // 回到主线程更新 UI
        tvResult.text = user?.name ?: "失败"
    }
}
```

:::

## 6. 高频面试题

**Q1：ANR 的触发条件是什么？**
A：主线程超时：输入 5s、广播前台 10s/后台 60s、Service 前台 20s/
后台 200s、Provider 20s。本质：主线程被耗时任务阻塞。

**Q2：如何定位 ANR？**
A：logcat 找 "ANR in"；分析 /data/anr/traces.txt 主线程堆栈：
RUNNABLE 看栈顶方法；BLOCKED 找锁持有者；WAITING 看等待对象；
NATIVE 看 Binder 调用。也可埋点监控主线程消息耗时。

**Q3：主线程为什么不能做 IO？**
A：IO 慢（毫秒~秒级），会阻塞主线程消息循环，导致 UI 无法响应
（输入/绘制/广播超时）→ ANR。系统也不允许主线程网络（StrictMode
检测 NetworkOnMainThreadException）。

**Q4：如何避免 ANR？**
A：主线程只做轻量操作；耗时任务协程/线程池；初始化异步延迟；
避免锁竞争（主线程不等待）；广播轻量化；监控预警提前发现。

**Q5：ANR 和卡顿的关系？**
A：都是主线程问题。卡顿：帧绘制超时（16.6ms 基准，用户感知掉帧）；
ANR：任务超时阈值（5s+，系统弹窗）。卡顿严重（持续阻塞）会升级
为 ANR。监控两者可用同一套主线程耗时监控。

## 7. 小结

- ANR = 主线程超时（输入 5s / 广播 10s / 服务 20s）。
- 原因：主线程 IO、锁阻塞、广播耗时、Binder 等待。
- 定位：traces.txt 主线程堆栈（状态 + 栈顶 + 锁分析）。
- 治理：异步化 + 初始化精简 + 锁优化 + 监控预警。
- 面试重点：触发条件、traces 分析、治理手段。
