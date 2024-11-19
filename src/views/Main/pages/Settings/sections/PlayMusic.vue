<template>
    <div class="setting-view--play-music">
        <RadioGroupSettingItem v-model:value="quality" keyPath="playMusic.defaultQuality" :options="[
            { value: 'low', title: '低音质' },
            { value: 'standard', title: '标准音质' },
            { value: 'high', title: '高音质' },
            { value: 'super', title: '超高音质' }
        ]" label="默认播放音质" direction="horizonal" />
        <RadioGroupSettingItem v-model:value="whenQualityMissing" keyPath="playMusic.whenQualityMissing" :options="[
            { value: 'higher', title: '使用更高音质' },
            { value: 'lower', title: '使用更低音质' }
        ]" label="默认播放音质缺失时" direction="horizonal" />
        <RadioGroupSettingItem v-model:value="playError" keyPath="playMusic.playError" :options="[
            { value: 'pause', title: '暂停播放' },
            { value: 'skip', title: '跳过播放' }
        ]" label="播放失败时" direction="horizonal" />
        <RadioGroupSettingItem v-model:value="clickMusicList" keyPath="playMusic.clickMusicList" :options="[
            { value: 'normal', title: '将目标单曲添加到播放队列' },
            { value: 'replace', title: '使用当前音乐列表替换播放队列' }
        ]" label="双击音乐列表时" direction="horizonal" />
        <RadioGroupSettingItem v-model:value="whenDeviceRemoved" keyPath="playMusic.whenDeviceRemoved" :options="[
            { value: 'pause', title: '暂停播放' },
            { value: 'play', title: '继续播放' }
        ]" label="音频设备移除时" direction="horizonal" />
    </div>

</template>

<script setup lang="ts">
import RadioGroupSettingItem from '../components/RadioGroupSettingItem.vue'
import { ref } from 'vue'

const quality = ref('standard')
const whenQualityMissing = ref('higher')
const playError = ref('skip')
const clickMusicList = ref('normal')
const whenDeviceRemoved = ref('pause')
</script>

<style scoped>
.setting-view--play-music {
    display: flex;
    flex-direction: column;
    gap: 16px;
}
</style>
