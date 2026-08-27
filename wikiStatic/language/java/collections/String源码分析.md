---
icon: text
title: String 源码分析
---

# String 源码分析

> String 是不可变对象，理解常量池、编译期优化与 `==` 比较的本质。

## 经典面试题

**第一段代码**：

::: code-tabs

@tab:active Java

```java
String a = "a" + "b" + 1;
String b = "ab1";
System.out.println(a == b); // true
```

@tab Kotlin

```kotlin
val a = "a" + "b" + 1
val b = "ab1"
println(a === b) // true：引用比较，等价 Java 的 ==
```

:::

**第二段代码**：

::: code-tabs

@tab:active Java

```java
String a = new String("ab1");
String b = "ab1";
System.out.println(a == b); // false
```

@tab Kotlin

```kotlin
val a = String("ab1")
val b = "ab1"
println(a === b) // false：引用比较，等价 Java 的 ==
```

:::

**原因**：第一段代码经过**编译期优化**——编译器发现 `"a"+"b"+1` 与 `"ab1"` 都是不可变常量，效果相同，直接折叠为常量 `"ab1"`，因此 `a` 和 `b` 都指向常量池中的同一对象。

第二段代码中，`new String("ab1")` 在**堆**中创建新对象，`b` 指向**常量池**中的对象，两者地址不同，`==` 比较为 false。

## String 类结构

String 的类结构如下：

::: code-tabs

@tab:active Java

```java
public final class String
    implements Serializable, Comparable<String>, CharSequence {
    private final char value[]; // 不可变的 char 数组，存放字符串
    private int hash;           // 缓存的哈希值
}
```

@tab Kotlin

```kotlin
class String : Serializable, Comparable<String>, CharSequence {
    private val value: CharArray // 不可变的 char 数组，存放字符串
    private var hash: Int = 0    // 缓存的哈希值
}
```

:::

- `final` 修饰：String 对象是**不可变量**，并发程序最喜欢不可变量
- 实现 `Comparable`（`compareTo` 方法）、`CharSequence`（`length`、`charAt`、`subSequence` 方法）

## 要点总结

核心要点的总结如下：

| 知识点 | 说明 |
|--------|------|
| 不可变性 | `final` 类 + `final` char 数组，无法修改 |
| 常量池 | 字面量创建时优先从常量池查找/复用 |
| 编译期优化 | 常量字符串拼接在编译期折叠 |
| 字符串拼接 | 大量拼接用 `StringBuilder` 避免产生过多对象 |
| equals 与 == | `==` 比地址，`equals` 比内容 |
