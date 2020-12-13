import { Component, Vue } from 'vue-property-decorator';

import { Wrapper } from '@vue/test-utils';

import {
    AGTestSuite,
    ExpectedStudentFile,
    InstructorFile,
    Project,
    SandboxDockerImageData,
} from 'ag-client-typescript';

import DropdownTypeahead from '@/components/dropdown_typeahead.vue';
import SuiteSettings from '@/components/project_admin/suite_settings.vue';

import * as data_ut from '@/tests/data_utils';
import { managed_mount } from '@/tests/setup';
import {
    checkbox_is_checked,
    emitted,
    expect_html_element_has_value,
    find_by_name,
    get_validated_input_text,
    set_data,
    set_select_object_value,
    set_validated_input_text,
    validated_input_is_valid,
} from '@/tests/utils';


let ag_suite: AGTestSuite;
let project: Project;

let student_file_1: ExpectedStudentFile;
let student_file_2: ExpectedStudentFile;
let student_file_3: ExpectedStudentFile;

let instructor_file_1: InstructorFile;
let instructor_file_2: InstructorFile;
let instructor_file_3: InstructorFile;

let sandbox_docker_image_1: SandboxDockerImageData;
let sandbox_docker_image_2: SandboxDockerImageData;
let sandbox_docker_image_3: SandboxDockerImageData;

beforeEach(() => {
    project = data_ut.make_project(data_ut.make_course().pk);

    student_file_1 = data_ut.make_expected_student_file(project.pk, 'elephant*.cpp', {
        min_num_matches: 2,
        max_num_matches: 4,
    });

    student_file_2 = data_ut.make_expected_student_file(project.pk, "monkey?.cpp", {
        min_num_matches: 1,
        max_num_matches: 2,
    });

    student_file_3 = data_ut.make_expected_student_file(project.pk, "zebra.cpp", {
        min_num_matches: 1,
        max_num_matches: 1,
    });

    instructor_file_1 = data_ut.make_instructor_file(project.pk, "penguin.cpp");
    instructor_file_2 = data_ut.make_instructor_file(project.pk, "rabit.cpp");
    instructor_file_3 = data_ut.make_instructor_file(project.pk, "walrus.cpp");

    project.expected_student_files = [student_file_1, student_file_2, student_file_3];
    project.instructor_files = [instructor_file_1, instructor_file_2, instructor_file_3];

    ag_suite = data_ut.make_ag_test_suite(project.pk, {
        instructor_files_needed: [instructor_file_1, instructor_file_2],
        student_files_needed: [student_file_1, student_file_2],
    });

    sandbox_docker_image_1 = data_ut.make_sandbox_docker_image(
        project.course, {display_name: "Image 1"});
    sandbox_docker_image_2 = data_ut.make_sandbox_docker_image(
        project.course, {display_name: "Image 2"});
    sandbox_docker_image_3 = data_ut.make_sandbox_docker_image(
        project.course, {display_name: "Image 3"});
});

test('Input property initialization and change', async () => {
    let new_name = 'an new name';

    @Component({
        template: `<suite-settings :suite="suite" :project="project" :docker_images="[]">
                   </suite-settings>`,
        components: {SuiteSettings},
    })
    class WrapperComponent extends Vue {
        suite = ag_suite;
        project = project;

        // Change one field to make sure that SuiteSettings deep watcher on
        // suite works.
        change_suite_field() {
            this.suite.name = new_name;
        }
    }

    let outer_wrapper = managed_mount(WrapperComponent);
    let inner_wrapper = find_by_name<SuiteSettings>(outer_wrapper, 'SuiteSettings');

    let original = inner_wrapper.vm.d_suite;
    expect(inner_wrapper.vm.d_suite).not.toBe(ag_suite);

    outer_wrapper.vm.change_suite_field();
    await outer_wrapper.vm.$nextTick();

    expect(inner_wrapper.vm.d_suite).not.toBe(original);
    expect(inner_wrapper.vm.d_suite!.name).toEqual(new_name);
});

describe('Field binding tests', () => {
    let wrapper: Wrapper<SuiteSettings>;

    beforeEach(() => {
        wrapper = managed_mount(SuiteSettings, {
            propsData: {
                suite: ag_suite,
                project: project,
                docker_images: [
                    sandbox_docker_image_1, sandbox_docker_image_2, sandbox_docker_image_3
                ]
            }
        });
        expect(wrapper.emitted('field_change')).toBeUndefined();
    });

    test('suite name binding', async () => {
        let suite_name_input = wrapper.findComponent({ref: 'suite_name'});
        await set_validated_input_text(suite_name_input, 'Sweet Name');

        expect(wrapper.vm.d_suite!.name).toEqual("Sweet Name");
        expect(validated_input_is_valid(suite_name_input)).toEqual(true);

        await set_data(wrapper, {d_suite: {name: "Thanks"}});
        expect(get_validated_input_text(suite_name_input)).toEqual("Thanks");

        expect(emitted(wrapper, 'field_change')[0][0]).toEqual(wrapper.vm.d_suite);
    });

    test('Suite name cannot be empty - violates condition', async () => {
        let suite_name_input = wrapper.findComponent({ref: 'suite_name'});
        expect(validated_input_is_valid(suite_name_input)).toBe(true);

        set_validated_input_text(suite_name_input, '');
        expect(validated_input_is_valid(suite_name_input)).toBe(false);

        expect(wrapper.emitted('field_change')).toBeUndefined();
    });

    test('deferred binding', async () => {
        let synchronous_checkbox = wrapper.find('[data-testid=synchronous_or_deferred]');

        await synchronous_checkbox.setChecked(true);
        expect(wrapper.vm.d_suite!.deferred).toEqual(false);

        await synchronous_checkbox.setChecked(false);
        expect(wrapper.vm.d_suite!.deferred).toEqual(true);

        await synchronous_checkbox.setChecked(true);
        expect(wrapper.vm.d_suite!.deferred).toEqual(false);

        expect(checkbox_is_checked(synchronous_checkbox)).toEqual(true);

        await set_data(wrapper, {d_suite: {deferred: true}});
        expect(checkbox_is_checked(synchronous_checkbox)).toEqual(false);

        await set_data(wrapper, {d_suite: {deferred: false}});
        expect(checkbox_is_checked(synchronous_checkbox)).toEqual(true);

        expect(emitted(wrapper, 'field_change')[0][0]).toEqual(wrapper.vm.d_suite);
    });

    test('sandbox_docker_image binding', async () => {
        let sandbox_docker_image_input = wrapper.findComponent({ref: 'sandbox_docker_image'});
        set_select_object_value(sandbox_docker_image_input, sandbox_docker_image_2.pk);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_suite!.sandbox_docker_image).toEqual(
            sandbox_docker_image_2
        );

        wrapper.vm.d_suite!.sandbox_docker_image = sandbox_docker_image_3;
        await wrapper.vm.$nextTick();

        expect_html_element_has_value(
            sandbox_docker_image_input.find('.select'), sandbox_docker_image_3.pk.toString());

        expect(emitted(wrapper, 'field_change')[0][0]).toEqual(wrapper.vm.d_suite);
    });

    test('Toggle allow_network_access', async () => {
        let allow_network_access_toggle = wrapper.findComponent({ref: 'allow_network_access'});

        wrapper.vm.d_suite!.allow_network_access = true;
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_suite!.allow_network_access).toEqual(true);

        allow_network_access_toggle.find('.off-border').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_suite!.allow_network_access).toEqual(false);

        allow_network_access_toggle.find('.on-border').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_suite!.allow_network_access).toEqual(true);

        expect(emitted(wrapper, 'field_change')[0][0]).toEqual(wrapper.vm.d_suite);
    });

    test('Read-only instructor files binding', async () => {
        let read_only_checkbox = wrapper.find('[data-testid=read_only_instructor_files]');
        expect(wrapper.vm.d_suite!.read_only_instructor_files).toEqual(true);

        await read_only_checkbox.setChecked(false);
        expect(wrapper.vm.d_suite!.read_only_instructor_files).toEqual(false);

        await read_only_checkbox.setChecked(true);
        expect(wrapper.vm.d_suite!.read_only_instructor_files).toEqual(true);

        await read_only_checkbox.setChecked(false);
        expect(wrapper.vm.d_suite!.read_only_instructor_files).toEqual(false);

        expect(checkbox_is_checked(read_only_checkbox)).toEqual(false);

        await set_data(wrapper, {d_suite: {read_only_instructor_files: true}});
        expect(checkbox_is_checked(read_only_checkbox)).toEqual(true);

        await set_data(wrapper, {d_suite: {read_only_instructor_files: false}});
        expect(checkbox_is_checked(read_only_checkbox)).toEqual(false);

        expect(emitted(wrapper, 'field_change')[0][0]).toEqual(wrapper.vm.d_suite);
    });

    test('Adding an instructor file', async () => {
        let dropdown_typeahead = wrapper.findComponent({ref: 'instructor_files_typeahead'});
        dropdown_typeahead.vm.$emit('item_selected', instructor_file_3);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_suite!.instructor_files_needed.length).toEqual(3);
        expect(wrapper.vm.d_suite!.instructor_files_needed).toEqual([
            instructor_file_1, instructor_file_2, instructor_file_3
        ]);

        expect(emitted(wrapper, 'field_change')[0][0]).toEqual(wrapper.vm.d_suite);
    });

    test('Removing an instructor file', async () => {
        expect(wrapper.vm.d_suite!.instructor_files_needed.length).toEqual(2);
        expect(wrapper.vm.d_suite!.instructor_files_needed[0]).toEqual(instructor_file_1);
        expect(wrapper.vm.d_suite!.instructor_files_needed[1]).toEqual(instructor_file_2);

        let instructor_files_section = wrapper.find('.instructor-files');
        instructor_files_section.findAll('.file').at(1).find(
            '.remove-file-icon-container'
        ).trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_suite!.instructor_files_needed.length).toEqual(1);
        expect(wrapper.vm.d_suite!.instructor_files_needed[0]).toEqual(instructor_file_1);

        expect(emitted(wrapper, 'field_change')[0][0]).toEqual(wrapper.vm.d_suite);
    });

    test('InstructorFile filter function on dropdown typeahead', async () => {
        let dropdown_typeahead
            = <DropdownTypeahead> wrapper.findComponent({ref: 'instructor_files_typeahead'}).vm;
        expect(dropdown_typeahead.choices).toEqual([instructor_file_3]);

        dropdown_typeahead.filter_text = "a";
        await wrapper.vm.$nextTick();

        expect(dropdown_typeahead.filtered_choices.length).toEqual(1);
        expect(dropdown_typeahead.filtered_choices[0]).toEqual(instructor_file_3);

        let instructor_files_section = wrapper.find('.instructor-files');
        instructor_files_section.findAll('.file').at(0).find(
            '.remove-file-icon-container'
        ).trigger('click');
        await wrapper.vm.$nextTick();

        expect(dropdown_typeahead.choices).toEqual([instructor_file_1, instructor_file_3]);

        dropdown_typeahead.filter_text = "ui";
        await wrapper.vm.$nextTick();

        expect(dropdown_typeahead.filtered_choices.length).toEqual(1);
        expect(dropdown_typeahead.filtered_choices[0]).toEqual(instructor_file_1);

        expect(emitted(wrapper, 'field_change')[0][0]).toEqual(wrapper.vm.d_suite);
    });

    test('instructor_files_available', async () => {
        expect(wrapper.vm.instructor_files_available).toEqual([instructor_file_3]);

        expect(wrapper.vm.d_suite!.instructor_files_needed.length).toEqual(2);
        expect(wrapper.vm.d_suite!.instructor_files_needed[0]).toEqual(instructor_file_1);
        expect(wrapper.vm.d_suite!.instructor_files_needed[1]).toEqual(instructor_file_2);

        let instructor_file_section = wrapper.find('.instructor-files');
        instructor_file_section.findAll('.file').at(1).find(
            '.remove-file-icon-container'
        ).trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_suite!.instructor_files_needed.length).toEqual(1);
        expect(wrapper.vm.instructor_files_available).toEqual(
            [instructor_file_2, instructor_file_3]
        );

        expect(emitted(wrapper, 'field_change')[0][0]).toEqual(wrapper.vm.d_suite);
    });

    test('Adding a student file', async () => {
        let dropdown_typeahead = wrapper.findComponent({ref: 'student_files_typeahead'});
        dropdown_typeahead.vm.$emit('item_selected', student_file_3);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_suite!.student_files_needed.length).toEqual(3);
        expect(wrapper.vm.d_suite!.student_files_needed[0]).toEqual(student_file_1);
        expect(wrapper.vm.d_suite!.student_files_needed[1]).toEqual(student_file_2);
        expect(wrapper.vm.d_suite!.student_files_needed[2]).toEqual(student_file_3);

        expect(emitted(wrapper, 'field_change')[0][0]).toEqual(wrapper.vm.d_suite);
    });

    test('Removing a student file', async () => {
        expect(wrapper.vm.d_suite!.student_files_needed.length).toEqual(2);
        expect(wrapper.vm.d_suite!.student_files_needed[0]).toEqual(student_file_1);
        expect(wrapper.vm.d_suite!.student_files_needed[1]).toEqual(student_file_2);

        let student_files_section = wrapper.find('.student-files');
        student_files_section.findAll('.file').at(1).find(
            '.remove-file-icon-container'
        ).trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_suite!.student_files_needed.length).toEqual(1);
        expect(wrapper.vm.d_suite!.student_files_needed[0]).toEqual(student_file_1);

        expect(emitted(wrapper, 'field_change')[0][0]).toEqual(wrapper.vm.d_suite);
    });

    test('ExpectedStudentFile filter function on dropdown typeahead',  async () => {
        let dropdown_typeahead
            = <DropdownTypeahead> wrapper.findComponent({ref: 'student_files_typeahead'}).vm;
        expect(dropdown_typeahead.choices).toEqual([student_file_3]);

        dropdown_typeahead.filter_text = "e";
        await wrapper.vm.$nextTick();

        expect(dropdown_typeahead.filtered_choices.length).toEqual(1);
        expect(dropdown_typeahead.filtered_choices[0]).toEqual(student_file_3);

        let student_files_section = wrapper.find('.student-files');
        student_files_section.findAll('.file').at(0).find(
            '.remove-file-icon-container'
        ).trigger('click');
        await wrapper.vm.$nextTick();

        expect(dropdown_typeahead.choices).toEqual([student_file_1, student_file_3]);

        dropdown_typeahead.filter_text = "ep";
        await wrapper.vm.$nextTick();

        expect(dropdown_typeahead.filtered_choices.length).toEqual(1);
        expect(dropdown_typeahead.filtered_choices[0]).toEqual(student_file_1);

        expect(emitted(wrapper, 'field_change')[0][0]).toEqual(wrapper.vm.d_suite);
    });

    test('expected_student_files_available', async () => {
        expect(wrapper.vm.expected_student_files_available).toEqual([student_file_3]);

        expect(wrapper.vm.d_suite!.student_files_needed.length).toEqual(2);
        expect(wrapper.vm.d_suite!.student_files_needed[0]).toEqual(student_file_1);
        expect(wrapper.vm.d_suite!.student_files_needed[1]).toEqual(student_file_2);

        let student_files_section = wrapper.find('.student-files');
        student_files_section.findAll('.file').at(1).find(
            '.remove-file-icon-container'
        ).trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_suite!.student_files_needed.length).toEqual(1);
        expect(wrapper.vm.expected_student_files_available).toEqual(
            [student_file_2, student_file_3]
        );

        expect(emitted(wrapper, 'field_change')[0][0]).toEqual(wrapper.vm.d_suite);
    });

    test('Adding instructor file using batch select', async () => {
        expect(wrapper.vm.d_suite!.instructor_files_needed.length).toEqual(2);

        wrapper.findAll('.batch-select-button').at(0).trigger('click');
        await wrapper.vm.$nextTick();

        wrapper.findAll('.batch-select-card').at(2).trigger('click');
        await wrapper.vm.$nextTick();

        wrapper.find('.modal-confirm-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_suite!.instructor_files_needed.length).toEqual(3);
    });

    test('Removing instructor file using batch select', async () => {
        expect(wrapper.vm.d_suite!.instructor_files_needed.length).toEqual(2);

        wrapper.findAll('.batch-select-button').at(0).trigger('click');
        await wrapper.vm.$nextTick();

        wrapper.findAll('.batch-select-card').at(0).trigger('click');
        await wrapper.vm.$nextTick();

        wrapper.find('.modal-confirm-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_suite!.instructor_files_needed.length).toEqual(1);
    });

    test('Cancelling instructor file batch select preserves state', async () => {
        expect(wrapper.vm.d_suite!.instructor_files_needed.length).toEqual(2);

        wrapper.findAll('.batch-select-button').at(0).trigger('click');
        await wrapper.vm.$nextTick();

        wrapper.findAll('.batch-select-card').at(0).trigger('click');
        await wrapper.vm.$nextTick();

        wrapper.find('.modal-cancel-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_suite!.instructor_files_needed.length).toEqual(2);
    });
});
