import CryptoJs from "crypto-js";
import dayjs from "dayjs";
import bigInt from "big-integer";
import qs from "qs";
import * as cheerio from "cheerio";
import he from "he";
import { fetch, ResponseType } from '@tauri-apps/api/http';

const packages: Record<string, any> = {
    cheerio,
    "crypto-js": CryptoJs,
    dayjs,
    "big-integer": bigInt,
    qs,
    he
};

// Custom axios-like interface using Tauri's fetch
const tauriAxios = {
    get: async (url: string, config?: any) => {
        const response = await fetch(url, {
            method: 'GET',
            headers: config?.headers,
            responseType: ResponseType.JSON
        });
        return { data: response.data };
    },
    post: async (url: string, data?: any, config?: any) => {
        const response = await fetch(url, {
            method: 'POST',
            headers: config?.headers,
            body: data,
            responseType: ResponseType.JSON
        });
        return { data: response.data };
    }
};
// Add default property to match axios structure
(tauriAxios as any).default = tauriAxios;

const _require = (packageName: string) => {
    if (packageName === 'axios') {
        return tauriAxios;
    }
    let pkg = packages[packageName];
    console.log(packageName, pkg);
    
    // Create a new object with the same properties as pkg
    let wrappedPkg = Object.create(null);
    Object.keys(pkg).forEach(key => {
        wrappedPkg[key] = pkg[key];
    });
    
    // Add default property to the new object
    wrappedPkg.default = wrappedPkg;
    
    return wrappedPkg;
};

export const useMusicSourcePlugin = () => {
    const loadPlugin = (code: string): IPlugin.IPluginInstance => {
        console.log('Attempting to load plugin...');
        const _module: any = { exports: {} };
        try {
            let _instance = Function(`
                'use strict';
                return function(require, __musicfree_require, module, exports, console) {
                    ${code}
                }
            `)()(
                _require,
                _require,
                _module,
                _module.exports,
                console
            );
            console.log('Plugin function executed');
            if (_module.exports.default) {
                _instance = _module.exports.default as IPlugin.IPluginInstance;
            } else {
                _instance = _module.exports as IPlugin.IPluginInstance;
            }
            console.log('Plugin instance created');
            return _instance;
        } catch (error) {
            console.error('Error in loadPlugin:', error);
            throw error;
        }
    }

    return {
        loadPlugin
    }
}