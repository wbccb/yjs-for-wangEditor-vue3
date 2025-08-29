import { onMounted, onUnmounted, ref } from "vue";
import { CursorEditor, CursorState, RemoteCursorChangeEventListener } from "@wangeditor-next/yjs";
import type { IDomEditor } from "@wangeditor-next/editor";

export const useRemoteCursorStates = <TCursorData extends Record<string, unknown>>(editor: IDomEditor) => {
  const cursors = ref<Record<string, CursorState<TCursorData>>>({});

  // ===============监听Y.js的改变从而自动改变cursors===============
  const getCurrentCursorState = (clientId: number) => {
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
  onMounted(() => {
    CursorEditor.on(editor, "change", changeHandler);
  });
  onUnmounted(() => {
    CursorEditor.off(editor, "change", changeHandler);
  });
  // ===============监听Y.js的改变从而自动改变cursors===============

  return {
    cursors,
  };
};
