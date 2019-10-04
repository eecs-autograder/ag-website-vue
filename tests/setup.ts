import { Vue } from 'vue-property-decorator';

import { mount, shallowMount, VueClass, Wrapper } from '@vue/test-utils';

import { HttpClient } from "ag-client-typescript";
import * as sinon from 'sinon';

import {
    make_user,
    reset_provided_global_data,
    set_global_current_user
} from '@/tests/data_utils';

beforeAll(() => {
    // IMPORTANT: The port in this url must be the same as the port being listened to
    // in run_tests.py.
    HttpClient.get_instance().set_base_url('http://localhost:9999/api/');
});

let wrappers: Wrapper<Vue>[] = [];

// Creates a vue-test-utils wrapper and ensures that the wrapper is destroyed
// at the end of the test case.
export function managed_mount<V extends Vue, U>(component: VueClass<V>, options?: U) {
    let wrapper = mount(component, options);
    wrappers.push(wrapper);
    return wrapper;
}

// Like managed_mount, but uses shallowMount.
export function managed_shallow_mount<V extends Vue, U>(component: VueClass<V>, options?: U) {
    let wrapper = shallowMount(component, options);
    wrappers.push(wrapper);
    return wrapper;
}

beforeEach(() => {
    set_global_current_user(make_user());
});

afterEach(() => {
    for (let wrapper of wrappers) {
        if (wrapper.exists()) {
            wrapper.destroy();
        }
    }
    wrappers = [];
    sinon.restore();

    reset_provided_global_data();
});
