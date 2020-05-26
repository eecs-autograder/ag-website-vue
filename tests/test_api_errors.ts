import { mount, Wrapper } from "@vue/test-utils";

import { HttpError } from 'ag-client-typescript';
import * as sinon from 'sinon';

import APIErrors from "@/components/api_errors.vue";

import { emitted } from './utils';

describe('APIErrors component tests', () => {
    let wrapper: Wrapper<APIErrors>;

    beforeEach(() => {
        wrapper = mount(APIErrors);
    });

    test('Network error', async () => {
        sinon.stub(console, 'error');
        wrapper.vm.show_errors_from_response(new Error('Network error'));
        await wrapper.vm.$nextTick();

        let messages = wrapper.findAll('.error-msg');

        expect(messages.length).toEqual(1);
        expect(messages.at(0).text()).toContain('Network error');
        expect(emitted(wrapper, 'num_errors_changed')[0][0]).toEqual(1);
    });

    test('Non-http error', async () => {
        sinon.stub(console, 'error');
        wrapper.vm.show_errors_from_response(new Error('I am error'));
        await wrapper.vm.$nextTick();

        let messages = wrapper.findAll('.error-msg');

        expect(messages.length).toEqual(1);
        expect(messages.at(0).text()).toContain('unexpected error');
        expect(emitted(wrapper, 'num_errors_changed')[0][0]).toEqual(1);
    });

    test('504 error',  async () => {
        wrapper.vm.show_errors_from_response(new HttpError(504, 'gateway timeout'));
        await wrapper.vm.$nextTick();

        let messages = wrapper.findAll('.error-msg');

        expect(messages.length).toEqual(1);
        expect(messages.at(0).text()).toContain('The request timed out. Please try again later.');
        expect(emitted(wrapper, 'num_errors_changed')[0][0]).toEqual(1);
    });

    test('502 error',  async () => {
        wrapper.vm.show_errors_from_response(new HttpError(502, 'Bad gateway'));
        await wrapper.vm.$nextTick();

        let messages = wrapper.findAll('.error-msg');

        expect(messages.length).toEqual(1);
        expect(messages.at(0).text()).toContain('Bad gateway');
        expect(emitted(wrapper, 'num_errors_changed')[0][0]).toEqual(1);
    });

    test('413 error', async () => {
        wrapper.vm.show_errors_from_response(new HttpError(413, 'too big'));
        await wrapper.vm.$nextTick();

        let messages = wrapper.findAll('.error-msg');

        expect(messages.length).toEqual(1);
        expect(messages.at(0).text()).toEqual(
            'Error: Request too large. If you are uploading files, please reduce their size.');
        expect(emitted(wrapper, 'num_errors_changed')[0][0]).toEqual(1);
    });

    test('401 error', async () => {
        wrapper.vm.show_errors_from_response(new HttpError(401, 'too big'));
        await wrapper.vm.$nextTick();

        let messages = wrapper.findAll('.error-msg');

        expect(messages.length).toEqual(1);
        expect(messages.at(0).text()).toContain('sign in');
        expect(emitted(wrapper, 'num_errors_changed')[0][0]).toEqual(1);
    });

    test('400 error with __all__ string', async () => {
        wrapper.vm.show_errors_from_response(new HttpError(400, {'__all__': 'Duplicate course'}));
        await wrapper.vm.$nextTick();

        let messages = wrapper.findAll('.error-msg');

        expect(messages.length).toEqual(1);
        expect(messages.at(0).text()).toEqual('Duplicate course');
        expect(emitted(wrapper, 'num_errors_changed')[0][0]).toEqual(1);
    });

    test('400 error with __all__ array', async () => {
        wrapper.vm.show_errors_from_response(
            new HttpError(400, {'__all__': ['Duplicate course', 'Very duplicate']}));
        await wrapper.vm.$nextTick();

        let messages = wrapper.findAll('.error-msg');

        expect(messages.length).toEqual(1);
        expect(messages.at(0).text()).toEqual('Duplicate course');
        expect(emitted(wrapper, 'num_errors_changed')[0][0]).toEqual(1);
    });

    test('400 error with specific field validation errors', async () => {
        wrapper.vm.show_errors_from_response(
            new HttpError(400,  {
                'name': 'Name cannot be blank',
                'size': 'Size must be < 42'
            })
        );
        await wrapper.vm.$nextTick();

        let messages = wrapper.findAll('.error-msg');

        expect(messages.length).toEqual(2);

        let actual_messages = [messages.at(0).text(), messages.at(1).text()];
        actual_messages.sort();

        expect(actual_messages[0]).toEqual('Error in "name": Name cannot be blank');
        expect(actual_messages[1]).toEqual('Error in "size": Size must be < 42');
        expect(emitted(wrapper, 'num_errors_changed')[0][0]).toEqual(2);
    });

    test('400 error with string data', async () => {
        wrapper.vm.show_errors_from_response(new HttpError(400,  'I am error'));
        await wrapper.vm.$nextTick();

        let messages = wrapper.findAll('.error-msg');
        expect(messages.length).toEqual(1);
        expect(messages.at(0).text()).toEqual('I am error');
        expect(emitted(wrapper, 'num_errors_changed')[0][0]).toEqual(1);
    });

    test('General case API error', async () => {
        wrapper.vm.show_errors_from_response(new HttpError(403, 'forbidden', '/url/'));
        await wrapper.vm.$nextTick();

        let messages = wrapper.findAll('.error-msg');

        expect(messages.length).toEqual(1);
        expect(messages.at(0).text()).toContain('/url/');
        expect(messages.at(0).text()).toContain('403');
        expect(messages.at(0).text()).toContain('forbidden');
        expect(emitted(wrapper, 'num_errors_changed')[0][0]).toEqual(1);
    });

    test('Clear errors', async () => {
        wrapper.vm.show_errors_from_response(new HttpError(504, 'timeout'));
        await wrapper.vm.$nextTick();

        let messages = wrapper.findAll('.error-msg');
        expect(messages.length).toEqual(1);
        expect(emitted(wrapper, 'num_errors_changed')[0][0]).toEqual(1);

        wrapper.vm.clear();
        await wrapper.vm.$nextTick();

        messages = wrapper.findAll('.error-msg');
        expect(messages.length).toEqual(0);
        expect(emitted(wrapper, 'num_errors_changed')[1][0]).toEqual(0);
    });

    test('Dismiss single error', async () => {
        wrapper.vm.show_errors_from_response(
            new HttpError(400, {
                'name': 'Name cannot be blank',
                'size': 'Size must be < 42'
            })
        );
        await wrapper.vm.$nextTick();

        let messages = wrapper.findAll('.error-msg');
        expect(messages.length).toEqual(2);
        expect(emitted(wrapper, 'num_errors_changed')[0][0]).toEqual(2);

        await wrapper.findAll('.dismiss-error').at(1).trigger('click');
        messages = wrapper.findAll('.error-msg');
        expect(messages.length).toEqual(1);
        expect(emitted(wrapper, 'num_errors_changed')[1][0]).toEqual(1);
    });
});
