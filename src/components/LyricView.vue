<template>
  <AnimatedDiv class="music-detail-container background-color animate__animated" :show-if="showLyricView"
    mount-class-name="animate__slideInUp" unmount-class-name="animate__slideOutDown" @animationend="handleAnimationEnd">
    <div class="music-detail-background" :style="{
      backgroundImage: `url(${currentTrack?.artwork ?? albumCover})`
    }"></div>
    <div class="music-title">{{ currentTrack?.title }}</div>
    <div class="music-info">
      <span>{{ currentTrack?.artist || '未知作者' }}</span>
      <span v-if="currentTrack?.album">-　{{ currentTrack?.album }}</span>
      <Tag v-if="props.platform" :fill="true">{{ props.platform }}</Tag>
    </div>

    <div class="music-body">
      <div class="music-album-options">
        <img class="music-album" :src="currentTrack?.artwork || currentTrack?.coverImg || albumCover"
          :alt="currentTrack?.title">
      </div>

      <div class="lyric-container" ref="lyricsContainer">
        <div v-for="(line, index) in parsedLyrics" :key="index"
          :class="['lyric-item ', { 'active': index === currentLineIndex }]"
          :data-highlight="index === currentLineIndex"
          :ref="(el) => { if (el && index === currentLineIndex) currentLineRef = el as HTMLElement }">
          <p>{{ line.text }}</p>
          <p v-if="showTranslation && line.translation" class="translation">{{ line.translation }}</p>
        </div>
      </div>
    </div>
    <div class="hide-music-detail" @click="close">
      <SvgAsset icon-name="chevron-down" :size="28" />
    </div>
  </AnimatedDiv>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { usePlayerStore } from '@/store/playerStore';
import albumCover from '@/assets/imgs/album-cover.jpg';
import { usePluginStore } from '@/store/pluginStore';
import { storeToRefs } from 'pinia';
import SvgAsset from './SvgAsset.vue';
import AnimatedDiv from './AnimatedDiv.vue';
import { useUIStore } from '@/store/uiStore';
import Tag from './Tag.vue';

const uiStore = useUIStore();
const { showLyricView } = storeToRefs(uiStore);

const props = defineProps<{
  platform?: string,
  showTranslation?: boolean
}>();

const emit = defineEmits(['close']);

const playerStore = usePlayerStore();
const pluginStore = usePluginStore();
const { lyricSupportPlugins } = storeToRefs(pluginStore);

const currentTrack = computed(() => playerStore.currentTrack);
const currentTime = computed(() => playerStore.currentTime);

const parsedLyrics = ref<Array<{ time: number, text: string, translation?: string }>>([]);
const currentLineIndex = ref(0);
const currentLineRef = ref<HTMLElement | null>(null);
const lyricsContainer = ref<HTMLElement | null>(null);

const loadAndRenderLyric = async () => {
  let plugin = pluginStore.getPluginByPlatform(props.platform || '');
  if (!plugin && lyricSupportPlugins.value.length > 0) {
    plugin = lyricSupportPlugins.value[0];
  }
  if (plugin && currentTrack.value) {
    try {
      const res = await plugin.getLyric!(currentTrack.value);
      if (res?.rawLrc) {
        const lyrics = parseLyrics(res.rawLrc);
        const translations = res.translation ? parseLyrics(res.translation) : [];

        // Merge lyrics and translations based on timestamps
        parsedLyrics.value = lyrics.map(lyric => {
          const translation = translations.find(t => t.time === lyric.time);
          return {
            ...lyric,
            translation: translation?.text
          };
        });
      }
      scrollToCurrentLine();
    } catch (error) {
      console.error("getLyric error", error);
    }
  }
}

onMounted(() => {
  loadAndRenderLyric();
  // scroll to current line
  scrollToCurrentLine();
});

watch(currentTrack, () => {
  parsedLyrics.value = [];
  nextTick(() => {
    loadAndRenderLyric();
  });
});

const parseLyrics = (rawLyrics: string) => {
  const lines = rawLyrics.split('\n');
  return lines.map(line => {
    // Match [mm:ss.xx] format
    const match1 = line.match(/\[(\d{2}):(\d{2}\.\d{2,3})\](.*)/);
    if (match1) {
      const [, minutes, seconds, text] = match1;
      const time = parseInt(minutes) * 60 + parseFloat(seconds);
      return { time, text: text.trim() };
    }

    // Match [ss.ss] format
    const match2 = line.match(/\[(\d+\.\d+)\](.*)/);
    if (match2) {
      const [, seconds, text] = match2;
      const time = parseFloat(seconds);
      return { time, text: text.trim() };
    }

    return null;
  }).filter((line): line is { time: number; text: string } => line !== null);
};

watch(currentTime, (newTime) => {
  const index = parsedLyrics.value.findIndex((line, i) => {
    const nextLine = parsedLyrics.value[i + 1];
    return line.time <= newTime && (!nextLine || nextLine.time > newTime);
  });
  if (index !== -1 && index !== currentLineIndex.value) {
    currentLineIndex.value = index;
    scrollToCurrentLine();
  }
});

// const scrollToCurrentLine = () => {
//   if (currentLineRef.value) {
//     currentLineRef.value.scrollIntoView({
//       block: 'center',
//       behavior: 'smooth'
//     });
//   }
// };

const scrollToCurrentLine = () => {
  if (currentLineRef.value && lyricsContainer.value) {
    const offset = 55; 
    const lineRect = currentLineRef.value.getBoundingClientRect();
    const containerRect = lyricsContainer.value.getBoundingClientRect();
    
    // 计算居中位置，并加上偏移量
    const targetScroll = lyricsContainer.value.scrollTop + 
      lineRect.top - 
      containerRect.top - 
      (containerRect.height - lineRect.height) / 2 + 
      offset;

    lyricsContainer.value.scrollTo({
      top: targetScroll,
      behavior: 'smooth'
    });
  }
};

const close = () => {
  showLyricView.value = false;
};

const handleAnimationEnd = (event: AnimationEvent) => {
  if (!showLyricView.value) {
    emit('close');
  }
};
</script>

<style scoped>
.music-detail-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
}

.music-detail-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-size: cover;
  background-repeat: no-repeat;
  position: absolute;
  filter: blur(50px);
  opacity: 0.5;
  mask-image: linear-gradient(to bottom, #fff, transparent);
  -webkit-mask-image: linear-gradient(to bottom, #fff, transparent);
  z-index: -1;
  transition: background-image ease 300ms;
}

.music-title {
  text-align: center;
  font-size: 2rem;
  font-weight: 500;
  margin-top: 1.5rem;
  color: var(--textColor);
}

.music-info {
  display: flex;
  width: 70vw;
  font-size: 1.2rem;
  justify-content: center;
  color: var(--textColor);
}

.music-info span {
  opacity: 0.8;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  margin-right: 1rem;
  font-weight: 300;
}

.music-body {
  display: flex;
  gap: 20px;
  flex-grow: 1;
  overflow: hidden;
  max-width: 60vw;
}

.music-album-options {
  width: 260px;
  height: 260px;
  margin-top: 70px;
  margin-right: 96px;
  object-fit: cover;
  -webkit-user-drag: none;
}

.music-album-options .music-album {
  width: 260px;
  height: 260px;
  border-radius: 16px;
  object-fit: cover;
}

.lyric-container {
  width: 400px;
  flex-grow: 1;
  overflow-y: auto;
  margin-top: 30px;
  height: 80%;
  display: flex;
  padding-top: 20%;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
  scrollbar-width: none;
  /* For Firefox */
  -ms-overflow-style: none;
}

.lyric-container::-webkit-scrollbar {
  display: none;
}

.lyric-item {
  font-size: 16px;
  text-align: center;
  transition: all 0.3s ease;
  color: var(--textColor);
}

.lyric-item p {
  margin: 6px 0;
}

.lyric-item.active {
  font-size: 22px;
  font-weight: bold;
  color: var(--primaryColor);
}

.lyric-item .translation {
  font-size: 14px;
  color: var(--textColor);
  opacity: 0.7;
  margin-top: 5px;
}

.hide-music-detail {
  position: absolute;
  top: 70px;
  right: 30px;
  cursor: pointer;
  z-index: 2;
  color: var(--textColor);
}
</style>