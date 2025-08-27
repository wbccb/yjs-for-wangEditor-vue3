# demo

## 1. 基础协同编辑版本

代码位于`demo/src/components/Simple.vue`

在`App.vue`中使用
```html
<template>
    <simple></simple>
</template>
```

### 1.1 启动本地WebSocket服务器
启动一个简单的websocket服务器，内部自动处理了Y.js相关的更新命令接收 和 转化到各个服务器
```shell
 npx y-websocket-server --port 1234 --path /wangeditor-next-yjs
```

### 1.2 启动服务
```shell
pnpm run dev
```

### 1.3 打开浏览器输入链接查看效果
打开多个`http://localhost:5173/`

或者可以多起几个服务：
- `http://localhost:5173/`
- `http://localhost:5174/`
- `http://localhost:5175/`

## 2. 协同编辑-光标版本

代码位于`demo/src/components/RemoteCursorsOverlayPage.vue`

在`App.vue`中使用
```html
<template>
    <remote-cursors-overlay-page></remote-cursors-overlay-page>
</template>
```