<template>
    <div class="ranking">
        <div class="plugin-tabs">
            <TabMenu :model="tabMenuItems" :activeIndex="activePluginIndex" @tab-change="onTabChange" />
        </div>

        <div class="ranking-lists" ref="rankingListsRef">
            <div v-for="(group, groupIndex) in rankingLists" :key="groupIndex" class="ranking-group">
                <h2 class="group-title">{{ group.title }}</h2>
                <DataView :value="group.data" :layout="'grid'" :rows="10">
                    <template #grid="slotProps">
                        <div class="ranking-grid">
                            <div v-for="(item, index) in slotProps.items" :key="index" class="ranking-item"
                                @click="goToMusicListDetail(item)">
                                <div class="ranking-image">
                                    <div class="image-container">
                                        <img :src="item.coverImg || albumCover" :alt="item.title" />
                                    </div>
                                </div>
                                <div class="ranking-info">
                                    <div class="ranking-title">{{ item.title || 'Untitled' }}</div>
                                    <div class="ranking-description" v-if="item.description">{{ item.description }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>
                </DataView>
            </div>
            <div class="empty-state">
                <Loading v-if="isLoading" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import TabMenu from 'primevue/tabmenu';
import DataView from 'primevue/dataview';
import { usePluginStore } from '@/store/pluginStore.ts';
import { storeToRefs } from 'pinia';
import Loading from '@/components/Loading.vue';
import albumCover from '@/assets/imgs/album-cover.jpg';
import router from '@/router';
import { MusicSheetType } from '@/common/constant';

const pluginStore = usePluginStore();
const { plugins, activePluginIndex } = storeToRefs(pluginStore);

const rankingLists = ref<IMusic.IMusicSheetGroupItem[]>([]);
const rankingListsRef = ref<HTMLElement | null>(null);
const isLoading = ref(false);

const supportPlugins = computed(() => plugins.value.filter(plugin => plugin.getTopLists));

const activePlugin = computed(() => supportPlugins.value[activePluginIndex.value]);

const tabMenuItems = computed(() => {
    return supportPlugins.value.map(plugin => ({
        label: plugin.platform,
        icon: 'pi pi-fw pi-music'
    }));
});

watch(supportPlugins, (newPlugins) => {
    if (newPlugins.length > 0) {
        activePluginIndex.value = 0;
        if (activePlugin.value) {
            pluginStore.setCurrentPluginId(activePlugin.value.id!!);
            loadRanking();
        }
    }
});

onMounted(() => {
    if (activePlugin.value) {
        pluginStore.setCurrentPluginId(activePlugin.value.id!!);
    }
    if (activePlugin.value) {
        loadRanking();
    }
});

const onTabChange = (event: { index: number }) => {
    activePluginIndex.value = event.index;
    pluginStore.setCurrentPluginId(activePlugin.value.id!!);
    loadRanking();
};

const loadRanking = async () => {
    if (activePlugin.value && activePlugin.value.getTopLists) {
        isLoading.value = true;
        rankingLists.value = [];
        try {
            const result = await activePlugin.value.getTopLists();
            rankingLists.value = result || [];
        } catch (error) {
            console.error(error);
        } finally {
            isLoading.value = false;
        }
    }
};

const goToMusicListDetail = (item: IMusic.IMusicSheetItem) => {
    item.platform = activePlugin.value.platform;
    router.push({
        name: 'music-sheet-detail',
        params: {
            id: item.id,
            itemData: JSON.stringify(item) 
        },
        query: {
            type: MusicSheetType.Ranking
        }
    });
};

</script>

<style scoped>
.ranking {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 0 20px;
}

.ranking-lists {
    flex-grow: 1;
    overflow-y: auto;
    padding-right: 20px;
    margin-right: -20px;
}

.ranking-group {
    margin-bottom: 2rem;
}

.group-title {
    font-size: 1.2rem;
    font-weight: bold;
    margin-bottom: 1rem;
}

.ranking-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(135px, 1fr));
    gap: 1rem;
}

.ranking-item {
    display: flex;
    flex-direction: column;
    background-color: #fff;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    cursor: pointer;
}

.ranking-image {
    width: 100%;
    aspect-ratio: 1 / 1;
    overflow: hidden;
}

.image-container {
    width: 100%;
    height: 100%;
    transition: transform 0.3s ease;
}

.image-container:hover {
    transform: scale(1.05);
}

.ranking-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.ranking-info {
    padding: 0.5rem;
}

.ranking-title {
    font-size: 0.9rem;
    font-weight: bold;
    margin-bottom: 0.25rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.ranking-description {
    font-size: 0.8rem;
    color: #666;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    padding: 2rem;
    color: #999;
}
</style>