<template>
    <div role="button" :style="{ color: isFav ? 'red' : 'var(--textColor)', width: size + 'px', height: size + 'px' }"
        @click="toggleFavorite" @dblclick.stop>
        <SvgAsset :iconName="isFav ? 'heart' : 'heart-outline'" :size="size" />
    </div>
</template>

<script setup lang="ts">
import SvgAsset from '@/components/SvgAsset';
import MusicSheet from '@/music-sheet';

interface IMusicFavoriteProps {
    musicItem: IMusic.IMusicItem;
    size: number;
}

const props = defineProps<IMusicFavoriteProps>();

const isFav = MusicSheet.frontend.useMusicIsFavorite(props.musicItem);

const toggleFavorite = (e: MouseEvent) => {
    e.stopPropagation();
    if (isFav.value) {
        MusicSheet.frontend.removeMusicFromFavorite(props.musicItem);
    } else {
        MusicSheet.frontend.addMusicToFavorite(JSON.parse(JSON.stringify(props.musicItem)));
    }
};
</script>