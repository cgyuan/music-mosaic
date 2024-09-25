import { defineStore } from 'pinia';
import { ref } from 'vue';

export const usePluginStore = defineStore('plugin', () => {
  const plugins = ref<IPlugin.IPluginInstance[]>([]);

  function addPlugin(plugin: IPlugin.IPluginInstance) {
    plugins.value.push(plugin);
  }

  function removePlugin(id: string) {
    const index = plugins.value.findIndex(p => p.id === id);
    if (index !== -1) {
      plugins.value.splice(index, 1);
    }
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
    plugins,
    addPlugin,
    removePlugin,
    updatePlugin,
    getPlugin,
  };
});
