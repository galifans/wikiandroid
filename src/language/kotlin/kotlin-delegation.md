---
icon: delegate
title: Kotlin 委托机制与内联函数
description: Kotlin by 委托、属性委托、lazy/observable、数据类 componentN 深度解析
---

# 🔗 Kotlin 委托机制与内联函数

> 委托（Delegation）是 Kotlin 减少样板代码的利器：类委托、属性委托、`lazy`/`by viewModels()` 等扩展背后都是它。理解委托机制，才能真正读懂 Compose、协程等现代框架的源码。

## 一、类委托（Class Delegation）

**组合优于继承**，但手写组合需要转发所有方法。`by` 关键字自动生成转发：

```kotlin
interface IAnimal {
    fun eat()
    fun sleep()
}

class Dog : IAnimal {
    override fun eat() = println("Dog eats bone")
    override fun sleep() = println("Dog sleeps")
}

// 类委托：所有 IAnimal 方法自动转发给 dog
class PetShop(dog: Dog) : IAnimal by dog {
    // 可以覆写个别方法
    override fun eat() = println("PetShop: feed the dog")
}

fun main() {
    val shop = PetShop(Dog())
    shop.eat()    // PetShop: feed the dog（覆写生效）
    shop.sleep()  // Dog sleeps（转发给 dog）
}
```

### 应用场景

| 场景 | 说明 |
|------|------|
| 装饰器模式 | 不修改原类增强功能 |
| 集合包装 | 继承 `MutableList` 的委托实现 |
| 接口多实现 | 一个类委托给多个对象分别实现不同接口 |

> 💡 **Kotlin 集合源码**大量使用委托：`List` 实现类内部对 `arrayListOf` 等委托转发。

## 二、属性委托（Property Delegation）

**属性委托**把属性的 getter/setter 交给委托对象实现：

```kotlin
class Person {
    var name: String by NameDelegate()   // get/set 交给 NameDelegate
}

class NameDelegate {
    private var value = ""
    operator fun getValue(thisRef: Any?, property: KProperty<*>): String {
        println("读取 ${property.name}")
        return value
    }
    operator fun setValue(thisRef: Any?, property: KProperty<*>, value: String) {
        println("写入 ${property.name} = $value")
        this.value = value
    }
}

// 使用
val p = Person()
p.name = "tom"   // 写入 name = tom
println(p.name)  // 读取 name → tom
```

### 语法要求

委托对象必须实现两个操作符：

```kotlin
operator fun getValue(thisRef: Any?, property: KProperty<*>): T
operator fun setValue(thisRef: Any?, property: KProperty<*>, value: T)   // var 需要
```

## 三、标准库属性委托

### 3.1 `lazy` 惰性初始化

```kotlin
// 第一次访问才初始化，之后缓存（线程安全默认）
class MainActivity : AppCompatActivity() {
    private val mViewModel: MainViewModel by lazy {
        ViewModelProvider(this)[MainViewModel::class.java]
    }
}
```

| `lazy` 模式 | 线程安全 | 场景 |
|-------------|---------|------|
| `LazyThreadSafetyMode.SYNCHRONIZED`（默认） | ✅ 加锁 | 多线程并发访问 |
| `PUBLICATION` | ✅ 无锁 | 允许重复计算 |
| `NONE` | ❌ | 单线程（如主线程） |

### 3.2 `observable` / `vetoable` 观察属性变化

```kotlin
var score by observable(0) { _, old, new ->
    println("score: $old -> $new")
}

var age by vetoable(18) { _, _, new ->
    new in 0..150    // 返回 false 则拒绝赋值
}

age = 200   // 被拒绝，仍是 18
```

### 3.3 `by map` 委托给 Map

```kotlin
class Config(map: Map<String, Any?>) {
    val name: String by map
    val version: Int by map
}
val cfg = Config(mapOf("name" to "app", "version" to 1))
println(cfg.name)    // app（从 map 读取）
```

> 📖 经典应用：Gson 解析、Bundle/Intent extras 封装、SharedPreferences 封装都可用 `by map` 或自定义委托。

## 四、`by lazy` vs `lateinit`

| 对比项 | `lateinit var` | `by lazy` |
|--------|---------------|-----------|
| 适用类型 | var（非空、非基本类型） | val |
| 初始化时机 | 手动在代码中赋值 | 第一次访问时自动 |
| 线程安全 | 无 | 默认 SYNCHRONIZED |
| 反初始化 | 可判断 `::x.isInitialized` | 无 |
| 典型场景 | DI 注入、findViewById | ViewModel、昂贵资源 |

```kotlin
// lateinit：必须手动赋值
lateinit var adapter: RecyclerView.Adapter<*>
if (::adapter.isInitialized) { /* 已初始化 */ }

// lazy：自动惰性初始化
val repository: UserRepository by lazy { UserRepository() }
```

## 五、委托在 Android 生态的应用

### 5.1 `by viewModels()`

```kotlin
// activity-ktx / fragment-ktx
class MainActivity : AppCompatActivity() {
    private val vm: MainViewModel by viewModels()
}
```

本质是属性委托：`getValue` 时通过 `ViewModelProvider` 获取实例。

### 5.2 `by lazy` + `binding`

```kotlin
private val binding: ActivityMainBinding by lazy {
    ActivityMainBinding.inflate(layoutInflater)
}
```

### 5.3 自定义委托封装 SharedPreferences

```kotlin
class PrefDelegate<T>(
    private val prefs: SharedPreferences,
    private val key: String,
    private val default: T
) {
    @Suppress("UNCHECKED_CAST")
    operator fun getValue(thisRef: Any?, p: KProperty<*>): T {
        val value = when (default) {
            is Int -> prefs.getInt(key, default as Int)
            is String -> prefs.getString(key, default as String)
            is Boolean -> prefs.getBoolean(key, default as Boolean)
            else -> throw IllegalArgumentException()
        }
        return value as T
    }
    operator fun setValue(thisRef: Any?, p: KProperty<*>, value: T) {
        prefs.edit().apply {
            when (value) {
                is Int -> putInt(key, value)
                is String -> putString(key, value)
                is Boolean -> putBoolean(key, value)
            }
        }.apply()
    }
}

// 使用
var userName: String by PrefDelegate(prefs, "user_name", "")
```

## 六、数据类与解构

`data class` 自动生成 `componentN()` 支持解构：

```kotlin
data class User(val name: String, val age: Int)

val (name, age) = User("tom", 20)   // 解构声明
// 等价于 val name = user.component1(); val age = user.component2()
```

```mermaid
flowchart TD
    A[data class User] --> B[component1 返回 name]
    A --> C[component2 返回 age]
    B --> D[解构声明 val name, age = user]
    C --> D
    A --> E[copy / equals / hashCode / toString]
```

### 解构的应用

```kotlin
// Map 遍历
for ((key, value) in mapOf("a" to 1)) { }

// 返回两个值
val (x, y) = getPosition()   // 返回 Pair 或自定义类

// 集合转换
val (name, age) = listOf("tom", 20).let { it[0] to it[1] }
```

## 七、内联函数与 reified 回顾

```kotlin
// inline + reified 是委托与泛型操作的黄金搭档
inline fun <reified T> Context.sysService(): T? {
    val serviceName: String = when (T::class) {
        LayoutInflater::class -> Context.LAYOUT_INFLATER_SERVICE
        else -> return null
    }
    return getSystemService(serviceName) as? T
}

// 使用
val inflater: LayoutInflater? = sysService<LayoutInflater>()
```

## 八、高频面试题

### Q1：`by lazy` 和 `lateinit` 有什么区别？
::: details 查看答案
① 修饰类型：`lazy` 用于 `val`（不可变），`lateinit` 用于 `var`（可变）；② 初始化时机：`lazy` 第一次访问时自动初始化，`lateinit` 必须手动赋值；③ 线程安全：`lazy` 默认同步锁（SYNCHRONIZED 模式），`lateinit` 无任何保护；④ 判空：`lateinit` 可用 `::x.isInitialized` 判断，`lazy` 不能；⑤ `lateinit` 不支持基本类型（Int/Long 等）。Android 中 DI 注入用 `lateinit`，昂贵延迟资源用 `lazy`。
:::

### Q2：类委托 `by` 与继承有什么区别？为什么 Kotlin 推荐组合？
::: details 查看答案
继承是 is-a 关系，子类与父类强耦合，Java 只允许单继承；委托是 has-a 关系，`by` 自动生成转发方法，实现接口级复用，多个接口可委托给不同对象（多组合）。委托不破坏封装、灵活可替换，符合"组合优于继承"原则。Kotlin 默认类为 final，也侧面推动使用委托。
:::

### Q3：属性委托的实现原理？委托对象需要实现什么方法？
::: details 查看答案
属性委托是把属性的读写操作**重定向**到委托对象。委托对象需要实现 `getValue(thisRef: KProperty, property: KProperty<*>)` 操作符，`var` 属性还需 `setValue`。编译后，属性的 getter 内部调用委托的 `getValue`，setter 调用 `setValue`。`by lazy`、`by viewModels()`、`by map` 都是标准库或框架提供的委托实现。
:::

### Q4：`lazy` 的三种线程模式分别是什么？
::: details 查看答案
`SYNCHRONIZED`（默认）：初始化加锁，多线程并发访问时只初始化一次，线程安全；`PUBLICATION`：无锁，允许多线程同时初始化，但只有一个结果被采用，适合并发竞争少的场景；`NONE`：完全不加锁，仅限单线程场景（如主线程），否则存在竞态条件。
:::

### Q5：数据类自动生成哪些方法？解构的原理是什么？
::: details 查看答案
`data class` 自动生成：`equals`/`hashCode`（基于所有主构造属性）、`toString`、`copy`（拷贝时可按参数名只改部分字段）、`component1()..componentN()`（按属性声明顺序）。解构声明 `val (a, b) = obj` 编译后就是调用 `component1()`/`component2()`。所以任何提供 componentN 的类（不限于 data class）都可以解构。
:::

## 小结

- 类委托 `by` 实现接口复用，优于继承
- 属性委托把 get/set 交给 `getValue`/`setValue` 委托对象
- 标准库委托：`lazy`、`observable`/`vetoable`、`by map`
- `lateinit` 与 `by lazy` 按可变性/初始化时机/线程安全选型
- `by viewModels()`、SharedPreferences 封装都是委托的实际应用
- `data class` 的 `componentN()` 支撑解构声明

> 📖 进阶阅读：[Kotlin 扩展函数](/language/kotlin/kotlin-extensions.md) | [Kotlin 泛型详解](/language/kotlin/kotlin-generics.md) | [Kotlin 函数式编程与高阶函数](/language/kotlin/kotlin-functional.md)
