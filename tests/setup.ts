import { HttpClient } from "ag-client-typescript";
import * as sinon from 'sinon';

import { make_user, set_global_current_user } from '@/tests/data_utils';

// IMPORTANT: The port in this url must be the same as the port being listened to
// in run_tests.py.
HttpClient.get_instance().set_base_url('http://localhost:9999/api/');

beforeEach(() => {
    set_global_current_user(make_user());
});

afterEach(() => {
    sinon.restore();
});
