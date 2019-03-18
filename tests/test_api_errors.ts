import { mount, Wrapper, WrapperArray } from "@vue/test-utils";
import { AxiosError } from 'axios';

import APIErrors from "@/components/api_errors.vue";
import { Vue } from "vue/types/vue";


describe('APIErrors component tests', () => {
    let wrapper: Wrapper<APIErrors>;
    let component: APIErrors;
    let base_axios_error: AxiosError;

    beforeEach(() => {
        base_axios_error = {
            name: '',
            message: '',
            config: {},
            response: {
                data: {},
                status: 0,
                statusText: '',
                headers: {},
                config: {}
            }
        };

        wrapper = mount(APIErrors);
        component = wrapper.vm;
    });

    test('Non-http error, exception re-thrown', () => {
        expect(() => {
            component.show_errors_from_response(new Error('Uncaught error'));
        }).toThrowError('Uncaught error');
    });

    test('504 error',  () => {
        base_axios_error.response!.status = 504;
        component.show_errors_from_response(base_axios_error);

        let messages = wrapper.findAll('.error-msg');

        expect(messages.length).toEqual(1);
        expect(messages.at(0).text()).toEqual(
            'Error: The request timed out. Please try again later.');
    });

    test('413 error', () => {
        base_axios_error.response!.status = 413;
        component.show_errors_from_response(base_axios_error);

        let messages = wrapper.findAll('.error-msg');

        expect(messages.length).toEqual(1);
        expect(messages.at(0).text()).toEqual(
            'Error: Request too large. If you are uploading files, please reduce their size.');
    });

    test('400 error with __all__ string', () => {
        base_axios_error.response!.status = 400;
        base_axios_error.response!.data = {
            '__all__': 'Duplicate course'
        };
        component.show_errors_from_response(base_axios_error);

        let messages = wrapper.findAll('.error-msg');

        expect(messages.length).toEqual(1);
        expect(messages.at(0).text()).toEqual('Duplicate course');
    });

    test('400 error with __all__ array', () => {
        base_axios_error.response!.status = 400;
        base_axios_error.response!.data = {
            '__all__': ['Duplicate course', 'Very duplicate']
        };
        component.show_errors_from_response(base_axios_error);

        let messages = wrapper.findAll('.error-msg');

        expect(messages.length).toEqual(1);
        expect(messages.at(0).text()).toEqual('Duplicate course');
    });

    test('400 error with specific field validation errors', () => {
        base_axios_error.response!.status = 400;
        base_axios_error.response!.data = {
            'name': 'Name cannot be blank',
            'size': 'Size must be < 42'
        };
        component.show_errors_from_response(base_axios_error);

        let messages = wrapper.findAll('.error-msg');

        expect(messages.length).toEqual(2);

        let actual_messages = [messages.at(0).text(), messages.at(1).text()];
        actual_messages.sort();

        expect(actual_messages[0]).toEqual('Error in "name": Name cannot be blank');
        expect(actual_messages[1]).toEqual('Error in "size": Size must be < 42');
    });

    test('General case API error', () => {
        base_axios_error.response!.status = 403;
        base_axios_error.response!.statusText = 'Forbidden';
        component.show_errors_from_response(base_axios_error);

        let messages = wrapper.findAll('.error-msg');

        expect(messages.length).toEqual(1);
        expect(messages.at(0).text()).toEqual(
            'An unexpected error occurred: 403 Forbidden.');
    });

    test('Clear errors', () => {
        base_axios_error.response!.status = 504;
        component.show_errors_from_response(base_axios_error);

        let messages = wrapper.findAll('.error-msg');
        expect(messages.length).toEqual(1);

        component.clear();

        messages = wrapper.findAll('.error-msg');
        expect(messages.length).toEqual(0);
    });

    test('Dismiss single error', () => {
        base_axios_error.response!.status = 400;
        base_axios_error.response!.data = {
            'name': 'Name cannot be blank',
            'size': 'Size must be < 42'
        };
        component.show_errors_from_response(base_axios_error);

        let messages = wrapper.findAll('.error-msg');
        expect(messages.length).toEqual(2);

        wrapper.findAll('.dismiss-error').at(1).trigger('click');
        messages = wrapper.findAll('.error-msg');
        expect(messages.length).toEqual(1);
    });
});
