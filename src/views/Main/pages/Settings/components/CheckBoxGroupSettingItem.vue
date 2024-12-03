<template>
    <div class="check-box-group">
        <label v-if="label" class="check-box-group-label">{{ label }}</label>
        <div :class="['check-box-options', direction === 'vertical' ? 'vertical' : 'horizontal']">
            <div v-for="option in options" :key="option.value as string" class="check-box-option">
                <CheckBox :inputId="String(keyPath + option.value)" :modelValue="value" :name="option.title" :value="option.value"
                    @update:modelValue="handleUpdateValue"/>
                <label :for="String(keyPath + option.value)">{{ option.title }}</label>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import CheckBox from 'primevue/checkbox';
import { IAppConfigKeyPath, IAppConfigKeyPathValue } from '@/types/config';

interface ICheckBoxGroupSettingItemProps<T extends IAppConfigKeyPath> {
  keyPath: T;
  label?: string;
  options: Array<{
    /** 存储的value */
    value: IAppConfigKeyPathValue<T>;
    /** 展示的值 */
    title?: string;
  }>;
  value?: IAppConfigKeyPathValue<T>;
  direction?: "horizonal" | "vertical";
}

defineProps<ICheckBoxGroupSettingItemProps<IAppConfigKeyPath>>();
const emit = defineEmits<{
    'update:value': [value: IAppConfigKeyPathValue<IAppConfigKeyPath>]
}>();

const handleUpdateValue = (value: IAppConfigKeyPathValue<IAppConfigKeyPath>) => {
    console.log(value);
    emit('update:value', value);
}
</script>

<style scoped>
.check-box-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.check-box-group-label {
    font-weight: 500;
}

.check-box-options {
    display: flex;
    gap: 2rem;
}

.check-box-options.vertical {
    flex-direction: column;
}

.check-box-options.horizontal {
    flex-wrap: wrap;
}

.check-box-option {
    display: flex;
    align-items: center;
    gap: 8px;
}
</style>
