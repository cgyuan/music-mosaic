<script setup lang="ts">
import { computed } from 'vue';
import Main from './Main.vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const isMiniPlayer = computed(() => route.path.startsWith('/mini-player'));

console.log('route', route.path);
</script>

<template>
  <router-view v-if="isMiniPlayer"></router-view>
  <Main v-else />
</template>

<style scoped>

</style>
