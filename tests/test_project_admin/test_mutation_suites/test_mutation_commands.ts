import { config, mount, Wrapper } from '@vue/test-utils';

import {
    MutationTestSuite
} from 'ag-client-typescript';
import * as sinon from "sinon";

import MutationCommands from '@/components/project_admin/mutation_suites/mutation_commands.vue';

import { make_course, make_mutation_test_suite } from '@/tests/data_utils';
import {
    checkbox_is_checked,
} from '@/tests/utils';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('MutationCommands tests', () => {
    let wrapper: Wrapper<MutationCommands>;
    let mutation_test_suite: MutationTestSuite;
    let original_match_media: (query: string) => MediaQueryList;

    beforeEach(() => {
        original_match_media = window.matchMedia;
        Object.defineProperty(window, "matchMedia", {
            value: jest.fn(() => {
                return {matches: true};
            })
        });

        mutation_test_suite = make_mutation_test_suite(make_course().pk);

        wrapper = mount(MutationCommands, {
            propsData: {
                value: mutation_test_suite
            }
        });
    });

    afterEach(() => {
        sinon.restore();

        Object.defineProperty(window, "matchMedia", {
            value: original_match_media
        });

        if (wrapper.exists()) {
            wrapper.destroy();
        }
    });

    test('use_setup_command binding', async () => {
        let checkbox = wrapper.find('#use-setup-command');

        checkbox.setChecked(true);
        expect(wrapper.vm.d_mutation_test_suite!.use_setup_command).toEqual(true);
        expect(wrapper.findAll('#setup-command').length).toEqual(1);
        expect(wrapper.emitted().input.length).toEqual(1);

        checkbox.setChecked(false);
        expect(wrapper.vm.d_mutation_test_suite!.use_setup_command).toEqual(false);
        expect(wrapper.findAll('#setup-command').length).toEqual(0);
        expect(wrapper.emitted().input.length).toEqual(2);

        checkbox.setChecked(true);
        expect(wrapper.vm.d_mutation_test_suite!.use_setup_command).toEqual(true);
        expect(wrapper.findAll('#setup-command').length).toEqual(1);
        expect(wrapper.emitted().input.length).toEqual(3);

        wrapper.vm.d_mutation_test_suite!.use_setup_command = false;
        expect(checkbox_is_checked(checkbox)).toEqual(false);
        expect(wrapper.findAll('#setup-command').length).toEqual(0);

        wrapper.vm.d_mutation_test_suite!.use_setup_command = true;
        expect(checkbox_is_checked(checkbox)).toEqual(true);
        expect(wrapper.findAll('#setup-command').length).toEqual(1);
    });

    test('value Watcher', async () => {
        let another_mutation_test_suite = make_mutation_test_suite(make_course().pk);

        expect(wrapper.vm.d_mutation_test_suite).toEqual(mutation_test_suite);

        wrapper.setProps({value: another_mutation_test_suite});
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_mutation_test_suite).toEqual(another_mutation_test_suite);
    });
});
