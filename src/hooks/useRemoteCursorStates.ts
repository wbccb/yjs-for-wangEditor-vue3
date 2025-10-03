import { onUnmounted, ref, type ShallowRef, toRaw, watch } from "vue";
import { CursorEditor } from "@wangeditor-next/yjs";
import type { CursorState, RemoteCursorChangeEventListener } from "@wangeditor-next/yjs";
import type { IDomEditor } from "@wangeditor-next/editor";

export const useRemoteCursorStates = <TCursorData extends Record<string, unknown>>(
  editorRef: ShallowRef<IDomEditor | undefined>,
) => {
  const cursors = ref<Record<string, CursorState<TCursorData>>>({});

  // ===============监听Y.js的改变从而自动改变cursors===============
  const updateCursor = (clientId: number) => {
    const editor = toRaw(editorRef.value);
    if (!editor) return;
    const state = CursorEditor.cursorState(editor, clientId);
    if (state === null) {
      delete cursors.value[clientId.toString()];
      return;
    }
    cursors.value[clientId.toString()] = state;
  };
  const changeHandler = (event: RemoteCursorChangeEventListener) => {
    event.added.forEach((clientId: number) => {
      updateCursor(clientId);
    });
    event.removed.forEach((clientId: number) => {
      updateCursor(clientId);
    });
    event.updated.forEach((clientId: number) => {
      updateCursor(clientId);
    });
  };

  watch(
    () => editorRef.value,
    (newEditor, oldEditor) => {
      if (oldEditor) {
        CursorEditor.off(toRaw(oldEditor), "change", changeHandler);
      }
      if (newEditor) {
        // 拿到的是Vue3中的Proxy对象，跟原始对象是不同的映射
        CursorEditor.on(toRaw(newEditor), "change", changeHandler);
      }
    },
    {
      immediate: true,
    },
  );

  onUnmounted(() => {
    if (editorRef.value) {
      CursorEditor.off(toRaw(editorRef.value), "change", changeHandler);
    }
  });
  // ===============监听Y.js的改变从而自动改变cursors===============

  return {
    cursors,
  };
};
