<template>
    <div v-if="state === RequestStateCode.PENDING_REST_PAGE" class="load-more">
        <span class="loading-icon"></span>
        加载中...
    </div>
    <div v-else-if="state === RequestStateCode.PARTLY_DONE" class="load-more" @click="onLoadMore">加载更多</div>
    <div v-else-if="state === RequestStateCode.FINISHED" class="no-more-data">~~~ 到底啦 ~~~</div>
</template>

<script setup lang="ts">
import { RequestStateCode } from '@/common/constant'
defineProps<{
    state: RequestStateCode,
    onLoadMore: () => void
}>()

</script>

<style scoped>
.load-more {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    cursor: pointer;
    color: var(--textColor);
}

.load-more:hover {
    color: var(--primaryColor);
}

.loading-icon {
    display: inline-block;
    width: 20px;
    height: 20px;
    margin-right: 10px;
    border: 2px solid var(--primaryColor);
    border-radius: 50%;
    border-top-color: transparent;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.no-more-data {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
}
</style>