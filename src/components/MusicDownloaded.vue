<template>
    <div role="button" :style="{ width: size + 'px', height: size + 'px' }">
        <SvgAsset iconName="array-download-tray" :size="size" />
    </div>
</template>

<script setup lang="ts">
import SvgAsset from '@/components/SvgAsset';

interface IMusicDownloadedProps {
  musicItem: IMusic.IMusicItem;
  size?: number;
}

defineProps<IMusicDownloadedProps>();
</script>