---
icon: architecture
title: Clean Architecture 实践
description: 分层架构思想、依赖规则、Android 落地实践、UseCase、数据流设计与测试
---

# Clean Architecture 实践

> 面试高频指数：高
> Clean Architecture 是高级工程师的必修课，面试中常作为架构深挖点。

## 1. 核心思想

```text
分层 + 依赖规则（Dependency Rule）

依赖方向：外向内（UI → Domain → Data）
- 内层不依赖外层
- 外层依赖内层的抽象（接口）
- 核心业务逻辑（Domain）不依赖任何框架
```

## 2. 分层结构

```text
┌─────────────────────────────┐
│  Presentation（UI 层）       │  Activity/Fragment/Compose
│  ViewModel / State           │
├─────────────────────────────┤
│  Domain（领域层）            │  UseCase（用例）/ Entity
│  纯 Kotlin，不依赖 Android    │  业务规则核心
├─────────────────────────────┤
│  Data（数据层）              │  Repository 实现
│  Remote（网络）/ Local（DB）  │  Mapper（DTO ↔ Entity）
└─────────────────────────────┘
```

### 依赖规则

```text
Presentation → Domain ← Data
       ↓          ↑
   （实现接口）  （依赖抽象）

关键：
- Domain 只定义 Repository 接口（不依赖实现）
- Data 实现 Repository 接口
- UI 通过接口拿数据，不感知数据来源
```

## 3. Android 落地：分层代码

### 3.1 Domain 层（纯 Kotlin）

```kotlin
// 领域实体（不包含 Android 依赖）
data class User(
    val id: String,
    val name: String,
    val avatar: String
)

// 用例（每个业务动作一个 UseCase）
class GetUserUseCase(
    private val userRepository: UserRepository // 依赖抽象接口
) {
    suspend operator fun invoke(userId: String): Result<User> =
        userRepository.getUser(userId)
}
```

### 3.2 Data 层（实现接口 + Mapper）

```kotlin
// Repository 接口（Domain 定义）
interface UserRepository {
    suspend fun getUser(userId: String): Result<User>
    suspend fun getUsers(): Result<List<User>>
}

// 数据实现（Data 层）
class UserRepositoryImpl(
    private val api: UserApi,      // 网络
    private val dao: UserDao,      // 数据库
    private val mapper: UserMapper // DTO ↔ Entity 转换
) : UserRepository {

    override suspend fun getUser(userId: String): Result<User> {
        return runCatching {
            val dto = api.getUser(userId)       // 网络 DTO
            val entity = mapper.toEntity(dto)   // 转领域实体
            dao.insert(entity)                  // 本地缓存
            entity
        }
    }
}

// Mapper：数据格式转换
class UserMapper {
    fun toEntity(dto: UserDto): User =
        User(id = dto.id, name = dto.name, avatar = dto.avatarUrl)
}
```

### 3.3 Presentation 层（UI + ViewModel）

```kotlin
class UserViewModel(
    private val getUser: GetUserUseCase // 注入用例
) : ViewModel() {

    private val _state = MutableStateFlow<UserState>(UserState.Loading)
    val state: StateFlow<UserState> = _state.asStateFlow()

    fun load(userId: String) {
        viewModelScope.launch {
            _state.value = getUser(userId).fold(
                onSuccess = { UserState.Success(it) },
                onFailure = { UserState.Error(it.message ?: "加载失败") }
            )
        }
    }
}

sealed interface UserState {
    data object Loading : UserState
    data class Success(val user: User) : UserState
    data class Error(val msg: String) : UserState
}
```

## 4. 依赖注入

```kotlin
// 推荐用 Hilt（Google 官方 DI 框架）
@HiltViewModel
class UserViewModel @Inject constructor(
    private val getUser: GetUserUseCase
) : ViewModel()

@Module
@InstallIn(SingletonComponent::class)
object RepositoryModule {
    @Provides
    @Singleton
    fun provideUserRepository(api: UserApi, dao: UserDao): UserRepository =
        UserRepositoryImpl(api, dao, UserMapper())
}
```

## 5. 优缺点与适用场景

| 维度 | 说明 |
| --- | --- |
| 优点 | 业务独立、易测试（Domain 纯 Kotlin）、易替换实现 |
| 缺点 | 样板代码多、小项目过度设计、层级调用链长 |
| 适用 | 中大型项目、业务复杂、多人协作、需要长期演进 |
| 简化 | 小项目可省 Domain 层（MVVM + Repository 足够） |

## 6. 高频面试题

**Q1：Clean Architecture 的分层和依赖规则？**
A：Presentation / Domain / Data 三层，依赖方向从外向内。
Domain 定义接口，Data 实现接口，UI 依赖接口。内层不依赖外层（无 Android
框架依赖），业务核心独立可测试。

**Q2：UseCase 的作用？什么时候可以省略？**
A：封装单个业务动作（参数校验、组合多个 Repository、业务规则）。
简单 CRUD 时省略（直接用 Repository）；业务有组合/校验逻辑时保留。

**Q3：DTO、Entity、Model 的区别？**
A：DTO（数据传输对象）：网络/数据库格式；Entity（领域实体）：业务核心
对象；Model（UI 模型）：界面展示格式。通过 Mapper 转换，隔离数据源
变化对业务的影响。

**Q4：Clean Architecture 和 MVVM 冲突吗？**
A：不冲突。MVVM 是 UI 层内部的模式（Presentation 层），Clean Architecture
是整体分层。两者结合：MVVM 处理 UI 状态，Clean 保证依赖方向。

**Q5：如何测试 Clean Architecture？**
A：Domain 纯 Kotlin → JVM 单测（mock Repository）；Data 层 → 单元测试
（mock 网络/DB）+ 仪器测试；Presentation → ViewModel 单测（State 断言）
+ UI 测试（Compose UI Test）。

## 7. 小结

- 分层三件套：UI / Domain / Data，依赖向内。
- Domain 定义抽象，Data 实现，UI 消费。
- Mapper 隔离数据格式，Hilt 负责装配。
- 面试重点：分层图、依赖规则、为什么这么分。
