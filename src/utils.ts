// A wrapper around Object.assign that adds type checking to enforce
// that "to" is a derived class of "from".
// Also limits "from" to a single value.
import { AxiosError, AxiosResponse } from 'axios';
import { Dictionary } from 'vue-router/types/router';

export function safe_assign<ToType extends FromType, FromType>(to: ToType, from: FromType) {
    Object.assign(to, from);
}

// export function deep_copy<T>(obj: T): T {
//     let my_obj: T =  JSON.parse(JSON.stringify(obj));
//     return my_obj;
// }

// Used to make a deep copy of an object whose constructor takes an object
// of the same type as its only argument.
// This is needed to get around the fact that the "JSON.parse(JSON.stringify(...))"
// deep copy gives us an object with no methods.
export function deep_copy<T, Constructor extends {new(args: T): T}>(instance: T,
                                                                    ctor: Constructor): T {
    return new ctor(JSON.parse(JSON.stringify(instance)));
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
// array. This is a workaround until Vue implements reactivity for
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

export class UniqueArrayError extends Error {}

// tslint:disable-next-line:no-any
type PropertyDescriptorType = TypedPropertyDescriptor<(...args: any[]) => any>;

export function handle_api_errors_async(
    // tslint:disable-next-line:no-any
    error_handler_func: (self: any, response: unknown) => void) {
    function decorator(target: object, property_key: string | symbol,
                       property_descriptor: PropertyDescriptorType) {
        return {
            // tslint:disable-next-line:no-any
            value: async function(...args: any[]) {
                try {
                    return await property_descriptor.value!.apply(this, args);
                }
                catch (e) {
                    error_handler_func(this, e);
                }
            }
        };
    }
    return decorator;
}

export function get_axios_error_status(error: unknown): [AxiosResponse, number] {
    let response = (error as AxiosError).response;
    if (response === undefined) {
        throw error;
    }
    return [response, response.status];
}

// Returns the value associated with key in query params. If more than one value is associated with
// the key, returns the first of those values.
export function get_query_param(query_params: Dictionary<string | string[]>, key: string) {
    let query_value = query_params[key];
    if (Array.isArray(query_value)) {
        console.assert(query_value.length !== 0);
        return query_value[0];
    }
    return query_value === undefined ? null : query_value;
}
