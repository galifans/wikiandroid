---
icon: code
title: Kotlin 基础语法
---

# Kotlin 基础语法详解

> Kotlin 是一门运行在 JVM 上的静态类型编程语言，语法简洁、安全且与 Java 100% 互操作。

## 一、变量与数据类型

变量声明与类型推断的写法示例如下：

::: code-tabs

@tab:active Java

```java
final String name = "Android"; // final：只读变量（推荐）
int count = 0;                 // 可变变量
double price = 3.14;           // 类型推断
```

@tab Kotlin

```kotlin
val name: String = "Android"  // val：只读变量（推荐）
var count: Int = 0            // var：可变变量
val price = 3.14              // 类型推断
```

:::

Kotlin 基本类型：`Byte`、`Short`、`Int`、`Long`、`Float`、`Double`、`Char`、`Boolean`、`String`。

## 二、空安全

Kotlin 通过类型系统消除空指针异常（NPE）：

::: code-tabs

@tab:active Java

```java
String a = "hello";   // 非空类型（Java 无空安全机制）
String b = null;      // 可空类型（可赋 null）

Integer len = (b != null) ? b.length() : null;      // 安全调用，为 null 时返回 null
int len2 = (b != null) ? b.length() : 0;            // 等价 Elvis 操作符，为 null 时返回默认值
int len3 = b.length();                              // 非空断言等价写法（需自行保证非空）
```

@tab Kotlin

```kotlin
var a: String = "hello"   // 非空类型
var b: String? = null     // 可空类型

val len = b?.length        // 安全调用，为 null 时返回 null
val len2 = b?.length ?: 0  // Elvis 操作符，为 null 时返回默认值
val len3 = b!!.length      // 非空断言（谨慎使用）
```

:::

## 三、控制流

Kotlin 控制流的标准写法如下：

::: code-tabs

@tab:active Java

```java
// when 表达式（等价 switch）
String describe(Object obj) {
    if (obj instanceof Integer && obj.equals(1)) return "One";
    if (obj instanceof Long) return "Long";
    return "Unknown";
}

// 循环
for (int i = 1; i <= 5; i++) System.out.println(i);
for (int i = 5; i >= 1; i -= 2) System.out.println(i);
```

@tab Kotlin

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

:::

## 四、函数与 Lambda

函数定义与 Lambda 的标准写法如下：

::: code-tabs

@tab:active Java

```java
// 默认参数（Java 需重载实现）
String greet(String name, String prefix) { return prefix + ", " + name; }
String greet(String name) { return greet(name, "Hello"); }  // 默认参数
String greet() { return greet("World"); }                   // 默认参数

// 高阶函数（等价形式）
<T> void customForEach(List<T> list, Consumer<T> action) {
    for (T item : list) action.accept(item);
}

// 常见高阶函数
List<Integer> list = Arrays.asList(1, 2, 3);
list.stream()
    .map(i -> i * 2)              // [2, 4, 6]
    .filter(i -> i > 2)           // [4, 6]
    .reduce(0, (acc, i) -> acc + i); // 10
```

@tab Kotlin

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

:::

## 五、作用域函数

五个作用域函数的对比说明如下：

| 函数 | 上下文 | 返回值 | 适用场景 |
|------|--------|--------|----------|
| `let` | `it` | Lambda 结果 | 空安全链式调用 |
| `run` | `this` | Lambda 结果 | 配置对象并计算结果 |
| `with` | `this` | Lambda 结果 | 多次调用同一对象的方法 |
| `apply` | `this` | 对象本身 | 初始化配置 |
| `also` | `it` | 对象本身 | 额外副作用（日志等） |

作用域函数的实际用法示例如下：

::: code-tabs

@tab:active Java

```java
AlertDialog.Builder builder = new AlertDialog.Builder(context);
builder.setTitle("提示");
builder.setMessage("确定退出吗？");
builder.setPositiveButton("确定", null);
AlertDialog dialog = builder.create();
```

@tab Kotlin

```kotlin
val dialog = AlertDialog.Builder(context).apply {
    setTitle("提示")
    setMessage("确定退出吗？")
    setPositiveButton("确定", null)
}.create()
```

:::

## 六、扩展函数

扩展函数的定义与调用示例如下：

::: code-tabs

@tab:active Java

```java
// 为 String 添加"扩展函数"（Java 无扩展函数，用静态工具方法）
static boolean isEmail(String s) {
    return s.contains("@") && s.contains(".");
}

boolean result = isEmail("user@example.com"); // true
```

@tab Kotlin

```kotlin
// 为 String 添加扩展函数
fun String.isEmail(): Boolean = this.contains("@") && this.contains(".")

val result = "user@example.com".isEmail() // true
```

:::

> 进阶阅读：[Kotlin 协程从入门到进阶](kotlin-coroutines.md) | [Kotlin 学习路线](/roadmap/kotlin-roadmap.md)
