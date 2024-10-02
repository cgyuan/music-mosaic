<template>
    <MusicSheetView :musicSheetItem="musicSheetItem" :platform="currentPlugin?.platform" :state="state" :musicSheetType="musicSheetType" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { usePluginStore } from '@/store/pluginStore.ts';
import MusicSheetView from '@/components/MusicSheetView/index.vue';
import { MusicSheetType, RequestStateCode } from '@/common/constant';

const pluginStore = usePluginStore();
const currentPlugin = computed(() => pluginStore.getCurrentPlugin());

const state = ref(RequestStateCode.PENDING_FIRST_PAGE);

const route = useRoute();

let itemString = route.params.item as string;
const musicSheetType = route.query.type as MusicSheetType;
if (itemString) {
    localStorage.setItem('music-list-item', itemString);
} else {
    itemString = localStorage.getItem('music-list-item') || '';
}
const musicSheetItem = ref(JSON.parse(itemString) as IMusic.IMusicSheetItem);


onMounted(() => {
    if (itemString) {
        getMusicListDetail(1);
    }
});

watch(() => currentPlugin.value, () => {
    if (musicSheetItem) {
        getMusicListDetail(1);
    }
});

const getMusicListDetail = async (page: number) => {
    if (currentPlugin.value && currentPlugin.value.getTopListDetail) {
        try {
            state.value = RequestStateCode.PENDING_FIRST_PAGE;
            
            const res = await currentPlugin.value.getTopListDetail(musicSheetItem.value, page);
            if (res.musicList) {
                res.musicList= res.musicList.map(item => {
                    item.platform = currentPlugin.value?.platform || '';
                    return item;
                });
            }
            musicSheetItem.value = res as IMusic.IMusicSheetItem;
            console.log('musicSheetItem', musicSheetItem.value, res)
        } catch (error) {
            console.error('Error fetching music list detail:', error);
        } finally {
            state.value = RequestStateCode.FINISHED;
        }
    }
};

</script>
