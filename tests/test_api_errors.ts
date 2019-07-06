import { mount, Wrapper } from "@vue/test-utils";

import { HttpError } from 'ag-client-typescript';

import APIErrors from "@/components/api_errors.vue";

describe('APIErrors component tests', () => {
    let wrapper: Wrapper<APIErrors>;
    let component: APIErrors;

    beforeEach(() => {
        wrapper = mount(APIErrors);
        component = wrapper.vm;
    });

    test('Non-http error, exception re-thrown', () => {
        expect(() => {
            component.show_errors_from_response(new Error('Uncaught error'));
        }).toThrowError('Uncaught error');
    });

    test('504 error',  () => {
        component.show_errors_from_response(new HttpError(504, 'gateway timeout'));

        let messages = wrapper.findAll('.error-msg');

        expect(messages.length).toEqual(1);
        expect(messages.at(0).text()).toEqual(
            'Error: The request timed out. Please try again later.');
    });

    test('413 error', () => {
        component.show_errors_from_response(new HttpError(413, 'too big'));

        let messages = wrapper.findAll('.error-msg');

        expect(messages.length).toEqual(1);
        expect(messages.at(0).text()).toEqual(
            'Error: Request too large. If you are uploading files, please reduce their size.');
    });

    test('400 error with __all__ string', () => {
        component.show_errors_from_response(new HttpError(400, {'__all__': 'Duplicate course'}));

        let messages = wrapper.findAll('.error-msg');

        expect(messages.length).toEqual(1);
        expect(messages.at(0).text()).toEqual('Duplicate course');
    });

    test('400 error with __all__ array', () => {
        component.show_errors_from_response(
            new HttpError(400, {'__all__': ['Duplicate course', 'Very duplicate']}));

        let messages = wrapper.findAll('.error-msg');

        expect(messages.length).toEqual(1);
        expect(messages.at(0).text()).toEqual('Duplicate course');
    });

    test('400 error with specific field validation errors', () => {
        component.show_errors_from_response(
            new HttpError(400,  {
                'name': 'Name cannot be blank',
                'size': 'Size must be < 42'
            })
        );

        let messages = wrapper.findAll('.error-msg');

        expect(messages.length).toEqual(2);

        let actual_messages = [messages.at(0).text(), messages.at(1).text()];
        actual_messages.sort();

        expect(actual_messages[0]).toEqual('Error in "name": Name cannot be blank');
        expect(actual_messages[1]).toEqual('Error in "size": Size must be < 42');
    });

    test('400 error with string data', () => {
        component.show_errors_from_response(new HttpError(400,  'I am error'));
        let messages = wrapper.findAll('.error-msg');
        expect(messages.length).toEqual(1);
        expect(messages.at(0).text()).toEqual('I am error');
    });

    test('General case API error', () => {
        component.show_errors_from_response(new HttpError(403, 'forbidden'));

        let messages = wrapper.findAll('.error-msg');

        expect(messages.length).toEqual(1);
        expect(messages.at(0).text()).toEqual(
            'An unexpected error occurred: 403 "forbidden"');
    });

    test('Clear errors', () => {
        component.show_errors_from_response(new HttpError(504, 'timeout'));

        let messages = wrapper.findAll('.error-msg');
        expect(messages.length).toEqual(1);

        component.clear();

        messages = wrapper.findAll('.error-msg');
        expect(messages.length).toEqual(0);
    });

    test('Dismiss single error', () => {
        component.show_errors_from_response(
            new HttpError(400, {
                'name': 'Name cannot be blank',
                'size': 'Size must be < 42'
            })
        );

        let messages = wrapper.findAll('.error-msg');
        expect(messages.length).toEqual(2);

        wrapper.findAll('.dismiss-error').at(1).trigger('click');
        messages = wrapper.findAll('.error-msg');
        expect(messages.length).toEqual(1);
    });
});
