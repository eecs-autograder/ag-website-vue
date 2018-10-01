export class SafeMap<K, V> extends Map<K, V> {
    constructor() {
        super();
    }
    
    get(key: K): V {
        if (!super.has(key)) {
            throw new Error("Key is not in map!");
        }
        return super.get(key)!;
    }
}


