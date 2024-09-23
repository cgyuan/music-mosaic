<template>
    <div class="app-sidebar">
        <div class="sidebar-section">
            <SidebarItem icon="trophy" label="排行榜" />
            <SidebarItem icon="fire" label="热门歌单" :active="true" />
            <SidebarItem icon="array-download-tray" label="下载管理" />
            <SidebarItem icon="folder-open" label="本地音乐" />
            <SidebarItem icon="code-bracket-square" label="插件管理" />
            <SidebarItem icon="clock" label="最近播放" />
        </div>

        <div class="sidebar-section">
            <div class="section-header">
                <div class="section-label">
                    <i class="pi pi-angle-down"></i>
                    <span>我的歌单</span>
                </div>
                <Button icon="pi pi-plus" text rounded severity="secondary" size="small" />
            </div>
            <SidebarItem icon="heart-outline" label="我喜欢" />
        </div>

        <div class="sidebar-section">
            <div class="section-header">
                <div class="section-label">
                    <i class="pi pi-angle-right"></i>
                    <span>我的收藏</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button';
import SidebarItem from './SidebarItem.vue';
</script>

<style scoped>
.app-sidebar {
    width: 200px;
    background-color: #f8f9fa;
    height: 100%;
    padding: 1rem 0;
    overflow-y: auto;
}

.sidebar-section {
    margin-bottom: 1.5rem;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
    padding: 0 1rem;
    font-size: 0.9rem;
    color: #6c757d;
}

.section-label {
    flex: 1;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.2rem;
}

.section-actions {
    display: flex;
    gap: 0.25rem;
}

:deep(.p-button.p-button-text) {
    color: #6c757d;
    padding: 0.25rem;
}

:deep(.p-button.p-button-text:hover) {
    background-color: #e9ecef;
}

</style>