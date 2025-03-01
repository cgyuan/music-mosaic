<template>
    <div class="music-search">
        <SourceSelector :plugins="supportPlugins" :active-plugin-index="activePluginIndex" :select-source="selectSource" />
        <div class="music-list-container">
            <MusicList ref="musicListRef" :platform="activePlugin.platform" :music-list="activePluginMusicList">
                <template #footer>
                    <BottomLoadingState :state="activePluginState" @load-more="loadMore" />
                </template>
            </MusicList>
        </div>
    </div>
</template>
<script setup lang="ts">
import SourceSelector from './SourceSelector.vue';
import { usePluginStore } from '@/store/pluginStore.ts';
import { storeToRefs } from 'pinia';
import { computed, ref, onMounted, reactive } from 'vue';
import MusicList from '@/components/MusicList.vue';
import BottomLoadingState from '@/components/BottomLoadingState.vue';
import { RequestStateCode } from '@/common/constant';

const props = defineProps<{
    query: string
}>();

const musicListRef = ref<InstanceType<typeof MusicList> | null>(null);
const activePluginIndex = ref(0);

const pluginStore = usePluginStore();
const { plugins } = storeToRefs(pluginStore);

// Create a reactive object to store data for each plugin, using platform as key
const pluginData = reactive<{[key: string]: {
  musicList: IMusic.IMusicItem[],
  state: RequestStateCode,
  curPage: number
}}>({});

const supportPlugins = computed(() => plugins.value.filter(plugin => plugin.search));

const selectSource = (index: number) => {
    activePluginIndex.value = index;
    const selectedPlugin = supportPlugins.value[index];
    if (selectedPlugin && pluginData[selectedPlugin.platform].musicList.length === 0) {
        loadMusics();
    }
    musicListRef.value?.resetScroll();
};

const activePlugin = computed(() => supportPlugins.value[activePluginIndex.value]);

// Initialize data for each plugin
onMounted(() => {
    supportPlugins.value.forEach(plugin => {
        if (!pluginData[plugin.platform]) {
            pluginData[plugin.platform] = {
                musicList: [],
                state: RequestStateCode.PENDING_REST_PAGE,
                curPage: 1
            };
        }
    });
    loadMusics();
});

const loadMusics = async () => {
    if (activePlugin.value) {
        const platform = activePlugin.value.platform;
        pluginData[platform].state = RequestStateCode.PENDING_REST_PAGE;
        console.log("query:", props.query);

        try {
            const res = await activePlugin.value.search!(props.query, pluginData[platform].curPage, "music");

            pluginData[platform].state = res.isEnd ? RequestStateCode.FINISHED : RequestStateCode.PARTLY_DONE;
            pluginData[platform].musicList = pluginData[platform].musicList.concat(res.data.map((item) => {
                item.platform = activePlugin.value.platform;
                return item;
            }));
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
    loadMusics();
}

// Computed properties for the active plugin's data
const activePluginMusicList = computed(() => pluginData[activePlugin.value.platform]?.musicList || []);
const activePluginState = computed(() => pluginData[activePlugin.value.platform]?.state || RequestStateCode.PENDING_REST_PAGE);
</script>

<style scoped>
.music-search {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
}

.music-list-container {
    flex: 1;
    overflow: auto;
}

.music-list-container :deep(.music-list-wrapper) {
    flex: 1;
}

.music-list-container :deep(.music-list) {
    padding: 0 20px 0;
}
</style>