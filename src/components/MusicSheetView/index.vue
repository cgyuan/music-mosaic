<template>
    <MusicList ref="musicListRef" :platform="platform" :musicList="musicSheetItem.musicList || []" :state="state"
        :musicSheetType="musicSheetType">
        <template #header>
            <Header :musicSheet="musicSheetItem" :musicSheetType="musicSheetType" @playAll="musicListRef?.playAll"
                @addAll="musicListRef?.handleAddAll" :platform="platform" />
        </template>
    </MusicList>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { MusicSheetType, RequestStateCode } from '@/common/constant';
import Header from './Header.vue';
import MusicList from '../MusicList.vue';

defineProps<{
    platform?: string;
    musicSheetItem: IMusic.IMusicSheetItem;
    state: RequestStateCode;
    musicSheetType: MusicSheetType;
}>();

const musicListRef = ref<InstanceType<typeof MusicList>>()

</script>

<style scoped>

</style>