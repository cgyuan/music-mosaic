import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { usePluginStore } from './pluginStore';

export const usePlayerStore = defineStore('player', () => {
    const pluginStore = usePluginStore();
    const currentTrack = ref<IMusic.IMusicItem | null>(null);
    const playlist = ref<IMusic.IMusicItem[]>([]);
    const isPlaying = ref(false);
    const currentTime = ref(0);
    const duration = ref(0);
    const audioElement = ref<HTMLAudioElement | null>(null);

    const progress = computed(() => {
        if (duration.value === 0) return 0;
        return (currentTime.value / duration.value) * 100;
    });

    function setCurrentTrack(track: IMusic.IMusicItem) {
        currentTrack.value = track;
    }

    function setPlaylist(newPlaylist: IMusic.IMusicItem[]) {
        playlist.value = newPlaylist;
    }

    async function setCurrentTrackAndPlay(track: IMusic.IMusicItem) {
        console.log('setCurrentTrackAndPlay', track);
        setCurrentTrack(track);
        await fetchAndPlayTrack(track);
    }

    async function fetchAndPlayTrack(track: IMusic.IMusicItem) {
        const currentPlugin = pluginStore.getCurrentPlugin();
        if (currentPlugin && currentPlugin.getMediaSource) {
            try {
                const mediaSource = await currentPlugin.getMediaSource(track, 'standard');
                console.log('mediaSource', mediaSource);
                if (mediaSource && mediaSource.url) {
                    setAudioSrc(mediaSource.url);
                    play();
                } else {
                    console.error('No valid media source found');
                }
            } catch (error) {
                console.error('Error fetching media source:', error);
            }
        }
    }

    function setAudioSrc(src: string) {
        if (!audioElement.value) {
            audioElement.value = new Audio();
            audioElement.value.addEventListener('timeupdate', () => {
                currentTime.value = audioElement.value?.currentTime || 0;
            });
            audioElement.value.addEventListener('loadedmetadata', () => {
                duration.value = audioElement.value?.duration || 0;
            });
            audioElement.value.addEventListener('ended', () => {
                nextTrack();
            });
        }
        audioElement.value.src = src;
    }

    function play() {
        audioElement.value?.play();
        isPlaying.value = true;
    }

    function pause() {
        audioElement.value?.pause();
        isPlaying.value = false;
    }

    function seek(value: number) {
        if (audioElement.value) {
            const seekTime = (value / 100) * duration.value;
            audioElement.value.currentTime = seekTime;
        }
    }

    async function nextTrack() {
        const currentIndex = playlist.value.findIndex(track => track.id === currentTrack.value?.id);
        if (currentIndex < playlist.value.length - 1) {
            const nextTrack = playlist.value[currentIndex + 1];
            await setCurrentTrackAndPlay(nextTrack);
        }
    }

    async function previousTrack() {
        const currentIndex = playlist.value.findIndex(track => track.id === currentTrack.value?.id);
        if (currentIndex > 0) {
            const prevTrack = playlist.value[currentIndex - 1];
            await setCurrentTrackAndPlay(prevTrack);
        }
    }

    return {
        currentTrack,
        playlist,
        isPlaying,
        currentTime,
        duration,
        progress,
        setCurrentTrack,
        setPlaylist,
        setCurrentTrackAndPlay,
        play,
        pause,
        seek,
        nextTrack,
        previousTrack,
    };
});
