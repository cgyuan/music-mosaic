import * as Comlink from "comlink";
import { DownloadState } from "@/common/constant";
import { encodeUrlHeaders } from "@/common/normalize-util";
import { writeBinaryFile } from '@tauri-apps/api/fs';
import throttle from "lodash.throttle";


type IOnStateChangeFunc = (data: {
  state: DownloadState;
  downloaded?: number;
  total?: number;
  msg?: string;
}) => void;

async function downloadFile(
  mediaSource: IMusic.IMusicSource,
  filePath: string,
  onStateChange: IOnStateChangeFunc
) {
  try {
    const _headers: Record<string, string> = {
      ...(mediaSource.headers ?? {}),
      "user-agent": mediaSource.userAgent || "",
    };

    const urlObj = new URL(mediaSource.url || "");
    let res: Response;
    
    if (urlObj.username && urlObj.password) {
      _headers["Authorization"] = `Basic ${btoa(
        `${decodeURIComponent(urlObj.username)}:${decodeURIComponent(
          urlObj.password
        )}`
      )}`;
      urlObj.username = "";
      urlObj.password = "";
      res = await fetch(urlObj.toString(), { headers: _headers });
    } else {
      res = await fetch(encodeUrlHeaders(mediaSource.url!, _headers));
    }

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const totalSize = Number(res.headers.get("content-length"));
    const reader = res.body?.getReader();
    
    if (!reader) {
      throw new Error("Failed to get response reader");
    }

    const chunks: Uint8Array[] = [];
    let downloadedSize = 0;

    const tOnProgress = throttle((size) => {
      onStateChange({
        state: DownloadState.DOWNLOADING,
        downloaded: size,
        total: totalSize,
      });
    }, 100);

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      chunks.push(value);
      downloadedSize += value.length;
      tOnProgress(downloadedSize);
    }

    // Combine chunks
    const allChunks = new Uint8Array(downloadedSize);
    let position = 0;
    for (const chunk of chunks) {
      allChunks.set(chunk, position);
      position += chunk.length;
    }

    // Write file using Tauri's API
    await writeBinaryFile(filePath, allChunks);
    
    onStateChange({ 
      state: DownloadState.DONE,
      downloaded: downloadedSize,
      total: totalSize 
    });

  } catch (e) {
    console.error('Download error:', e);
    onStateChange({
      state: DownloadState.ERROR,
      msg: e instanceof Error ? e.message : "Unknown error",
    });
  }
}

Comlink.expose({
  downloadFile,
});
