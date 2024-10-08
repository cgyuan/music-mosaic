<template>
    <div class="album-search">
        <SourceSelector :plugins="supportPlugins" :active-plugin-index="activePluginIndex" :select-source="selectSource" />
        <div class="album-container">
            <AlbumDataView 
                :active-plugin="activePlugin"
                :albums="activePluginMusicSheets"
                :media-sheet-type="MusicSheetType.Album" />
            <BottomLoadingState :state="activePluginState" @load-more="loadMore" v-if="activePluginMusicSheets.length > 0"/>
        </div>
    </div>
</template>
<script setup lang="ts">
import SourceSelector from './SourceSelector.vue';
import { usePluginStore } from '@/store/pluginStore.ts';
import { storeToRefs } from 'pinia';
import { computed, ref, onMounted, reactive } from 'vue';
import AlbumDataView from '@/components/AlbumDataView/index.vue';
import BottomLoadingState from '@/components/BottomLoadingState.vue';
import { RequestStateCode, MusicSheetType } from '@/common/constant';

const props = defineProps<{
    query: string
}>();

const activePluginIndex = ref(0);

const pluginStore = usePluginStore();
const { plugins } = storeToRefs(pluginStore);

// Create a reactive object to store data for each plugin, using platform as key
const pluginData = reactive<{[key: string]: {
  albums: IMusic.IMusicSheetItem[],
  state: RequestStateCode,
  curPage: number
}}>({});

const supportPlugins = computed(() => plugins.value.filter(plugin => plugin.search));

const selectSource = (index: number) => {
    activePluginIndex.value = index;
    const selectedPlugin = supportPlugins.value[index];
    if (selectedPlugin && pluginData[selectedPlugin.platform].albums.length === 0) {
        loadData();
    }
    // Scroll to the top after changing the source
    scrollToTop();
};

// Add this new function to handle scrolling
const scrollToTop = () => {
    const container = document.querySelector('.album-container');
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
                albums: [],
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
            const res = await activePlugin.value.search!(props.query, pluginData[platform].curPage, "album");

            pluginData[platform].state = res.isEnd ? RequestStateCode.FINISHED : RequestStateCode.PARTLY_DONE;
            pluginData[platform].albums = pluginData[platform].albums.concat(res.data.map((item) => {
                item.platform = activePlugin.value.platform;
                return item;
            }));
            console.log("pluginData[platform].albums", pluginData[platform].albums);
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
const activePluginMusicSheets = computed(() => pluginData[activePlugin.value.platform]?.albums || []);
const activePluginState = computed(() => pluginData[activePlugin.value.platform]?.state || RequestStateCode.PENDING_REST_PAGE);
</script>

<style scoped>
.album-search {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    overflow: hidden;
}

.album-container {
    width: 100%;
    flex: 1;
    overflow: auto;
    padding: 0 20px;
}
</style>