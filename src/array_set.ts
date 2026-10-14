// The type for a "less than" comparison function used by ArraySet to sort its elements and
// search for existing elements.
//
// Note that both arguments are of type SentinalType so that the order of
// the arguments doesn't matter (this lets us build an equality comparison
// out of this function). All elements in the ArraySet will be
// of ElementType, which derives from Sentinaltype.
//
// See ArraySet comments for more information on SentinalType.
// See comments for the "less_func" argument to the ArraySet constructor for information on
// how such a function is used.
type LessFuncType<SentinalType>
    = (first: SentinalType, second: SentinalType) => boolean;

// The default "less than" comparator using the "<" operator.
function default_less_func<SentinalType>(first: SentinalType, second: SentinalType) {
    return first < second;
}

// An ordered container where every element is unique.
// This data structure exposes the underlying array used
// to store the elements so that the elements can be passed to
// Vue directives such as v-for.
//
// Currently, insertions, deletions, and lookups have linear complexity. If necessary,
// a future implementation may use binary search for lookups.
//
// ElementType is the type of elements stored in the container.
// SentinalType is a type that can be used to search for elements in the container (note that
// SentinalType is set to ElementType by default).
// For example, if we have a container of Course objects that have a "name" attribute,
// it's convenient to be able to be able to search for a Course by its name without
// constructing an entire Course objects. SentinalType in this case would be {name: string}.
// This would let us do things like: array_set.has({name: "Spam"});
export class ArraySet<ElementType extends SentinalType, SentinalType = ElementType> {
    // The underlying array to store the data. This needs to be publically
    // accessible so that we get Vue reactivity.
    // DO NOT MODIFY THIS DIRECTLY.
    readonly data: ReadonlyArray<ElementType>;

    // A "less than" comparator function used to define the ordering
    // of items in data. This defaults to a comparison using the "<" operator.
    private readonly less_func_: LessFuncType<SentinalType>;

    // A comparison function suitable for Array.prototype.sort(), defined in the
    // ArraySet constructor using this._less_func().
    private readonly compare_func_: (first: SentinalType, second: SentinalType) => -1 | 0 | 1;

    // this.data is initialized to the same array referenced by data.
    // If sort_initial is true, this.data will be sorted according to less_func
    constructor(data: ElementType[] = [],
                {less_func = default_less_func, sort_initial = false}: {
                    less_func?: LessFuncType<SentinalType>,
                    sort_initial?: boolean
                } = {}) {
        this.data = data;
        this.less_func_ = less_func;

        // We define this._compare_func here to more easily avoid "this" binding issues later.
        this.compare_func_ = (first, second) => {
            if (this.less_func_(first, second)) {
                return -1;
            }
            if (this.less_func_(second, first)) {
                return 1;
            }
            return 0;
        };

        if (sort_initial) {
            this.mutable_data_.sort(this.compare_func_);
        }
    }

    size() {
        return this.data.length;
    }

    empty() {
        return this.size() === 0;
    }

    // Inserts item into the ArraySet. Returns true if the insert was successful, false if the
    // item already exists.
    insert(to_insert: ElementType): boolean {
        if (this.has(to_insert)) {
            return false;
        }

        // Find the first element that's greater than to_insert.
        // -1 indicates there's no element that's greater than to_insert.
        let insert_before = this.data.findIndex((element) => this.less_func_(to_insert, element));
        if (insert_before === -1) {
            this.mutable_data_.push(to_insert);
        }
        else {
            this.mutable_data_.splice(insert_before, 0, to_insert);
        }

        return true;
    }

    has(item: SentinalType): boolean {
        return this.index_of_(item, false) !== -1;
    }

    // Returns the element in the ArraySet identified by sentinal.
    // If the element is not found, ArraySetElementNotFoundError is thrown if
    // throw_if_not_found is true, otherwise returns null.
    get(sentinal: SentinalType, throw_if_not_found?: true): ElementType;
    get(sentinal: SentinalType, throw_if_not_found?: false): ElementType | null;
    get(sentinal: SentinalType, throw_if_not_found: boolean = true): ElementType | null {
        let index = this.index_of_(sentinal, throw_if_not_found);
        if (index === -1) {
            return null;
        }
        return this.data[index];
    }

    // Removes the element identified by sentinal from the ArraySet and returns true.
    // If the element is not found, ArraySetElementNotFoundError is thrown if
    // throw_if_not_found is true, otherwise returns false.
    remove(sentinal: SentinalType, throw_if_not_found: boolean = true): boolean {
        let index = this.index_of_(sentinal, throw_if_not_found);
        if (index === -1) {
            return false;
        }
        this.mutable_data_.splice(index, 1);
        return true;
    }

    // Returns the index of the element in ArraySet identified by sentinal.
    // Returns -1 if the element is not found.
    private index_of_(sentinal: SentinalType, throw_if_not_found: boolean): number {
        let index = this.data.findIndex((elt) => this.items_equal_(elt, sentinal));
        if (index === -1 && throw_if_not_found) {
            throw new ArraySetElementNotFoundError(`Element ${sentinal} not found`);
        }
        return index;
    }

    private items_equal_(first: SentinalType, second: SentinalType): boolean {
        return this.compare_func_(first, second) === 0;
    }

    // FOR INTERNAL USE ONLY
    // This lets us modify this.data internally while having it behave as read only
    // to users who access it through ArraySet.data (such as in vue components).
    //
    // Note that "reversing" this approach (making this.data private and exposing a
    // property that returns this.data as a ReadonlArray) doesn't work with Vue's
    // reactivity.
    private get mutable_data_() {
        return <ElementType[]> this.data;
    }
}

export class ArraySetElementNotFoundError extends Error {}

// Some sentinal types and comparators

export type HasPK = {pk: number};

export function member_names_less(first: HasMemberNames, second: HasMemberNames) {
  return first.member_names[0] < second.member_names[0];
}

export type HasMemberNames = {member_names: string[]};

export function pk_less(first: HasPK, second: HasPK) {
  return first.pk < second.pk;
}

export function pk_more(first: HasPK, second: HasPK) {
    return first.pk > second.pk;
}
