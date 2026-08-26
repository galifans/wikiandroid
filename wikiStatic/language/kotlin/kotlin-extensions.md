---
icon: kotlin
title: Kotlin 扩展函数与作用域函数
description: 扩展函数原理与实战、作用域函数 let/run/with/apply/also 对比、标准库常用函数
---

# Kotlin 扩展函数与作用域函数

> 面试高频指数：高
> 扩展函数是 Kotlin 最优雅的特性之一，作用域函数是日常开发高频 API。

## 1. 扩展函数（Extension Function）

### 1.1 定义与使用

```kotlin
// 给 String 添加扩展函数
fun String.isEmail(): Boolean {
    return this.contains("@") && this.contains(".")
}

// 给 View 添加扩展
fun View.visible() {
    this.visibility = View.VISIBLE
}

fun View.gone() {
    this.visibility = View.GONE
}

// 使用
val email = "user@example.com"
println(email.isEmail())     // true
button.visible()
```

**原理**：扩展函数**不会修改原类**，编译后是静态方法，接收者作为第一个参数：

```kotlin
// 编译后的伪代码
public static boolean isEmail(String $this) {
    return $this.contains("@") && $this.contains(".");
}
```

### 1.2 扩展属性

```kotlin
// 扩展属性（不能有 backing field）
val String.lastChar: Char
    get() = this[this.length - 1]

val dp: Int.dp
    get() = (this * resources.displayMetrics.density).toInt()

// 使用
println("hello".lastChar)    // 'o'
```

### 1.3 成员函数优先级更高

```kotlin
class Foo {
    fun bar() = "成员函数"
}

fun Foo.bar() = "扩展函数"

Foo().bar()    // "成员函数"（成员优先于扩展）
```

### 1.4 扩展函数与泛型

```kotlin
// 泛型扩展
fun <T> List<T>.secondOrNull(): T? = if (size >= 2) this[1] else null

// 可空接收者
fun String?.isEmptyOrNull(): Boolean = this == null || this.isEmpty()
```

## 2. 作用域函数（Scope Functions）

### 2.1 五个作用域函数总览

| 函数 | 上下文对象 | 返回值 | 适用场景 |
| --- | --- | --- | --- |
| `let` | it | 表达式结果 | 空安全 + 转换 |
| `run` | this | 表达式结果 | 配置对象 + 返回值 |
| `with` | this | 表达式结果 | 批量操作对象 |
| `apply` | this | **对象本身** | 初始化配置 |
| `also` | it | **对象本身** | 副作用（日志/校验） |

### 2.2 各函数实战

```kotlin
// ① let：空安全 + 结果转换
val length = name?.let { it.length } ?: 0

// ② run：配置 + 返回结果
val result = textView.run {
    text = "hello"
    textSize = 20f
    "${text} 长度: ${text.length}"    // 返回表达式结果
}

// ③ with：批量操作（非扩展函数，接收对象作参数）
val info = with(user) {
    "$name - $email - $age"
}

// ④ apply：对象初始化（返回对象本身）
val dialog = AlertDialog.Builder(context).apply {
    setTitle("提示")
    setMessage("确定删除吗？")
    setPositiveButton("确定") { _, _ -> delete() }
}.create()

// ⑤ also：副作用（返回对象本身）
val user = User().also {
    println("创建用户: ${it.name}")
    check(it.email.isNotEmpty()) { "邮箱不能为空" }
}
```

### 2.3 典型用法模式

```kotlin
// 链式调用 + also 打日志
fun process(list: List<Int>) {
    list.filter { it > 0 }
        .also { println("过滤后: $it") }
        .map { it * 2 }
        .also { println("加倍后: $it") }
}

// 判空后初始化（run + let 组合）
fun initView() {
    findViewById<TextView>(R.id.tv)?.let { tv ->
        tv.apply {
            text = "loading"
            visibility = View.VISIBLE
        }
    }
}
```

## 3. 其他常用标准库函数

```kotlin
// takeIf / takeUnless：条件过滤
val max = list.maxOrNull()?.takeIf { it > 0 }   // 满足条件返回，否则 null

// repeat：重复执行
repeat(3) { index -> println("第 $index 次") }

// runCatching：异常捕获
val result = runCatching { riskyOperation() }
    .onSuccess { println("成功: $it") }
    .onFailure { println("失败: ${it.message}") }
    .getOrDefault(default)

// also/apply 与 takeIf 组合
val even = number.takeIf { it % 2 == 0 }?.also { println("偶数: $it") }
```

## 4. 高频面试题

**Q1：扩展函数是怎么实现的？会修改原类吗？**
A：编译为静态方法，接收者作为第一个参数传入。不修改原类（Java 无法调用，
除非作为静态方法通过工具类访问）。Kotlin 中看起来像成员方法。

**Q2：apply、run、with 的区别？**
A：apply 返回对象本身（用于初始化）；run 和 with 返回 lambda 结果
（用于计算/转换）；run 是扩展函数（`obj.run {}`），with 接收对象参数
（`with(obj) {}`），语义相同。

**Q3：let 和 also 的区别？**
A：let 返回 lambda 结果（适合空安全转换）；also 返回对象本身
（适合副作用如日志、校验）。let 用 it、also 用 it，但返回值不同。

**Q4：什么时候用 apply？**
A：对象创建后需要一次性配置多个属性时（View 配置、Dialog 构建、
数据类拷贝后修改）。返回对象本身支持链式。

**Q5：扩展函数能访问私有成员吗？**
A：不能。扩展函数没有"特权"，只能访问接收者的公有成员（public）。
需要访问私有成员时，可用伴生对象的扩展或反射。

## 5. 小结

- 扩展函数：不修改原类，静态方法 + 接收者参数。
- 成员函数优先级高于扩展函数。
- 作用域函数选择：初始化用 apply、副作用用 also、转换用 let、计算用
  run/with。
- 组合使用（let + apply + also）写出优雅链式代码。
