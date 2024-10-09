import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { usePluginStore } from './pluginStore';
import { RepeatMode } from '@/components/NowPlaying/enum';
import { addToRecentlyPlaylist } from '@/hooks/useRecentPlayed'

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

    const volumeValue = ref(1); // Default volume is 1 (100%)

    const volume = computed({
        get: () => volumeValue.value,
        set: (value) => {
            volumeValue.value = value;
            if (audioElement.value) {
                audioElement.value.volume = value;
            }
        }
    });

    function setVolume(value: number) {
        volume.value = value;
    }

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
        console.log("track", track, plugin);
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
            audioElement.value.volume = volumeValue.value;
            audioElement.value.addEventListener('timeupdate', () => {
                currentTime.value = audioElement.value?.currentTime || 0;
            });
            audioElement.value.addEventListener('loadedmetadata', () => {
                duration.value = audioElement.value?.duration || 0;
            });
            audioElement.value.addEventListener('ended', () => {
                nextTrack();
            });
            audioElement.value.addEventListener('pause', () => {
                isPlaying.value = false;
            });
        }
        audioElement.value.addEventListener('play', () => {
            addToRecentlyPlaylist(JSON.parse(JSON.stringify(track)));
            isPlaying.value = true;
        });
        if (src) {
            audioElement.value.src = src;
        }
    }

    function setPlayNext(track: IMusic.IMusicItem) {
        const currentIndex = playlist.value.findIndex(track => track.id === currentTrack.value?.id);
        if (currentIndex < playlist.value.length - 1) {
            playlist.value.splice(currentIndex + 1, 0, track);
        } else {
            playlist.value.push(track);
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
        if (repeatMode.value === RepeatMode.Loop) {
            // For single track loop, just restart the current track
            if (audioElement.value) {
                audioElement.value.currentTime = 0;
                await play();
            }
            return;
        }

        const currentIndex = playlist.value.findIndex(track => track.id === currentTrack.value?.id);
        let nextTrack: IMusic.IMusicItem | undefined;

        if (currentIndex < playlist.value.length - 1) {
            nextTrack = playlist.value[currentIndex + 1];
        } else if (repeatMode.value === RepeatMode.Queue) {
            // If we're at the end of the queue, start over
            nextTrack = playlist.value[0];
        }

        if (nextTrack) {
            await setCurrentTrackAndPlay(nextTrack);
        } else {
            // If there's no next track and we're not repeating, stop playback
            pause();
        }
    }

    async function previousTrack() {
        const currentIndex = playlist.value.findIndex(track => track.id === currentTrack.value?.id);
        let prevTrack: IMusic.IMusicItem | undefined;

        if (currentIndex > 0) {
            prevTrack = playlist.value[currentIndex - 1];
        } else if (repeatMode.value !== RepeatMode.Loop) {
            // If we're at the start of the queue, go to the last track
            prevTrack = playlist.value[playlist.value.length - 1];
        }

        if (prevTrack) {
            await setCurrentTrackAndPlay(prevTrack);
        } else {
            // If there's no previous track and we're not repeating, restart the current track
            if (audioElement.value) {
                audioElement.value.currentTime = 0;
                await play();
            }
        }
    }

    function clearPlaylist() {
        playlist.value = [];
    }

    function removeFromPlaylist(index: number) {
        playlist.value.splice(index, 1);
    }

    const repeatMode = ref<RepeatMode>(RepeatMode.Queue);

    function setRepeatMode(mode: RepeatMode) {
        repeatMode.value = mode;
        if (mode === RepeatMode.Shuffle) {
            shufflePlaylist();
        }
    }

    function shufflePlaylist() {
        playlist.value = [...playlist.value].sort(() => Math.random() - 0.5);
    }

    function addToPlaylist(track: IMusic.IMusicItem) {
        playlist.value.push(track);
        if (repeatMode.value === RepeatMode.Shuffle) {
            shufflePlaylist();
        }
    }

    return {
        init,
        currentTrack,
        playlist,
        isPlaying,
        currentTime,
        duration,
        volume,
        progress,
        setCurrentTrack,
        setPlaylist,
        setCurrentTrackAndPlay,
        setPlayNext,
        setVolume,
        play,
        pause,
        seek,
        nextTrack,
        previousTrack,
        clearPlaylist,
        removeFromPlaylist,
        repeatMode,
        setRepeatMode,
        addToPlaylist,
    };
});
