import CryptoJs from "crypto-js";
import dayjs from "dayjs";
import bigInt from "big-integer";
import qs from "qs";
import * as cheerio from "cheerio";
import he from "he";
import { nanoid } from "nanoid";
import { fetch, ResponseType, HttpOptions, HttpVerb } from '@tauri-apps/api/http';
import { validatePlugin } from "../utils/pluginValidator";

const packages: Record<string, any> = {
    cheerio,
    "crypto-js": CryptoJs,
    dayjs,
    "big-integer": bigInt,
    qs,
    he
};

// Custom axios-like interface using Tauri's fetch
const createAxiosLikeMethod = (method: string) => {
    return async (urlOrConfig: string | HttpOptions, config?: HttpOptions) => {
        let url: string;
        let options: HttpOptions;

        if (typeof urlOrConfig === 'string') {
            url = urlOrConfig;
            options = config || { method: method as HttpVerb, url };
        } else {
            url = urlOrConfig.url!;
            options = { ...urlOrConfig, method: method as HttpVerb };
        }

        options.responseType = ResponseType.JSON;

        const response = await fetch(url, options);
        return { data: response.data, status: response.status, headers: response.headers };
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
    apply: (target, thisArg, argumentsList) => {
        console.log('Axios called as a function', argumentsList);
        return target(...argumentsList);
    }
});

const _require = (packageName: string) => {
    if (packageName === 'axios') {
        return axiosProxy;
    }
    let pkg = packages[packageName];
    
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