export class SafeMapError extends Error {}

export class SafeMap<K, V>  {
    // The type declarations for map we've seen don't actually accept
    // all iterables, so we implement this ourselves.
    constructor(iterable?: Iterable<[K, V]>) {
        this.map_ = new Map<K, V>();

        if (iterable !== undefined) {
            for (let [key, val] of iterable) {
                this.map_.set(key, val);
            }
        }
    }

    private map_: Map<K, V>;

    get size() {
        return this.map_.size;
    }

    clear() {
        this.map_.clear();
    }

    delete(key: K) {
        this.map_.delete(key);
    }

    for_each(callbackfn: (value: V, index: K, map: Map<K, V>) => void): void {
        return this.map_.forEach(callbackfn);
    }

    // Returns the value in the SafeMap identified by key.
    // If the key is not found, SafeMapError is thrown if
    // no default is provided. If a default is provided and insert is true,
    // inserts the key with the provided default.
    get(key: K, default_val?: V, insert: boolean = false): V {
        if (!this.map_.has(key)) {
            if (default_val !== undefined) {
                if (insert) {
                    this.map_.set(key, default_val);
                }
                return default_val;
            }
            throw new SafeMapError(`Key Error: "${key}" not found in map`);
        }
        return this.map_.get(key)!;
    }

    has(key: K): boolean {
        return this.map_.has(key);
    }

    set(key: K, value: V) {
        return this.map_.set(key, value);
    }

    entries() {
        return this.map_.entries();
    }

    keys() {
        return this.map_.keys();
    }

    values() {
        return this.map_.values();
    }

    [Symbol.iterator]() {
        return this.map_[Symbol.iterator]();
    }
}
