<template>
    <div class="app-header">
        <div class="left-controls">
            <Button 
                severity="secondary" 
                text 
                rounded 
                icon="pi pi-arrow-left"  
                size="small" 
                @click="goBack" 
                :disabled="!canGoBack" 
                :class="{ 'disabled-button': !canGoBack }"
            />
            <Button 
                severity="secondary" 
                text 
                rounded 
                icon="pi pi-arrow-right"  
                size="small" 
                @click="goForward" 
                :disabled="!canGoForward" 
                :class="{ 'disabled-button': !canGoForward }"
            />
        </div>
        
        <div class="center-content">
            <IconField>
                <InputIcon class="pi pi-search" />
                <InputText 
                    v-model="searchQuery" 
                    placeholder="Search" 
                    @keyup.enter="handleSearch"
                />
            </IconField>
        </div>
        
        <div class="right-controls">
            <Button severity="secondary" text rounded>
                <SvgAsset iconName="t-shirt-line"></SvgAsset>
            </Button>
            <Button severity="secondary" text rounded>
                <SvgAsset iconName="cog-8-tooth"></SvgAsset>
            </Button>
            <Button severity="secondary" text rounded>
                <SvgAsset iconName="picture-in-picture-line"></SvgAsset>
            </Button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import SvgAsset from '../SvgAsset.vue';
import { useUIStore } from '@/store/uiStore';
import { storeToRefs } from 'pinia';


const { showLyricView } = storeToRefs(useUIStore());
const router = useRouter();
const route = useRoute();
const searchQuery = ref('');
const canGoBack = ref(false);
const canGoForward = ref(false);

const updateNavigationState = () => {
    canGoBack.value = router.options.history.state.back !== null;
    canGoForward.value = router.options.history.state.forward !== null;
};

const goBack = () => {
    if (showLyricView.value) {
        showLyricView.value = false;
        return;
    }
    if (canGoBack.value) {
        router.back();
    }
};

const goForward = () => {
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
        showLyricView.value = false;
        router.push({ name: 'search', params: { query: searchQuery.value.trim() } });
    }
};

onMounted(() => {
    updateNavigationState();
    window.addEventListener('popstate', updateNavigationState);
});

watch(route, updateNavigationState);

</script>

<style scoped>
.app-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 1rem;
    background-color: white;
    border-bottom: 1px solid #e9ecef;
}

.left-controls, .right-controls {
    display: flex;
    align-items: center;
}

.center-content {
    flex-grow: 1;
    display: flex;
    justify-content: center;
}

.p-inputtext {
    width: 300px;
}

:deep(.p-button.p-button-text) {
    color: #6c757d;
    padding: 0.25rem;
}

.disabled-button {
    color: #d3d3d3 !important; /* Lighter color for disabled buttons */
}
</style>
