import { onUnmounted, ref, toRaw, watch } from "vue";
import type { Ref } from "vue";
import { CursorEditor } from "@wangeditor-next/yjs";
import type { CursorState, RemoteCursorChangeEventListener } from "@wangeditor-next/yjs";
import type { IDomEditor } from "@wangeditor-next/editor";

export const useRemoteCursorStates = <TCursorData extends Record<string, unknown>>(
  editorRef: Ref<IDomEditor | undefined>,
) => {
  const cursors = ref<Record<string, CursorState<TCursorData>>>({});

  // ===============监听Y.js的改变从而自动改变cursors===============
  const getCurrentCursorState = (clientId: number) => {
    const editor = toRaw(editorRef.value);
    const state = CursorEditor.cursorState(editor, clientId);
    if (state === null) {
      delete cursors.value[clientId];
      return;
    }
    cursors.value[clientId] = state;
  };
  const changeHandler = (event: RemoteCursorChangeEventListener) => {
    event.added.forEach((clientId: number) => {
      getCurrentCursorState(clientId);
    });
    event.removed.forEach((clientId: number) => {
      getCurrentCursorState(clientId);
    });
    event.updated.forEach((clientId: number) => {
      getCurrentCursorState(clientId);
    });
  };

  const _initEditorWatch = watch(
    () => editorRef.value,
    (editor) => {
      if (editor) {
        // 拿到的是Vue3中的Proxy对象，跟原始对象是不同的映射
        CursorEditor.on(toRaw(editor), "change", changeHandler);

        // editor异步初始化完成后销毁监听
        _initEditorWatch();
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
