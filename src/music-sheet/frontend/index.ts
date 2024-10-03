import Store from "@/common/store.ts";
import * as backend from "../backend";
import defaultSheet from "../common/default-sheet";
import { RequestStateCode, localPluginName } from "@/common/constant";
import { toMediaBase } from "@/common/media-util";
import { onBeforeUnmount, ref, watch, computed, shallowRef, toRaw } from "vue";

const musicSheetsStore = new Store<IMusic.IDBMusicSheetItem[]>([]);
const starredSheetsStore = new Store<IMedia.IMediaBase[]>([]);

export const useAllSheets = musicSheetsStore.useValue;
export const useAllStarredSheets = starredSheetsStore.useValue;

export const getAllSheets = musicSheetsStore.getValue;

/** 更新默认歌单变化 */
const refreshFavCbs = new Set<() => void>();
function refreshFavoriteState() {
  refreshFavCbs.forEach((cb) => cb?.());
}

/**
 * 初始化
 */
export async function setupMusicSheets() {
  const [musicSheets, starredSheets] = await Promise.all([
    backend.queryAllSheets(),
    backend.queryAllStarredSheets(),
  ]);
  musicSheetsStore.setValue(musicSheets);
  starredSheetsStore.setValue(starredSheets);
}

/**
 * 新建歌单
 * @param sheetName 歌单名
 * @returns 新建的歌单信息
 */
export async function addSheet(sheetName: string) {
  try {
    const newSheetDetail = await backend.addSheet(sheetName);
    musicSheetsStore.setValue(backend.getAllSheets());
    return newSheetDetail;
  } catch {}
}

/**
 * 更新歌单信息
 * @param sheetId 歌单ID
 * @param newData 最新的歌单信息
 * @returns
 */
export async function updateSheet(
  sheetId: string,
  newData: Partial<IMusic.IMusicSheetItem>
) {
  try {
    await backend.updateSheet(sheetId, newData);
    musicSheetsStore.setValue(backend.getAllSheets());
  } catch {}
}

/**
 * 更新歌单中的歌曲顺序
 * @param sheetId
 * @param musicList
 */
export async function updateSheetMusicOrder(
  sheetId: string,
  musicList: IMusic.IMusicItem[]
) {
  try {
    const targetSheet = musicSheetsStore
      .getValue()
      .find((it) => it.id === sheetId);
    updateSheetDetail({
      ...targetSheet,
      musicList,
    } as IMusic.IMusicSheetItem);
    await backend.updateSheet(sheetId, {
      musicList: musicList.map(toMediaBase) as IMusic.IMusicItem[],
    });
    musicSheetsStore.setValue(backend.getAllSheets());
  } catch {}
}

/**
 * 移除歌单
 * @param sheetId 歌单ID
 * @returns 删除后的ID
 */
export async function removeSheet(sheetId: string) {
  try {
    await backend.removeSheet(sheetId);
    musicSheetsStore.setValue(backend.getAllSheets());
  } catch {}
}

/**
 * 清空所有音乐
 * @param sheetId 歌单ID
 * @returns 删除后的ID
 */
export async function clearSheet(sheetId: string) {
  try {
    await backend.clearSheet(sheetId);
    musicSheetsStore.setValue(backend.getAllSheets());
    refetchSheetDetail(sheetId);
  } catch {}
}

/**
 * 收藏歌单
 * @param sheet
 */
export async function starMusicSheet(sheet: IMedia.IMediaBase) {
  await backend.starMusicSheet(sheet);
  starredSheetsStore.setValue(backend.getAllStarredSheets());
}

/**
 * 取消收藏歌单
 * @param sheet
 */
export async function unstarMusicSheet(sheet: IMedia.IMediaBase) {
  await backend.unstarMusicSheet(sheet);
  starredSheetsStore.setValue(backend.getAllStarredSheets());
}

/**
 * 收藏歌单排序
 */
export async function setStarredMusicSheets(sheets: IMedia.IMediaBase[]) {
  await backend.setStarredMusicSheets(sheets);
  starredSheetsStore.setValue(backend.getAllStarredSheets());
}

/**************************** 歌曲相关方法 ************************/

/**
 * 添加歌曲到歌单
 * @param musicItems
 * @param sheetId
 * @returns
 */
export async function addMusicToSheet(
  musicItems: IMusic.IMusicItem | IMusic.IMusicItem[],
  sheetId: string
) {
  const start = Date.now();
  await backend.addMusicToSheet(musicItems, sheetId);
  console.log("添加音乐", Date.now() - start, "ms");

  musicSheetsStore.setValue(backend.getAllSheets());
  if (sheetId === defaultSheet.id) {
    // 更新默认列表的状态
    refreshFavoriteState();
  }
  refetchSheetDetail(sheetId);
}

/** 添加到默认歌单 */
export async function addMusicToFavorite(
  musicItems: IMusic.IMusicItem | IMusic.IMusicItem[]
) {
  return addMusicToSheet(musicItems, defaultSheet.id);
}

/**
 * 从歌单内移除歌曲
 * @param musicItems 要移除的歌曲
 * @param sheetId 歌单ID
 * @returns
 */
export async function removeMusicFromSheet(
  musicItems: IMusic.IMusicItem | IMusic.IMusicItem[],
  sheetId: string
) {
  const start = Date.now();
  await backend.removeMusicFromSheet(musicItems, sheetId);
  console.log("删除音乐", Date.now() - start, "ms");

  musicSheetsStore.setValue(backend.getAllSheets());
  if (sheetId === defaultSheet.id) {
    // 更新默认列表的状态
    refreshFavoriteState();
  }
  refetchSheetDetail(sheetId);
}

/** 从默认歌单中移除 */
export async function removeMusicFromFavorite(
  musicItems: IMusic.IMusicItem | IMusic.IMusicItem[]
) {
  return removeMusicFromSheet(musicItems, defaultSheet.id);
}

/** 是否是我喜欢的歌单 */
export function isFavoriteMusic(musicItem: IMusic.IMusicItem) {
  return backend.isFavoriteMusic(musicItem);
}

/** hook 某首歌曲是否被标记成喜欢 */
export function useMusicIsFavorite(musicItem: IMusic.IMusicItem) {
  const musicItemRef = shallowRef(musicItem);

  const isFav = computed(() => {
    return backend.isFavoriteMusic(toRaw(musicItemRef.value));
  });

  const refreshFav = () => {
    musicItemRef.value = { ...musicItemRef.value };
  };

  refreshFavCbs.add(refreshFav);
  onBeforeUnmount(() => {
    refreshFavCbs.delete(refreshFav);
  });

  return isFav;
}

const updateSheetDetailCallbacks: Map<
  string,
  Set<(newSheet: IMusic.IMusicSheetItem) => void>
> = new Map();

function updateSheetDetail(newSheet: IMusic.IMusicSheetItem) {
  updateSheetDetailCallbacks.get(newSheet?.id)?.forEach((cb) => cb?.(newSheet));
}

/**
 * 重新取歌单状态
 * @param sheetId
 */
async function refetchSheetDetail(sheetId: string) {
  let sheetDetail = await backend.getSheetItemDetail(sheetId);
  if (!sheetDetail) {
    // 可能已经被删除了
    sheetDetail = {
      id: sheetId,
      title: "已删除歌单",
      artist: "未知作者",
      platform: localPluginName,
    };
  }

  updateSheetDetail(sheetDetail);
}

/**
 * 监听当前某个歌单
 * @param sheetId 歌单ID
 * @param initQuery 是否重新查询
 */
export function useMusicSheet(sheetId: string) {
  console.log("useMusicSheet", sheetId);
  const pendingState = ref(RequestStateCode.PENDING_FIRST_PAGE);
  const sheetItem = ref<IMusic.IMusicSheetItem | null>(null);

  const realTimeSheetIdRef = ref(sheetId);

  const updateSheet = async (newSheet: IMusic.IMusicSheetItem) => {
    if (realTimeSheetIdRef.value === newSheet.id) {
      sheetItem.value = newSheet;
      pendingState.value = RequestStateCode.FINISHED;
    }
  };

  watch(() => sheetId, (newSheetId) => {
    realTimeSheetIdRef.value = newSheetId;
    const cbs = updateSheetDetailCallbacks.get(newSheetId) ?? new Set();
    cbs.add(updateSheet);
    updateSheetDetailCallbacks.set(newSheetId, cbs);

    const targetSheet = musicSheetsStore
      .getValue()
      .find((item) => item.id === newSheetId);

    if (targetSheet) {
      sheetItem.value = {
        ...targetSheet,
        musicList: [],
      };
    }

    console.log("targetSheet", targetSheet);

    pendingState.value = RequestStateCode.PENDING_FIRST_PAGE;
    refetchSheetDetail(newSheetId);
  }, { immediate: true });

  onBeforeUnmount(() => {
    console.log("onBeforeUnmount", realTimeSheetIdRef.value);
    const cbs = updateSheetDetailCallbacks.get(realTimeSheetIdRef.value);
    cbs?.delete(updateSheet);
  });

  return { sheetItem, pendingState };
}

export async function exportAllSheetDetails() {
  return await backend.exportAllSheetDetails();
}
