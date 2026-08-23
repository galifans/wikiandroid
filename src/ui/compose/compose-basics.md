---
icon: compose
title: Compose 核心概念
description: 声明式 UI、可组合函数、重组原理、Modifier 链、Compose 与 View 互操作入门
---

# 🧩 Compose 核心概念

> 面试高频指数：⭐⭐⭐⭐⭐
> Compose 是 Android 现代 UI 开发的方向，理解声明式思维是第一步。

## 1. 声明式 UI vs 命令式 UI

```text
命令式（View 体系）：
  findViewById → setText → setVisibility → ...（手动操作每一步）

声明式（Compose）：
  UI = f(state)
  状态变化 → 自动重组 UI（无需手动操作）
```

```kotlin
// 命令式
val tv = findViewById<TextView>(R.id.tv_name)
btn.setOnClickListener {
    tv.text = input.text        // 手动更新
    tv.visibility = View.VISIBLE
}

// 声明式
@Composable
fun Greeting(name: String) {
    if (name.isNotEmpty()) {
        Text(text = "Hello, $name")   // 状态驱动，自动更新
    }
}
```

## 2. 可组合函数（Composable）

```kotlin
@Composable
fun ProfileCard(user: User) {
    Column(modifier = Modifier.padding(16.dp)) {
        Text(text = user.name, style = MaterialTheme.typography.headlineSmall)
        Text(text = user.email, style = MaterialTheme.typography.bodyMedium)
        Button(onClick = { /* ... */ }) {
            Text("Follow")
        }
    }
}
```

**规则**：

- 函数用 `@Composable` 注解标记。
- 函数名首字母大写（惯例）。
- 不返回值（描述 UI）。
- 可组合：通过参数与状态组合复用。
- **无副作用**：不要在重组中做非 UI 操作（网络、写文件）。

## 3. 重组（Recomposition）

```text
状态改变 → 调用方重组 → 只更新受影响的可组合函数

关键机制：
① 智能跳过：参数未变的部分不重组
② 作用域：状态读取被拆分到最小作用域
③ 幂等：重组可被随时取消/重放
```

```kotlin
@Composable
fun Counter() {
    var count by remember { mutableStateOf(0) }   // 状态

    Column {
        Text("Count: $count")      // 读取状态 → 变化时重组
        Button(onClick = { count++ }) {
            Text("Add")
        }
    }
}
```

**性能注意**：

```text
① 避免在重组中做耗时计算 → 用 remember / derivedStateOf
② 列表用 LazyColumn（懒加载），不要用 Column 包 for 循环
③ 大对象状态提升（hoist），减少重组范围
```

## 4. Modifier：链式修饰

```kotlin
// Modifier 按顺序应用（从上到下）
Modifier
    .padding(16.dp)          // 外边距
    .size(100.dp)            // 尺寸
    .clip(RoundedCornerShape(8.dp))   // 圆角裁剪
    .background(Color.Blue)  // 背景（在裁剪后）
    .clickable { /* 点击 */ }
    .testTag("card")
```

**常用 Modifier 分类**：

| 分类 | 示例 |
| --- | --- |
| 布局 | `size` `padding` `fillMaxWidth` `aspectRatio` |
| 绘制 | `background` `border` `graphicsLayer` |
| 交互 | `clickable` `pointerInput` `draggable` |
| 语义 | `semantics` `testTag` `contentDescription` |

## 5. Compose 与 View 互操作

```kotlin
// ① Compose 中嵌入 View（AndroidView）
@Composable
fun AndroidViewInCompose() {
    AndroidView(factory = { context ->
        TextView(context).apply {
            text = "来自 View 体系"
        }
    }, update = { view ->
        view.text = "更新后的文本"
    })
}

// ② View 中嵌入 Compose（ComposeView）
val composeView = findViewById<ComposeView>(R.id.compose_view)
composeView.setContent {
    MaterialTheme {
        Text("来自 Compose")
    }
}
```

## 6. 状态提升（State Hoisting）

```kotlin
// 无状态可组合：状态由调用方持有（单一数据源）
@Composable
fun NameInput(name: String, onNameChange: (String) -> Unit) {
    TextField(
        value = name,
        onValueChange = onNameChange
    )
}

// 调用方持有状态
@Composable
fun Screen() {
    var name by remember { mutableStateOf("") }
    NameInput(name = name, onNameChange = { name = it })
}
```

**优点**：可测试、可复用、状态可预测。

## 7. 高频面试题

**Q1：Compose 和 View 体系的区别？**
A：声明式 vs 命令式；UI 由状态驱动自动更新 vs 手动操作控件；
Compose 无 findViewById、无 XML 布局；性能上 Compose 重组只更新受影响部分。

**Q2：什么是重组？如何避免不必要的重组？**
A：状态变化时 Compose 重新执行受影响的可组合函数。避免方式：
`remember` 缓存、`derivedStateOf` 派生状态、`rememberUpdatedState`、
拆分状态作用域、稳定参数（immutable 类）。

**Q3：remember 和 mutableStateOf 的关系？**
A：`mutableStateOf` 创建可观察状态；`remember` 在重组间保留状态值。
组合：`remember { mutableStateOf(0) }`。`rememberSaveable` 可在配置变化
（旋转）后保留。

**Q4：Compose 如何与 View 互操作？**
A：Compose 中用 `AndroidView` 嵌入传统 View；View 中用 `ComposeView` +
`setContent` 嵌入 Compose；Activity/Fragment 可直接 `setContent { }`。

**Q5：LazyColumn 和 Column 的区别？**
A：LazyColumn 只组合可见项（虚拟化，类似 RecyclerView），适合长列表；
Column 组合所有子项，适合少量固定内容。用错会导致性能问题。

## 8. 小结

- 声明式：UI = f(state)，状态驱动重组。
- 可组合函数：@Composable + 参数复用 + 无副作用。
- Modifier 链式修饰，顺序敏感。
- 状态提升保证单一数据源。
- 学习路径：核心概念 → 状态管理 → 布局 → 动画 → 性能优化。
