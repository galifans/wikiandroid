---
icon: network
title: 蓝牙框架与协议栈
description: BluetoothService、蓝牙协议栈、HCI、GATT、配对与连接流程
---

# 蓝牙框架与协议栈

> 面试高频指数：低
> 蓝牙在 Android 中是一套跨进程的多层架构（服务 + 协议栈 + 控制器）。理解 GATT 与配对流程可应对物联网/穿戴设备相关问题。

## 1. 蓝牙架构分层

```text
应用层：BluetoothManager / BluetoothAdapter
  ↓ Binder
Framework：BluetoothService（系统服务）
  ↓
Bluetooth 协议栈（bluetooth stack，native）
  ├── HCI（Host Controller Interface）
  ├── L2CAP（逻辑链路）
  ├── GATT（属性协议）
  ├── A2DP（音频分发）
  └── GAP（通用访问）
  ↓
HAL：Bluetooth HAL（vendor 实现）
  ↓
控制器（Controller，固件）
```

## 2. BluetoothService

### 2.1 服务职责

```text
BluetoothService 核心职责：
① 开关蓝牙（状态机）
② 设备发现与配对管理
③ 连接管理与 profile 服务
④ 权限控制与回调分发
⑤ GATT 服务注册（本地服务）
⑥ 与协议栈双向通信（Binder → native）
```

### 2.2 权限

```text
蓝牙权限演进：
- Android 12 前：BLUETOOTH / BLUETOOTH_ADMIN
- Android 12+：BLUETOOTH_CONNECT / BLUETOOTH_SCAN / BLUETOOTH_ADVERTISE
- 扫描还可能需要定位权限（Android 11-）
- Android 12+ 扫描不再强制定位（受 Nearby devices 影响）

运行时权限：BLUETOOTH_SCAN / BLUETOOTH_CONNECT
```

## 3. 发现与配对

### 3.1 发现流程

```text
发现流程：
BluetoothAdapter.startDiscovery()
→ 服务下发 inquiry 扫描
→ 协议栈扫描周边设备
→ 结果回调（onDeviceFound）

发现限制：
- 需 BLUETOOTH_SCAN 权限
- 系统限制发现时长（约 12 秒）
- 后台受限
```

### 3.2 配对流程

```text
配对（Bonding）流程：
发起配对 → 能力协商（IO 能力）
→ 密钥生成（Just Works / PIN / Passkey）
→ 交换密钥（SSP：Secure Simple Pairing）
→ 建立信任关系（bonded）

配对方式：
- Just Works：无输入（耳机）
- Passkey：六位数字确认
- PIN：输入 PIN（旧设备）
- OOB：NFC 快速配对

注意：配对 ≠ 连接；配对是建立信任，连接是建立链路
```

## 4. GATT 与 BLE

### 4.1 GATT 模型

```text
BLE（低功耗蓝牙）基于 GATT：

结构层级：
Profile（应用）
  → Service（服务，UUID）
    → Characteristic（特征，UUID）
      → Descriptor（描述符）
        → Value（值）

角色：
- Central（中心）：扫描/连接（手机）
- Peripheral（外围）：广播/被连接（设备）
- Server（服务端）：提供数据
- Client（客户端）：读写数据
```

### 4.2 连接与通信

```java
// 客户端连接
BluetoothGatt gatt = device.connectGatt(context, false, gattCallback);

// 回调中操作
@Override
public void onConnectionStateChange(BluetoothGatt gatt, int status, int newState) {
    if (newState == BluetoothProfile.STATE_CONNECTED) {
        gatt.discoverServices(); // 发现服务
    }
}

@Override
public void onServicesDiscovered(BluetoothGatt gatt, int status) {
    BluetoothGattService service = gatt.getService(UUID.fromString("..."));
    BluetoothGattCharacteristic ch = service.getCharacteristic(UUID.fromString("..."));
    gatt.readCharacteristic(ch); // 读
    gatt.setCharacteristicNotification(ch, true); // 订阅通知
    ch.setValue(new byte[]{...});
    gatt.writeCharacteristic(ch); // 写
}
```

```text
注意：
- 所有 GATT 操作串行执行（同一时刻一个）
- 大量操作需排队
- Android 8+ 支持并发多连接
- 连接数量有限制（约 7-10 个 BLE）
```

## 5. 经典蓝牙 Profile

| Profile | 用途 |
|---------|------|
| A2DP | 音频播放（耳机） |
| HFP | 免提通话 |
| AVRCP | 媒体控制 |
| HID | 键盘/鼠标/手柄 |
| PAN | 网络共享 |
| SPP | 串口透传（已废弃） |

```text
音频蓝牙链路：
应用 → AudioFlinger → A2DP 协议栈 → HCI → 耳机

SPP 在新版本受限，推荐 BLE GATT 替代
```

## 6. 常见问题排查

```text
蓝牙问题排查：
① 扫描不到设备：
   - 权限（BLUETOOTH_SCAN）
   - 设备未广播/已连接
   - 发现窗口过期
② 配对失败：
   - 密钥不匹配
   - 设备端限制
③ 连接失败/频繁断开：
   - 距离/干扰
   - 设备支持连接数上限
   - 省电策略
④ GATT 操作超时：
   - 队列串行未及时处理
   - 信号弱导致 MTU 协商失败

工具：
dumpsys bluetooth_manager
logcat（bluetooth 标签）
```

## 7. 高频面试题

**Q1：Android 蓝牙架构分层？**
A：应用（BluetoothAdapter）→ BluetoothService（Framework）→ 协议栈（native：HCI/L2CAP/GATT 等）→ HAL → 控制器固件。

**Q2：配对和连接的区别？**
A：配对（bonding）是建立信任、交换密钥；连接是建立数据链路。已配对设备可自动重连，但每次连接仍要走链路建立。

**Q3：GATT 是什么结构？**
A：Profile → Service（UUID）→ Characteristic（UUID）→ Descriptor → Value；Central/Peripheral + Client/Server 两种角色维度。

**Q4：GATT 操作要注意什么？**
A：串行执行、需要排队；读/写/通知/MTU 协商不能并发；连接数有限，注意信号强度。

**Q5：Android 12 蓝牙权限有哪些？**
A：BLUETOOTH_SCAN（扫描）、BLUETOOTH_CONNECT（连接）、BLUETOOTH_ADVERTISE（广播），运行时申请，取代旧的 BLUETOOTH/BLUETOOTH_ADMIN。

## 8. 小结

- 蓝牙四层：应用 / 服务 / 协议栈 / HAL。
- 配对是信任建立，连接是链路建立。
- BLE 用 GATT：Service/Characteristic 模型。
- GATT 操作串行，注意权限与限制。
- dumpsys bluetooth_manager 排查问题。
