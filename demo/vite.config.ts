import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // 关键：将库名指向根目录源码
      "yjs-for-vue3": path.resolve(__dirname, "../src/index.ts"),
    },
  },
  server: {
    // 启用热更新监听库目录
    watch: {
      ignored: ["!**/src/**"],
    },
  },
});
