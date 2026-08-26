---
icon: testing
title: 单元测试实践
description: 单元测试分层、JUnit + MockK + Robolectric、测试用例设计、覆盖率、测试工程实践
---

# 单元测试实践

> 面试高频指数：中
> 单元测试保障核心逻辑质量，是工程化的基本功。

## 1. 为什么要单元测试

```text
价值：
- 尽早发现问题（回归保护）
- 重构安全网（改动不破坏功能）
- 文档化（用例即规格说明）
- 质量指标（覆盖率）

测试金字塔：
        UI 测试（少，贵）
       / 集成测试（中）  \
      / 单元测试（多，快）\
```

## 2. 测试什么（优先级）

```text
优先测试：
① 业务逻辑（金额计算、状态机、判断分支）
② 数据处理（解析、转换、过滤）
③ ViewModel（状态流转）
④ 工具类（格式化、加密、校验）
⑤ Repository（mock 数据源后的逻辑）

不测/少测：
- 简单 getter/setter
- 纯 UI 渲染
- 框架代码（系统行为）
```

## 3. 技术栈

```kotlin
// 依赖（build.gradle）
dependencies {
    // JVM 单元测试
    testImplementation("junit:junit:4.13.2")

    // Mock（Kotlin 首选 MockK）
    testImplementation("io.mockk:mockk:1.13.12")

    // JVM 模拟 Android 环境
    testImplementation("org.robolectric:robolectric:4.13")

    // 协程测试
    testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test:1.8.1")
}
```

## 4. 基础用例示例

::: code-tabs

@tab:active Java

```java
// ① 纯逻辑测试（JUnit）
public class PriceCalculatorTest {

    private final PriceCalculator calculator = new PriceCalculator();

    @Test
    public void 打折后价格计算正确() {
        double price = calculator.calculate(100.0, 0.8);
        assertEquals(80.0, price, 0.01);
    }

    @Test
    public void 折扣为负时抛异常() {
        assertThrows(IllegalArgumentException.class, () ->
                calculator.calculate(100.0, -0.1));
    }
}
```

@tab Kotlin

```kotlin
// ① 纯逻辑测试（JUnit）
class PriceCalculatorTest {

    private val calculator = PriceCalculator()

    @Test
    fun `打折后价格计算正确`() {
        val price = calculator.calculate(100.0, discount = 0.8)
        assertEquals(80.0, price, 0.01)
    }

    @Test
    fun `折扣为负时抛异常`() {
        assertThrows(IllegalArgumentException::class.java) {
            calculator.calculate(100.0, discount = -0.1)
        }
    }
}
```

:::

::: code-tabs

@tab:active Java

```java
// ② ViewModel 测试（Mockito + coroutines-test）
public class LoginViewModelTest {

    private final LoginRepository repository = Mockito.mock(LoginRepository.class);
    private LoginViewModel viewModel;

    @Before
    public void setup() {
        viewModel = new LoginViewModel(repository);
    }

    @Test
    public void 登录成功状态流转正确() throws Exception {
        when(repository.login("user", "123")).thenReturn(new User("user"));

        runBlocking(cont -> { viewModel.login("user", "123"); return null; });

        assertEquals(LoginState.Success, viewModel.getState().getValue());
    }

    @Test
    public void 登录失败显示错误信息() throws Exception {
        when(repository.login("user", "wrong")).thenThrow(new RuntimeException("网络错误"));

        runBlocking(cont -> { viewModel.login("user", "wrong"); return null; });

        assertTrue(viewModel.getState().getValue() instanceof LoginState.Error);
    }
}
```

@tab Kotlin

```kotlin
// ② ViewModel 测试（MockK + coroutines-test）
class LoginViewModelTest {

    private val repository = mockk<LoginRepository>()
    private lateinit var viewModel: LoginViewModel

    @Before
    fun setup() {
        viewModel = LoginViewModel(repository)
    }

    @Test
    fun `登录成功状态流转正确`() = runTest {
        coEvery { repository.login("user", "123") } returns User("user")

        viewModel.login("user", "123")

        assertEquals(LoginState.Success, viewModel.state.value)
    }

    @Test
    fun `登录失败显示错误信息`() = runTest {
        coEvery { repository.login("user", "wrong") } throws RuntimeException("网络错误")

        viewModel.login("user", "wrong")

        assertTrue(viewModel.state.value is LoginState.Error)
    }
}
```

:::

::: code-tabs

@tab:active Java

```java
// ③ 测试技巧
// runTest：协程测试（虚拟时间，无需等待）——Java 中用 runBlocking 包裹
// coEvery/coVerify：挂起函数 mock——用 Mockito when/verify
// verify：验证调用次数
@Test
public void 缓存命中不请求网络() throws Exception {
    when(api.getUser("1")).thenReturn(userDto);

    runBlocking(cont -> {
        repository.getUser("1");
        repository.getUser("1");
        return null;
    });

    verify(api, times(1)).getUser("1"); // 只请求一次（缓存生效）
}
```

@tab Kotlin

```kotlin
// ③ 测试技巧
// runTest：协程测试（虚拟时间，无需等待）
// coEvery/coVerify：挂起函数 mock
// verify：验证调用次数
@Test
fun `缓存命中不请求网络`() = runTest {
    coEvery { api.getUser("1") } returns userDto

    repository.getUser("1")
    repository.getUser("1")

    coVerify(exactly = 1) { api.getUser("1") } // 只请求一次（缓存生效）
}
```

:::

## 5. Robolectric（JVM 模拟 Android）

::: code-tabs

@tab:active Java

```java
// 需要 Android 依赖的测试（如 Context、SharedPreferences）
@RunWith(RobolectricTestRunner.class)
public class PrefsManagerTest {

    @Test
    public void 保存并读取配置() {
        Context context = ApplicationProvider.getApplicationContext();
        PrefsManager manager = new PrefsManager(context);

        manager.putString("key", "value");

        assertEquals("value", manager.getString("key"));
    }
}
```

@tab Kotlin

```kotlin
// 需要 Android 依赖的测试（如 Context、SharedPreferences）
@RunWith(RobolectricTestRunner::class)
class PrefsManagerTest {

    @Test
    fun `保存并读取配置`() {
        val context = ApplicationProvider.getApplicationContext<Context>()
        val manager = PrefsManager(context)

        manager.putString("key", "value")

        assertEquals("value", manager.getString("key"))
    }
}
```

:::

## 6. 覆盖率与工程实践

```groovy
// JaCoCo 覆盖率
plugins {
    id("jacoco")
}

// 运行覆盖率
./gradlew :app:testDebugUnitTestCoverage
// 报告：app/build/reports/coverage/debug/index.html
```

```text
实践建议：
- 核心模块覆盖率目标 60%+
- 每个 bug 修复补回归测试
- 测试命名用中文/行为描述（可读性）
- CI 中运行测试（质量门禁）
- 重构时测试先行（TDD 可选）
```

## 7. 高频面试题

**Q1：单元测试测哪些？怎么测？**
A：核心业务逻辑（计算/状态/数据处理）、ViewModel、工具类。
用 JUnit + MockK（mock 依赖）+ coroutines-test（协程）+ Robolectric
（Android 环境）。原则：测行为不测实现。

**Q2：MockK 和 Mockito 区别？**
A：MockK 专为 Kotlin 设计：支持协程（coEvery）、data class、
顶层函数、final 类 mock；Mockito 是 Java 生态（需要 mockito-inline
支持 Kotlin，协程需额外适配）。Kotlin 项目推荐 MockK。

**Q3：runTest 是什么？**
A：kotlinx-coroutines-test 的测试作用域：提供虚拟时间（跳过 delay）、
自动等待协程完成、异常传播。测试挂起函数/ViewModel 的标准方式。

**Q4：覆盖率 100% 必要吗？**
A：不必。覆盖率是辅助指标（找未测代码），不是目标。
优先保证核心逻辑覆盖率与用例质量（断言有效性），避免为了覆盖率
写无意义用例。

**Q5：如何测试协程中的异常？**
A：runTest 中协程异常会传播到测试（自动失败）；
断言具体异常用 assertThrows/runCatching；需要验证部分完成时
用 advanceUntilIdle/runCurrent 控制虚拟时间。

## 8. 小结

- 单元测试金字塔底座：多、快、稳定。
- 技术栈：JUnit + MockK + coroutines-test + Robolectric。
- 测行为（输入 → 输出/状态），mock 掉依赖。
- 覆盖率是手段不是目标，核心逻辑优先。
- 面试重点：测什么、MockK、runTest、覆盖率认知。
