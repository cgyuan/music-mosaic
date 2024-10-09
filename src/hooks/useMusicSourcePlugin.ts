import CryptoJs from "crypto-js";
import dayjs from "dayjs";
import bigInt from "big-integer";
import qs from "qs";
import * as cheerio from "cheerio";
import he from "he";
import { nanoid } from "nanoid";
import { fetch, ResponseType, HttpOptions, HttpVerb, Body } from '@tauri-apps/api/http';
import { validatePlugin } from "@/utils/pluginValidator";
import { invoke } from '@tauri-apps/api/tauri';

const packages: Record<string, any> = {
    cheerio,
    "crypto-js": CryptoJs,
    dayjs,
    "big-integer": bigInt,
    qs,
    he
};

// Custom axios-like interface using Tauri's fetch
const createAxiosLikeMethod = (method: HttpVerb) => {
    return async (urlOrConfig: string | HttpOptions, config?: HttpOptions) => {
        let url: string;
        let options: HttpOptions;

        if (typeof urlOrConfig === 'string') {
            url = urlOrConfig;
            options = { ...config, method, url };
        } else {
            url = urlOrConfig.url!;
            options = { ...urlOrConfig, method };
        }


        // Set response type to Text to handle JSONP
        options.responseType = ResponseType.Text;
        
        // Handle query params for GET requests
        if (method === 'GET' && 'params' in options && options.params) {
            options.query = Object.entries(options.params).reduce((acc, [key, value]) => {
                acc[key] = String(value);
                return acc;
            }, {} as Record<string, string>);
            delete options.params;
        }

        // Handle data for POST requests
        if (method === 'POST' && 'data' in options) {
            if (typeof options.data === 'string') {
                options.body = Body.text(options.data);
            } else if (typeof options.data === 'object' && options.data !== null) {
                options.body = Body.json(options.data);
            }
            delete options.data;
        }

        console.log('Fetch request:', { url, options });
        
        if (url.startsWith('https://api.bilibili.com') || url.startsWith('https://m.music.migu.cn') || url.startsWith("http://mobi.kuwo.cn")) {
            if (options.query) {
                const searchParams = new URLSearchParams(options.query);
                url = `${url}?${searchParams.toString()}`;
            }
            const response = await invoke('http_request', {
                method: options.method,
                url,
                headers: options.headers,
                body: options.body
            });
            return { data: JSON.parse(response as string), status: 200, headers: {} };
        }

        try {
            const response = await fetch(url, options);
            console.log('Fetch response:', response);

            // Parse response
            let data;
            if (typeof response.data === 'string') {
                try {
                    data = JSON.parse(response.data);
                } catch (error) {
                    console.log('Response is not JSON, returning as string');
                    data = response.data;
                }
            } else {
                data = response.data;
            }

            console.log('Parsed data:', data);

            return { data, status: response.status, headers: response.headers };
        } catch (error) {
            console.error('Fetch error:', error);
            throw error;
        }
    };
};

const axiosLikeFunction = async (config: HttpOptions) => {
    const method = (config.method || 'GET').toUpperCase() as HttpVerb;
    return createAxiosLikeMethod(method)(config.url!, config);
};

const tauriAxios: any = Object.assign(axiosLikeFunction, {
    get: createAxiosLikeMethod('GET'),
    post: createAxiosLikeMethod('POST'),
    put: createAxiosLikeMethod('PUT'),
    delete: createAxiosLikeMethod('DELETE'),
    patch: createAxiosLikeMethod('PATCH'),
    head: createAxiosLikeMethod('HEAD'),
    options: createAxiosLikeMethod('OPTIONS'),
    request: createAxiosLikeMethod('GET'),
    create: (config?: any) => {
        const instance = Object.assign(
            (instanceConfig: HttpOptions) => axiosLikeFunction({ ...config, ...instanceConfig }),
            { ...tauriAxios }
        );
        instance.defaults = config || {};
        return instance;
    },
    defaults: {},
    interceptors: {
        request: { use: () => {} },
        response: { use: () => {} }
    },
    all: Promise.all.bind(Promise),
    spread: (callback: any) => (arr: any) => callback.apply(null, arr),
    isCancel: () => false,
    CancelToken: {
        source: () => ({
            token: {},
            cancel: () => {}
        })
    },
    Cancel: function Cancel(message: string) {
        return { message };
    }
});

tauriAxios.default = tauriAxios;

// Add this proxy to catch all property accesses
const axiosProxy = new Proxy(tauriAxios, {
    get: (target, prop) => {
        console.log(`Accessing axios property: ${String(prop)}`);
        if (prop in target) {
            return target[prop];
        }
        console.warn(`Axios property not implemented: ${String(prop)}`);
        return async (...args: any[]) => {
            console.log(`Called unimplemented axios method: ${String(prop)}`, args);
            // Default to a GET request if the method is unknown
            return axiosLikeFunction({ method: 'GET', url: args[0], ...args[1] });
        };
    },
    apply: (target, _thisArg, argumentsList) => {
        console.log('Axios called as a function', argumentsList);
        if (typeof argumentsList[0] === 'string') {
            return target.get(argumentsList[0], argumentsList[1]);
        }
        return target(argumentsList[0]);
    }
});

const _require = (packageName: string) => {
    if (packageName === 'axios') {
        return axiosProxy;
    }
    let pkg = packages[packageName];

    // console.log('pkg', `${packageName}`, pkg);
    
    // Special handling for big-integer
    if (packageName === 'big-integer') {
        return bigInt;
    }

    if (packageName === 'dayjs') {
        return dayjs;
    }
    
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
    
    const parsePlugin = (code: string): IPlugin.IPluginInstance => {
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
            if (_module.exports.default) {
                _instance = _module.exports.default as IPlugin.IPluginInstance;
            } else {
                _instance = _module.exports as IPlugin.IPluginInstance;
            }
            if (!validatePlugin(_instance)) {
                throw new Error('Invalid plugin');
            }
            _instance.id = nanoid();
            return _instance;
        } catch (error) {
            console.error('Error in loadPlugin:', error);
            throw error;
        }
    }

    return {
        parsePlugin
    }
}