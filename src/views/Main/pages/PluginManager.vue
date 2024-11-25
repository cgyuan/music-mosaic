<template>
    <div class="plugin-manager">
        <div class="header">
            <h1>插件管理</h1>

            <div class="header-action-buttons">
                <div data-type="normalButton" role="button" @click="selectPluginFile">
                    <span>从本地文件安装</span>
                </div>
                <div data-type="normalButton" role="button" @click="showInstallPluginOnlineDialog">
                    <span>从网络安装插件</span>
                </div>
                <div class="spacer"></div>
                <div data-type="normalButton" role="button" :style="{
                    display: 'none',
                }">
                    <span>订阅设置</span>
                </div>
                <div data-type="normalButton" role="button" :style="{
                    display: 'none',
                }">
                    <span>更新订阅</span>
                </div>
            </div>
        </div>

        <CustomDataTable :value="plugins" :columns="columns" keyField="id" :stripedRows="true" showHeader
            class="plugin-table">
            <template #cell:index="{ index }">
                {{ index + 1 }}
            </template>

            <template #cell:author="{ item }">
                {{ item.author || '未知作者' }}
            </template>

            <template #cell:actions="{ item, index }">
                <div class="table-action-buttons">
                    <div :style="{
                        color: 'var(--dangerColor, #FC5F5F)',
                    }" role="button" @click="showConfirmDialog(item)">
                        <span>卸载</span>
                    </div>
                    <div :style="{
                        color: 'var(--successColor, #08A34C)',
                    }" role="button" @click="updatePlugin(item)">
                        <span>更新</span>
                    </div>
                    <div :style="{
                        color: 'var(--infoColor, #0A95C8)',
                    }" v-if="item.supportedSearchType?.includes('sheet')" role="button" @click="importMusicSheet(item)">
                        <span>导入歌单</span>
                    </div>
                    <div :style="{
                        color: 'var(--primaryColor)',
                    }" role="button" v-if="index < plugins.length - 1" @click="movePluginDown(item)">
                        <i class="pi pi-arrow-down"></i>
                    </div>
                    <div :style="{
                        color: 'var(--primaryColor)',
                    }" role="button" v-if="index > 0" @click="movePluginUp(item)">
                        <i class="pi pi-arrow-up"></i>
                    </div>
                </div>
            </template>
        </CustomDataTable>

        <Dialog :draggable="false" class="backdrop-color" header="确认卸载" v-model:visible="confirmDialogVisible"
            :modal="true" :closable="false">
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
        <Dialog :visible="installPluginOnlineDialogVisible" :draggable="false" modal
            @update:visible="hideInstallPluginOnlineDialog" header="从网络安装插件" :style="{ width: '400px' }">
            <Loading v-if="loading" />
            <div v-else>
                <div class="p-fluid">
                    <div class="p-field">
                        <InputText id="plugin-url" v-model="pluginUrl" placeholder="请输入插件的URL" autofocus />
                    </div>
                </div>
                <div class="button-container">
                    <div data-type="primaryButton" role="button" @click="installPluginOnline(false)"
                        :data-disabled="!pluginUrl.trim()">
                        <span :style="{
                            fontSize: '16px',
                        }">安装</span>
                    </div>
                </div>
            </div>
        </Dialog>
        <ImportMusicSheetModal 
            v-model:visible="importMusicSheetDialogVisible"
            :plugin="selectedPlugin ?? undefined"
        />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import CustomDataTable from '../../../components/CustomDataTable.vue';
import Dialog from 'primevue/dialog';
import { selectAndReadFile, FileSelectResult } from '../../../utils/fileUtils';
import { useMusicSourcePlugin } from '../../../hooks/useMusicSourcePlugin';
import { invoke } from '@tauri-apps/api/tauri';
import { usePluginStore } from '../../../store/pluginStore';
import { storeToRefs } from 'pinia';
import Loading from '@/components/Loading.vue';
import { useToast } from "primevue/usetoast";
import ImportMusicSheetModal from '../../../components/ImportMusicSheetModal.vue';

const pluginStore = usePluginStore();
const { plugins } = storeToRefs(pluginStore);
const toast = useToast();
pluginStore.$persistedState.isReady().then(() => {
    console.log('pluginStore is ready');
});

const { parsePlugin } = useMusicSourcePlugin()

const confirmDialogVisible = ref(false);
const pluginToRemove = ref<IPlugin.IPluginInstance | null>(null);

const pluginUrl = ref('');
const installPluginOnlineDialogVisible = ref(false);
const loading = ref(false);

const willUpdatePlugin = ref<IPlugin.IPluginInstance | null>(null);

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

const showInstallPluginOnlineDialog = () => {
    installPluginOnlineDialogVisible.value = true;
};

const installPluginOnline = async (update = false) => {
    loading.value = true;
    try {
        const response = await invoke('http_request', {
            method: 'GET',
            url: pluginUrl.value,
            headers: {}
        });
        const fileName = pluginUrl.value.split('/').pop();
        if (response) {
            processFileContent(response as string, fileName!);
        }
        if (update) {
            toast.add({
                severity: 'success',
                summary: '成功',
                detail: `插件 ${willUpdatePlugin.value?.platform} 已更新到最新版本`,
                life: 3000
            });
        } else {
            toast.add({
                severity: 'success',
                summary: '成功',
                detail: '插件安装成功',
                life: 3000
            });
        }
    } catch (error) {
        console.error('Error in installPluginOnline:', error);
        if (update) {
            toast.add({
                severity: 'error',
                summary: '失败',
                detail: `插件 ${willUpdatePlugin.value?.platform} 更新失败`,
                life: 3000
            });
        } else {
            toast.add({
                severity: 'error',
                summary: '失败',
                detail: '插件安装失败',
                life: 3000
            });
        }
    } finally {
        hideInstallPluginOnlineDialog();
        loading.value = false;
    }
};

const updatePlugin = (plugin: IPlugin.IPluginInstance) => {
    willUpdatePlugin.value = plugin;
    if (plugin.srcUrl) {
        pluginUrl.value = plugin.srcUrl;
        installPluginOnline(true);
    }
};

const hideInstallPluginOnlineDialog = () => {
    installPluginOnlineDialogVisible.value = false;
    pluginUrl.value = '';
};

const movePluginUp = (plugin: IPlugin.IPluginInstance) => {
    pluginStore.movePluginUp(plugin);
};

const movePluginDown = (plugin: IPlugin.IPluginInstance) => {
    pluginStore.movePluginDown(plugin);
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

const importMusicSheetDialogVisible = ref(false);
const selectedPlugin = ref<IPlugin.IPluginInstance | null>(null);

const importMusicSheet = (plugin: IPlugin.IPluginInstance) => {
    selectedPlugin.value = plugin;
    importMusicSheetDialogVisible.value = true;
};
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

</style>