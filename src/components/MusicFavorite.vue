<template>
    <Button :icon="isFav ? 'pi pi-heart-fill' : 'pi pi-heart'" class="p-button-rounded p-button-text p-button-sm"
        :style="{ color: isFav ? 'red' : 'black' }" @click="handleFavorite" />
</template>

<script setup lang="ts">
import MusicSheet from '@/music-sheet';

interface IMusicFavoriteProps {
  musicItem: IMusic.IMusicItem;
  size: number;
}

const props = defineProps<IMusicFavoriteProps>();

const isFav = MusicSheet.frontend.useMusicIsFavorite(props.musicItem);

const handleFavorite = (ev: MouseEvent) => {
    ev.stopPropagation();
    if (isFav.value) {
        MusicSheet.frontend.removeMusicFromFavorite(props.musicItem);
    } else {
        console.log('add to favorite', props.musicItem);
        MusicSheet.frontend.addMusicToFavorite(props.musicItem);
    }
}

</script>