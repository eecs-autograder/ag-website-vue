import { HttpClient } from "ag-client-typescript";

// IMPORTANT: The port in this url must be the same as the port being listened to
// in run_tests.py.
HttpClient.set_base_url('http://localhost:9999/api/');
