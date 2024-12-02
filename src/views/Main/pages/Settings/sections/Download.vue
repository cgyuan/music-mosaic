<template>
    <div class="setting-view--download">
        <RadioGroupSettingItem
            :value="settings.download?.defaultQuality"
            keyPath="download.defaultQuality"
            label="默认下载音质"
            :options="[{ value: 'low', title: '低音质' },{ value: 'standard', title: '标准音质' }, { value: 'high', title: '高音质' }, { value: 'super', title: '超高音质' }]"
            @update:value="value => updateSetting('download.defaultQuality', value as IMusic.IQualityKey)"
        />
        <RadioGroupSettingItem
            :value="settings.download?.whenQualityMissing"
            keyPath="download.whenQualityMissing"
            label="下载音质缺失时"
            :options="[{ value: 'lower', title: '下载更低音质' }, { value: 'higher', title: '下载更高音质' }]"
            @update:value="value => updateSetting('download.whenQualityMissing', value as 'higher' | 'lower')"
        />
    </div>
</template>

<script setup lang="ts">
import { useSettingsStore } from '@/store/settingsStore'
import RadioGroupSettingItem from '../components/RadioGroupSettingItem.vue'

const { settings, updateSetting } = useSettingsStore()
</script>

<style scoped>
.setting-view--download {
    display: flex;
    flex-direction: column;
    gap: 16px;
}
</style>
