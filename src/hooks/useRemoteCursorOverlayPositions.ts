import type { BaseRange } from "slate";
import type { NodeMatch, Text } from "slate";
import { getOverlayPosition } from "../utils/getOverlayPosition";
import type { OverlayPosition, CaretPosition, SelectionRect } from "../utils/getOverlayPosition";
import { type Ref, watchEffect } from "vue";
import { computed, ref, watch } from "vue";
import type { IDomEditor } from "@wangeditor-next/editor";
import type { CursorState } from "@wangeditor-next/yjs";
import { getCursorRange } from "../utils/getCursorRange.ts";
import { useRemoteCursorStates } from "./useRemoteCursorStates.ts";

const FROZEN_EMPTY_ARRAY = Object.freeze([]);

export type CursorOverlayData<TCursorData extends Record<string, unknown>> = CursorState<TCursorData> & {
  range: BaseRange | null;
  caretPosition: CaretPosition | null;
  selectionRects: SelectionRect[];
};

export type UseRemoteCursorOverlayPositionsOptions<T extends HTMLElement> = {
  shouldGenerateOverlay?: NodeMatch<Text>;
  editorRef: Ref<IDomEditor | undefined>;
} & (
  | {
      // Container the overlay will be rendered in. If set, all returned overlay positions
      // will be relative to this container and the cursor positions will be automatically
      // updated on container resize.
      containerRef?: undefined;
    }
  | {
      containerRef: Ref<T>;

      // Whether to refresh the cursor overlay positions on container resize. Defaults
      // to true. If set to 'debounced', the remote cursor positions will be updated
      // each animation frame.
      refreshOnResize?: boolean | "debounced";
    }
);

export function useRemoteCursorOverlayPositions<
  TCursorData extends Record<string, unknown>,
  TContainer extends HTMLElement = HTMLDivElement,
>({ containerRef, shouldGenerateOverlay, editorRef, ...opts }: UseRemoteCursorOverlayPositionsOptions<TContainer>) {
  // 1. 监听Y.js的change事件，从而改变cursorStates数据
  // 2. 监听cursorState数据 => 合并Y.js拿到的数据 => 形成最终的数据返回

  // ===============监听Y.js的改变从而自动改变cursors===============
  const { cursors } = useRemoteCursorStates(editorRef);

  // ===============监听containerRef的变化===============
  const observer = new ResizeObserver(() => {
    // 重新进行界面的渲染刷新
    overlayPositions.value = {};
    computeOverlayPosition(cursors.value);
  });
  const refreshOnResize = "refreshOnResize" in opts ? (opts.refreshOnResize ?? true) : true;
  watchEffect((onCleanup) => {
    if (refreshOnResize && containerRef && containerRef.value) {
      const element = containerRef.value;
      observer.observe(element);
    }

    onCleanup(() => {
      if (refreshOnResize && containerRef && containerRef.value) {
        const element = containerRef!.value;
        observer.unobserve(element);
      }
    });
  });
  // ===============监听containerRef的变化===============

  // ===============cursors改变从而触发overlayPositions的重新计算===============
  const overlayPositions = ref<Record<string, OverlayPosition>>({});
  const computeOverlayPosition = (newCursorsValue: Record<string, CursorState<TCursorData>>) => {
    if (!containerRef || !containerRef.value) {
      return;
    }

    const containerRect = containerRef!.value.getBoundingClientRect();
    const xOffset = containerRect?.x ?? 0;
    const yOffset = containerRect?.y ?? 0;

    const editor = editorRef.value!;

    const overlayPositionsChanged = Object.keys(overlayPositions.value).length !== Object.keys(newCursorsValue).length;
    if (overlayPositionsChanged) {
      const newOverlayPositions = Object.fromEntries(
        Object.entries(newCursorsValue).map(([key, state]) => {
          const range = state.relativeSelection && getCursorRange(editor, state);

          if (!range) {
            return [key, FROZEN_EMPTY_ARRAY];
          }

          const overlayPosition = getOverlayPosition(editor, range, {
            xOffset,
            yOffset,
            shouldGenerateOverlay,
          });

          return [key, overlayPosition];
        }),
      );
      overlayPositions.value = newOverlayPositions;
    }
  };
  watch(
    () => cursors.value,
    (newCursorsValue) => {
      // 重新计算overlayPosition
      computeOverlayPosition(newCursorsValue);
    },
    {
      deep: true,
    },
  );
  // ===============cursors改变从而触发overlayPositions的重新计算===============

  // ------------------------根据cursors和overlayPositions进行overlayData的计算------------------------
  type OverlayDataType = CursorState<TCursorData> & {
    range: BaseRange | null;
  } & OverlayPosition;
  const overlayData = computed(() => {
    if (!editorRef.value) {
      return [];
    }
    const editor = editorRef.value;
    return Object.entries(cursors.value).map(([clientId, state]) => {
      const range = state.relativeSelection ? getCursorRange(editor, state) : null;
      const overlayPosition = overlayPositions.value[clientId];

      return {
        ...state,
        range,
        caretPosition: overlayPosition?.caretPosition ?? null,
        selectionRects: overlayPosition?.selectionRects ?? FROZEN_EMPTY_ARRAY,
      };
    }) as Array<OverlayDataType>;
  });
  // ------------------------根据cursors和overlayPositions进行overlayData的计算------------------------

  return {
    cursors: overlayData,
  };
}
