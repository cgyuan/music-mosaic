import { DownloadState, localPluginName } from "@/common/constant";
import Store from "@/common/store";
import {
    getMediaPrimaryKey,
    getQualityOrder,
    isSameMedia,
    setInternalData,
} from "@/common/media-util";
import { usePluginStore } from "@/store/pluginStore";
import { homeDir, join } from '@tauri-apps/api/path';
import { createDir } from '@tauri-apps/api/fs';
import { invoke } from '@tauri-apps/api/tauri';
import { addDownloadedMusicToList, isDownloaded, setupDownloadedMusicList, useDownloaded } from "./downloaded-sheet";
import { ee, DownloadEvts } from "./ee";
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useSettingsStore } from "@/store/settingsStore";

export interface IDownloadStatus {
    state: DownloadState;
    downloaded?: number;
    total?: number;
    msg?: string;
}

const downloadingMusicStore = new Store<Array<IMusic.IMusicItem>>([]);
const downloadingProgress = new Map<string, IDownloadStatus>();

type IOnStateChangeFunc = (data: IDownloadStatus) => void;

async function setupDownloader() {
    await setupDownloadedMusicList();
}

async function getMediaSource(track: IMusic.IMusicItem, quality: IMusic.IQualityKey) {
    const pluginStore = usePluginStore();

    const plugin = pluginStore.getPluginByPlatform(track.platform);
    console.log("track", track, plugin);
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

async function downloadMusicImpl(
    musicItem: IMusic.IMusicItem,
    fileName: string,
    onStateChange: IOnStateChangeFunc
) {
    const settingsStore = useSettingsStore();
    const [defaultQuality, whenQualityMissing] = [
        settingsStore.settings.download?.defaultQuality || "standard",
        settingsStore.settings.download?.whenQualityMissing || 'lower'
    ];
    const qualityOrder = getQualityOrder(defaultQuality, whenQualityMissing);
    let mediaSource: IPlugin.IMediaSourceResult | null = null;
    let realQuality: IMusic.IQualityKey = qualityOrder[0];

    for (const quality of qualityOrder) {
        try {
            mediaSource = await getMediaSource(musicItem, quality);
            if (!mediaSource?.url) {
                continue;
            }
            realQuality = quality;
            break;
        } catch { }
    }

    try {
        if (mediaSource?.url) {
            const ext = mediaSource.url.match(/.*\/.+\.([^./?#]+)/)?.[1] ?? "mp3";
            const homePath = await homeDir();
            const downloadDir = await join(homePath, '.music-download');
            console.log("downloadDir", downloadDir);

            await createDir(downloadDir, { recursive: true });

            const downloadPath = await join(downloadDir, `${fileName}.${ext}`);
            console.log("downloadPath", downloadPath);

            // Prepare headers
            const _headers: Record<string, string> = {
                ...(mediaSource.headers ?? {}),
                "user-agent": mediaSource.userAgent || "",
            };

            const urlObj = new URL(mediaSource.url);
            if (urlObj.username && urlObj.password) {
                _headers["Authorization"] = `Basic ${btoa(
                    `${decodeURIComponent(urlObj.username)}:${decodeURIComponent(
                        urlObj.password
                    )}`
                )}`;
                urlObj.username = "";
                urlObj.password = "";
            }

            // Update initial state
            onStateChange({
                state: DownloadState.DOWNLOADING,
                downloaded: 0,
                total: 100
            });

            // Use Tauri's invoke to download
            await invoke('download_file', {
                url: mediaSource.url,
                filePath: downloadPath,
                headers: _headers
            });

            onStateChange({
                state: DownloadState.DONE,
                downloaded: 100,
                total: 100
            });

            addDownloadedMusicToList(
                setInternalData<IMusic.IMusicItemInternalData>(
                    JSON.parse(JSON.stringify(musicItem)),
                    "downloadData",
                    {
                        path: downloadPath,
                        quality: realQuality,
                    },
                    true
                ) as IMusic.IMusicItem
            );

            console.log("download done", downloadPath);
        } else {
            throw new Error("Invalid Source");
        }
    } catch (e) {
        console.log(e, "ERROR");
        onStateChange({
            state: DownloadState.ERROR,
            msg: (e as Error).message,
        });
    }
}

async function startDownload(
    musicItems: IMusic.IMusicItem | IMusic.IMusicItem[]
) {
    const _musicItems = Array.isArray(musicItems) ? musicItems : [musicItems];
    // 过滤掉已下载的、本地音乐、任务中的音乐
    const _validMusicItems = _musicItems.filter(
        (it) => !isDownloaded(it) && it.platform !== localPluginName
    );
    const downloadCallbacks = _validMusicItems.map((it) => {
        const pk = getMediaPrimaryKey(it);
        downloadingProgress.set(pk, {
            state: DownloadState.WAITING,
        });

        return async () => {
            // Not on waiting list
            if (!downloadingProgress.has(pk)) {
                return;
            }

            downloadingProgress.get(pk)!.state = DownloadState.DOWNLOADING;
            const fileName = `${it.title}-${it.artist}`.replace(/[/|\\?*"<>:]/g, "_");
            await new Promise<void>((resolve) => {
                downloadMusicImpl(it, fileName, (stateData) => {
                    downloadingProgress.set(pk, stateData);
                    ee.emit(DownloadEvts.DownloadStatusUpdated, it, stateData);
                    if (stateData.state === DownloadState.DONE) {
                        downloadingMusicStore.setValue((prev) =>
                            prev.filter((di) => !isSameMedia(it, di))
                        );
                        downloadingProgress.delete(pk);
                        resolve();
                    } else if (stateData.state === DownloadState.ERROR) {
                        resolve();
                    }
                });
            });
        }
    });

    await Promise.all(downloadCallbacks.map((cb) => cb()));
}

function useDownloadStatus(musicItem: IMusic.IMusicItem) {
    const downloadStatus = ref<IDownloadStatus | null>(null);
  
    // Initial status
    downloadStatus.value = downloadingProgress.get(getMediaPrimaryKey(musicItem)) || null;
  
    // Update handler
    const updateFn = (mi: IMusic.IMusicItem, stateData: IDownloadStatus) => {
      if (isSameMedia(mi, musicItem)) {
        downloadStatus.value = stateData;
      }
    };
  
    // Setup and cleanup
    onMounted(() => {
      ee.on(DownloadEvts.DownloadStatusUpdated, updateFn);
    });
  
    onUnmounted(() => {
      ee.off(DownloadEvts.DownloadStatusUpdated, updateFn);
    });
  
    return downloadStatus;
  }
  
// 下载状态
function useDownloadState(musicItem: IMusic.IMusicItem) {
    const musicStatus = useDownloadStatus(musicItem);
    const downloaded = useDownloaded(musicItem);
  
    return computed(() => {
      return musicStatus.value?.state || (downloaded.value ? DownloadState.DONE : DownloadState.NONE);
    });
}



export default {
    setupDownloader,
    downloadMusicImpl,
    startDownload,
    useDownloadState,
    downloadingMusicStore,
    downloadingProgress
}