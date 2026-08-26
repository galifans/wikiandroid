---
icon: compose
title: Compose 性能优化
description: 重组优化、稳定性推断、不可变性、LazyColumn 性能、图形层优化与 Profiler 分析实战
---

# Compose 性能优化

> 面试高频指数：高
> Compose 性能的核心是"减少不必要的重组与重绘"，本文给出可落地的优化清单。

## 1. 性能的核心指标

```text
重组（Recomposition）：执行可组合函数体（CPU）
布局（Layout）：测量与摆放（CPU）
绘制（Draw）：渲染到屏幕（GPU）
跳过（Skip）：参数未变则跳过重组

目标：最小化重组范围、减少布局计算、减少绘制负担
```

## 2. 重组优化

### 2.1 状态作用域最小化

::: code-tabs

@tab:active Java

```java
// Compose 仅支持 Kotlin DSL，无 Java 等价写法；
// 状态作用域最小化对应 View 体系：把依赖状态变化的子控件拆成独立 View / 自定义 View，缩小刷新范围
```

@tab Kotlin

```kotlin
// ✗ 状态读取范围过大：任何变化都重组整个 Column
@Composable
fun BadCard() {
    var expanded by remember { mutableStateOf(false) }
    Column {
        Text("标题（不依赖 expanded）")     // 每次都重组
        IconButton(onClick = { expanded = !expanded }) {
            Icon(if (expanded) Icons.Filled.KeyboardArrowUp else Icons.Filled.KeyboardArrowDown)
        }
    }
}

// ✓ 状态提升：只有依赖状态的子组件重组
@Composable
fun GoodCard() {
    var expanded by remember { mutableStateOf(false) }
    Column {
        Text("标题")
        ExpandIcon(expanded = expanded, onClick = { expanded = !expanded })
    }
}

@Composable
fun ExpandIcon(expanded: Boolean, onClick: () -> Unit) {
    IconButton(onClick = onClick) {
        Icon(if (expanded) Icons.Filled.KeyboardArrowUp else Icons.Filled.KeyboardArrowDown)
    }
}
```

:::

### 2.2 remember 缓存计算结果

::: code-tabs

@tab:active Java

```java
// Compose 仅支持 Kotlin DSL，无 Java 等价写法；
// 对应 View 体系：计算结果存入字段 / ViewModel 缓存，仅在输入变化时重算
```

@tab Kotlin

```kotlin
@Composable
fun ExpenseList(expenses: List<Expense>) {
    // 只在 expenses 变化时重算
    val total = remember(expenses) {
        expenses.sumOf { it.amount }
    }
    Text("总计：$total")
}
```

:::

### 2.3 derivedStateOf：派生状态按需计算

::: code-tabs

@tab:active Java

```java
// Compose 仅支持 Kotlin DSL，无 Java 等价写法；
// 对应 View 体系：滚动监听回调中判断 firstVisibleItemIndex，按需更新控件
```

@tab Kotlin

```kotlin
@Composable
fun ShowHideButton(listState: LazyListState) {
    // 滚动时频繁变化，但不滚动时不要触发重组
    val isScrolled by remember {
        derivedStateOf { listState.firstVisibleItemIndex > 0 }
    }
    AnimatedVisibility(visible = isScrolled) {
        Text("回到顶部")
    }
}
```

:::

## 3. 稳定性（Stability）

### 3.1 什么是稳定性

```text
稳定类型：重组时参数未变 → 跳过重组
不稳定类型（var 属性、可变集合、无注解的 data class 含 var）：
→ 无法跳过，总是重组

判断规则：
- val 只读属性 → 稳定（不可变）
- var 属性 → 不稳定
- List/Map 等集合接口 → 不稳定（可能被修改）
- 标注 @Immutable / @Stable → 视为稳定
```

### 3.2 提升稳定性的实践

::: code-tabs

@tab:active Java

```java
// ① data class 用 val → Java 中 final 字段 + 构造器（等价于 data class）
public final class User {
    private final String name;
    private final int age;

    public User(String name, int age) {
        this.name = name;
        this.age = age;
    }

    public String getName() { return name; }
    public int getAge() { return age; }
}

// ② 集合：不要直接暴露可变集合（用 List 而非 MutableList）
public final class UiState {
    private final List<User> users;

    public UiState(List<User> users) {
        this.users = users;
    }

    public List<User> getUsers() { return users; }
}

// ③ 官方注解兜底（Java 同样可用 @Immutable）
@Immutable
public final class Point {
    public final int x;
    public final int y;

    public Point(int x, int y) {
        this.x = x;
        this.y = y;
    }
}

// ④ 用不可变集合（Java 侧可用 Guava ImmutableList 等）
ImmutableList<User> users;
```

@tab Kotlin

```kotlin
// ① data class 用 val（不可变）
data class User(val name: String, val age: Int)   // 稳定

// ② 集合：不要直接暴露可变集合
data class UiState(
    val users: List<User> = emptyList()   // 用 List 而非 MutableList
)

// ③ 官方注解兜底
@Immutable
data class Point(val x: Int, val y: Int)

// ④ 用 immutable 集合（kotlinx.collections.immutable）
val users: ImmutableList<User>
```

:::

### 3.3 检查稳定性

```text
编译期报告：compose compiler metrics
配置：
kotlinOptions {
    freeCompilerArgs += listOf(
        "-P", "plugin:androidx.compose.compiler.plugins.kotlin:reportsDestination=...",
        "-P", "plugin:androidx.compose.compiler.plugins.kotlin:metricsDestination=..."
    )
}

重点看 "stability": unstable → 需要优化
```

## 4. 列表性能：LazyColumn

::: code-tabs

@tab:active Java

```java
// Compose 仅支持 Kotlin DSL，无 Java 等价写法；
// 对应 View 体系：RecyclerView + ListAdapter（DiffUtil 计算 key 差异）
```

@tab Kotlin

```kotlin
@Composable
fun UserList(users: List<User>) {
    LazyColumn {
        items(users, key = { it.id }) {      // key：稳定标识，避免错位
            UserRow(user = it)
        }
    }
}

@Composable
fun UserRow(user: User) {
    // 保持 item 组合体小而稳定
    Row(Modifier.fillMaxWidth().padding(8.dp)) {
        Text(user.name)
        Text(user.email)
    }
}
```

:::

**列表优化要点**：

| 优化 | 说明 |
| --- | --- |
| `key` | 稳定标识（id），Diff 更精准 |
| item 小而独立 | 减少重组范围 |
| `contentType` | 不同类型 item 分开缓存 |
| 图片懒加载 | Coil/Glide 配合 LazyColumn |
| 避免在 item 内做大计算 | remember 缓存 |

## 5. 图形层优化（GraphicsLayer）

::: code-tabs

@tab:active Java

```java
// Compose 仅支持 Kotlin DSL，无 Java 等价写法；
// 对应 View 体系：View.setTranslationX / setAlpha / setRotationZ（属性动画走硬件合成，跳过布局）
```

@tab Kotlin

```kotlin
// 动画高频变化：用 graphicsLayer 代替 Modifier 布局属性
// ✗ translationX 直接改布局位置（会触发重新布局）
Box(Modifier.offset { IntOffset(x, 0) })

// ✓ graphicsLayer：只改绘制层，跳过布局
Box(Modifier.graphicsLayer {
    translationX = 100f
    alpha = 0.5f
    rotationZ = 45f
})
```

:::

```text
graphicsLayer 优势：
- 只触发 Draw 阶段（走硬件合成），跳过 measure/layout
- 适合动画、拖拽、缩放等高频场景
- 配合 shadowElevation/clip 等绘制属性
```

## 6. 其他优化点

```text
① 避免 in 循环中直接构建组合（用 LazyColumn/items）
② 避免过多 Modifier 组合开销（合并布局 modifier）
③ 大 Bitmap 用 ContentScale 与内存优化（Coil 自动）
④ 文本用 StaticCompositionLocal 减少全局重组
⑤ 深色模式资源按需加载
⑥ 用 rememberCoroutineScope 管理协程，避免泄漏
```

## 7. 分析工具

| 工具 | 用途 |
| --- | --- |
| Layout Inspector | 查看重组次数与层级 |
| Compose 编译器报告 | 稳定性分析 |
| Android Studio Profiler | CPU/内存/绘制帧分析 |
| Baseline Profile | 启动/关键路径预编译（官方推荐） |

```text
Baseline Profile（基线配置）：
将高频路径的类预编译为 AOT，减少首帧耗时
配合 Macrobenchmark 验证收益
```

## 8. 高频面试题

**Q1：Compose 为什么会性能差？常见原因？**
A：不是框架慢，而是用法问题：大范围重组（状态作用域过大）、不稳定参数
无法跳过、LazyColumn 用错（Column 包循环）、动画用布局属性、item 内
重计算。逐项优化即可。

**Q2：如何判断一个类是否稳定？**
A：val 属性不可变 → 稳定；var/可变集合 → 不稳定；@Immutable/@Stable 注解
可标记；用 Compose 编译器报告（metrics）查看每个类的 stability。

**Q3：LazyColumn 的 key 有什么作用？**
A：key 是 item 的唯一标识，让 Diff 准确追踪（插入/删除/移动不错位），
避免状态错误复用。必须稳定且唯一（如 id）。

**Q4：graphicsLayer 和 Modifier.offset 的区别？**
A：offset 是布局修饰（改变布局位置，触发重新布局）；graphicsLayer 是
绘制层修饰（只改变绘制合成位置，跳过布局阶段），动画场景性能更好。

**Q5：Baseline Profile 是什么？为什么有效？**
A：预编译配置，把关键路径（启动、首屏）的字节码在安装时编译为 AOT，
减少运行时解释执行开销；配合 Macrobenchmark 量化收益，官方推荐接入。

## 9. 小结

- 性能核心：减少重组范围 + 提升稳定性 + 优化绘制。
- 状态作用域最小化、remember/derivedStateOf 缓存。
- 不可变数据类 + @Immutable 提升跳过率。
- LazyColumn + key + 小 item。
- graphicsLayer 做动画，Baseline Profile 做启动优化。
