interface Iterator<T> {
    next(value?: T): IteratorResult<T>;
    return?(value?: T): IteratorResult<T>;
    throw?(e?: T): IteratorResult<T>;
}

interface ForEachable<T> {
    forEach(callbackfn: (value: T) => void): void;
}

export class SafeMapError extends Error {}

export class SafeMap<K, V>  {

    my_map = new Map<K, V>();

    size() {
        return this.my_map.size;
    }

    constructor(iterable?: ForEachable<[K, V]>) { }

    clear() {
        this.my_map.clear();
    }

    delete(key: K) {
        this.my_map.delete(key);
    }

    // I'm not sure what this_arg refers to? --> was of type any, replaced it with type object
    forEach(callbackfn: (value: V, index: K, map: Map<K, V>) => void, this_arg?: object): void {
        return this.my_map.forEach(callbackfn);
    }

    get(key: K): V {
        if (!this.my_map.has(key)) {
            throw new SafeMapError("Key: " + key + ", is not in the map!");
        }
        return this.my_map.get(key)!;
    }

    has(key: K): boolean {
        return this.my_map.has(key);
    }

    set(key: K, value: V): Map<K, V> {
        return this.my_map.set(key, value);
    }

    entries(): Iterator<[K, V]> {
        return this.my_map.entries();
    }

    keys(): Iterator<K> {
        return this.my_map.keys();
    }

    values(): Iterator<V> {
        return this.my_map.values();
    }
}


