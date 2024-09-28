<template>
    <div class="popular-playlists">
        <div class="plugin-tabs">
            <TabMenu :model="tabMenuItems" :activeIndex="activePluginIndex" @tab-change="onTabChange" />
        </div>
        <div class="recommend-tags">
            <div class="tag-container">
                <Chip v-for="tag in recommendTags" :key="tag.id" :label="tag.title" @click="selectTag(tag)"
                    :class="{ 'selected': selectedTag?.id === tag.id }" />
            </div>
        </div>

        <div class="recommend-sheets" ref="recommendSheetsRef" @scroll="handleScroll">
            <DataView :value="recommendSheets" :layout="'grid'" :rows="10">
                <template #grid="slotProps">
                    <div class="playlist-grid">
                        <div v-for="(item, index) in slotProps.items" :key="index" class="playlist-item" @click="goToMusicListDetail(item)">
                            <div class="playlist-image">
                                <div class="image-container">
                                    <img :src="item.artwork" :alt="item.title" />
                                </div>
                            </div>
                            <div class="playlist-info">
                                <div class="playlist-title">{{ item.title || 'Untitled' }}</div>
                                <div class="playlist-subtitle">{{ item.artist || item.description || 'No description' }}
                                </div>
                                <div class="playlist-plays" v-if="item.playCount !== undefined">
                                    <i class="pi pi-play"></i> {{ formatPlayCount(item.playCount) }}
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
                <template #empty>
                    <LoadingOrEmpty :loading="isLoading" />
                </template>
            </DataView>
            <div v-if="recommendSheets.length > 0">
               <BottomLoadingState :state="bottomLoadingState" :onLoadMore="loadMore" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import TabMenu from 'primevue/tabmenu';
import Chip from 'primevue/chip';
import DataView from 'primevue/dataview';
import { usePluginStore } from '@/store/pluginStore.ts';
import { storeToRefs } from 'pinia';
import BottomLoadingState from '@/components/BottomLoadingState.vue';
import { MusicSheetType, RequestStateCode } from '@/common/constant';
import router from '@/router';

const pluginStore = usePluginStore();
const { plugins } = storeToRefs(pluginStore);

const activePluginIndex = ref(0);
const recommendTags = ref<IMusic.IMusicSheetItem[]>([]);
const selectedTag = ref<IMusic.IMusicSheetItem | null>(null);
const recommendSheets = ref<IMusic.IMusicSheetItem[]>([]);
const recommendSheetsRef = ref<HTMLElement | null>(null);
const isLoading = ref(false);
const hasMore = ref(true);
const page = ref(1);

const bottomLoadingState = ref(RequestStateCode.PENDING_REST_PAGE);

const supportPlugins = computed(() => plugins.value.filter(plugin => plugin.getRecommendSheetTags && plugin.getRecommendSheetsByTag));

const activePlugin = computed(() => supportPlugins.value[activePluginIndex.value]);

// Create a computed property for the TabMenu items
const tabMenuItems = computed(() => {
    return supportPlugins.value.map(plugin => ({
        label: plugin.platform,
        icon: 'pi pi-fw pi-music'
    }));
});

watch(supportPlugins, async (newVal, oldVal) => {
    if (newVal.length > 0 && oldVal) {
        activePluginIndex.value = 0;
        if (activePlugin.value) {
            pluginStore.setCurrentPluginId(activePlugin.value.id!!);
            await loadRecommendTags();
            await loadRecommendSheets();
        }
    }
});

onMounted(async () => {
    if (activePlugin.value) {
        await loadRecommendTags();
        await loadRecommendSheets();
    }
});

const onTabChange = async (event: { index: number }) => {
    activePluginIndex.value = event.index;
    pluginStore.setCurrentPluginId(activePlugin.value.id!!);
    await loadRecommendTags();
    await loadRecommendSheets();
};

const loadRecommendTags = async () => {
    if (activePlugin.value?.getRecommendSheetTags) {
        try {
            const result = await activePlugin.value.getRecommendSheetTags();
            recommendTags.value = result.pinned || [];
            if (recommendTags.value.length > 0) {
                selectedTag.value = recommendTags.value[0];
            }
            console.log('recommendTags', recommendTags.value);
        } catch (error) {
            console.error(error);
        }
    }
};

const loadRecommendSheets = async (page: number = 1) => {
    if (activePlugin.value?.getRecommendSheetsByTag && selectedTag.value) {
        isLoading.value = true;
        bottomLoadingState.value = RequestStateCode.PENDING_REST_PAGE;
        if (page === 1) {
            recommendSheets.value = [];
        }
        try {
            const result = await activePlugin.value.getRecommendSheetsByTag(selectedTag.value, page);
            recommendSheets.value = [...recommendSheets.value, ...result.data || []];
            hasMore.value = !!!result.isEnd;
            isLoading.value = false;
            bottomLoadingState.value = hasMore.value ? RequestStateCode.PARTLY_DONE : RequestStateCode.FINISHED;
        } catch (error) {
            isLoading.value = false;
            bottomLoadingState.value = RequestStateCode.PARTLY_DONE;
            console.error(error);
        }
    }
};

const selectTag = async (tag: IMusic.IMusicSheetItem) => {
    selectedTag.value = tag;
    page.value = 1;
    await loadRecommendSheets();
};

const formatPlayCount = (count: number) => {
    if (count >= 10000) {
        return (count / 10000).toFixed(1) + '万';
    }
    return count.toString();
};

const handleScroll = () => {
    if (!recommendSheetsRef.value) return;

    const { scrollTop, scrollHeight, clientHeight } = recommendSheetsRef.value;
    if (scrollTop + clientHeight >= scrollHeight - 50 && !isLoading.value && hasMore.value) {
        loadMore();
    }
};

const loadMore = async () => {
    if (isLoading.value || !hasMore.value) return;

    page.value++;
    await loadRecommendSheets(page.value);
};

const goToMusicListDetail = (item: IMusic.IMusicSheetItem) => {
    console.log('item', item);
    router.push({
        name: 'music-list-detail',
        params: { item: JSON.stringify(item) },
        query: {
            type: MusicSheetType.Cloud
        }
    });
};
</script>

<style scoped>
.popular-playlists {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 0 20px;
    /* Add padding to the edges */
}

.plugin-tabs {
    margin-bottom: 1rem;
}

.recommend-tags {
    margin-bottom: 1rem;
    overflow: visible;
    /* Ensure no horizontal scrollbar appears */
}

.tag-container {
    display: flex;
    flex-wrap: wrap;
    /* Allow tags to wrap to multiple lines */
    gap: 0.5rem;
}

.recommend-sheets {
    flex-grow: 1;
    overflow-y: auto;
    padding-right: 20px;
    /* Add padding to the right */
    margin-right: -20px;
    /* Negative margin to compensate for padding */
}

.playlist-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1rem;
}

.playlist-item {
    display: flex;
    flex-direction: column;
    background-color: #fff;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    cursor: pointer;
}

.playlist-image {
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

.playlist-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
}

.playlist-info {
    padding: 0.5rem;
}

.playlist-title {
    font-size: 0.9rem;
    font-weight: bold;
    margin-bottom: 0.25rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.playlist-subtitle {
    font-size: 0.8rem;
    color: #666;
    margin-bottom: 0.25rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.playlist-plays {
    font-size: 0.8rem;
    color: #999;
}

.playlist-plays i {
    margin-right: 0.25rem;
}

:deep(.p-chip) {
    cursor: pointer;
}

:deep(.p-chip.selected) {
    background-color: #007bff;
    color: #fff;
}

</style>