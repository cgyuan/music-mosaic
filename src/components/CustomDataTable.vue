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
                                :ref="el => { if (el) setRowRef(startIndex + localIndex, el as HTMLElement) }">
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
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';

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
const rowHeights = ref<number[]>([]);
const rowRefs = ref<Record<number, HTMLElement>>({});
const bufferSize = props.bufferSize || 5;
const startIndex = ref(0);
const endIndex = ref(0);
const scrollTop = ref(0);

const estimatedRowHeight = 46; // Default estimated row height

const totalHeight = computed(() => {
    const measuredHeight = rowHeights.value.reduce((sum, height) => sum + (height || estimatedRowHeight), 0);
    const remainingItems = props.value.length - rowHeights.value.length;
    return measuredHeight + remainingItems * estimatedRowHeight;
});

const visibleItems = computed(() => {
    return props.value.slice(startIndex.value, endIndex.value);
});

const startOffset = computed(() => {
    return rowHeights.value.slice(0, startIndex.value).reduce((sum, height) => sum + (height || estimatedRowHeight), 0);
});

function setRowRef(index: number, el: HTMLElement) {
    rowRefs.value[index] = el;
    nextTick(() => {
        const height = el.offsetHeight;
        if (rowHeights.value[index] !== height) {
            rowHeights.value[index] = height;
            updateTotalHeight();
        }
    });
}

function updateTotalHeight() {
    if (containerRef.value) {
        const newTotalHeight = totalHeight.value;
        containerRef.value.style.setProperty('--total-height', `${newTotalHeight}px`);
    }
}

function findStartIndex(scrollTop: number): number {
    if (scrollTop <= 0) {
        return 0;
    }
    let low = 0;
    let high = props.value.length - 1;

    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const offset = rowHeights.value.slice(0, mid).reduce((sum, height) => sum + (height || estimatedRowHeight), 0);

        if (offset < scrollTop) {
            low = mid + 1;
        } else if (offset > scrollTop) {
            high = mid - 1;
        } else {
            return mid;
        }
    }

    return Math.max(0, low - 1);
}

function onScroll() {
    if (containerRef.value) {
        scrollTop.value = containerRef.value.scrollTop;
        requestAnimationFrame(updateVisibleRange);
    }
}

function updateVisibleRange() {
    if (!containerRef.value) return;

    const containerHeight = containerRef.value.clientHeight;
    const scrollTop = containerRef.value.scrollTop;

    let start = findStartIndex(scrollTop);
    let end = start;
    let sum = 0;

    // Find end index
    for (let i = start; i < props.value.length; i++) {
        sum += rowHeights.value[i] || estimatedRowHeight;
        if (sum > containerHeight) {
            end = i + 1;
            break;
        }
    }

    // Ensure we have at least one screenful of items
    if (end === start) end = Math.min(props.value.length, start + Math.ceil(containerHeight / estimatedRowHeight));

    // Add buffer
    start = Math.max(0, start - bufferSize);
    end = Math.min(props.value.length, end + bufferSize);

    // Ensure we're showing the last items when scrolled to the bottom
    if (scrollTop + containerHeight >= totalHeight.value - 20) { // 20px threshold
        end = props.value.length;
        start = Math.max(0, end - Math.ceil(containerHeight / estimatedRowHeight) - bufferSize * 2);
    }

    startIndex.value = start;
    endIndex.value = end;

    updateTotalHeight();
}

// Watch for changes in value (data)
watch(() => props.value.length, () => {
    updateVisibleRange();
});


// Update visible range when data or container size changes
// watch(() => props.value, updateVisibleRange);
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
    height: var(--total-height);
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