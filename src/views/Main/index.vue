<template>
  <div class="app-container">
    <AppHeader />
    <div class="main-container">
      <AppSideBar />
      <MainContent>
        <router-view :key="$route.fullPath"></router-view>
      </MainContent>
    </div>
    <NowPlaying />
    <PlaylistDrawer ref="playlistDrawer" />
  </div>
</template>

<script setup lang="ts">
import { provide, ref } from 'vue';

const playlistDrawer = ref(null);

// Provide the playlistDrawer to be accessible by child components
provide('playlistDrawer', playlistDrawer);
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.main-container {
  display: flex;
  flex: 1;
  overflow: hidden;
}
</style>
