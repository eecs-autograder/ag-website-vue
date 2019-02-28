// A wrapper around Object.assign that adds type checking to enforce
// that "to" is a derived class of "from".
// Also limits "from" to a single value.
import { AxiosError, AxiosResponse } from 'axios';
import { Vue } from 'vue/types/vue';


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

type EqualityFunctionType<ItemType, SentinelType>
    = (item: ItemType, sentinel: SentinelType) => boolean;

function items_equal<T>(first: T, second: T) {
    return first === second;
}

// Adds value to the given array if value is not already in array,
// using the given equality comparison function.
export function array_add_unique<ItemType>(
        array: ItemType[], value: ItemType,
        eq_func: EqualityFunctionType<ItemType, ItemType> = items_equal) {
    if (!array_has_unique(array, value, eq_func)) {
        array.push(value);
    }
}

// Returns true if the given value is in array using the given equality
// comparison function.
export function array_has_unique<ItemType, SentinelType>(
        array: ItemType[], value: SentinelType,
        eq_func: EqualityFunctionType<ItemType, SentinelType> = items_equal) {
    return array.find((item: ItemType) => eq_func(item, value)) !== undefined;
}

// Finds and returns the item with the given value from array.
// Throws Error if item does not exist.
export function array_get_unique<ItemType, SentinelType>(
        array: ItemType[], value: SentinelType,
        eq_func: EqualityFunctionType<ItemType, SentinelType> = items_equal) {
    let item = array.find((item: ItemType) => eq_func(item, value));
    if (item === undefined) {
        throw new UniqueArrayError(`Item not found in array: ${value}`);
    }
    return item;
}

// Removes value from array. Returns true if value existed in array and was
// removed, false otherwise.
export function array_remove_unique<ItemType, SentinelType>(
        array: ItemType[], value: SentinelType,
        eq_func: EqualityFunctionType<ItemType, SentinelType> = items_equal) {
    let index = array.findIndex((item: ItemType) => eq_func(item, value));
    if (index !== -1) {
        array.splice(index, 1);
    }
    return index !== -1;
}

export class UniqueArrayError extends Error {

}

// tslint:disable-next-line:no-any
type PropertyDescriptorType = TypedPropertyDescriptor<(...args: any[]) => any>;

export function handle_400_errors_async(
    // tslint:disable-next-line:no-any
    error_handler_func: (self: any, response: AxiosResponse) => void) {
    function decorator(target: object, property_key: string | symbol,
                       property_descriptor: PropertyDescriptorType) {
        return {
            // tslint:disable-next-line:no-any
            value: async function(...args: any[]) {
                try {
                    if (not_undefined(property_descriptor.value)) {
                        return await property_descriptor.value.apply(this, args);
                    }
                }
                catch (e) {
                    let [response, status] = get_axios_error_status(e);
                    if (status !== 400) {
                        throw response;
                    }
                    error_handler_func(this, response);
                }
            }
        };
    }
    return decorator;
}

function not_undefined<T>(arg?: T): arg is T {
    if (arg === undefined) {
        throw new Error('Value unexpectedly undefined');
    }
    return true;
}

function get_axios_error_status(error: unknown): [AxiosResponse, number] {
    let response = (error as AxiosError).response;
    if (response === undefined) {
        throw error;
    }
    return [response, response.status];
}
