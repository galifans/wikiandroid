---
icon: mock
title: MockK 单元测试实战
description: MockK 基础用法、验证、协程测试、插桩、与 Mockito 对比、最佳实践
---

# MockK 单元测试实战

> MockK 是 Kotlin 生态的 Mock 框架:天然支持协程、object、扩展函数、final 类。用 MockK 写干净的单元测试,让依赖可控、逻辑可验。

## 一、为什么用 MockK

MockK 与 Mockito 的能力对比说明如下：

| 能力 | Mockito | MockK |
|------|---------|-------|
| Kotlin 协程 | 支持弱 | 原生支持 |
| object 单例 | 不支持 | 支持 |
| final 类/方法 | 需 mockito-inline | 直接支持 |
| 扩展函数 | 难 | 支持(mockkStatic) |
| 私有方法 | 不支持 | 支持 |
| 语法 | Java 风格 | Kotlin DSL |

## 二、核心用法

### 2.1 创建 Mock 与 Stub

创建 mock 与打桩的标准写法如下：

::: code-tabs

@tab:active Java

```java
// 创建 mock
OrderRepository repository = Mockito.mock(OrderRepository.class);

// Stub:定义行为
when(repository.getOrder(1)).thenReturn(new Order(1, 99.0));
when(repository.getOrder(anyInt())).thenThrow(new IllegalStateException("not found"));

// 参数匹配
doNothing().when(repository).save(any(), gt(0));
when(repository.search(argThat(s -> s.startsWith("A")))).thenReturn(Collections.emptyList());
```

@tab Kotlin

```kotlin
// 创建 mock
val repository = mockk<OrderRepository>()

// Stub:定义行为
every { repository.getOrder(1) } returns Order(id = 1, amount = 99.0)
every { repository.getOrder(any()) } throws IllegalStateException("not found")

// 参数匹配
every { repository.save(any(), more()) } just Runs
every { repository.search(match { it.startsWith("A") }) } returns listOf()
```

:::

常用打桩 API 的用途说明如下：

| API | 用途 |
|-----|------|
| mockk&lt;T&gt;() | 创建 mock 对象 |
| every { } returns | 定义返回值 |
| every { } throws | 抛异常 |
| every { } just Runs | 无返回值 |
| any() / more() / less() | 任意参数匹配 |
| match { } | 自定义匹配 |

### 2.2 验证调用

验证调用次数与顺序的标准写法如下：

::: code-tabs

@tab:active Java

```java
// 验证:确认交互发生
verify(repository).getOrder(1);
verify(repository, times(2)).save(any());   // 恰好 2 次
verify(repository, atLeast(1)).getOrder(anyInt());
verify(repository, atMost(3)).delete(any());
verify(repository, never()).close();        // 从未调用

// 验证顺序
InOrder inOrder = inOrder(repository);
inOrder.verify(repository).loadConfig();
inOrder.verify(repository).init();
// 宽松验证:确认没有未验证的调用(等价 verifyAll + confirmVerified)
verifyNoMoreInteractions(repository);
```

@tab Kotlin

```kotlin
// 验证:确认交互发生
verify { repository.getOrder(1) }
verify(exactly = 2) { repository.save(any()) }   // 恰好 2 次
verify(atLeast = 1) { repository.getOrder(any()) }
verify(atMost = 3) { repository.delete(any()) }
verify(exactly = 0) { repository.close() }        // 从未调用

// 验证顺序
verifyOrder {
    repository.loadConfig()
    repository.init()
}
// 宽松验证(忽略未验证的调用)
verifyAll { repository.close() }
confirmVerified(repository)   // 确认无其他调用
```

:::

## 三、Spy 与部分 Mock

Spy 与部分 mock 的写法如下：

::: code-tabs

@tab:active Java

```java
// Spy:保留真实实现,只覆盖部分方法
OrderService orderService = Mockito.spy(new OrderService());
when(orderService.calculateTax(any())).thenReturn(0.0);
// 未 stub 的方法走真实实现

// 对已有对象部分 mock
OrderService real = new OrderService();
OrderService spy = Mockito.spy(real);
```

@tab Kotlin

```kotlin
// Spy:保留真实实现,只覆盖部分方法
val orderService = spyk(OrderService())
every { orderService.calculateTax(any()) } returns 0.0
// 未 stub 的方法走真实实现

// 对已有对象部分 mock
val real = OrderService()
val spy = spyk(real)
```

:::

三种 mock 方式的对比说明如下：

| 类型 | 行为 |
|------|------|
| mockk() | 全部打桩,无 stub 返回默认值 |
| spyk() | 真实实现,可覆盖个别方法 |
| relaxed mock | 自动返回"合理"默认值 |

宽松 mock 的使用示例如下：

::: code-tabs

@tab:active Java

```java
// 宽松 mock:免写 stub,返回默认值(集合/字符串等)
OrderRepository repo = Mockito.mock(OrderRepository.class);
repo.getOrders();   // Mockito 对集合返回类型默认返回空列表,无需 when
```

@tab Kotlin

```kotlin
// relaxed:免写 stub,返回默认值(集合/字符串等)
val repo = relaxedMockk<OrderRepository>()
repo.getOrders()   // 返回空列表,无需 every
```

:::

## 四、协程测试

协程测试的标准写法如下：

::: code-tabs

@tab:active Java

```java
// suspend 函数同样可打桩(suspend 在 Java 中多一个 Continuation 参数)
ApiService api = Mockito.mock(ApiService.class);

// 打桩/验证(等价 coEvery / coVerify)
when(api.fetchUser(any())).thenReturn(new User("tom"));
verify(api).fetchUser("tom");

// runTest:kotlinx-coroutines-test 提供虚拟时间
// Java 中运行协程测试需借助 kotlinx-coroutines 的 runBlocking 包裹
@Test
public void 协程测试() throws Exception {
    when(api.fetchUser(any())).thenReturn(new User("tom"));
    runBlocking(cont -> {   // 将 suspend 调用包进 runBlocking
        User user = viewModel.loadUser();
        assertEquals("tom", user.name);
        return null;
    });
}
```

@tab Kotlin

```kotlin
// MockK 原生支持 suspend 函数
val api = mockk<ApiService>()

// coEvery / coVerify:协程专用
coEvery { api.fetchUser(any()) } returns User("tom")
coVerify { api.fetchUser("tom") }

// runTest:kotlinx-coroutines-test 提供虚拟时间
@Test
fun `协程测试`() = runTest {
    coEvery { api.fetchUser(any()) } returns User("tom")
    val user = viewModel.loadUser()
    assertEquals("tom", user.name)
}
```

:::

协程测试常用 API 的说明如下：

| API | 用途 |
|-----|------|
| coEvery / coVerify | suspend 函数打桩/验证 |
| runTest | 虚拟时间,跳过 delay |
| advanceTimeBy | 推进虚拟时间 |
| StandardTestDispatcher | 手动调度 |

## 五、Object 与静态 Mock

object 单例与静态函数的 mock 写法如下：

::: code-tabs

@tab:active Java

```java
// 单例类(等价 Kotlin object)
final class Logger {
    static final Logger INSTANCE = new Logger();
    void log(String msg) {}
}

// mock 静态方法需 mockito-inline
try (MockedStatic<Logger> mocked = Mockito.mockStatic(Logger.class)) {
    mocked.when(() -> Logger.INSTANCE.log(any())).thenAnswer(inv -> null);
    mocked.verify(() -> Logger.INSTANCE.log("启动"));
}

// mock 静态/顶层函数
try (MockedStatic<Utils> mocked = Mockito.mockStatic(Utils.class)) {
    mocked.when(() -> Utils.formatTime(any())).thenReturn("00:00");
}
```

@tab Kotlin

```kotlin
// mock object 单例
object Logger { fun log(msg: String) {} }

mockkObject(Logger)
every { Logger.log(any()) } just Runs
verify { Logger.log("启动") }

// mock 静态/顶层函数
mockkStatic("com.example.Utils")
every { Utils.formatTime(any()) } returns "00:00"
```

:::

>  注意:mockkStatic/mockkObject 会影响全局,测试后记得 `unmockkAll()` 清理。

## 六、Android 环境测试

Android 环境测试的写法如下：

::: code-tabs

@tab:active Java

```java
// Robolectric + Mockito 结合
@RunWith(RobolectricTestRunner.class)
public class MainViewModelTest {
    @Test
    public void 测试ViewModel() {
        Context context = ApplicationProvider.getApplicationContext();
        Repo repo = Mockito.mock(Repo.class);
        when(repo.load()).thenReturn(new Data());
        MainViewModel vm = new MainViewModel(repo);
        // 断言 ViewModel 逻辑
    }
}
```

@tab Kotlin

```kotlin
// Robolectric + MockK 结合
@RunWith(RobolectricTestRunner::class)
class MainViewModelTest {
    @Test
    fun `测试 ViewModel`() {
        val context = ApplicationProvider.getApplicationContext<Context>()
        val repo = mockk<Repo>()
        coEvery { repo.load() } returns Data()
        val vm = MainViewModel(repo)
        // 断言 ViewModel 逻辑
    }
}
```

:::

## 七、最佳实践

常用测试最佳实践说明如下：

| 实践 | 说明 |
|------|------|
| 只 mock 依赖 | 被测对象本身不 mock |
| 每个测试独立 | setUp 中创建,tearDown unmockkAll |
| 避免过度打桩 | 能真实就真实 |
| 测试行为非实现 | 验证交互而非内部细节 |
| 命名清晰 | `fun \`应该...\`()` 中文描述 |
| 与协程测试结合 | runTest 控制时间 |

完整的 ViewModel 测试示例如下：

::: code-tabs

@tab:active Java

```java
public class OrderViewModelTest {
    private final OrderRepository repository = Mockito.mock(OrderRepository.class);
    private OrderViewModel viewModel;

    @Before public void setUp() { viewModel = new OrderViewModel(repository); }
    @After public void tearDown() { /* Mockito 无需全局清理 */ }

    @Test
    public void 加载订单成功时更新状态() throws Exception {
        when(repository.getOrder(1)).thenReturn(new Order(1, 99.0));
        runBlocking(cont -> { viewModel.loadOrder(1); return null; });
        assertEquals(OrderState.Success, viewModel.getState());
        verify(repository, times(1)).getOrder(1);
    }

    @Test
    public void 加载失败时显示错误() throws Exception {
        when(repository.getOrder(1)).thenThrow(new IOException("network"));
        runBlocking(cont -> { viewModel.loadOrder(1); return null; });
        assertTrue(viewModel.getState() instanceof OrderState.Error);
    }
}
```

@tab Kotlin

```kotlin
class OrderViewModelTest {
    private val repository = mockk<OrderRepository>()
    private lateinit var viewModel: OrderViewModel

    @Before fun setUp() { viewModel = OrderViewModel(repository) }
    @After fun tearDown() { unmockkAll() }

    @Test
    fun `加载订单成功时更新状态`() = runTest {
        coEvery { repository.getOrder(1) } returns Order(id = 1, amount = 99.0)
        viewModel.loadOrder(1)
        assertEquals(OrderState.Success, viewModel.state)
        coVerify(exactly = 1) { repository.getOrder(1) }
    }

    @Test
    fun `加载失败时显示错误`() = runTest {
        coEvery { repository.getOrder(1) } throws IOException("network")
        viewModel.loadOrder(1)
        assertTrue(viewModel.state is OrderState.Error)
    }
}
```

:::

## 八、高频面试题

### Q1：MockK 和 Mockito 有什么区别?为什么 Kotlin 项目选 MockK?
::: details 查看答案
区别:① 语法——Mockito 是 Java 风格(when().thenReturn()),MockK 是 Kotlin DSL(every { } returns);② Kotlin 特性——MockK 原生支持协程(coEvery/coVerify)、object 单例(mockkObject)、顶层/扩展函数(mockkStatic)、final 类、私有方法,而 Mockito 对这些支持弱或需额外配置(mockito-inline);③ 类型安全——Kotlin 中 every{} 更直观且编译期更安全。Kotlin 项目(尤其用协程、单例模式多的)优先 MockK,Java 代码用 Mockito 也可。
:::

### Q2：every 和 coEvery 有什么区别?协程函数怎么测试?
::: details 查看答案
every 用于普通函数打桩;coEvery 用于 suspend 函数打桩(内部处理 Continuation)。协程测试要点:① 打桩用 coEvery,验证用 coVerify;② 用 kotlinx-coroutines-test 的 runTest 提供**虚拟时间**,测试中的 delay() 立即跳过,避免真实等待;③ 可手动调度(StandardTestDispatcher)或推进时间(advanceTimeBy)测试超时/重试逻辑;④ ViewModel/UseCase 的挂起调用可注入 Dispatcher 以便控制线程。组合:coEvery 打桩 + runTest 控制时间 + assert 结果 + coVerify 验证。
:::

### Q3：mockk(),spyk(),relaxedMockk() 有什么区别?
::: details 查看答案
① mockk():完全 mock,未 stub 的方法返回默认值(null/0/false),适合隔离依赖;② spyk():基于真实对象,未 stub 的方法执行真实逻辑,适合"保留大部分实现、只改个别方法";③ relaxedMockk():"宽松" mock,未 stub 时自动返回合理默认值(空集合、空字符串、mock 嵌套对象),适合快速搭建测试骨架,减少打桩代码。选择:需要控制所有交互用 mockk;需要真实逻辑兜底用 spyk;只关心主要逻辑、不想写大量 stub 用 relaxedMockk。
:::

### Q4：怎么验证一个方法被调用的次数和顺序?
::: details 查看答案
次数:verify { mock.method() }(默认 1 次)、verify(exactly = 2)(恰好 2 次)、verify(atLeast = 1) / verify(atMost = 3)、verify(exactly = 0)(未调用)。顺序:verifyOrder { } 块内列出方法,验证按此顺序调用;verifySequence 验证"恰好按顺序调用且无其他"。还可组合:verifyOrder + verify 混合;confirmVerified 确认 mock 没有未验证的调用。注意:验证的是"交互"而非返回值,用于确认被测代码与依赖的协作关系。
:::

### Q5：MockK 测试有哪些常见坑?
::: details 查看答案
常见坑:① 忘记 unmockkAll——mockkObject/mockkStatic 全局污染,影响其他测试,须在 @After 清理;② 对 final/private 方法未加配置导致 mock 失败;③ 协程函数用了 every 而非 coEvery,编译或运行异常;④ 过度打桩——mock 了被测对象本身,测试失去意义;⑤ 参数匹配不严谨——any() 太宽导致验证误判;⑥ 与 Robolectric/JUnit 版本不兼容;⑦ 测试里出现真实网络/数据库调用——依赖未 mock 干净。对策:每个测试独立、及时清理、只 mock 边界依赖、断言行为而非实现细节。
:::

## 小结

- MockK = Kotlin 原生 Mock:协程/object/final 全覆盖
- every/coEvery 打桩,verify/coVerify 验证
- mockk 全 mock,spyk 部分真实,relaxed 自动默认值
- runTest 虚拟时间控制协程测试
- object/静态用 mockkObject/mockkStatic,记得清理
- 最佳实践:独立测试、少 mock、行为断言、unmockkAll

> 进阶阅读：[单元测试实践](/engineering/testing/unit-testing.md) | [测试金字塔与策略](/engineering/testing/test-pyramid.md) | [协程结构化并发](/network/coroutine/structured-concurrency.md)
