<template>
    <div class="popular-music-sheet">
        <Tabs class="plugin-tabs" v-model:value="activePluginIndex" scrollable>
            <TabList>
                <Tab v-for="(tab, index) in tabMenuItems" :key="tab.id!" :value="index">
                    {{ tab.label }}
                </Tab>
            </TabList>
        </Tabs>
        <div class="recommend-tags">
            <div class="tag-container">
                <Chip class="first-tag" :class="{ 
                    'selected': isFromPopover,
                    'show-popover': popover?.visible
                 }" :label="defaultTagText" @click="toggle">
                </Chip>
                <Chip v-for="tag in recommendTags" :key="tag.id" :label="tag.title" @click="selectTag(tag)"
                    :class="{ 'selected': selectedTag?.id === tag.id && !isFromPopover }" />
            </div>
        </div>
        <Popover ref="popover">
            <div class="tag-popover-content">
                <div class="tag-popover-scroll">
                    <Chip label="默认" class="default-tag" @click="selectTag({
                        title: '默认',
                        id: '',
                        platform: activePlugin.platform
                    }, true)" :class="{ 'selected': selectedTag?.id === '' }"/>
                    <template v-for="(category, index) in allTags" :key="index">
                        <h3>{{ category.title }}</h3>
                        <div class="tag-grid">
                            <Chip v-for="tag in category.data" :key="tag.id" 
                                :label="tag.title" 
                                @click="selectTag(tag, true)"
                                :class="{ 'selected': selectedTag?.id === tag.id }" />
                        </div>
                    </template>
                </div>
            </div>
        </Popover>
        <div class="recommend-sheets" ref="recommendSheetsRef" @scroll="handleScroll">
            <MusicSheetDataView :musicSheets="recommendSheets" :isLoading="isLoading" :activePlugin="activePlugin"/>
            <div v-if="recommendSheets.length > 0">
               <BottomLoadingState :state="bottomLoadingState" :onLoadMore="loadMore" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import Chip from 'primevue/chip';
import MusicSheetDataView from '@/components/MusicSheetDataView/index.vue'
import { usePluginStore } from '@/store/pluginStore.ts';
import { storeToRefs } from 'pinia';
import BottomLoadingState from '@/components/BottomLoadingState.vue';
import { RequestStateCode } from '@/common/constant';
import Popover from 'primevue/popover';

const pluginStore = usePluginStore();
const { plugins, activePluginIndex } = storeToRefs(pluginStore);

const recommendTags = ref<IMusic.IMusicSheetItem[]>([]);
const allTags = ref<IMusic.IMusicSheetGroupItem[]>([]);
const selectedTag = ref<IMusic.IMusicSheetItem | null>();
const recommendSheets = ref<IMusic.IMusicSheetItem[]>([]);
const recommendSheetsRef = ref<HTMLElement | null>(null);
const isLoading = ref(false);
const hasMore = ref(true);
const page = ref(1);

const defaultTagText = ref('默认');
const isFromPopover = ref(true);

const popover = ref<InstanceType<typeof Popover> | null>(null);

const bottomLoadingState = ref(RequestStateCode.PENDING_REST_PAGE);

const supportPlugins = computed(() => plugins.value.filter(plugin => plugin.getRecommendSheetTags && plugin.getRecommendSheetsByTag));

const activePlugin = computed(() => supportPlugins.value[activePluginIndex.value]);

// Create a computed property for the TabMenu items
const tabMenuItems = computed(() => {
    return supportPlugins.value.map(plugin => ({
        id: plugin.id,
        label: plugin.platform,
        icon: 'pi pi-fw pi-music'
    }));
});

watch(activePluginIndex, () => {
    onTabChange();
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

const toggle = (event: MouseEvent) => {
    popover.value?.toggle(event);
}

onMounted(async () => {
    if (activePlugin.value) {
        await loadRecommendTags();
        await loadRecommendSheets();
    }
});

const onTabChange = async () => {
    isFromPopover.value = true;
    defaultTagText.value = '默认';
    selectedTag.value = {
        title: '默认',
        id: '',
        platform: activePlugin.value.platform
    };
    pluginStore.setCurrentPluginId(activePlugin.value.id!!);
    await loadRecommendTags();
    await loadRecommendSheets();
};

const loadRecommendTags = async () => {
    if (activePlugin.value?.getRecommendSheetTags) {
        try {
            const result = await activePlugin.value.getRecommendSheetTags();
            recommendTags.value = result.pinned || [];
            allTags.value = result.data || [];
            selectedTag.value = {
                title: '默认',
                id: '',
                platform: activePlugin.value.platform
            };
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

const selectTag = async (tag: IMusic.IMusicSheetItem, fromPopover: boolean = false) => {
    if (fromPopover) {
        defaultTagText.value = tag.title;
        popover.value?.hide();
    }
    isFromPopover.value = fromPopover;
    selectedTag.value = tag;
    page.value = 1;
    await loadRecommendSheets();
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
</script>

<style scoped>
.popular-music-sheet {
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

.first-tag::after {
    content: "";
    display: block;
    width: 0;
    height: 0;
    margin-left: 0.2rem;
    border: 4px solid transparent;
    border-left-color: currentColor;
    transform-origin: left center;
    transition: transform linear 100ms;
}

.first-tag.show-popover::after {
    transform: rotate(90deg);
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

.tag-popover-content {
    width: 400px;
    max-height: 400px;
    padding-right: 6px;
}

.tag-popover-scroll {
    max-height: 400px;
    overflow-y: auto;
    padding: 1rem;
    padding-right: calc(1rem - 6px);
    margin-right: -6px;
}

.tag-popover-scroll::-webkit-scrollbar {
    width: 6px;
}

.tag-popover-scroll::-webkit-scrollbar-thumb {
    background-color: #888;
    border-radius: 3px;
}

.tag-popover-scroll::-webkit-scrollbar-track {
    background-color: #f1f1f1;
}

.tag-popover-content h3 {
    margin-top: 1rem;
    margin-bottom: 0.5rem;
    font-size: 1rem;
    color: #333;
}

.tag-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1rem;
}

.default-tag {
    background-color: #f0f0f0;
    color: #333;
}
</style>

<style>
.p-popover:before,
.p-popover:after {
    display: none !important;
}
.p-popover {
    margin-top: 10px !important;
    padding: 0 !important;
}

.p-popover-content {
    padding: 0 !important;
}
</style>