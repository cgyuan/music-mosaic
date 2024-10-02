<template>
    <div class="custom-datatable" ref="containerRef" @scroll="onScroll">
        <div class="content">
            <div class="header">
                <slot name="header" />
            </div>
            <table :class="{ 'striped': stripedRows }">
                <thead>
                    <tr>
                        <th v-for="column in columns" :key="column.field" :style="getColumnStyle(column)">
                            {{ column.header }}
                        </th>
                    </tr>
                </thead>
            </table>
            <div v-if="loading" class="loading-container">
                <slot name="loading">
                    <div class="loading">Loading...</div>
                </slot>
            </div>
            <div v-else-if="!value.length" class="empty-container">
                <slot name="empty">
                    <div class="empty">No data available</div>
                </slot>
            </div>
            <div v-else class="virtual-list" :style="{ height: `${totalHeight}px` }">
                <div class="virtual-list-inner" :style="{ transform: `translateY(${startOffset}px)` }">
                    <table>
                        <tbody>
                            <tr v-for="(item, localIndex) in visibleItems"
                                :key="item[keyField] || (startIndex + localIndex)" class="data-row"
                                :class="{ 'striped': (startIndex + localIndex) % 2 === 1 }"
                                @dblclick="onRowDblClick(item, $event)" @contextmenu="onRowContextMenu(item, $event)"
                                :style="{ height: `${ROW_HEIGHT}px` }">
                                <td v-for="column in columns" :key="column.field" :style="getColumnStyle(column)">
                                    <slot :name="`cell:${column.field}`" :item="item" :value="item[column.field]"
                                        :index="startIndex + localIndex">
                                        {{ item[column.field] }}
                                    </slot>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import throttle from 'lodash.throttle';

interface Column {
    field: string;
    header: string;
    width?: string | number;
}

const props = defineProps<{
    value: any[];
    columns: Column[];
    keyField: string;
    bufferSize?: number;
    stripedRows?: boolean;
    loading?: boolean;
}>();

const emit = defineEmits(['row-dblclick', 'row-contextmenu']);

const containerRef = ref<HTMLElement | null>(null);
const bufferSize = props.bufferSize || 5;
const startIndex = ref(0);
const endIndex = ref(0);
const scrollTop = ref(0);

const ROW_HEIGHT = 40; // Fixed row height

const totalHeight = computed(() => props.value.length * ROW_HEIGHT);

const visibleItems = computed(() => {
    return props.value.slice(startIndex.value, endIndex.value);
});

const startOffset = computed(() => startIndex.value * ROW_HEIGHT);

const throttledUpdateVisibleRange = throttle(updateVisibleRange, 8);

function onScroll() {
    if (containerRef.value) {
        scrollTop.value = containerRef.value.scrollTop;
        throttledUpdateVisibleRange();
    }
}

function updateVisibleRange() {
    if (!containerRef.value) return;

    const containerHeight = containerRef.value.clientHeight;
    const scrollTop = containerRef.value.scrollTop;

    const start = Math.floor(scrollTop / ROW_HEIGHT);
    const visibleCount = Math.ceil(containerHeight / ROW_HEIGHT);
    const end = Math.min(props.value.length, start + visibleCount + bufferSize);

    startIndex.value = Math.max(0, start - bufferSize);
    endIndex.value = end;
}

// Watch for changes in value (data)
watch(() => props.value.length, updateVisibleRange);

// Update visible range when container size changes
watch(() => containerRef.value?.clientHeight, updateVisibleRange);

onMounted(() => {
    updateVisibleRange();
    window.addEventListener('resize', updateVisibleRange);
});

onUnmounted(() => {
    window.removeEventListener('resize', updateVisibleRange);
});

function onRowDblClick(item: any, event: MouseEvent) {
    emit('row-dblclick', { item, event });
}

function onRowContextMenu(item: any, event: MouseEvent) {
    event.preventDefault();
    emit('row-contextmenu', { item, event });
}

function getColumnStyle(column: Column) {
    return column.width ? { width: typeof column.width === 'number' ? `${column.width}px` : column.width } : {};
}
</script>

<style scoped>
.custom-datatable {
    height: 100%;
    overflow-y: auto;
    position: relative;
}

.content {
    min-height: 100%;
}

.header {
    background-color: white;
    padding: 1rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.virtual-list {
    position: relative;
}

.virtual-list-inner {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
}

table {
    width: 100%;
    table-layout: fixed;
    border-collapse: separate;
    border-spacing: 0;
    font-size: 14px;
}

thead {
    position: sticky;
    top: 0;
    background-color: #f4f4f4;
    z-index: 1;
}

th,
td {
    padding: 10px 16px;
    text-align: left;
    border-bottom: 1px solid #eee;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

th {
    border-top: 1px solid #eee;
    font-weight: bold;
}

.data-row {
    box-sizing: border-box;
}

tbody tr:hover {
    background-color: #f8f8f8;
}

.striped {
    background-color: #f8f8f8;
}

.loading-container,
.empty-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
    font-size: 1.2em;
    color: #666;
}

.loading,
.empty {
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 4px;
}
</style>