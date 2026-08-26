---
icon: kotlin
title: Kotlin 泛型详解
description: 泛型基础、协变与逆变、星投影、reified 实化类型、泛型约束与型变实战
---

# Kotlin 泛型详解

> 面试高频指数：高
> 泛型是 Kotlin 类型系统的精髓，协变/逆变是理解泛型的关键。

## 1. 泛型基础

::: code-tabs

@tab:active Java

```java
// 泛型类
class Box<T> {
    private final T value;
    Box(T value) { this.value = value; }
    T getValue() { return value; }
}

// 泛型函数
static <T> T identity(T value) { return value; }

// 泛型接口
interface Repository<T> {
    T get(String id);
    void save(T item);
}

// 使用
Box<Integer> box = new Box<>(10);              // 类型推断
Box<String> box2 = new Box<>("hello");
```

@tab Kotlin

```kotlin
// 泛型类
class Box<T>(val value: T)

// 泛型函数
fun <T> identity(value: T): T = value

// 泛型接口
interface Repository<T> {
    fun get(id: String): T
    fun save(item: T)
}

// 使用
val box = Box(10)                 // 类型推断
val box2 = Box<String>("hello")
```

:::

## 2. 泛型约束

::: code-tabs

@tab:active Java

```java
// 上界约束
static <T extends Comparable<T>> T maxOf(T a, T b) {
    return a.compareTo(b) > 0 ? a : b;
}

// 多个上界（Java 用 & 连接）
static <T extends CharSequence & Comparable<T>> void process(T item) {
    System.out.println(item.length());
}

// 可空类型约束（Java 引用类型默认可空，无此约束）
static <T> void notNull(T value) { }    // Java 中 T 可为 null
```

@tab Kotlin

```kotlin
// 上界约束（extends 的 Kotlin 版）
fun <T : Comparable<T>> maxOf(a: T, b: T): T {
    return if (a > b) a else b
}

// 多个上界（用 where 子句）
fun <T> process(item: T) where T : CharSequence, T : Comparable<T> {
    println(item.length)
}

// 可空类型约束
fun <T : Any> notNull(value: T) { }    // T 不能为空
```

:::

## 3. 协变与逆变（型变）

### 3.1 为什么需要型变

::: code-tabs

@tab:active Java

```java
// Java 中泛型默认不可变（invariant）
// List<String> 不是 List<Object> 的子类型

// Java 的解决办法：通配符（PECS）
// ? extends T（生产者，读）：协变
// ? super T   （消费者，写）：逆变
```

@tab Kotlin

```kotlin
// Java 中泛型默认不可变（invariant）
// List<String> 不是 List<Object> 的子类型

// Java 的解决办法：通配符（PECS）
// ? extends T（生产者，读）：协变
// ? super T   （消费者，写）：逆变
```

:::

### 3.2 Kotlin 的声明处型变

::: code-tabs

@tab:active Java

```java
// Java 无声明处型变：在调用处用通配符实现型变
interface Source<T> {
    T next();                        // T 只能出现在返回位置
    // void set(T t);                // ✗ 不能有 T 作为参数
}

interface Sink<T> {
    void accept(T item);             // T 只能出现在参数位置
}

// 使用：? extends 协变（读），? super 逆变（写）
Source<String> strSource = ...;
Source<? extends Object> source = strSource;   // ✓ 协变：Source<String> 是 Source<? extends Object> 的子类型
```

@tab Kotlin

```kotlin
// 协变（covariant）：out，只能"输出"（读）
// 相当于 Java 的 ? extends T
interface Source<out T> {
    fun next(): T        // T 只能出现在返回位置
    // fun set(t: T)     // ✗ 不能有 T 作为参数
}

// 逆变（contravariant）：in，只能"输入"（写）
// 相当于 Java 的 ? super T
interface Sink<in T> {
    fun accept(item: T)  // T 只能出现在参数位置
}

// 使用
val source: Source<Any> = ...
val strSource: Source<String> = source    // ✓ 协变：Source<String> 是 Source<Any> 的子类型
```

:::

**型变规则记忆**：

```text
out T：生产者（Producer），只读，T 在返回类型
in T ：消费者（Consumer），只写，T 在参数类型

协变方向：Source<Sub> 是 Source<Super> 的子类型
逆变方向：Sink<Super> 是 Sink<Sub> 的子类型
```

### 3.3 使用处型变（类型投影）

::: code-tabs

@tab:active Java

```java
// 等价写法：Java 使用处通配符
static void copy(Object[] from, Object[] to) { }
// from 只能是"生产者"（协变），防止误写：可传子类型数组
static <T> void copy2(List<? extends T> from, List<T> to) { }

static void addAll(List<? super String> items) { }
// items 只能是"消费者"（逆变），可写 String
```

@tab Kotlin

```kotlin
// 不想在声明处修改，可在使用时投影
fun copy(from: Array<out Any>, to: Array<Any>) { }
// from 只能是"生产者"（out 投影），防止误写

fun addAll(items: MutableList<in String>) { }
// items 只能是"消费者"（in 投影），可写 String
```

:::

## 4. 星投影（Star Projection）

::: code-tabs

@tab:active Java

```java
// 星投影等价写法：List<?> 未知元素类型，只能读 Object
static void printSize(List<?> list) {
    System.out.println(list.size());
}

// 使用场景：只关心集合的操作，不关心具体类型
static <T> T firstOrNullSafe(List<T> list) { return ...; }
```

@tab Kotlin

```kotlin
// 星投影：不知道具体类型，但类型安全

// List<*>：元素类型未知，只能读 Any?
fun printSize(list: List<*>) {
    println(list.size)
}

// 使用场景：只关心集合的操作，不关心具体类型
fun <T> List<T>.firstOrNullSafe(): T? = ...
```

:::

## 5. reified 实化类型

::: code-tabs

@tab:active Java

```java
// JVM 泛型会擦除（erasure），运行时拿不到类型
// Java 需显式传入 Class 参数实现类似效果

static <T> List<T> filterIsInstance(List<?> list, Class<T> clazz) {
    List<T> result = new ArrayList<>();
    for (Object item : list) {
        if (clazz.isInstance(item)) {     // ✓ 等价于 is T
            result.add(clazz.cast(item));
        }
    }
    return result;
}

// 使用
List<?> numbers = Arrays.asList(1, "two", 3.0);
List<Integer> ints = filterIsInstance(numbers, Integer.class);   // [1]
```

@tab Kotlin

```kotlin
// JVM 泛型会擦除（erasure），运行时拿不到类型
// reified 让内联函数的泛型在运行时可见

inline fun <reified T> List<*>.filterIsInstance(): List<T> {
    return this.filter { it is T }    // ✓ 可以使用 is T
}

// 使用
val numbers = listOf(1, "two", 3.0)
val ints: List<Int> = numbers.filterIsInstance()   // [1]
```

:::

**限制**：

- 必须 `inline`。
- reified 不能用于非内联函数、非公开 API（跨模块需 @PublishedApi）。
- 不能访问 reified 类型的构造器（需要 Class 引用时用 `T::class`）。

## 6. 泛型与协程/集合的实战

::: code-tabs

@tab:active Java

```java
// 泛型工具方法等价写法
static <T> List<List<T>> chunkedBy(List<T> list, Predicate<T> predicate) { ... }

// 类型别名等价写法：Java 无 typealias，直接使用类型
// typealias UserList = List<User> → 直接用 List<User>

// 泛型 + 惰性初始化等价写法
class LazyBox<T> {
    private final Supplier<T> initializer;
    private T value;
    LazyBox(Supplier<T> initializer) { this.initializer = initializer; }
    T getValue() {
        if (value == null) value = initializer.get();
        return value;
    }
}

// 泛型函数等价写法
static <T, R> List<R> map(List<T> list, Function<T, R> transform) {
    List<R> result = new ArrayList<>();
    for (T item : list) result.add(transform.apply(item));
    return result;
}
```

@tab Kotlin

```kotlin
// 泛型 + 扩展函数
fun <T> List<T>.chunkedBy(predicate: (T) -> Boolean): List<List<T>> { ... }

// 泛型 + 类型别名
typealias UserList = List<User>

// 泛型 + 委托
class LazyBox<T>(private val initializer: () -> T) {
    val value: T by lazy(initializer)
}

// 泛型函数的常用写法
fun <T, R> List<T>.map(transform: (T) -> R): List<R> {
    val result = mutableListOf<R>()
    for (item in this) result.add(transform(item))
    return result
}
```

:::

## 7. Java 互操作

::: code-tabs

@tab:active Java

```java
// Java 中的 ? extends T 在 Kotlin 中变为 out T
// Java 中的 ? super T 在 Kotlin 中变为 in T

// Java 的原始类型（raw type）在 Kotlin 中视为 out Any?
```

@tab Kotlin

```kotlin
// Java 中的 ? extends T 在 Kotlin 中变为 out T
// Java 中的 ? super T 在 Kotlin 中变为 in T

// Java 的原始类型（raw type）在 Kotlin 中视为 out Any?
```

:::

## 8. 高频面试题

**Q1：什么是协变与逆变？out 和 in 的区别？**
A：协变（out）让 `Source<Sub>` 是 `Source<Super>` 的子类型，T 只能出现在
返回位置（生产者）；逆变（in）相反，T 只能出现在参数位置（消费者）。
Kotlin 在声明处用 out/in 标注，Java 用 `? extends / ? super`（使用处）。

**Q2：为什么 Kotlin 的 List 是协变的而 MutableList 不是？**
A：`List<out T>` 声明为协变，只读操作安全（元素不会"变坏"）；
`MutableList<T>` 可写，写入可能破坏类型安全，所以保持不可变（invariant）。

**Q3：什么是泛型擦除？Kotlin 怎么解决？**
A：JVM 在运行时擦除泛型类型参数（编译期检查）。Kotlin 用 `reified` +
`inline` 让类型在运行时可见（编译器内联时保留类型信息），支持 `is T`、
`T::class` 等操作。

**Q4：星投影 `List<*>` 是什么？**
A：未知元素类型的 List，只能安全读取为 `Any?`，不能写入具体类型。
用于只想操作集合结构、不关心元素的场景（如打印 size）。

**Q5：Java 的 PECS 原则和 Kotlin 的对应关系？**
A：PECS（Producer Extends, Consumer Super）即生产者用 extends（协变）、
消费者用 super（逆变）。Kotlin 用 `out`（生产者/协变）与 `in`（消费者/逆变）
替代，且可在声明处标注，使用更简洁安全。

## 9. 小结

- 泛型 = 类型参数化，编译期类型安全。
- out 只读（协变），in 只写（逆变）。
- reified + inline 解决运行时类型获取。
- 星投影处理未知类型集合。
- 面试重点：型变方向、PECS、擦除与 reified。
