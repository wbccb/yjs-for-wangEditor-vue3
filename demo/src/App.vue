<template>
  <!--  <remote-cursors-overlay-page></remote-cursors-overlay-page>-->
  <simple></simple>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import RemoteCursorsOverlayPage from "./components/RemoteCursorsOverlayPage.vue";
import Simple from "./components/Simple.vue";

export default defineComponent({
  components: { Simple, RemoteCursorsOverlayPage },
  setup() {},
});
</script>

<style scoped></style>
