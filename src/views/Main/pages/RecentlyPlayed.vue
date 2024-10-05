<template>
    <div>RecentlyPlayed</div>
</template>
<script setup lang="ts">
import axios from 'axios';
import { fetch, ResponseType, HttpOptions, HttpVerb } from '@tauri-apps/api/http';
import { invoke } from '@tauri-apps/api/tauri';


async function makeHttpRequest(method: string, url: string, params: any, headers: any, body = null) {
  try {
    // 如果有查询参数，使用 URLSearchParams 构建 URL
    if (params) {
      const searchParams = new URLSearchParams(params);
      url = `${url}?${searchParams.toString()}`;
    }

    const response = await invoke('http_request', { 
      method, 
      url, 
      headers, 
      body 
    });
    return response;
  } catch (error) {
    console.error('Error making HTTP request:', error);
    throw error;
  }
}

const testAxios = async () => {
    const res = await axios.get(`http://kbangserver.kuwo.cn/ksong.s`, {
        params: {
            from: "pc",
            fmt: "json",
            pn: 0,
            rn: 80,
            type: "bang",
            data: "content",
            id: "93",
            show_copyright_off: 0,
            pcmp4: 1,
            isbang: 1,
            userid: 0,
            httpStatus: 1,
        },
    });
    console.log('res', res);
}

const testFetch = async () => {
// Accept: "*/*"
// Accept-Encoding: "gzip, deflate, br"
// By: "fe281e9795310e8d694af99a16a15012"
// Connection: "keep-alive"
// Host: "m.music.migu.cn"
// User-Agent: "Mozilla/5.0 (Linux; Android 6.0.1; Moto G (4)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Mobile Safari/537.3…"


const headers = 
{
            'Accept': '*/*',
            'Accept-Encoding': 'gzip, deflate, br',
            'By': 'fe281e9795310e8d694af99a16a15012',
            'Connection': 'keep-alive',
            'Host': 'm.music.migu.cn',
            'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0.1; Moto G (4)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Mobile Safari/537.36',
            'referer': 'https://m.music.migu.cn/v4/music/top/movies'
        }

// referer: "https://m.music.migu.cn/v4/music/top/movies"
    // const res = await fetch('https://m.music.migu.cn/migumusic/h5/billboard/home', {
    //     method: 'GET',
    //     headers: {
    //         'Accept': '*/*',
    //         'Accept-Encoding': 'gzip, deflate, br',
    //         'By': 'fe281e9795310e8d694af99a16a15012',
    //         'Connection': 'keep-alive',
    //         'Host': 'm.music.migu.cn',
    //         'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0.1; Moto G (4)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Mobile Safari/537.3…',
    //         'referer': 'https://m.music.migu.cn/v4/music/top/movies'
    //     },
    //     query: {
    //          pageNum: "1",
    //          pageSize: "100",
    //          pathName: "movies"
    //     },
    //     responseType: ResponseType.JSON
    // });

    const res = await makeHttpRequest("GET", "https://m.music.migu.cn/migumusic/h5/billboard/home", {
                    pageNum: "1",
                    pageSize: "100",
                    pathName: "movies"
                }, headers)
    console.log('res', res);
}

// testAxios();
testFetch();
</script>