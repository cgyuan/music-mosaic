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

    <div class="sections-container">
      <div class="sections">
        <section v-for="section in tabSections" :key="section.id" :ref="el => { if (el) sectionRefs[section.id] = el as HTMLElement }">
          <h3>{{ section.label }}</h3>
          <component :is="section.component" />
        </section>
      </div>
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
  { id: 'playMusic', label: '播放', component: PlayMusic },
]

const activeTab = ref<string>('account')
const sectionRefs = ref<{ [key: string]: HTMLElement | null }>({})
const navRef = ref<HTMLElement | null>(null)


const handleScroll = () => {
  const sectionsEl = document.querySelector('.sections')
  if (!sectionsEl) return

  let currentSection = tabSections[0].id
  const containerRect = sectionsEl.getBoundingClientRect()
  const containerTop = containerRect.top
  const threshold = 1 // Distance from top where section becomes active

  // Find the last section that has crossed the threshold
  for (const section of tabSections) {
    const element = sectionRefs.value[section.id]
    if (element) {
      const { top } = element.getBoundingClientRect()
      const relativeTop = top - containerTop
      
      if (relativeTop <= threshold) {
        currentSection = section.id
      }
    }
  }

  activeTab.value = currentSection
}

const scrollToSection = (sectionId: string) => {
  const element = sectionRefs.value[sectionId]
  const sectionsEl = document.querySelector('.sections')
  
  if (element && sectionsEl) {
    // Get the element's position relative to the sections container
    const sectionsRect = sectionsEl.getBoundingClientRect()
    const elementRect = element.getBoundingClientRect()
    const relativeTop = elementRect.top - sectionsRect.top + sectionsEl.scrollTop
    
    // Scroll the sections container
    sectionsEl.scrollTo({
      top: relativeTop,
      behavior: 'smooth'
    })
  }
}

onMounted(() => {
  const sectionsEl = document.querySelector('.sections')
  if (sectionsEl) {
    sectionsEl.addEventListener('scroll', handleScroll)
  }
  handleScroll() // Initial check
})

onUnmounted(() => {
  const sectionsEl = document.querySelector('.sections')
  if (sectionsEl) {
    sectionsEl.removeEventListener('scroll', handleScroll)
  }
})
</script>

<style scoped>
.container {
  margin: 0 auto;
  padding: 0 24px;
  font-family: Arial, sans-serif;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  color: var(--textColor);
}

h1 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 24px;
}

.tabs {
  border-bottom: 1px solid var(--dividerColor);
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
  color: var(--textColor);
  opacity: 0.7;
}

.tabs button.active {
  color: var(--primaryColor);
  opacity: 1;
}

.tabs button.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background-color: var(--primaryColor);
}

.sections-container {
  flex: 1;
  overflow: hidden;
}

.sections {
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-bottom: 30px;
}

</style>