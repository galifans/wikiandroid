---
icon: storage
title: 数据存储方案对比
description: SharedPreferences、DataStore、Room、文件、SQLite 五大存储方案对比与选型指南
---

# 数据存储方案对比

> 面试高频指数：高
> 数据存储选型是面试高频题，也是实际项目架构决策的关键。

## 1. 五大存储方案总览

五大存储方案的对比说明如下：

| 方案 | 数据类型 | 跨进程 | 异步支持 | 类型安全 | 适用场景 |
| --- | --- | --- | --- | --- | --- |
| SharedPreferences | 键值对 |  不推荐 | ✗（apply 为异步写） | ✗ | 简单配置（已逐渐被替代） |
| DataStore | 键值对/Proto |  | ✓（Flow） | ✓（Proto） | 配置类数据（推荐） |
| SQLite / Room | 结构化数据 |  需 ContentProvider | ✓ | ✓ | 大量结构化数据 |
| 文件（File） | 任意字节 | ✗ | ✓ | ✗ | 图片、日志、下载文件 |
| 网络存储（远程） | 任意 | ✓ | ✓ | - | 需要跨设备同步的数据 |

## 2. SharedPreferences 的问题

### 2.1 历史问题

SharedPreferences 的旧时代写法如下：

::: code-tabs

@tab:active Java

```java
// 旧时代写法
SharedPreferences sp = getSharedPreferences("config", Context.MODE_PRIVATE);
sp.edit().putString("name", "Tom").apply();   // 异步写
sp.edit().putString("name", "Tom").commit();  // 同步写（阻塞主线程）
```

@tab Kotlin

```kotlin
// 旧时代写法
val sp = getSharedPreferences("config", Context.MODE_PRIVATE)
sp.edit().putString("name", "Tom").apply()   // 异步写
sp.edit().putString("name", "Tom").commit()  // 同步写（阻塞主线程）
```

:::

存在的问题：

1. **`getXxx()` 会阻塞主线程**：首次访问会触发全量加载到内存。
2. **`apply()` 异步但无回调**：无法感知写入失败。
3. **进程内单例**：跨进程读不安全（`MODE_MULTI_PROCESS` 已废弃）。
4. **类型不安全**：`getString` 强转，key 写错不报编译错误。

### 2.2 官方态度

Android 官方已将其标记为 **legacy API**，推荐使用 DataStore 替代。

## 3. DataStore（推荐）

### 3.1 Preferences DataStore

Preferences DataStore 的核心实现如下：

::: code-tabs

@tab:active Java

```java
// 依赖
// implementation("androidx.datastore:datastore-preferences:1.1.1")

// Java 中通过 PreferenceDataStoreFactory 创建实例
private final DataStore<Preferences> dataStore =
        new PreferenceDataStoreFactory().create(
                CoroutineScope(Dispatchers.IO + SupervisorJob()),
                () -> new File(context.getFilesDir(), "settings.preferences_pb"));

class SettingsRepository {
    private final Context context;

    SettingsRepository(Context context) {
        this.context = context;
    }

    Flow<Integer> themeMode() {
        return dataStore.getData().map(prefs ->
                prefs.contains(Keys.THEME_MODE) ? prefs.get(Keys.THEME_MODE)
                        : THEME_MODE_SYSTEM);
    }

    void setThemeMode(int mode, CoroutineScope scope) {
        scope.launch(Dispatchers.IO) {
            dataStore.edit(prefs -> prefs.put(Keys.THEME_MODE, mode));
        }
    }

    private static class Keys {
        static final Preferences.Key<Integer> THEME_MODE =
                PreferencesKeys.intKey("theme_mode");
    }
}
```

@tab Kotlin

```kotlin
// 依赖
// implementation("androidx.datastore:datastore-preferences:1.1.1")

// 顶层扩展属性（Kotlin 推荐写法）
private val Context.dataStore by preferencesDataStore(name = "settings")

class SettingsRepository(private val context: Context) {

    val themeMode: Flow<Int> = context.dataStore.data.map { prefs ->
        prefs[Keys.THEME_MODE] ?: THEME_MODE_SYSTEM
    }

    suspend fun setThemeMode(mode: Int) {
        context.dataStore.edit { prefs ->
            prefs[Keys.THEME_MODE] = mode
        }
    }

    private object Keys {
        val THEME_MODE = intPreferencesKey("theme_mode")
    }
}
```

:::

### 3.2 Proto DataStore

需要定义 schema 并生成代码（类型安全）：

```protobuf
// user.proto
syntax = "proto3";
message UserPreferences {
    string name = 1;
    bool dark_mode = 2;
}
```

Proto DataStore 的读写实现如下：

::: code-tabs

@tab:active Java

```java
// 生成的类型直接读写（Java 中通过 DataStore<byte[]> + protobuf 解析）
Flow<UserPreferences> userPrefs = context.getUserDataStore().getData()
        .map(bytes -> parseFrom(bytes));

public void updateUser(UserPreferences newPrefs, CoroutineScope scope) {
    scope.launch(Dispatchers.IO) {
        context.getUserDataStore().updateData(current -> newPrefs);
    }
}
```

@tab Kotlin

```kotlin
// 生成的类型直接读写
val userPrefs: Flow<UserPreferences> = context.userDataStore.data
suspend fun updateUser(block: (UserPreferences) -> UserPreferences) {
    context.userDataStore.updateData(block)
}
```

:::

### 3.3 注意事项

- `data` 是 `Flow`，天然支持响应式。
- 读取失败会抛 `IOException`，需要自行处理或重试。
- **跨进程**：DataStore 自身保证单进程单实例，多进程使用有额外配置。

## 4. Room（结构化数据首选）

Room 的完整示例代码如下：

::: code-tabs

@tab:active Java

```java
// Room 的注解与抽象类在 Java 中同样适用
@Entity(tableName = "user")
public class User {
    @PrimaryKey
    public int id;
    public String name;
    public int age;
}

@Dao
public interface UserDao {
    @Query("SELECT * FROM user")
    Flow<List<User>> observeAll();   // 响应式查询

    @Insert
    void insert(User user);
}

@Database(entities = {User.class}, version = 1)
public abstract class AppDatabase extends RoomDatabase {
    public abstract UserDao userDao();
}

// 创建数据库
AppDatabase db = Room.databaseBuilder(context, AppDatabase.class, "app.db")
        .fallbackToDestructiveMigration()   // 慎用！开发期方便，上线需手写 Migration
        .build();
```

@tab Kotlin

```kotlin
@Entity(tableName = "user")
data class User(
    @PrimaryKey val id: Int,
    val name: String,
    val age: Int
)

@Dao
interface UserDao {
    @Query("SELECT * FROM user")
    fun observeAll(): Flow<List<User>>   // 响应式查询

    @Insert
    suspend fun insert(user: User)
}

@Database(entities = [User::class], version = 1)
abstract class AppDatabase : RoomDatabase() {
    abstract fun userDao(): UserDao
}

// 创建数据库
val db = Room.databaseBuilder(context, AppDatabase::class.java, "app.db")
    .fallbackToDestructiveMigration()   // 慎用！开发期方便，上线需手写 Migration
    .build()
```

:::

Room 优势：

- 编译期 SQL 校验。
- `Flow`/协程集成，支持响应式查询。
- 与 ViewModel + LiveData 完美搭配。
- 自动处理线程切换（suspend DAO 方法自动切 IO 线程）。

## 5. 文件存储

文件存储的示例代码如下：

::: code-tabs

@tab:active Java

```java
// 应用私有目录（无需权限）
File file = new File(context.getFilesDir(), "cache.json");
file.writeText(jsonString);

// 缓存目录（系统可能清理）
File cacheFile = new File(context.getCacheDir(), "temp.txt");

// 外部存储（Android 10+ 分区存储后需 MediaStore/SAF）
```

@tab Kotlin

```kotlin
// 应用私有目录（无需权限）
val file = File(context.filesDir, "cache.json")
file.writeText(jsonString)

// 缓存目录（系统可能清理）
val cacheFile = File(context.cacheDir, "temp.txt")

// 外部存储（Android 10+ 分区存储后需 MediaStore/SAF）
```

:::

各存储目录的用途与权限说明如下：

| 目录 | 用途 | 权限 |
| --- | --- | --- |
| `filesDir` | 长期私有文件 | 无 |
| `cacheDir` | 缓存（可被清理） | 无 |
| `externalFilesDir` | 外部私有目录 | 无（10+） |
| `getExternalStoragePublicDirectory` | 公共目录 | 需要（已废弃） |

## 6. 分区存储（Scoped Storage）对选型的影响

> Android 10+ 强制分区存储，直接影响文件与媒体存储方式，是面试常考点。

### 6.1 三个时代的文件访问

三个时代文件访问策略的对比说明如下：

| 版本 | 策略 | 说明 |
|------|------|------|
| ≤ Android 9 | 宽松 | 任意路径可读写（需权限） |
| Android 10 (API 29) | 分区存储（可退出） | `requestLegacyExternalStorage` 可临时关闭 |
| Android 11+ (API 30) | 分区存储（强制） | 不再提供退出开关 |

### 6.2 分区存储下的正确姿势

分区存储下的标准写法如下：

::: code-tabs

@tab:active Java

```java
// ① 应用私有目录：完全不受影响（无需权限）
File f = new File(context.getFilesDir(), "data.json");
writeText(f, json);

// ② 媒体文件（图片/视频/音频）：用 MediaStore，无需权限写入
ContentValues values = new ContentValues();
values.put(MediaStore.Images.Media.DISPLAY_NAME, "photo.jpg");
values.put(MediaStore.Images.Media.MIME_TYPE, "image/jpeg");
values.put(MediaStore.Images.Media.RELATIVE_PATH, "Pictures/MyApp");
Uri uri = contentResolver.insert(
        MediaStore.Images.Media.EXTERNAL_CONTENT_URI, values);

// ③ 任意公共目录文件：用 SAF（Storage Access Framework）
// ActivityResultContracts.OpenDocument / CreateDocument
```

@tab Kotlin

```kotlin
// ① 应用私有目录：完全不受影响（无需权限）
File(context.filesDir, "data.json").writeText(json)

// ② 媒体文件（图片/视频/音频）：用 MediaStore，无需权限写入
val values = ContentValues().apply {
    put(MediaStore.Images.Media.DISPLAY_NAME, "photo.jpg")
    put(MediaStore.Images.Media.MIME_TYPE, "image/jpeg")
    put(MediaStore.Images.Media.RELATIVE_PATH, "Pictures/MyApp")
}
val uri = contentResolver.insert(
    MediaStore.Images.Media.EXTERNAL_CONTENT_URI, values
)

// ③ 任意公共目录文件：用 SAF（Storage Access Framework）
// ActivityResultContracts.OpenDocument / CreateDocument
```

:::

**对选型的影响**：
- 过去"直接写 `/sdcard/xxx` 路径"的方案全部失效，必须走 MediaStore 或 SAF。
- `getExternalStoragePublicDirectory` 已废弃，公共目录必须通过 MediaStore/SAF 访问。
- 应用私有目录（`filesDir`/`externalFilesDir`）策略不变，仍是推荐存储位置。

## 7. 选型决策树

```text
数据是否需要跨设备/跨用户？
 ├─ 是 → 云存储（Firebase/自建服务）
 └─ 否 → 数据量大小？
      ├─ 小（配置、标记位） → DataStore
      ├─ 中（结构化列表） → Room
      ├─ 大（图片、视频） → 文件系统 + MediaStore
      └─ 需要被其他应用访问 → ContentProvider 封装
```

## 8. 高频面试题

**Q1：SharedPreferences 与 DataStore 的区别？**
A：① DataStore 基于 Flow，天然异步+响应式；SP 的 get 会阻塞主线程。② DataStore
保证事务一致性（写入失败可重试），SP 的 apply 失败无感知。③ DataStore 支持 Proto
类型安全，SP 无类型安全。④ SP 跨进程不安全，DataStore 单进程单实例。

**Q2：为什么 SP 的 getXxx() 会卡主线程？**
A：SP 首次访问时会把整个 XML 文件解析进内存（约几 KB ~ 几十 KB），解析发生在调用线程；
如果文件大或 I/O 慢，主线程会明显卡顿。

**Q3：Room 相比原生 SQLite 的优势？**
A：编译期 SQL 校验（写错 SQL 直接编译失败）；自动化样板代码；协程/LiveData/Flow 集成；
Migration 机制管理版本升级；线程安全（自动处理）。

**Q4：Room 的 fallbackToDestructiveMigration 能用于生产吗？**
A：不能。它会删除旧表重建，导致用户数据丢失。生产环境必须手写 Migration：
`Room.databaseBuilder(...).addMigrations(MIGRATION_1_2).build()`。

**Q5：什么时候该用文件存储而不是数据库？**
A：数据本身是"文件"性质（图片、视频、日志、缓存 JSON），不需要结构化查询；
数据库适合需要条件查询、关联、事务的数据。

**Q6：Android 11 上还能直接写公共目录吗？**
A：不能。分区存储强制生效，公共目录必须通过 MediaStore（媒体文件）或
SAF（任意文件）写入；应用私有目录不受影响。

**Q7：为什么 MediaStore 插入媒体不需要权限？**
A：MediaStore 插入走系统 ContentProvider，系统代为管理文件；但**读取**其他应用
创建的媒体仍需 READ_MEDIA_IMAGES/VIDEO/AUDIO 权限（Android 13+ 细分）。

**Q8：DataStore 与 SharedPreferences 能共存吗？**
A：可以，但不建议长期共存。官方提供 `SharedPreferencesMigration` 一次性迁移，
迁移完成后删除 SP 文件，避免双份数据不一致。

## 9. 小结

- 简单配置 → DataStore；结构化数据 → Room；大文件 → 文件系统。
- SP 是历史遗留，新项目直接 DataStore。
- 核心考察点：异步性、类型安全、跨进程能力、生命周期集成。
- 分区存储（Android 10+）改变了文件访问方式：私有目录不受影响，公共目录走 MediaStore/SAF。
