<template>
  <div class="app-container">
    <AppHeader />
    <div class="main-container">
      <AppSideBar />
      <MainContent>
        <router-view></router-view>
      </MainContent>
    </div>
    <NowPlaying />
  </div>
</template>

<script setup lang="ts">
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
