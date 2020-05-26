import { mount, Wrapper } from '@vue/test-utils';

import {
    MutationTestSuite, Project
} from 'ag-client-typescript';

import BuggyImplementations from '@/components/project_admin/mutation_suites/buggy_implementations.vue';

import { make_course, make_mutation_test_suite, make_project } from '@/tests/data_utils';
import { managed_mount } from '@/tests/setup';
import {
    checkbox_is_checked,
    do_input_blank_or_not_integer_test,
    do_invalid_text_input_test,
    get_validated_input_text,
    set_data,
    set_props,
    set_validated_input_text,
    validated_input_is_valid
} from '@/tests/utils';


describe('BuggyImplementation tests', () => {
    let wrapper: Wrapper<BuggyImplementations>;
    let mutation_test_suite: MutationTestSuite;
    let project: Project;

    beforeEach(() => {
        project = make_project(make_course().pk);
        mutation_test_suite = make_mutation_test_suite(project.pk);

        mutation_test_suite.buggy_impl_names = [
            "Bug_1",
            "Bug_2",
            "Bug_4",
            "Bug_12"
        ];

        wrapper = managed_mount(BuggyImplementations, {
            propsData: {
                value: mutation_test_suite
            }
        });
    });

    test('points_per_exposed_bug binding', async () => {
        let points_per_exposed_bug_input = wrapper.find({ref: 'points_per_exposed_bug'});

        await set_validated_input_text(points_per_exposed_bug_input, '905.7');

        expect(wrapper.vm.d_mutation_test_suite!.points_per_exposed_bug).toEqual("905.7");
        expect(validated_input_is_valid(points_per_exposed_bug_input)).toEqual(true);
        expect(wrapper.emitted('input')?.length).toEqual(1);

        await set_data(wrapper, {d_mutation_test_suite: {points_per_exposed_bug: "10.52"}});
        expect(get_validated_input_text(points_per_exposed_bug_input)).toEqual('10.52');
    });

    test('Error: points_per_exposed_bug is blank or not a number', () => {
        return do_input_blank_or_not_integer_test(wrapper, {ref: 'points_per_exposed_bug'}, null);
    });

    test('Error: points_per_exposed_bug must be >= 0', () => {
        return do_invalid_text_input_test(wrapper, {ref: 'points_per_exposed_bug'}, '-1', null);
    });

    test('Error: points_per_exposed_bug must have <= four digits total', () => {
        return do_invalid_text_input_test(wrapper, {ref: 'points_per_exposed_bug'}, '12345', null);
    });

    test('Error: points_per_exposed_bug must have <= four digits total with decimal', () => {
        return do_invalid_text_input_test(
            wrapper, {ref: 'points_per_exposed_bug'}, '123.45', null);
    });

    test('Error: points_per_exposed_bug must have <= two decimal places', () => {
        return do_invalid_text_input_test(
            wrapper, {ref: 'points_per_exposed_bug'}, '12.345', null);
    });

    test('d_override_max_points binding', async () => {
        let override_max_points_checkbox = wrapper.find('#override-max-points');

        await override_max_points_checkbox.setChecked(true);
        expect(wrapper.vm.d_override_max_points).toEqual(true);
        expect(checkbox_is_checked(override_max_points_checkbox)).toEqual(true);
        expect(wrapper.findAll('#max-points').length).toEqual(1);
        expect(wrapper.vm.d_mutation_test_suite!.max_points).toEqual(0);
        expect(wrapper.emitted('input')?.length).toEqual(1);

        await override_max_points_checkbox.setChecked(false);
        expect(wrapper.vm.d_override_max_points).toEqual(false);
        expect(checkbox_is_checked(override_max_points_checkbox)).toEqual(false);
        expect(wrapper.findAll('#max-points').length).toEqual(0);
        expect(wrapper.vm.d_mutation_test_suite!.max_points).toBeNull();
        expect(wrapper.emitted('input')?.length).toEqual(2);

        await override_max_points_checkbox.setChecked(true);
        expect(wrapper.vm.d_override_max_points).toEqual(true);
        expect(checkbox_is_checked(override_max_points_checkbox)).toEqual(true);
        expect(wrapper.findAll('#max-points').length).toEqual(1);
        expect(wrapper.vm.d_mutation_test_suite!.max_points).toEqual(0);
        expect(wrapper.emitted('input')?.length).toEqual(3);

        await set_data(wrapper, {d_override_max_points: true});
        expect(wrapper.findAll('#max-points').length).toEqual(1);

        await set_data(wrapper, {d_override_max_points: false});
        expect(wrapper.findAll('#max-points').length).toEqual(0);
    });

    test('max_points binding', async () => {
        await set_data(wrapper, {d_override_max_points: true});

        let max_points_input = wrapper.find({ref: 'max_points'});
        await set_validated_input_text(max_points_input, '3');

        expect(wrapper.vm.d_mutation_test_suite!.max_points).toEqual(3);
        expect(validated_input_is_valid(max_points_input)).toEqual(true);
        expect(wrapper.emitted('input')?.length).toEqual(1);

        await set_data(wrapper, {d_mutation_test_suite: {max_points: 7}});
        expect(get_validated_input_text(max_points_input)).toEqual('7');

        await set_validated_input_text(max_points_input, '-7');
        expect(get_validated_input_text(max_points_input)).toEqual('-7');
        expect(validated_input_is_valid(max_points_input)).toEqual(false);
    });

    test('Error: max_points is blank or not a number', async () => {
        await set_data(wrapper, {d_override_max_points: true});

        let max_points_input = wrapper.find({ref: 'max_points'});
        await set_validated_input_text(max_points_input, '0');

        return do_input_blank_or_not_integer_test(wrapper, {ref: 'max_points'}, null);
    });

    test('Error: max_points must be greater than or equal to zero', async () => {
        await set_data(wrapper, {d_override_max_points: true});

        let max_points_input = wrapper.find({ref: 'max_points'});
        await set_validated_input_text(max_points_input, '0');

        return do_invalid_text_input_test(wrapper, {ref: 'max_points'}, '-1', null);
    });

    test('max_num_student_tests binding', async () => {
        await set_data(wrapper, {d_override_max_points: true});

        let max_num_student_tests_input = wrapper.find({ref: 'max_num_student_tests'});

        await set_validated_input_text(max_num_student_tests_input, '3');

        expect(wrapper.vm.d_mutation_test_suite!.max_num_student_tests).toEqual(3);
        expect(validated_input_is_valid(max_num_student_tests_input)).toEqual(true);
        expect(wrapper.emitted('input')?.length).toEqual(1);

        await set_data(wrapper, {d_mutation_test_suite: {max_num_student_tests: 7}});
        expect(get_validated_input_text(max_num_student_tests_input)).toEqual('7');
    });

    test('Error: max_num_student_tests must be greater than or equal to zero', async () => {
        return do_invalid_text_input_test(wrapper, {ref: 'max_num_student_tests'}, '-1', null);
    });

    test('buggy_impl_names binding', async () => {
        let buggy_implementation_names_input = wrapper.find({ref: 'buggy_impl_names_input'});
        await buggy_implementation_names_input.setValue('cricket, mosquito, bee');

        expect(wrapper.vm.d_buggy_impl_names_text).toEqual('cricket, mosquito, bee');

        await set_data(wrapper, {d_buggy_impl_names_text: "ladybug ant"});
        expect(
            (<HTMLInputElement> wrapper.find({ref: 'buggy_impl_names_input'}).element)
                .value).toEqual('ladybug ant');
    });

    test('adding buggy impl names by pressing the add-buggy-impl-names-button', async () => {
        let buggy_implementation_names_input = wrapper.find({ref: 'buggy_impl_names_input'});

        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names.length).toEqual(4);
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[0]).toEqual("Bug_1");
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[1]).toEqual("Bug_2");
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[2]).toEqual("Bug_4");
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[3]).toEqual("Bug_12");
        expect(wrapper.vm.d_buggy_impl_names_text).toEqual("");

        buggy_implementation_names_input.setValue('Bug_41 Bug_23 Bug_3');
        expect(wrapper.vm.d_buggy_impl_names_text).toEqual('Bug_41 Bug_23 Bug_3');

        await wrapper.find('#add-buggy-impl-names-button').trigger('click');

        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names.length).toEqual(7);
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[0]).toEqual("Bug_1");
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[1]).toEqual("Bug_2");
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[2]).toEqual("Bug_3");
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[3]).toEqual("Bug_4");
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[4]).toEqual("Bug_12");
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[5]).toEqual("Bug_23");
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[6]).toEqual("Bug_41");
        expect(wrapper.vm.d_buggy_impl_names_text).toEqual("");
        expect(wrapper.emitted('input')?.length).toEqual(1);
    });

    test('adding buggy impl names by pressing enter', async () => {
        let buggy_implementation_names_input = wrapper.find({ref: 'buggy_impl_names_input'});

        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names.length).toEqual(4);
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[0]).toEqual("Bug_1");
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[1]).toEqual("Bug_2");
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[2]).toEqual("Bug_4");
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[3]).toEqual("Bug_12");
        expect(wrapper.vm.d_buggy_impl_names_text).toEqual("");

        await buggy_implementation_names_input.setValue('Bug_41 Bug_23 Bug_3');
        expect(wrapper.vm.d_buggy_impl_names_text).toEqual('Bug_41 Bug_23 Bug_3');

        await buggy_implementation_names_input.trigger('click');

        await wrapper.find({ref: 'buggy_impl_names_input'}).trigger('keyup.enter');

        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names.length).toEqual(7);
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[0]).toEqual("Bug_1");
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[1]).toEqual("Bug_2");
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[2]).toEqual("Bug_3");
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[3]).toEqual("Bug_4");
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[4]).toEqual("Bug_12");
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[5]).toEqual("Bug_23");
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[6]).toEqual("Bug_41");
        expect(wrapper.vm.d_buggy_impl_names_text).toEqual("");
        expect(wrapper.emitted('input')?.length).toEqual(1);
    });

    test('adding buggy impl names - no duplicates allowed', async () => {
        let buggy_implementation_names_input = wrapper.find({ref: 'buggy_impl_names_input'});

        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names.length).toEqual(4);
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[0]).toEqual("Bug_1");
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[1]).toEqual("Bug_2");
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[2]).toEqual("Bug_4");
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[3]).toEqual("Bug_12");

        await buggy_implementation_names_input.setValue('Bug_12 Bug_13 Bug_4');
        expect(wrapper.vm.d_buggy_impl_names_text).toEqual('Bug_12 Bug_13 Bug_4');

        await wrapper.find('#add-buggy-impl-names-button').trigger('click');

        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names.length).toEqual(5);
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[0]).toEqual("Bug_1");
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[1]).toEqual("Bug_2");
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[2]).toEqual("Bug_4");
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[3]).toEqual("Bug_12");
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[4]).toEqual("Bug_13");
        expect(wrapper.emitted('input')?.length).toEqual(1);
    });

    test('adding buggy impl names - empty strings cannot be added', async () => {
        let buggy_implementation_names_input = wrapper.find({ref: 'buggy_impl_names_input'});

        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names.length).toEqual(4);
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[0]).toEqual("Bug_1");
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[1]).toEqual("Bug_2");
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[2]).toEqual("Bug_4");
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[3]).toEqual("Bug_12");

        await buggy_implementation_names_input.setValue('     ');
        expect(wrapper.vm.d_buggy_impl_names_text).toEqual('     ');

        await wrapper.find('#add-buggy-impl-names-button').trigger('click');

        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names.length).toEqual(4);
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[0]).toEqual("Bug_1");
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[1]).toEqual("Bug_2");
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[2]).toEqual("Bug_4");
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[3]).toEqual("Bug_12");

        buggy_implementation_names_input.setValue(' , , , , ');
        expect(wrapper.vm.d_buggy_impl_names_text).toEqual(' , , , , ');

        await wrapper.find('#add-buggy-impl-names-button').trigger('click');

        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names.length).toEqual(4);
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[0]).toEqual("Bug_1");
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[1]).toEqual("Bug_2");
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[2]).toEqual("Bug_4");
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[3]).toEqual("Bug_12");

        await buggy_implementation_names_input.setValue(' ,    ,   Bug_3       ,   , ');
        expect(wrapper.vm.d_buggy_impl_names_text).toEqual(' ,    ,   Bug_3       ,   , ');

        await wrapper.find('#add-buggy-impl-names-button').trigger('click');
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

        await wrapper.findAll('.remove-buggy-impl-name-container').at(3).trigger('click');

        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names.length).toEqual(3);
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[0]).toEqual("Bug_1");
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[1]).toEqual("Bug_2");
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[2]).toEqual("Bug_4");
        expect(wrapper.emitted('input')?.length).toEqual(1);

        await wrapper.findAll('.remove-buggy-impl-name-container').at(1).trigger('click');

        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names.length).toEqual(2);
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[0]).toEqual("Bug_1");
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[1]).toEqual("Bug_4");
        expect(wrapper.emitted('input')?.length).toEqual(2);

        await wrapper.findAll('.remove-buggy-impl-name-container').at(0).trigger('click');

        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names.length).toEqual(1);
        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names[0]).toEqual("Bug_4");
        expect(wrapper.emitted('input')?.length).toEqual(3);

        await wrapper.findAll('.remove-buggy-impl-name-container').at(0).trigger('click');

        expect(wrapper.vm.d_mutation_test_suite!.buggy_impl_names.length).toEqual(0);
        expect(wrapper.emitted('input')?.length).toEqual(4);
    });

    test('value - Watcher', async () => {
        let another_mutation_suite = make_mutation_test_suite(make_course().pk);

        expect(wrapper.vm.d_mutation_test_suite!.pk).toEqual(mutation_test_suite.pk);

        await set_props(wrapper, {value: another_mutation_suite});
        expect(wrapper.vm.d_mutation_test_suite!.pk).toEqual(another_mutation_suite.pk);
    });
});
