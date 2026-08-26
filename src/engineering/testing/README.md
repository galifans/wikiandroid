---
icon: testing
title: 测试体系
shortTitle: 概览
dir:
  text: 测试体系
  order: 4
---

# 测试体系

单元测试、UI 测试与质量保障。

## 文章列表

- [单元测试实践](unit-testing.md)
- [MockK 单元测试实战](mockk-testing.md)
- [UI 测试与 Espresso](ui-testing.md)
- [测试金字塔与测试策略](test-pyramid.md)

## 核心要点

### 单元测试
1. **JUnit4 / JUnit5**：测试框架
2. **Mockito / MockK**：Mock 依赖（MockK 原生支持协程/object）
3. **Robolectric**：JVM 模拟 Android 环境
4. **测试目录**：`app/src/test/`（JVM 测试）

### UI 测试
1. **Espresso**：View 交互测试
2. **Compose UI Test**：`createComposeRule`
3. **测试目录**：`app/src/androidTest/`（设备测试）

### 覆盖率
- JaCoCo 统计测试覆盖率
- 核心模块覆盖率目标：60%+

### 测试策略
- 测试金字塔：多单测 / 中集成 / 少 UI
- 质量门禁：单测 + 覆盖率 + Lint 在 CI 拦截

## 测试金字塔

```
        UI 测试（少）
       / 集成测试（中）  \
      / 单元测试（多）    \
```
