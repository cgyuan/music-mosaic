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

    function init() {
        if (currentTrack.value) {
            setAudioSrc(currentTrack.value);
        }
    }

    function setCurrentTrack(track: IMusic.IMusicItem) {
        currentTrack.value = track;
    }

    function setPlaylist(newPlaylist: IMusic.IMusicItem[]) {
        playlist.value = newPlaylist;
    }

    async function setCurrentTrackAndPlay(track: IMusic.IMusicItem) {
        setCurrentTrack(track);
        await setAudioSrc(track);
        play();
    }


    async function getMediaSource(track: IMusic.IMusicItem) {
        if (track.url) {
            return track.url;
        }
        const plugin = pluginStore.getPluginByPlatform(track.platform);
        if (plugin && plugin.getMediaSource) {
            try {
                const mediaSource = await plugin.getMediaSource(track, 'standard');
                console.log('mediaSource', mediaSource);
                if (mediaSource && mediaSource.url) {
                    return mediaSource.url;
                } else {
                    console.error('No valid media source found');
                    return null;
                }
            } catch (error) {
                console.error('Error fetching media source:', error);
                return null;
            }
        }
        return null;
    }

    async function setAudioSrc(track: IMusic.IMusicItem) {
        const src = await getMediaSource(track);
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
        if (src) {
            audioElement.value.src = src;
        }
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

    function clearPlaylist() {
        playlist.value = [];
    }

    function removeFromPlaylist(index: number) {
        playlist.value.splice(index, 1);
    }

    return {
        init,
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
        clearPlaylist,
        removeFromPlaylist,
    };
});
