export function patch_object_prototype(obj: object, new_prototype: object, body: () => {}) {
    let original_prototype = Object.getPrototypeOf(obj);
    try {
        Object.setPrototypeOf(obj, new_prototype);
        body();
    }
    finally {
        Object.setPrototypeOf(obj, original_prototype);
    }
}
