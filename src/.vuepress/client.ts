import { defineClientConfig } from "vuepress/client";
import CodeTabs from "./components/CodeTabs.ts";

export default defineClientConfig({
  enhance({ app, router }) {
    // 覆盖 @vuepress/plugin-markdown-tab 注册的 CodeTabs 组件：
    // 支持"仅 Kotlin"代码块（Java tab 内容为空）→ Java 按钮灰化禁用、默认激活 Kotlin
    app.component("CodeTabs", CodeTabs);

    // 禁用浏览器原生的历史滚动恢复，统一交给下方逻辑处理
    if (typeof history !== "undefined") history.scrollRestoration = "manual";

    // 修复锚点跳转"不准"：VuePress 默认 scrollBehavior 在页面异步内容（mermaid 图、
    // 异步 chunk、字体等）渲染完成前就计算滚动位置，滚动后页面高度变化导致目标标题
    // 下移、位置漂移；且 theme-hope 的 scrollspy 会在页面挂载时用视口顶部标题改写
    // hash，触发新导航中断滚动。
    // 方案：禁用 vue-router 自动滚动，改由 afterEach 手动等待布局稳定后 scrollTo，
    // 手动滚动不依赖 hash，scrollspy 改写 hash 不影响滚动目标；滚动准确后
    // scrollspy 会自行把 hash 同步为正确标题。
    router.options.scrollBehavior = (_to, _from, savedPosition) => {
      // 保留浏览器前进/后退时的位置恢复
      if (savedPosition) return savedPosition;
      return undefined; // 其余导航不自动滚动，由 afterEach 统一处理
    };

    router.afterEach(async (to, _from) => {
      // SSR 渲染阶段没有 DOM，直接返回
      if (typeof document === "undefined") return;

      if (to.hash) {
        const targetId = decodeURIComponent(to.hash.slice(1));

        // 目标元素已在视口顶部附近 → scrollspy 的 hash 同步，无需滚动
        const current = document.getElementById(targetId);
        if (current && Math.abs(current.getBoundingClientRect().top) < 10) return;

        // 等待目标元素出现且 offsetTop 连续 5 次（约 250ms）稳定 → 异步内容渲染完毕
        const deadline = Date.now() + 5000;
        let lastTop: number | null = null;
        let stableCount = 0;
        while (Date.now() < deadline) {
          const el = document.getElementById(targetId);
          if (el) {
            const top = el.offsetTop;
            if (top === lastTop) {
              stableCount += 1;
              if (stableCount >= 5) break;
            } else {
              stableCount = 0;
              lastTop = top;
            }
          }
          await new Promise((resolve) => setTimeout(resolve, 50));
        }

        const el = document.getElementById(targetId);
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY;
          window.scrollTo({ top, behavior: "auto" });
        }
      } else {
        // 无 hash 导航：回到顶部（与默认行为一致）
        window.scrollTo(0, 0);
        // 页面异步内容可能再次改变布局/滚动位置，双保险
        setTimeout(() => window.scrollTo(0, 0), 150);
      }
    });
  },
});
