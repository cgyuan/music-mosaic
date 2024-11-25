<template>
    <Loading v-if="loadingState === RequestStateCode.PENDING_FIRST_PAGE" />
    <div v-else class="theme-market-container">
        <div class="theme-market-grid">
            <div class="theme-market-item" :class="{ active: currentThemePack?.id === theme.id }" v-for="theme in remoteThemeStores" :key="theme.id">
                <div class="theme-market-item-preview-container">
                    <div v-if="theme.config.preview.startsWith('#')" class="theme-market-item-preview" :style="{
                        background: theme.config.preview
                    }"></div>
                    <img v-else :src="theme.config.preview" :alt="theme.config.name"
                        class="theme-market-item-preview" />

                    <div class="theme-market-item-preview-mask">
                        <div v-if="isInstalling" class="theme-downloading">
                            <Loading text="下载中"/>
                        </div>
                        <span v-else-if="localThemePacks.find(it => it.id === theme.id)" @click="selectTheme(localThemePacks.find(it => it.id === theme.id)!)">使用主题</span>
                        <span v-else @click="installTheme(theme.config.srcUrl!)">下载使用</span>
                    </div>
                </div>
                <div class="theme-market-item-name">{{ theme.config.name }}</div>
                <div class="theme-market-item-author">{{ theme.config.author }}</div>
            </div>
        </div>
    </div>
    
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import useThemes from "@/hooks/useThemes";
import { RequestStateCode } from "@/common/constant";
import Loading from "@/components/Loading.vue";

const { loadingState, remoteThemeStores, localThemePacks, installRemoteThemePack, selectTheme, currentThemePack } = useThemes();
const isInstalling = ref(false);


const installTheme = async (url: string, id?: string) => {
    try {
        isInstalling.value = true;
        const themePack = await installRemoteThemePack(url, id);
        selectTheme(themePack);
    } catch (error) {
        console.error(error);
    } finally {
        isInstalling.value = false;
    }
}

</script>
<style scoped>
.theme-market-container {
    padding: 0.5rem 1rem;
    overflow: auto;
    height: 100%;
}

.theme-market-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
}

.theme-market-item {
    display: flex;
    flex-direction: column;
    gap: 0rem;
}

.theme-market-item-preview-container {
    position: relative;
    height: 100px;
    border-radius: 0.5rem;
    overflow: hidden;
}

.theme-market-item.active .theme-market-item-preview-container {
    border: 2px solid var(--primaryColor);
}

.theme-market-item-preview-mask {
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
}

.theme-market-item-preview-mask span {
    color: #fff;
    font-size: 0.8rem;
    font-weight: bold;
    border-radius: 0.2rem;
    padding: 0.2rem 0.5rem;
    border: 1px solid #fff;
    cursor: pointer;
}

.theme-market-item-preview-container:hover .theme-market-item-preview-mask {
    opacity: 1;
}

.theme-market-item-preview {
    width: 100%;
    height: 100px;
    object-fit: cover;
    border-radius: 0.5rem;
}

.theme-market-item-name {
    font-size: 0.9rem;
    font-weight: bold;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-top: 0.2rem;
    color: var(--textColor);
}

.theme-market-item-author {
    font-size: 0.75rem;
    color: var(--textColor);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.theme-downloading {
    scale: 0.7;
}
</style>