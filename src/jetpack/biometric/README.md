---
icon: biometric
title: Biometric 生物识别
shortTitle: 概览
dir:
  text: Biometric 生物识别
  order: 8
---

# Biometric 生物识别

基于 androidx.biometric 的统一生物识别：指纹、人脸、虹膜，安全等级分级。

## 文章列表

- [BiometricPrompt 生物识别](biometric-guide.md) — BiometricManager / BiometricPrompt / CryptoObject / 安全等级

## 核心概念

1. **BiometricManager**：检测设备是否支持生物识别
2. **BiometricPrompt**：系统级认证对话框，无需自研 UI
3. **CryptoObject**：把认证与加密绑定，强认证场景
4. **安全等级**：强认证 / 弱认证，对应不同业务

## 学习资源

- [Android 权限机制](/android/permission/)
- [Android Service 机制](/android/service/)
