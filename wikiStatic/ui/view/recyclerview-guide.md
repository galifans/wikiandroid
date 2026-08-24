---
icon: list
title: RecyclerView 优化与 ListView 对比
---

# RecyclerView 优化与 ListView 对比

> RecyclerView 是列表展示的核心组件。本章梳理 RecyclerView 的优化手段，并与 ListView 全面对比。

## 一、RecyclerView 优化手段

1. **数据处理和视图加载分离：** 数据处理逻辑尽可能放在异步，`onBindViewHolder()` 中只处理数据填充到视图。

2. **数据优化：** 分页拉取远端数据并缓存提升二次加载速度；新增或删除数据通过 DiffUtil 局部刷新，而不是全局刷新：

```java
public class AdapterDiffCallback extends DiffUtil.Callback {

    private List<String> mOldList;
    private List<String> mNewList;

    public AdapterDiffCallback(List<String> oldList, List<String> newList) {
        mOldList = oldList;
        mNewList = newList;
    }

    @Override
    public int getOldListSize() {
        return mOldList.size();
    }

    @Override
    public int getNewListSize() {
        return mNewList.size();
    }

    @Override
    public boolean areItemsTheSame(int oldItemPosition, int newItemPosition) {
        return mOldList.get(oldItemPosition).getClass()
                .equals(mNewList.get(newItemPosition).getClass());
    }

    @Override
    public boolean areContentsTheSame(int oldItemPosition, int newItemPosition) {
        return mOldList.get(oldItemPosition).equals(mNewList.get(newItemPosition));
    }
}
```

```java
DiffUtil.DiffResult diffResult =
        DiffUtil.calculateDiff(new AdapterDiffCallback(oldList, newList));
diffResult.dispatchUpdatesTo(mAdapter);
```

3. **布局优化：** 减少布局层级，简化 ItemView。

4. **使用 Prefetch 功能：** 升级 RecyclerView 到 25.1.0 及以上。

5. **重写 `onViewRecycled(holder)` 回收资源。**

6. **`setHasFixedSize(true)`：** 如果 Item 高度固定，可避免 requestLayout 浪费资源。

7. **共用监听器：** 不对每个 Item 都 addXxListener，公用一个 Listener 根据 ID 进行不同操作，避免频繁创建对象。

8. **共用 RecycledViewPool：** 多个 RecyclerView 的 Adapter 一样（如嵌套 RecyclerView）时，通过 `setRecycledViewPool(pool)` 共用一个池。

## 二、ListView 与 RecyclerView 对比

| 对比项 | ListView | RecyclerView |
| --- | --- | --- |
| ViewHolder | 推荐使用（自定义），非必须；不用会频繁 findViewById 导致性能迟缓 | 必须使用 RecyclerView.ViewHolder |
| 滚动方向 | 只能垂直方向 | LinearLayoutManager 支持水平和竖直；GridLayoutManager 网格；StaggeredGridLayoutManager 瀑布流 |
| 动画 | 无内置动画，需用 ViewPropertyAnimator 等属性动画 | ItemAnimator 提供添加、删除、移动动画，可用 DefaultItemAnimator |
| 分割线 | 布局属性 `android:divider` + `android:dividerHeight` | 需自己实现 ItemDecoration |
| 点击事件 | `AdapterView.OnItemClickListener` | `RecyclerView.OnItemTouchListener`，实现略复杂但控制权限更大 |
| 选择模式 | `setChoiceMode()` 支持多选模式 + MultiChoiceModeListener | 无此功能 |
| 数据观察者 | `registerDataObserver` 注册观察者 | `RecyclerView.AdapterDataObserver` |
| Adapter 默认实现 | ArrayAdapter、CursorAdapter、SimpleCursorAdapter | 需自定义 Adapter（内置游标和 ArrayList 支持之外的所有功能） |

## 三、总结

- 新项目优先使用 **RecyclerView**：功能更强大（多布局、动画、多方向），性能更优（强制 ViewHolder + 复用池）。
- ListView 的优势在于简单、默认实现多，但在复杂列表场景下已逐渐被 RecyclerView 取代。
