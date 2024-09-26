<template>
    <div class="empty-state">
        <Loading v-if="loading" />
        <div class="empty-text" v-else>什么都没有呀~~~</div>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    loading: Boolean
}>()
</script>

<style scoped>
.empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    padding: 2rem;
    color: #999;
}
</style>