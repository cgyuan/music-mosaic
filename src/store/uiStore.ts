import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUIStore = defineStore('ui', () => {
    const showLyricView = ref(false);
    const isMusicSheetModalVisible = ref(false);
    const isEditingMusicSheet = ref(false);

    const showNewMusicSheetModal = () => {
        isEditingMusicSheet.value = false;
        isMusicSheetModalVisible.value = true;
    }

    const showRenameMusicSheetModal = () => {
        isEditingMusicSheet.value = true;
        isMusicSheetModalVisible.value = true;
    }

    return {
        showLyricView,
        isMusicSheetModalVisible,
        isEditingMusicSheet,
        showNewMusicSheetModal,
        showRenameMusicSheetModal
    };
}, {
    persistedState: {
        persist: false
    }
});