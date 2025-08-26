import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import { test, testFn } from "yjs-for-vue3";

console.log(test);
console.log(testFn());

createApp(App).mount("#app");
