<template>
    <div class="settings-view--shortcut" @click="exitRecordShortcut">
        <CheckBoxSettingItem 
            :checked="settings.shortCut?.enableGlobal ?? false"
            keyPath="shortCut.enableGlobal" 
            label="启用全局快捷键"
            @update:checked="value => updateSetting('shortCut.enableGlobal', value)" 
        />
        <div class="shortcut-table" tabindex="0" ref="shortcutTableRef">
            <div class="row row-head">
                <div class="col">功能</div>
                <div class="col">快捷键</div>
                <div class="col">全局快捷键</div>
            </div>
            
            <div v-for="shortcut in shortcuts" :key="shortcut.id" class="row">
                <div class="col">{{ shortcut.name }}</div>
                <div class="col">
                    <div role="button" class="keyboard-input"
                        :class="{ active: shortcutInput.id === shortcut.id && shortcutInput.type === 'shortcut' }"
                        @click.stop="readyToRecordShortcut(shortcut.id, 'shortcut')"
                    >
                        {{ formatShortcut(shortcut.shortcut) }}
                    </div>
                </div>
                <div class="col">
                    <div role="button" class="keyboard-input"
                        :class="{ 
                            active: shortcutInput.id === shortcut.id && 
                                   shortcutInput.type === 'globalShortcut' &&
                                   isGlobalShortcutEnabled,
                            disabled: !isGlobalShortcutEnabled
                        }"
                        @click.stop="readyToRecordShortcut(shortcut.id, 'globalShortcut')"
                    >
                        {{ formatShortcut(shortcut.globalShortcut) }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted, inject } from 'vue'
import { onClickOutside } from '@vueuse/core'
import CheckBoxSettingItem from '../components/CheckBoxSettingItem.vue';
import { useSettingsStore } from '@/store/settingsStore'
import { is } from '@/common/is'

const { settings, updateSetting } = useSettingsStore();

console.log(settings.shortCut?.shortcuts);

const shortcuts = ref(settings.shortCut?.shortcuts ?? [])

const shortcutInput = ref({
    id: '',
    type: '',
    recording: false
})

const isGlobalShortcutEnabled = computed(() => settings.shortCut?.enableGlobal ?? false)

const formatShortcut = (shortcut: string) => {
    if (!shortcut) return ''
    
    shortcut = shortcut
        .split('+').join(' + ')
        .replace('Up', '↑')
        .replace('Down', '↓')
        .replace('Right', '→')
        .replace('Left', '←')
        .replace('Space', '空格')

    if (is.macOS()) {
        return shortcut
            .replace('CommandOrControl', '⌘')
            .replace('Command', '⌘')
            .replace('Alt', '⌥')
            .replace('Control', '⌃')
            .replace('Shift', '⇧')
    }
    
    return shortcut.replace('CommandOrControl', 'Ctrl')
}

const shortcutTableRef = ref<HTMLElement | null>(null)

const isRecordingShortcut = inject('isRecordingShortcut')

const readyToRecordShortcut = (id: string, type: string) => {
    if (type === 'globalShortcut' && !isGlobalShortcutEnabled.value) {
        return
    }
    event?.stopPropagation()
    shortcutInput.value = { id, type, recording: true }
    isRecordingShortcut.value = true
}

const exitRecordShortcut = () => {
    if (!shortcutInput.value.recording) return
    shortcutInput.value = { id: '', type: '', recording: false }
    isRecordingShortcut.value = false
}

onClickOutside(shortcutTableRef, () => {
    exitRecordShortcut();
})

// Add keyboard event handler
const handleKeyDown = (e: KeyboardEvent) => {
    if (!shortcutInput.value.recording) return
    
    e.preventDefault()
    
    // 如果只按了修饰键，不处理
    if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) {
        return
    }
    
    let keys: string[] = []
    
    // 添加修饰键，注意顺序
    if (e.metaKey) keys.push('Command')
    if (e.ctrlKey) keys.push('Control')
    if (e.altKey) keys.push('Alt')
    if (e.shiftKey) keys.push('Shift')
    
    // 添加主键
    if (e.code.startsWith('Key')) {
        keys.push(e.code.replace('Key', ''))
    } else if (e.code.startsWith('Digit')) {
        keys.push(e.code.replace('Digit', ''))
    } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        keys.push(e.code.replace('Arrow', ''))
    } else if (e.code === 'Space') {
        keys.push('Space')
    } else {
        keys.push(e.code)
    }

    // 确保有按键组合
    if (keys.length > 0) {
        const { id, type } = shortcutInput.value
        
        // 在 macOS 上将 Control 替换为 CommandOrControl
        if (is.macOS() && keys[0] === 'Control') {
            keys[0] = 'CommandOrControl'
        }
        
        const shortcut = keys.join('+')
        
        // Update the shortcut in the shortcuts array
        const shortcutItem = shortcuts.value.find(s => s.id === id)
        if (shortcutItem) {
            if (type === 'shortcut') {
                shortcutItem.shortcut = shortcut
            } else {
                shortcutItem.globalShortcut = shortcut
            }
        }
        
        // Exit recording mode
        exitRecordShortcut()
    }
}

// Add/remove keyboard event listener
watch(() => shortcutInput.value.recording, (recording) => {
    if (recording) {
        window.addEventListener('keydown', handleKeyDown)
    } else {
        window.removeEventListener('keydown', handleKeyDown)
    }
})

// Clean up event listener
onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
})

// Watch settings shortcuts changes
watch(() => settings.shortCut?.shortcuts, (newShortcuts) => {
    if (newShortcuts) {
        shortcuts.value = newShortcuts
    }
}, { deep: true })

// Watch local shortcuts changes
watch(shortcuts, (newShortcuts) => {
    updateSetting('shortCut.shortcuts', newShortcuts)
}, { deep: true })
</script>

<style scoped>
.settings-view--shortcut {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 16px;
    
}

.shortcut-table {
    font-size: 14px;
    user-select: none;
    color: var(--textColor);
    outline: none;
}

.row {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
}

.row.row-head {
    opacity: 0.58;
    font-size: 13px;
    font-weight: 500;
    margin-bottom: 16px;
}

.col {
    min-width: 192px;
    padding: 8px;
    display: flex;
    align-items: center;
}

.col:first-of-type {
    padding-left: 0;
    min-width: 128px;
}

.keyboard-input {
    font-weight: 600;
    background-color: var(--maskColor);
    padding: 8px 12px;
    border-radius: 8px;
    min-width: 146px;
    min-height: 34px;
    box-sizing: border-box;
    cursor: pointer;
}

.keyboard-input.active {
    color: var(--primaryColor);
    background-color: color-mix(in srgb, currentColor 20%, transparent);
}

.keyboard-input.disabled {
    cursor: not-allowed;
    opacity: 0.5;
}

</style>