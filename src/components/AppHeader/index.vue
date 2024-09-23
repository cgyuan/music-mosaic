<template>
    <div class="app-header">
        <div class="left-controls">
            <Button severity="secondary" text rounded icon="pi pi-arrow-left"  size="small" @click="goBack" />
            <Button severity="secondary" text rounded icon="pi pi-arrow-right"  size="small" @click="goForward" />
        </div>
        
        <div class="center-content">
            <IconField>
                <InputIcon class="pi pi-search" />
                <InputText v-model="searchQuery" placeholder="Search" @keyup.enter="performSearch" />
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
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import SvgAsset from '../SvgAsset.vue';

const router = useRouter();
const searchQuery = ref('');

const goBack = () => {
    router.go(-1);
};

const goForward = () => {
    router.go(1);
};

const performSearch = () => {
    // Implement search functionality
    console.log('Searching for:', searchQuery.value);
    // You might want to navigate to a search results page
    // router.push({ name: 'search', query: { q: searchQuery.value } });
};
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
</style>