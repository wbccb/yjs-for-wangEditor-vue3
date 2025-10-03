import { defineComponent, inject, type PropType, type ShallowRef, provide } from "vue";
import type { IDomEditor } from "@wangeditor-next/editor";

const EDITOR_CONTEXT_KEY = Symbol("editorContext");

export const useEditorStatic = (): ShallowRef<IDomEditor | null> | null => {
  const editor = inject<ShallowRef<IDomEditor | null> | null>(EDITOR_CONTEXT_KEY, null);
  if (!editor) {
    // 如果外部没有provide(ShallowRef)，则报错
    console.warn(
      "The `useEditorStatic` composable must be used inside the <EditorContextProvider> component's context.",
    );
  }
  return editor;
};

export const EditorContextProvider = defineComponent({
  name: "EditorContextProvider",
  props: {
    editor: {
      type: Object as PropType<ShallowRef<IDomEditor | null>>,
      required: true,
    },
  },
  setup(props, { slots }) {
    provide(EDITOR_CONTEXT_KEY, props.editor);
    return () => slots.default?.();
  },
});
