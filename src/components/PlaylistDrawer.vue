<template>
  <Teleport to="#app">
    <div v-if="visible" class="playlist-drawer-overlay" @click="close"></div>
    <div class="playlist-drawer" :class="{ 'playlist-drawer-visible': visible }" @transitionend="onTransitionEnd">
      <div class="playlist-drawer-header">
        <h2>播放列表 ({{ playlist.length }}首)</h2>
        <div>
          <Button icon="pi pi-trash" label="清空" @click="clearPlaylist" />
        </div>
      </div>
      <DataTable :value="playlist" class="playlist-table" @row-click="onRowClick" :showHeaders="false" ref="dataTable">
        <Column style="width: 100px;">
          <template #body="slotProps">
            <Button icon="pi pi-heart" text @click.stop="toggleFavorite(slotProps.data)" 
                    :class="{ 'p-button-danger': isFavorite(slotProps.data) }" 
                    tooltip="收藏" />
            <Button icon="pi pi-download" text @click.stop="downloadTrack(slotProps.data)" 
                    tooltip="下载" />
          </template>
        </Column>
        <Column field="title" style="max-width: 200px;">
          <template #body="slotProps">
            <span :class="{ 'playing-track': isCurrentTrack(slotProps.data) }">
              {{ slotProps.data.title }}
            </span>
          </template>
        </Column>
        <Column field="artist" style="max-width: 150px;">
            <template #body="slotProps">
                <span :class="{ 'playing-track': isCurrentTrack(slotProps.data) }">
                {{ slotProps.data.artist }}
                </span>
            </template>
        </Column>
        <Column field="platform" style="max-width: 100px;">
            <template #body="slotProps">
                <span class="source-tag">{{ slotProps.data.platform }}</span>
            </template>
        </Column>
        <Column style="width: 50px;">
          <template #body="slotProps">
            <Button icon="pi pi-times" text @click.stop="removeFromPlaylist(slotProps.index)" 
                    tooltip="从列表中删除" />
          </template>
        </Column>
      </DataTable>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { usePlayerStore } from '../store/playerStore';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';

const playerStore = usePlayerStore();
const visible = ref(false);
const playlist = computed(() => playerStore.playlist);
const dataTable = ref<InstanceType<typeof DataTable> | null>(null);
const isTransitionComplete = ref(false);

const clearPlaylist = () => {
  playerStore.clearPlaylist();
};

const removeFromPlaylist = (index: number) => {
  playerStore.removeFromPlaylist(index);
};

const onRowClick = (event: { data: IMusic.IMusicItem }) => {
  playerStore.setCurrentTrackAndPlay(event.data);
};

const close = () => {
  visible.value = false;
};

const toggleFavorite = (track: IMusic.IMusicItem) => {
  // Implement the logic to toggle favorite status
  console.log('Toggle favorite:', track);
};

const isFavorite = (track: IMusic.IMusicItem) => {
  // Implement the logic to check if a track is favorited
  return false; // Placeholder
};

const downloadTrack = (track: IMusic.IMusicItem) => {
  // Implement the logic to download the track
  console.log('Download track:', track);
};

const isCurrentTrack = (track: IMusic.IMusicItem) => {
  return playerStore.currentTrack?.id === track.id;
};

const scrollToCurrentTrack = () => {
  if (playerStore.currentTrack && isTransitionComplete.value) {
    const index = playlist.value.findIndex(track => track.id === playerStore.currentTrack?.id);
    if (index !== -1) {
      nextTick(() => {
        const tableBody = document.querySelector('.playlist-table .p-datatable-tbody');
        const targetRow = tableBody?.children[index] as HTMLElement;
        if (targetRow) {
          targetRow.scrollIntoView({ behavior: 'auto', block: 'center' });
        }
      });
    }
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
  top: 57px;
  left: 0;
  right: 0;
  bottom: 68px;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 998;
}

.playlist-drawer {
  position: fixed;
  top: 57px;
  right: -600px;
  width: 600px;
  height: calc(100vh - 57px - 68px);
  background-color: white;
  /* box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1); */
  transition: right 0.3s ease;
  z-index: 999;
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
  border-bottom: 1px solid #e9ecef;
}

.playlist-drawer-header h2 {
  margin: 0;
}

.playlist-table {
  flex-grow: 1;
  overflow-y: auto;
  scroll-behavior: smooth;
  font-size: 14px;
}

.playlist-table :deep(.p-button) {
  padding: 0.5rem;
}

.playlist-table :deep(.p-button-icon) {
  font-size: 1rem;
}

.playlist-table :deep(.p-datatable-tbody > tr > td) {
  padding: 0.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.playlist-table :deep(.p-datatable-thead) {
  display: none;
}

.playing-track {
  color: #2196F3;
}

.source-tag {
    background-color: #f0f0f0;
    border-radius: 12px;
    padding: 2px 8px;
    font-size: 12px;
}
</style>
