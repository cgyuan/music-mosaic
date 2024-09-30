import { ref, onMounted, onUnmounted, Ref } from 'vue';
import Dexie from 'dexie';
import mitt from 'mitt';

const basicType = ["number", "string", "boolean", "null", "undefined"];

const ee = mitt();

const EvtNames = {
  USER_PREFERENCE_UPDATE: "USER_PREFERENCE_UPDATE",
};

interface IUserPreference {
  IType: Record<string, any>;
  IDBType: Record<string, any>;
}

type UserPreferenceUpdateEvent<K extends keyof IUserPreference['IType']> = { key: K; value: IUserPreference["IType"][K] | null };

function setUserPreference<K extends keyof IUserPreference['IType']>(
  key: K,
  value: IUserPreference['IType'][K]
) {
  try {
    let newValue;
    if (basicType.includes(typeof value)) {
      newValue = value;
    } else {
      newValue = JSON.stringify(value);
    }
    localStorage.setItem(key, newValue as any);
    ee.emit(EvtNames.USER_PREFERENCE_UPDATE, { key, value });
  } catch {
    // 设置失败
  }
}

function removeUserPreference<K extends keyof IUserPreference['IType']>(key: K) {
  try {
    localStorage.removeItem(key);
    ee.emit(EvtNames.USER_PREFERENCE_UPDATE, { key, value: null });
  } catch {}
}

function getUserPreference<K extends keyof IUserPreference['IType']>(
  key: K
): IUserPreference['IType'][K] | null {
  let rawData = null;
  try {
    rawData = localStorage.getItem(key);
    if (!rawData) {
      return null;
    }
    return JSON.parse(rawData);
  } catch {
    return rawData as any;
  }
}

export function useUserPreference<K extends keyof IUserPreference['IType']>(
  key: K
): [Ref<IUserPreference['IType'][K] | null>, (newState: IUserPreference['IType'][K] | null) => void] {
  const state = ref<IUserPreference['IType'][K] | null>(getUserPreference(key));

  function setState(newState: IUserPreference['IType'][K] | null) {
    setUserPreference(key, newState);
  }

  const updateFn = ({ key: updateKey, value }: { key: K; value: IUserPreference['IType'][K] | null }) => {
    if (key === updateKey) {
      state.value = value;
    }
  };

  const updateFnStorage = (e: StorageEvent) => {
    if (e.key === key) {
      try {
        state.value = JSON.parse(e.newValue as string);
      } catch {
        state.value = e.newValue as any;
      }
    }
  };

  onMounted(() => {
    ee.on(EvtNames.USER_PREFERENCE_UPDATE, (event: unknown) => {
      updateFn(event as UserPreferenceUpdateEvent<K>);
    });
    window.addEventListener("storage", updateFnStorage);
  });

  onUnmounted(() => {
    ee.off(EvtNames.USER_PREFERENCE_UPDATE, (event: unknown) => updateFn(event as UserPreferenceUpdateEvent<K>));
    window.removeEventListener("storage", updateFnStorage);
  });

  return [state, setState];
}

class UserPreferenceDB extends Dexie {
  perference!: Dexie.Table<{ key: string; value: any }, string>;

  constructor() {
    super("userPerferenceDB");
    this.version(1).stores({
      perference: "&key",
    });
  }
}

const upDB = new UserPreferenceDB();

const dbKeyUpdateCbs = new Map<keyof IUserPreference['IDBType'], Set<(value: any) => void>>();

export async function setUserPreferenceIDB<K extends keyof IUserPreference['IDBType']>(
  key: K,
  value: IUserPreference['IDBType'][K]
): Promise<boolean> {
  try {
    await upDB.transaction("readwrite", upDB.perference, async () => {
      await upDB.perference.put({
        key,
        value,
      });
    });
    const cb = dbKeyUpdateCbs.get(key);
    cb?.forEach((it) => it?.(value));
    return true;
  } catch {
    return false;
  }
}

export async function getUserPreferenceIDB<K extends keyof IUserPreference['IDBType']>(
  key: K
): Promise<IUserPreference['IDBType'][K] | null> {
  try {
    return (
      (
        await upDB.transaction("readonly", upDB.perference, async () => {
          return await upDB.perference.get(key);
        })
      )?.value ?? null
    );
  } catch {
    return null;
  }
}

export function useUserPreferenceIDBValue<K extends keyof IUserPreference['IDBType']>(
  key: K
): Ref<IUserPreference['IDBType'][K] | null> {
  const state = ref<IUserPreference['IDBType'][K] | null>(null);

  onMounted(async () => {
    try {
      const result = await getUserPreferenceIDB(key);
      state.value = result;
    } catch {
    } finally {
      if (dbKeyUpdateCbs.has(key)) {
        dbKeyUpdateCbs.get(key)!.add((val) => state.value = val);
      } else {
        dbKeyUpdateCbs.set(key, new Set([(val) => state.value = val]));
      }
    }
  });

  return state;
}
