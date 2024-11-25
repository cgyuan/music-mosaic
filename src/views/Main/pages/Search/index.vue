<template>
  <div class="search-page">
    <h1 class="search-title"><span class="highlight">「{{ searchQuery }}」</span>的搜索结果</h1>
    <div class="search-categories">
      <span v-for="(category, index) in categories" :key="index" class="category"
        :class="{ 'active': activeIndex === index }" @click="activeIndex = index">
        {{ category }}
      </span>
    </div>
    <div class="tab-content">
      <component :is="activeComponent" :query="searchQuery" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import MusicSearch from './MusicSearch.vue';
import MusicSheetSearch from './MusicSheetSearch.vue';
import AlbumSearch from './AlbumSearch.vue';

const route = useRoute();
const searchQuery = ref(route.params.query as string);
const activeIndex = ref(0);

const categories = ['音乐', '专辑', '歌单', /*'专辑', '作者'*/];

const activeComponent = computed(() => {
  switch (activeIndex.value) {
    case 0:
      return MusicSearch;
    case 1:
      return AlbumSearch;
    case 2:
      return MusicSheetSearch;
    default:
      return MusicSearch;
  }
});

onMounted(() => {
});

</script>

<style scoped>
.search-page {
  height: 100%;
  /* padding: 20px; */
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.search-title {
  font-size: 24px;
  margin: 0 0 20px 0;
  font-weight: normal;
  margin: 0;
  padding: 20px 20px 0;
  color: var(--textColor);
}

.highlight {
  color: var(--primaryColor);
  font-weight: bold;
}

.search-categories {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  border-bottom: 1px solid transparent;
  padding: 0 20px;
}

.category {
  cursor: pointer;
  padding: 10px 0;
  font-size: 16px;
  color: var(--textColor);
  opacity: 0.7;
  position: relative;
}

.category.active {
  font-weight: bold;
  opacity: 1;
  color: var(--primaryColor);
}

.category.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: var(--primaryColor);
}

.tab-content {
  flex: 1;
  overflow: hidden;
  /* Add this to prevent content from overflowing */
  display: flex;
  /* Add this to allow child to expand */
}
</style>
