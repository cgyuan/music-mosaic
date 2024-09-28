<template>
    <div class="app-sidebar">
        <div class="sidebar-section">
            <SidebarItem 
                v-for="item in navMenus" 
                :key="item.path" 
                :icon="item.icon" 
                :label="item.label" 
                :active="isActive(item.path)" 
                @click="navigateTo(item.path)" 
            />
        </div>
        <div class="sidebar-section">
            <div class="section-header">
                <div class="section-label">
                    <i class="pi pi-angle-down"></i>
                    <span>我的歌单</span>
                </div>
                <Button icon="pi pi-plus" text rounded severity="secondary" size="small" @click="showCreatePlaylistModal" />
            </div>
            <SidebarItem 
                v-for="item in musicSheetsSummaries" 
                :key="item.id" 
                :icon="item.id === 'favorite' ? 'heart-outline' : 'musical-note'" 
                :label="item.title" 
                @click="handlePlaylistClick(item)" 
                :active="isActive(`/playlist-detail/${item.id}`)" 
                @contextmenu="(event) => showContextMenu(event, item)" 
            />
        </div>

        <div class="sidebar-section">
            <div class="section-header">
                <div class="section-label">
                    <i class="pi pi-angle-right"></i>
                    <span>我的收藏</span>
                </div>
            </div>
        </div>
    </div>
    <MusicSheetModal 
        :visible="isMusicSheetModalVisible" 
        :is-editing="isEditingMusicSheet"
        :initial-name="selectedMusicSheet?.title"
        @update:visible="isMusicSheetModalVisible = $event"
        @submit="handleMusicSheetSubmit" 
    />
    <ContextMenu :model="contextMenuItems" ref="contextMenu" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Button from 'primevue/button';
import SidebarItem from './SidebarItem.vue';
import { SvgAssetIconNames } from '../SvgAsset.vue';
import { MusicSheetSummary, useMusicSheetStore } from '@/store/musicSheetStore';
import { storeToRefs } from 'pinia';
import MusicSheetModal from './MusicSheetModal.vue';
import ContextMenu from 'primevue/contextmenu';


const musicSheetStore = useMusicSheetStore();

const route = useRoute();
const router = useRouter();

const { addMusicSheet, renameMusicSheet } = useMusicSheetStore();
const { musicSheetsSummaries, currentMusicSheet } = storeToRefs(useMusicSheetStore());

const isEditingMusicSheet = ref(false);
const isMusicSheetModalVisible = ref(false);

let selectedMusicSheet = null as MusicSheetSummary | null;

const navMenus = [
    {
        label: '排行榜',
        icon: 'trophy',
        path: '/ranking'
    },
    {
        label: '热门歌单',
        icon: 'fire',
        path: '/poppular'
    },
    {
        label: '下载管理',
        icon: 'array-download-tray',
        path: '/download'
    },
    {
        label: '本地音乐',
        icon: 'folder-open',
        path: '/local'
    },
    {
        label: '插件管理',
        icon: 'code-bracket-square',
        path: '/plugin'
    },
    {
        label: '最近播放',
        icon: 'clock',
        path: '/recent'
    },
] as Array<{label: string, icon: SvgAssetIconNames, path: string}>;

const isActive = (path: string) => {
    return route.path === path;
};

const handlePlaylistClick = (item: MusicSheetSummary) => {
    currentMusicSheet.value = item;
    navigateTo(`/playlist-detail/${item.id}`);
};

const navigateTo = (path: string) => {
    router.push(path);
};

const showCreatePlaylistModal = () => {
    isEditingMusicSheet.value = false;
    selectedMusicSheet = null;
    isMusicSheetModalVisible.value = true;
};

const handleMusicSheetSubmit = (title: string) => {
    if (isEditingMusicSheet.value && selectedMusicSheet) {
        renameMusicSheet(selectedMusicSheet.id, title);
    } else {
        addMusicSheet(title);
    }
    isMusicSheetModalVisible.value = false;
};

const contextMenu = ref();
const contextMenuItems = ref([
    {
        label: '重命名歌单',
        icon: 'pi pi-pencil',
        command: () => {
            if (selectedMusicSheet) {
                isEditingMusicSheet.value = true;
                isMusicSheetModalVisible.value = true;
            }
        }
    },
    {
        label: '删除歌单',
        icon: 'pi pi-trash',
        command: () => {
            if (selectedMusicSheet) {
                if (route.path === `/playlist-detail/${selectedMusicSheet.id}`) {
                    navigateTo('/playlist-detail/favorite');
                }
                musicSheetStore.removeMusicSheet(selectedMusicSheet.id);
                selectedMusicSheet = null;
            }
        }
    }
]);

const showContextMenu = (event: MouseEvent, item: MusicSheetSummary) => {
    if (item.id !== 'favorite') {
        event.preventDefault();
        selectedMusicSheet = item;
        contextMenu.value.show(event);
    }
};
</script>

<style scoped>
.app-sidebar {
    width: 200px;
    min-width: 200px;
    background-color: #f8f9fa;
    height: 100%;
    padding: 1rem 0;
    overflow-y: auto;
}

.sidebar-section {
    margin-bottom: 1.5rem;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
    padding: 0 1rem;
    font-size: 0.9rem;
    color: #6c757d;
}

.section-label {
    flex: 1;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.2rem;
}

.section-actions {
    display: flex;
    gap: 0.25rem;
}

:deep(.p-button.p-button-text) {
    color: #6c757d;
    padding: 0.25rem;
}

:deep(.p-button.p-button-text:hover) {
    background-color: #e9ecef;
}

</style>