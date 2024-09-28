<template>
    <Dialog 
        :visible="visible" 
        @update:visible="updateVisible" 
        modal 
        :header="isEditing ? '重命名歌单' : '创建新歌单'" 
        :style="{ width: '400px' }"
    >
        <div class="p-fluid">
            <div class="p-field">
                <InputText 
                    id="playlist-name" 
                    v-model="musicSheetName" 
                    :placeholder="isEditing ? '新歌单名称' : '歌单名称'"
                    autofocus 
                />
            </div>
        </div>
        <div class="button-container">
            <Button 
                :label="isEditing ? '重命名' : '创建'" 
                icon="pi pi-check" 
                @click="submitMusicSheet" 
                :disabled="!musicSheetName.trim()"
            />
        </div>
    </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';

const props = defineProps<{
    visible: boolean,
    isEditing: boolean,
    initialName?: string
}>();

const emit = defineEmits<{
    (e: 'update:visible', value: boolean): void
    (e: 'submit', musicSheetName: string): void
}>();

const musicSheetName = ref('');

const updateVisible = (value: boolean) => {
    emit('update:visible', value);
};

const submitMusicSheet = () => {
    if (musicSheetName.value.trim()) {
        emit('submit', musicSheetName.value.trim());
        closeModal();
    }
};

const closeModal = () => {
    updateVisible(false);
    musicSheetName.value = '';
};

watch(() => props.visible, (newValue) => {
    if (newValue && props.isEditing && props.initialName) {
        musicSheetName.value = props.initialName;
    } else if (!newValue) {
        musicSheetName.value = '';
    }
});
</script>

<style scoped>
.p-dialog {
    border-radius: 8px;
}

.p-field {
    margin-bottom: 1rem;
}

.button-container {
    display: flex;
    justify-content: center;
    margin-top: 1rem;
}

:deep(.p-inputtext) {
    width: 100%;
    padding: 0.75rem;
    font-size: 1rem;
    border-radius: 4px;
}

:deep(.p-button) {
    padding: 0.75rem 2rem;
    font-size: 1rem;
}
</style>

