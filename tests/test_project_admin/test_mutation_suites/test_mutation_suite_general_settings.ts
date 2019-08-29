import { config, mount, Wrapper } from '@vue/test-utils';

import {
    ExpectedStudentFile,
    InstructorFile,
    MutationTestSuite,
    Project,
    SandboxDockerImageData
} from 'ag-client-typescript';
// tslint:disable-next-line:no-duplicate-imports
import * as ag_cli from 'ag-client-typescript';
import * as sinon from "sinon";

import DropdownTypeahead from '@/components/dropdown_typeahead.vue';
import MutationSuiteGeneralSettings from '@/components/project_admin/mutation_suites/mutation_suite_general_settings.vue';

import { make_course, make_mutation_test_suite, make_project } from '@/tests/data_utils';
import {
    checkbox_is_checked, do_invalid_text_input_test_without_save_button,
    get_validated_input_text,
    set_validated_input_text,
    validated_input_is_valid
} from '@/tests/utils';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('MutationSuiteGeneralSettings tests', () => {
    let wrapper: Wrapper<MutationSuiteGeneralSettings>;
    let mutation_test_suite: MutationTestSuite;
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
                instructor_files: [
                    instructor_file_1,
                    instructor_file_2,
                    instructor_file_3
                ],
                expected_student_files: [
                    student_file_1,
                    student_file_2,
                    student_file_3
                ]
            }
        );

        mutation_test_suite = make_mutation_test_suite(
            project.pk,
            {
                instructor_files_needed: [instructor_file_1, instructor_file_2],
                student_files_needed: [student_file_1, student_file_2]
            }
        );

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

        wrapper = mount(MutationSuiteGeneralSettings, {
            propsData: {
                value: mutation_test_suite,
                project: project
            }
        });
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
        expect(wrapper.emitted().input.length).toEqual(1);

        expect(wrapper.vm.d_mutation_test_suite!.name).toEqual("Sweet Name");
        expect(validated_input_is_valid(suite_name_input)).toEqual(true);

        wrapper.vm.d_mutation_test_suite!.name = "Thanks";
        expect(get_validated_input_text(suite_name_input)).toEqual("Thanks");
    });

    test('Suite name cannot be empty - violates condition', async () => {
        let suite_name_input = wrapper.find({ref: 'suite_name'});
        set_validated_input_text(suite_name_input, '');

        expect(validated_input_is_valid(suite_name_input)).toBe(false);

        set_validated_input_text(suite_name_input, 'hi');
        return do_invalid_text_input_test_without_save_button(
            wrapper, {ref: 'suite_name'}, ' ');
    });

    test('deferred binding', () => {
        let synchronous_checkbox = wrapper.find('#synchronous-or-deferred');

        synchronous_checkbox.setChecked(false);
        expect(wrapper.vm.d_mutation_test_suite!.deferred).toEqual(true);
        expect(checkbox_is_checked(synchronous_checkbox)).toEqual(false);
        expect(wrapper.emitted().input.length).toEqual(1);

        synchronous_checkbox.setChecked(true);
        expect(wrapper.vm.d_mutation_test_suite!.deferred).toEqual(false);
        expect(checkbox_is_checked(synchronous_checkbox)).toEqual(true);
        expect(wrapper.emitted().input.length).toEqual(2);

        synchronous_checkbox.setChecked(false);
        expect(wrapper.vm.d_mutation_test_suite!.deferred).toEqual(true);
        expect(checkbox_is_checked(synchronous_checkbox)).toEqual(false);
        expect(wrapper.emitted().input.length).toEqual(3);

        wrapper.vm.d_mutation_test_suite!.deferred = false;
        expect(checkbox_is_checked(synchronous_checkbox)).toEqual(true);

        wrapper.vm.d_mutation_test_suite!.deferred = true;
        expect(checkbox_is_checked(synchronous_checkbox)).toEqual(false);
    });

    test('sandbox_docker_image binding', async () => {
        let sandbox_docker_image_input = wrapper.find(
            '#sandbox-docker-image'
        );
        sandbox_docker_image_input.find('.dropdown-header-wrapper').trigger('click');
        await wrapper.vm.$nextTick();

        let dropdown_container_wrapper = wrapper.find('#dropdown-container');
        dropdown_container_wrapper.trigger("keydown", {code: "ArrowDown"});
        await wrapper.vm.$nextTick();

        let highlighted_item = sandbox_docker_image_input.find(".highlight");
        expect(highlighted_item.text()).toContain(sandbox_docker_image_2.display_name);
        highlighted_item.trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_mutation_test_suite!.sandbox_docker_image).toEqual(
            sandbox_docker_image_2
        );
        expect(sandbox_docker_image_input.find(
            '.dropdown-header-wrapper'
        ).text()).toEqual(sandbox_docker_image_2.display_name);
        expect(wrapper.emitted().input.length).toEqual(1);

        sandbox_docker_image_input.find('.dropdown-header-wrapper').trigger('click');
        await wrapper.vm.$nextTick();

        dropdown_container_wrapper.trigger("keydown", {code: "ArrowDown"});
        await wrapper.vm.$nextTick();

        highlighted_item = wrapper.find(".highlight");
        expect(highlighted_item.text()).toContain(sandbox_docker_image_3.display_name);
        highlighted_item.trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_mutation_test_suite!.sandbox_docker_image).toEqual(
            sandbox_docker_image_3
        );
        expect(sandbox_docker_image_input.find(
            '.dropdown-header-wrapper'
        ).text()).toEqual(sandbox_docker_image_3.display_name);
        expect(wrapper.emitted().input.length).toEqual(2);

        sandbox_docker_image_input.find('.dropdown-header-wrapper').trigger('click');
        await wrapper.vm.$nextTick();

        dropdown_container_wrapper.trigger("keydown", {code: "ArrowUp"});
        dropdown_container_wrapper.trigger("keydown", {code: "ArrowUp"});

        highlighted_item = wrapper.find(".highlight");
        expect(highlighted_item.text()).toContain(sandbox_docker_image_1.display_name);
        highlighted_item.trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_mutation_test_suite!.sandbox_docker_image).toEqual(
            sandbox_docker_image_1
        );
        expect(sandbox_docker_image_input.find(
            '.dropdown-header-wrapper'
        ).text()).toEqual(sandbox_docker_image_1.display_name);
        expect(wrapper.emitted().input.length).toEqual(3);
    });

    test('Toggle allow_network_access', async () => {
        let allow_network_access_toggle = wrapper.find({ref: 'allow_network_access'});

        wrapper.vm.d_mutation_test_suite!.allow_network_access = true;
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_mutation_test_suite!.allow_network_access).toEqual(true);

        allow_network_access_toggle.find('.off-border').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_mutation_test_suite!.allow_network_access).toEqual(false);
        expect(wrapper.emitted().input.length).toEqual(1);

        allow_network_access_toggle.find('.on-border').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_mutation_test_suite!.allow_network_access).toEqual(true);
        expect(wrapper.emitted().input.length).toEqual(2);
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
        await wrapper.vm.$nextTick();

        expect(dropdown_typeahead.filtered_choices.length).toEqual(1);
        expect(dropdown_typeahead.filtered_choices[0]).toEqual(instructor_file_3);

        search_bar.trigger('keydown', { code: 'Enter' });
        await dropdown_typeahead.$nextTick();

        expect(wrapper.emitted().input.length).toEqual(1);
        expect(wrapper.vm.d_mutation_test_suite!.instructor_files_needed.length).toEqual(3);
        expect(wrapper.vm.d_mutation_test_suite!.instructor_files_needed[0]).toEqual(
            instructor_file_1
        );
        expect(wrapper.vm.d_mutation_test_suite!.instructor_files_needed[1]).toEqual(
            instructor_file_2
        );
        expect(wrapper.vm.d_mutation_test_suite!.instructor_files_needed[2]).toEqual(
            instructor_file_3
        );
    });

    test('Deleting an instructor file', async () => {
        expect(wrapper.vm.d_mutation_test_suite!.instructor_files_needed.length).toEqual(2);
        expect(wrapper.vm.d_mutation_test_suite!.instructor_files_needed[0]).toEqual(
            instructor_file_1
        );
        expect(wrapper.vm.d_mutation_test_suite!.instructor_files_needed[1]).toEqual(
            instructor_file_2
        );

        let instructor_files_section = wrapper.find('#instructor-files');
        instructor_files_section.findAll('.file').at(1).find(
            '.delete-file-icon-container'
        ).trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.emitted().input.length).toEqual(1);
        expect(wrapper.vm.d_mutation_test_suite!.instructor_files_needed.length).toEqual(1);
        expect(wrapper.vm.d_mutation_test_suite!.instructor_files_needed[0]).toEqual(
            instructor_file_1
        );
    });

    test('InstructorFile filter function on dropdown typeahead', async () => {
        let dropdown_typeahead = <DropdownTypeahead> wrapper.find(
            {ref: 'instructor_files_typeahead'}
        ).vm;
        expect(dropdown_typeahead.choices).toEqual([instructor_file_3]);

        dropdown_typeahead.filter_text = "a";
        await wrapper.vm.$nextTick();

        expect(dropdown_typeahead.filtered_choices.length).toEqual(1);
        expect(dropdown_typeahead.filtered_choices[0]).toEqual(instructor_file_3);

        let instructor_files_section = wrapper.find('#instructor-files');
        instructor_files_section.findAll('.file').at(0).find(
            '.delete-file-icon-container'
        ).trigger('click');
        await wrapper.vm.$nextTick();

        expect(dropdown_typeahead.choices).toEqual([instructor_file_1, instructor_file_3]);

        dropdown_typeahead.filter_text = "ui";
        await wrapper.vm.$nextTick();

        expect(dropdown_typeahead.filtered_choices.length).toEqual(1);
        expect(dropdown_typeahead.filtered_choices[0]).toEqual(instructor_file_1);
    });

    test('instructor_files_available', async () => {
        expect(wrapper.vm.instructor_files_available).toEqual([instructor_file_3]);

        expect(wrapper.vm.d_mutation_test_suite!.instructor_files_needed.length).toEqual(2);
        expect(wrapper.vm.d_mutation_test_suite!.instructor_files_needed[0]).toEqual(
            instructor_file_1
        );
        expect(wrapper.vm.d_mutation_test_suite!.instructor_files_needed[1]).toEqual(
            instructor_file_2
        );

        let instructor_file_section = wrapper.find('#instructor-files');
        instructor_file_section.findAll('.file').at(1).find(
            '.delete-file-icon-container'
        ).trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_mutation_test_suite!.instructor_files_needed.length).toEqual(1);
        expect(wrapper.vm.instructor_files_available).toEqual(
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
        await wrapper.vm.$nextTick();

        expect(dropdown_typeahead.filtered_choices.length).toEqual(1);
        expect(dropdown_typeahead.filtered_choices[0]).toEqual(student_file_3);

        search_bar.trigger('keydown', {code: 'Enter'});
        await dropdown_typeahead.$nextTick();

        expect(wrapper.emitted().input.length).toEqual(1);
        expect(wrapper.vm.d_mutation_test_suite!.student_files_needed.length).toEqual(3);
        expect(wrapper.vm.d_mutation_test_suite!.student_files_needed[0]).toEqual(student_file_1);
        expect(wrapper.vm.d_mutation_test_suite!.student_files_needed[1]).toEqual(student_file_2);
        expect(wrapper.vm.d_mutation_test_suite!.student_files_needed[2]).toEqual(student_file_3);
    });

    test('Deleting a student file', async () => {
        expect(wrapper.vm.d_mutation_test_suite!.student_files_needed.length).toEqual(2);
        expect(wrapper.vm.d_mutation_test_suite!.student_files_needed[0]).toEqual(student_file_1);
        expect(wrapper.vm.d_mutation_test_suite!.student_files_needed[1]).toEqual(student_file_2);

        let student_files_section = wrapper.find('#student-files');
        student_files_section.findAll('.file').at(1).find(
            '.delete-file-icon-container'
        ).trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.emitted().input.length).toEqual(1);
        expect(wrapper.vm.d_mutation_test_suite!.student_files_needed.length).toEqual(1);
        expect(wrapper.vm.d_mutation_test_suite!.student_files_needed[0]).toEqual(student_file_1);
    });

    test('ExpectedStudentFile filter function on dropdown typeahead',  async () => {
        let dropdown_typeahead = <DropdownTypeahead> wrapper.find(
            {ref: 'student_files_typeahead'}
        ).vm;
        expect(dropdown_typeahead.choices).toEqual([student_file_3]);

        dropdown_typeahead.filter_text = "e";
        await wrapper.vm.$nextTick();

        expect(dropdown_typeahead.filtered_choices.length).toEqual(1);
        expect(dropdown_typeahead.filtered_choices[0]).toEqual(student_file_3);

        let student_files_section = wrapper.find('#student-files');
        student_files_section.findAll('.file').at(0).find(
            '.delete-file-icon-container'
        ).trigger('click');
        await wrapper.vm.$nextTick();

        expect(dropdown_typeahead.choices).toEqual([student_file_1, student_file_3]);

        dropdown_typeahead.filter_text = "ep";
        await wrapper.vm.$nextTick();

        expect(dropdown_typeahead.filtered_choices.length).toEqual(1);
        expect(dropdown_typeahead.filtered_choices[0]).toEqual(student_file_1);
    });

    test('expected_student_files_available', async () => {
        expect(wrapper.vm.expected_student_files_available).toEqual([student_file_3]);

        expect(wrapper.vm.d_mutation_test_suite!.student_files_needed.length).toEqual(2);
        expect(wrapper.vm.d_mutation_test_suite!.student_files_needed[0]).toEqual(student_file_1);
        expect(wrapper.vm.d_mutation_test_suite!.student_files_needed[1]).toEqual(student_file_2);

        let student_files_section = wrapper.find('#student-files');
        student_files_section.findAll('.file').at(1).find(
            '.delete-file-icon-container'
        ).trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_mutation_test_suite!.student_files_needed.length).toEqual(1);
        expect(wrapper.vm.expected_student_files_available).toEqual(
            [student_file_2, student_file_3]
        );
    });

    test('value watcher', async () => {
        let another_mutation_suite =  make_mutation_test_suite(project.pk);

        expect(wrapper.vm.d_mutation_test_suite).toEqual(mutation_test_suite);

        wrapper.setProps({'value': another_mutation_suite});
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_mutation_test_suite).toEqual(another_mutation_suite);
    });
});
