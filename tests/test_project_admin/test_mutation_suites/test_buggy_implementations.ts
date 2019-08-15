import { config, mount, Wrapper } from '@vue/test-utils';

import {
    MutationTestSuite, Project
} from 'ag-client-typescript';
import * as sinon from "sinon";

import BuggyImplementations from '@/components/project_admin/mutation_suites/buggy_implementations.vue';

import { make_course, make_mutation_test_suite, make_project } from '@/tests/data_utils';
import {
    do_input_blank_or_not_integer_test_without_save_button,
    do_invalid_text_input_test_without_save_button,
    get_validated_input_text,
    set_validated_input_text,
    validated_input_is_valid
} from '@/tests/utils';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('BuggyImplementation tests', () => {
    let wrapper: Wrapper<BuggyImplementations>;
    let mutation_test_suite: MutationTestSuite;
    let project: Project;
    let original_match_media: (query: string) => MediaQueryList;

    beforeEach(() => {
        original_match_media = window.matchMedia;
        Object.defineProperty(window, "matchMedia", {
            value: jest.fn(() => {
                return {matches: true};
            })
        });


        project = make_project(make_course().pk);
        mutation_test_suite = make_mutation_test_suite(project.pk);

        mutation_test_suite.buggy_impl_names = [
            "Bug_1",
            "Bug_2",
            "Bug_4",
            "Bug_12"
        ];

        wrapper = mount(BuggyImplementations, {
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

    test('points_per_exposed_bug binding', async () => {
        let points_per_exposed_bug_input = wrapper.find({ref: 'points_per_exposed_bug'});

        set_validated_input_text(points_per_exposed_bug_input, '905.5');

        expect(wrapper.vm.d_mutation_test_suite!.points_per_exposed_bug).toEqual(905.5);
        expect(validated_input_is_valid(points_per_exposed_bug_input)).toEqual(true);
        expect(wrapper.emitted().input.length).toEqual(1);

        wrapper.vm.d_mutation_test_suite!.points_per_exposed_bug = "10.51";
        expect(get_validated_input_text(points_per_exposed_bug_input)).toEqual('10.51');
    });

    test('Error: points_per_exposed_bug is blank or not a number', async () => {
        return do_input_blank_or_not_integer_test_without_save_button(
            wrapper, {ref: 'points_per_exposed_bug'});
    });

    test('Error: points_per_exposed_bug must be >= 0', async () => {
        return do_invalid_text_input_test_without_save_button(
            wrapper, {ref: 'points_per_exposed_bug'}, '-1');
    });

    test('Error: points_per_exposed_bug must have less than or equal to four digits in ' +
         'total - no decimal present',
         async () => {
         return do_invalid_text_input_test_without_save_button(
             wrapper, {ref: 'points_per_exposed_bug'}, '12345');
    });

    test('Error: points_per_exposed_bug must have less than or equal to four digits in ' +
         'total - decimal present',
         async () => {
        return do_invalid_text_input_test_without_save_button(
            wrapper, {ref: 'points_per_exposed_bug'}, '123.45');
    });

    test('Error: points_per_exposed_bug must have less than or equal to two decimal places',
         async () => {
        return do_invalid_text_input_test_without_save_button(
            wrapper, {ref: 'points_per_exposed_bug'}, '12.345');
    });

    test('use_custom_max_points binding', async () => {
        let use_custom_max_points_toggle = wrapper.find({ref: 'use_custom_max_points'});

        use_custom_max_points_toggle.find('.on-border').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.use_custom_max_points).toEqual(true);
        expect(wrapper.findAll('#max-points').length).toEqual(1);
        expect(wrapper.vm.d_mutation_test_suite!.max_points).toEqual(0);
        expect(wrapper.emitted().input.length).toEqual(1);

        use_custom_max_points_toggle.find('.off-border').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.use_custom_max_points).toEqual(false);
        expect(wrapper.findAll('#max-points').length).toEqual(0);
        expect(wrapper.vm.d_mutation_test_suite!.max_points).toBeNull();
        expect(wrapper.emitted().input.length).toEqual(2);

        use_custom_max_points_toggle.find('.on-border').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.use_custom_max_points).toEqual(true);
        expect(wrapper.findAll('#max-points').length).toEqual(1);
        expect(wrapper.vm.d_mutation_test_suite!.max_points).toEqual(0);
        expect(wrapper.emitted().input.length).toEqual(3);

        wrapper.vm.use_custom_max_points = true;
        expect(wrapper.findAll('#max-points').length).toEqual(1);

        wrapper.vm.use_custom_max_points = false;
        expect(wrapper.findAll('#max-points').length).toEqual(0);
    });

    test('max_points binding', async () => {
        wrapper.vm.use_custom_max_points = true;
        await wrapper.vm.$nextTick();

        let max_points_input = wrapper.find({ref: 'max_points'});
        set_validated_input_text(max_points_input, '3');

        expect(wrapper.vm.d_mutation_test_suite!.max_points).toEqual(3);
        expect(validated_input_is_valid(max_points_input)).toEqual(true);
        expect(wrapper.emitted().input.length).toEqual(1);

        wrapper.vm.d_mutation_test_suite!.max_points = 7;
        expect(get_validated_input_text(max_points_input)).toEqual('7');

        set_validated_input_text(max_points_input, '-7');
        expect(get_validated_input_text(max_points_input)).toEqual('-7');
        expect(validated_input_is_valid(max_points_input)).toEqual(false);
    });

    test('Error: max_points is blank or not a number', async () => {
        wrapper.vm.use_custom_max_points = true;
        await wrapper.vm.$nextTick();

        let max_points_input = wrapper.find({ref: 'max_points'});
        set_validated_input_text(max_points_input, '0');

        return do_input_blank_or_not_integer_test_without_save_button(
            wrapper, {ref: 'max_points'});
    });

    test('Error: max_points must be greater than or equal to zero', async () => {
        wrapper.vm.use_custom_max_points = true;
        await wrapper.vm.$nextTick();

        let max_points_input = wrapper.find({ref: 'max_points'});
        set_validated_input_text(max_points_input, '0');

        return do_invalid_text_input_test_without_save_button(
            wrapper, {ref: 'max_points'}, '-1');
    });

    test('max_num_student_tests binding', async () => {
        wrapper.vm.use_custom_max_points = true;
        await wrapper.vm.$nextTick();

        let max_num_student_tests_input = wrapper.find({ref: 'max_num_student_tests'});

        set_validated_input_text(max_num_student_tests_input, '3');

        expect(wrapper.vm.d_mutation_test_suite!.max_num_student_tests).toEqual(3);
        expect(validated_input_is_valid(max_num_student_tests_input)).toEqual(true);
        expect(wrapper.emitted().input.length).toEqual(1);

        wrapper.vm.d_mutation_test_suite!.max_num_student_tests = 7;
        expect(get_validated_input_text(max_num_student_tests_input)).toEqual('7');
    });

    test('Error: max_num_student_tests must be greater than or equal to zero', async () => {
        return do_invalid_text_input_test_without_save_button(
            wrapper, {ref: 'max_num_student_tests'}, '-1');
    });

    test('buggy_impl_names binding', async () => {
        let buggy_implementation_names_input = wrapper.find({ref: 'buggy_implementation_names'});

        set_validated_input_text(buggy_implementation_names_input, 'cricket, mosquito, bee');
        expect(wrapper.vm.buggy_impl_names).toEqual('cricket, mosquito, bee');

        wrapper.vm.buggy_impl_names = "ladybug ant";
        expect(get_validated_input_text(buggy_implementation_names_input)).toEqual('ladybug ant');
    });

    test('adding buggy_impl_names', async () => {
        let buggy_implementation_names_input = wrapper.find({ref: 'buggy_implementation_names'});

        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names.length).toEqual(4);
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[0]).toEqual("Bug_1");
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[1]).toEqual("Bug_2");
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[2]).toEqual("Bug_4");
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[3]).toEqual("Bug_12");
        expect(wrapper.vm.buggy_impl_names).toEqual("");

        set_validated_input_text(buggy_implementation_names_input, 'Bug_41 Bug_23 Bug_3');
        expect(wrapper.vm.buggy_impl_names).toEqual('Bug_41 Bug_23 Bug_3');

        wrapper.find('#add-buggy-impl-names-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names.length).toEqual(7);
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[0]).toEqual("Bug_1");
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[1]).toEqual("Bug_2");
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[2]).toEqual("Bug_3");
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[3]).toEqual("Bug_4");
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[4]).toEqual("Bug_12");
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[5]).toEqual("Bug_23");
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[6]).toEqual("Bug_41");
        expect(wrapper.vm.buggy_impl_names).toEqual("");
        expect(wrapper.emitted().input.length).toEqual(1);
    });


    test('adding buggy_impl_names - no duplicates allowed', async () => {
        let buggy_implementation_names_input = wrapper.find({ref: 'buggy_implementation_names'});

        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names.length).toEqual(4);
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[0]).toEqual("Bug_1");
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[1]).toEqual("Bug_2");
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[2]).toEqual("Bug_4");
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[3]).toEqual("Bug_12");

        set_validated_input_text(buggy_implementation_names_input, 'Bug_12 Bug_13 Bug_4');
        expect(wrapper.vm.buggy_impl_names).toEqual('Bug_12 Bug_13 Bug_4');

        wrapper.find('#add-buggy-impl-names-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names.length).toEqual(5);
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[0]).toEqual("Bug_1");
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[1]).toEqual("Bug_2");
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[2]).toEqual("Bug_4");
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[3]).toEqual("Bug_12");
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[4]).toEqual("Bug_13");
        expect(wrapper.emitted().input.length).toEqual(1);
    });

    test('adding buggy_impl_names - empty strings cannot be added', async () => {
        let buggy_implementation_names_input = wrapper.find({ref: 'buggy_implementation_names'});

        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names.length).toEqual(4);
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[0]).toEqual("Bug_1");
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[1]).toEqual("Bug_2");
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[2]).toEqual("Bug_4");
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[3]).toEqual("Bug_12");

        set_validated_input_text(buggy_implementation_names_input, '     ');
        expect(wrapper.vm.buggy_impl_names).toEqual('     ');

        wrapper.find('#add-buggy-impl-names-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names.length).toEqual(4);
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[0]).toEqual("Bug_1");
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[1]).toEqual("Bug_2");
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[2]).toEqual("Bug_4");
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[3]).toEqual("Bug_12");

        set_validated_input_text(buggy_implementation_names_input, ' , , , , ');
        expect(wrapper.vm.buggy_impl_names).toEqual(' , , , , ');

        wrapper.find('#add-buggy-impl-names-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names.length).toEqual(4);
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[0]).toEqual("Bug_1");
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[1]).toEqual("Bug_2");
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[2]).toEqual("Bug_4");
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[3]).toEqual("Bug_12");

        set_validated_input_text(buggy_implementation_names_input, ' ,    ,   Bug_3       ,   , ');
        expect(wrapper.vm.buggy_impl_names).toEqual(' ,    ,   Bug_3       ,   , ');

        wrapper.find('#add-buggy-impl-names-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names.length).toEqual(5);
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[0]).toEqual("Bug_1");
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[1]).toEqual("Bug_2");
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[2]).toEqual("Bug_3");
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[3]).toEqual("Bug_4");
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[4]).toEqual("Bug_12");
    });

    test('buggy_impl_names get sorted', async () => {
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names.length).toEqual(4);
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[0]).toEqual("Bug_1");
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[1]).toEqual("Bug_2");
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[2]).toEqual("Bug_4");
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[3]).toEqual("Bug_12");
    });

    test('removing a buggy_impl_name', async () => {
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names.length).toEqual(4);
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[0]).toEqual("Bug_1");
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[1]).toEqual("Bug_2");
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[2]).toEqual("Bug_4");
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[3]).toEqual("Bug_12");

        wrapper.findAll('.remove-buggy-impl-name-container').at(3).trigger('click');

        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names.length).toEqual(3);
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[0]).toEqual("Bug_1");
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[1]).toEqual("Bug_2");
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[2]).toEqual("Bug_4");
        expect(wrapper.emitted().input.length).toEqual(1);

        wrapper.findAll('.remove-buggy-impl-name-container').at(1).trigger('click');

        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names.length).toEqual(2);
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[0]).toEqual("Bug_1");
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[1]).toEqual("Bug_4");
        expect(wrapper.emitted().input.length).toEqual(2);

        wrapper.findAll('.remove-buggy-impl-name-container').at(0).trigger('click');

        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names.length).toEqual(1);
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[0]).toEqual("Bug_4");
        expect(wrapper.emitted().input.length).toEqual(3);

        wrapper.findAll('.remove-buggy-impl-name-container').at(0).trigger('click');

        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names.length).toEqual(0);
        expect(wrapper.emitted().input.length).toEqual(4);
    });

    test('value - Watcher', async () => {
        let another_mutation_suite = make_mutation_test_suite(make_course().pk);

        expect(wrapper.vm.d_mutation_test_suite!.pk).toEqual(mutation_test_suite.pk);

        wrapper.setProps({value: another_mutation_suite});
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_mutation_test_suite!.pk).toEqual(another_mutation_suite.pk);
    });
});
