<template>
    <div class="header-container" data-tauri-drag-region>
        <div class="center-content">
            <div class="left-controls">
                <Button severity="secondary" text rounded size="small" @click="goBack" :disabled="!canGoBack"
                    :class="{ 'disabled-button': !canGoBack }">
                    <SvgAsset iconName="chevron-left"></SvgAsset>
                </Button>
                <Button :style="{
                    display: 'none',
                }" severity="secondary" text rounded size="small" @click="goForward" :disabled="!canGoForward"
                    :class="{ 'disabled-button': !canGoForward }">
                    <SvgAsset iconName="chevron-right"></SvgAsset>
                </Button>
            </div>
            <IconField class="header-search">
                <InputIcon class="pi pi-search" />
                <InputText v-model="searchQuery" placeholder="请在这里输入搜索内容" @keyup.enter="handleSearch" />
            </IconField>
        </div>

        <div class="right-controls right-part">
            <Button severity="secondary" text rounded @click="handleTheme">
                <SvgAsset iconName="t-shirt-line"></SvgAsset>
            </Button>
            <Button severity="secondary" text rounded @click="handleSettings">
                <SvgAsset iconName="cog-8-tooth" :size="24"></SvgAsset>
            </Button>
            <Button severity="secondary" text rounded>
                <SvgAsset iconName="picture-in-picture-line"></SvgAsset>
            </Button>
            <template v-if="is.windows()">
                <Button severity="secondary" text rounded @click="minimizeWindow">
                    <SvgAsset iconName="minus"></SvgAsset>
                </Button>
                <Button severity="secondary" text rounded @click="closeWindow">
                    <SvgAsset iconName="x-mark"></SvgAsset>
                </Button>
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, Ref, inject } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import SvgAsset from '../SvgAsset.vue';
import { useUIStore } from '@/store/uiStore';
import { storeToRefs } from 'pinia';
import PlaylistDrawer from '../PlaylistDrawer.vue';
import { appWindow } from '@tauri-apps/api/window'
import { is } from '@/common/is';
import { useSettingsStore } from '@/store/settingsStore';

const { showLyricView } = storeToRefs(useUIStore());
const router = useRouter();
const route = useRoute();
const searchQuery = ref('');
const canGoBack = ref(false);
const canGoForward = ref(false);

const settingsStore = useSettingsStore();

const playlistDrawer = inject('playlistDrawer') as Ref<InstanceType<typeof PlaylistDrawer>>;

const updateNavigationState = () => {
    canGoBack.value = router.options.history.state.back !== null;
    canGoForward.value = router.options.history.state.forward !== null;
};

const goBack = () => {
    playlistDrawer.value.visible = false;
    if (showLyricView.value) {
        showLyricView.value = false;
        return;
    }
    if (canGoBack.value) {
        router.back();
    }
};

const goForward = () => {
    playlistDrawer.value.visible = false;
    if (showLyricView.value) {
        showLyricView.value = false;
        return;
    }
    if (canGoForward.value) {
        router.forward();
    }
};

const handleSearch = () => {
    if (searchQuery.value.trim()) {
        playlistDrawer.value.visible = false;
        showLyricView.value = false;
        router.push({ name: 'search', params: { query: searchQuery.value.trim() } });
    }
};

const handleTheme = () => {
    playlistDrawer.value.visible = false;
    showLyricView.value = false;
    router.push({ name: 'theme' });
};

const handleSettings = () => {
    playlistDrawer.value.visible = false;
    showLyricView.value = false;
    router.push({ name: 'settings' });
};

onMounted(() => {
    updateNavigationState();
    window.addEventListener('popstate', updateNavigationState);
});

watch(route, updateNavigationState);


const minimizeWindow = () => {
    appWindow.minimize();
};

const closeWindow = () => {
    if (settingsStore.settings.normal?.closeBehavior === 'minimize') {
        appWindow.hide();
    } else {
        appWindow.close();
    }
};
</script>

<style scoped>
.header-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 1rem;
    height: 54px;
    z-index: 2000;
    background-color: var(--primaryColor);
    /* border-bottom: 1px solid #e9ecef; */
}

.left-controls,
.right-controls {
    display: flex;
    align-items: center;
}

.center-content {
    margin-left: 200px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
}

.p-inputtext {
    width: 250px;
}

:deep(.p-button.p-button-text) {
    color: var(--headerTextColor);
    padding: 0.25rem;
}

:deep(.p-button) {
    width: 30px;
    height: 30px !important;
}

.header-search {
    border-radius: 9999px;
}

:deep(.p-inputtext) {
    background: var(--maskColor);
    outline: none;
    border: none;
    color: var(--headerTextColor);
}

:deep(.p-iconfield .p-inputicon) {
    color: var(--textColor);
    opacity: 0.7;
}

:deep(.p-inputtext::placeholder) {
    color: var(--textColor);
    opacity: 0.7;
}
</style>