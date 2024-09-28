<script setup lang="ts">
import { usePluginStore } from './store/pluginStore';

const pluginStore = usePluginStore();
pluginStore.$persistedState.isReady().then(() => {
    pluginStore.loadPlugins();
});
</script>

<template>
  <router-view></router-view>
</template>

<style scoped>

</style>
