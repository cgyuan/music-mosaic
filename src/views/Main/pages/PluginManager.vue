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

        <DataTable :value="plugins" 
                   stripedRows 
                   scrollable 
                   scrollHeight="flex" 
                   class="plugin-table">
            <Column field="index" header="#" style="width: 5%;" />
            <Column field="source" header="来源" style="width: 25%;" />
            <Column field="version" header="版本号" style="width: 15%;" />
            <Column field="author" header="作者" style="width: 20%;" />
            <Column header="操作" style="width: 35%;">
                <template #body="slotProps">
                    <Button label="卸载" class="p-button-text p-button-danger" />
                    <Button label="更新" class="p-button-text p-button-success" />
                    <Button v-if="slotProps.data.hasPlaylist" label="导入歌单" class="p-button-text p-button-info" />
                </template>
            </Column>
        </DataTable>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { selectAndReadFile, FileSelectResult } from '../../../utils/fileUtils';
import { useMusicSourcePlugin } from '../../../hooks/useMusicSourcePlugin';
import { invoke } from '@tauri-apps/api/tauri';

const { loadPlugin } = useMusicSourcePlugin()

const plugins = ref([]);

const selectPluginFile = async () => {
    console.log('selectPluginFile function called');
    await invoke('plugin_log', { message: 'selectPluginFile function called' });
    try {
        console.log('About to call selectAndReadFile');
        await invoke('plugin_log', { message: 'About to call selectAndReadFile' });
        const result: FileSelectResult = await selectAndReadFile('.json,.js');
        console.log('File selected:', result.fileName);
        console.log('File content length:', result.content.length);
        await invoke('plugin_log', { message: `File selected: ${result.fileName}, content length: ${result.content.length}` });
        
        if (result.content) {
            await processFileContent(result.content, result.fileName);
        } else {
            console.error('File content is empty');
            await invoke('plugin_log', { message: 'File content is empty' });
        }
    } catch (error) {
        console.error('Error in selectPluginFile:', error);
        await invoke('plugin_log', { message: `Error in selectPluginFile: ${error}` });
    }
};

const processFileContent = async (content: string, fileName: string) => {
    console.log(`Processing file: ${fileName}`);
    await invoke('plugin_log', { message: `Processing file: ${fileName}` });
    
    if (fileName.endsWith('.js')) {
        console.log('JavaScript file detected. Attempting to load plugin...');
        await invoke('plugin_log', { message: 'JavaScript file detected. Attempting to load plugin...' });
        try {
            const plugin = loadPlugin(content);
            console.log('Plugin loaded:', plugin);
            await invoke('plugin_log', { message: 'Plugin loaded' });
            
            if (plugin && typeof plugin.getTopLists === 'function') {
                console.log('Calling getTopLists...');
                await invoke('plugin_log', { message: 'Calling getTopLists...' });
                try {
                    const res = await plugin.getTopLists();
                    console.log('getTopLists result:', res);
                    await invoke('plugin_log', { message: `getTopLists result: ${JSON.stringify(res)}` });
                } catch (error) {
                    console.error('Error calling getTopLists:', error);
                    await invoke('plugin_log', { message: `Error calling getTopLists: ${error}` });
                }
            } else {
                console.warn('Plugin does not have a getTopLists function');
                await invoke('plugin_log', { message: 'Plugin does not have a getTopLists function' });
            }
        } catch (error) {
            console.error('Error loading or executing plugin:', error);
            await invoke('plugin_log', { message: `Error loading or executing plugin: ${error}` });
        }
    } else {
        console.log('Non-JavaScript file detected');
        await invoke('plugin_log', { message: 'Non-JavaScript file detected' });
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