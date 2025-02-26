<template>
    <div>
        <div class="local-thme-container">
            <div class="local-thme-grid">
                <div class="local-thme-item local-theme-upload">
                    <div class="local-thme-item-preview-container" @click="handleLoadLocalTheme">
                        <div class="local-thme-item-preview upload-preview">
                            <SvgAsset iconName="plus" :size="60" color="var(--textColor)" />
                        </div>
                    </div>
                </div>
                <div class="local-thme-item" :class="{ active: currentThemePack?.id === theme?.id }" v-for="theme in themePacks" :key="theme?.id">
                    <div class="local-thme-item-preview-container">
                        <div v-if="theme === null" class="local-thme-item-preview" :style="{
                            backgroundColor: 'rgb(241, 125, 52)'
                        }"></div>
                        <div v-else-if="theme?.preview.startsWith('#')" class="local-thme-item-preview" :style="{
                            background: theme.preview
                        }"></div>
                        <img v-else :src="theme?.preview" :alt="theme?.name"
                            class="local-thme-item-preview" />

                        <div class="local-thme-item-preview-mask">
                            <span @click="handleSelectTheme(theme)">使用主题</span>
                            <span v-if="theme" @click="uninstallThemePack(theme)">卸载</span>
                        </div>
                    </div>
                    <div class="local-thme-item-info">
                        <div class="name">{{ theme?.name || '默认主题' }}</div>
                        <div v-if="theme" class="author">{{ theme.author }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import useThemes from "@/hooks/useThemes";
import { computed } from 'vue';
import { open } from '@tauri-apps/api/dialog';
import SvgAsset from "@/components/SvgAsset.vue";
const { selectTheme, localThemePacks, uninstallThemePack, currentThemePack, installLocalTheme } = useThemes();


const themePacks = computed(() => {
    return [...localThemePacks.value, null];
});

const handleSelectTheme = async (theme: ICommon.IThemePack | null) => {
    selectTheme(theme);
}

const handleLoadLocalTheme = async () => {
    try {
        const selected = await open({
            multiple: false,
            filters: [{
                name: '主题包',
                extensions: ['mftheme']
            }]
        });
        
        if (selected && typeof selected === 'string') {
            const themePack = await installLocalTheme(selected);
            selectTheme(themePack);
        }
    } catch (error) {
        console.error('Failed to load local theme:', error);
    }
}
</script>
<style scoped>
.local-thme-container {
    padding: 0.5rem 1rem;
    overflow: auto;
    height: 100%;
}

.local-thme-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
}

.local-thme-item {
    display: flex;
    flex-direction: column;
    gap: 0rem;
}

.local-thme-item.active .local-thme-item-preview-container {
    border: 2px solid var(--primaryColor)
}

.local-thme-item-preview-container {
    position: relative;
    height: 100px;
    border-radius: 0.5rem;
    overflow: hidden;
}

.local-thme-item-preview-mask {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.8);
    opacity: 0;
    transition: opacity 0.3s ease;
    display: flex;
    gap: 0.5rem;
    flex-direction: column;
}

.local-thme-item-preview-mask span {
    color: #fff;
    font-size: 0.8rem;
    font-weight: bold;
    border-radius: 0.2rem;
    padding: 0.2rem 0.5rem;
    border: 1px solid #fff;
    cursor: pointer;
}

.local-thme-item-preview-container:hover .local-thme-item-preview-mask {
    opacity: 1;
}

.local-thme-item-preview {
    width: 100%;
    height: 100px;
    object-fit: cover;
}

.local-thme-item-info {
    display: flex;
    flex-direction: column;
    gap: 0.05rem;
    margin-left: 0.2rem;
}

.local-thme-item-info .name {
    font-size: 0.9rem;
    font-weight: bold;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-top: 0.2rem;
    color: var(--textColor);
}

.local-thme-item-info .author {
    font-size: 0.75rem;
    color: var(--textColor);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.local-theme-upload .local-thme-item-preview-container {
    cursor: pointer;
    border: 2px dashed var(--dividerColor);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
}

/* .local-theme-upload .local-thme-item-preview-container:hover {
    border-color: var(--primaryColor);
    background-color: rgba(var(--primaryColorRgb), 0.1);
} */

.upload-preview {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: transparent !important;
}

.local-theme-upload .local-thme-item-preview-container:hover :deep(svg) {
    color: var(--primaryColor) !important;
}
</style>