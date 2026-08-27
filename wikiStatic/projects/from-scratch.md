---
icon: rocket
title: 从零搭建完整 App
---

# 从零搭建一个完整的 App

> 手把手带你从空项目搭建一个生产级架构的 App（资讯类），完整走一遍工程化流程。

## 一、项目规划

**需求**：资讯 App（首页列表、详情、收藏、搜索）

**技术栈**：Kotlin + Jetpack Compose + MVVM + Hilt + Room + Retrofit + Paging

## 二、工程搭建

### 1. 初始化项目

```
Android Studio → New Project → Empty Activity（Compose）
包名：com.example.news
```

### 2. 依赖管理（Version Catalog）

```toml
# gradle/libs.versions.toml
[versions]
kotlin = "2.0.0"
compose = "1.7.0"
hilt = "2.51.1"

[libraries]
androidx-core-ktx = { group = "androidx.core", name = "core-ktx", version.ref = "coreKtx" }
```

### 3. 模块划分

```
:app（壳工程 + 页面）
:core:network（网络层）
:core:database（数据层）
:feature:home（首页业务）
:feature:detail（详情业务）
```

## 三、架构落地

### 数据层（Data Layer）

数据层仓库接口与实现的核心代码如下：

::: code-tabs

@tab:active Java

```java
interface NewsRepository {
    Flowable<List<News>> getNewsList(int page);
}

class NewsRepositoryImpl implements NewsRepository {
    private final NewsApi api;
    private final NewsDao dao;

    public NewsRepositoryImpl(NewsApi api, NewsDao dao) {
        this.api = api;
        this.dao = dao;
    }

    @Override
    public Flowable<List<News>> getNewsList(int page) {
        return Flowable.defer(() -> {
            // 网络获取
            List<News> remote = api.getNews(page);
            // 缓存入库
            dao.insertAll(remote);
            return Flowable.just(remote);
        }).subscribeOn(Schedulers.io());   // 等价 flowOn(Dispatchers.IO)
    }
}
```

@tab Kotlin

```kotlin
interface NewsRepository {
    fun getNewsList(page: Int): Flow<List<News>>
}

class NewsRepositoryImpl(
    private val api: NewsApi,
    private val dao: NewsDao
) : NewsRepository {
    override fun getNewsList(page: Int): Flow<List<News>> =
        flow {
            // 网络获取
            val remote = api.getNews(page)
            // 缓存入库
            dao.insertAll(remote)
            emit(remote)
        }.flowOn(Dispatchers.IO)
}
```

:::

### UI 层（Compose + ViewModel）

UI 层 ViewModel 的核心实现如下：

::: code-tabs

@tab:active Java

```java
@HiltViewModel
public class HomeViewModel extends ViewModel {
    private final NewsRepository repository;
    private final MutableLiveData<HomeUiState> _uiState =
            new MutableLiveData<>(HomeUiState.Loading);

    // 对外暴露不可变 LiveData(等价 StateFlow + stateIn 的只读视图)
    public LiveData<HomeUiState> uiState = _uiState;

    @Inject
    public HomeViewModel(NewsRepository repository) {
        this.repository = repository;
        // 等价 stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), Loading)
        // LiveData 无 WhileSubscribed 语义,此处以常驻订阅模拟
        repository.getNewsList(1)
                .map(list -> new HomeUiState.Success(list))
                .subscribe(_uiState::setValue);
    }
}
```

@tab Kotlin

```kotlin
@HiltViewModel
class HomeViewModel @Inject constructor(
    private val repository: NewsRepository
) : ViewModel() {
    val uiState: StateFlow<HomeUiState> = repository.getNewsList(1)
        .map { HomeUiState.Success(it) }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), HomeUiState.Loading)
}
```

:::

## 四、工程实践

- **Git**：初始化仓库、约定式提交
- **CI**：GitHub Actions 自动构建
- **测试**：Repository 单元测试 + 关键页面 UI 测试
- **多渠道**：debug / release 变体配置

## 五、进阶方向

- 加入 Paging 3 分页
- 离线缓存策略（网络优先 / 缓存优先）
- 性能优化（列表性能、启动优化）
- 数据埋点与崩溃监控

> 配套知识：[架构设计](/advanced/architecture/) | [组件化](/advanced/modular/) | [CI/CD](/engineering/cicd/)
