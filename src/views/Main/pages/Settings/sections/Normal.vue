<template>
    <div class="setting-view--normal">
        <CheckBoxSettingItem v-model:checked="checkUpdate" keyPath="normal.checkUpdate" label="应用启动时检测软件版本更新" />
        <RadioGroupSettingItem v-model:value="closeBehavior" keyPath="normal.closeBehavior" label="单击退出按钮时"
            :options="[{ value: 'close', title: '退出应用' }, { value: 'hide', title: '最小化到托盘' }]" />
        <RadioGroupSettingItem v-model:value="maxHistoryLength" keyPath="normal.maxHistoryLength" label="搜索历史记录最多保存条数"
            :options="[{ value: 15 }, { value: 30 }, { value: 50 }, { value: 100 }, { value: 200 }]" />
        <CheckBoxGroupSettingItem v-model:value="musicListColumnsShown" keyPath="normal.musicListColumnsShown" label="歌曲列表隐藏列"
            :options="[{ value: 'duration', title: '时长'}, { value: 'platform', title: '来源'}]" />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CheckBoxSettingItem from '../components/CheckBoxSettingItem.vue'
import RadioGroupSettingItem from '../components/RadioGroupSettingItem.vue';
import CheckBoxGroupSettingItem from '../components/CheckBoxGroupSettingItem.vue';

const checkUpdate = ref(true);
const closeBehavior = ref('hide');
const maxHistoryLength = ref(10);
const musicListColumnsShown = ref(['duration', 'platform']);
</script>

<style scoped>
.setting-view--normal {
    display: flex;
    flex-direction: column;
    gap: 16px;
}
</style>
