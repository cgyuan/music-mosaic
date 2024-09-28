import { defineStore } from 'pinia';
import { ref, onMounted } from 'vue';
import localforage from 'localforage';
import { nanoid } from 'nanoid';

export interface MusicSheetSummary {
  id: string;
  artwork?: string;
  title: string;
  worksNum?: number;
  createAt?: number;
}

export interface Playlist extends MusicSheetSummary {
    tracks: IMusic.IMusicItem[];
}

export const useMusicSheetStore = defineStore('musicSheet', () => {
  const musicSheetsSummaries = ref<MusicSheetSummary[]>([]);
  const currentPlaylist = ref<MusicSheetSummary | null>(null);

  // Initialize localforage
  const musicSheetStorage = localforage.createInstance({
    name: "musicApp",
    storeName: "musicSheets"
  });

  const initialize = async () => {
    const id = "favorite";
    const title = "我喜欢";
    const favoriteSheet = musicSheetsSummaries.value.find((item) => item.id === id);
    if (!favoriteSheet) {
      musicSheetsSummaries.value.push({
        id,
        title,
        createAt: Date.now(),
      });
      const newPlaylist: Playlist = { id, title, tracks: [] };
      await musicSheetStorage.setItem(id, newPlaylist);
    }
  };

  onMounted(() => {
    initialize();
  });

  const addMusicSheet = async (title: string) => {
    const newId = nanoid();
    const createAt = Date.now();
    const newPlaylist: Playlist = { id: newId, title, tracks: [] };
    musicSheetsSummaries.value.push({ id: newId, title, createAt });
    
    // Save the new playlist in storage
    await musicSheetStorage.setItem(newId, newPlaylist);
    
    return newId;
  };

  const removeMusicSheet = async (id: string) => {
    const index = musicSheetsSummaries.value.findIndex(p => p.id === id);
    if (index !== -1) {
      musicSheetsSummaries.value.splice(index, 1);
      
      // Remove the playlist in storage
      await musicSheetStorage.removeItem(id);
    }
  };

  const getMusicSheetSummaryById = (id: string) => {
    return musicSheetsSummaries.value.find(p => p.id === id)!!;
  };

  const fetchMusicSheet = async (id: string) => {
    
    const playlist = await musicSheetStorage.getItem<Playlist>(id);
    return playlist;
  };

  const addTrackToMusicSheet = async (playlistId: string, track: IMusic.IMusicItem) => {
    let playlist = await musicSheetStorage.getItem<Playlist>(playlistId);
    const playlistSummary = musicSheetsSummaries.value.find(p => p.id === playlistId);
    if (!playlistSummary) return;
    if (!playlist) {
        playlist = { id: playlistId, title: playlistSummary.title, tracks: [], createAt: playlistSummary.createAt };
    }
    playlistSummary.artwork = track.artwork;
    if (playlist) {
      const plainTrack = JSON.parse(JSON.stringify(track));
      playlist.tracks.push(plainTrack);
      await musicSheetStorage.setItem(playlistId, playlist);
    }
  };

  const removeTrackFromMusicSheet = async (playlistId: string, trackIndex: number) => {
    const playlist = await musicSheetStorage.getItem<Playlist>(playlistId);
    if (playlist) {
      playlist.tracks.splice(trackIndex, 1);
      await musicSheetStorage.setItem(playlistId, playlist);
    }
  };

  const addTracksToMusicSheet = async (playlistId: string, newTracks: IMusic.IMusicItem[]) => {
    const playlist = await musicSheetStorage.getItem<Playlist>(playlistId);
    if (playlist) {
      playlist.tracks.push(...newTracks);
      await musicSheetStorage.setItem(playlistId, playlist);
    }
  };

  return {
    playlistSummaries: musicSheetsSummaries,
    currentPlaylist,
    playlistStorage: musicSheetStorage,
    getMusicSheetSummaryById,
    addMusicSheet,
    removeMusicSheet,
    fetchMusicSheet,
    addTrackToMusicSheet,
    addTracksToMusicSheet,
    removeTrackFromMusicSheet
  };
}, {
    persistedState: {
        persist: true,
        includePaths: ['playlistSummaries']
    }
});
