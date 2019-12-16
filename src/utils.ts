import { Dictionary } from 'vue-router/types/router';

import { Course } from 'ag-client-typescript';
// @ts-ignore
import moment from "moment";

export function sleep(seconds: number) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

// A wrapper around Object.assign that adds type checking to enforce
// that "to" is a derived class of "from".
// Also limits "from" to a single value.
export function safe_assign<ToType extends FromType, FromType>(to: ToType, from: FromType) {
    Object.assign(to, from);
}

// Used to make a deep copy of an object whose constructor takes an object
// of the same type as its only argument.
// This is needed to get around the fact that the "JSON.parse(JSON.stringify(...))"
// deep copy gives us an object with no methods.
export function deep_copy<T, Constructor extends {new(args: T): T}>(instance: T,
                                                                    ctor: Constructor): T {
    return new ctor(JSON.parse(JSON.stringify(instance)));
}

// Given an object and a field name for that object, negates the field,
// calls the given function (and awaiting on its returned promise), and
// negates the field again, returning it to its original value.
// IMPORTANT: make sure to either return or await the return value of this
// function.
// Usage examples:
//
// return toggle(this, 'd_saving', () => {
//     (<APIErrors> this.$refs.api_errors).clear();
//     return this.d_ag_test_command!.save();
// });
//
// await toggle(this, 'd_saving', async () => {
//   (<APIErrors> this.$refs.api_errors).clear();
//   await this.d_ag_test_command!.save();
// });
export async function toggle<T, Key extends keyof T, ReturnType>(
  obj: T, key: Key, body: () => Promise<ReturnType>
) {
    if (typeof obj[key] !== 'boolean') {
        // istanbul ignore next
        throw new TypeError(`Expected a property of boolean type, but got "${typeof obj[key]}"`);
    }
    let original = <boolean> <unknown> obj[key];
    try {
        (<boolean> <unknown> obj[key]) = !original;
        return await body();
    }
    finally {
        (<boolean> <unknown> obj[key]) = original;
    }
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

export function* chain<T>(...iterables: IterableType<T>[]): IterableIterator<T> {
    for (let iterable of iterables) {
        for (let item of iterable) {
            yield item;
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
        array: ReadonlyArray<Readonly<ItemType>>, value: SentinelType,
        eq_func: EqualityFunctionType<ItemType, SentinelType> = items_equal) {
    return array.find((item: ItemType) => eq_func(item, value)) !== undefined;
}

// Finds and returns the item with the given value from array.
// Throws Error if item does not exist.
export function array_get_unique<ItemType, SentinelType>(
        array: ReadonlyArray<Readonly<ItemType>>, value: SentinelType,
        eq_func: EqualityFunctionType<ItemType, SentinelType> = items_equal) {
    let item = array.find((elt: ItemType) => eq_func(elt, value));
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

export function format_course_name(course: Course) {
    let result = course.name;
    if (course.semester !== null) {
        result += ' ' + course.semester;
    }
    if (course.year !== null) {
        result += ' ' + course.year.toString();
    }
    return result;
}

// Returns the value associated with key in query params. If more than one value is associated with
// the key, returns the first of those values.
export function get_query_param(query_params: Dictionary<string | string[]>, key: string) {
    let query_value = query_params[key];
    // istanbul ignore next
    if (Array.isArray(query_value)) {
        console.assert(query_value.length !== 0);
        return query_value[0];
    }
    return query_value === undefined ? null : query_value;
}

export function format_datetime(datetime: string | null): string {
    if (datetime === null) {
        return '--- --, ----, --:-- --';
    }
    return moment(datetime).format('MMMM DD, YYYY, hh:mm A');
}

export function format_datetime_short(datetime: string): string {
    return moment(datetime).format("MMM DD, 'YY, hh:mm A");
}

export function format_time(time: string | null): string {
    if (time === null) {
        return '--:-- --';
    }
    return moment(time, ['HH:mm', 'HH:mm:ss']).format('hh:mm A');
}

const ONE_GB = Math.pow(10, 9);
const ONE_MB = Math.pow(10, 6);
const ONE_KB = 1000;

export function format_mem_size(size: number): string {
    if (size > ONE_GB) {
        return `${convert_size(size, ONE_GB)} GB`;
    }
    if (size > ONE_MB) {
        return `${convert_size(size, ONE_MB)} MB`;
    }
    if (size > ONE_KB) {
        return `${convert_size(size, ONE_KB)} KB`;
    }
    return `${size} bytes`;
}

function convert_size(size: number, div_by: number) {
    // The + converts the string back to a number, which chops off extra
    // zeros.
    return +(size * 1. / div_by).toFixed(2);
}

const VALID_EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

export function is_email(str: string): boolean {
    return VALID_EMAIL_REGEX.test(str);
}

// A type guard that throws NonNullAssertionError if the given object is null or undefined.
// This can be used one of two ways:
// - As a type guard in a conditional.
// - Call this function on the expression that may be null, then use the non-null assertion
//   operator (!) on subsequent uses of the expression. This has the disadvantage of
//   more error-prone, but has the advantage of not artificially decreasing our branch coverage.
// Note: In test case code, using the non-null-assertion operator without calling this
// function is OK.
export function assert_not_null<T>(obj: T | null | undefined, msg?: string): obj is T {
    // istanbul ignore next
    if (msg === undefined) {
        msg = 'Value was unexpectedly null or undefined';
    }
    // istanbul ignore next
    if (obj === null) {
        throw new NonNullAssertionError(msg);
    }
    // istanbul ignore next
    if (obj === undefined) {
        throw new NonNullAssertionError(msg);
    }
    return true;
}

export class NonNullAssertionError extends Error {
    // See https://github.com/Microsoft/TypeScript/issues/13965
    __proto__: Error; // tslint:disable-line

    // istanbul ignore next
    constructor(msg?: string) {
        const actual_proto = new.target.prototype;
        super(msg);
        this.__proto__ = actual_proto;
    }
}
