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
