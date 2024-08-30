import { Dictionary } from 'vue-router/types/router';
import type { Ref } from 'vue'

import { Course } from 'ag-client-typescript';
// @ts-ignore
import moment from "moment-timezone";

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

export async function toggle_ref<ReturnType>(ref: Ref<boolean>, body: () => Promise<ReturnType>) {
    if (typeof ref.value !== 'boolean') {
        throw new TypeError(`Expected a ref of boolean type, but got "${typeof ref.value}"`)
    }
    let original = ref.value
    try {
        ref.value = !original
        return await body();
    }
    finally {
        ref.value = original
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

        stop = (item1.done ?? false) || (item2.done ?? false);
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
export function get_query_param(
    query_params: Dictionary<string | (string | null)[]>,
    key: string
) {
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
        return '--- --, ----, --:-- -- ---';
    }
    return moment(datetime).tz(moment.tz.guess()).format('MMMM DD, YYYY, hh:mm A z');
}

export function format_datetime_short(datetime: string): string {
    return moment(datetime).tz(moment.tz.guess()).format("MMM DD, 'YY, hh:mm A z");
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
export function assert_not_null<T>(obj: T | null | undefined, msg?: string): asserts obj is T {
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

export function blob_to_string(blob: Promise<Blob>): Promise<string> {
    let reader = new FileReader();
    return new Promise(async (resolve, reject) => {
        reader.onload = () => {
            resolve(<string> reader.result);
        };

        /* istanbul ignore next */
        reader.onerror = () => {
            reader.abort();
            reject(new DOMException("Error converting blob to string."));
        };

        reader.readAsText(await blob);
    });
}
