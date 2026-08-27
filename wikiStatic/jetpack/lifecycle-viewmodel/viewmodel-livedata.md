---
icon: viewmodel
title: ViewModel 与 LiveData
---

# ViewModel 与 LiveData 详解

> ViewModel 与 LiveData 是 Jetpack 生命周期组件中的核心，解决了状态管理与生命周期感知两大难题。

## 一、ViewModel

**作用**：存储与 UI 相关的数据，在配置变更（旋转屏幕）后仍然存活，随 Activity/Fragment 真正销毁时清空。

ViewModel 的使用分两步：定义时继承 `ViewModel` 并用 `LiveData`/`StateFlow` 暴露状态，使用时通过 `ViewModelProvider` 获取实例。注意 ViewModel 的获取方式与它"按作用域共享"的特性绑定——同一个 Activity 内的多个 Fragment 通过 `activityViewModels()` 可以共享同一份 ViewModel 实例：

::: code-tabs

@tab:active Java

```java
public class MainViewModel extends ViewModel {
    private final MutableLiveData<UiState> uiState =
            new MutableLiveData<>(UiState.Loading);
    public LiveData<UiState> getUiState() { return uiState; }

    public void loadData() {
        // 对应 Kotlin 的 viewModelScope.launch：Java 中可用 ExecutorService / 回调执行异步
        uiState.setValue(UiState.Success(repository.fetchData()));
    }
}

public class MainActivity extends ComponentActivity {
    // Java 中通过 ViewModelProvider 获取（对应 Kotlin 的 by viewModels()）
    private final MainViewModel viewModel =
            new ViewModelProvider(this).get(MainViewModel.class);
}
```

@tab Kotlin

```kotlin
class MainViewModel(private val repository: Repository) : ViewModel() {
    private val _uiState = MutableStateFlow<UiState>(UiState.Loading)
    val uiState: StateFlow<UiState> = _uiState.asStateFlow()

    fun loadData() {
        viewModelScope.launch {
            _uiState.value = UiState.Success(repository.fetchData())
        }
    }
}

class MainActivity : ComponentActivity() {
    private val viewModel: MainViewModel by viewModels()
}
```

:::

### ViewModel 为什么能存活？

关键在于 **ViewModelStore** 这个"中转站"：Activity 的 `NonConfigurationInstance` 在配置变更时被系统保留，而 ViewModelStore 就存在其中。旋转屏幕时，系统销毁旧 Activity 但保留 ViewModelStore，新 Activity 创建后从同一个 Store 里取出 ViewModel 复用——因此数据不丢，且 `onCleared()` 不会被调用。只有 Activity **真正**销毁（如用户按返回键）时，Store 才随之清空并回调 `onCleared()`。

### viewModelScope

`viewModelScope` 是 ViewModel 自带的协程作用域，它绑定 `Dispatchers.Main.immediate` 并跟随 ViewModel 生命周期：ViewModel 销毁时自动 `cancel()` 所有未完成的协程，避免协程在界面销毁后继续执行造成的内存泄漏与无效更新。这也是"在 ViewModel 里做异步、把结果暴露为 StateFlow/LiveData"这条规范的原因。

## 二、LiveData

**作用**：可观察的数据持有者，感知生命周期（仅活跃时回调）。

::: code-tabs

@tab:active Java

```java
private final MutableLiveData<String> _data = new MutableLiveData<>();
public LiveData<String> getData() { return _data; }

data.observe(this, value -> {
    // 仅 ON_START 之后回调
    textView.setText(value);
});
```

@tab Kotlin

```kotlin
private val _data = MutableLiveData<String>()
val data: LiveData<String> = _data

data.observe(this) { value ->
    // 仅 ON_START 之后回调
    textView.text = value
}
```

:::

LiveData 的三个核心特性决定了它的使用体验：**生命周期感知**——只有处于 `ON_START` 之后的活跃状态，Observer 才会收到回调，后台时不会触发不必要的 UI 更新；**自动清理**——Observer 与 LifecycleOwner 绑定，页面销毁时自动移除监听，无需手动解除；**数据粘性**——即使先 `setValue` 再 `observe`，新订阅者也能立刻收到当前值（粘性事件），这在"Fragment 重建后要立刻拿到最新状态"的场景非常有用，但也是事件型数据容易重复消费的根源。

两者都是"可观察的数据持有者"，核心差异在生命周期感知的实现方式上——LiveData 内置感知，StateFlow 需要配合 `repeatOnLifecycle`：

| 对比项 | LiveData | StateFlow |
|--------|----------|-----------|
| 生命周期感知 | ✓ 内置 | ✗ 需 `repeatOnLifecycle` |
| 协程支持 | 一般 | ✓ 原生 |
| Compose 支持 | 需转换 | ✓ `collectAsState()` |
| 多线程 | 主线程 setValue | 任意线程 |

::: tip 建议
新项目推荐 **ViewModel + StateFlow + Compose** 组合；老项目迁移成本高可继续使用 LiveData。
:::

## 三、面试高频题

1. ViewModel 为什么旋转屏幕不丢失？`onCleared()` 何时调用？
2. LiveData 为什么只在活跃状态回调？`observeForever` 有什么风险？
3. 如何用 StateFlow 替代 LiveData？
4. `viewModelScope` 的线程模型（默认 Main）？
5. 两个 Fragment 如何共享 ViewModel（`activityViewModels`）？

> 进阶阅读：[Lifecycle 原理与使用](lifecycle.md) | [协程 Flow](/network/coroutine/)
