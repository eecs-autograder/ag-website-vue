import { config, mount, Wrapper } from '@vue/test-utils';

import {
    AGTestSuite,
    AGTestSuiteFeedbackConfig,
    ExpectedStudentFile,
    HttpError,
    InstructorFile,
    Project, SandboxDockerImageData,
} from 'ag-client-typescript';
// tslint:disable-next-line:no-duplicate-imports
import * as ag_cli from 'ag-client-typescript';
import * as sinon from "sinon";

import APIErrors from '@/components/api_errors.vue';
import DropdownTypeahead from '@/components/dropdown_typeahead.vue';
import AGSuiteSettings from '@/components/project_admin/ag_suites/ag_suite_settings.vue';
import AGTestSuiteAdvancedFdbkSettings from '@/components/project_admin/ag_suites/ag_test_suite_advanced_fdbk_settings.vue';
import FeedbackConfigPanel from '@/components/project_admin/feedback_config_panel.vue';

import {
    make_ag_test_suite,
    make_ag_test_suite_fdbk_config,
    make_course,
    make_project,
} from '@/tests/data_utils';
import {
    checkbox_is_checked,
    get_validated_input_text,
    set_validated_input_text, validated_input_is_valid, set_select_object_value, expect_html_element_has_value
} from '@/tests/utils';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('AGSuiteSettings tests', () => {
    let wrapper: Wrapper<AGSuiteSettings>;
    let component: AGSuiteSettings;
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
    let default_feedback_config: AGTestSuiteFeedbackConfig;

    beforeEach(() => {
        default_feedback_config = {
            show_individual_tests: false,
            show_setup_return_code: false,
            show_setup_stderr: false,
            show_setup_stdout: false,
            show_setup_timed_out: false,
            visible: false
        };

        student_file_1 = new ExpectedStudentFile({
            pk: 1,
            project: 10,
            pattern: "elephant*.cpp",
            min_num_matches: 2,
            max_num_matches: 4,
            last_modified: "now"
        });

        student_file_2 = new ExpectedStudentFile({
            pk: 2,
            project: 10,
            pattern: "monkey?.cpp",
            min_num_matches: 1,
            max_num_matches: 2,
            last_modified: "now"
        });

        student_file_3 = new ExpectedStudentFile({
            pk: 3,
            project: 10,
            pattern: "zebra.cpp",
            min_num_matches: 1,
            max_num_matches: 1,
            last_modified: "now"
        });

        instructor_file_1 = new InstructorFile({
            pk: 4,
            project: 10,
            name: "penguin.cpp",
            size: 2,
            last_modified: "now"
        });

        instructor_file_2 = new InstructorFile({
            pk: 5,
            project: 10,
            name: "rabit.cpp",
            size: 2,
            last_modified: "now"
        });

        instructor_file_3 = new InstructorFile({
            pk: 6,
            project: 10,
            name: "walrus.cpp",
            size: 2,
            last_modified: "now"
        });

        project = make_project(
            make_course().pk,
            {
                expected_student_files: [
                    student_file_1,
                    student_file_2,
                    student_file_3
                ],
                instructor_files: [
                    instructor_file_1,
                    instructor_file_2,
                    instructor_file_3
                ]
            }
        );
        ag_suite = make_ag_test_suite(project.pk);
        ag_suite.instructor_files_needed = [instructor_file_1, instructor_file_2];
        ag_suite.student_files_needed = [student_file_1, student_file_2];

        sandbox_docker_image_1 = {
            pk: 1,
            name: "img1",
            tag: "",
            display_name: "Image 1"
        };

        sandbox_docker_image_2 = {
            pk: 2,
            name: "img2",
            tag: "",
            display_name: "Image 2"
        };

        sandbox_docker_image_3 = {
            pk: 3,
            name: "img3",
            tag: "",
            display_name: "Image 3"
        };

        sinon.stub(ag_cli, 'get_sandbox_docker_images').returns(Promise.resolve([
            sandbox_docker_image_1,
            sandbox_docker_image_2,
            sandbox_docker_image_3
        ]));

        wrapper = mount(AGSuiteSettings, {
            propsData: {
                ag_test_suite: ag_suite,
                project: project
            }
        });
        component = wrapper.vm;
    });

    afterEach(() => {
        sinon.restore();

        if (wrapper.exists()) {
            wrapper.destroy();
        }
    });

    test('suite name binding', async () => {
        let suite_name_input = wrapper.find({ref: 'suite_name'});
        set_validated_input_text(suite_name_input, 'Sweet Name');

        expect(component.d_ag_test_suite!.name).toEqual("Sweet Name");
        expect(validated_input_is_valid(suite_name_input)).toEqual(true);

        component.d_ag_test_suite!.name = "Thanks";
        expect(get_validated_input_text(suite_name_input)).toEqual("Thanks");
    });

    test('Suite name cannot be empty - violates condition', async () => {
        expect(component.d_settings_form_is_valid).toBe(true);

        let suite_name_input = wrapper.find({ref: 'suite_name'});
        set_validated_input_text(suite_name_input, '');

        expect(validated_input_is_valid(suite_name_input)).toBe(false);
        expect(component.d_settings_form_is_valid).toBe(false);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(true);
    });

    test('deferred binding', () => {
        let synchronous_checkbox = wrapper.find('#synchronous-or-deferred');

        synchronous_checkbox.setChecked(true);
        expect(component.d_ag_test_suite!.deferred).toEqual(false);

        synchronous_checkbox.setChecked(false);
        expect(component.d_ag_test_suite!.deferred).toEqual(true);

        synchronous_checkbox.setChecked(true);
        expect(component.d_ag_test_suite!.deferred).toEqual(false);

        expect(checkbox_is_checked(synchronous_checkbox)).toEqual(true);

        component.d_ag_test_suite!.deferred = true;
        expect(checkbox_is_checked(synchronous_checkbox)).toEqual(false);

        component.d_ag_test_suite!.deferred = false;
        expect(checkbox_is_checked(synchronous_checkbox)).toEqual(true);
    });

    test('sandbox_docker_image binding', async () => {
        let sandbox_docker_image_input = wrapper.find({ref: 'sandbox_docker_image'});
        set_select_object_value(sandbox_docker_image_input, sandbox_docker_image_2.pk);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_ag_test_suite!.sandbox_docker_image).toEqual(
            sandbox_docker_image_2
        );

        wrapper.vm.d_ag_test_suite!.sandbox_docker_image = sandbox_docker_image_3;
        await wrapper.vm.$nextTick();

        expect_html_element_has_value(
            sandbox_docker_image_input.find('.select'), sandbox_docker_image_3.pk.toString());
    });

    test('Toggle allow_network_access', async () => {
        let allow_network_access_toggle = wrapper.find({ref: 'allow_network_access'});

        component.d_ag_test_suite!.allow_network_access = true;
        await component.$nextTick();

        expect(component.d_ag_test_suite!.allow_network_access).toEqual(true);

        allow_network_access_toggle.find('.off-border').trigger('click');
        await component.$nextTick();

        expect(component.d_ag_test_suite!.allow_network_access).toEqual(false);

        allow_network_access_toggle.find('.on-border').trigger('click');
        await component.$nextTick();

        expect(component.d_ag_test_suite!.allow_network_access).toEqual(true);
    });

    test('Read-only instructor files binding', () => {
        let read_only_checkbox = wrapper.find('#read-only-instructor-files');
        expect(component.d_ag_test_suite!.read_only_instructor_files).toEqual(true);

        read_only_checkbox.setChecked(false);
        expect(component.d_ag_test_suite!.read_only_instructor_files).toEqual(false);

        read_only_checkbox.setChecked(true);
        expect(component.d_ag_test_suite!.read_only_instructor_files).toEqual(true);

        read_only_checkbox.setChecked(false);
        expect(component.d_ag_test_suite!.read_only_instructor_files).toEqual(false);

        expect(checkbox_is_checked(read_only_checkbox)).toEqual(false);

        component.d_ag_test_suite!.read_only_instructor_files = true;
        expect(checkbox_is_checked(read_only_checkbox)).toEqual(true);

        component.d_ag_test_suite!.read_only_instructor_files = false;
        expect(checkbox_is_checked(read_only_checkbox)).toEqual(false);
    });

    test('Adding an instructor file', async () => {
        let dropdown_typeahead = <DropdownTypeahead> wrapper.find(
            {ref: 'instructor_files_typeahead'}
        ).vm;
        expect(dropdown_typeahead.choices).toEqual([instructor_file_3]);

        let search_bar = wrapper.find(
            {ref: 'instructor_files_typeahead'}
        ).find('input');
        search_bar.trigger("click");

        dropdown_typeahead.filter_text = "a";
        await component.$nextTick();

        expect(dropdown_typeahead.filtered_choices.length).toEqual(1);
        expect(dropdown_typeahead.filtered_choices[0]).toEqual(instructor_file_3);

        search_bar.trigger('keydown', { code: 'Enter' });
        await dropdown_typeahead.$nextTick();

        expect(component.d_ag_test_suite!.instructor_files_needed.length).toEqual(3);
        expect(component.d_ag_test_suite!.instructor_files_needed[0]).toEqual(instructor_file_1);
        expect(component.d_ag_test_suite!.instructor_files_needed[1]).toEqual(instructor_file_2);
        expect(component.d_ag_test_suite!.instructor_files_needed[2]).toEqual(instructor_file_3);
    });

    test('Removing an instructor file', async () => {
        expect(component.d_ag_test_suite!.instructor_files_needed.length).toEqual(2);
        expect(component.d_ag_test_suite!.instructor_files_needed[0]).toEqual(instructor_file_1);
        expect(component.d_ag_test_suite!.instructor_files_needed[1]).toEqual(instructor_file_2);

        let instructor_files_section = wrapper.find('.instructor-files');
        instructor_files_section.findAll('.file').at(1).find(
            '.remove-file-icon-container'
        ).trigger('click');
        await component.$nextTick();

        expect(component.d_ag_test_suite!.instructor_files_needed.length).toEqual(1);
        expect(component.d_ag_test_suite!.instructor_files_needed[0]).toEqual(instructor_file_1);
    });

    test('InstructorFile filter function on dropdown typeahead', async () => {
        let dropdown_typeahead = <DropdownTypeahead> wrapper.find(
            {ref: 'instructor_files_typeahead'}
        ).vm;
        expect(dropdown_typeahead.choices).toEqual([instructor_file_3]);

        dropdown_typeahead.filter_text = "a";
        await component.$nextTick();

        expect(dropdown_typeahead.filtered_choices.length).toEqual(1);
        expect(dropdown_typeahead.filtered_choices[0]).toEqual(instructor_file_3);

        let instructor_files_section = wrapper.find('.instructor-files');
        instructor_files_section.findAll('.file').at(0).find(
            '.remove-file-icon-container'
        ).trigger('click');
        await component.$nextTick();

        expect(dropdown_typeahead.choices).toEqual([instructor_file_1, instructor_file_3]);

        dropdown_typeahead.filter_text = "ui";
        await component.$nextTick();

        expect(dropdown_typeahead.filtered_choices.length).toEqual(1);
        expect(dropdown_typeahead.filtered_choices[0]).toEqual(instructor_file_1);
    });

    test('instructor_files_available', async () => {
        expect(component.instructor_files_available).toEqual([instructor_file_3]);

        expect(component.d_ag_test_suite!.instructor_files_needed.length).toEqual(2);
        expect(component.d_ag_test_suite!.instructor_files_needed[0]).toEqual(instructor_file_1);
        expect(component.d_ag_test_suite!.instructor_files_needed[1]).toEqual(instructor_file_2);

        let instructor_file_section = wrapper.find('.instructor-files');
        instructor_file_section.findAll('.file').at(1).find(
            '.remove-file-icon-container'
        ).trigger('click');
        await component.$nextTick();

        expect(component.d_ag_test_suite!.instructor_files_needed.length).toEqual(1);
        expect(component.instructor_files_available).toEqual(
            [instructor_file_2, instructor_file_3]
        );
    });

    test('Adding a student file', async () => {
        let dropdown_typeahead = <DropdownTypeahead> wrapper.find(
            {ref: 'student_files_typeahead'}
        ).vm;
        expect(dropdown_typeahead.choices).toEqual([student_file_3]);

        let search_bar = wrapper.find(
            {ref: 'student_files_typeahead'}
        ).find('input');
        search_bar.trigger("click");

        dropdown_typeahead.filter_text = "a";
        await component.$nextTick();

        expect(dropdown_typeahead.filtered_choices.length).toEqual(1);
        expect(dropdown_typeahead.filtered_choices[0]).toEqual(student_file_3);

        search_bar.trigger('keydown', {code: 'Enter'});
        await dropdown_typeahead.$nextTick();

        expect(component.d_ag_test_suite!.student_files_needed.length).toEqual(3);
        expect(component.d_ag_test_suite!.student_files_needed[0]).toEqual(student_file_1);
        expect(component.d_ag_test_suite!.student_files_needed[1]).toEqual(student_file_2);
        expect(component.d_ag_test_suite!.student_files_needed[2]).toEqual(student_file_3);
    });

    test('Removing a student file', async () => {
        expect(component.d_ag_test_suite!.student_files_needed.length).toEqual(2);
        expect(component.d_ag_test_suite!.student_files_needed[0]).toEqual(student_file_1);
        expect(component.d_ag_test_suite!.student_files_needed[1]).toEqual(student_file_2);

        let student_files_section = wrapper.find('.student-files');
        student_files_section.findAll('.file').at(1).find(
            '.remove-file-icon-container'
        ).trigger('click');
        await component.$nextTick();

        expect(component.d_ag_test_suite!.student_files_needed.length).toEqual(1);
        expect(component.d_ag_test_suite!.student_files_needed[0]).toEqual(student_file_1);
    });

    test('ExpectedStudentFile filter function on dropdown typeahead',  async () => {
        let dropdown_typeahead = <DropdownTypeahead> wrapper.find(
            {ref: 'student_files_typeahead'}
        ).vm;
        expect(dropdown_typeahead.choices).toEqual([student_file_3]);

        dropdown_typeahead.filter_text = "e";
        await component.$nextTick();

        expect(dropdown_typeahead.filtered_choices.length).toEqual(1);
        expect(dropdown_typeahead.filtered_choices[0]).toEqual(student_file_3);

        let student_files_section = wrapper.find('.student-files');
        student_files_section.findAll('.file').at(0).find(
            '.remove-file-icon-container'
        ).trigger('click');
        await component.$nextTick();

        expect(dropdown_typeahead.choices).toEqual([student_file_1, student_file_3]);

        dropdown_typeahead.filter_text = "ep";
        await component.$nextTick();

        expect(dropdown_typeahead.filtered_choices.length).toEqual(1);
        expect(dropdown_typeahead.filtered_choices[0]).toEqual(student_file_1);
    });

    test('expected_student_files_available', async () => {
        expect(component.expected_student_files_available).toEqual([student_file_3]);

        expect(component.d_ag_test_suite!.student_files_needed.length).toEqual(2);
        expect(component.d_ag_test_suite!.student_files_needed[0]).toEqual(student_file_1);
        expect(component.d_ag_test_suite!.student_files_needed[1]).toEqual(student_file_2);

        let student_files_section = wrapper.find('.student-files');
        student_files_section.findAll('.file').at(1).find(
            '.remove-file-icon-container'
        ).trigger('click');
        await component.$nextTick();

        expect(component.d_ag_test_suite!.student_files_needed.length).toEqual(1);
        expect(component.expected_student_files_available).toEqual(
            [student_file_2, student_file_3]
        );
    });

    test('setup_suite_cmd_name binding', async () => {
        let setup_suite_cmd_name_input = wrapper.find({ref: 'setup_suite_cmd_name'});
        set_validated_input_text(setup_suite_cmd_name_input, 'sunflower');

        expect(component.d_ag_test_suite!.setup_suite_cmd_name).toEqual("sunflower");
        expect(validated_input_is_valid(setup_suite_cmd_name_input)).toEqual(true);

        set_validated_input_text(setup_suite_cmd_name_input, '');
        expect(component.d_ag_test_suite!.setup_suite_cmd_name).toEqual("");
        expect(validated_input_is_valid(setup_suite_cmd_name_input)).toEqual(true);

        component.d_ag_test_suite!.setup_suite_cmd_name = "Rainbow";
        expect(get_validated_input_text(setup_suite_cmd_name_input)).toEqual("Rainbow");
    });

    test('setup_suite_cmd binding', async () => {
        let setup_suite_cmd_input = wrapper.find({ref: 'setup_suite_cmd'});

        set_validated_input_text(setup_suite_cmd_input, 'three to the right');

        expect(component.d_ag_test_suite!.setup_suite_cmd).toEqual(
            "three to the right"
        );
        expect(validated_input_is_valid(setup_suite_cmd_input)).toEqual(true);

        set_validated_input_text(setup_suite_cmd_input, '');
        expect(component.d_ag_test_suite!.setup_suite_cmd).toEqual("");
        expect(validated_input_is_valid(setup_suite_cmd_input)).toEqual(true);

        component.d_ag_test_suite!.setup_suite_cmd = "four to the left";
        expect(get_validated_input_text(setup_suite_cmd_input)).toEqual(
            "four to the left"
        );
    });

    test('Save suite settings - successful', async () => {
        let save_stub = sinon.stub(component.d_ag_test_suite!, 'save');

        wrapper.find('#ag-test-suite-settings-form').trigger('submit');
        await component.$nextTick();

        expect(save_stub.calledOnce).toBe(true);
    });

    test('Save suite settings - unsuccessful', async () => {
        let save_stub = sinon.stub(component.d_ag_test_suite!, 'save');
        save_stub.returns(
            Promise.reject(
                new HttpError(
                    400,
                    {__all__: "Ag test suite with this Name and Project already exists."}
                )
            )
        );

        wrapper.find('#ag-test-suite-settings-form').trigger('submit');
        await component.$nextTick();

        expect(save_stub.calledOnce).toBe(true);

        let api_errors = <APIErrors> wrapper.find({ref: 'api_errors'}).vm;
        expect(api_errors.d_api_errors.length).toBe(1);
    });

    test('Delete a Suite', async () => {
        let delete_stub = sinon.stub(component.d_ag_test_suite!, 'delete');
        await component.$nextTick();

        expect(wrapper.vm.d_show_delete_ag_test_suite_modal).toBe(false);
        expect(wrapper.find({ref: 'delete_ag_test_suite_modal'}).exists()).toBe(false);

        wrapper.find('.delete-ag-test-suite-button').trigger('click');
        await component.$nextTick();

        expect(wrapper.vm.d_show_delete_ag_test_suite_modal).toBe(true);
        expect(wrapper.find({ref: 'delete_ag_test_suite_modal'}).exists()).toBe(true);

        wrapper.find('.modal-delete-button').trigger('click');
        await component.$nextTick();

        expect(delete_stub.calledOnce).toBe(true);
        expect(wrapper.vm.d_show_delete_ag_test_suite_modal).toBe(false);
        expect(wrapper.find({ref: 'delete_ag_test_suite_modal'}).exists()).toBe(false);
    });

    test('Parent component changes the value of the test_suite prop', async () => {
        let another_ag_suite = make_ag_test_suite(project.pk);
        another_ag_suite.instructor_files_needed = [instructor_file_2, instructor_file_1];
        another_ag_suite.student_files_needed = [student_file_2, student_file_1];

        expect(component.d_ag_test_suite!.pk).toEqual(ag_suite.pk);

        wrapper.setProps({'ag_test_suite': another_ag_suite});
        await component.$nextTick();

        expect(component.d_ag_test_suite!.pk).toEqual(another_ag_suite.pk);

        wrapper.setProps({'ag_test_suite': ag_suite});
        await component.$nextTick();

        expect(component.d_ag_test_suite!.pk).toEqual(ag_suite.pk);
    });
});

describe('AG test suite feedback tests', () => {
    let ag_test_suite: AGTestSuite;
    let project: Project = make_project(make_course().pk);

    beforeEach(() => {
        ag_test_suite = make_ag_test_suite(project.pk);
        sinon.stub(ag_cli, 'get_sandbox_docker_images').returns(Promise.resolve([]));
    });

    afterEach(() => {
        sinon.restore();
    });

    test('Normal fdbk binding', async () => {
        ag_test_suite.normal_fdbk_config = make_ag_test_suite_fdbk_config({
            show_setup_return_code: true,
            show_setup_stdout: false,
        });

        let wrapper = mount(AGSuiteSettings, {
            propsData: {
                ag_test_suite: ag_test_suite,
                project: project
            }
        });

        await wrapper.vm.$nextTick();

        let normal_config_panel
            = <Wrapper<FeedbackConfigPanel>> wrapper.find({ref: 'normal_config_panel'});
        expect(normal_config_panel.vm.value).toEqual(ag_test_suite.normal_fdbk_config);

        let normal_advanced_settings
            = <Wrapper<AGTestSuiteAdvancedFdbkSettings>> wrapper.find(
                {ref: 'normal_edit_feedback_settings'});
        expect(normal_advanced_settings.vm.value).toEqual(ag_test_suite.normal_fdbk_config);

        let new_val = make_ag_test_suite_fdbk_config({
            show_setup_return_code: false,
            show_setup_stdout: true,
        });
        normal_config_panel.vm.$emit('input', new_val);
        expect(wrapper.vm.d_ag_test_suite!.normal_fdbk_config).toEqual(new_val);

        new_val = make_ag_test_suite_fdbk_config({
            show_setup_return_code: false,
            show_setup_stdout: false,
        });
        normal_advanced_settings.vm.$emit('input', new_val);
        expect(wrapper.vm.d_ag_test_suite!.normal_fdbk_config).toEqual(new_val);
    });

    test('Final graded fdbk binding', async () => {
        ag_test_suite.ultimate_submission_fdbk_config = make_ag_test_suite_fdbk_config({
            show_setup_return_code: true,
            show_setup_stdout: false,
        });

        let wrapper = mount(AGSuiteSettings, {
            propsData: {
                ag_test_suite: ag_test_suite,
                project: project
            }
        });
        await wrapper.vm.$nextTick();

        let final_graded_config_panel
            = <Wrapper<FeedbackConfigPanel>> wrapper.find({ref: 'final_graded_config_panel'});
        expect(final_graded_config_panel.vm.value).toEqual(
            ag_test_suite.ultimate_submission_fdbk_config);

        let final_graded_advanced_settings
            = <Wrapper<AGTestSuiteAdvancedFdbkSettings>> wrapper.find(
                {ref: 'final_graded_edit_feedback_settings'});
        expect(final_graded_advanced_settings.vm.value).toEqual(
            ag_test_suite.ultimate_submission_fdbk_config);

        let new_val = make_ag_test_suite_fdbk_config({
            show_setup_return_code: false,
            show_setup_stdout: true,
        });
        final_graded_config_panel.vm.$emit('input', new_val);
        expect(wrapper.vm.d_ag_test_suite!.ultimate_submission_fdbk_config).toEqual(new_val);

        new_val = make_ag_test_suite_fdbk_config({
            show_setup_return_code: false,
            show_setup_stdout: false,
        });
        final_graded_advanced_settings.vm.$emit('input', new_val);
        expect(wrapper.vm.d_ag_test_suite!.ultimate_submission_fdbk_config).toEqual(new_val);
    });

    test('Past limit fdbk binding', async () => {
        ag_test_suite.past_limit_submission_fdbk_config = make_ag_test_suite_fdbk_config({
            show_setup_return_code: true,
            show_setup_stdout: false,
        });

        let wrapper = mount(AGSuiteSettings, {
            propsData: {
                ag_test_suite: ag_test_suite,
                project: project
            }
        });
        await wrapper.vm.$nextTick();

        let past_limit_config_panel
            = <Wrapper<FeedbackConfigPanel>> wrapper.find({ref: 'past_limit_config_panel'});
        expect(past_limit_config_panel.vm.value).toEqual(
            ag_test_suite.past_limit_submission_fdbk_config);

        let past_limit_advanced_settings
            = <Wrapper<AGTestSuiteAdvancedFdbkSettings>> wrapper.find(
                {ref: 'past_limit_edit_feedback_settings'});
        expect(past_limit_advanced_settings.vm.value).toEqual(
            ag_test_suite.past_limit_submission_fdbk_config);

        let new_val = make_ag_test_suite_fdbk_config({
            show_setup_return_code: false,
            show_setup_stdout: true,
        });
        past_limit_config_panel.vm.$emit('input', new_val);
        expect(wrapper.vm.d_ag_test_suite!.past_limit_submission_fdbk_config).toEqual(new_val);

        new_val = make_ag_test_suite_fdbk_config({
            show_setup_return_code: false,
            show_setup_stdout: false,
        });
        past_limit_advanced_settings.vm.$emit('input', new_val);
        expect(wrapper.vm.d_ag_test_suite!.past_limit_submission_fdbk_config).toEqual(new_val);
    });

    test('Student lookup fdbk binding', async () => {
        ag_test_suite.staff_viewer_fdbk_config = make_ag_test_suite_fdbk_config({
            show_setup_return_code: true,
            show_setup_stdout: false,
        });

        let wrapper = mount(AGSuiteSettings, {
            propsData: {
                ag_test_suite: ag_test_suite,
                project: project
            }
        });
        await wrapper.vm.$nextTick();

        let student_lookup_config_panel
            = <Wrapper<FeedbackConfigPanel>> wrapper.find({ref: 'student_lookup_config_panel'});
        expect(student_lookup_config_panel.vm.value).toEqual(
            ag_test_suite.staff_viewer_fdbk_config);

        let student_lookup_advanced_settings
            = <Wrapper<AGTestSuiteAdvancedFdbkSettings>> wrapper.find(
                {ref: 'student_lookup_edit_feedback_settings'});
        expect(student_lookup_advanced_settings.vm.value).toEqual(
            ag_test_suite.staff_viewer_fdbk_config);

        let new_val = make_ag_test_suite_fdbk_config({
            show_setup_return_code: false,
            show_setup_stdout: true,
        });
        student_lookup_config_panel.vm.$emit('input', new_val);
        expect(wrapper.vm.d_ag_test_suite!.staff_viewer_fdbk_config).toEqual(new_val);

        new_val = make_ag_test_suite_fdbk_config({
            show_setup_return_code: false,
            show_setup_stdout: false,
        });
        student_lookup_advanced_settings.vm.$emit('input', new_val);
        expect(wrapper.vm.d_ag_test_suite!.staff_viewer_fdbk_config).toEqual(new_val);
    });
});
