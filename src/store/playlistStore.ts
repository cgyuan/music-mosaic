import { defineStore } from 'pinia';
import { ref, onMounted } from 'vue';
import localforage from 'localforage';
import { nanoid } from 'nanoid';

export interface PlaylistSummary {
  id: string;
  artwork?: string;
  title: string;
  worksNum?: number;
  createAt?: number;
}

export interface Playlist extends PlaylistSummary {
    tracks: IMusic.IMusicItem[];
}

export const usePlaylistStore = defineStore('playlist', () => {
  const playlistSummaries = ref<PlaylistSummary[]>([]);
  const currentPlaylist = ref<PlaylistSummary | null>(null);

  // Initialize localforage
  const playlistStorage = localforage.createInstance({
    name: "musicApp",
    storeName: "playlists"
  });

  const initialize = async () => {
    const id = "favorite";
    const title = "我喜欢";
    const favoriteList = playlistSummaries.value.find((item) => item.id === id);
    if (!favoriteList) {
      console.log("Creating favorite playlist");
      playlistSummaries.value.push({
        id,
        title,
        createAt: Date.now(),
      });
      console.log("playlistSummaries", playlistSummaries.value);
      const newPlaylist: Playlist = { id, title, tracks: [] };
      await playlistStorage.setItem(id, newPlaylist);
    }
  };

  onMounted(() => {
    initialize();
  });

  const addPlaylist = async (title: string) => {
    const newId = nanoid();
    const createAt = Date.now();
    const newPlaylist: Playlist = { id: newId, title, tracks: [] };
    playlistSummaries.value.push({ id: newId, title, createAt });
    
    // Save the new playlist in storage
    await playlistStorage.setItem(newId, newPlaylist);
    
    return newId;
  };

  const removePlaylist = async (id: string) => {
    const index = playlistSummaries.value.findIndex(p => p.id === id);
    if (index !== -1) {
      playlistSummaries.value.splice(index, 1);
      
      // Remove the playlist in storage
      await playlistStorage.removeItem(id);
    }
  };

  const getPlaylistSummaryById = (id: string) => {
    return playlistSummaries.value.find(p => p.id === id)!!;
  };

  const fetchPlaylist = async (id: string) => {
    
    const playlist = await playlistStorage.getItem<Playlist>(id);
    return playlist;
  };

  const addTrackToPlaylist = async (playlistId: string, track: IMusic.IMusicItem) => {
    let playlist = await playlistStorage.getItem<Playlist>(playlistId);
    const playlistSummary = playlistSummaries.value.find(p => p.id === playlistId);
    if (!playlistSummary) return;
    if (!playlist) {
        playlist = { id: playlistId, title: playlistSummary.title, tracks: [], createAt: playlistSummary.createAt };
    }
    playlistSummary.artwork = track.artwork;
    if (playlist) {
      const plainTrack = JSON.parse(JSON.stringify(track));
      playlist.tracks.push(plainTrack);
      await playlistStorage.setItem(playlistId, playlist);
    }
  };

  const removeTrackFromPlaylist = async (playlistId: string, trackIndex: number) => {
    const playlist = await playlistStorage.getItem<Playlist>(playlistId);
    if (playlist) {
      playlist.tracks.splice(trackIndex, 1);
      await playlistStorage.setItem(playlistId, playlist);
    }
  };

  const addTracksToPlaylist = async (playlistId: string, newTracks: IMusic.IMusicItem[]) => {
    const playlist = await playlistStorage.getItem<Playlist>(playlistId);
    if (playlist) {
      playlist.tracks.push(...newTracks);
      await playlistStorage.setItem(playlistId, playlist);
    }
  };

  return {
    playlistSummaries,
    currentPlaylist,
    playlistStorage,
    getPlaylistSummaryById,
    addPlaylist,
    removePlaylist,
    fetchPlaylist,
    addTrackToPlaylist,
    addTracksToPlaylist,
    removeTrackFromPlaylist
  };
}, {
    persistedState: {
        persist: true,
        includePaths: ['playlistSummaries']
    }
});
