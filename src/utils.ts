// A wrapper around Object.assign that adds type checking to enforce
// that "to" is a derived class of "from".
// Also limits "from" to a single value.
export function safe_assign<ToType extends FromType, FromType>(to: ToType, from: FromType) {
    Object.assign(to, from);
}

type IterableType<T> = Iterable<T> | IterableIterator<T>;

// Given two iterables, returns an iterable iterator that produces
// pairs of items from the input iterables.
export function* zip<T1, T2>(iterable1: IterableType<T1>,
                             iterable2: IterableType<T2>): IterableIterator<[T1, T2]> {
    let iterator1 = iterable1[Symbol.iterator]();
    let iterator2 = iterable2[Symbol.iterator]();

    let stop = false;
    while (!stop) {
        let item1 = iterator1.next();
        let item2 = iterator2.next();

        stop = item1.done || item2.done;
        if (!stop) {
            yield [item1.value, item2.value];
        }
    }
}

// array_add_unique, array_has_unique, and array_remove_unique are
// intended to be used together to achieve Set-like behavior with an
// array. This is a workaround until Vue implementes reactivity for
// Sets. These functions have linear complexity.

type EqualityFunctionType<T> = (first: T, second: T) => boolean;

function items_equal<T>(first: T, second: T) {
    return first === second;
}

// Adds value to the given array if value is not already in array,
// using the given equality comparison function.
export function array_add_unique<T>(array: T[], value: T,
                                    eq_func: EqualityFunctionType<T> = items_equal) {
    if (!array_has_unique(array, value, eq_func)) {
        array.push(value);
    }
}

// Returns true if the given value is in array using the given equality
// comparison function.
export function array_has_unique<T>(array: T[], value: T,
                                    eq_func: EqualityFunctionType<T> = items_equal) {
    return array.find((item: T) => eq_func(item, value)) !== undefined;
}

// Removes value from array. Returns true if value existed in array and was
// removed, false otherwise.
export function array_remove_unique<T>(array: T[], value: T,
                                       eq_func: EqualityFunctionType<T> = items_equal) {
    let index = array.findIndex((item: T) => eq_func(item, value));
    if (index !== -1) {
        array.splice(index, 1);
    }
    return index !== -1;
}
