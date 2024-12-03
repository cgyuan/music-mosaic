<template>
    <div class="check-box-setting-item">
        <Checkbox 
            :inputId="String(keyPath)"
            :modelValue="checked"
            @update:modelValue="$emit('update:checked', $event)"
            binary
        />
        <label :for="String(keyPath)">{{ label }}</label>
    </div>
</template>

<script setup lang="ts">
import Checkbox from 'primevue/checkbox';
import { IAppConfigKeyPath, IAppConfigKeyPathValue } from '@/types/config';

interface ICheckBoxSettingItemProps<T extends IAppConfigKeyPath> {
  keyPath: T;
  label?: string;
  checked: IAppConfigKeyPathValue<T>;
}

defineProps<ICheckBoxSettingItemProps<IAppConfigKeyPath>>();
defineEmits<{
  'update:checked': [value: boolean]
}>();
</script>

<style scoped>
.check-box-setting-item {
    display: flex;
    align-items: center;
    gap: 8px;
}
</style>
