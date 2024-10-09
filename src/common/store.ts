import { ref, computed, onBeforeUnmount, ComputedRef } from 'vue';

type UpdateFunc<T> = (prev: T) => T;

class StateMapper<T> {
  private getFun: () => T;
  public cbs: Set<() => void> = new Set();

  constructor(getFun: () => T) {
    this.getFun = getFun;
  }

  notify() {
    this.cbs.forEach(cb => cb());
  }

  useMappedState(): ComputedRef<T> {
    const state = ref<T>(this.getFun());

    const updateState = () => {
      state.value = this.getFun();
    };

    this.cbs.add(updateState);

    onBeforeUnmount(() => {
      console.log("onBeforeUnmount", this.cbs);
      this.cbs.delete(updateState);
    });

    return computed(() => state.value);
  }
}

export default class Store<T> {
  private value: T;
  private stateMapper: StateMapper<T>;
  private valueChangeCbs: Set<(newValue: T, oldValue: T) => void> = new Set();

  constructor(initValue: T) {
    this.value = initValue;
    this.stateMapper = new StateMapper(() => this.getValue());
  }

  public getValue(): T {
    return this.value;
  }

  public useValue = (): ComputedRef<T> => {
    return this.stateMapper.useMappedState();
  }

  public setValue(value: T | UpdateFunc<T>): void {
    // console.log("setValue", value);
    let newValue: T;
    if (typeof value === 'function') {
      newValue = (value as UpdateFunc<T>)(this.value);
    } else {
      newValue = value;
    }

    this.valueChangeCbs.forEach(cb => cb(newValue, this.value));
    this.value = newValue;
    this.stateMapper.notify();
  }

  public onValueChange(cb: (newValue: T, oldValue: T) => void): () => void {
    this.valueChangeCbs.add(cb);
    return () => {
      this.valueChangeCbs.delete(cb);
    };
  }
}

export function useStore<T>(store: Store<T>): [ComputedRef<T>, (value: T | UpdateFunc<T>) => void] {
  return [store.useValue(), store.setValue.bind(store)];
}
