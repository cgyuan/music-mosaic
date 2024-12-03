<template>
    <div class="radio-group">
        <label v-if="label" class="radio-group-label">{{ label }}</label>
        <div :class="['radio-options', direction === 'vertical' ? 'vertical' : 'horizontal']">
            <div v-for="option in options" :key="option.value as string" class="radio-option">
                <RadioButton :inputId="String(keyPath + option.value)" :value="option.value" :modelValue="value"
                    @update:modelValue="$emit('update:value', $event)" />
                <label :for="String(keyPath + option.value)">{{ option.title || option.value }}</label>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { IAppConfigKeyPath, IAppConfigKeyPathValue } from '@/types/config';
import RadioButton from 'primevue/radiobutton';

// @ts-ignore 
interface IRadioGroupSettingItemProps<T extends IAppConfigKeyPath> {
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

defineProps<IRadioGroupSettingItemProps<IAppConfigKeyPath>>();
defineEmits<{
    'update:value': [value: IAppConfigKeyPathValue<IAppConfigKeyPath>]
}>();
</script>

<style scoped>
.radio-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.radio-group-label {
    font-weight: 500;
}

.radio-options {
    display: flex;
    gap: 2rem;
}

.radio-options.vertical {
    flex-direction: column;
}

.radio-options.horizontal {
    flex-wrap: wrap;
}

.radio-option {
    display: flex;
    align-items: center;
    gap: 8px;
}
</style>