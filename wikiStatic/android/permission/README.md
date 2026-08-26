---
icon: shield
title: 权限系统
shortTitle: 概览
dir:
  text: 权限系统
  order: 9
---

# 权限系统

Android 权限机制是"沙箱 + 授权"模型：应用默认隔离，访问敏感能力（相机、定位、联系人）必须申请权限。从 Android 6.0 运行时权限到 Android 11+ 的单次授权，理解权限体系是安全合规开发的必修课。

## 文章列表

- [权限机制与运行时权限详解](./permission-basics.md)
- [权限申请最佳实践与常见问题](./permission-practice.md)

## 核心要点

1. **权限分级**：normal（安装即授）/ dangerous（运行时申请）/ signature（同签名才可）
2. **权限组**：同一组的权限同授同拒（Android 11 起按权限精确控制）
3. **申请流程**：`requestPermissions` → 回调 → 处理拒绝/不再询问/永久拒绝
4. **版本演进**：6.0 运行时权限、10 分区存储、11 单次授权、13 细粒度媒体权限、14 部分照片权限
5. **特殊权限**：悬浮窗、通知、无障碍等需跳设置页手动开启

## 关联阅读

- [Manifest 清单文件详解](/android/app/manifest-guide.md)：权限在清单中的声明
- [通知机制详解](/android/notification/notification-basics.md)：通知权限（Android 13+）
- [ContentProvider 详解](/android/content-provider/content-provider-basics.md)：数据访问权限控制
