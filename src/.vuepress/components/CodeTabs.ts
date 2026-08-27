// 自定义 CodeTabs 组件：覆盖 @vuepress/plugin-markdown-tab 的 CodeTabs。
// 能力扩展：
// 1) 识别"空内容"tab（如仅 Kotlin 代码块中被清空的 Java tab）→ 标记为 disabled：
//    按钮灰化、不可点击、键盘导航跳过、默认不激活；
// 2) 默认激活第一个非 disabled tab（原组件默认激活 props.active，
//    对"仅 Kotlin"块（Java 为空）会自动落到 Kotlin）；
// 其余行为（tabId 记忆、键盘左右切换、aria）与原组件一致。
import { useStorage } from "@vueuse/core";
import { defineComponent, h, onMounted, ref, shallowRef, useId, watch } from "vue";

const store = useStorage(`VUEPRESS_CODE_TAB_STORE`, {});

export default defineComponent({
  name: `CodeTabs`,
  props: {
    active: { type: Number, default: 0 },
    data: { type: Array, required: true },
    tabId: String,
  },
  slots: Object,
  setup(props, { slots }) {
    const data = props.data as { id: string }[];
    const ids = data.map(() => useId());
    const navRefs = shallowRef<HTMLButtonElement[]>([]);

    // tab 内容 slot 为空 → 该 tab 无内容（仅 Kotlin 块的 Java tab）→ disabled
    const isDisabled = (idx: number): boolean => {
      const vnodes = (slots as any)[`tab${idx}`]?.({
        value: data[idx].id,
        isActive: false,
      });
      return !vnodes || vnodes.length === 0;
    };
    const disabled = data.map((_, idx) => isDisabled(idx));

    // 默认激活第一个非 disabled tab
    const firstEnabled = data.findIndex((_, idx) => !disabled[idx]);
    const activeIndex = ref(firstEnabled === -1 ? props.active : firstEnabled);

    const save = () => {
      if (props.tabId) {
        store.value[props.tabId] = data[activeIndex.value].id;
      }
    };

    const next = (from: number) => {
      let idx = from;
      for (let i = 0; i < data.length; i++) {
        idx = (idx + 1) % data.length;
        if (!disabled[idx]) {
          activeIndex.value = idx;
          navRefs.value[idx]?.focus();
          return;
        }
      }
    };

    const prev = (from: number) => {
      let idx = from;
      for (let i = 0; i < data.length; i++) {
        idx = (idx - 1 + data.length) % data.length;
        if (!disabled[idx]) {
          activeIndex.value = idx;
          navRefs.value[idx]?.focus();
          return;
        }
      }
    };

    const handleKeydown = (event: KeyboardEvent, idx: number) => {
      if (disabled[idx]) return;
      if (event.key === ` ` || event.key === `Enter`) {
        event.preventDefault();
        activeIndex.value = idx;
      } else if (event.key === `ArrowRight`) {
        event.preventDefault();
        next(activeIndex.value);
      } else if (event.key === `ArrowLeft`) {
        event.preventDefault();
        prev(activeIndex.value);
      }
      if (props.tabId) {
        store.value[props.tabId] = data[activeIndex.value].id;
      }
    };

    const restore = (): number => {
      if (props.tabId) {
        const saved = store.value[props.tabId];
        const idx = data.findIndex(({ id }) => id === saved);
        if (idx !== -1 && !disabled[idx]) return idx;
      }
      return -1;
    };

    onMounted(() => {
      const saved = restore();
      if (saved !== -1) activeIndex.value = saved;
      watch(
        () => props.tabId && store.value[props.tabId],
        (newId, oldId) => {
          if (props.tabId && newId !== oldId) {
            const idx = data.findIndex(({ id }) => id === newId);
            if (idx !== -1 && !disabled[idx]) activeIndex.value = idx;
          }
        },
      );
    });

    return () =>
      data.length
        ? h(`div`, { class: `vp-code-tabs` }, [
            h(
              `div`,
              { class: `vp-code-tabs-nav`, role: `tablist` },
              data.map((tab, idx) => {
                const isActive = idx === activeIndex.value;
                return h(
                  `button`,
                  {
                    type: `button`,
                    ref: (el) => {
                      if (el) navRefs.value[idx] = el as HTMLButtonElement;
                    },
                    class: [`vp-code-tab-nav`, { active: isActive, disabled: disabled[idx] }],
                    role: `tab`,
                    "aria-controls": ids[idx],
                    "aria-selected": isActive,
                    "aria-disabled": disabled[idx] ? `` : undefined,
                    disabled: disabled[idx] ? `` : undefined,
                    title: disabled[idx] ? `此代码块仅支持 Kotlin 写法` : undefined,
                    onClick: () => {
                      if (disabled[idx]) return;
                      activeIndex.value = idx;
                      save();
                    },
                    onKeydown: (event: KeyboardEvent) => handleKeydown(event, idx),
                  },
                  slots[`title${idx}`]({ value: tab.id, isActive }),
                );
              }),
            ),
            data.map((tab, idx) => {
              const isActive = idx === activeIndex.value;
              return h(
                `div`,
                {
                  class: [`vp-code-tab`, { active: isActive }],
                  id: ids[idx],
                  role: `tabpanel`,
                  "aria-expanded": isActive,
                },
                [
                  h(
                    `div`,
                    { class: `vp-code-tab-title` },
                    slots[`title${idx}`]({ value: tab.id, isActive }),
                  ),
                  slots[`tab${idx}`]({ value: tab.id, isActive }),
                ],
              );
            }),
          ])
        : null;
  },
});
