// The type for a "less than" comparison function used by ArrayMap to sort its elements and
// search for existing elements.
type LessFuncType<KeyType>
    = (first: KeyType, second: KeyType) => boolean;

// The default "less than" comparator using the "<" operator.
function default_less_func<KeyType>(first: KeyType, second: KeyType) {
    return first < second;
}

// An ordered container of (key, value) pairs where every key is unique.
// This data structure exposes the underlying array used
// to store the elements so that the elements can be passed to
// Vue directives such as v-for.
//
// Currently, insertions, deletions, and lookups have linear complexity. If necessary,
// a future implementation may use binary search for lookups.
export class ArrayMap<KeyType, ValueType> {
    // The underlying array to store the data.
    private data: [KeyType, ValueType][] = [];

    // A "less than" comparator function used to define the ordering
    // of keys in data. This defaults to a comparison using the "<" operator.
    private readonly _less_func: LessFuncType<KeyType>;

    private readonly _compare_func: (first: KeyType, second: KeyType) => -1 | 0 | 1;

    // this.data is initialized to the same array referenced by data.
    // If sort_initial is true, this.data will be sorted according to less_func
    constructor(less_func: LessFuncType<KeyType> = default_less_func) {
        this._less_func = less_func;

        // We define this._compare_func here to more easily avoid "this" binding issues later.
        this._compare_func = (first, second) => {
            if (this._less_func(first, second)) {
                return -1;
            }
            if (this._less_func(second, first)) {
                return 1;
            }
            return 0;
        };
    }

    size() {
        return this.data.length;
    }

    empty() {
        return this.size() === 0;
    }

    // Inserts item into the ArrayMap. Returns true if the insert was successful, false if the
    // item already exists.
    insert(key: KeyType, value: ValueType): boolean {
        if (this.has(key)) {
            return false;
        }

        // Find the first element that's greater than to_insert.
        // -1 indicates there's no element that's greater than to_insert.
        let insert_before = this.data.findIndex(([key_, val]) => this._less_func(key, key_));
        if (insert_before === -1) {
            this.data.push([key, value]);
        }
        else {
            this.data.splice(insert_before, 0, [key, value]);
        }

        return true;
    }

    has(key: KeyType): boolean {
        return this._index_of(key, false) !== -1;
    }

    // Returns the value in the ArrayMap identified by key.
    // If the key is not found, ArrayMapElementNotFoundError is thrown if
    // no default is provided. If a default is provided and insert is true,
    // inserts the key with the provided default.
    get(key: KeyType, default_val?: ValueType, insert: boolean = false): ValueType {
        let index = this._index_of(key, default_val === undefined);
        if (index === -1) {
            if (insert) {
                this.insert(key, default_val!);
            }
            return default_val!;
        }
        return this.data[index][1];
    }

    // Removes the element identified by key from the ArrayMap and returns true.
    // If the element is not found, ArraySetElementNotFoundError is thrown if
    // throw_if_not_found is true, otherwise returns false.
    remove(key: KeyType, throw_if_not_found: boolean = true): boolean {
        let index = this._index_of(key, throw_if_not_found);
        if (index === -1) {
            return false;
        }
        this.data.splice(index, 1);
        return true;
    }

    [Symbol.iterator]() {
        return this.data[Symbol.iterator]();
    }

    // Returns the index of the element in ArrayMap identified by sentinal.
    // Returns -1 if the element is not found.
    private _index_of(key: KeyType, throw_if_not_found: boolean): number {
        let index = this.data.findIndex(([key_, val]) => this._items_equal(key_, key));
        if (index === -1 && throw_if_not_found) {
            throw new ArrayMapElementNotFoundError(`Key ${key} not found`);
        }
        return index;
    }

    private _items_equal(first: KeyType, second: KeyType): boolean {
        return this._compare_func(first, second) === 0;
    }
}

export class ArrayMapElementNotFoundError extends Error {
    // See https://github.com/Microsoft/TypeScript/issues/13965
    __proto__: Error; // tslint:disable-line

    constructor(msg?: string) {
        const actual_proto = new.target.prototype;
        super(msg);
        this.__proto__ = actual_proto;
    }
}
