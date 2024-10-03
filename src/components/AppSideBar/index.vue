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
            <div class="section-header" @click="toggleMusicSheetSection">
                <div class="section-label">
                    <i :class="isMusicSheetOpen ? 'pi pi-angle-down' : 'pi pi-angle-right'"></i>
                    <span>我的歌单</span>
                </div>
                <SvgAsset iconName="plus" :size="16" @click.stop="showCreatePlaylistModal" />
            </div>
            <SidebarItem v-if="isMusicSheetOpen"
                v-for="item in musicSheets" 
                :key="item.id" 
                :icon="item.id === 'favorite' ? 'heart-outline' : 'musical-note'" 
                :label="item.title" 
                @click="handleMyMusicSheetClick(item)" 
                :active="isActive(`/my-music-sheet-detail/${item.id}`)" 
                @contextmenu="(event) => showContextMenu(event, item)" 
            />
        </div>

        <div class="sidebar-section">
            <div class="section-header" @click="toggleStaredMusicSheetSection">
                <div class="section-label">
                    <i :class="isStaredMusicSheetOpen ? 'pi pi-angle-down' : 'pi pi-angle-right'"></i>
                    <span>我的收藏</span>
                </div>
            </div>
            <SidebarItem 
                v-if="isStaredMusicSheetOpen"
                v-for="item in starredSheets" 
                :key="item.id" icon="musical-note" 
                :label="item.title"
                :active="isActive(`/stared-music-sheet/${item.id}`)"
                @contextmenu="(event) => showStaredContextMenu(event, item as IMusic.IDBMusicSheetItem)"
                @click="handleStaredMusicSheetClick(item as IMusic.IDBMusicSheetItem)"
            />
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
    <ContextMenu :model="staredContextMenuItems" ref="staredContextMenu" />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Button from 'primevue/button';
import SidebarItem from './SidebarItem.vue';
import { SvgAssetIconNames } from '../SvgAsset.vue';
import MusicSheetModal from './MusicSheetModal.vue';
import ContextMenu from 'primevue/contextmenu';
import MusicSheet from '@/music-sheet';
import { MusicSheetType } from '@/common/constant';

const musicSheets = MusicSheet.frontend.useAllSheets();
const starredSheets = MusicSheet.frontend.useAllStarredSheets();

const route = useRoute();
const router = useRouter();

const isEditingMusicSheet = ref(false);
const isMusicSheetModalVisible = ref(false);

let selectedMusicSheet = null as IMusic.IDBMusicSheetItem | null;

watch(starredSheets, (newVal) => {
    console.log(newVal);
}, {
    deep: true
});

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
    return route.path.startsWith(path);
};

const handleMyMusicSheetClick = (item: IMusic.IDBMusicSheetItem) => {
    navigateTo(`/my-music-sheet-detail/${item.id}`);
};

const handleStaredMusicSheetClick = (item: IMusic.IDBMusicSheetItem) => {
    const data = JSON.stringify(item)
    history.pushState({ item: data }, '')
    router.push({
        name: 'stared-music-sheet',
        params: { 
            id: item.id,
            itemData: data
        },
        query: {
            type: MusicSheetType.Cloud,
        },
    });
};

const navigateTo = (path: string) => {
    router.push(path);
};

const showCreatePlaylistModal = () => {
    isEditingMusicSheet.value = false;
    selectedMusicSheet = null;
    isMusicSheetModalVisible.value = true;
};

const handleMusicSheetSubmit = async (title: string) => {
    if (isEditingMusicSheet.value && selectedMusicSheet) {
        MusicSheet.frontend.updateSheet(selectedMusicSheet.id, {
            title: title
        });
    } else {
        try {
            const newSheet = await MusicSheet.frontend.addSheet(title);
            console.log(newSheet);
        } catch (error) {
            console.error(error);
        }
        
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
                if (route.path === `/my-music-sheet-detail/${selectedMusicSheet.id}`) {
                    navigateTo('/my-music-sheet-detail/favorite');
                }
                MusicSheet.frontend.removeSheet(selectedMusicSheet.id);
                selectedMusicSheet = null;
            }
        }
    }
]);

const staredContextMenu = ref();
const staredContextMenuItems = ref([
    {
        label: '取消收藏',
        icon: 'pi pi-trash',
        command: () => {
            if (selectedMusicSheet) {
                MusicSheet.frontend.unstarMusicSheet(selectedMusicSheet);
                selectedMusicSheet = null;
            }
        }
    }
]);

const showContextMenu = (event: MouseEvent, item: IMusic.IDBMusicSheetItem) => {
    if (item.id !== 'favorite') {
        event.preventDefault();
        selectedMusicSheet = item;
        contextMenu.value.show(event);
    }
};

const showStaredContextMenu = (event: MouseEvent, item: IMusic.IDBMusicSheetItem) => {
    event.preventDefault();
    selectedMusicSheet = item;
    staredContextMenu.value.show(event);
};

const isMusicSheetOpen = ref(true);
const toggleMusicSheetSection = () => {
    isMusicSheetOpen.value = !isMusicSheetOpen.value;
};

const isStaredMusicSheetOpen = ref(true);
const toggleStaredMusicSheetSection = () => {
    isStaredMusicSheetOpen.value = !isStaredMusicSheetOpen.value;
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