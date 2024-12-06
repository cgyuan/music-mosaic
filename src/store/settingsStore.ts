import { defineStore } from 'pinia'
import defaultAppConfig from '@/common/default-config'
import { IAppConfig, IAppConfigKeyPath, IAppConfigKeyPathValue } from '@/types/config'
import { ref, watch } from 'vue'
import { appWindow } from '@tauri-apps/api/window';
import { defaultShortcuts } from '@/common/default-shortcut';

function transformFlatToNested() {
  const result: Partial<{
    [K in keyof IAppConfig]: Partial<IAppConfig[K]>
  }> = {
    normal: {},
    playMusic: {},
    lyric: {},
    shortCut: {},
    download: {},
    plugin: {},
    network: {},
    backup: {},
    localMusic: {},
    theme: {},
    private: {}
  }
  // @ts-ignore
  Object.entries(defaultAppConfig).forEach(([key, value]) => {
    const [section, field] = key.split('.')
    if (section && field && section in result) {
      (result[section as keyof typeof result] as any)[field] = value
    }
  })

  result.shortCut!.shortcuts = defaultShortcuts

  return result as IAppConfig;
}

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<IAppConfig>(transformFlatToNested())

  // @ts-ignore
  const updateSetting = <T extends IAppConfigKeyPath>(
    keyPath: T,
    value: IAppConfigKeyPathValue<T>
  ) => {
    const [section, key] = keyPath.split('.') as [keyof IAppConfig, string]
    if (section && key && settings.value[section]) {
      (settings.value[section] as any)[key] = value
    }
  }

  appWindow.setResizable(settings.value.normal?.windowResizable ?? false)

  watch(() => settings.value.normal?.windowResizable, (value) => {
    if (value) {
      appWindow.setResizable(true)
    } else {
      appWindow.setResizable(false)
    }
  })

  return { 
    settings,
    updateSetting
  }
}, {
  persistedState: {
    persist: true
  }
})