<template>
    <div class="music-sheet-search">
        <SourceSelector :plugins="supportPlugins" :active-plugin-index="activePluginIndex" :select-source="selectSource" />
        <div class="music-sheet-container">
            <MusicSheetDataView :active-plugin="activePlugin" 
                :is-loading="activePluginState === RequestStateCode.PENDING_FIRST_PAGE"
                :music-sheets="activePluginMusicSheets" />
            <BottomLoadingState :state="activePluginState" @load-more="loadMore" v-if="activePluginMusicSheets.length > 0"/>
        </div>
    </div>
</template>
<script setup lang="ts">
import SourceSelector from './SourceSelector.vue';
import { usePluginStore } from '@/store/pluginStore.ts';
import { storeToRefs } from 'pinia';
import { computed, ref, onMounted, reactive } from 'vue';
import MusicSheetDataView from '@/components/MusicSheetDataView/index.vue';
import BottomLoadingState from '@/components/BottomLoadingState.vue';
import { RequestStateCode } from '@/common/constant';

const props = defineProps<{
    query: string
}>();

const activePluginIndex = ref(0);

const pluginStore = usePluginStore();
const { plugins } = storeToRefs(pluginStore);

// Create a reactive object to store data for each plugin, using platform as key
const pluginData = reactive<{[key: string]: {
  musicSheets: IMusic.IMusicSheetItem[],
  state: RequestStateCode,
  curPage: number
}}>({});

const supportPlugins = computed(() => plugins.value.filter(plugin => plugin.search));

const selectSource = (index: number) => {
    activePluginIndex.value = index;
    const selectedPlugin = supportPlugins.value[index];
    if (selectedPlugin && pluginData[selectedPlugin.platform].musicSheets.length === 0) {
        loadData();
    }
    // Scroll to the top after changing the source
    scrollToTop();
};

// Add this new function to handle scrolling
const scrollToTop = () => {
    const container = document.querySelector('.music-sheet-container');
    if (container) {
        container.scrollTop = 0;
    }
};

const activePlugin = computed(() => supportPlugins.value[activePluginIndex.value]);

// Initialize data for each plugin
onMounted(() => {
    supportPlugins.value.forEach(plugin => {
        if (!pluginData[plugin.platform]) {
            pluginData[plugin.platform] = {
                musicSheets: [],
                state: RequestStateCode.PENDING_REST_PAGE,
                curPage: 1
            };
        }
    });
    loadData();
});

const loadData = async () => {
    if (activePlugin.value) {
        const platform = activePlugin.value.platform;
        pluginData[platform].state = RequestStateCode.PENDING_REST_PAGE;
        console.log("query:", props.query);

        try {
            const res = await activePlugin.value.search!(props.query, pluginData[platform].curPage, "sheet");

            pluginData[platform].state = res.isEnd ? RequestStateCode.FINISHED : RequestStateCode.PARTLY_DONE;
            pluginData[platform].musicSheets = pluginData[platform].musicSheets.concat(res.data.map((item) => {
                item.platform = activePlugin.value.platform;
                return item;
            }));
            console.log("pluginData[platform].musicSheets", pluginData[platform].musicSheets);
        } catch (error) {
            pluginData[platform].state = RequestStateCode.PARTLY_DONE;
        }
    }
}

const loadMore = () => {
    const platform = activePlugin.value.platform;
    if (pluginData[platform].state === RequestStateCode.FINISHED) {
        return
    }
    pluginData[platform].curPage++;
    loadData();
}

// Computed properties for the active plugin's data
const activePluginMusicSheets = computed(() => pluginData[activePlugin.value.platform]?.musicSheets || []);
const activePluginState = computed(() => pluginData[activePlugin.value.platform]?.state || RequestStateCode.PENDING_REST_PAGE);
</script>

<style scoped>
.music-sheet-search {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    overflow: hidden;
}

.music-sheet-container {
    width: 100%;
    flex: 1;
    overflow: auto;
    padding: 0 20px;
}

.music-sheet-container :deep(.music-list-wrapper) {
    flex: 1;
}

.music-sheet-container :deep(.music-list) {
    padding: 0 20px 0;
}
</style>