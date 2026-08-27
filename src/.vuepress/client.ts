import { defineClientConfig } from "vuepress/client";
import CodeTabs from "./components/CodeTabs.ts";

export default defineClientConfig({
  enhance({ app }) {
    // 覆盖 @vuepress/plugin-markdown-tab 注册的 CodeTabs 组件：
    // 支持"仅 Kotlin"代码块（Java tab 内容为空）→ Java 按钮灰化禁用、默认激活 Kotlin
    app.component("CodeTabs", CodeTabs);
  },
});
