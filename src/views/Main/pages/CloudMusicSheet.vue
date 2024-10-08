<template>
    <MusicSheetView :musicSheetItem="musicSheetItem" :platform="currentPlugin?.platform" :state="state"
        :musicSheetType="musicSheetType" />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { usePluginStore } from '@/store/pluginStore.ts';
import MusicSheetView from '@/components/MusicSheetView/index.vue';
import { MusicSheetType, RequestStateCode } from '@/common/constant';

const props = defineProps<{
    id?: string;
    itemData?: string;
}>();

const pluginStore = usePluginStore();

const state = ref(RequestStateCode.PENDING_FIRST_PAGE);

const route = useRoute();

const musicSheetType = route.query.type as MusicSheetType;

const musicSheetItem = ref(JSON.parse(props.itemData as string) as IMusic.IMusicSheetItem);

const currentPlugin = pluginStore.getPluginByPlatform(musicSheetItem.value.platform);

onMounted(() => {
    getMusicListDetail(1);
});

const getMusicListDetail = async (page: number) => {
    if (musicSheetType === MusicSheetType.Ranking) {
        if (currentPlugin && currentPlugin.getTopListDetail) {
            try {
                state.value = RequestStateCode.PENDING_FIRST_PAGE;

                const res = await currentPlugin.getTopListDetail(musicSheetItem.value, page);
                if (res.musicList) {
                    res.musicList = res.musicList.map(item => {
                        item.platform = currentPlugin?.platform || '';
                        return item;
                    });
                }
                musicSheetItem.value = {
                    ...musicSheetItem.value,
                    ...res,
                };
                console.log('musicSheetItem', musicSheetItem.value, res)
            } catch (error) {
                console.error('Error fetching music list detail:', error);
            } finally {
                state.value = RequestStateCode.FINISHED;
            }
        }
    } else if (musicSheetType === MusicSheetType.Album) {
        if (currentPlugin && currentPlugin.getAlbumInfo) {
            try {
                state.value = RequestStateCode.PENDING_FIRST_PAGE;
                const res = await currentPlugin.getAlbumInfo(musicSheetItem.value as unknown as IAlbum.IAlbumItem, page);
                if (res && res.musicList) {
                    res.musicList = res.musicList.map(item => {
                        item.platform = currentPlugin?.platform || '';
                        return item;
                    });
                }
                musicSheetItem.value = {
                    ...musicSheetItem.value,
                    ...res,
                };
                console.log('musicSheetItem', musicSheetItem.value, res);
            } catch (error) {
                console.error('Error fetching album info:', error);
            } finally {
                state.value = RequestStateCode.FINISHED;
            }
        }

    } else if (musicSheetType === MusicSheetType.Cloud) {
        if (currentPlugin && currentPlugin.getMusicSheetInfo) {
            try {
                state.value = RequestStateCode.PENDING_FIRST_PAGE;

                const res = await currentPlugin.getMusicSheetInfo(musicSheetItem.value, page);
                if (res && res.musicList) {
                    res.musicList = res.musicList.map(item => {
                        item.platform = currentPlugin?.platform || '';
                        return item;
                    });
                }
                musicSheetItem.value = {
                    ...musicSheetItem.value,
                    ...res,
                };
                console.log('musicSheetItem', musicSheetItem.value, res)
            } catch (error) {
                console.error('Error fetching music list detail:', error);
            } finally {
                state.value = RequestStateCode.FINISHED;
            }
        }
    }

};

</script>
