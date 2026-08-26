---
icon: puzzle
title: Gradle 依赖配置详解
---

# Gradle 依赖配置详解

> Gradle 提供多种依赖配置方式，理解 implementation / api / compileOnly 的区别是模块化开发的基础。

## 一、依赖配置对比

| 配置 | 编译类路径 | 编译输出（打包） | 传递性 | 说明 |
| --- | --- | --- | --- | --- |
| implementation | ✓ | ✓ | ✗ | 依赖项添加到编译类路径并打包；其他模块只有在运行时才能使用该依赖项 |
| api | ✓ | ✓ | ✓ | 依赖项添加到编译类路径和编译输出；模块以传递方式导出到其他模块，其他模块在运行时和编译时都可使用 |
| compileOnly | ✓ | ✗ | — | 只添加到编译类路径，不打包到编译输出（如 provided） |
| runtimeOnly | ✗ | ✓ | — | 只添加到编译输出以便运行时使用，不添加到编译类路径 |
| annotationProcessor | 注解处理器类路径 | — | — | 添加作为注解处理器的库（如 Room、ButterKnife 编译器） |

## 二、使用场景

### implementation（默认推荐）

```gradle
dependencies {
    implementation 'com.squareup.okhttp3:okhttp:4.12.0'
}
```

**优点：** 依赖不会传递到其他模块，编译更快、隐藏内部实现细节。

### api（需要对外暴露时）

```gradle
dependencies {
    api 'com.google.android.material:material:1.11.0'
}
```

**场景：** 模块对外提供的 API 参数或返回值使用了该库类型，其他模块编译时需要访问。

### compileOnly（编译期使用）

```gradle
dependencies {
    compileOnly 'com.google.code.findbugs:jsr305:3.0.2'
}
```

**场景：** 仅使用注解（如注解处理、编译期检查），运行时由其他方提供，避免打包体积增大。

### runtimeOnly（运行期使用）

```gradle
dependencies {
    runtimeOnly 'ch.qos.logback:logback-classic:1.4.11'
}
```

**场景：** 运行时才需要的实现库（如日志实现）。

### annotationProcessor（注解处理器）

```gradle
dependencies {
    annotationProcessor 'androidx.room:room-compiler:2.6.1'
}
```

**场景：** 编译期生成代码的注解处理器库。

## 三、最佳实践

1. **默认使用 implementation**，仅在需要传递导出时使用 api；
2. 使用 `gradlew :app:dependencies` 查看依赖树，排查冲突；
3. 使用 Version Catalog（`libs.versions.toml`）统一管理版本；
4. 通过 `exclude` 排除传递依赖，`force` 强制版本：
   ```gradle
   implementation('com.squareup.okhttp3:okhttp:4.12.0') {
       exclude group: 'org.json', module: 'json'
   }
   ```
