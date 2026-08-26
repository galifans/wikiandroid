---
icon: database
title: Room 数据库完全指南
description: Room 三要素、DAO 设计、Flow 响应式查询、Migration 升级、与原生 SQLite 对比
---

# Room 数据库完全指南

> 面试高频指数：极高
> Room 是 Android 官方 ORM，面试必问，实际项目几乎必用。

## 1. Room 是什么

**Room** 是 Jetpack 的 SQLite 抽象层，在 SQLite 之上提供：

- **编译期 SQL 校验**（写错 SQL 直接编译失败）。
- **协程/Flow 集成**（响应式查询）。
- **Migration 机制**（数据库升级管理）。
- **减少样板代码**（自动生成 DAO 实现）。

```text
Room ← 抽象层 → SQLite ← 存储
```

## 2. 三要素

### 2.1 @Entity（表）

```kotlin
@Entity(
    tableName = "user",
    indices = [Index(value = ["email"], unique = true)]  // 唯一索引
)
data class User(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val name: String,
    @ColumnInfo(name = "email") val email: String,   // 自定义列名
    val age: Int? = null                              // 可空列
)
```

关系表：

```kotlin
@Entity(
    tableName = "user_book",
    primaryKeys = ["userId", "bookId"],   // 联合主键
    foreignKeys = [
        ForeignKey(
            entity = User::class,
            parentColumns = ["id"],
            childColumns = ["userId"],
            onDelete = ForeignKey.CASCADE
        )
    ]
)
data class UserBook(val userId: Long, val bookId: Long)
```

### 2.2 @Dao（数据访问）

```kotlin
@Dao
interface UserDao {

    // 同步查询
    @Query("SELECT * FROM user")
    fun getAll(): List<User>

    // 响应式查询（数据变化自动推送）
    @Query("SELECT * FROM user")
    fun observeAll(): Flow<List<User>>

    // 条件查询
    @Query("SELECT * FROM user WHERE age >= :minAge ORDER BY age DESC")
    fun getByAge(minAge: Int): List<User>

    // 插入：冲突策略
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(user: User)

    @Update
    suspend fun update(user: User)

    @Delete
    suspend fun delete(user: User)

    // 自定义 SQL 更新
    @Query("UPDATE user SET name = :name WHERE id = :id")
    suspend fun rename(id: Long, name: String)
}
```

### 2.3 @Database（数据库）

```kotlin
@Database(
    entities = [User::class, Book::class],
    version = 2,                       // 当前版本
    exportSchema = true                // 导出 schema 用于迁移测试
)
abstract class AppDatabase : RoomDatabase() {

    abstract fun userDao(): UserDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getInstance(context: Context): AppDatabase =
            INSTANCE ?: synchronized(this) {
                INSTANCE ?: Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "app.db"
                )
                .addMigrations(MIGRATION_1_2)   // 注册迁移
                .build()
                    .also { INSTANCE = it }
            }

        // 数据库升级迁移
        val MIGRATION_1_2 = object : Migration(1, 2) {
            override fun migrate(db: SupportSQLiteDatabase) {
                db.execSQL(
                    "ALTER TABLE user ADD COLUMN avatar TEXT NOT NULL DEFAULT ''"
                )
            }
        }
    }
}
```

## 3. 响应式查询：Flow

Room 对 `Flow` 的支持是最大亮点：

```kotlin
// DAO 返回 Flow
@Query("SELECT * FROM user WHERE id = :id")
fun observeUser(id: Long): Flow<User?>

// ViewModel 中使用
class UserViewModel(private val dao: UserDao) : ViewModel() {
    val user: StateFlow<User?> = dao.observeUser(1L)
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = null
        )
}

// UI 观察
class UserFragment : Fragment() {
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        val vm: UserViewModel by viewModels()
        vm.user.observe(viewLifecycleOwner) { user ->
            // 任何表数据变化都会自动刷新
            binding.nameText.text = user?.name
        }
    }
}
```

> **原理**：Room 在查询时注册 `InvalidationTracker` 观察者，表数据变化时自动
> 重新查询并推送新结果（增量查询，性能优化）。

## 4. 复杂查询技巧

### 4.1 返回部分列（DTO）

```kotlin
data class UserName(val id: Long, val name: String)

@Query("SELECT id, name FROM user")
fun observeNames(): Flow<List<UserName>>
```

### 4.2 关联查询（JOIN）

```kotlin
data class UserWithBooks(
    @Embedded val user: User,
    @Relation(parentColumn = "id", entityColumn = "userId")
    val books: List<Book>
)

@Transaction
@Query("SELECT * FROM user")
fun observeUsersWithBooks(): Flow<List<UserWithBooks>>
```

### 4.3 原生查询

```kotlin
@RawQuery
fun search(statement: SupportSQLiteQuery): List<User>

// 调用
dao.search(SimpleSQLiteQuery("SELECT * FROM user WHERE name LIKE ?", arrayOf("%$kw%")))
```

## 5. Migration 与升级

### 5.1 为什么不能 fallbackToDestructiveMigration

- `fallbackToDestructiveMigration()` 在版本不匹配时**删表重建**，用户数据全部丢失。
- 生产环境必须手写 Migration。

### 5.2 迁移测试

```kotlin
@RunWith(AndroidJUnit4::class)
class MigrationTest {

    @Test
    fun migrate1To2() {
        val helper = MigrationTestHelper(
            InstrumentationRegistry.getInstrumentation(),
            AppDatabase::class.java
        )

        // 创建版本 1 的数据库并插入数据
        var db = helper.createDatabase(TEST_DB, 1).apply {
            execSQL("INSERT INTO user (name) VALUES ('Tom')")
        }

        // 执行迁移
        db = helper.runMigrationsAndValidate(
            TEST_DB, 2, true, AppDatabase.MIGRATION_1_2
        )

        // 验证数据仍在
        val users = db.query("SELECT * FROM user").use { cursor ->
            buildList {
                while (cursor.moveToNext()) add(cursor.getString(1))
            }
        }
        assertTrue(users.contains("Tom"))
    }
}
```

## 6. Room vs 原生 SQLite vs 其他 ORM

| 维度 | 原生 SQLite | Room | GreenDAO |
| --- | --- | --- | --- |
| SQL 校验 | 运行时 | **编译期** | 编译期 |
| 协程/Flow | 手写 | 内置 | 需扩展 |
| 迁移管理 | 手写 | Migration 机制 | 手写 |
| 学习成本 | 高 | 中 | 中 |
| 维护状态 | - | 官方维护 | 已停更 |

## 7. 高频面试题

**Q1：Room 的编译期校验是如何实现的？**
A：通过 **APT（Annotation Processing Tool）** 在编译期生成代码。`RoomProcessor`
解析 `@Entity/@Dao/@Database`，用 **SQLite 语法分析器**校验 SQL 语句，错误直接
编译失败，还生成 `UserDao_Impl`、`AppDatabase_Impl` 等实现类。

**Q2：Room 的 Flow 查询为什么能自动更新？**
A：`InvalidationTracker` 维护表级观察者。DAO 的 Flow 查询会注册 invalidate 监听；
任何增删改触发 `invalidate` 后，Room 在协程中重新执行查询并下发新结果。
（Room 2.4+ 做了增量优化，只重算受影响的行。）

**Q3：主线程能用 Room 吗？**
A：默认禁止（`IllegalStateException`），除非 `.allowMainThreadQueries()`（仅测试用）。
`suspend` DAO 方法会自动切到 `RoomDatabase.getQueryExecutor()`（IO 线程池）执行。

**Q4：如何设计数据库升级？**
A：① 新表：`CREATE TABLE`；② 加列：`ALTER TABLE ADD COLUMN`（需默认值）；
③ 改列/复杂变更：`CREATE 新表 → 拷贝数据 → DROP 旧表 → RENAME`；
④ 加 Migration 并注册；⑤ 写 MigrationTest 验证数据无损。

**Q5：@Transaction 什么时候用？**
A：需要保证原子性的多步操作（如"插入订单+更新库存"）、以及 @Relation 关联查询
（避免 N+1 查询）时使用。

## 8. 小结

- Room = Entity + DAO + Database，编译期校验 + Flow + Migration。
- 响应式查询靠 InvalidationTracker，升级靠 Migration 且必须写测试。
- 面试重点：APT 原理、InvalidationTracker、Migration 设计。
