---
icon: lock
title: Keystore 与密钥管理
description: Android Keystore、硬件密钥、TEE/StrongBox、密钥用法与安全存储
---

# Keystore 与密钥管理

> 面试高频指数：中
> 密钥绝不能明文放在应用里。Android Keystore 把密钥交给系统（乃至安全硬件）保管，应用只"用"不"取"。指纹、支付、加密都依赖它。

## 1. Keystore 是什么

```text
Android Keystore：
系统级密钥存储与加密服务

特点：
① 密钥不可导出（防窃取）
② 支持硬件安全（TEE/StrongBox）
③ 支持使用约束（解锁才可用）
④ 支持非对称/对称/HMAC

用途：
- 数据加密（AES）
- 签名（RSA/EC）
- 指纹解锁凭据
- 支付与令牌
```

## 2. 架构与演进

### 2.1 版本演进

```text
演进：
- Android 4.x：软件 Keystore（较不安全）
- Android 6.0：硬件背书（TEE 支持）
- Android 9：StrongBox（独立安全芯片）
- Android 13+：Keymint（统一 HAL 接口）

Keymint：
- 替代 Keymaster
- 支持更现代算法（Ed25519 等）
- 更严格的密钥属性
```

### 2.2 安全层次

```text
密钥安全层次：
① 纯软件（Keystore 内）
② TEE 硬件（TrustZone）
③ StrongBox 独立芯片

安全性：软件 < TEE < StrongBox
成本/兼容性递增

选择：
- 一般加密 → TEE
- 支付/生物识别 → StrongBox
- 兼容性优先 → 软件兜底
```

## 3. 生成与使用

### 3.1 生成密钥

```java
KeyPairGenerator kpg = KeyPairGenerator.getInstance(
        KeyProperties.KEY_ALGORITHM_RSA, "AndroidKeyStore");
kpg.initialize(new KeyGenParameterSpec.Builder(
        "my_key_alias", KeyProperties.PURPOSE_SIGN | KeyProperties.PURPOSE_VERIFY)
        .setDigests(KeyProperties.DIGEST_SHA256)
        .setUserAuthenticationRequired(true)  // 需解锁/生物识别
        .setRandomizedEncryptionRequired(true)
        .setKeySize(2048)
        .build());
KeyPair keyPair = kpg.generateKeyPair();
// 私钥存于 Keystore，无法导出
```

### 3.2 签名与加密

```java
// 签名
Signature signature = Signature.getInstance("SHA256withRSA");
signature.initSign((PrivateKey) keyStore.getKey("my_key_alias", null));
signature.update(data);
byte[] signed = signature.sign();

// AES 加密
KeyGenerator kg = KeyGenerator.getInstance(
        KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore");
kg.init(new KeyGenParameterSpec.Builder("aes_key",
        KeyProperties.PURPOSE_ENCRYPT | KeyProperties.PURPOSE_DECRYPT)
        .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
        .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
        .build());
SecretKey key = kg.generateKey();
Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
cipher.init(Cipher.ENCRYPT_MODE, key);
byte[] encrypted = cipher.doFinal(plainText);
```

```text
关键点：
- 私钥/密钥永不离开 Keystore
- 应用只拿到 Key 引用（KeyStore.Entry）
- 加解密/签名在系统/HAL 内完成
- 密钥与 App 绑定（key attestation）
```

## 4. 使用约束

### 4.1 约束类型

| 约束 | 说明 |
|------|------|
| setUserAuthenticationRequired | 需解锁/生物识别 |
| setInvalidatedByBiometricEnrollment | 指纹变更使密钥失效 |
| setKeyValidityStart/End | 有效期 |
| setPurpose | 限定用途 |
| setMaxUsageCount | 使用次数限制 |

```text
生物识别约束：
- 解锁后可用（默认）
- 每次操作需验证（setUserAuthenticationRequired(true) + 参数）
- 指纹变化 → 密钥失效（防绕过）
```

### 4.2 密钥失效

```text
密钥失效场景：
- 设备锁屏密码更改（CE 密钥重新生成）
- 指纹/生物信息变更（invalidated）
- 有效期到期
- 应用卸载/数据清除

失效后：
- 旧密钥无法使用
- 需生成新密钥（数据需重新加密）
- 设计时要考虑密钥轮换
```

## 5. 密钥认证

### 5.1 Key Attestation

```text
密钥认证（Key Attestation，Android 8.0+）：
- 证明密钥确实存在于硬件安全环境
- 服务器端可验证
- 用于高风险场景（DRM/支付）

流程：
应用生成密钥时请求认证证书
→ 系统签发证书链（含密钥属性）
→ 服务器验证证书链与硬件

作用：
- 防模拟器/篡改设备
- 确认密钥安全级别
- 合规审计
```

## 6. 实践建议

```text
使用建议：
① 敏感数据用 Keystore 密钥加密
② 优先硬件密钥（TEE/StrongBox）
③ 私钥签名代替明文传输
④ 处理密钥失效（重新生成+迁移）
⑤ 不在代码中硬编码密钥
⑥ 网络传输用 TLS（Keystore 管证书）

常见误区：
- 把密钥放 assets/硬编码（可反编译）
- 自行实现加密算法（用标准库）
- 忽略密钥失效处理
```

## 7. 高频面试题

**Q1：Android Keystore 是什么？**
A：系统级密钥存储服务，密钥不可导出，支持 TEE/StrongBox 硬件保护，提供 AES/RSA/HMAC 等加密能力。

**Q2：为什么私钥不能导出？**
A：导出即失去保护意义（可被提取复制）。密钥在系统/安全硬件内完成加解密与签名，应用只引用不持有明文。

**Q3：TEE 和 StrongBox 区别？**
A：TEE 是处理器内的安全世界（TrustZone）；StrongBox 是独立安全芯片，更抗物理攻击，用于支付/指纹等高安全场景。

**Q4：setUserAuthenticationRequired 的作用？**
A：要求使用密钥前验证用户（解锁/生物识别），防止设备被盗后密钥被滥用；生物信息变更可使密钥失效。

**Q5：Key Attestation 是什么？**
A：密钥认证，向服务器证明密钥确实存储在硬件安全环境并符合属性声明，用于防篡改设备与高风险合规场景。

## 8. 小结

- Keystore 让密钥"只可用不可取"。
- 安全层次：软件 < TEE < StrongBox。
- 使用约束：解锁/生物/有效期/用途。
- 密钥失效需设计轮换与迁移。
- Key Attestation 提供硬件级可信证明。
