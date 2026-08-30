---
icon: network
title: 网络连接架构
description: ConnectivityService、网络栈、网络切换、VpnService、网络评分
---

# 网络连接架构

> 面试高频指数：中
> Android 的网络不是单一 WiFi/数据，而是一套由 ConnectivityService 统一管理的多网络体系。WiFi、蜂窝、以太网、VPN 都归它调度。

## 1. 网络架构全景

```text
应用层：Socket / OkHttp / ConnectivityManager
  ↓
Framework：ConnectivityService（CS）
  ↓ 选择 + 路由
NetworkStack（网络栈）
  ├── WiFi（WifiService + supplicant）
  ├── 蜂窝（Telephony + RIL）
  ├── 以太网（EthernetService）
  └── VPN（VpnService）
  ↓
内核：网络驱动 / 协议栈
```

## 2. ConnectivityService

### 2.1 服务职责

```text
ConnectivityService 核心职责：
① 管理网络类型（WiFi/蜂窝/以太网/VPN）
② 网络评分与选择（默认网络）
③ 网络能力声明（带宽、计费、验证）
④ 网络切换与路由更新
⑤ 网络可用性监测（captive portal）
⑥ 为应用提供 NetworkCallback
```

### 2.2 网络注册

```text
网络注册流程：
网络提供者（WiFi/蜂窝等）
→ NetworkAgent 注册到 CS
→ CS 评估网络能力（NetworkCapabilities）
→ 参与默认网络竞选

能力标签：
- NET_CAPABILITY_INTERNET（可上网）
- NET_CAPABILITY_VALIDATED（已验证）
- NET_CAPABILITY_NOT_METERED（非计费）
- NET_CAPABILITY_WIFI / CELLULAR
```

## 3. 网络选择与切换

### 3.1 网络评分

```text
网络评分机制：
- 每个网络按能力打分
- 已验证网络优先于未验证
- WiFi 通常优先于蜂窝
- 自动切换条件：
  当前网络断开/劣化
  更优网络出现（验证通过）

应用可绑定特定网络：
requestNetwork(NetworkRequest)
```

### 3.2 切换流程

```text
网络切换流程：
旧网络断开/新网络验证通过
→ CS 更新网络栈路由
→ 更新默认网络（setDefaultNetwork）
→ 通知应用（NetworkCallback.onCapabilitiesChanged）
→ 旧连接陆续关闭（socket 迁移）

注意：
- 切换瞬间 socket 可能断开
- 应用应监听回调重建连接
- 多宿主（multihoming）保留双网络
```

## 4. 网络验证

### 4.1 Captive Portal

```text
网络验证（CaptivePortal）：
连接后向验证服务器发探测请求
（generate_204 / connectivitycheck.gstatic.com）

结果：
- 204 → 已验证（可上网）
- 重定向 → 需要登录（机场/酒店热点）
- 超时 → 无外网

未验证网络：
- 不自动成为默认网络
- 应用需显式绑定
```

## 5. VPN 与代理

### 5.1 VpnService

```text
VPN 机制：
- VpnService：应用建立 VPN（自建通道）
- 系统 VPN：设置内配置
- VPN 网络与普通网络并列，优先级高

VPN 链路：
应用流量 → VPN 隧道 → 远程服务器 → 目标
```

### 5.2 代理

```text
代理类型：
- 全局代理（设置中配置）
- 应用内代理
- PAC（自动配置脚本）

注意：
- 代理影响所有 HTTP 请求
- VPN 与代理可叠加
- 系统代理对 native socket 无效（需手动）
```

## 6. 应用适配

```java
// 监听网络变化
ConnectivityManager cm = (ConnectivityManager) getSystemService(CONNECTIVITY_SERVICE);
NetworkRequest request = new NetworkRequest.Builder()
        .addCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
        .build();
cm.registerNetworkCallback(request, new ConnectivityManager.NetworkCallback() {
    @Override
    public void onAvailable(Network network) {
        // 网络可用
    }
    @Override
    public void onLost(Network network) {
        // 网络断开
    }
    @Override
    public void onCapabilitiesChanged(Network network, NetworkCapabilities caps) {
        // 网络能力变化（如从计费变非计费）
    }
});
```

```text
最佳实践：
- 大文件下载监听网络变化
- 检测是否计费网络（避免流量消耗）
- 弱网重试机制
- 离线缓存兜底
```

## 7. 高频面试题

**Q1：ConnectivityService 的作用？**
A：统一管理 WiFi/蜂窝/以太网/VPN，负责网络注册、能力评估、评分选优、切换路由与通知应用。

**Q2：默认网络怎么选出来的？**
A：各网络经 NetworkAgent 注册，CS 按能力与验证状态评分，已验证网络优先、WiFi 优先于蜂窝，动态调整。

**Q3：网络切换时应用会怎样？**
A：socket 可能断开、连接重置；应用应通过 NetworkCallback 监听，在 onAvailable/onLost 中重建连接。

**Q4：captive portal 是什么？**
A：连接后向探测服务器发请求验证网络；返回 204 为已验证，重定向说明需登录，未验证网络不自动成为默认网络。

**Q5：如何检测当前是否计费网络？**
A：NetworkCallback.onCapabilitiesChanged 中检查 NET_CAPABILITY_NOT_METERED，据此决定是否省流量。

## 8. 小结

- CS 统一管理多网络：注册、评分、切换、通知。
- 默认网络由评分与验证决定。
- 网络切换需应用监听回调适配。
- VPN 与代理是独立网络维度。
- 计费检测与弱网重试是应用适配重点。
