<template>
  <div class="lyric-detail" :class="{ 'show': show }">
    <div class="background-overlay" :style="{
      backgroundImage: `url(${currentTrack?.artwork || currentTrack?.coverImg || albumCover})`
    }"></div>
    <div class="lyric-container">
      <h1 class="song-title">{{ currentTrack?.title }}</h1>
      <p class="artists">{{ currentTrack?.artist }}</p>

      <div class="content-wrapper">
        <div class="album-cover">
          <img :src="currentTrack?.artwork || currentTrack?.coverImg || albumCover" :alt="currentTrack?.title">
        </div>

        <div class="lyrics-content" ref="lyricsContainer">
          <div v-for="(line, index) in parsedLyrics" :key="index"
            :class="['lyric-line', { 'active': index === currentLineIndex }]"
            :ref="(el) => { if (el && index === currentLineIndex) currentLineRef = el as HTMLElement }">
            <p>{{ line.text }}</p>
            <p v-if="showTranslation && line.translation" class="translation">{{ line.translation }}</p>
          </div>
        </div>
      </div>
    </div>
    <Button class="p-button-rounded p-button-text close-button" @click="close">
      <SvgAsset icon-name="chevron-down" />
    </Button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { usePlayerStore } from '@/store/playerStore';
import Button from 'primevue/button';
import albumCover from '@/assets/imgs/album-cover.jpg';
import { usePluginStore } from '@/store/pluginStore';
import { storeToRefs } from 'pinia';
import SvgAsset from './SvgAsset.vue';

const props = defineProps<{
  platform?: string,
  show: boolean,
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
    } catch (error) {
      console.error("getLyric error", error);
    }
  }
}

onMounted(() => {
  loadAndRenderLyric();
});

watch(currentTrack, () => {
  parsedLyrics.value = [];
  loadAndRenderLyric();
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

const scrollToCurrentLine = () => {
  if (currentLineRef.value && lyricsContainer.value) {
    const containerHeight = lyricsContainer.value.clientHeight;
    const lineTop = currentLineRef.value.offsetTop;
    const lineHeight = currentLineRef.value.clientHeight;
    lyricsContainer.value.scrollTo({
      top: lineTop - containerHeight * 0.6 + lineHeight / 2,
      behavior: 'smooth'
    });
  }
};

const close = () => {
  emit('close');
};
</script>

<style scoped>
.lyric-detail {
  position: fixed;
  bottom: -100%;
  left: 0;
  right: 0;
  height: calc(100vh - 57px - 68px);
  transition: bottom 0.3s ease-in-out;
  background: white;
  z-index: 998;
  display: flex;
  width: 100vw;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
}

.background-image {
  background-size: cover;
  background-position: center;
}

.lyric-detail.show {
  bottom: 68px;
}

.background-overlay {
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

.lyric-container {
  position: relative;
  max-width: 800px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: 10px;
  padding: 20px;
  z-index: 1;
}

.song-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 5px;
  text-align: center;
  color: #333;
}

.artists {
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;
  text-align: center;
}

.content-wrapper {
  display: flex;
  gap: 20px;
  flex-grow: 1;
  overflow: hidden;
}

.album-cover {
  display: flex;
  justify-content: center;
  align-items: center;
}

.album-cover img {
  width: 300px;
  height: 300px;
  object-fit: cover;
  border-radius: 8px;
}

.lyrics-content {
  min-width: 400px;
  flex-grow: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
  scrollbar-width: none;
  /* For Firefox */
  -ms-overflow-style: none;
  /* For Internet Explorer and Edge */
}

.lyrics-content::-webkit-scrollbar {
  display: none;
  /* For Chrome, Safari, and Opera */
}

.lyric-line {
  font-size: 16px;
  text-align: center;
  transition: all 0.3s ease;
}

.lyric-line p {
  margin: 6px 0;
}

.lyric-line.active {
  font-size: 22px;
  font-weight: bold;
  color: #f0a050;
}

.lyric-line .translation {
  font-size: 14px;
  color: #999;
  margin-top: 5px;
}

.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;
}
</style>