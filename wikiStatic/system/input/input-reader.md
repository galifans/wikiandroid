---
icon: input
title: InputReader 事件读取与加工
description: EventHub、RawEvent、触摸去抖、坐标换算、按键映射、设备配置
---

# InputReader 事件读取与加工

> 面试高频指数：低
> InputReader 是输入管线的第一站：把内核的原始事件转换成应用可理解的语义事件。理解它才能解释"为什么坐标会变""按键映射从哪来"。

## 1. InputReader 定位

```text
InputReader（native 线程，loopOnce 循环）
位于 system_server 进程内

职责：
① 从 EventHub 轮询事件
② 按设备类型加工成语义事件
③ 上报给 InputDispatcher

输入设备抽象：
- TouchInputMapper（触摸屏）
- KeyboardInputMapper（键盘/按键）
- CursorInputMapper（鼠标/轨迹球）
- JoystickInputMapper（手柄）
```

## 2. EventHub 详解

### 2.1 设备扫描

```text
EventHub 初始化：
- 扫描 /dev/input/ 下所有 eventX 设备
- 打开设备文件（open）
- 读取设备能力（ioctl）：
  EVIOCGBIT：支持的事件类型
  EVIOCGABS：触摸绝对坐标范围
  EVIOCGKEY：按键位图
- 注册设备监听（uevent 热插拔）

设备变更：
- 插入/拔出 → uevent 通知 → 重新扫描
- 配置加载：idc / kl / kcm 文件
```

### 2.2 事件读取

```text
核心读取流程：
EventHub::getEvents
- poll 等待设备可读
- read 读取 input_event（24 字节结构）
- 组装 RawEvent

struct input_event {
  timeval time;      // 时间戳
  uint16 type;       // 类型（EV_KEY/EV_ABS...）
  uint16 code;       // 键码/轴码
  int32  value;      // 值
};
```

## 3. 触摸事件加工

### 3.1 触点聚合

```text
触摸屏原始事件是"轴事件"流：
ABS_MT_POSITION_X / ABS_MT_POSITION_Y / ABS_MT_SLOT ...

TouchInputMapper 加工：
- 按 slot 聚合触点（多指）
- 维护 PointerCoords（坐标/压力/尺寸）
- 生成 MotionEvent（ACTION_DOWN/MOVE/UP）
- 坐标按屏幕尺寸归一化

坐标换算：
原始坐标 * 屏幕分辨率 / 触摸面板分辨率
（依赖 EVIOCGABS 上报的 min/max）
```

### 3.2 防抖与边缘处理

| 处理 | 说明 |
|------|------|
| 抖动过滤 | 微小位移忽略（防手指抖动） |
| 边缘抑制 | 屏幕边缘滑动忽略 |
| 双击检测 | GestureDetector 之前由系统预处理 |
| 悬停识别 | 支持 hover 的设备 |

## 4. 按键事件加工

### 4.1 键位映射

```text
按键链路：
内核 keycode（scancode）
→ 键位映射表（.kl 文件）
→ Android Keycode（KEYCODE_A 等）
→ 字符映射（.kcm 文件）
→ 字符/组合键语义

示例（.kl 文件）：
key 158 BACK
key 102 HOME
key 217 SEARCH
```

### 4.2 长按与组合

```text
KeyboardInputMapper 加工：
- 按下/抬起 → KeyEvent（ACTION_DOWN/UP）
- 长按检测（longPressTimeout，约 500ms）
- 组合键（Shift/Alt/Ctrl）
- 重复按键（repeat）
- 特殊：音量键、电源键、返回键

电源键/音量键等会被 InputDispatcher 转发给系统处理
```

## 5. 设备配置

```text
输入设备配置来源：
/vendor/usr/keylayout/（键位表 .kl）
/vendor/usr/keychars/（字符表 .kcm）
/vendor/usr/idc/（触摸配置 .idc）
/system/usr/...（系统默认）

配置作用：
- 键位映射
- 触摸参数（灵敏度、边缘）
- 设备名称与类型识别
```

## 6. 与 Dispatcher 的衔接

```text
InputReader 产出通知（NotifyArgs）：
- NotifyMotionArgs：触摸/轨迹事件
- NotifyKeyArgs：按键事件
- NotifySwitchArgs：开关（耳机/合盖）
- NotifyDeviceResetArgs：设备重置

通过 InputListenerInterface 通知
InputDispatcher（两个线程间用锁 + 队列同步）
```

## 7. 高频面试题

**Q1：InputReader 读取什么？产出什么？**
A：从 EventHub 读取内核 input_event（RawEvent），加工成语义化的 MotionEvent/KeyEvent 通知（NotifyArgs）交给 InputDispatcher。

**Q2：触摸坐标是怎么换算的？**
A：设备通过 EVIOCGABS 上报触摸面板的 min/max，系统按面板分辨率与屏幕分辨率的比例归一化坐标。

**Q3：按键 KeyCode 从哪来？**
A：内核扫描码（scancode）经 .kl 键位映射文件转成 Android Keycode，再经 .kcm 转成字符语义。

**Q4：InputReader 如何知道设备插拔？**
A：EventHub 监听 uevent（内核热插拔通知），事件到来时重新扫描 /dev/input 并加载设备配置。

**Q5：为什么多点触控要分 slot？**
A：内核 MT 协议用 slot 区分触点，一个 slot 对应一个手指，InputReader 按 slot 聚合坐标/压力，避免多点混淆。

## 8. 小结

- EventHub 扫描设备、读取内核事件。
- TouchInputMapper 聚合触点、换算坐标、防抖。
- KeyboardInputMapper 做键位映射与长按检测。
- 设备配置来自 .kl/.kcm/.idc 文件。
- 产出的 NotifyArgs 交给 InputDispatcher 分发。
