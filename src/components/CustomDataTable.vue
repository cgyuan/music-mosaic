<template>
    <div class="custom-datatable" ref="containerRef" @scroll="onScroll">
        <div class="content">
            <div class="header" v-if="showHeader && $slots.header">
                <slot name="header" />
            </div>
            <table :class="{ 'striped': stripedRows }">
                <thead v-if="showHeader">
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
                                :key="item[keyField].toString() + (startIndex + localIndex)" class="data-row"
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
            <slot name="footer" v-if="$slots.footer"/>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch, onMounted, onUnmounted } from 'vue';
import throttle from 'lodash.throttle';

interface Column {
    field: string;
    header: string;
    width?: string | number;
}

interface ScrollOptions {
    smooth?: boolean;
    position?: 'start' | 'center' | 'end';
}

const props = defineProps<{
    value: any[];
    columns: Column[];
    keyField: string;
    bufferSize?: number;
    stripedRows?: boolean;
    loading?: boolean;
    showHeader?: boolean;
}>();

const emit = defineEmits(['row-dblclick', 'row-contextmenu']);

const containerRef = ref<HTMLElement | null>(null);
const rowHeights = ref<number[]>([]);
const rowRefs = ref<Record<number, HTMLElement>>({});
const bufferSize = props.bufferSize || 5;
const startIndex = ref(0);
const endIndex = ref(0);
const scrollTop = ref(0);

const estimatedRowHeight = 61; // Default estimated row height

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

const throttledUpdateVisibleRange = throttle(updateVisibleRange, 8);

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
        throttledUpdateVisibleRange();
    }
}

let previousValueLength = 0;

// Modify the watch effect
watch(() => props.value, (newValue, oldValue) => {
    if (newValue.length > previousValueLength) {
        // New items were added
        const addedItemsCount = newValue.length - previousValueLength;
        nextTick(() => {
            // Extend rowHeights array for new items
            rowHeights.value = rowHeights.value.concat(new Array(addedItemsCount).fill(estimatedRowHeight));
            updateVisibleRange();
        });
    } else if (newValue.length < previousValueLength) {
        // Items were removed
        rowHeights.value = rowHeights.value.slice(0, newValue.length);
        updateVisibleRange();
    } else {
        // The number of items didn't change, but their content might have
        updateVisibleRange();
    }
    previousValueLength = newValue.length;
}, { deep: true });

function updateVisibleRange() {
    if (!containerRef.value) return;

    const containerHeight = containerRef.value.clientHeight;
    const scrollTop = containerRef.value.scrollTop;

    let start = findStartIndex(scrollTop);
    let end = start;
    let sum = 0;

    const preRenderBuffer = Math.ceil(containerHeight / estimatedRowHeight) * 2;

    for (let i = start; i < props.value.length; i++) {
        sum += rowHeights.value[i] || estimatedRowHeight;
        if (sum > containerHeight + preRenderBuffer * estimatedRowHeight) {
            end = i + 1;
            break;
        }
    }

    if (end === start) end = Math.min(props.value.length, start + preRenderBuffer);

    start = Math.max(0, start - preRenderBuffer);
    end = Math.min(props.value.length, end + preRenderBuffer);

    if (scrollTop + containerHeight >= totalHeight.value - 20) {
        end = props.value.length;
        start = Math.max(0, end - preRenderBuffer * 2);
    }

    startIndex.value = start;
    endIndex.value = end;

    updateTotalHeight();
}

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

const showHeader = computed(() => props.showHeader !== undefined ? props.showHeader : true);

function scrollToIndex(index: number, options: ScrollOptions = {}) {
    if (index < 0 || index >= props.value.length) {
        console.warn('Invalid index');
        return;
    }

    const { smooth = false, position = 'start' } = options;

    const offset = rowHeights.value
        .slice(0, index)
        .reduce((sum, height) => sum + (height || estimatedRowHeight), 0);

    if (containerRef.value) {
        let targetScrollTop = offset;

        if (position === 'center') {
            const containerHeight = containerRef.value.clientHeight;
            const rowHeight = rowHeights.value[index] || estimatedRowHeight;
            targetScrollTop = offset - (containerHeight / 2) + (rowHeight / 2);
        } else if (position === 'end') {
            const containerHeight = containerRef.value.clientHeight;
            const rowHeight = rowHeights.value[index] || estimatedRowHeight;
            targetScrollTop = offset - containerHeight + rowHeight;
        }

        targetScrollTop = Math.max(0, Math.min(targetScrollTop, totalHeight.value - containerRef.value.clientHeight));

        if (smooth) {
            containerRef.value.scrollTo({
                top: targetScrollTop,
                behavior: 'smooth'
            });
        } else {
            containerRef.value.scrollTop = targetScrollTop;
        }

        // Add this line to update the visible range after scrolling
        // updateVisibleRange();
    }
}

// Expose methods to parent components
defineExpose({ scrollToIndex, updateVisibleRange });
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
    padding: 1rem;
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
    color: var(--textColor);
}

thead {
    position: sticky;
    top: 0;
    /* background-color: #f4f4f4; */
    z-index: 1;
    display: contents;  /* This allows the header to scroll with the content */
}

th,
td {
    padding: 10px 16px;
    text-align: left;
    /* border-bottom: 1px solid var(--dividerColor); */
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

th {
    /* border-top: 1px solid var(--dividerColor); */
    font-weight: bold;
    border-bottom: 1px solid var(--dividerColor);
}

.data-row {
    box-sizing: border-box;
}

tbody tr:hover {
    background-color: var(--listHoverColor);
}

.striped {
    background-color: var(--listHoverColor);
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