<template>
  <div
    v-show="shouldMount"
    :class="[props.class, showIf ? props.mountClassName : props.unmountClassName]"
    @animationend="handleAnimationEnd"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  // Show condition
  showIf?: boolean
  // Mount animation class
  mountClassName?: string
  // Unmount animation class
  unmountClassName?: string
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  showIf: true
})

const emit = defineEmits(['animationend'])
const shouldMount = ref(false)

watch(
  () => props.showIf,
  (newVal) => {
    if (newVal) {
      shouldMount.value = true
    } else if (!props.unmountClassName) {
      shouldMount.value = false
    }
  },
  { immediate: true }
)

const handleAnimationEnd = (event: AnimationEvent) => {
  emit('animationend', event)
  if (!props.showIf) {
    // If showIf is false, current animation is unmount animation
    shouldMount.value = false
  } else {
    shouldMount.value = true
  }
}
</script>
