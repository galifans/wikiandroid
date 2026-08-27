---
icon: language
title: Java 语言基础
---

# Java 语言基础

> 本章梳理 Java 语言的核心基础知识，覆盖基本数据类型、运算符细节、引用类型、字符串、面向对象三大特征、泛型、异常体系等面试高频考点。

## 一、八种基本数据类型

Java 共有八种基本数据类型，每种都有对应的包装类：

| 类型 | 大小 | 包装类 | 默认值 | 取值范围 |
| --- | --- | --- | --- | --- |
| byte | 1 字节 | Byte | 0 | -128 ~ 127 |
| short | 2 字节 | Short | 0 | -32768 ~ 32767 |
| int | 4 字节 | Integer | 0 | -2^31 ~ 2^31-1 |
| long | 8 字节 | Long | 0L | -2^63 ~ 2^63-1 |
| float | 4 字节 | Float | 0.0f | 约 ±3.4E38 |
| double | 8 字节 | Double | 0.0d | 约 ±1.7E308 |
| char | 2 字节 | Character | '\u0000' | 0 ~ 65535 |
| boolean | 未明确定义 | Boolean | false | true / false |

要点：`char` 在 Java 中占 2 字节（Unicode 字符）；`boolean` 单独使用占 4 字节、在数组中占 1 字节（取决于 JVM 实现）。

## 二、switch 支持的数据类型

- Java 5 之前：`switch` 表达式只能是 `byte`、`short`、`char`、`int`。
- Java 5 起：支持 `enum` 枚举类型。
- Java 7 起：支持 `String` 类型。
- `long` 类型在所有版本中都不被支持。

## 三、== 与 equals 的区别

`==` 与 `equals` 的比较逻辑完全不同：

| 比较方式 | 基本数据类型 | 引用类型 |
| --- | --- | --- |
| `==` | 比较值是否相等 | 比较内存地址（是否同一对象） |
| `equals` | 不适用 | 默认比较地址，子类可重写为按内容比较 |

**String 的经典例子：**

::: code-tabs

@tab:active Java

```java
String str1 = "abc";
String str2 = "abc";
System.out.println(str1 == str2);      // true，字符串常量池复用
System.out.println(str1.equals(str2)); // true，内容相同

String str3 = new String("abc");
System.out.println(str1 == str3);      // false，new 创建了新对象
System.out.println(str1.equals(str3)); // true
```

@tab Kotlin

```kotlin
val str1 = "abc"
val str2 = "abc"
println(str1 === str2)      // true，字符串常量池复用（引用比较，等价 Java 的 ==）
println(str1 == str2)       // true，内容相同

val str3 = String("abc")
println(str1 === str3)      // false，new 创建了新对象（引用比较）
println(str1 == str3)       // true
```

:::

理解要点：

1. `String a = "abc"` 会先在字符串常量池中查找，存在则直接复用引用，否则新建并放入池中。
2. `new String("abc")` 明确在堆中创建一个新对象。
3. 重写 `equals` 时要注意 `hashCode` 是否会因对象属性改变而变化，否则在使用散列集合（HashMap、HashSet 等）存储该对象时会出问题。

## 四、Object 的公用方法

`Object` 是所有类的父类，其常用方法如下：

| 方法 | 说明 |
| --- | --- |
| `clone()` | 保护方法，实现浅复制，需实现 Cloneable 接口 |
| `getClass()` | final 方法，获得运行时类型 |
| `toString()` | 返回对象的字符串表示，子类一般会重写 |
| `finalize()` | 释放资源用，调用时机不确定，很少使用 |
| `equals()` | 默认比较地址，子类通常重写 |
| `hashCode()` | 用于哈希查找，重写 equals 时一般也要重写 |
| `wait()` | 使当前线程等待该对象的锁，需持有该对象锁 |
| `notify()` / `notifyAll()` | 唤醒在该对象上等待的线程 |

关于 `equals` 与 `hashCode` 的约定：

- 若 `obj1.equals(obj2) == true`，则 `obj1.hashCode() == obj2.hashCode()` 必须成立。
- 但 hashCode 相等，equals 不一定相等（哈希冲突）。
- 若不重写 `hashCode()`，在 `HashSet` 中添加两个 equals 的对象，两个对象都会被加入。

## 五、Java 的四种引用

JDK 1.2 之前只有强引用，其余三种引用在 JDK 1.2 之后引入：

| 引用类型 | 回收时机 | 典型应用场景 |
| --- | --- | --- |
| 强引用 | GC 时必定不被回收 | 普通对象引用，如 `Object obj = new Object()` |
| 软引用 | 堆将发生 OOM 时回收 | 内存敏感的高速缓存 |
| 弱引用 | 发生 GC 时必定回收 | 缓存、WeakHashMap 等 |
| 虚引用 | 不影响对象生命周期，用于接收 GC 通知 | 对象回收跟踪、NIO 堆外内存回收 |

细节：

- 软引用、弱引用在对象被标记为 finalizable 且 finalize 执行、内存清理后，若引用对象仍存在，会被加入 ReferenceQueue，此时 `get()` 返回 null。
- 虚引用必须传入 ReferenceQueue 才能建立，且无法通过它获取对象实例。

## 六、String、StringBuffer 与 StringBuilder

三种字符串类的对比说明如下：

| 类 | 可变性 | 线程安全 | 效率 | 适用场景 |
| --- | --- | --- | --- | --- |
| String | 不可变（只读） | 安全 | 拼接慢 | 字符串常量、不频繁修改 |
| StringBuffer | 可变 | 安全（synchronized） | 中等 | 多线程字符串拼接 |
| StringBuilder | 可变 | 不安全 | 最高 | 单线程字符串拼接（JDK 1.5 引入） |

## 七、面向对象的三大特征

**封装：** 把数据和操作数据的方法绑定起来，对数据的访问只能通过已定义的接口，隐藏实现细节，只对外提供最简单的编程接口。

**继承：** 从已有类获得信息创建新类的过程。子类（派生类）继承父类（超类、基类）的属性和方法，让系统有延续性，同时是封装程序可变因素的重要手段。

**多态：** 允许不同子类型的对象对同一消息作出不同的响应，即用同样的对象引用调用同样的方法但做了不同的事情。

- 方法重载（Overload）实现编译时多态（前绑定）。
- 方法重写（Override）实现运行时多态（后绑定），这是面向对象最精髓的部分。
- 实现运行时多态需要两个条件：① 方法重写；② 用父类型引用指向子类型对象（对象造型）。

## 八、Override 与 Overload

Override 与 Overload 的对比说明如下：

| 对比项 | Override（重写） | Overload（重载） |
| --- | --- | --- |
| 发生位置 | 子类与父类之间 | 同一个类中 |
| 方法签名 | 名称、参数列表必须相同 | 名称相同，参数个数或类型不同 |
| 返回值 | 必须相同或为其子类 | 可以不同 |
| 表现的多态 | 运行时多态 | 编译时多态 |
| 修饰符 | 访问权限不能比父类更严格 | 无限制 |

## 九、接口与抽象类的区别

接口与抽象类的区别说明如下：

| 对比项 | 抽象类 | 接口 |
| --- | --- | --- |
| 实例化 | 不能实例化，可定义引用 | 不能实例化，可定义引用 |
| 构造器 | 可以定义 | 不能定义 |
| 方法 | 可有抽象方法 + 具体方法 | 全部是抽象方法（Java 8 后有 default/static 方法） |
| 成员访问权限 | private / 默认 / protected / public | 全部是 public |
| 成员变量 | 可以定义成员变量 | 成员变量实际上是常量 |
| 继承 | 单继承 | 多实现 |

## 十、静态内部类与非静态内部类

静态内部类与非静态内部类的对比说明如下：

| 对比项 | 静态内部类 | 非静态内部类 |
| --- | --- | --- |
| 外部类引用 | 不需要持有外部类引用 | 必须持有外部类引用 |
| 访问外部成员 | 只能访问外部类的静态成员 | 可以访问外部类所有成员 |
| 创建方式 | 可独立创建 | 不能脱离外部类实体创建 |

## 十一、多态的实现原理

JVM 执行字节码时，类型信息存储在方法区中。方法区的类型信息中有一个指针，指向记录该类方法的方法表：

1. **方法表构造：** 由于 Java 单继承，方法表最先存放 Object 的方法，其次是父类的方法，最后是类自身的方法。子类重写父类方法时，子类与父类的同名方法共享一个方法表项。
2. **固定偏移量：** 方法表的偏移量总是固定的，如任何类的 equals 方法偏移量都是定值。
3. **调用流程：** 调用方法时，虚拟机通过对象引用得到方法区中类型信息的方法表指针，根据符号引用解析出方法在方法表中的偏移量。子类对象声明为父类类型时，形式上调用父类方法，但虚拟机会从实际的方法表中找到方法地址，从而定位到子类实际的方法。

## 十二、foreach 与 for 循环效率

直接 for 循环效率最高，其次是迭代器，foreach 略慢。

`foreach` 是语法糖，编译成字节码后使用的是迭代器实现：

::: code-tabs

@tab:active Java

```java
// foreach 反编译后的效果
for (Iterator iterator = list.iterator(); iterator.hasNext();) {
    Object t = iterator.next();
}
```

@tab Kotlin

```kotlin
// foreach 反编译后的效果（Kotlin 的 for 循环底层同样基于迭代器）
val iterator = list.iterator()
while (iterator.hasNext()) {
    val t = iterator.next()
}
```

:::

只比迭代器遍历多了生成中间变量这一步，因此性能略微下降。

## 十三、泛型

**优点：**

- 最大限度地重用代码。
- 保护类型安全（编译期检查）。
- 提高性能（减少强制转换）。
- 最常见的用途是创建集合类。

**缺点：**

- 性能上不如数组快。
- 运行时类型信息被擦除（类型擦除机制见 JVM 章节）。

**List&lt;String&gt; 能否转为 List&lt;Object&gt;？** 能，但每次调用里面的函数都要通过强制转换还原回原来的类，这样既不安全，运行速度也慢。

## 十四、XML 解析的三种方式

三种 XML 解析方式的对比说明如下：

| 方式 | 原理 | 特点 |
| --- | --- | --- |
| DOM | 将整个 XML 读入内存构建树结构 | 可随机访问、增删改，但内存占用大 |
| SAX | 事件驱动，边读边解析 | 内存占用小、速度快，但不能随机访问 |
| PULL | 类似 SAX 的拉模式解析（Android 内置） | 开发者主动控制解析流程，效率高 |

## 十五、Java 与 C++ 的对比

- Java 没有指针，使用引用，更安全。
- Java 有自动垃圾回收（GC），C++ 需手动管理内存。
- Java 是单继承，C++ 支持多继承。
- Java 跨平台（JVM 字节码），C++ 编译为平台相关代码。
- Java 有统一的异常体系，C++ 异常处理相对灵活但易出错。
- Java 不支持操作符重载，C++ 支持。

## 十六、JNI 的使用

JNI（Java Native Interface）允许 Java 代码调用其他语言（如 C/C++）编写的本地代码：

1. 编写 Java 类，声明 `native` 方法。
2. 使用 `javac -h` 生成 C/C++ 头文件。
3. 用 C/C++ 实现 native 方法，编译为动态链接库（.so / .dll）。
4. 通过 `System.loadLibrary()` 加载库并调用。

典型场景：性能敏感计算、调用系统底层 API、复用已有 C/C++ 代码库。
