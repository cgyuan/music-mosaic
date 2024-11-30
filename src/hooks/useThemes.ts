import { RequestStateCode, themePackStoreBaseUrl } from "@/common/constant";
import { ref } from "vue";
import axios from "axios";
import { addTailSlash } from "@/common/file-util";
import { addFileScheme } from "@/common/file-util";
import { invoke } from '@tauri-apps/api/tauri';
import { homeDir, join } from "@tauri-apps/api/path";
import { createDir } from "@tauri-apps/api/fs";
import { nanoid } from "nanoid";
import CryptoJS from "crypto-js";

const themeNodeId = "themepack-node";
const themePathKey = "themepack-path";

const validIframeMap = new Map<
  "app" | "header" | "body" | "music-bar" | "side-bar" | "page",
  HTMLIFrameElement | null
>([
  ["app", null],
  ["header", null],
  ["body", null],
  ["music-bar", null],
  ["side-bar", null],
  ["page", null],
]);


function raceWithData<T>(promises: Array<Promise<T>>): Promise<T> {
  const promiseCount = promises.length;
  return new Promise((resolve, reject) => {
    let isResolved = false;
    let rejectedNum = 0;
    promises.forEach((promise) => {
      promise
        .then((data) => {
          if (!isResolved) {
            isResolved = true;
            resolve(data);
          }
        })
        .catch((e) => {
          ++rejectedNum;
          if (rejectedNum === promiseCount) {
            reject(e);
          }
        });
    });
  });
}

interface IThemeStoreItem {
  publishName: string;
  hash: string;
  packageName: string;
  config: ICommon.IThemePack;
  id?: string;
}

function replaceAlias(
  rawText: string,
  basePath: string,
  withFileScheme = true
) {
  return rawText.replace(new RegExp("@/", "g"),
    addTailSlash(withFileScheme ? addFileScheme(basePath) : basePath)
  );
}

const localThemePacks = ref<ICommon.IThemePack[]>([]);
const currentThemePack = ref<ICommon.IThemePack | null>(null);
const remoteThemeStores = ref<IThemeStoreItem[]>([]);
const loadingState = ref<RequestStateCode>(RequestStateCode.PENDING_FIRST_PAGE);

export default function useThemes() {

  const loadThemePacks = async () => {
    const parsedThemePacks: ICommon.IThemePack[] = [];
    // 读取本地主题包
    const homePath = await homeDir();
    const musicThemePackDir = await join(homePath, '.music-theme-pack');
    const files = await invoke("readdir", {
      path: musicThemePackDir,
      folder: true
    }) as string[];

    for (const file of files) {
      try {
        const themePack = await parseThemePack(await join(musicThemePackDir, file));
        parsedThemePacks.push(themePack);
      } catch (e) {
        console.error(e);
      }
    }
    localThemePacks.value = parsedThemePacks;

    const themePath = localStorage.getItem(themePathKey);
    if (themePath) {
      selectTheme(parsedThemePacks.find((it) => it.path === themePath) ?? null);
    }
    
    return parsedThemePacks;
  }

  const loadRemoteThemes = async () => {
    raceWithData(
      themePackStoreBaseUrl.map(
        async (it, index) =>
          [await axios.get(it + ".publish/publish.json"), index] as const
      )
    ).then(([res, index]) => {
      const data: IThemeStoreItem[] = res.data;
      const pickedUrl = themePackStoreBaseUrl[index];
      data.forEach((theme) => {
        theme.config.srcUrl = `${pickedUrl}.publish/${theme.publishName}.mftheme`;
        if (theme.config.preview) {
          theme.config.preview = replaceAlias(
            theme.config.preview,
            pickedUrl + theme.packageName + "/",
            false
          );
        }
        if (theme.config.thumb) {
          theme.config.thumb = replaceAlias(
            theme.config.thumb,
            pickedUrl + theme.packageName + "/",
            false
          );
        }
      });
      remoteThemeStores.value = data;
      loadingState.value = RequestStateCode.FINISHED;
    }).catch(() => {
      loadingState.value = RequestStateCode.ERROR;
    })
  }

  const installRemoteThemePack = async (url: string, id?: string) => {
    const homePath = await homeDir();
    const musicThemePackDir = await join(homePath, '.music-theme-pack');
    await createDir(musicThemePackDir, { recursive: true });

    const cachePath = await join(musicThemePackDir, `${nanoid()}.mftheme`);

    await downloadTheme(url, cachePath);

    let oldThemeConfig: ICommon.IThemePack | null = null;
    if (id) {
      oldThemeConfig = localThemePacks.value.find((it) => it?.id === id) ?? null;
      if (oldThemeConfig) {
        uninstallThemePack(oldThemeConfig);
      }
    }
    
    return await installTheme(cachePath);
  }

  const uninstallThemePack = (themePack: ICommon.IThemePack) => {
    // 删除主题包
    invoke("rmdir", {
      path: themePack.path,
      recursive: true
    });
    localThemePacks.value = localThemePacks.value.filter((it) => it.id !== themePack.id);
  }

  const downloadTheme = async (url: string, cachePath: string) => {
    await invoke("download_file", {
      url: url,
      filePath: cachePath,
      headers: {
        "Authorization": `Basic`
      }
    });
  }

  const installTheme = async (themePackPath: string) => {
    // unzip theme pack
    const cacheDir = themePackPath.replace(".mftheme", "");
    await invoke("unzip_file", {
      filePath: themePackPath,
      outputDir: cacheDir
    });
    const themePack = await parseThemePack(cacheDir);
    localThemePacks.value.push(themePack);
    return themePack;
  }

  const parseThemePack = async (themePackPath: string) => {
    // readdir
    const files = await invoke("readdir", {
      path: themePackPath
    }) as string[];
    // make sure config.json and  index.css exist
    if (!files.includes("config.json") || !files.includes("index.css")) {
      throw new Error("theme pack is invalid");
    }

    const configPath = await join(themePackPath, "config.json");
    const rawConfig = await invoke("read_file", {
      filePath: configPath
    }) as string;
    const jsonData = JSON.parse(rawConfig);

    const themePack: ICommon.IThemePack = {
      ...jsonData,
      hash: CryptoJS.MD5(rawConfig).toString(CryptoJS.enc.Hex),
      preview: jsonData.preview?.startsWith?.("#")
        ? jsonData.preview
        : jsonData.preview?.replace?.(
          "@/",
          addTailSlash(addFileScheme(themePackPath))
        ),
      path: themePackPath,
    }

    return themePack;
  }

  const selectTheme = async (themePack: ICommon.IThemePack | null) => {
    const themeNode = document.querySelector(`#${themeNodeId}`) as HTMLStyleElement;
    if (themePack === null) {
      // 移除
      themeNode.innerHTML = "";
      validIframeMap.forEach((value, key) => {
        if (value !== null) {
          value.remove();
          validIframeMap.set(key, null);
        }
      });
      localStorage.removeItem(themePathKey);
    } else {
      const styleFile = await join(themePack.path, "index.css");
      const rawStyle = await invoke("read_file", {
        filePath: styleFile
      }) as string;
      themeNode.innerHTML = replaceAlias(rawStyle, themePack.path);

      if (themePack.iframe) {
        validIframeMap.forEach(async (value, key) => {
          let themePackIframeSource = themePack.iframe![key];
          if (!themePackIframeSource) {
            value?.remove();
            validIframeMap.set(key, null);
            return;
          }
          // 如果有，且当前也有
          let iframeNode = null;
          if (value !== null) {
            // 移除旧的
            value.remove();
            validIframeMap.set(key, null);
          }
          // 新的iframe
          iframeNode = document.createElement("iframe");
          iframeNode.scrolling = "no";
          document.querySelector(`.${key}-container`)?.prepend?.(iframeNode);
          validIframeMap.set(key, iframeNode);

          if (themePackIframeSource.startsWith("http")) {
            iframeNode.src = themePackIframeSource;
          } else {
            themePackIframeSource = themePackIframeSource.replace("@/", "");
            themePackIframeSource = await join(themePack.path, themePackIframeSource);
            const rawHtml = await invoke("read_file", {
              filePath: themePackIframeSource
            }) as string;
            iframeNode!.contentWindow!.document.open();
            iframeNode!.contentWindow!.document.write(
              replaceAlias(rawHtml, themePack.path)
            );
            iframeNode!.contentWindow!.document.close();
          }
        });
      } else {
        validIframeMap.forEach((value, key) => {
          if (value !== null) {
            value.remove();
            validIframeMap.set(key, null);
          }
        });
      }

      localStorage.setItem(themePathKey, themePack.path);
    }
    currentThemePack.value = themePack;
  }

  return {
    loadThemePacks,
    loadRemoteThemes,
    loadingState,
    remoteThemeStores,
    localThemePacks,
    uninstallThemePack,
    currentThemePack,
    downloadTheme,
    installRemoteThemePack,
    selectTheme,
  }
}