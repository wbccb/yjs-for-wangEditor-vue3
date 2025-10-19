import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue"; // 如果是 Vue 库
import { resolve } from "path";
import dts from "vite-plugin-dts";

const libName = "yjs-for-vue3";
export default defineConfig({
  // 构建配置
  build: {
    // 输出目录
    outDir: "dist",

    // 入口文件
    lib: {
      // 库的入口文件
      entry: resolve(__dirname, "src/index.ts"),
      // 最终生成的文件名
      name: libName,
      fileName: (format) => `${libName}.${format}.js`, // 输出文件名
      formats: ["es", "cjs", "umd"], // 支持的格式
    },

    // 输出配置
    rollupOptions: {
      // 确保外部化处理某些依赖，防止被打包进库
      external: ["vue"],
      output: {
        // 为 UMD 构建指定全局变量
        globals: {
          vue: "Vue",
        },
      },
    },

    // 清空上次构建
    emptyOutDir: true,
  },

  // 使用插件生成 .d.ts 类型声明文件
  plugins: [
    vue(),
    dts({
      insertTypesEntry: true, // 生成 types entry（package.json 的 types 字段）
      cleanVueFileName: true, // 清理 .vue.d.ts 文件名
      copyDtsFiles: true, // 复制源码中的 .d.ts 文件
    }),
  ],

  // 类型：'lib' 模式推荐设置
  esbuild: {
    // 压缩选项（可选）
    minifyIdentifiers: false,
    minifySyntax: true,
    minifyWhitespace: true,
  },

  // 开发服务器（可选）
  server: {
    port: 3000,
    open: true,
  },
  resolve: {
    alias: {
      "@wangeditor-next/yjs": resolve(__dirname, "./src/yjs/index.ts"),
    },
  },
});
