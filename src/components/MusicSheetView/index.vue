<template>
    <div class="music-sheet-view">
        <MusicList ref="musicListRef" :platform="platform" :musicList="musicSheetItem.musicList || []" :state="state">
            <template #header>
                <Header :musicSheet="musicSheetItem" :musicSheetType="musicSheetType" @playAll="musicListRef?.playAll"
                    @addAll="musicListRef?.handleAddAll" :platform="platform" />
            </template>
        </MusicList>
    </div>
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
.music-sheet-view {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.music-sheet-view :deep(.music-list-wrapper) {
    flex: 1;
}

.music-sheet-view :deep(.music-list) {
    padding: 20px;
}
</style>