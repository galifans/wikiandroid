---
icon: testing
title: UI 测试与 Espresso
description: UI 测试分层、Espresso 使用、Compose UI Test、测试环境配置、稳定性与 CI 集成
---

# UI 测试与 Espresso

> 面试高频指数：中
> UI 测试保障核心流程质量，Espresso 与 Compose UI Test 是两大主流。

## 1. UI 测试的定位

```text
金字塔顶端：数量少但重要

价值：
- 验证核心用户流程（登录、下单、列表交互）
- 捕捉集成问题（组件间、导航）
- 回归保障（页面级）

成本：慢、不稳定（依赖设备/动画/网络）
策略：只测核心流程，保持稳定
```

## 2. 环境配置

```groovy
// build.gradle
android {
    defaultConfig {
        // 测试应用 ID
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }
}

dependencies {
    // Espresso（View 测试）
    androidTestImplementation("androidx.test.espresso:espresso-core:3.6.1")
    androidTestImplementation("androidx.test:runner:1.6.2")
    androidTestImplementation("androidx.test.ext:junit:1.2.1")

    // Compose UI Test
    androidTestImplementation("androidx.compose.ui:ui-test-junit4:1.7.0")
    debugImplementation("androidx.compose.ui:ui-test-manifest:1.7.0")
}
```

```bash
# 运行测试
./gradlew :app:connectedDebugAndroidTest
# 单类：-Pandroid.testInstrumentationRunnerArguments.class=com.example.LoginTest
```

## 3. Espresso（View 体系）

```kotlin
// 测试目录：app/src/androidTest/
@RunWith(AndroidJUnit4::class)
class LoginActivityTest {

    @get:Rule
    val activityRule = ActivityScenarioRule(LoginActivity::class.java)

    @Test
    fun `输入凭证并登录成功`() {
        // ① 输入用户名
        onView(withId(R.id.etUsername))
            .perform(typeText("user"), closeSoftKeyboard())

        // ② 输入密码
        onView(withId(R.id.etPassword))
            .perform(typeText("123456"), closeSoftKeyboard())

        // ③ 点击登录
        onView(withId(R.id.btnLogin)).perform(click())

        // ④ 断言跳转到主页
        onView(withId(R.id.tvWelcome))
            .check(matches(withText("欢迎回来")))
    }

    @Test
    fun `空输入提示错误`() {
        onView(withId(R.id.btnLogin)).perform(click())

        onView(withId(R.id.tvError))
            .check(matches(withText("请输入用户名")))
    }
}
```

```text
Espresso 核心 API：
- onView：查找 View（withId / withText / withContentDescription）
- perform：执行操作（click / typeText / scrollTo）
- check：断言（matches / doesNotExist）
- ViewMatchers / ViewActions / ViewAssertions 三个模块
```

## 4. Compose UI Test

```kotlin
@RunWith(AndroidJUnit4::class)
class LoginScreenTest {

    @get:Rule
    val composeRule = createComposeRule()

    @Test
    fun `登录流程正常`() {
        // 设置测试内容
        composeRule.setContent {
            LoginScreen(viewModel = fakeViewModel)
        }

        // ① 输入
        composeRule.onNodeWithTag("username_field").performTextInput("user")
        composeRule.onNodeWithTag("password_field").performTextInput("123456")

        // ② 点击
        composeRule.onNodeWithText("登录").performClick()

        // ③ 断言（等待状态更新）
        composeRule.waitUntil(timeoutMillis = 5_000) {
            composeRule.onAllNodesWithText("欢迎回来")
                .fetchSemanticsNodes().isNotEmpty()
        }
    }
}
```

```text
Compose 测试 API：
- onNodeWithText / onNodeWithTag（testTag 语义）
- performTextInput / performClick
- Semantics 语义树（无障碍 + 测试）
- waitUntil / waitForIdle 处理异步
```

## 5. 稳定性实践

```text
① 关闭动画（测试稳定关键）：
   - 开发者选项：窗口/过渡/动画缩放 0.5x 或关闭
   - 或代码中测试环境禁用

② 处理异步：
   - Espresso 自动等待主线程空闲（idling）
   - 网络等待用 IdlingResource 注册
   - Compose 用 waitUntil

③ 测试数据隔离：
   - 用测试后端（MockWebServer）/ 数据库重置
   - 避免依赖真实网络

④ 独立测试环境：
   - 测试包名（testInstrumentationRunnerArguments）
   - 测试专用 Application（可注入）

⑤ 分批执行：
   - 核心流程必测，其余按需
```

```kotlin
// MockWebServer 示例（依赖：mockwebserver）
class ApiTest {
    private val server = MockWebServer()

    @Before fun setup() {
        server.enqueue(MockResponse().setBody("""{"name":"user"}"""))
        server.start()
    }

    @Test fun `网络接口解析正确`() {
        // 指向 mock 服务器
        val api = Retrofit.Builder()
            .baseUrl(server.url("/"))
            .build()
            .create(UserApi::class.java)
        // ... 断言
    }
}
```

## 6. 高频面试题

**Q1：Espresso 和 Compose UI Test 的区别？**
A：Espresso 测 View 体系（XML + View 查找）；Compose UI Test 测
Compose（语义树 + testTag）。两者都属于仪器测试（androidTest）。
新项目用 Compose Test，存量 View 项目用 Espresso。

**Q2：UI 测试为什么不稳定？怎么解决？**
A：动画、异步、网络、设备差异导致。解决：关闭动画、IdlingResource/
waitUntil 处理异步、MockWebServer 隔离网络、测试数据隔离、
缩小测试范围（只测核心流程）。

**Q3：IdlingResource 是什么？**
A：Espresso 的空闲机制扩展：注册自定义"忙碌/空闲"状态（如网络请求
进行中），Espresso 等待空闲才执行下一步，避免竞态。

**Q4：单元测试和 UI 测试怎么分工？**
A：单元测试：逻辑正确性（快、多、JVM 运行）；UI 测试：核心流程
端到端（慢、少、真机/模拟器）。策略：逻辑下沉单元测，UI 只测
交互与流程。

**Q5：测试覆盖率怎么保证 UI 层？**
A：UI 测试用 JaCoCo 覆盖（connected 测试也可统计）；但 UI 测试
覆盖率不是重点（贵）。更合理：核心流程 UI 测 + 逻辑大量单测，
整体覆盖率以 JVM 单测为主。

## 7. 小结

- UI 测试：金字塔顶端，测核心流程。
- Espresso：View 体系（onView/perform/check）。
- Compose UI Test：语义树（onNodeWithText/testTag）。
- 稳定性三要素：关动画、mock 网络、等待空闲。
- 面试重点：两类 API、稳定性方案、测试分工。
