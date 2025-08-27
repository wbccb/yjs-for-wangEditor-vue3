<template>
  <div class="relative" ref="containerRef">
    <slot></slot>
    <template v-for="cursor in cursors">
      <div
        class="absolute pointer-events-none"
        :key="cursor.clientId"
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
  </div>
</template>

<script lang="ts">
import { type CSSProperties, defineComponent, ref } from "vue";
import { useRemoteCursorOverlayPositions } from "yjs-for-vue3";
import { addAlpha } from "../utils.ts";

export default defineComponent({
  name: "RemoteCursorOverlay",
  setup() {
    const containerRef = ref<HTMLDivElement>();
    const { cursors } = useRemoteCursorOverlayPositions<CursorData>({
      containerRef,
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
