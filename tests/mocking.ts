import { Wrapper } from '@vue/test-utils';
import Vue from "vue";

export function patch_object_prototype(obj: object, new_prototype: object, body: () => void) {
    let original_prototype = Object.getPrototypeOf(obj);
    try {
        Object.setPrototypeOf(obj, new_prototype);
        body();
    }
    finally {
        Object.setPrototypeOf(obj, original_prototype);
    }
}

export function patch_component_data_member(
        component_instance: Vue, member_name: string, new_value: unknown, body: () => void) {
    let original_value = component_instance.$data[member_name];
    try {
        component_instance.$data[member_name] = new_value;
        body();
    }
    finally {
        component_instance.$data[member_name] = original_value;
    }
}

export function patch_component_method(
        component_wrapper: Wrapper<Vue>, method_name: string,
        new_method: (...args: unknown[]) => unknown | void, body: () => void) {
    let original_method = component_wrapper.vm.$options.methods![method_name];
    try {
        component_wrapper.setMethods({[method_name]: new_method});
        body();
    }
    finally {
        component_wrapper.setMethods({[method_name]: original_method});
    }
}

export async function patch_async_class_method(
        /* tslint:disable-next-line:no-any */
        class_: {prototype: any},
        method_name: string,
        new_method: (...args: unknown[]) => Promise<unknown | void>,
        body: () => Promise<void>) {
    let original_method = class_.prototype[method_name];
    try {
        class_.prototype[method_name] = new_method;
        await body();
    }
    finally {
        class_.prototype[method_name] = original_method;
    }
}
