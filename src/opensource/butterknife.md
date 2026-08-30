---
icon: magnet
title: ButterKnife 视图注入框架
description: ButterKnife APT 注解处理、代码生成、findViewById 原理与 ButterKnife/ViewBinding 对比全解
---

# ButterKnife 视图注入框架

> 面试高频指数：中

> ButterKnife 是 Jake Wharton 大神的经典之作，使用 APT + 注解攻破了 findViewById()：编译期扫描 @BindView 注解并生成绑定代码，让视图注入零反射、零运行时开销。虽然已被 ViewBinding 取代，但它背后的注解处理器思想至今仍是 Android 框架的基石。

## 一、组件定位

### 1.1 解决什么问题

传统写法每个 View 都要写一遍 `findViewById`，还要手写类型强转：

::: code-tabs

@tab:active Java

```java
// 传统写法：繁琐且易错
TextView tvName = findViewById(R.id.tv_name);
Button btnSubmit = findViewById(R.id.btn_submit);
ImageView ivAvatar = findViewById(R.id.iv_avatar);
```

@tab Kotlin

```kotlin
// 传统写法：繁琐且易错
val tvName: TextView = findViewById(R.id.tv_name)
val btnSubmit: Button = findViewById(R.id.btn_submit)
val ivAvatar: ImageView = findViewById(R.id.iv_avatar)
```

:::

ButterKnife 用注解一行搞定：

::: code-tabs

@tab:active Java

```java
public class MainActivity extends AppCompatActivity {

    @BindView(R.id.tv_name)
    TextView tvName;

    @BindView(R.id.btn_submit)
    Button btnSubmit;

    @BindView(R.id.iv_avatar)
    ImageView ivAvatar;

    @OnClick(R.id.btn_submit)
    void submit() {
        // 点击处理
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        ButterKnife.bind(this);
    }
}
```

@tab Kotlin

```kotlin
class MainActivity : AppCompatActivity() {

    @BindView(R.id.tv_name)
    lateinit var tvName: TextView

    @BindView(R.id.btn_submit)
    lateinit var btnSubmit: Button

    @BindView(R.id.iv_avatar)
    lateinit var ivAvatar: ImageView

    @OnClick(R.id.btn_submit)
    fun submit() {
        // 点击处理
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        ButterKnife.bind(this)
    }
}
```

:::

### 1.2 核心能力

| 能力 | 注解 | 说明 |
|------|------|------|
| 视图绑定 | @BindView | 替换 findViewById + 强转 |
| 事件绑定 | @OnClick / @OnLongClick 等 | 替换 setOnClickListener |
| 资源绑定 | @BindString / @BindColor 等 | 替换 getString / getColor |
| 多布局 | @BindViews | 一次绑定多个 View 为 List |

## 二、核心原理：APT 注解处理

### 2.1 APT 是什么

**APT（Annotation Processing Tool，注解处理器）** 是 Java 编译期的一种机制：编译器在编译源码时调用注册的注解处理器，读取注解信息并**生成新的 Java 源码**，生成的源码参与后续编译。

```mermaid
flowchart LR
    A[源码<br>#64;BindView 注解] --> B[Java 编译器<br>javac]
    B --> C[注解处理器<br>ButterKnifeProcessor]
    C --> D[生成绑定类<br>MainActivity_ViewBinding]
    D --> E[参与编译<br>直接调用 findViewById]
```

### 2.2 生成代码长什么样

ButterKnife 为每个 Activity 生成 `xxx_ViewBinding` 类，内部就是最朴素的 findViewById：

::: code-tabs

@tab:active Java

```java
// 编译期生成的 MainActivity_ViewBinding
public class MainActivity_ViewBinding implements Unbinder {
    public MainActivity_ViewBinding(MainActivity target) {
        tvName = (TextView) target.findViewById(R.id.tv_name);
        btnSubmit = (Button) target.findViewById(R.id.btn_submit);
        ivAvatar = (ImageView) target.findViewById(R.id.iv_avatar);
        btnSubmit.setOnClickListener(new DebouncingOnClickListener() {
            @Override
            public void doClick(View v) {
                target.submit();
            }
        });
    }
}
```

@tab Kotlin

```kotlin
// 编译期生成的 MainActivity_ViewBinding（示意）
class MainActivity_ViewBinding(target: MainActivity) : Unbinder {
    init {
        tvName = target.findViewById(R.id.tv_name)
        btnSubmit = target.findViewById(R.id.btn_submit)
        ivAvatar = target.findViewById(R.id.iv_avatar)
        btnSubmit.setOnClickListener(
            DebouncingOnClickListener { target.submit() }
        )
    }
}
```

:::

### 2.3 运行时零反射

| 对比项 | 反射方案（如 xUtils） | ButterKnife |
|--------|----------------------|-------------|
| 时机 | 运行时反射解析注解 | 编译期生成代码 |
| 性能 | 反射调用慢 | 直接方法调用 |
| 体积 | 无额外开销 | 每个类多生成一个类 |

注解本身在编译期被消费，运行时只剩下普通代码，因此 **零反射、零运行时开销**。

## 三、为什么被 ViewBinding 取代

| 对比项 | ButterKnife | ViewBinding |
|--------|-------------|-------------|
| 官方支持 | 第三方（已停止维护） | Google 官方 |
| 空安全 | 无 | 支持（可空类型自动判空） |
| 类型安全 | 编译期生成 | 编译期生成 |
| 代码量 | 需要注解 + bind() | 无注解，直接使用 |
| 模块支持 | 支持 | 支持 |

> ViewBinding 继承自 ButterKnife 的设计思想（编译期生成），但更安全、更简洁，是官方推荐方案。

## 四、高频面试题

### Q1：ButterKnife 的实现原理是什么？

::: details 查看答案

核心是 APT 注解处理器：编译期扫描 @BindView 等注解，为每个类生成 ViewBinding 绑定类，内部直接调用 findViewById 并设置监听器；运行时 ButterKnife.bind() 通过反射查找生成的绑定类并实例化（只反射类名一次，不反射字段）。真正的视图查找是编译期生成的普通代码，零反射开销。

:::

### Q2：注解处理器（APT）与反射有什么本质区别？

::: details 查看答案

APT 在编译期处理注解并生成源码，运行时没有注解解析逻辑，性能好；反射在运行时动态读取注解与字段，灵活但慢且存在混淆问题。ButterKnife 选择 APT 正是为了把开销从运行时转移到编译期。

:::

### Q3：ButterKnife.bind() 是怎么找到生成类的？

::: details 查看答案

bind() 根据目标类名拼接生成类的类名（如 MainActivity → MainActivity_ViewBinding），通过 Class.forName 查找并实例化，然后调用其构造方法完成绑定。只反射一次类名，之后全是普通方法调用。

:::

### Q4：ButterKnife 与 ViewBinding 有什么区别？为什么被取代？

::: details 查看答案

两者都是编译期生成，但 ViewBinding 由 Google 官方维护：支持空安全与类型安全、无需注解与 bind() 调用、代码更简洁，且适配 DataBinding 生态。ButterKnife 已停止维护，官方推荐迁移到 ViewBinding，因此新项目不应再使用 ButterKnife。

:::

### Q5：自定义注解处理器一般分为哪几步？

::: details 查看答案

一是继承 AbstractProcessor 并声明支持的注解类型（getSupportedAnnotationTypes）；二是在 process() 中读取被注解的元素（Element）；三是用 JavaPoet 等工具生成新源码文件；四是注册处理器（META-INF/services 或注解声明）。这就是 ARouter、Dagger2 等框架的共性骨架。

:::

## 小结

- ButterKnife = APT + 注解，编译期生成绑定代码。
- 运行时零反射，findViewById 被「编译期攻破」。
- 核心注解：@BindView / @OnClick / @BindString / @BindViews。
- 已被 ViewBinding 取代，但注解处理器思想至今是框架基石。

> 进阶阅读：[Dagger2 依赖注入框架](dagger2.md) | [设计模式汇总](/language/design-pattern/设计模式汇总.md) | [Java 注解与动态代理](/language/java/basics/java-advanced.md)
