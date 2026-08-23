---
icon: architecture
title: 数据层设计：Repository 模式
description: Repository 模式原理、单一数据源、缓存策略、网络与本地数据结合、Flow 数据流
---

# 🏗️ 数据层设计：Repository 模式

> 面试高频指数：⭐⭐⭐⭐
> Repository 是官方推荐架构的核心，数据层的"门面"。

## 1. 什么是 Repository

```text
Repository（仓库）：数据层的统一入口

职责：
- 屏蔽数据来源（网络 / 数据库 / 缓存 / 文件）
- 提供单一数据源（Single Source of Truth）
- 封装数据获取策略（缓存优先 / 网络优先）
- 让上层（ViewModel）不感知数据细节
```

```text
ViewModel → Repository（接口）→ Remote / Local
                    ↑
              （实现 + 策略）
```

## 2. 为什么需要 Repository

```text
① 解耦：UI 不关心数据来自网络还是本地
② 复用：多个页面共享同一数据获取逻辑
③ 可测：mock Repository 即可测试 ViewModel
④ 缓存：统一管理缓存策略（减少网络请求）
⑤ 演进：更换数据源（改后端 / 加缓存）不影响 UI
```

## 3. 基础实现

```kotlin
// 接口（Domain 层定义）
interface UserRepository {
    suspend fun getUser(userId: String): Result<User>
    suspend fun getFollowers(userId: String, page: Int): Result<List<User>>
}

// 实现（Data 层）
class UserRepositoryImpl(
    private val api: UserApi,
    private val dao: UserDao,
    private val prefs: SharedPreferences // 简单缓存
) : UserRepository {

    override suspend fun getUser(userId: String): Result<User> {
        return runCatching {
            // 策略：先缓存，后网络
            val cached = dao.getUser(userId)
            if (cached != null) return@runCatching cached

            val dto = api.getUser(userId)
            dao.insert(dto.toEntity())
            dto.toEntity()
        }
    }
}
```

## 4. 缓存策略设计

### 4.1 常见策略

| 策略 | 流程 | 适用 |
| --- | --- | --- |
| 缓存优先 | 有缓存先用，后台刷新 | 列表页（新闻/推荐） |
| 网络优先 | 先请求网络，失败用缓存 | 详情页（实时性要求高） |
| 仅网络 | 不缓存 | 表单提交/实时数据 |
| 缓存穿透 | 先缓存，过期才网络 | 配置类数据 |

### 4.2 缓存过期

```kotlin
class UserRepositoryImpl(...) : UserRepository {

    override suspend fun getUser(userId: String): Result<User> {
        val cached = dao.getUser(userId)
        val isExpired = cached != null &&
            System.currentTimeMillis() - cached.lastUpdate > CACHE_TTL

        return when {
            // 缓存有效 → 直接用
            cached != null && !isExpired -> Result.success(cached)
            // 缓存过期/无缓存 → 网络
            else -> runCatching {
                val user = api.getUser(userId).toEntity()
                dao.insert(user.copy(lastUpdate = System.currentTimeMillis()))
                user
            }.onFailure {
                // 网络失败但有过期缓存 → 降级返回
                cached?.let { return Result.success(it) }
            }
        }
    }
}
```

## 5. Flow 数据流（响应式）

```kotlin
// 数据层暴露 Flow：UI 自动订阅更新
interface NewsRepository {
    fun observeNews(): Flow<List<News>>      // 监听本地变化
    suspend fun refreshNews()                 // 手动刷新
}

class NewsRepositoryImpl(...) : NewsRepository {

    override fun observeNews(): Flow<List<News>> = dao.observeNews()

    override suspend fun refreshNews() {
        val news = api.getNews()
        dao.replaceAll(news.map { it.toEntity() }) // 更新本地 → Flow 自动发射
    }
}

// ViewModel 使用
class NewsViewModel(private val repo: NewsRepository) : ViewModel() {
    val news = repo.observeNews()
        .map { it.map { news -> news.toUiModel() } }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())
}
```

## 6. 多数据源结合（Remote + Local + Memory）

```kotlin
class UserRepositoryImpl(
    private val memoryCache: MemoryCache,  // 内存（最快）
    private val api: UserApi,              // 网络
    private val dao: UserDao               // 本地数据库
) : UserRepository {

    override suspend fun getUser(userId: String): Result<User> {
        // ① 内存缓存
        memoryCache.get(userId)?.let { return Result.success(it) }

        // ② 本地数据库
        dao.getUser(userId)?.let {
            memoryCache.put(userId, it)
            return Result.success(it)
        }

        // ③ 网络（兜底）
        return runCatching {
            api.getUser(userId).toEntity().also { user ->
                memoryCache.put(userId, user)
                dao.insert(user)
            }
        }
    }
}
```

## 7. 高频面试题

**Q1：Repository 模式解决什么问题？**
A：数据来源解耦 + 单一数据源。UI 不感知网络/本地差异；缓存策略集中；
数据获取逻辑复用；可 mock 测试。

**Q2：缓存策略怎么选？**
A：列表/资讯：缓存优先 + 后台刷新（秒开 + 新数据）；详情：网络优先 +
缓存兜底（离线可用）；强实时（余额/状态）：仅网络；静态配置：长 TTL 缓存。

**Q3：数据层用 Flow 还是 suspend？**
A：一次性查询用 suspend（返回 Result）；需要持续观察变化（数据库/状态）
用 Flow。两者结合：Flow 提供数据流，suspend 做刷新操作。

**Q4：Repository 和 ViewModel 的分工？**
A：Repository 管"数据怎么来"（来源、缓存、转换）；ViewModel 管"UI 状态
怎么变"（状态机、用户意图、页面逻辑）。ViewModel 不直接操作网络/数据库。

**Q5：多个 Repository 有共享逻辑怎么办？**
A：抽取公共逻辑到基础类（BaseRepository）或独立组件（如缓存模块）；
跨数据源组合用 UseCase；保持 Repository 职责单一。

## 8. 小结

- Repository = 数据层门面，屏蔽来源、统一入口。
- 单一数据源 + 缓存策略（缓存/网络优先级）。
- Flow + suspend 组合实现响应式数据流。
- 面试重点：为什么用、缓存策略、与 ViewModel 分工。
