---
icon: speed
title: 《Android开发艺术探索》第十五章笔记
---

# 《Android开发艺术探索》第十五章：性能优化

> 性能优化的核心是避免 OOM（内存溢出）与 ANR（无响应），本章从布局、绘制、内存、响应速度等角度给出优化手段。

## 一、布局优化

- 删除无用的控件与层级，选择性能更高的 ViewGroup
- `<include>`：布局重用；`<merge>`：与 include 配合减少层级；`ViewStub`：按需加载
- `<include>` 只支持 `android:layout_*` 属性（`android:id` 例外）
- ViewStub 宽高为 0，不参与布局绘制；加载方式：
  - `viewStub.setVisibility(View.VISIBLE)`
  - `viewStub.inflate()`（`android:inflatedId` 指定根元素 id）

## 二、绘制优化

- `onDraw` 中**不要创建局部对象**（频繁调用会产生大量临时对象，触发 GC）
- 不做耗时任务与大量循环；保证 60fps（每帧不超过 16ms）

## 三、内存泄漏优化

常见泄漏场景：静态变量、单例、属性动画、AsyncTask、Handler。

## 四、响应速度与 ANR

| 组件 | ANR 阈值 |
|------|----------|
| Activity | 5 秒未响应触摸/键盘输入 |
| BroadcastReceiver | 10 秒未执行完 |

ANR 后系统在 `/data/anr/traces.txt` 生成日志，用于定位问题。

## 五、ListView 与 Bitmap 优化

- **ListView**：ViewHolder 复用、getView 不做耗时操作、按滑动状态控制绘制、开启硬件加速
- **Bitmap**：通过 `BitmapFactory.Options.inSampleSize` 采样压缩

## 六、线程优化

- 使用**线程池**：复用线程、避免创建销毁开销、控制最大并发数，防止资源抢占阻塞

## 七、性能优化建议

- 避免创建过多对象；少用枚举（内存占用大于整型）
- 常量用 `static final` 修饰
- 使用 Android 特有数据结构（`SparseArray`、`Pair` 等）
- 适当使用软引用/弱引用；采用内存缓存与磁盘缓存
- 尽量用静态内部类，避免内部类持有外部引用导致泄漏

## 八、内存分析工具 MAT

- **Histograms**：查看各类对象占用内存
- **Dominator Tree**：分析支配树定位泄漏根源

## 九、代码可维护性

- 命名规范：私有成员 `m` 前缀、静态成员 `s` 前缀、常量全大写
- 排版合理：同类变量声明放一起，块间留空行
- 仅在关键代码加注释
