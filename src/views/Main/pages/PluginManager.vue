<template>
    <div class="plugin-manager">
        <div class="header">
            <h1>插件管理</h1>

            <div class="header-action-buttons">
                <div data-type="normalButton" role="button" @click="selectPluginFile">
                    <span>从本地文件安装</span>
                </div>
                <div data-type="normalButton" role="button">
                    <span>从网络安装插件</span>
                </div>
                <div class="spacer"></div>
                <div data-type="normalButton" role="button">
                    <span>订阅设置</span>
                </div>
                <div data-type="normalButton" role="button">
                    <span>更新订阅</span>
                </div>
            </div>
        </div>

        <CustomDataTable :value="storedPlugins" :columns="columns" keyField="id" :stripedRows="true" showHeader
            class="plugin-table">
            <template #cell:index="{ index }">
                {{ index + 1 }}
            </template>

            <template #cell:author="{ item }">
                {{ item.author || '未知作者' }}
            </template>

            <template #cell:actions="{ item }">
                <div class="table-action-buttons">
                    <div :style="{
                        color: 'var(--dangerColor, #FC5F5F)',
                    }" role="button" @click="showConfirmDialog(item)">
                        <span>卸载</span>
                    </div>
                    <div :style="{
                        color: 'var(--successColor, #08A34C)',
                    }" role="button">
                        <span>更新</span>
                    </div>
                    <div :style="{
                        color: 'var(--infoColor, #0A95C8)',
                    }" v-if="item.supportedSearchType?.includes('sheet')" role="button">
                        <span>导入歌单</span>
                    </div>
                </div>
            </template>
        </CustomDataTable>

        <Dialog class="backdrop-color" header="确认卸载" v-model:visible="confirmDialogVisible" :modal="true" :closable="false">
            <p>确定要卸载插件 {{ pluginToRemove!!.platform }} 吗？</p>
            <template #footer>
                <div data-type="normalButton" role="button" @click="confirmDialogVisible = false">
                    <span>取消</span>
                </div>
                <div data-type="dangerButton" role="button" @click="confirmRemovePlugin">
                    <span>确认</span>
                </div>
            </template>
        </Dialog>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Button from 'primevue/button';
import CustomDataTable from '../../../components/CustomDataTable.vue';
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

const columns = [
    { field: 'index', header: '#', width: '10%' },
    { field: 'platform', header: '来源', width: '25%' },
    { field: 'version', header: '版本号', width: '15%' },
    { field: 'author', header: '作者', width: '20%' },
    { field: 'actions', header: '操作', width: '35%' }
];
</script>

<style scoped>
.plugin-manager {
    padding: 20px 0;
    height: 100%;
    display: flex;
    flex-direction: column;
    color: var(--textColor);
}

.header {
    padding: 0 20px;
}

h1 {
    margin-bottom: 20px;
    font-size: 20px;
    font-weight: bold;
}

.header-action-buttons {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
}

.spacer {
    flex-grow: 1;
}

.plugin-table {
    flex: 1;
    min-height: 0;
    padding: 0 20px;
}

.table-action-buttons {
    display: flex;
    gap: 10px;
}

:deep(.custom-datatable) {
    font-size: 14px;
}

:deep(.p-button-label) {
    font-size: 14px;
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