import * as vue_test_utils from '@vue/test-utils';

import { HttpClient, User, UserRoles } from "ag-client-typescript";
import * as sinon from 'sinon';

import { GlobalData } from '@/App.vue';

import { make_user } from '@/tests/data_utils';

// IMPORTANT: The port in this url must be the same as the port being listened to
// in run_tests.py.
HttpClient.get_instance().set_base_url('http://localhost:9999/api/');

beforeEach(() => {
    let globals = new GlobalData();
    globals.current_user = make_user();
    vue_test_utils.config.provide!['globals'] = globals;
});

afterEach(() => {
    sinon.restore();
});
