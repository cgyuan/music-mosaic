import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { useMusicSourcePlugin } from '@/hooks/useMusicSourcePlugin';

interface StoredPlugin {
    id: string;
    code: string;
    platform: string;
    version?: string;
    supportedSearchType?: IMedia.SupportMediaType[];
    srcUrl?: string;
    author?: string;
}

export const usePluginStore = defineStore('plugin', () => {
    const storedPlugins = ref<StoredPlugin[]>([]);
    const plugins = ref<IPlugin.IPluginInstance[]>([]);
    const currentPluginId = ref<string | null>(null);
    const activePluginIndex = ref<number>(0);
    const { parsePlugin } = useMusicSourcePlugin();

    function loadPlugins() {
        plugins.value = storedPlugins.value.map(p => {
            const plugin = parsePlugin(p.code)
            plugin.id = p.id
            return plugin
        })
    }
    
    function addPlugin(plugin: IPlugin.IPluginInstance, code: string) {
        // 检查是否已存在, 根据platform检查
        if (plugins.value.find(p => p.platform === plugin.platform)) {
            // 替换保持顺序不变
            const index = plugins.value.findIndex(p => p.platform === plugin.platform);
            plugins.value[index] = plugin;
            
            // 同时更新 storedPlugins
            const storedIndex = storedPlugins.value.findIndex(p => p.platform === plugin.platform);
            storedPlugins.value[storedIndex] = {
                id: plugin.id!!,
                code,
                platform: plugin.platform,
                version: plugin.version,
                supportedSearchType: plugin.supportedSearchType,
                srcUrl: plugin.srcUrl,
                author: plugin.author
            };
        } else {
            plugins.value.push(plugin);
            storedPlugins.value.push({
                id: plugin.id!!,
                code,
                platform: plugin.platform,
                version: plugin.version,
                supportedSearchType: plugin.supportedSearchType,
                srcUrl: plugin.srcUrl,
                author: plugin.author
            });
        }
    }

    function removePlugin(id: string) {
        const index = plugins.value.findIndex(p => p.id === id);
        if (index !== -1) {
            plugins.value.splice(index, 1);
        }
        storedPlugins.value = storedPlugins.value.filter(p => p.id !== id);
    }

    function updatePlugin(id: string, updatedPlugin: IPlugin.IPluginInstance) {
        const index = plugins.value.findIndex(p => p.id === id);
        if (index !== -1) {
            plugins.value[index] = updatedPlugin;
        }
    }

    function getPlugin(id: string) {
        return plugins.value.find(p => p.id === id);
    }

    function setCurrentPluginId(id: string) {
        currentPluginId.value = id
    }

    function getCurrentPlugin() {
        return plugins.value.find(p => p.id === currentPluginId.value);
    }

    function getPluginByPlatform(platform: string) {
        return plugins.value.find(p => p.platform === platform);
    }

    const lyricSupportPlugins = computed(() => {
        return plugins.value.filter(p => p.getLyric)
    });

    function movePluginUp(plugin: IPlugin.IPluginInstance) {
        const index = plugins.value.findIndex(p => p.id === plugin.id);
        if (index > 0) {
            [plugins.value[index], plugins.value[index - 1]] = [plugins.value[index - 1], plugins.value[index]];
        }
        // 同时更新 storedPlugins
        const storedIndex = storedPlugins.value.findIndex(p => p.id === plugin.id);
        if (storedIndex > 0) {
            [storedPlugins.value[storedIndex], storedPlugins.value[storedIndex - 1]] = [storedPlugins.value[storedIndex - 1], storedPlugins.value[storedIndex]];
        }
    }

    function movePluginDown(plugin: IPlugin.IPluginInstance) {
        const index = plugins.value.findIndex(p => p.id === plugin.id);
        if (index < plugins.value.length - 1) {
            [plugins.value[index], plugins.value[index + 1]] = [plugins.value[index + 1], plugins.value[index]];
        }
        // 同时更新 storedPlugins
        const storedIndex = storedPlugins.value.findIndex(p => p.id === plugin.id);
        if (storedIndex < storedPlugins.value.length - 1) {
            [storedPlugins.value[storedIndex], storedPlugins.value[storedIndex + 1]] = [storedPlugins.value[storedIndex + 1], storedPlugins.value[storedIndex]];
        }
    }

    return {
        storedPlugins,
        plugins,
        currentPluginId,
        activePluginIndex,
        lyricSupportPlugins,
        addPlugin,
        removePlugin,
        updatePlugin,
        getPlugin,
        setCurrentPluginId,
        getCurrentPlugin,
        loadPlugins,
        getPluginByPlatform,
        movePluginUp,
        movePluginDown,
    };
}, {
    persistedState: {
        includePaths: ['storedPlugins', 'currentPluginId'],
    }
});
