<template>
  <Teleport to="#root">
    <div v-if="visible" class="playlist-drawer-overlay" @click="close"></div>
    <div class="playlist-drawer" :class="{ 'playlist-drawer-visible': visible }" @transitionend="onTransitionEnd">
      <div class="playlist-drawer-header">
        <h5>播放列表 ({{ playlist.length }}首)</h5>
        <div>
          <Button text rounded size="small" label="清空" @click="clearPlaylist" />
        </div>
      </div>
      <CustomDataTable
        ref="dataTable"
        :value="playlist"
        :columns="columns"
        keyField="id"
        :stripedRows="true"
        class="playlist-table"
        :bufferSize="10"
        :showHeader="false"
        @row-dblclick="onRowDoubleClick"
      >
        <template #cell:actions="{ item }">
          <div class="item-actions">
            <MusicFavorite :musicItem="item" :size="16" />
            <MusicDownloaded :musicItem="item" :size="16" />
          </div>
        </template>
        <template #cell:title="{ item }">
          <span :class="{ 'playing-track': isCurrentTrack(item) }">
            {{ item.title }}
          </span>
        </template>
        <template #cell:artist="{ item }">
          <span :class="{ 'playing-track': isCurrentTrack(item) }">
            {{ item.artist }}
          </span>
        </template>
        <template #cell:platform="{ item }">
          <span class="source-tag">{{ item.platform }}</span>
        </template>
        <template #cell:remove="{ item, index }">
          <SvgAsset class="remove-icon" iconName="x-mark" :size="16" @click.stop="removeFromPlaylist(index)" />
        </template>
        <template #empty>
          <Empty />
        </template>
      </CustomDataTable>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { usePlayerStore } from '@/store/playerStore';
import Button from 'primevue/button';
import MusicFavorite from './MusicFavorite.vue';
import MusicDownloaded from './MusicDownloaded.vue';
import CustomDataTable from './CustomDataTable.vue';
import SvgAsset from '@/components/SvgAsset.vue';
import Empty from '@/components/Empty.vue';
import { useUIStore } from '@/store/uiStore';
import { storeToRefs } from 'pinia';

const dataTable = ref<InstanceType<typeof CustomDataTable> | null>(null);
const playerStore = usePlayerStore();
const visible = ref(false);
const playlist = computed(() => playerStore.playlist);
const isTransitionComplete = ref(false);

const { showLyricView } = storeToRefs(useUIStore());

const columns = [
  { field: 'actions', header: '', width: '100px' },
  { field: 'title', header: '标题', width: '200px' },
  { field: 'artist', header: '艺术家' },
  { field: 'platform', header: '来源', width: '120px' },
  { field: 'remove', header: '', width: '60px' }
];

const clearPlaylist = () => {
  showLyricView.value = false;
  playerStore.clearPlaylist();
};

const removeFromPlaylist = (index: number) => {
  playerStore.removeFromPlaylist(index);
};

const onRowDoubleClick = (event: { item: IMusic.IMusicItem }) => {
  playerStore.setCurrentTrackAndPlay(event.item);
};

const close = () => {
  visible.value = false;
};

const isCurrentTrack = (track: IMusic.IMusicItem) => {
  return playerStore.currentTrack?.id === track.id && playerStore.currentTrack.platform === track.platform;
};

const scrollToCurrentTrack = () => {
  if (playerStore.currentTrack && isTransitionComplete.value) {
    const index = playlist.value.findIndex(track => track.id === playerStore.currentTrack?.id);
    dataTable.value?.scrollToIndex(index, { smooth: true, position: 'center' });
  }
};

const onTransitionEnd = (event: TransitionEvent) => {
  if (event.propertyName === 'right' && visible.value) {
    isTransitionComplete.value = true;
    scrollToCurrentTrack();
  }
};

watch(() => visible.value, (newValue) => {
  if (newValue) {
    isTransitionComplete.value = false;
  } else {
    isTransitionComplete.value = true;
  }
});

defineExpose({ visible });
</script>

<style scoped>
.playlist-drawer-overlay {
  position: fixed;
  top: 54px;
  left: 0;
  right: 0;
  bottom: 64px;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 99;
}

.playlist-drawer {
  position: fixed;
  top: 54px;
  right: -600px;
  width: 600px;
  height: calc(100vh - 54px - 64px);
  background-color: var(--backgroundColor);
  /* box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1); */
  transition: right 0.3s ease;
  z-index: 99;
  display: flex;
  flex-direction: column;
}

.playlist-drawer-visible {
  right: 0;
}

.playlist-drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--borderColor);
  color: var(--textColor);
}

.playlist-drawer-header h5 {
  margin: 0;
  font-size: 16px;
}

.playlist-table {
  box-sizing: border-box;
  /* margin: 0 1rem; */
  font-size: 14px;
}

.playing-track {
  color: var(--primaryColor);
}

.item-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
}

.source-tag {
  background-color: var(--primaryColor);
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 12px;
  color: white;
}

.remove-icon {
  cursor: pointer;
}
</style>
