---
icon: navigation
title: Navigation 组件详解
description: NavHost、NavController、类型安全导航、返回栈管理、DeepLink 与实战
---

# Navigation 组件详解

> 面试高频指数：高
> Navigation 是官方推荐的导航方案，取代手写 FragmentManager 事务。

## 1. 为什么用 Navigation

传统方案用 FragmentManager 手写事务，样板代码多、返回栈管理繁琐、类型错误难以察觉：

::: code-tabs

@tab:active Java

```java
// ✗ 手写事务：样板代码多、易出错、返回栈难管理
supportFragmentManager.beginTransaction()
        .add(R.id.container, new DetailFragment(), "detail")
        .addToBackStack("detail")
        .commit();
```

@tab Kotlin

```kotlin
// ✗ 手写事务：样板代码多、易出错、返回栈难管理
supportFragmentManager.commit {
    add(R.id.container, DetailFragment(), "detail")
    addToBackStack("detail")
}
```

:::

Navigation 解决：

- **单一数据源**：导航图（XML/Kotlin DSL）声明所有页面与跳转。
- **类型安全**：Compose Navigation 2.8+ 支持 `@Serializable` 路由。
- **自动管理返回栈**、深链（Deep Link）、动画。

## 2. 核心概念

### 2.1 导航图（NavGraph）

导航图集中声明"有哪些页面、页面之间怎么跳"。XML 方式如下——`startDestination` 指定首页，`<action>` 定义跳转关系，`<argument>` 声明页面参数：

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

导航图需要"宿主"来承载——`NavHostFragment` 作为容器 View 放在布局里，代码中通过它拿到 `NavController`，一切跳转都由控制器执行：

```xml
<!-- Fragment 方式 -->
<androidx.fragment.app.FragmentContainerView
    android:id="@+id/nav_host"
    android:name="androidx.navigation.fragment.NavHostFragment"
    app:defaultNavHost="true"
    app:navGraph="@navigation/nav_graph" />
```

::: code-tabs

@tab:active Java

```java
// 获取控制器
NavController navController = ((NavHostFragment) supportFragmentManager
        .findFragmentById(R.id.nav_host)).getNavController();
```

@tab Kotlin

```kotlin
// 获取控制器
val navController = (supportFragmentManager
    .findFragmentById(R.id.nav_host) as NavHostFragment).navController
```

:::

## 3. 导航跳转

### 3.1 传统方式

传统方式用资源 ID 定位目的地，参数塞进 Bundle——写法繁琐且参数类型编译期不校验：

::: code-tabs

@tab:active Java

```java
// 跳转（带参数）
binding.button.setOnClickListener(v -> {
    Bundle args = new Bundle();
    args.putInt("userId", 42);
    findNavController().navigate(R.id.action_home_to_detail, args);
});

// 接收参数
int userId = getArguments() != null ? getArguments().getInt("userId") : 0;
```

@tab Kotlin

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

:::

### 3.2 类型安全导航（推荐，2.8+）

Navigation 2.8 起推荐**类型安全导航**：路由用 `@Serializable` 类定义，跳转直接传对象，参数自动解析，编译期就杜绝"字符串路由拼错、Bundle 类型写错"这类问题：

::: code-tabs

@tab:active Java

@tab Kotlin

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

:::

> 类型安全导航在编译期校验路由与参数，杜绝 `bundleOf("userId" to "42")` 类型错误。

## 4. 返回栈管理

返回栈是导航的"撤销历史"。常用操作：`navigateUp` 返回上一页、`popBackStack` 弹到指定页、`popUpTo` 清栈跳转（登录后进主页）、`launchSingleTop` 防重复创建：

::: code-tabs

@tab:active Java

```java
// 返回上一页
navController.navigateUp();

// 返回指定目的地
navController.popBackStack(R.id.homeFragment, false);

// 清除返回栈跳转（登录后进入主页）
NavOptions options = new NavOptions.Builder()
        .setPopUpTo(R.id.loginFragment, true)
        .build();
navController.navigate(R.id.mainFragment, options);

// 避免重复创建（tab 切换场景）
NavOptions tabOptions = new NavOptions.Builder()
        .setLaunchSingleTop(true)
        .setRestoreState(true)
        .build();
navController.navigate(R.id.tabFragment, tabOptions);
```

@tab Kotlin

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

:::

## 5. DeepLink 深链

深链让外部链接直接打开应用内指定页面。先在导航图中声明带占位符的 uri（`{message}` 是动态参数）：

```xml
<fragment
    android:id="@+id/shareFragment"
    android:name="com.example.ShareFragment">
    <deepLink app:uri="https://example.com/share/{message}" />
</fragment>
```

::: code-tabs

@tab:active Java

@tab Kotlin

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

:::

收到深链：

::: code-tabs

@tab:active Java

```java
// Activity 中
Uri deepLinkUri = getIntent().getData();  // https://example.com/share/hello
NavController navController = ...;
navController.handleDeepLink(getIntent());
```

@tab Kotlin

```kotlin
// Activity 中
val deepLinkUri = intent.data  // https://example.com/share/hello
val navController = ...
navController.handleDeepLink(intent)
```

:::

## 6. 与 Hilt / ViewModel 集成

导航天然是 ViewModel 的"作用域边界"：**每个 `NavBackStackEntry` 都是独立的 `ViewModelStoreOwner`**，页面在返回栈里 ViewModel 就活着，pop 出去自动清除：

::: code-tabs

@tab:active Java

@tab Kotlin

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

:::

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
