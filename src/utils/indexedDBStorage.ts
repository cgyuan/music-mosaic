import localforage from "localforage";

export const indexedDBStorage = {
    getItem: async (key: string) => {
      return localforage.getItem(key)
    },
    setItem: async (key: string, value: any) => {
      return localforage.setItem(key, value)
    },
    removeItem: async (key: string) => {
      return localforage.removeItem(key)
    },
};