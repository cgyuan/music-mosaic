<template>
    <Dialog 
        :visible="modelValue" 
        :draggable="false"
        @update:visible="$emit('update:modelValue', $event)"
        modal 
        header="导入歌单" 
        :style="{ width: '400px' }"
    >
        <div class="plugin-list">
            <div 
                v-for="plugin in availablePlugins" 
                :key="plugin.platform"
                class="plugin-item"
                @click="handlePluginSelect(plugin)"
            >
                {{ plugin.platform }}
            </div>
        </div>
    </Dialog>

    <ImportMusicSheetModal
        v-model:visible="showImportDialog"
        :plugin="selectedPlugin || undefined"
    />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import Dialog from 'primevue/dialog';
import { usePluginStore } from '@/store/pluginStore';
import { storeToRefs } from 'pinia';
import ImportMusicSheetModal from './ImportMusicSheetModal.vue';

const props = defineProps<{
    modelValue: boolean
}>();

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
}>();

const pluginStore = usePluginStore();
const { plugins } = storeToRefs(pluginStore);

const availablePlugins = computed(() => {
    return plugins.value.filter(plugin => plugin.supportedSearchType?.includes('sheet'));
});

const showImportDialog = ref(false);
const selectedPlugin = ref<IPlugin.IPluginInstance | null>(null);

const handlePluginSelect = (plugin: IPlugin.IPluginInstance) => {
    selectedPlugin.value = plugin;
    emit('update:modelValue', false);
    showImportDialog.value = true;
};
</script>

<style scoped>
.plugin-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: 400px;
    overflow-y: auto;
}

.plugin-item {
    padding: 12px 16px;
    border-radius: 4px;
    cursor: pointer;
    color: var(--textColor);
    transition: background-color 0.2s;
}

.plugin-item:hover {
    background-color: var(--listHoverColor);
}
</style> 