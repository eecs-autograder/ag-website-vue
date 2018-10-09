export class SafeMapError extends Error {}

export class SafeMap<K, V>  {
    // The type declarations for map we've seen don't actually accept
    // all iterables, so we implement this ourselves.
    constructor(iterable?: Iterable<[K, V]>) {
        this._map = new Map<K, V>();

        if (iterable !== undefined) {
            for (let [key, val] of iterable) {
                this._map.set(key, val);
            }
        }
    }

    private _map: Map<K, V>;

    get size() {
        return this._map.size;
    }

    clear() {
        this._map.clear();
    }

    delete(key: K) {
        this._map.delete(key);
    }

    for_each(callbackfn: (value: V, index: K, map: Map<K, V>) => void): void {
        return this._map.forEach(callbackfn);
    }

    get(key: K): V {
        if (!this._map.has(key)) {
            throw new SafeMapError(`Key Error: "${key}" not found in map`);
        }
        return this._map.get(key)!;
    }

    has(key: K): boolean {
        return this._map.has(key);
    }

    set(key: K, value: V): Map<K, V> {
        return this._map.set(key, value);
    }

    entries(): Iterator<[K, V]> {
        return this._map.entries();
    }

    keys(): Iterator<K> {
        return this._map.keys();
    }

    values(): Iterator<V> {
        return this._map.values();
    }

    [Symbol.iterator]() {
        return this._map[Symbol.iterator]();
    }
}
