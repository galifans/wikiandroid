---
icon: file-invoice
title: SharedPreferences 深度剖析
---

# SharedPreferences 深度剖析

> SharedPreferences 采用 key-value（键值对）形式，主要用于轻量级的数据存储，尤其适合保存应用的配置参数。不建议使用它存储大规模数据，可能会降低性能。

## 一、存储形式

SharedPreferences 采用 XML 文件格式保存数据，文件目录位于 `/data/data/<package name>/shared_prefs`：

```xml
<?xml version='1.0' encoding='utf-8' standalone='yes' ?>
<map>
   <string name="blog">https://github.com/JasonWu1111/Android-Review</string>
</map>
```

**模式限制：** 从 Android N 开始，不允许使用 `MODE_WORLD_READABLE` 和 `MODE_WORLD_WRITEABLE` 模式，否则抛出 `SecurityException`。`MODE_MULTI_PROCESS` 也是 Google 不推荐的方式，后续将不再支持。

当设置 `MODE_MULTI_PROCESS` 模式时，每次 `getSharedPreferences` 过程会检查 SP 文件上次修改时间和文件大小，一旦有修改则重新从磁盘加载文件。

## 二、三种获取方式

| 获取方式 | 文件名 | 说明 |
| --- | --- | --- |
| `Activity.getPreferences(mode)` | `xxxActivity.xml` | 以当前 Activity 的类名作为文件名 |
| `PreferenceManager.getDefaultSharedPreferences(Context)` | `packageName_preferences.xml` | 包名加 `_preferences`，以 `MODE_PRIVATE` 创建 |
| `Context.getSharedPreferences(name, mode)` | 自定义 name | 所有方法的最终入口 |

```java
public SharedPreferences getPreferences(int mode) {
    return getSharedPreferences(getLocalClassName(), mode);
}
```

`ContextImpl.getSharedPreferences` 内部用 `ArrayMap<String, File> mSharedPrefsPaths` 缓存文件，先从缓存查询，不存在则创建新文件。

## 三、整体架构

`SharedPreferences` 与 `Editor` 只是两个接口，`SharedPreferencesImpl` 和 `EditorImpl` 分别实现了对应接口，`ContextImpl` 记录着重要数据。

- `putXxx()`：把数据写入 `EditorImpl.mModified`；
- `apply()/commit()`：先调用 `commitToMemory()` 将数据同步到 `SharedPreferencesImpl.mMap`，并保存到 `MemoryCommitResult.mapToWriteToDisk`，再调用 `enqueueDiskWrite()` 写入磁盘；写入前先把原有数据保存到 `.bak` 后缀文件，用于写磁盘过程中出现异常时恢复数据；
- `getXxx()`：从 `SharedPreferencesImpl.mMap` 读取数据。

## 四、apply vs commit

| 对比项 | apply | commit |
| --- | --- | --- |
| 返回值 | 无返回值 | 有返回值，可知道是否提交成功 |
| 写入时机 | 修改提交到内存，再异步提交到磁盘 | 同步提交到磁盘 |
| 并发效率 | 原子更新到内存，后调用直接覆盖前面内存数据，效率高 | 多并发提交需等待前一个更新到磁盘才继续，效率低 |

## 五、使用注意事项

1. 不要在 SP 中存储特别大的 key/value，有助于减少卡顿 / ANR；
2. 不要高频使用 apply，尽可能地批量提交；
3. 不要使用 `MODE_MULTI_PROCESS`；
4. 高频写操作的 key 与高频读操作的 key 可以适当拆分文件，减少同步锁竞争；
5. 不要连续多次 `edit()`，应该获取一次 edit() 后多次执行 putXxx()，减少内存波动。
