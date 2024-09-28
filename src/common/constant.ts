export const internalDataKey = "$";
export const internalDataSymbol = Symbol.for("internal");
// 加入播放列表/歌单的时间
export const timeStampSymbol = Symbol.for("time-stamp");
// 加入播放列表的辅助顺序
export const sortIndexSymbol = Symbol.for("sort-index");
/**
 * 歌曲引用次数
 * TODO: 没必要算引用 如果真有需要直接取异或就可以了
 */
export const musicRefSymbol = "$$ref";

/** 本地存储路径 */
export const localFilePathSymbol = Symbol.for("local-file-path");
export const localPluginName = "本地";
export const localPluginHash = "本地";

export const supportedMediaType = [
  "music",
  "album",
  "artist",
  "sheet",
] as const;

export const rem = 13;

export enum RequestStateCode {
  /** 空闲 */
  IDLE = 0b00000000,
  PENDING_FIRST_PAGE = 0b00000010,
  LOADING = 0b00000010,
  /** 检索中 */
  PENDING_REST_PAGE = 0b00000011,
  /** 部分结束 */
  PARTLY_DONE = 0b00000100,
  /** 全部结束 */
  FINISHED = 0b0001000,
  /** 出错了 */
  ERROR = 0b10000000,
}

/** 音质列表 */
export const qualityKeys: IMusic.IQualityKey[] = [
  "low",
  "standard",
  "high",
  "super",
];

export const supportLocalMediaType = [
  ".mp3",
  ".mp4",
  ".m4s",
  ".flac",
  ".wma",
  ".wav",
  ".m4a",
  ".ogg",
  ".acc",
  ".aac",
  // ".ape",
  ".opus",
];

export const toastDuration = {
  short: 1000,
  long: 2500,
};

export const defaultFont = {
  fullName: "默认",
  family: "",
  postscriptName: "",
  style: "",
};

/** 下载状态 */
export enum DownloadState {
  /** 空闲状态 */
  NONE = "NONE",
  /** 排队等待中 */
  WAITING = "WAITING",
  /** 下载中 */
  DOWNLOADING = "DOWNLOADING",
  /** 失败 */
  ERROR = "ERROR",
  /** 下载完成 */
  DONE = "DONE",
}

// 主题更新链接
export const themePackStoreBaseUrl = [
  "https://raw.githubusercontent.com/maotoumao/MusicFreeThemePacks/master/", //github
  "https://cdn.jsdelivr.net/gh/maotoumao/MusicFreeThemePacks@master/",
  "https://gitee.com/maotoumao/MusicFreeThemePacks/raw/master/", // gitee
];

export const appUpdateSources = [
  "https://gitee.com/maotoumao/MusicFreeDesktop/raw/master/release/version.json",
  "https://raw.githubusercontent.com/maotoumao/MusicFreeDesktop/master/release/version.json",
  "https://cdn.jsdelivr.net/gh/maotoumao/MusicFreeDesktop@master/release/version.json",
];

export enum TrackPlayerSyncType {
  SyncPlayerState = "SyncPlayerState",
  MusicChanged = "MusicChanged",
  PlayerStateChanged = "PlayerStateChanged",
  RepeatModeChanged = "RepeatModeChanged",
  LyricChanged = "LyricChanged",
  CurrentLyricChanged = "CurrentLyricChanged",
  ProgressChanged = "ProgressChanged",
}

export enum MusicSheetType {
  Playlist = "playlist",
  Favorite = "favorite",
  Download = "download",
  Local = "local",
  Cloud = "cloud",
  Ranking = "ranking",
  Recent = "recent",
}
