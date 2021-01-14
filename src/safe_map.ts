export class SafeMapError extends Error {
    // See https://github.com/Microsoft/TypeScript/issues/13965
    __proto__: Error; // tslint:disable-line

    constructor(msg?: string) {
        const actual_proto = new.target.prototype;
        super(msg);
        this.__proto__ = actual_proto;
    }
}

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

    // Returns the value in the SafeMap identified by key.
    // If the key is not found, SafeMapError is thrown if
    // no default is provided. If a default is provided and insert is true,
    // inserts the key with the provided default.
    get(key: K, default_val?: V, insert: boolean = false): V {
        if (!this._map.has(key)) {
            if (default_val !== undefined) {
                if (insert) {
                    this._map.set(key, default_val);
                }
                return default_val;
            }
            throw new SafeMapError(`Key Error: "${key}" not found in map`);
        }
        return this._map.get(key)!;
    }

    has(key: K): boolean {
        return this._map.has(key);
    }

    set(key: K, value: V) {
        return this._map.set(key, value);
    }

    entries() {
        return this._map.entries();
    }

    keys() {
        return this._map.keys();
    }

    values() {
        return this._map.values();
    }

    [Symbol.iterator]() {
        return this._map[Symbol.iterator]();
    }
}
