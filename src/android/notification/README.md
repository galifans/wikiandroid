---
icon: bell
title: 通知机制
shortTitle: 概览
dir:
  text: 通知机制
  order: 10
---

# 通知机制

通知是应用与用户保持连接的重要渠道：消息提醒、播放控制、下载进度、后台任务状态都通过 Notification 呈现。从 Android 8.0 通知渠道到 13.0 通知权限，理解通知体系是做好"消息触达"的基础。

## 文章列表

- [通知机制详解：渠道、构建与样式](./notification-basics.md)
- [PendingIntent 详解](./pendingintent.md)

## 核心要点

1. **通知渠道（Channel）**：Android 8.0+ 必建渠道，用户可单独控制每个渠道的通知与声音
2. **通知权限**：Android 13+ 需动态申请 `POST_NOTIFICATIONS`
3. **构建方式**：`NotificationCompat.Builder` + 渠道 + 样式（BigText/Inbox/Progress）
4. **PendingIntent**：通知点击、桌面小部件等"延迟执行"的意图包装
5. **前台服务通知**：后台任务必须配前台服务 + 常驻通知

## 关联阅读

- [Service 详解](/android/service/service-basics.md)：前台服务与常驻通知
- [权限系统](/android/permission/permission-basics.md)：通知权限申请
- [Intent 详解](/android/intent/intent-basics.md)：PendingIntent 的基础是 Intent
