---
icon: architecture
title: MVC → MVP → MVVM → MVI 演进
description: Android 架构模式演进史：MVC/MVP/MVVM/MVI 对比、优缺点、适用场景与代码示例
---

# MVC → MVP → MVVM → MVI 演进

> 面试高频指数：极高
> 架构模式是面试必问，理解演进逻辑比背概念更重要。

## 1. 为什么要架构

```text
业务复杂度上升 → 代码混乱 → 难以维护/测试
架构的目标：
① 职责分离（UI / 逻辑 / 数据）
② 可测试性（逻辑可单测）
③ 可维护性（改动影响局部）
④ 可扩展性（新增功能低成本）
```

## 2. MVC

```text
Model：数据与业务逻辑
View：界面展示
Controller：处理用户输入，协调 M 和 V

Android 中的 MVC：
- View：XML 布局 + Activity（Activity 既当 View 又当 Controller）
- Controller：Activity 中的事件处理
- Model：数据层（Bean / 数据库 / 网络）
```

```kotlin
// MVC：Controller（Activity）持有 Model
class MainActivity : AppCompatActivity() {
    private val userModel = UserModel()

    fun onLoadClick() {
        // Controller 调用 Model 获取数据
        val user = userModel.getUser()
        // 直接更新 View
        tvName.text = user.name
    }
}
```

**问题**：Activity 既承担 View 又承担 Controller，业务逻辑膨胀，难以测试。

## 3. MVP

```text
Model：数据层
View：View 接口（Activity/Fragment 实现）
Presenter：持有 View 引用，处理业务，更新 View

特点：View 与 Model 完全解耦，通过 Presenter 桥接
```

```kotlin
// View 接口
interface LoginView {
    fun showLoading()
    fun showSuccess(user: User)
    fun showError(msg: String)
}

// Presenter
class LoginPresenter(private val view: LoginView) {
    fun login(name: String, pwd: String) {
        view.showLoading()
        val user = LoginRepository().login(name, pwd) // Model
        if (user != null) view.showSuccess(user)
        else view.showError("登录失败")
    }
}

// Activity 实现 View
class LoginActivity : AppCompatActivity(), LoginView {
    private lateinit var presenter: LoginPresenter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        presenter = LoginPresenter(this)
    }

    fun onLoginClick() {
        presenter.login(etName.text.toString(), etPwd.text.toString())
    }

    override fun showSuccess(user: User) { /* 更新 UI */ }
    override fun showError(msg: String) { Toast.makeText(this, msg, Toast.LENGTH_SHORT).show() }
}
```

**优点**：职责清晰、View 可 mock 测试。
**缺点**：接口爆炸（每页一套 View/Presenter 接口）、内存泄漏风险（Presenter 持有 View）。

## 4. MVVM

```text
Model：数据层
View：Activity/Fragment（观察状态）
ViewModel：持有状态（State），暴露给 View 观察

特点：数据驱动 UI（双向绑定/状态观察），ViewModel 不持有 View 引用
```

```kotlin
// ViewModel（Jetpack）
class LoginViewModel : ViewModel() {
    private val _uiState = MutableStateFlow<LoginUiState>(LoginUiState.Idle)
    val uiState: StateFlow<LoginUiState> = _uiState.asStateFlow()

    fun login(name: String, pwd: String) {
        viewModelScope.launch {
            _uiState.value = LoginUiState.Loading
            _uiState.value = try {
                LoginUiState.Success(LoginRepository().login(name, pwd))
            } catch (e: Exception) {
                LoginUiState.Error(e.message ?: "失败")
            }
        }
    }
}

sealed interface LoginUiState {
    data object Idle : LoginUiState
    data object Loading : LoginUiState
    data class Success(val user: User) : LoginUiState
    data class Error(val msg: String) : LoginUiState
}

// Activity 观察状态
class LoginActivity : AppCompatActivity() {
    private val viewModel by viewModels<LoginViewModel>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.uiState.collect { state ->
                    when (state) {
                        is LoginUiState.Loading -> showLoading()
                        is LoginUiState.Success -> showSuccess(state.user)
                        is LoginUiState.Error -> showError(state.msg)
                        else -> {}
                    }
                }
            }
        }
    }
}
```

**优点**：ViewModel 不感知 View、自动处理生命周期、可测试性强。
**缺点**：状态分散（多个 StateFlow 难管理）、调试困难。

## 5. MVI

```text
Model：UI 状态（不可变）
View：渲染状态 + 发送 Intent
Intent：用户意图（Action）

特点：单向数据流 + 状态不可变（类似 Redux）
```

```kotlin
// MVI：Intent → Reducer → State → View
sealed interface LoginIntent {
    data class Submit(val name: String, val pwd: String) : LoginIntent
}

sealed interface LoginState {
    data object Idle : LoginState
    data object Loading : LoginState
    data class Success(val user: User) : LoginState
    data class Error(val msg: String) : LoginState
}

class LoginViewModel : ViewModel() {
    private val _state = MutableStateFlow<LoginState>(LoginState.Idle)
    val state: StateFlow<LoginState> = _state.asStateFlow()

    fun dispatch(intent: LoginIntent) {
        when (intent) {
            is LoginIntent.Submit -> reduce(intent)
        }
    }

    private fun reduce(intent: LoginIntent.Submit) {
        _state.value = LoginState.Loading
        viewModelScope.launch {
            _state.value = try {
                LoginState.Success(LoginRepository().login(intent.name, intent.pwd))
            } catch (e: Exception) {
                LoginState.Error(e.message ?: "失败")
            }
        }
    }
}
```

**优点**：状态唯一来源、可预测、易调试（时间旅行）。
**缺点**：样板代码多、学习成本高、状态合并复杂。

## 6. 对比总结

| 模式 | 数据流向 | View 持有 | 状态管理 | 可测试性 | 学习成本 |
| --- | --- | --- | --- | --- | --- |
| MVC | 双向 | Controller | 无 | 低 | 低 |
| MVP | 双向（接口回调） | Presenter 持 View | 无 | 中 | 低 |
| MVVM | 观察（单向数据源） | ViewModel 不持 View | 多 State | 高 | 中 |
| MVI | 单向（Intent→State） | ViewModel 不持 View | 单一 State | 高 | 高 |

## 7. 高频面试题

**Q1：MVP 和 MVVM 的本质区别？**
A：MVP 通过接口回调双向通信（Presenter 调用 View 方法）；
MVVM 通过状态观察单向流动（ViewModel 暴露 State，View 观察）。
MVVM 的 ViewModel 不持有 View 引用，无接口爆炸，可测试性更好。

**Q2：MVVM 中 ViewModel 为什么不会泄漏？**
A：ViewModel 由 ViewModelStore 持有（Activity 的 NonConfigurationInstance），
不持有 View/Activity 引用（生命周期与界面解耦），配置变更时保留，
Activity 销毁（finish）时调用 onCleared。

**Q3：MVI 相比 MVVM 有什么优势？**
A：状态集中为单一不可变 State（唯一数据源），Intent 驱动单向数据流，
调试可预测、可重现（日志回放），适合复杂交互。

**Q4：如何选择架构？**
A：小项目 MVP 足够；中大型 MVVM（官方推荐，配 ViewModel+StateFlow）；
复杂状态交互/需要强可预测性用 MVI。重点：分层清晰 + 可测试。

**Q5：MVVM 的缺点？**
A：小项目过度设计；状态分散（多个 LiveData/Flow）难以统一管理；
双向绑定调试困难；多人协作容易把逻辑写进 View 层。

## 8. 小结

- 演进主线：职责分离 + 可测试性 + 状态管理。
- MVC 简单但混乱 → MVP 解耦但有接口爆炸 → MVVM 观察驱动 → MVI 单向流。
- 官方推荐：MVVM + Jetpack（ViewModel + StateFlow）。
- 面试重点：演进原因、各模式对比、MVVM/MVI 的代码实现。
