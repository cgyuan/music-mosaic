<template>
  <div class="container">
    <h1>设置</h1>
    
    <nav ref="navRef" class="tabs">
      <ul>
        <li v-for="section in tabSections" :key="section.id">
          <button
            :class="{ active: activeTab === section.id }"
            @click="scrollToSection(section.id)"
          >
            {{ section.label }}
          </button>
        </li>
      </ul>
    </nav>

    <div class="sections">
      <section v-for="section in tabSections" :key="section.id" :ref="el => { if (el) sectionRefs[section.id] = el as HTMLElement }">
        <h3>{{ section.label }}</h3>
        <component :is="section.component" />
      </section>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'
import type { Component } from 'vue'
import PlayMusic from './sections/PlayMusic.vue'
import Normal from './sections/Normal.vue'
interface TabSection {
  id: string;
  label: string;
  component: Component;
}

const tabSections: TabSection[] = [
  { id: 'general', label: '常规', component: Normal },
  { id: 'playMusic', label: '播放', component: PlayMusic }
]

const activeTab = ref<string>('account')
const sectionRefs = ref<{ [key: string]: HTMLElement | null }>({})
const navRef = ref<HTMLElement | null>(null)


const handleScroll = () => {
  const navHeight = navRef.value?.offsetHeight || 0

  let currentSection = tabSections[0].id

  for (const section of tabSections) {
    const element = sectionRefs.value[section.id]
    if (element) {
      const { top } = element.getBoundingClientRect()
      if (top <= navHeight + 50) {
        currentSection = section.id
      }
    }
  }

  activeTab.value = currentSection
}

const scrollToSection = (sectionId: string) => {
  const element = sectionRefs.value[sectionId]
  const navHeight = navRef.value?.offsetHeight || 0
  const container = document.querySelector('.container')
  
  if (element && container) {
    // Get the element's position relative to the container
    const containerRect = container.getBoundingClientRect()
    const elementRect = element.getBoundingClientRect()
    const relativeTop = elementRect.top - containerRect.top + container.scrollTop
    
    // Scroll the container, accounting for nav height and adding a small offset
    container.scrollTo({
      top: relativeTop - navHeight + 10, // 24px matches your container padding
      behavior: 'smooth'
    })
  }
}

onMounted(() => {
  const container = document.querySelector('.container')
  if (container) {
    container.addEventListener('scroll', handleScroll)
  }
  handleScroll() // Initial check
})

onUnmounted(() => {
  const container = document.querySelector('.container')
  if (container) {
    container.removeEventListener('scroll', handleScroll)
  }
})
</script>

<style scoped>
.container {
  /* max-width: 1200px; */
  margin: 0 auto;
  padding: 0 24px;
  font-family: Arial, sans-serif;
  height: 100%;
  overflow-y: auto;
  box-sizing: border-box;
}

h1 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 24px;
}

.tabs {
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 10;
  /* margin-bottom: 24px; */
  border-bottom: 1px solid #e5e5e5;
}

.tabs ul {
  display: flex;
  list-style-type: none;
  padding: 0;
  margin: 0;
  overflow-x: auto;
}

.tabs button {
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 500;
  background: none;
  border: none;
  cursor: pointer;
  position: relative;
}

.tabs button.active {
  color: #f0a050;
}

.tabs button.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #f0a050;
}

.sections {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-bottom: 30px;
}

</style>