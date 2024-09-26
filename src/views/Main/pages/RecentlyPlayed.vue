<template>
    <div>RecentlyPlayed</div>
</template>
<script setup lang="ts">
import axios from 'axios';
import { fetch, ResponseType, HttpOptions, HttpVerb } from '@tauri-apps/api/http';
import { invoke } from '@tauri-apps/api/tauri';
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
    const res = await fetch('http://kbangserver.kuwo.cn/ksong.s', {
        method: 'GET',
        query: {
            from: "pc",
            fmt: "json",
            pn: "0",
            rn: "80",
            type: "bang",
            data: "content",
            id: "93",
            show_copyright_off: "0",
            pcmp4: "1",
            isbang: "1",
            userid: "0",
            httpStatus: "1",
        },
    });
    console.log('res', res);
}

// testAxios();
testFetch();
</script>