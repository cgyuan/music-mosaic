<template>
    <component
      :is="svgComponent"
      :title="title"
      :style="{
        width: size + 'px',
        height: size + 'px',
        color: color,
      }"
    />
  </template>
  
  <script setup lang="ts">
  import { shallowRef, watchEffect, markRaw } from 'vue';
  
  export type SvgAssetIconNames =
    | "album"
    | "array-download-tray"
    | "arrow-left-end-on-rectangle"
    | "cd"
    | "check"
    | "check-circle"
    | "chevron-double-down"
    | "chevron-double-up"
    | "chevron-down"
    | "chevron-left"
    | "chevron-right"
    | "clock"
    | "code-bracket-square"
    | "cog-8-tooth"
    | "dashboard-speed"
    | "document-plus"
    | "fire"
    | "folder-open"
    | "font-size-larger"
    | "font-size-smaller"
    | "headphone"
    | "heart-outline"
    | "heart"
    | "identification"
    | "language"
    | "list-bullet"
    | "lock-closed"
    | "lock-open"
    | "logo"
    | "lyric"
    | "lyric-en"
    | "magnifying-glass"
    | "minus"
    | "motion-play"
    | "musical-note"
    | "pause"
    | "pencil-square"
    | "picture-in-picture-line"
    | "play"
    | "playlist"
    | "plus"
    | "plus-circle"
    | "question-mark-circle"
    | "repeat-song-1"
    | "repeat-song"
    | "rolling-1s"
    | "shuffle"
    | "skip-left"
    | "skip-right"
    | "sort"
    | "sort-asc"
    | "sort-desc"
    | "sparkles"
    | "speaker-wave"
    | "speaker-x-mark"
    | "trash"
    | "trophy"
    | "t-shirt-line"
    | "user"
    | "lq"
    | "sd"
    | "hq"
    | "sq"
    | "x-mark";
  
  interface Props {
    iconName: SvgAssetIconNames;
    size?: number;
    title?: string;
    color?: string;
  }
  
  const props = withDefaults(defineProps<Props>(), {
    size: 20,
    title: '',
    color: 'currentColor',
  });
  
  const svgComponent = shallowRef<any>(null);
  
  watchEffect(async () => {
    try {
      const module = await import(`@/assets/icons/${props.iconName}.svg`);
      svgComponent.value = markRaw(module.default);
    } catch (error) {
      console.error(`Failed to load SVG icon: ${props.iconName}`, error);
    }
  });
  </script>