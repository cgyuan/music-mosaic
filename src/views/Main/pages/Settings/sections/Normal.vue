<template>
    <div class="setting-view--normal">
        <CheckBoxSettingItem 
            :checked="settings.normal?.checkUpdate"
            keyPath="normal.checkUpdate" 
            label="应用启动时检测软件版本更新"
            @update:checked="value => updateSetting('normal.checkUpdate', value)" 
        />
        <RadioGroupSettingItem 
            :value="settings.normal?.closeBehavior"
            keyPath="normal.closeBehavior" 
            label="单击退出按钮时"
            :options="[{ value: 'exit', title: '退出应用' }, { value: 'minimize', title: '最小化到托盘' }]"
            @update:value="value => updateSetting('normal.closeBehavior', value as 'exit' | 'minimize')" 
        />
        <RadioGroupSettingItem 
            :value="settings.normal?.windowResizable"
            keyPath="normal.windowResizable" 
            label="窗口大小是否可调整"
            :options="[{ value: true, title: '可调整' }, { value: false, title: '不可调整' }]"
            @update:value="value => updateSetting('normal.windowResizable', value as boolean)" 
        />
        <RadioGroupSettingItem 
            :value="settings.normal?.maxHistoryLength"
            keyPath="normal.maxHistoryLength" 
            label="搜索历史记录最多保存条数"
            :options="[{ value: 15 }, { value: 30 }, { value: 50 }, { value: 100 }, { value: 200 }]"
            @update:value="value => updateSetting('normal.maxHistoryLength', value as number)" 
        />
        <CheckBoxGroupSettingItem 
            :value="settings.normal?.musicListColumnsShown"
            keyPath="normal.musicListColumnsShown" 
            label="歌曲列表隐藏列"
            :options="[{ value: 'duration', title: '时长'}, { value: 'platform', title: '来源'}]"
            @update:value="value => updateSetting('normal.musicListColumnsShown', value as ('duration' | 'platform')[])" 
        />
    </div>
</template>

<script setup lang="ts">
import { useSettingsStore } from '@/store/settingsStore'
import CheckBoxSettingItem from '../components/CheckBoxSettingItem.vue'
import RadioGroupSettingItem from '../components/RadioGroupSettingItem.vue'
import CheckBoxGroupSettingItem from '../components/CheckBoxGroupSettingItem.vue'

const { settings, updateSetting } = useSettingsStore()
</script>

<style scoped>
.setting-view--normal {
    display: flex;
    flex-direction: column;
    gap: 16px;
}
</style>
