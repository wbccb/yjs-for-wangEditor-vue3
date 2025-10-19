import type { RelativeRange } from "./module/custom-types";
import {
  CursorEditor,
  type CursorState,
  type CursorStateChangeEvent,
  type RemoteCursorChangeEventListener,
  withCursors,
  type WithCursorsOptions,
  withYHistory,
  type WithYHistoryOptions,
  withYjs,
  type WithYjsOptions,
  YHistoryEditor,
  YjsEditor,
} from "./plugins";
import { slateNodesToInsertDelta, yTextToSlateElement } from "./utils/convert";
import {
  relativePositionToSlatePoint,
  relativeRangeToSlateRange,
  slatePointToRelativePosition,
  slateRangeToRelativeRange,
} from "./utils/position";

export {
  // Base cursor plugin
  CursorEditor,
  type CursorState,
  type CursorStateChangeEvent,
  relativePositionToSlatePoint,
  // Utils
  type RelativeRange,
  relativeRangeToSlateRange,
  type RemoteCursorChangeEventListener,
  slateNodesToInsertDelta,
  slatePointToRelativePosition,
  slateRangeToRelativeRange,
  withCursors,
  type WithCursorsOptions,
  // History plugin
  withYHistory,
  type WithYHistoryOptions,
  withYjs,
  type WithYjsOptions,
  YHistoryEditor,
  YjsEditor,
  yTextToSlateElement,
};
