<template>
    <div class="plugin-manager">
        <h1>插件管理</h1>

        <div class="action-buttons">
            <Button label="从本地文件安装" class="p-button-outlined" @click="selectPluginFile" />
            <Button label="从网络安装插件" class="p-button-outlined" />
            <div class="spacer"></div>
            <Button label="订阅设置" class="p-button-outlined" />
            <Button label="更新订阅" class="p-button-outlined" />
        </div>

        <DataTable :value="storedPlugins" stripedRows scrollable scrollHeight="flex" class="plugin-table">
            <Column header="#" style="width: 5%;">
                <template #body="slotProps">
                    {{ slotProps.index + 1 }}
                </template>
            </Column>
            <Column field="platform" header="来源" style="width: 25%;" />
            <Column field="version" header="版本号" style="width: 15%;" />
            <Column header="作者" style="width: 20%;">
                <template #body="slotProps">
                    {{ slotProps.data.author || '未知作者' }}
                </template>
            </Column>
            <Column header="操作" style="width: 35%;">
                <template #body="slotProps">
                    <Button label="卸载" class="p-button-text p-button-danger" @click="showConfirmDialog(slotProps.data)" />
                    <Button label="更新" class="p-button-text p-button-success" />
                    <Button v-if="slotProps.data.supportedSearchType?.includes('sheet')" label="导入歌单" class="p-button-text p-button-info" />
                </template>
            </Column>
        </DataTable>

        <Dialog header="确认卸载" v-model:visible="confirmDialogVisible" :modal="true" :closable="false">
            <p>确定要卸载插件 {{ pluginToRemove!!.platform }} 吗？</p>
            <template #footer>
                <Button label="取消" class="p-button-outlined" @click="confirmDialogVisible = false" />
                <Button label="确认" class="p-button-danger" @click="confirmRemovePlugin" />
            </template>
        </Dialog>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Dialog from 'primevue/dialog';
import { selectAndReadFile, FileSelectResult } from '../../../utils/fileUtils';
import { useMusicSourcePlugin } from '../../../hooks/useMusicSourcePlugin';
import { invoke } from '@tauri-apps/api/tauri';
import { usePluginStore } from '../../../store/pluginStore';
import { storeToRefs } from 'pinia';

const pluginStore = usePluginStore();
const { storedPlugins } = storeToRefs(pluginStore);

pluginStore.$persistedState.isReady().then(() => {
    console.log('pluginStore is ready');
});

const { parsePlugin } = useMusicSourcePlugin()

const confirmDialogVisible = ref(false);
const pluginToRemove = ref<IPlugin.IPluginInstance | null>(null);

const selectPluginFile = async () => {
    try {
        const result: FileSelectResult = await selectAndReadFile(['js']);
        if (result.content) {
            await processFileContent(result.content, result.fileName);
        } else {
            console.error('File content is empty');
        }
    } catch (error) {
        console.error('Error in selectPluginFile:', error);
    }
};

const processFileContent = async (code: string, fileName: string) => {
    if (fileName.endsWith('.js')) {
        try {
            const plugin = parsePlugin(code);

            if (plugin) {
                console.log(plugin);
                pluginStore.addPlugin(plugin, code);
            }
        } catch (error) {
            console.error('Error loading or executing plugin:', error);
            await invoke('plugin_log', { message: `Error loading or executing plugin: ${error}` });
        }
    }
};

const showConfirmDialog = (plugin: IPlugin.IPluginInstance) => {
    pluginToRemove.value = plugin;
    confirmDialogVisible.value = true;
};

const confirmRemovePlugin = () => {
    if (pluginToRemove.value) {
        pluginStore.removePlugin(pluginToRemove.value.id!!);
        confirmDialogVisible.value = false;
        pluginToRemove.value = null;
    }
};
</script>

<style scoped>
.plugin-manager {
    padding: 20px;
    height: 100%;
    display: flex;
    flex-direction: column;
}

h1 {
    margin-bottom: 20px;
    font-size: 20px;
    font-weight: bold;
}

.action-buttons {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
}

.spacer {
    flex-grow: 1;
}

.plugin-table {
    flex-grow: 1;
    overflow: hidden;
}

:deep(.p-datatable) {
    display: flex;
    flex-direction: column;
    height: 100%;
}

:deep(.p-datatable-wrapper) {
    flex-grow: 1;
    overflow-y: auto;
}

:deep(.p-datatable-table) {
    font-size: 14px;
}

:deep(.p-datatable-thead) {
    position: sticky;
    top: 0;
    z-index: 1;
}

:deep(.p-button-text) {
    padding: 0.5rem;
}

:deep(.p-button-danger) {
    color: #dc3545;
}

:deep(.p-button-success) {
    color: #28a745;
}

:deep(.p-button-info) {
    color: #17a2b8;
}
</style>