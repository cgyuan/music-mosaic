<template>
    <DataView :value="musicSheets" :layout="'grid'" :rows="10">
        <template #grid="slotProps">
            <div class="music-sheet-grid">
                <MusicSheetCard
                    v-for="(item, index) in slotProps.items"
                    :key="index"
                    :item="item"
                    :activePlugin="activePlugin"
                />
            </div>
        </template>
        <template #empty>
            <LoadingOrEmpty :loading="isLoading" />
        </template>
    </DataView>
</template>

<script setup lang="ts">
import DataView from 'primevue/dataview';
import MusicSheetCard from './MusicSheetCard.vue';

defineProps<{
    musicSheets: IMusic.IMusicSheetItem[],
    activePlugin: IPlugin.IPluginInstance,
    isLoading: boolean
}>();
</script>

<style scoped>
.music-sheet-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
}
</style>