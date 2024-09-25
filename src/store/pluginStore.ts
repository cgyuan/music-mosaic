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

    return {
        storedPlugins,
        plugins,
        addPlugin,
        removePlugin,
        updatePlugin,
        getPlugin,
    };
}, {
    persistedState: {
        includePaths: ['storedPlugins'],
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
