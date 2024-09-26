import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useMusicSourcePlugin } from '../hooks/useMusicSourcePlugin';

interface StoredPlugin {
    id: string;
    code: string;
    platform: string;
    version?: string;
    supportedSearchType?: IMedia.SupportMediaType[];
    srcUrl?: string;
}

export const usePluginStore = defineStore('plugin', () => {
    const storedPlugins = ref<StoredPlugin[]>([]);
    const plugins = ref<IPlugin.IPluginInstance[]>([]);
    const currentPluginId = ref<string | null>(null);

    function addPlugin(plugin: IPlugin.IPluginInstance, code: string) {
        plugins.value.push(plugin);
        storedPlugins.value.push({
            id: plugin.id!!,
            code,
            platform: plugin.platform,
            version: plugin.version,
            supportedSearchType: plugin.supportedSearchType,
            srcUrl: plugin.srcUrl,
        });
        console.log('addPlugin', storedPlugins.value);
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

    return {
        storedPlugins,
        plugins,
        currentPluginId,
        addPlugin,
        removePlugin,
        updatePlugin,
        getPlugin,
        setCurrentPluginId,
        getCurrentPlugin,
    };
}, {
    persistedState: {
        includePaths: ['storedPlugins', 'currentPluginId'],
        beforeHydrate(oldState) {
            const { parsePlugin } = useMusicSourcePlugin()
            console.log('beforeHydrate', oldState.storedPlugins);
            const hydratedPlugins = oldState.storedPlugins.map(p => {
                const plugin = parsePlugin(p.code)
                plugin.id = p.id
                return plugin
            })
            oldState.plugins = hydratedPlugins;
        }
    }
});
