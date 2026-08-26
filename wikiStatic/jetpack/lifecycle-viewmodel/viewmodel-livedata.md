---
icon: viewmodel
title: ViewModel 与 LiveData
---

# ViewModel 与 LiveData 详解

> ViewModel 与 LiveData 是 Jetpack 生命周期组件中的核心，解决了状态管理与生命周期感知两大难题。

## 一、ViewModel

**作用**：存储与 UI 相关的数据，在配置变更（旋转屏幕）后仍然存活，随 Activity/Fragment 真正销毁时清空。

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

- 通过 `ViewModelStore`（非配置实例）持有 ViewModel
- 旋转屏幕时 `ViewModelStore` 被保留，新 Activity 复用同一 Store

### viewModelScope

- ViewModel 自带的协程作用域
- ViewModel 销毁时自动取消协程，避免内存泄漏

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

| 特性 | 说明 |
|------|------|
| 生命周期感知 | `ON_START` 后活跃，活跃时才回调 |
| 自动清理 | Observer 随 Lifecycle 销毁自动移除 |
| 数据粘性 | 先 set 后 observe 也能收到（粘性事件） |

### LiveData vs StateFlow

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
