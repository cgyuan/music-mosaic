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

export interface musicSheet extends MusicSheetSummary {
    tracks: IMusic.IMusicItem[];
}

export const useMusicSheetStore = defineStore('musicSheet', () => {
  const musicSheetsSummaries = ref<MusicSheetSummary[]>([]);
  const currentMusicSheet = ref<MusicSheetSummary | null>(null);

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
      console.log('initialize', musicSheetsSummaries.value);
      musicSheetsSummaries.value.push({
        id,
        title,
        createAt: Date.now(),
      });
      const newmusicSheet: musicSheet = { id, title, tracks: [] };
      await musicSheetStorage.setItem(id, newmusicSheet);
    }
  };

  onMounted(() => {
    initialize();
  });

  const addMusicSheet = async (title: string) => {
    const newId = nanoid();
    const createAt = Date.now();
    const newmusicSheet: musicSheet = { id: newId, title, tracks: [] };
    musicSheetsSummaries.value.push({ id: newId, title, createAt });
    
    // Save the new musicSheet in storage
    await musicSheetStorage.setItem(newId, newmusicSheet);
    
    return newId;
  };

  const removeMusicSheet = async (id: string) => {
    const index = musicSheetsSummaries.value.findIndex(p => p.id === id);
    if (index !== -1) {
      musicSheetsSummaries.value.splice(index, 1);
      
      // Remove the musicSheet in storage
      await musicSheetStorage.removeItem(id);
    }
  };

  const getMusicSheetSummaryById = (id: string) => {
    return musicSheetsSummaries.value.find(p => p.id === id)!!;
  };

  const fetchMusicSheet = async (id: string) => {
    
    const musicSheet = await musicSheetStorage.getItem<musicSheet>(id);
    return musicSheet;
  };

  const addTrackToMusicSheet = async (musicSheetId: string, track: IMusic.IMusicItem) => {
    let musicSheet = await musicSheetStorage.getItem<musicSheet>(musicSheetId);
    const musicSheetSummary = musicSheetsSummaries.value.find(p => p.id === musicSheetId);
    if (!musicSheetSummary) return;
    if (!musicSheet) {
        musicSheet = { id: musicSheetId, title: musicSheetSummary.title, tracks: [], createAt: musicSheetSummary.createAt };
    }
    musicSheetSummary.artwork = track.artwork;
    if (musicSheet) {
      const plainTrack = JSON.parse(JSON.stringify(track));
      musicSheet.tracks.push(plainTrack);
      await musicSheetStorage.setItem(musicSheetId, musicSheet);
    }
  };

  const removeTrackFromMusicSheet = async (musicSheetId: string, trackIndex: number) => {
    const musicSheet = await musicSheetStorage.getItem<musicSheet>(musicSheetId);
    if (musicSheet) {
      musicSheet.tracks.splice(trackIndex, 1);
      await musicSheetStorage.setItem(musicSheetId, musicSheet);
    }
  };

  const addTracksToMusicSheet = async (musicSheetId: string, newTracks: IMusic.IMusicItem[]) => {
    const musicSheet = await musicSheetStorage.getItem<musicSheet>(musicSheetId);
    if (musicSheet) {
      const plainTracks = newTracks.map(p => JSON.parse(JSON.stringify(p)));
      musicSheet.tracks.push(...plainTracks);
      await musicSheetStorage.setItem(musicSheetId, musicSheet);
    }
  };

  const renameMusicSheet = async (id: string, title: string) => {
    const musicSheet = await musicSheetStorage.getItem<musicSheet>(id);
    const musicSheetSummary = musicSheetsSummaries.value.find(p => p.id === id);
    if (!musicSheetSummary) return;
    if (musicSheet) {
      musicSheetSummary.title = title;
      musicSheet.title = title;
      await musicSheetStorage.setItem(id, musicSheet);
    }
  };

  return {
    musicSheetsSummaries,
    currentMusicSheet,
    getMusicSheetSummaryById,
    addMusicSheet,
    removeMusicSheet,
    fetchMusicSheet,
    addTrackToMusicSheet,
    addTracksToMusicSheet,
    removeTrackFromMusicSheet,
    renameMusicSheet
  };
}, {
    persistedState: {
        persist: true,
        includePaths: ['musicSheetsSummaries']
    }
});
