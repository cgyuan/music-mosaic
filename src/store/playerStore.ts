import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { usePluginStore } from './pluginStore';
import { RepeatMode } from '@/components/NowPlaying/enum';
import { addToRecentlyPlaylist } from '@/hooks/useRecentPlayed'
import { getQualityOrder, isSameMedia, getInternalData } from '@/common/media-util';
import { invoke } from '@tauri-apps/api/tauri';
import { useSettingsStore } from './settingsStore';
import { isDownloaded } from '@/downloader/downloaded-sheet';
import { addFileScheme } from '@/common/file-util';

export const usePlayerStore = defineStore('player', () => {
    const pluginStore = usePluginStore();
    const currentTrack = ref<IMusic.IMusicItem | null>(null);
    const playlist = ref<IMusic.IMusicItem[]>([]);
    const isPlaying = ref(false);
    const currentTime = ref(0);
    const duration = ref(0);
    const audioElement = ref<HTMLAudioElement | null>(null);
    const mute = ref(false);

    const progress = computed(() => {
        if (duration.value === 0) return 0;
        return (currentTime.value / duration.value) * 100;
    });

    const volumeValue = ref(1); // Default volume is 1 (100%)

    const volume = computed({
        get: () => mute.value ? 0 : volumeValue.value,
        set: (value) => {
            mute.value = value === 0;
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
            syncTrayState();
        }
    }

    function setCurrentTrack(track: IMusic.IMusicItem) {
        currentTrack.value = track;
        syncTrayState();
    }

    function setPlaylist(newPlaylist: IMusic.IMusicItem[]) {
        playlist.value = newPlaylist;
    }

    async function setCurrentTrackAndPlay(track: IMusic.IMusicItem) {
        setCurrentTrack(track);
        await setAudioSrc(track);
        play();
    }

    async function getMediaSourceByQuality(track: IMusic.IMusicItem, quality: IMusic.IQualityKey) {
        const plugin = pluginStore.getPluginByPlatform(track.platform);
        if (plugin && plugin.getMediaSource) {
            try {
                const mediaSource = await plugin.getMediaSource(track, quality);
                console.log('mediaSource', mediaSource);
                if (mediaSource && mediaSource.url) {
                    return mediaSource;
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

    async function getMediaSource(track: IMusic.IMusicItem) {
        if (track.url) {
            return track.url;
        }

        // if the track is already downloaded, return the local file path
        const isDownloadedTrack = isDownloaded(track);
        if (isDownloadedTrack) {
            const downloadData = getInternalData<IMusic.IMusicItemInternalData>(track, 'downloadData');
            if (downloadData?.path) {
                return downloadData.path;
            }
        }

        const plugin = pluginStore.getPluginByPlatform(track.platform);
        console.log("track", track, plugin);
        if (plugin && plugin.getMediaSource) {
            try {
                const settingsStore = useSettingsStore();
                const [defaultQuality, whenQualityMissing] = [
                    "standard" as IMusic.IQualityKey,
                    settingsStore.settings.playMusic?.whenQualityMissing || 'lower'
                ];
                const qualityOrder = getQualityOrder(defaultQuality, whenQualityMissing);
                let realQuality: IMusic.IQualityKey = qualityOrder[0];
                let mediaSource: IPlugin.IMediaSourceResult | null = null;
                for (const quality of qualityOrder) {
                    try {
                        mediaSource = await getMediaSourceByQuality(track, quality);
                        if (!mediaSource?.url) {
                            continue;
                        }
                        realQuality = quality;
                        break;
                    } catch { }
                }

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
        audioElement.value && audioElement.value.pause();

        // Add 5-second timeout to getMediaSource
        let src = await Promise.race([
            getMediaSource(track),
            new Promise<null>((_, reject) => setTimeout(() => reject(new Error('Timeout getting media source')), 5000))
        ]).catch(error => {
            console.error('Error or timeout getting media source:', error);
            return null;
        });

        if (!src?.startsWith('http')) {
            src = addFileScheme(src!)
        }

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
        if (isSameMedia(currentTrack.value, track)) {
            return;
        }
        const currentIndex = playlist.value.findIndex(track => track.id === currentTrack.value?.id);
        // check if the track is already in the playlist
        if (playlist.value.find(t => isSameMedia(t, track))) {
            // remove the track from the playlist
            playlist.value.splice(playlist.value.findIndex(t => isSameMedia(t, track)), 1);
            // add the track after the current track
            playlist.value.splice(currentIndex + 1, 0, track);
            return;
        }

        if (currentIndex === -1 || currentIndex === playlist.value.length - 1) {
            playlist.value.push(track);
        } else {
            playlist.value.splice(currentIndex + 1, 0, track);
        }
    }

    function play() {
        audioElement.value?.play();
        isPlaying.value = true;
        syncTrayState();
    }

    function pause() {
        audioElement.value?.pause();
        isPlaying.value = false;
        syncTrayState();
    }

    function toggleMute() {
        mute.value = !mute.value;
        if (audioElement.value) {
            audioElement.value.muted = mute.value;
        }
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
        if (audioElement.value) {
            audioElement.value.pause();
            audioElement.value.src = '';

            // Clear media session metadata and state
            if ('mediaSession' in navigator) {
                navigator.mediaSession.metadata = null;
                navigator.mediaSession.playbackState = 'none';
                // Clear all media session action handlers
                ['play', 'pause', 'previoustrack', 'nexttrack'].forEach(action => {
                    navigator.mediaSession.setActionHandler(action as MediaSessionAction, null);
                });
            }

            audioElement.value = null;
        }
        duration.value = 0;
        currentTime.value = 0;
        currentTrack.value = null;
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
        // 同步状态到托盘
        syncTrayState();
    }

    function shufflePlaylist() {
        playlist.value = [...playlist.value].sort(() => Math.random() - 0.5);
    }

    function addToPlaylist(track: IMusic.IMusicItem) {
        // 如果重复，则不添加
        if (playlist.value.find(t => isSameMedia(t, track))) {
            return;
        }
        playlist.value.push(track);
    }

    // 添加同步状函数
    async function syncTrayState() {
        let modeStr = 'list';
        switch (repeatMode.value) {
            case RepeatMode.Loop:
                modeStr = 'single';
                break;
            case RepeatMode.Queue:
                modeStr = 'list';
                break;
            case RepeatMode.Shuffle:
                modeStr = 'random';
                break;
        }

        await invoke('update_tray_state', {
            playState: isPlaying.value,
            repeatMode: modeStr,
            songTitle: currentTrack.value?.title || null,
            platform: currentTrack.value?.platform || null
        });
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
        mute,
        toggleMute,
    };
}, {
    persistedState: {
        includePaths: ['currentTrack', 'playlist', 'repeatMode'],
    }
});