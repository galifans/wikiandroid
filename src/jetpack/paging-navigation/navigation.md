---
icon: navigation
title: Navigation 组件详解
description: NavHost、NavController、类型安全导航、返回栈管理、DeepLink 与实战
---

# 🧭 Navigation 组件详解

> 面试高频指数：⭐⭐⭐⭐
> Navigation 是官方推荐的导航方案，取代手写 FragmentManager 事务。

## 1. 为什么用 Navigation

传统 Fragment 导航的问题：

```kotlin
// ❌ 手写事务：样板代码多、易出错、返回栈难管理
supportFragmentManager.commit {
    add(R.id.container, DetailFragment(), "detail")
    addToBackStack("detail")
}
```

Navigation 解决：

- **单一数据源**：导航图（XML/Kotlin DSL）声明所有页面与跳转。
- **类型安全**：Compose Navigation 2.8+ 支持 `@Serializable` 路由。
- **自动管理返回栈**、深链（Deep Link）、动画。

## 2. 核心概念

### 2.1 导航图（NavGraph）

XML 方式：

```xml
<!-- res/navigation/nav_graph.xml -->
<navigation xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:id="@+id/nav_graph"
    app:startDestination="@id/homeFragment">

    <fragment
        android:id="@+id/homeFragment"
        android:name="com.example.HomeFragment"
        android:label="首页">
        <action
            android:id="@+id/action_home_to_detail"
            app:destination="@id/detailFragment" />
    </fragment>

    <fragment
        android:id="@+id/detailFragment"
        android:name="com.example.DetailFragment"
        android:label="详情">
        <argument
            android:name="userId"
            app:argType="integer" />
    </fragment>
</navigation>
```

### 2.2 宿主机与控制器

```xml
<!-- Fragment 方式 -->
<androidx.fragment.app.FragmentContainerView
    android:id="@+id/nav_host"
    android:name="androidx.navigation.fragment.NavHostFragment"
    app:defaultNavHost="true"
    app:navGraph="@navigation/nav_graph" />
```

```kotlin
// 获取控制器
val navController = (supportFragmentManager
    .findFragmentById(R.id.nav_host) as NavHostFragment).navController
```

## 3. 导航跳转

### 3.1 传统方式

```kotlin
// 跳转（带参数）
binding.button.setOnClickListener {
    findNavController().navigate(
        R.id.action_home_to_detail,
        bundleOf("userId" to 42)
    )
}

// 接收参数
val userId = arguments?.getInt("userId")
```

### 3.2 类型安全导航（推荐，2.8+）

```kotlin
// 1. 定义路由
@Serializable
object Home

@Serializable
data class Detail(val userId: Int)

// 2. NavHost 中声明
@Composable
fun AppNavHost() {
    val navController = rememberNavController()

    NavHost(
        navController = navController,
        startDestination = Home
    ) {
        composable<Home> {
            HomeScreen(
                onOpenDetail = { id ->
                    navController.navigate(Detail(userId = id))   // 类型安全！
                }
            )
        }
        composable<Detail> { backStackEntry ->
            val detail: Detail = backStackEntry.toRoute<Detail>()  // 自动解析参数
            DetailScreen(userId = detail.userId)
        }
    }
}
```

> 类型安全导航在编译期校验路由与参数，杜绝 `bundleOf("userId" to "42")` 类型错误。

## 4. 返回栈管理

```kotlin
// 返回上一页
navController.navigateUp()

// 返回指定目的地
navController.popBackStack(R.id.homeFragment, inclusive = false)

// 清除返回栈跳转（登录后进入主页）
navController.navigate(R.id.mainFragment) {
    popUpTo(R.id.loginFragment) { inclusive = true }
}

// 避免重复创建（tab 切换场景）
navController.navigate(R.id.tabFragment) {
    launchSingleTop = true
    restoreState = true
}
```

## 5. DeepLink 深链

```xml
<fragment
    android:id="@+id/shareFragment"
    android:name="com.example.ShareFragment">
    <deepLink app:uri="https://example.com/share/{message}" />
</fragment>
```

```kotlin
// 代码方式声明（动态参数）
composable<Share>(
    deepLinks = listOf(
        navDeepLink<Share>(
            uriPattern = "https://example.com/share/{message}"
        )
    )
)
```

收到深链：

```kotlin
// Activity 中
val deepLinkUri = intent.data  // https://example.com/share/hello
val navController = ...
navController.handleDeepLink(intent)
```

## 6. 与 Hilt / ViewModel 集成

```kotlin
// NavBackStackEntry 作为 ViewModelStoreOwner
@Composable
fun DetailScreen(userId: Int) {
    val viewModel: DetailViewModel = hiltViewModel()  // 作用域为当前 backStackEntry

    // 或手动获取
    val backStackEntry = remember {
        navController.getBackStackEntry(Detail)
    }
    val vm: DetailViewModel = hiltViewModel(backStackEntry)
}
```

> 每个 `NavBackStackEntry` 都是独立的 `ViewModelStoreOwner`，返回栈中的页面
> ViewModel 互不干扰，pop 后自动清除。

## 7. 高频面试题

**Q1：Navigation 组件如何保存 Fragment 状态？**
A：`NavBackStackEntry` 本身是 `ViewModelStoreOwner` + `LifecycleOwner`。页面在
返回栈中时 ViewModel 存活；`popBackStack` 后该 entry 被销毁，ViewModel 清除。
状态保存走 `SavedStateHandle`。

**Q2：Navigation 与 FragmentManager 的关系？**
A：Navigation 是 FragmentManager 之上的**封装层**。`NavHostFragment` 内部仍用
`FragmentManager` 提交事务，但由 Navigation 统一管理事务的时机与返回栈。

**Q3：类型安全导航的实现原理？**
A：路由类（`@Serializable`）在编译期生成 `NavType` 描述，参数序列化为
`Bundle`（`navArgs` 扩展读取）。navigate 时通过反射/KSP 生成的代码构造路由，
编译期校验参数类型与必填项。

**Q4：多个返回栈（底部导航）如何实现？**
A：Navigation 2.7+ 的 `NavigationBarItem` 支持 `NavHost` 多返回栈：
每个 tab 一个 `NavBackStackEntry`（`popUpTo(startDestination) { saveState = true }` +
`restoreState = true`），切换 tab 时保存/恢复各自栈。

**Q5：深链与通知跳转怎么配合？**
A：通知 PendingIntent 携带 deep link URI；App 启动时在 Activity 的 `onCreate`/
`onNewIntent` 中 `navController.handleDeepLink(intent)` 即可直达目标页。

## 8. 小结

- Navigation = 导航图 + NavHost + NavController。
- 类型安全导航（`@Serializable`）是现代推荐写法。
- 返回栈、深链、ViewModel 作用域都是开箱即用。
- 面试重点：NavBackStackEntry 生命周期、多返回栈、类型安全原理。
