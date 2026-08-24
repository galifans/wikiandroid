---
icon: rocket
title: Java 进阶特性
---

# Java 进阶特性

> 本章补充 Java 中容易被忽视但面试常考的知识点：static、final、内部类、匿名内部类、动态代理与注解。

## 一、static 关键字

- static 修饰的方法或变量不依赖于对象即可访问，只要类被加载，就可以通过类名直接访问。
- 静态变量被所有对象共享，**在内存中只有一个副本**，当且仅当类初次加载时被初始化。
- 所有的静态方法和静态变量都可以通过对象访问（只要访问权限足够），因此可以通过 this 访问静态成员。
- static **不允许**修饰局部变量。
- 静态代码块在类加载时执行，常用于初始化静态资源。

## 二、final 关键字

| 修饰目标 | 作用 |
| --- | --- |
| 成员变量 | 必须在声明时初始化或在构造器中初始化，否则编译错误；只读 |
| 方法 | 不可以被子类重写 |
| 类 | 功能完整，不能被继承 |
| 本地变量 | 赋值后不可再修改 |

**final 与多线程/性能：**

- final 变量可以安全地在多线程环境下共享，无需额外的同步开销（JMM 对 final 字段的初始化保证）。
- final 关键字提高了性能：JVM 和 Java 应用会缓存 final 变量，JVM 会对方法、变量及类进行优化。

**final 与内部类：** 方法内部的（匿名）内部类访问方法中的局部变量时，该变量必须用 final 修饰（Java 8 起可省略但语义不变）。

## 三、内部类

| 对比项 | 非静态内部类 | 静态内部类 |
| --- | --- | --- |
| 实例化 | 必须先创建外部类对象，再通过外部类对象调用内部类构造器 | 可直接通过外部类调用内部类构造器 |
| 访问外部类成员 | 可直接访问外部类所有数据（包括私有数据） | 只能访问外部类的静态成员 |
| 在外部类静态方法中实例化 | 不行 | 可以 |

补充：非静态内部类的方法可以直接访问外部类的所有数据（包括私有数据），因为它持有外部类对象的引用。

## 四、匿名内部类

- 不能定义任何静态成员、静态方法。
- 方法不能是抽象的。
- 必须实现接口或抽象父类的所有抽象方法。
- 不能定义构造器（没有类名）。
- 访问外部类的成员变量或成员方法时，必须用 final 修饰（Java 8 后为 effectively final）。

典型应用：Android 中的事件监听、回调、Runnable 等。

## 五、动态代理

动态代理在运行期动态生成代理类，无需手动编写代理类。Java 提供 `java.lang.reflect.Proxy` 支持基于接口的动态代理。

```java
// 定义接口
public interface BaseInterface {
    void doSomething();
}

// 实现类
public class BaseImpl implements BaseInterface {
    @Override
    public void doSomething() {
        System.out.println("doSomething");
    }
}

// 动态代理
BaseImpl base = new BaseImpl();
BaseInterface proxyInstance = (BaseInterface) Proxy.newProxyInstance(
        base.getClass().getClassLoader(),
        base.getClass().getInterfaces(),
        new InvocationHandler() {
            @Override
            public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
                if (method.getName().equals("doSomething")) {
                    method.invoke(base, args);
                    System.out.println("do more");
                }
                return null;
            }
        });

proxyInstance.doSomething();
```

**核心要素：**

- `Proxy.newProxyInstance(ClassLoader, Class<?>[] interfaces, InvocationHandler)` 生成代理对象。
- `InvocationHandler.invoke()` 中可对方法调用做增强（如日志、权限、事务）。
- 代理类缓存在 `proxyClassCache`（WeakCache）中，避免重复生成。

**典型应用：** Retrofit 动态接口、AOP 切面、Android 的插件化/热修复框架等。

## 六、元注解

元注解是注解的注解，用于定义新注解时使用：

| 元注解 | 作用 |
| --- | --- |
| @Target | 指定注解可以修饰的目标（类、方法、字段、参数等） |
| @Retention | 指定注解保留策略（SOURCE 源码、CLASS 字节码、RUNTIME 运行时） |
| @Documented | 注解是否包含在 javadoc 中 |
| @Inherited | 注解是否可被继承 |
| @Repeatable | 注解是否可重复使用（Java 8 引入） |

**Retention 三个级别：**

| 策略 | 说明 | 典型应用 |
| --- | --- | --- |
| SOURCE | 源码中有效，编译后丢弃 | @Override、@SuppressWarnings |
| CLASS | 字节码中保留，运行时不可反射获取 | 默认策略 |
| RUNTIME | 运行时保留，可通过反射读取 | 注解框架（Retrofit、ButterKnife 等） |
