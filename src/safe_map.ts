interface Iterator<T> {
    next(value?: any): IteratorResult<T>;
    return?(value?: any): IteratorResult<T>;
    throw?(e?: any): IteratorResult<T>;
}

interface ForEachable<T> {
    forEach(callbackfn: (value: T) => void): void;
}

export class SafeMapError extends Error {}

export class SafeMap<K, V>  {

    my_map = new Map<K, V>();

    constructor(iterable?: ForEachable<[K, V]>) { }

    clear() {
        this.my_map.clear();
        this.size = 0;
    }

    delete(key: K) {
        this.my_map.delete(key);
        this.size -= 1;
    }

    forEach(callbackfn: (value: V, index: K, map: Map<K, V>) => void, this_arg?: any): void {
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

    set(key: K, value?: V): Map<K, V> {
        this.size += 1;
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

    // what to do with this var
    size: number = 0;
}


