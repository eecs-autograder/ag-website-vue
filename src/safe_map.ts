export class SafeMapError extends Error {}

export class SafeMap<K, V>  {

    private _my_map = new Map<K, V>();

    get size() {
        return this._my_map.size;
    }

    clear() {
        this._my_map.clear();
    }

    delete(key: K) {
        this._my_map.delete(key);
    }

    for_each(callbackfn: (value: V, index: K, map: Map<K, V>) => void): void {
        return this._my_map.forEach(callbackfn);
    }

    get(key: K): V {
        if (!this._my_map.has(key)) {
            throw new SafeMapError("Key: " + key + ", is not in the map!");
        }
        return this._my_map.get(key)!;
    }

    has(key: K): boolean {
        return this._my_map.has(key);
    }

    set(key: K, value: V): Map<K, V> {
        return this._my_map.set(key, value);
    }

    entries(): Iterator<[K, V]> {
        return this._my_map.entries();
    }

    keys(): Iterator<K> {
        return this._my_map.keys();
    }

    values(): Iterator<V> {
        return this._my_map.values();
    }

    [Symbol.iterator]() {
        return this._my_map[Symbol.iterator]();
    }
}


