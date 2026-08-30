---
icon: network
title: WiFi 框架与连接流程
description: WifiService、supplicant、扫描结果、连接流程、WifiManager 接口
---

# WiFi 框架与连接流程

> 面试高频指数：中
> 从 WifiManager 扫描到最终连上 AP，中间经过 Framework、supplicant、驱动三层。理解 WiFi 架构有助于排查连接与信号问题。

## 1. WiFi 架构分层

```text
应用层：WifiManager / WifiNetworkSpecifier
  ↓
Framework：WifiService（系统服务）
  ├── WifiController（状态机）
  ├── WifiStateMachine（连接状态机）
  └── WifiNative（native 接口）
  ↓
Native：wpa_supplicant（WPA 认证客户端）
  ↓
HAL：WiFi HAL（vendor 实现）
  ↓
内核：驱动 + cfg80211
```

## 2. WifiService

### 2.1 服务职责

```text
WifiService 核心职责：
① 开关 WiFi（WifiController 状态机）
② 扫描请求与结果管理
③ 网络配置（SavedNetwork / WifiConfiguration）
④ 连接流程调度（WifiStateMachine）
⑤ 热点与 P2P 管理
⑥ 权限与限制（后台扫描限制）
```

### 2.2 权限

```text
WiFi 相关权限：
- ACCESS_WIFI_STATE：查询状态
- CHANGE_WIFI_STATE：开关/连接
- ACCESS_FINE_LOCATION：扫描结果需要定位权限
  （Android 8.0+ 扫描 WiFi 需定位权限）
- NEARBY_WIFI_DEVICES：Android 13+ 近距离设备权限
```

## 3. 扫描机制

### 3.1 扫描流程

```text
扫描链路：
WifiManager.startScan()
→ WifiService
→ WifiNative.scan
→ supplicant 发起扫描
→ 驱动扫描信道
→ 结果经 supplicant 上报
→ ScanResults 返回应用

扫描限制：
- 后台应用扫描频率受限（30 秒窗口）
- 需要定位权限
- 省电模式下扫描合并
```

### 3.2 结果筛选

```text
ScanResult 字段：
- SSID / BSSID
- 信号强度（RSSI）
- 加密方式（WPA2/WPA3 等）
- 频率（2.4G/5G/6G）
- 是否支持 WPS

应用按需过滤：
- 按 SSID 匹配
- 按信号强度排序
- 按安全类型过滤
```

## 4. 连接流程

### 4.1 连接状态机

```text
WifiStateMachine 连接流程：

IDLE → SCANNING（扫描）
     → CONNECTING（发起连接）
       - supplicant 关联（ASSOCIATING）
       - 认证（AUTHENTICATING）
       - 四步握手（4-way handshake）
     → CONNECTED（成功）
     → IP 分配（DHCP）
     → 验证网络（captive portal）
     → 完成

失败路径：
- 关联失败（信号弱/密码错）
- 认证失败（WPA 密钥错误）
- DHCP 失败
→ 回退重试或 DISCONNECTED
```

### 4.2 连接方式

```java
// 方式一：系统弹窗选择（推荐，无需权限）
WifiNetworkSpecifier specifier = new WifiNetworkSpecifier.Builder()
        .setSsidPattern(new Pattern("MyWiFi"))
        .setWpa2Passphrase("password")
        .build();
NetworkRequest request = new NetworkRequest.Builder()
        .addTransportType(NetworkCapabilities.TRANSPORT_WIFI)
        .setNetworkSpecifier(specifier)
        .build();
connectivityManager.requestNetwork(request, networkCallback);

// 方式二：传统 API（需 CHANGE_WIFI_STATE 权限）
WifiConfiguration config = new WifiConfiguration();
config.SSID = "\"MyWiFi\"";
config.preSharedKey = "\"password\"";
wifiManager.addNetwork(config);
wifiManager.enableNetwork(netId, true);
```

```text
注意：
- Android 10+ 推荐 NetworkSpecifier 方式（无需定位权限）
- 传统 addNetwork API 在新版本受限
- 用户主动连接由系统 UI 完成
```

## 5. supplicant 与认证

### 5.1 wpa_supplicant

```text
wpa_supplicant：
- 运行在 native 层的守护进程
- 负责 802.11 认证（WPA/WPA2/WPA3）
- 与驱动通过 nl80211 通信
- 管理扫描、关联、密钥协商

WPA 四步握手：
AP → 客户端：ANonce
客户端 → AP：SNonce + MIC
AP → 客户端：GTK + MIC
客户端 → AP：确认
```

### 5.2 安全方式

| 方式 | 说明 |
|------|------|
| 开放 | 无加密，公共热点 |
| WPA2-PSK | 预共享密钥 |
| WPA3 | 更强防护（同步认证） |
| 802.1X | 企业级认证（证书） |
| WPA2/WPA3 过渡 | 兼容模式 |

## 6. 常见问题排查

```text
WiFi 问题排查：
① 扫描不到：
   - 定位权限 / 后台扫描限制
   - 信道/频段（5G 是否支持）
② 连不上：
   - 密码错误（认证失败日志）
   - AP 限制设备数
   - 隐藏 SSID
③ 连上无网：
   - captive portal 未验证
   - DHCP/IP 冲突
④ 频繁掉线：
   - 信号弱/漫游
   - 省电策略断开

工具：
dumpsys wifi
logcat（wpa_supplicant 日志）
```

## 7. 高频面试题

**Q1：WiFi 架构分几层？**
A：应用层（WifiManager）→ Framework（WifiService/WifiStateMachine）→ native（wpa_supplicant）→ HAL → 内核驱动（cfg80211）。

**Q2：扫描 WiFi 为什么要定位权限？**
A：Android 8.0+ 规定扫描结果属于位置信息，需 ACCESS_FINE_LOCATION；Android 13+ 可用 NEARBY_WIFI_DEVICES。

**Q3：WifiStateMachine 连接状态有哪些？**
A：IDLE → SCANNING → CONNECTING（ASSOCIATING/AUTHENTICATING/握手）→ CONNECTED → DHCP → 验证 → 完成；失败回退重试。

**Q4：WPA2 四步握手是什么？**
A：AP 发 ANonce、客户端回 SNonce+MIC、AP 发 GTK+MIC、客户端确认，协商出会话密钥建立加密连接。

**Q5：如何不申请定位权限连接指定 WiFi？**
A：Android 10+ 用 WifiNetworkSpecifier + NetworkRequest，系统弹窗让用户确认，无需定位与 WiFi 修改权限。

## 8. 小结

- WiFi 分四层：应用 / Framework / supplicant / 驱动。
- 扫描需定位权限且后台受限。
- 连接走状态机：扫描 → 关联 → 握手 → DHCP → 验证。
- WifiNetworkSpecifier 是新版推荐连接方式。
- dumpsys wifi + supplicant 日志排查问题。
