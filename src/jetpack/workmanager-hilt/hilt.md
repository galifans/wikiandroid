---
icon: hilt
title: Hilt 依赖注入详解
description: Hilt 注解体系、作用域、模块定义、与 Dagger 关系、ViewModel 注入实战
---

# Hilt 依赖注入详解

> 面试高频指数：高
> 依赖注入（DI）是大型项目标配，Hilt 是 Android 官方 DI 框架。

## 1. 为什么需要依赖注入

```kotlin
// ✗ 手动创建依赖：耦合、难测试
class UserViewModel {
    private val api = ApiService(OkHttpClient())   // 硬编码依赖
    private val dao = UserDao(AppDatabase.getInstance(this))
}
```

问题：

- 依赖创建逻辑分散，难以替换（如测试 Mock）。
- 生命周期管理混乱（单例 vs 每次新建）。
- 代码难维护、难测试。

**DI 方案**：依赖的创建由容器统一管理，使用时注入。

## 2. Hilt 与 Dagger 的关系

- **Dagger**：Google 的编译期 DI 框架（Java/Kotlin），功能强大但配置繁琐。
- **Hilt**：基于 Dagger 的 **Android 专用封装**，自动生成大量样板代码。
- **原理相同**：都是**编译期代码生成**（APT/KSP），无运行时反射，性能零损耗。

```text
@Inject / @Module / @Component
        │ 编译期
        ▼
Dagger 生成 DaggerXxxComponent（手写 DI 代码）
        │
Hilt 自动集成 Android 组件生命周期
```

## 3. 基础用法

### 3.1 开启 Hilt

```kotlin
@HiltAndroidApp
class MyApplication : Application()
```

### 3.2 注入 Activity/Fragment

```kotlin
@AndroidEntryPoint
class MainActivity : AppCompatActivity() {

    @Inject lateinit var repository: UserRepository   // 字段注入

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // repository 已可用
    }
}
```

### 3.3 构造注入

```kotlin
// 依赖可构造时，直接 @Inject 构造
class UserRepository @Inject constructor(
    private val api: ApiService
)
```

## 4. Module 与 Provides

当依赖需要配置（第三方库、接口实现）时用 Module：

```kotlin
@Module
@InstallIn(SingletonComponent::class)   // 安装位置
object NetworkModule {

    // OkHttpClient 单例
    @Provides
    @Singleton
    fun provideOkHttpClient(): OkHttpClient =
        OkHttpClient.Builder()
            .connectTimeout(10, TimeUnit.SECONDS)
            .build()

    // Retrofit 接口
    @Provides
    @Singleton
    fun provideApiService(client: OkHttpClient): ApiService =
        Retrofit.Builder()
            .baseUrl("https://api.example.com/")
            .client(client)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(ApiService::class.java)
}

@Module
@InstallIn(SingletonComponent::class)
abstract class RepositoryModule {

    // 接口绑定（抽象）
    @Binds
    @Singleton
    abstract fun bindUserRepository(impl: UserRepositoryImpl): UserRepository
}
```

## 5. 作用域（Scope）

| 作用域 | 存活时间 | 安装位置 |
| --- | --- | --- |
| `@Singleton` | Application 生命周期 | SingletonComponent |
| `@ActivityScoped` | Activity 生命周期 | ActivityComponent |
| `@FragmentScoped` | Fragment 生命周期 | FragmentComponent |
| `@ViewModelScoped` | ViewModel 生命周期 | ViewModelComponent |
| `@ServiceScoped` | Service 生命周期 | ServiceComponent |

```kotlin
@ActivityScoped
class SessionManager @Inject constructor() { ... }
```

> **注意**：作用域必须与安装组件匹配（`@ActivityScoped` 不能放在 SingletonComponent 的 Module 中）。

## 6. ViewModel 注入

```kotlin
@HiltViewModel
class UserListViewModel @Inject constructor(
    private val repository: UserRepository
) : ViewModel() {

    val users: StateFlow<List<User>> = repository.observeUsers()
}

// 使用
@AndroidEntryPoint
class UserListFragment : Fragment() {

    private val viewModel: UserListViewModel by viewModels()   // Hilt 自动创建
}
```

## 7. 测试支持

```kotlin
// 替换测试模块
@Module
@TestInstallIn(
    components = [SingletonComponent::class],
    replaces = [NetworkModule::class]
)
object FakeNetworkModule {

    @Provides
    @Singleton
    fun provideApiService(): ApiService = FakeApiService()
}

// 或手动构造
@HiltAndroidTest
class UserRepositoryTest {

    @get:Rule
    val hiltRule = HiltAndroidRule(this)

    @Before
    fun setUp() {
        hiltRule.inject()
    }
}
```

## 8. 高频面试题

**Q1：Hilt 和 Dagger 的区别？**
A：Hilt 是 Dagger 的 Android 封装：① 自动生成 Component，无需手写；
② 提供 `@AndroidEntryPoint` 等组件注入；③ 自动集成 Jetpack（ViewModel、WorkManager）；
④ 提供测试支持（`@TestInstallIn`）。底层原理相同（编译期代码生成）。

**Q2：@Provides 和 @Binds 的区别？**
A：`@Provides`：在方法中**创建**实例（可自定义逻辑、配置第三方库）；
`@Binds`：**绑定**接口到实现（实现类本身有 `@Inject` 构造），要求方法为抽象且只有一个参数。

**Q3：Hilt 是怎么在编译期生成代码的？**
A：通过 **APT/KSP** 处理注解：解析 `@HiltAndroidApp` 生成 `Hilt_MyApplication`，
解析 `@AndroidEntryPoint` 生成 `Hilt_MainActivity`（重写 `onCreate`，先调用
`inject()` 注入字段再执行子类逻辑），解析 Module 生成 Dagger Component 实现。

**Q4：什么时候不该用 Hilt？**
A：① 极小型项目（引入成本大于收益）；② 大量动态创建的对象（作用域难管理）；
③ 反射强依赖场景（Hilt 是编译期静态的）。合理评估后再引入。

**Q5：@ViewModelScoped 和 @Singleton 的区别？**
A：`@ViewModelScoped` 的实例随 ViewModel 销毁（如每屏一个的缓存）；
`@Singleton` 全局唯一（如 Retrofit、数据库）。用错作用域会导致内存泄漏或状态错乱。

## 9. 小结

- Hilt = Dagger + Android 集成，编译期代码生成，无反射损耗。
- 核心注解：`@HiltAndroidApp`、`@AndroidEntryPoint`、`@Inject`、`@Module`、`@Provides`、`@Binds`。
- 作用域决定生命周期，ViewModel 注入用 `@HiltViewModel`。
- 面试重点：与 Dagger 关系、编译期生成原理、作用域选择。
