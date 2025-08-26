<template>
  <div>
    <div style="border: 1px solid #ccc; z-index: 100">
      <Toolbar
        style="border-bottom: 1px solid #ccc"
        :editor="editorRef"
        :defaultConfig="toolbarConfig"
        mode="default"
      />
      <Editor
        style="height: 500px; overflow-y: hidden"
        v-model="html"
        :defaultConfig="editorConfig"
        mode="default"
        @onCreated="handleCreated"
      />
    </div>
    <div style="margin-top: 15px">{{ html }}</div>
    <div style="margin-top: 15px">{{ selectionString }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeUnmount, ref, shallowRef, onMounted } from "vue";
import "@wangeditor-next/editor/dist/css/style.css";
import { slateNodesToInsertDelta, withYHistory, withYjs, YjsEditor } from "@wangeditor-next/yjs";
import { Boot, IDomEditor, IEditorConfig, IToolbarConfig, SlateDescendant } from "@wangeditor-next/editor";
import { WebsocketProvider } from "y-websocket";
import * as Y from "yjs";
import { Editor, Toolbar } from "@wangeditor-next/editor-for-vue";

export default defineComponent({
  name: "Simple",
  components: { Editor, Toolbar },
  setup() {
    const html = ref("<p>hello</p>");
    const selectionString = ref("");

    const yDoc = new Y.Doc();
    const wsProvider = new WebsocketProvider("ws://localhost:1234", "wangeditor-next-yjs", yDoc);
    const sharedType = yDoc.get("content", Y.XmlText);

    Boot.registerPlugin(withYjs(sharedType));
    Boot.registerPlugin(withYHistory());
    wsProvider.on("status", (event) => {
      console.log(event.status);
    });
    console.log(Boot.plugins);

    const initialValue: SlateDescendant[] = [
      {
        type: "paragraph",
        children: [{ text: "hello" }],
      },
    ];

    // 工具栏配置
    const toolbarConfig: Partial<IToolbarConfig> = {};

    // 编辑器配置
    const editorConfig: Partial<IEditorConfig> = {
      placeholder: "请输入内容...",
    };

    console.log(Boot.plugins);

    // 编辑器实例，必须用 shallowRef
    const editorRef = shallowRef();

    // 组件销毁时，也及时销毁编辑器
    onBeforeUnmount(() => {
      const editor = editorRef.value;
      if (editor == null) return;
      editor.destroy();
    });

    const handleCreated = (editor: typeof Editor) => {
      editorRef.value = editor; // 记录 editor 实例，重要！
    };

    return {
      html,
      selectionString,
      editorConfig,
      handleCreated,
      editorRef,
      toolbarConfig,
    };
  },
});
</script>

<style scoped></style>
