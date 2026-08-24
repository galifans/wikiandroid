---
icon: broadcast
title: 动态注册与静态注册对比
description: 静态注册与动态注册的机制差异、Android 8.0+ 隐式广播限制、以及选择建议
---

# ⚖️ 动态注册与静态注册对比

> 面试高频指数：⭐⭐⭐⭐
> 静态注册 vs 动态注册是广播面试题的必考点，也是实际开发中踩坑最多的部分。

## 1. 两种注册方式回顾

### 静态注册（Manifest 声明）

```xml
<receiver
    android:name=".NetworkReceiver"
    android:exported="false">
    <intent-filter>
        <action android:name="com.example.MY_ACTION" />
    </intent-filter>
</receiver>
```

- 系统在 **App 安装时** 解析 Manifest 并登记（由 PMS/AMS 维护）。
- App 未启动、进程未运行时也能被唤醒。

### 动态注册（代码注册）

```kotlin
val receiver = object : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        // handle
    }
}

// Android 13+ 必须指定导出标志
registerReceiver(receiver, filter, Context.RECEIVER_NOT_EXPORTED)
// 组件销毁时必须注销
unregisterReceiver(receiver)
```

- 注册信息保存在 **AMS 的进程内注册表**，跟随进程生命周期。
- 进程被杀 → 自动失效；组件销毁不注销 → **内存泄漏**（Receiver 持有 Context 引用）。

## 2. 核心差异对比表

| 维度 | 静态注册 | 动态注册 |
| --- | --- | --- |
| 注册时机 | 安装时（Manifest 解析） | 代码执行时 |
| 生效范围 | 全局（即使 App 未启动） | 注册后到注销前 |
| 优先级 | 由 `android:priority` 决定 | 注册顺序（同优先级下注册早的优先） |
| 隐式广播（8.0+） | **大部分受限** | 不受限 |
| 内存泄漏风险 | 无（系统管理） | 高（必须成对注销） |
| 调试成本 | 需安装/重启 | 即时生效 |
| 典型场景 | 开机启动、包替换、外设插拔 | 屏幕亮灭、电量变化、网络切换 |

## 3. 为什么静态注册受限（Android 8.0 的改动）

### 3.1 背景

Android 8.0（API 26）之前，应用可以通过静态注册接收任何广播，导致：

- **恶意唤醒**：App 被无关广播反复拉起，耗电严重。
- **占用内存**：大量常驻 Receiver 占用系统资源。

### 3.2 限制内容

```text
Android 8.0 起，除豁免列表外，所有【隐式广播】不能再通过静态注册接收。
显式广播（指定包名/组件）不受影响。
```

豁免广播（可静态注册）主要包括：

| 广播 | 用途 |
| --- | --- |
| ACTION_BOOT_COMPLETED | 开机完成（延迟接收） |
| ACTION_LOCKED_BOOT_COMPLETED | 解锁前启动 |
| ACTION_MY_PACKAGE_REPLACED | 自身升级 |
| ACTION_PACKAGE_ADDED/REMOVED（部分） | 包安装/卸载（有限制） |
| ACTION_LOCALE_CHANGED | 语言切换 |
| ACTION_TIME_CHANGED / TIMEZONE_CHANGED | 时间变化 |
| ACTION_BATTERY_LOW / OK 等部分电源类 | 低电量（有限制） |

### 3.3 判断是否隐式

```kotlin
// 隐式广播：只指定 action，由系统解析
val implicit = Intent("com.example.MY_ACTION")
sendBroadcast(implicit)

// 显式广播：指定包名/组件，绕过 8.0 限制
val explicit = Intent("com.example.MY_ACTION").apply {
    setPackage("com.example.target")   // 关键：指定包名
}
sendBroadcast(explicit)
```

> **跨应用发送广播的推荐做法**：总是 `setPackage()` 指定目标包名，既绕开限制又更安全。

## 4. 高版本动态注册的导出标志

Android 13（API 33）起：

```kotlin
// 只接收自己应用发出的广播（推荐默认）
registerReceiver(receiver, filter, Context.RECEIVER_NOT_EXPORTED)

// 需要接收其他应用/系统的广播
registerReceiver(receiver, filter, Context.RECEIVER_EXPORTED)
```

- `RECEIVER_NOT_EXPORTED`：只能接收**同应用或系统（UID 相同）** 的广播。
- `RECEIVER_EXPORTED`：可接收所有来源，同时暴露为其他应用可攻击的目标（注意权限校验）。
- Android 14 起，接收**非系统广播**若未指定标志会抛 `SecurityException`。

## 5. 选择建议

```text
需要 App 未启动时接收？      → 静态注册（先确认是否在豁免列表）
需要接收高频实时事件？      → 动态注册（电量、网络、屏幕）
只是应用内部事件通知？      → 不要用广播！用 LiveData/Flow/事件总线
需要跨应用通信？            → 显式广播（setPackage）或 ContentProvider/Service
```

### 5.1 一个实用模板：网络变化监听

```kotlin
// 推荐：使用 ConnectivityManager 回调而非广播
class MainActivity : AppCompatActivity() {

    private val callback = object : ConnectivityManager.NetworkCallback() {
        override fun onAvailable(network: Network) {
            runOnUiThread { toast("网络已连接") }
        }

        override fun onLost(network: Network) {
            runOnUiThread { toast("网络已断开") }
        }
    }

    override fun onStart() {
        super.onStart()
        val cm = getSystemService(ConnectivityManager::class.java)
        cm.registerDefaultNetworkCallback(callback)
    }

    override fun onStop() {
        super.onStop()
        getSystemService(ConnectivityManager::class.java)
            .unregisterNetworkCallback(callback)
    }
}
```

## 6. 高频面试题

**Q1：为什么 Android 8.0 要限制静态注册？**
A：静态注册的 Receiver 会被系统常驻维护，恶意应用借此被无关广播频繁唤醒，严重浪费内存与电量。
限制隐式广播的静态注册，倒逼开发者使用显式广播或动态注册。

**Q2：动态注册的广播进程被杀后还能收到吗？**
A：不能。动态注册的注册信息保存在进程内，进程死亡即失效。若需进程被杀后仍能接收，
必须静态注册（且广播在豁免列表内）。

**Q3：静态注册的 Receiver 一定能被唤醒吗？**
A：不一定。① 8.0+ 隐式广播受限；② 系统休眠（Doze）时广播会被延迟；③ OEM 厂商杀后台
策略可能阻止唤醒。开发时应假设"静态注册不可靠"，关键业务用推送 + 前台服务。

**Q4：RECEIVER_EXPORTED 与 RECEIVER_NOT_EXPORTED 选哪个？**
A：默认用 `RECEIVER_NOT_EXPORTED`（只能收自己应用的广播）；只有明确需要接收其他应用
或系统的广播时才用 `RECEIVER_EXPORTED`，并在 `onReceive` 中校验发送方（`getSendingUid`）。

## 7. 小结

- 静态注册"全局但受限"，动态注册"灵活但需管理生命周期"。
- 8.0+ 隐式广播静态注册受限；13/14 动态注册需导出标志。
- 应用内事件通知优先考虑 Flow/LiveData，广播留给跨进程与系统事件。
