---
icon: code
title: Kotlin 基础语法
---

# Kotlin 基础语法详解

> Kotlin 是一门运行在 JVM 上的静态类型编程语言，语法简洁、安全且与 Java 100% 互操作。

## 一、变量与数据类型

```kotlin
val name: String = "Android"  // val：只读变量（推荐）
var count: Int = 0            // var：可变变量
val price = 3.14              // 类型推断
```

Kotlin 基本类型：`Byte`、`Short`、`Int`、`Long`、`Float`、`Double`、`Char`、`Boolean`、`String`。

## 二、空安全

Kotlin 通过类型系统消除空指针异常（NPE）：

```kotlin
var a: String = "hello"   // 非空类型
var b: String? = null     // 可空类型

val len = b?.length        // 安全调用，为 null 时返回 null
val len2 = b?.length ?: 0  // Elvis 操作符，为 null 时返回默认值
val len3 = b!!.length      // 非空断言（谨慎使用）
```

## 三、控制流

```kotlin
// when 表达式（替代 switch）
fun describe(obj: Any): String = when (obj) {
    1 -> "One"
    is Long -> "Long"
    else -> "Unknown"
}

// 循环
for (i in 1..5) println(i)
for (i in 5 downTo 1 step 2) println(i)
```

## 四、函数与 Lambda

```kotlin
// 默认参数与命名参数
fun greet(name: String = "World", prefix: String = "Hello") = "$prefix, $name"

// 高阶函数
fun <T> List<T>.customForEach(action: (T) -> Unit) {
    for (item in this) action(item)
}

// 常见高阶函数
listOf(1, 2, 3)
    .map { it * 2 }      // [2, 4, 6]
    .filter { it > 2 }   // [4, 6]
    .reduce { acc, i -> acc + i } // 10
```

## 五、作用域函数

| 函数 | 上下文 | 返回值 | 适用场景 |
|------|--------|--------|----------|
| `let` | `it` | Lambda 结果 | 空安全链式调用 |
| `run` | `this` | Lambda 结果 | 配置对象并计算结果 |
| `with` | `this` | Lambda 结果 | 多次调用同一对象的方法 |
| `apply` | `this` | 对象本身 | 初始化配置 |
| `also` | `it` | 对象本身 | 额外副作用（日志等） |

```kotlin
val dialog = AlertDialog.Builder(context).apply {
    setTitle("提示")
    setMessage("确定退出吗？")
    setPositiveButton("确定", null)
}.create()
```

## 六、扩展函数

```kotlin
// 为 String 添加扩展函数
fun String.isEmail(): Boolean = this.contains("@") && this.contains(".")

val result = "user@example.com".isEmail() // true
```

> 📖 进阶阅读：[Kotlin 协程从入门到进阶](kotlin-coroutines.md) | [Kotlin 学习路线](/roadmap/kotlin-roadmap.md)
