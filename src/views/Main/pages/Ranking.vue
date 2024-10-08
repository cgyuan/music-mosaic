<template>
    <div class="ranking">
        <Tabs v-model:value="activePluginIndex" scrollable>
            <TabList>
                <Tab v-for="(tab, index) in tabMenuItems" :key="tab.id!" :value="index">
                    {{ tab.label }}
                </Tab>
            </TabList>
        </Tabs>
        <div class="ranking-lists" ref="rankingListsRef">
            <div v-for="(group, groupIndex) in rankingLists" :key="groupIndex" class="ranking-group">
                <h2 class="group-title">{{ group.title }}</h2>
                <AlbumDataView :active-plugin="activePlugin" :albums="group.data" />
            </div>
            <Loading v-if="isLoading" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { usePluginStore } from '@/store/pluginStore.ts';
import { storeToRefs } from 'pinia';
import AlbumDataView from '@/components/AlbumDataView/index.vue'
import Loading from '@/components/Loading.vue';


const pluginStore = usePluginStore();
const { plugins, activePluginIndex } = storeToRefs(pluginStore);

const rankingLists = ref<IMusic.IMusicSheetGroupItem[]>([]);
const rankingListsRef = ref<HTMLElement | null>(null);
const isLoading = ref(false);

const supportPlugins = computed(() => plugins.value.filter(plugin => plugin.getTopLists));

const activePlugin = computed(() => supportPlugins.value[activePluginIndex.value]);

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

const onTabChange = () => {
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

</script>

<style scoped>
.ranking {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    box-sizing: border-box;
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


</style>