import { defineStore } from 'pinia'
import defaultAppConfig from '@/common/default-config'
import { IAppConfig, IAppConfigKeyPath, IAppConfigKeyPathValue } from '@/types/config'
import { ref } from 'vue'

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

  return { 
    settings,
    updateSetting
  }
}, {
  persistedState: {
    persist: true
  }
})