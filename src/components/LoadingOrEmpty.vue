<template>
    <div class="loading-or-empty">
        <Loading v-if="loading" />
        <Empty v-else />
    </div>
</template>

<script setup lang="ts">
defineProps<{
    loading: Boolean
}>()
</script>

<style scoped>
.loading-or-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    padding: 2rem;
}
</style>