import type { BaseRange } from "slate";
import type { NodeMatch, Text, Range as SlateRange } from "slate";
import { getOverlayPosition } from "../utils/getOverlayPosition";
import type { OverlayPosition, CaretPosition, SelectionRect } from "../utils/getOverlayPosition";
import { type Ref, type ShallowRef, toRaw, watchEffect } from "vue";
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
  editorRef: ShallowRef<IDomEditor | undefined>;
} & {
  containerRef?: Ref<T | undefined>;
  // Whether to refresh the cursor overlay positions on container resize. Defaults
  // to true. If set to 'debounced', the remote cursor positions will be updated
  // each animation frame.
  refreshOnResize?: boolean | "debounced";
};

export function useRemoteCursorOverlayPositions<
  TCursorData extends Record<string, unknown>,
  TContainer extends HTMLElement = HTMLDivElement,
>({ containerRef, shouldGenerateOverlay, editorRef, ...opts }: UseRemoteCursorOverlayPositionsOptions<TContainer>) {
  // 1. 监听Y.js的change事件，从而改变cursorStates数据
  // 2. 监听cursorState数据 => 合并Y.js拿到的数据 => 形成最终的数据返回

  // ===============监听Y.js的改变从而自动改变cursors===============
  const { cursors } = useRemoteCursorStates(editorRef);

  // ===============监听containerRef的变化===============
  const refreshOnResize = containerRef ? (opts.refreshOnResize ?? true) : false;
  let rafId: number | null = null;
  const observer = new ResizeObserver(() => {
    // 重新进行界面的渲染刷新
    overlayPositionCache = new WeakMap();
    if (refreshOnResize === "debounced") {
      if (rafId) cancelAnimationFrame(rafId);

      rafId = requestAnimationFrame(() => {
        computeOverlayPosition(cursors.value);
      });
    } else {
      computeOverlayPosition(cursors.value);
    }
  });
  watchEffect((onCleanup) => {
    if (refreshOnResize && containerRef!.value) {
      const element = containerRef!.value;
      observer.observe(element);
    }

    onCleanup(() => {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      if (refreshOnResize && containerRef!.value) {
        const element = containerRef!.value;
        observer.unobserve(element);
      }
    });
  });
  // ===============监听containerRef的变化===============

  // ===============cursors改变从而触发overlayPositions的重新计算===============
  const overlayPositions = ref<Record<string, OverlayPosition>>({});
  let overlayPositionCache: WeakMap<SlateRange, OverlayPosition> = new WeakMap();
  const computeOverlayPosition = (newCursorsValue: Record<string, CursorState<TCursorData>>) => {
    // 监听containerRef.value挂载再触发一次computeOverlayPosition()
    // if (containerRef && !containerRef.value) {
    //   return;
    // }
    // 跟React版本一致，支持【containerRef.value】为空，代表还没初始化完成dom
    const containerRect = containerRef?.value?.getBoundingClientRect();
    const xOffset = containerRect?.x ?? 0;
    const yOffset = containerRect?.y ?? 0;

    const editor = toRaw(editorRef.value!);

    let overlayPositionsChanged = Object.keys(overlayPositions.value).length !== Object.keys(newCursorsValue).length;
    // 每次都更新位置
    const newOverlayPositions = Object.fromEntries(
      Object.entries(newCursorsValue).map(([key, state]) => {
        const range: SlateRange = state.relativeSelection && getCursorRange(editor, state);

        if (!range) {
          return [key, FROZEN_EMPTY_ARRAY];
        }

        if (overlayPositionCache.get(range)) {
          return [key, overlayPositionCache.get(range)];
        }

        const overlayPosition = getOverlayPosition(editor, range, {
          xOffset,
          yOffset,
          shouldGenerateOverlay,
        });
        overlayPositionCache.set(range, overlayPosition);
        overlayPositionsChanged = true;

        return [key, overlayPosition];
      }),
    );
    if (overlayPositionsChanged) {
      overlayPositions.value = newOverlayPositions;
    }
  };

  // 跟React的useLayoutEffect相同逻辑，只是Vue不需要重新渲染，只需要监听依赖的数据
  // containerRef可能为空，Vue支持监听null/undefined，不会进行响应式收集
  // overlayPosition的计算依赖于：当前传入的DOM-containerRef（需要一开始没挂载，需要一段时间才挂载），cursors的值变化
  // computeOverlayPosition()有使用缓存overlayPositionCache，即使跟observer.observe(element)重复触发，也不会重复赋值overlayPositions.value
  watch(
    () => [cursors.value, containerRef?.value],
    () => {
      if (!editorRef.value) return;
      // 重新计算overlayPosition
      computeOverlayPosition(cursors.value);
    },
    {
      immediate: true,
      flush: "sync",
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

  const refresh = () => {
    overlayPositionCache = new WeakMap();
    computeOverlayPosition(cursors.value);
  };

  return {
    cursors: overlayData,
    refresh: refresh,
  };
}
