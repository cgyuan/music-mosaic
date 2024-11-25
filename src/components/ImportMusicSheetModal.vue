<template>
    <Dialog 
        :visible="visible" 
        :draggable="false"
        @update:visible="updateVisible" 
        modal 
        header="导入歌单" 
        :style="{ width: '400px' }"
    >
        <Loading v-if="loading" />
        <div v-else>
            <div class="p-fluid">
                <div class="p-field">
                    <InputText 
                        id="sheet-url" 
                        v-model="sheetUrl" 
                        placeholder="请输入歌单链接"
                        autofocus 
                    />
                </div>
            </div>
            <div class="button-container">
                <div 
                    data-type="primaryButton" 
                    role="button" 
                    @click="submitImport"
                    :data-disabled="!sheetUrl.trim()"
                >
                    <span :style="{
                        fontSize: '16px',
                    }">导入</span>
                </div>
            </div>
            <div class="divider"></div>
            <div class="hints-container">
                <template v-if="plugin?.hints?.importMusicSheet">
                    <div 
                        v-for="(hint, index) in plugin.hints.importMusicSheet" 
                        :key="index"
                        class="hint-item"
                    >
                        {{ hint }}
                    </div>
                </template>
            </div>
        </div>
    </Dialog>

    <MusicSheetSelectionDialog
        :model-value="showMusicSheetSelection"
        :music-list="importedMusicList"
        @update:model-value="showMusicSheetSelection = $event"
        @complete="handleImportComplete"
    />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Loading from '@/components/Loading.vue';
import { useToast } from "primevue/usetoast";
import MusicSheetSelectionDialog from './MusicSheetSelectionDialog.vue';

const props = defineProps<{
    visible: boolean,
    plugin?: IPlugin.IPluginInstance
}>();

const emit = defineEmits<{
    (e: 'update:visible', value: boolean): void
}>();

const toast = useToast();
const sheetUrl = ref('');
const loading = ref(false);
const showMusicSheetSelection = ref(false);
const importedMusicList = ref<IMusic.IMusicItem[]>([]);

const updateVisible = (value: boolean) => {
    emit('update:visible', value);
};

const submitImport = async () => {
    if (!sheetUrl.value.trim() || !props.plugin?.importMusicSheet) return;
    
    loading.value = true;
    try {
        const result = await props.plugin.importMusicSheet(sheetUrl.value.trim());
        if (!result || result.length === 0) {
            toast.add({
                severity: 'warn',
                summary: '提示',
                detail: '未找到可导入的歌曲',
                life: 3000
            });
            return;
        }
        importedMusicList.value = result;
        importedMusicList.value.map((item) => {
            item.platform = props.plugin?.platform || '';
            return item;
        });
        updateVisible(false);
        showMusicSheetSelection.value = true;
        
    } catch (error) {
        console.error('Error importing music sheet:', error);
        toast.add({
            severity: 'error',
            summary: '失败',
            detail: '歌单导入失败',
            life: 3000
        });
    } finally {
        loading.value = false;
    }
};

const handleImportComplete = () => {
    toast.add({
        severity: 'success',
        summary: '成功',
        detail: '歌单导入成功',
        life: 3000
    });
    sheetUrl.value = '';
    importedMusicList.value = [];
};
</script>

<style scoped>
.p-dialog {
    border-radius: 8px;
}

.p-field {
    margin-bottom: 1rem;
}

.button-container {
    display: flex;
    justify-content: center;
    margin-top: 1rem;
}

:deep(.p-inputtext) {
    width: 100%;
    padding: 0.75rem;
    font-size: 1rem;
    border-radius: 4px;
}

:deep(.p-button) {
    padding: 0.75rem 2rem;
    font-size: 1rem;
}

.divider {
    margin: 1.5rem 0;
    height: 1px;
    background-color: var(--dividerColor);
}

.hints-container {
    margin: 1rem 0;
    font-size: 0.9rem;
    color: var(--textSecondaryColor);
}

.hint-item {
    margin-bottom: 0.5rem;
    line-height: 1.4;
    position: relative;
    padding-left: 1rem;
}

.hint-item::before {
    content: "•";
    position: absolute;
    left: 0;
    color: var(--textSecondaryColor);
}

.hint-item:last-child {
    margin-bottom: 0;
}
</style> 