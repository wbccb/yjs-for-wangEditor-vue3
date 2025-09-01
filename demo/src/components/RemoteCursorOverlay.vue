<template>
  <div class="relative" ref="containerRef">
    <slot></slot>
    <template v-if="cursors && cursors.length > 0">
      <template v-for="cursor in cursors" :key="cursor.clientId">
        <div
          class="absolute pointer-events-none"
          :style="{ backgroundColor: addAlpha(cursor.data.color, 0.5), ...cursor.position }"
        />

        <div class="w-0.5 absolute" :style="{ background: cursor.data.color, ...cursor.caretPosition }">
          <div
            class="absolute text-xs text-white whitespace-nowrap top-0 rounded rounded-bl-none px-1.5 py-0.5"
            :style="{ transform: 'translateY(-100%)', background: cursor.data.color }"
          >
            {{ cursor.data.name }}
          </div>
        </div>
      </template>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, watch, ref } from "vue";
import type { PropType } from "vue";
import { useRemoteCursorOverlayPositions } from "yjs-for-vue3";
import { addAlpha } from "../utils.ts";
import type { IDomEditor } from "@wangeditor-next/editor";
import type { CursorData } from "../types.ts";

export default defineComponent({
  name: "RemoteCursorOverlay",
  props: {
    editor: {
      type: Object as PropType<IDomEditor>,
    },
  },
  setup(props) {
    const containerRef = ref<HTMLDivElement>();

    const editorRef = ref<IDomEditor>();
    watch(
      () => props.editor,
      (newValue) => {
        if (newValue) {
          editorRef.value = newValue;
        }
      },
    );

    const { cursors } = useRemoteCursorOverlayPositions<CursorData, HTMLDivElement>({
      editorRef: editorRef,
      containerRef: containerRef,
    });

    return {
      containerRef,
      cursors,
      addAlpha,
    };
  },
});
</script>

<style scoped></style>
