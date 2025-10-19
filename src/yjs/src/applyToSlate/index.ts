import { Editor, Operation, Node } from "slate";
import * as Y from "yjs";

import { translateYTextEvent } from "./textEvent";

/**
 * Translate a yjs event into slate operations. The editor state has to match the
 * yText state before the event occurred.
 *
 * @param sharedType
 * @param op
 */
export function translateYjsEvent(sharedRoot: Y.XmlText, editor: Editor, event: Y.YEvent<Y.XmlText>): Operation[] {
  if (event instanceof Y.YTextEvent) {
    return translateYTextEvent(sharedRoot, editor, event);
  }

  throw new Error("Unexpected Y event type");
}

/**
 * Translates yjs events into slate operations and applies them to the editor. The
 * editor state has to match the yText state before the events occurred.
 *
 * @param sharedRoot
 * @param editor
 * @param events
 */
export function applyYjsEvents(sharedRoot: Y.XmlText, editor: Editor, events: Y.YEvent<Y.XmlText>[]) {
  Editor.withoutNormalizing(editor, () => {
    events.forEach((event, eventIndex) => {
      console.group(`📦 Processing Yjs Event ${eventIndex}`);
      console.log("Yjs Delta:", event.delta);

      const ops = translateYjsEvent(sharedRoot, editor, event);
      console.log(`Generated ${ops.length} Slate operations:`, ops);

      ops.forEach((op, opIndex) => {
        console.group(`⚙️ Applying op ${opIndex}: ${op.type}`);
        console.log("Operation:", op);

        // 打印应用前的状态（关键！）
        console.log("Slate before this op:", JSON.stringify(editor.children, null, 2));
        console.log("Full text before:", Node.string(editor));

        try {
          editor.apply(op);
        } catch (error) {
          console.error("❌ Failed to apply operation:", error);
          console.error("Operation that failed:", op);
          console.groupEnd();
          throw error;
        }

        // 打印应用后的状态（关键！）
        console.log("Slate after this op:", JSON.stringify(editor.children, null, 2));
        console.log("Full text after:", Node.string(editor));
        console.groupEnd();
      });

      console.groupEnd();
    });

    // 打印最终状态
    console.group("✅ applyYjsEvents - AFTER applying all events");
    console.log("Slate document after:", JSON.stringify(editor.children, null, 2));
    console.log("Full text after:", Node.string(editor));
    console.groupEnd();
  });
}
