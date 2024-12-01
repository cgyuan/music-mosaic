<template>
    <div role="button" :style="{ width: size + 'px', height: size + 'px' }" @click="downloadMusic">
        <SvgAsset :iconName="iconName" :size="size" />
    </div>
</template>

<script setup lang="ts">
import { DownloadState, localPluginName } from '@/common/constant';
import SvgAsset from '@/components/SvgAsset';
import Downloader from '@/downloader';
import { computed } from 'vue';
interface IMusicDownloadedProps {
    musicItem: IMusic.IMusicItem;
    size?: number;
}

const props = defineProps<IMusicDownloadedProps>();


const downloadState = Downloader.useDownloadState(props.musicItem);

const isDownloadedOrLocal = computed(() => {
    return downloadState.value === DownloadState.DONE || props.musicItem?.platform === localPluginName;
});
const iconName = computed(() => {
    if (isDownloadedOrLocal.value) {
        return "check-circle";
    } else if (downloadState.value !== DownloadState.NONE && downloadState.value !== DownloadState.ERROR) {
        return "rolling-1s";
    }
    return "array-download-tray";
});

const downloadMusic = () => {
    Downloader.startDownload([props.musicItem]);
};
</script>

<style scoped>
:deep(svg) {
    background: transparent !important;
}
</style>