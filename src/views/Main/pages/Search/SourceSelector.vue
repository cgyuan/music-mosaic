<template>
    <div class="search-sources">
        <Chip v-for="(source, index) in plugins" :key="source.id!" :label="source.platform"
            @click="selectSource(index)" :class="{ 'selected': index === activePluginIndex }" />
    </div>
</template>
<script setup lang="ts">
defineProps<{
    plugins: IPlugin.IPluginInstance[],
    activePluginIndex: number,
    selectSource: (index: number) => void
}>();


</script>

<style scoped>
.search-sources {
    flex-shrink: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 20px;
    padding: 0 20px;
}

:deep(.p-chip) {
    cursor: pointer;
}

:deep(.p-chip.selected) {
    background-color: var(--primaryColor);
    color: #fff;
}
</style>