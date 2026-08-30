---
icon: server
title: 应用存储与分区存储
description: 内部/外部存储、scoped storage、存储权限、MediaStore、SAF 文档访问
---

# 应用存储与分区存储

> 面试高频指数：中
> 应用数据怎么存、能访问哪些外部文件，由分区存储（Scoped Storage）严格界定。这是 Android 10+ 存储权限面试的核心。

## 1. 存储类型总览

```text
应用存储分类：

内部存储（私有）：
- getFilesDir() /data/data/<pkg>/files
- getCacheDir() 缓存（可被系统清除）
- 无需权限，仅本应用可访问

外部存储（共享）：
- getExternalFilesDir() /storage/emulated/0/Android/data/<pkg>/
- 媒体文件（MediaStore）
- 受分区存储与权限约束

特殊：
- getSharedPreferences（xml）
- getDatabasePath（数据库）
```

## 2. 内部存储

```text
内部存储特点：
- 路径：/data/data/<package>/...
- 应用私有，其他应用默认不可访问
- 卸载时清除
- 不占用户可见空间

适合：敏感配置、数据库、私有文件

注意：
- 内部存储空间有限（data 分区）
- 大文件建议外部存储
- getCacheDir 随时可能被系统回收
```

## 3. 外部存储演进

### 3.1 权限历史

```text
外部存储权限演进：
Android ≤ 8.0：WRITE_EXTERNAL_STORAGE 全局可写
Android 9：分区外部存储开始（媒体受限）
Android 10：Scoped Storage（分区存储）默认
Android 11+：强制分区存储，无法关闭

传统路径（/sdcard/xxx）：
- Android 10 需要请求存储权限
- Android 11+ 普通应用无法直接访问
```

### 3.2 分区存储规则

```text
Scoped Storage（分区存储）核心规则：
① 应用私有目录（Android/data）自由访问
② 媒体文件通过 MediaStore 访问
③ 其他应用文件不可直接访问
④ 公共媒体（图片/音频/视频）可贡献（不影响其他应用的）
⑤ 读公共媒体：
   - 图片/音频/视频：无需权限（Android 13+）
   - 其他类型：READ_EXTERNAL_STORAGE 或
     READ_MEDIA_* 细分权限（Android 13+）

Android 13+ 媒体权限拆分：
- READ_MEDIA_IMAGES（图片）
- READ_MEDIA_VIDEO（视频）
- READ_MEDIA_AUDIO（音频）
- READ_EXTERNAL_STORAGE 保留给非媒体（受限）
```

## 4. MediaStore 使用

```java
// 写入公共媒体
ContentValues values = new ContentValues();
values.put(MediaStore.Images.Media.DISPLAY_NAME, "photo.jpg");
values.put(MediaStore.Images.Media.MIME_TYPE, "image/jpeg");
values.put(MediaStore.Images.Media.RELATIVE_PATH, "Pictures/MyApp");
Uri uri = getContentResolver().insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, values);
try (OutputStream os = getContentResolver().openOutputStream(uri)) {
    // 写入图片数据
}

// 读取公共媒体
Cursor cursor = getContentResolver().query(
        MediaStore.Images.Media.EXTERNAL_CONTENT_URI,
        new String[]{MediaStore.Images.Media._ID, MediaStore.Images.Media.DATA},
        null, null, null);
```

```text
MediaStore 要点：
- 提供统一的媒体数据库索引
- insert 自动分配所有权
- RELATIVE_PATH 指定目录（Android 10+）
- IS_PENDING 标志（Android 10+ 原子写入）
- 删除他人媒体需用户确认
```

## 5. SAF 文档访问

### 5.1 Storage Access Framework

```text
SAF（Storage Access Framework）：
- 通过系统文件选择器访问任意文件
- ACTION_OPEN_DOCUMENT / ACTION_CREATE_DOCUMENT
- 获得 Uri 后可长期持访问权限（takePersistableUriPermission）
- 无需存储权限

适合：用户主动选择的文件操作
```

```java
// 打开文档
Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
intent.addCategory(Intent.CATEGORY_OPENABLE);
intent.setType("*/*");
startActivityForResult(intent, REQUEST_OPEN);

// 持久化权限
Uri uri = data.getData();
getContentResolver().takePersistableUriPermission(uri,
        Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
```

### 5.2 其他访问方式

| 方式 | 适用 | 权限 |
|------|------|------|
| MediaStore | 媒体文件 | 细分权限/无需 |
| SAF | 任意文档 | 用户授权 |
| 应用私有目录 | 自身数据 | 无 |
| MANAGE_EXTERNAL_STORAGE | 文件管理类 | 特殊申请 |

## 6. 存储适配建议

```text
适配清单：
① 自己产生的文件放 getExternalFilesDir（卸载清除）
② 媒体文件经 MediaStore 写入公共目录
③ 大文件/备份用 SAF 让用户选择
④ 缓存用 getCacheDir + 清理策略
⑤ Android 13 声明细分媒体权限
⑥ 不要依赖 /sdcard 绝对路径

常见坑：
- File 直接操作公共目录 → 权限异常
- 未处理 IS_PENDING → 媒体库看不见
- 持久化 Uri 权限未 take → 重启失效
```

## 7. 高频面试题

**Q1：内部存储和外部存储区别？**
A：内部私有（/data/data），无需权限仅本应用可访问，卸载清除；外部共享（/storage/emulated），受分区存储与权限约束。

**Q2：什么是 Scoped Storage？**
A：分区存储（Android 10+ 强制）：应用只能访问自身私有目录、经 MediaStore 访问媒体、经 SAF 访问用户授权文件。

**Q3：Android 13 媒体权限有哪些？**
A：READ_MEDIA_IMAGES / READ_MEDIA_VIDEO / READ_MEDIA_AUDIO 细分权限；读取公共媒体图片视频音频无需权限（仅贡献内容时）。

**Q4：怎么往公共相册写图片？**
A：用 MediaStore insert 到 EXTERNAL_CONTENT_URI，设置 RELATIVE_PATH 与 IS_PENDING，写完清除 IS_PENDING 标志。

**Q5：SAF 是什么？有什么好处？**
A：系统文件选择器，ACTION_OPEN_DOCUMENT 让用户选文件，获得 Uri 后可 takePersistableUriPermission 长期访问，无需存储权限。

## 8. 小结

- 内部私有存储无需权限，外部共享存储受分区存储约束。
- Scoped Storage：私有目录 + MediaStore + SAF 三通道。
- Android 13 细分媒体权限。
- MediaStore 用 RELATIVE_PATH 与 IS_PENDING。
- SAF 持久化授权适合用户主动选择的文件。
