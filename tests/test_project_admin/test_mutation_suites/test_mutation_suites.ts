import { config, mount, Wrapper } from '@vue/test-utils';

import {
    BugsExposedFeedbackLevel,
    ExpectedStudentFile,
    HttpError,
    InstructorFile,
    MutationTestSuite,
    Project,
    SandboxDockerImageData
} from 'ag-client-typescript';
// tslint:disable-next-line:no-duplicate-imports
import * as ag_cli from 'ag-client-typescript';
import * as sinon from "sinon";

import APIErrors from '@/components/api_errors.vue';
import DropdownTypeahead from '@/components/dropdown_typeahead.vue';
import MutationSuites from '@/components/project_admin/mutation_suites/mutation_suites.vue';

import * as data_ut from '@/tests/data_utils';
import {
    get_validated_input_text,
    set_validated_input_text,
    validated_input_is_valid
} from '@/tests/utils';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('MutationSuites tests', () => {
    let wrapper: Wrapper<MutationSuites>;
    let project: Project;
    let mutation_test_suite_1: MutationTestSuite;
    let mutation_test_suite_2: MutationTestSuite;
    let mutation_test_suite_3: MutationTestSuite;
    let sandbox_docker_image_1: SandboxDockerImageData;
    let sandbox_docker_image_2: SandboxDockerImageData;
    let sandbox_docker_image_3: SandboxDockerImageData;
    let student_file_1: ExpectedStudentFile;
    let student_file_2: ExpectedStudentFile;
    let student_file_3: ExpectedStudentFile;
    let instructor_file_1: InstructorFile;
    let instructor_file_2: InstructorFile;
    let instructor_file_3: InstructorFile;
    let original_match_media: (query: string) => MediaQueryList;

    beforeEach(() => {
        original_match_media = window.matchMedia;
        Object.defineProperty(window, "matchMedia", {
            value: jest.fn(() => {
                return {matches: true};
            })
        });

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
            name: "rabbit.cpp",
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

        project = data_ut.make_project(
            data_ut.make_course().pk,
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

        mutation_test_suite_1 = data_ut.make_mutation_test_suite(project.pk);
        mutation_test_suite_2 = data_ut.make_mutation_test_suite(project.pk);
        mutation_test_suite_3 = data_ut.make_mutation_test_suite(project.pk);

        sinon.stub(MutationTestSuite, 'get_all_from_project').returns(
            Promise.resolve([
                mutation_test_suite_1,
                mutation_test_suite_2,
                mutation_test_suite_3
            ])
        );

        wrapper = mount(MutationSuites, {
            propsData: {
                project: project
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

    test('Clicking on a mutation test suite makes it the active_mutation_test_suite ',
         async () => {
        expect(wrapper.vm.d_mutation_test_suites.length).toEqual(3);

        wrapper.findAll('.mutation-test-suite-panel').at(1).trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_active_mutation_test_suite).toEqual(mutation_test_suite_2);

        wrapper.findAll('.mutation-test-suite-panel').at(0).trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_active_mutation_test_suite).toEqual(mutation_test_suite_1);

        wrapper.findAll('.mutation-test-suite-panel').at(0).trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_active_mutation_test_suite).toEqual(mutation_test_suite_1);
    });

    test('d_new_mutation_test_suite_name binding', async () => {
        wrapper.find('#add-mutation-test-suite-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_new_mutation_test_suite_name).toEqual("");

        let d_new_mutation_test_suite_name_input = wrapper.find(
            {ref: 'new_mutation_test_suite_name'}
        );
        set_validated_input_text(d_new_mutation_test_suite_name_input, "Suite I");
        expect(validated_input_is_valid(d_new_mutation_test_suite_name_input)).toBe(true);
        expect(wrapper.vm.d_new_mutation_test_suite_name).toEqual("Suite I");

        wrapper.vm.d_new_mutation_test_suite_name = "Suite II";
        expect(get_validated_input_text(d_new_mutation_test_suite_name_input)).toEqual("Suite II");
    });

    test('add mutation_test_suite - successful', async () => {
        expect(wrapper.vm.d_mutation_test_suites.length).toEqual(3);
        expect(wrapper.vm.d_show_new_mutation_test_suite_modal).toBe(false);
        expect(wrapper.find(
            {ref: 'new_mutation_test_suite_modal'}
        ).exists()).toBe(false);

        let new_mutation_suite = data_ut.make_mutation_test_suite(project.pk);
        let create_stub = sinon.stub(MutationTestSuite, 'create').returns(
            Promise.resolve(
                new_mutation_suite
            )
        );
        create_stub.callsFake(() => MutationTestSuite.notify_mutation_test_suite_created(
            new_mutation_suite
        ));

        wrapper.find('#add-mutation-test-suite-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_show_new_mutation_test_suite_modal).toBe(true);
        expect(wrapper.find(
            {ref: 'new_mutation_test_suite_modal'}
        ).exists()).toBe(true);

        let d_new_mutation_test_suite_name_input = wrapper.find(
            {ref: 'new_mutation_test_suite_name'}
        );

        set_validated_input_text(d_new_mutation_test_suite_name_input, "Suite 4");
        expect(validated_input_is_valid(d_new_mutation_test_suite_name_input)).toBe(true);
        expect(wrapper.vm.d_new_mutation_test_suite_name).toEqual("Suite 4");

        wrapper.find('#create-mutation-test-suite-form').trigger('submit');
        await wrapper.vm.$nextTick();

        expect(create_stub.calledOnce).toBe(true);
        expect(wrapper.vm.d_new_mutation_test_suite_name).toEqual("");
        expect(create_stub.firstCall.calledWith(project.pk, {name: "Suite 4"})).toBe(true);
        expect(wrapper.vm.d_mutation_test_suites.length).toEqual(4);
        expect(wrapper.vm.d_show_new_mutation_test_suite_modal).toBe(false);
        expect(wrapper.find(
            {ref: 'new_mutation_test_suite_modal'}
        ).exists()).toBe(false);
    });

    test('add mutation_test_suite - unsuccessful', async () => {
        let create_stub = sinon.stub(MutationTestSuite, 'create').returns(
            Promise.reject(
                new HttpError(
                    400,
                    {__all__: "Mutation test suite with this Name and Project already exists."}
                )
            )
        );
        expect(wrapper.vm.d_show_new_mutation_test_suite_modal).toBe(false);
        expect(wrapper.find(
            {ref: 'new_mutation_test_suite_modal'}
        ).exists()).toBe(false);

        wrapper.find('#add-mutation-test-suite-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_show_new_mutation_test_suite_modal).toBe(true);
        expect(wrapper.find(
            {ref: 'new_mutation_test_suite_modal'}
        ).exists()).toBe(true);

        let d_new_mutation_test_suite_name_input = wrapper.find(
            {ref: 'new_mutation_test_suite_name'}
        );

        set_validated_input_text(d_new_mutation_test_suite_name_input, "Suite 2");
        expect(validated_input_is_valid(d_new_mutation_test_suite_name_input)).toBe(true);
        expect(wrapper.vm.d_new_mutation_test_suite_name).toEqual("Suite 2");

        wrapper.find('#create-mutation-test-suite-form').trigger('submit');
        await wrapper.vm.$nextTick();

        expect(create_stub.calledOnce).toBe(true);
        expect(create_stub.firstCall.calledWith(project.pk, {name: "Suite 2"})).toBe(true);
        expect(wrapper.vm.d_mutation_test_suites.length).toEqual(3);
        expect(wrapper.vm.d_show_new_mutation_test_suite_modal).toBe(true);
        expect(wrapper.find(
            {ref: 'new_mutation_test_suite_modal'}
        ).exists()).toBe(true);

        let api_errors = <APIErrors> wrapper.find({ref: 'api_errors'}).vm;
        expect(api_errors.d_api_errors.length).toBe(1);
    });

    test('save mutation_test_suite - successful', async () => {
        wrapper.findAll('.mutation-test-suite-panel').at(1).trigger('click');
        await wrapper.vm.$nextTick();

        let save_stub = sinon.stub(wrapper.vm.d_active_mutation_test_suite!, 'save');
        expect(wrapper.vm.d_active_mutation_test_suite).toEqual(mutation_test_suite_2);
        expect(wrapper.vm.d_mutation_test_suites.length).toEqual(3);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(false);

        wrapper.find('#mutation-test-suite-form').trigger('submit');
        await wrapper.vm.$nextTick();

        expect(save_stub.callCount).toEqual(1);
        expect(wrapper.vm.d_mutation_test_suites.length).toEqual(3);
    });

    test('save mutation_test_suite - unsuccessful', async () => {
        wrapper.findAll('.mutation-test-suite-panel').at(1).trigger('click');
        await wrapper.vm.$nextTick();

        let save_stub = sinon.stub(wrapper.vm.d_active_mutation_test_suite!, 'save').returns(
            Promise.reject(
                new HttpError(
                    400,
                    {__all__: "Mutation test suite with this Name and Project already exists."}
                )
            )
        );
        expect(wrapper.vm.d_active_mutation_test_suite).toEqual(mutation_test_suite_2);
        expect(wrapper.vm.d_mutation_test_suites.length).toEqual(3);
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(false);

        wrapper.find('#mutation-test-suite-form').trigger('submit');
        await wrapper.vm.$nextTick();

        let api_errors = <APIErrors> wrapper.find({ref: 'api_errors'}).vm;
        expect(api_errors.d_api_errors.length).toBe(1);
        expect(save_stub.callCount).toEqual(1);
    });

    test('delete_mutation_test_suite - confirm deletion', async () => {
        let delete_stub = sinon.stub(mutation_test_suite_2, 'delete');
        delete_stub.callsFake(
            () => MutationTestSuite.notify_mutation_test_suite_deleted(mutation_test_suite_2)
        );

        wrapper.findAll('.mutation-test-suite-panel').at(1).trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_active_mutation_test_suite).toEqual(mutation_test_suite_2);
        expect(wrapper.vm.d_mutation_test_suites.length).toEqual(3);
        expect(wrapper.vm.d_show_delete_mutation_test_suite_modal).toBe(false);
        expect(wrapper.find(
            {ref: 'delete_mutation_test_suite_modal'}
        ).exists()).toBe(false);

        wrapper.find('.delete-mutation-test-suite-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_show_delete_mutation_test_suite_modal).toBe(true);
        expect(wrapper.find(
            {ref: 'delete_mutation_test_suite_modal'}
        ).exists()).toBe(true);

        wrapper.find('.modal-delete-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(delete_stub.calledOnce).toBe(true);
        expect(wrapper.vm.d_mutation_test_suites.length).toEqual(2);
        expect(wrapper.vm.d_mutation_test_suites[0]).toEqual(mutation_test_suite_1);
        expect(wrapper.vm.d_mutation_test_suites[1]).toEqual(mutation_test_suite_3);
        expect(wrapper.vm.d_active_mutation_test_suite).toBeNull();
        expect(wrapper.vm.d_show_delete_mutation_test_suite_modal).toBe(false);
        expect(wrapper.find(
            {ref: 'delete_mutation_test_suite_modal'}
        ).exists()).toBe(false);
    });

    test('delete_mutation_test_suite - cancel deletion', async () => {
        let delete_stub = sinon.stub(mutation_test_suite_2, 'delete');

        wrapper.findAll('.mutation-test-suite-panel').at(1).trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_active_mutation_test_suite).toEqual(mutation_test_suite_2);
        expect(wrapper.vm.d_mutation_test_suites.length).toEqual(3);
        expect(wrapper.vm.d_show_delete_mutation_test_suite_modal).toBe(false);
        expect(wrapper.find(
            {ref: 'delete_mutation_test_suite_modal'}
        ).exists()).toBe(false);

        wrapper.find('.delete-mutation-test-suite-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_show_delete_mutation_test_suite_modal).toBe(true);
        expect(wrapper.find(
            {ref: 'delete_mutation_test_suite_modal'}
        ).exists()).toBe(true);

        wrapper.find('.modal-cancel-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(delete_stub.callCount).toEqual(0);
        expect(wrapper.vm.d_mutation_test_suites.length).toEqual(3);
        expect(wrapper.vm.d_show_delete_mutation_test_suite_modal).toBe(false);
        expect(wrapper.find(
            {ref: 'delete_mutation_test_suite_modal'}
        ).exists()).toBe(false);
    });

    test('update_mutation_test_suite_changed and was the active mutation suite', async () => {
        let updated_mutation_test_suite_1 = data_ut.make_mutation_test_suite(
            project.pk,
            {
                name: mutation_test_suite_1.name,
                pk: mutation_test_suite_1.pk
            }
        );
        updated_mutation_test_suite_1.use_setup_command = true;
        updated_mutation_test_suite_1.setup_command.name = "Updated Setup Command";
        updated_mutation_test_suite_1.get_student_test_names_command.time_limit = 11;
        updated_mutation_test_suite_1.student_test_validity_check_command.stack_size_limit
            = 200000;
        updated_mutation_test_suite_1.grade_buggy_impl_command.virtual_memory_limit = 6000000;

        wrapper.findAll('.mutation-test-suite-panel').at(0).trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_active_mutation_test_suite).toEqual(mutation_test_suite_1);
        expect(wrapper.vm.d_mutation_test_suites[0]).toEqual(mutation_test_suite_1);

        MutationTestSuite.notify_mutation_test_suite_changed(updated_mutation_test_suite_1);

        expect(wrapper.vm.d_active_mutation_test_suite).toEqual(updated_mutation_test_suite_1);
        expect(wrapper.vm.d_mutation_test_suites[0]).toEqual(updated_mutation_test_suite_1);
    });

    test('update_mutation_test_suite_changed and was not the active mutation suite', async () => {
        let updated_mutation_test_suite_3 = data_ut.make_mutation_test_suite(
            project.pk,
            {
                name : mutation_test_suite_3.name,
                pk : mutation_test_suite_3.pk,
                use_setup_command : true,
            }
        );
        updated_mutation_test_suite_3.setup_command.name = "Updated Setup Command";
        updated_mutation_test_suite_3.get_student_test_names_command.time_limit = 11;
        updated_mutation_test_suite_3.student_test_validity_check_command.stack_size_limit
            = 200000;
        updated_mutation_test_suite_3.grade_buggy_impl_command.virtual_memory_limit = 6000000;

        wrapper.findAll('.mutation-test-suite-panel').at(0).trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_active_mutation_test_suite).toEqual(mutation_test_suite_1);
        expect(wrapper.vm.d_mutation_test_suites[0]).toEqual(mutation_test_suite_1);

        MutationTestSuite.notify_mutation_test_suite_changed(updated_mutation_test_suite_3);

        expect(wrapper.vm.d_active_mutation_test_suite).toEqual(mutation_test_suite_1);
        expect(wrapper.vm.d_mutation_test_suites[0]).toEqual(mutation_test_suite_1);
    });

    test('update_mutation_test_suites_order_changed', () => {
        expect(() => MutationTestSuite.notify_mutation_test_suite_order_updated(
            project.pk, [1, 2])
        ).toThrow(Error("Method not implemented."));
    });

    test('General Settings - d_active_mutation_test_suite binding', async () => {
        wrapper.findAll('.mutation-test-suite-panel').at(1).trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_active_mutation_test_suite).toEqual(mutation_test_suite_2);

        // Name
        expect(wrapper.vm.d_active_mutation_test_suite!.name).not.toBe("Suite 22");

        set_validated_input_text(wrapper.find('#input-name'), "Suite 22");
        expect(wrapper.vm.d_active_mutation_test_suite!.name).toEqual("Suite 22");

        // Deferred
        expect(wrapper.vm.d_active_mutation_test_suite!.deferred).toBe(false);

        wrapper.find('#synchronous-or-deferred').setChecked(false);
        expect(wrapper.vm.d_active_mutation_test_suite!.deferred).toBe(true);

        // Sandbox
        expect(wrapper.vm.d_active_mutation_test_suite!.sandbox_docker_image).not.toEqual(
            sandbox_docker_image_2
        );

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

        expect(wrapper.vm.d_active_mutation_test_suite!.sandbox_docker_image).toEqual(
            sandbox_docker_image_2
        );

        // Network access
        expect(wrapper.vm.d_active_mutation_test_suite!.allow_network_access).toBe(false);

        let allow_network_access_toggle = wrapper.find('#allow-network-access');
        allow_network_access_toggle.find('.on-border').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_active_mutation_test_suite!.allow_network_access).toBe(true);

        // Instructor files
        expect(wrapper.vm.d_active_mutation_test_suite!.instructor_files_needed.length).toEqual(0);

        let dropdown_typeahead = <DropdownTypeahead> wrapper.find('#instructor-files-typeahead').vm;
        let search_bar = wrapper.find('#instructor-files-typeahead').find('input');
        search_bar.trigger("click");

        dropdown_typeahead.filter_text = "pen";
        await wrapper.vm.$nextTick();

        expect(dropdown_typeahead.filtered_choices.length).toEqual(1);
        expect(dropdown_typeahead.filtered_choices[0]).toEqual(instructor_file_1);

        search_bar.trigger('keydown', { code: 'Enter' });
        await dropdown_typeahead.$nextTick();

        expect(wrapper.vm.d_active_mutation_test_suite!.instructor_files_needed[0]).toEqual(
            instructor_file_1
        );

        wrapper.find('#instructor-files').findAll('.file').at(0).find(
            '.delete-file-icon-container'
        ).trigger('click');

        expect(wrapper.vm.d_active_mutation_test_suite!.student_files_needed.length).toEqual(0);

        // Student Files
        expect(wrapper.vm.d_active_mutation_test_suite!.student_files_needed.length).toEqual(0);

        dropdown_typeahead = <DropdownTypeahead> wrapper.find('#student-files-typeahead').vm;
        search_bar = wrapper.find('#student-files-typeahead').find('input');
        search_bar.trigger("click");

        dropdown_typeahead.filter_text = "mon";
        await wrapper.vm.$nextTick();

        expect(dropdown_typeahead.filtered_choices.length).toEqual(1);
        expect(dropdown_typeahead.filtered_choices[0]).toEqual(student_file_2);

        search_bar.trigger('keydown', { code: 'Enter' });
        await dropdown_typeahead.$nextTick();

        expect(wrapper.vm.d_active_mutation_test_suite!.student_files_needed[0]).toEqual(
            student_file_2
        );

        wrapper.find('#student-files').findAll('.file').at(0).find(
            '.delete-file-icon-container'
        ).trigger('click');

        expect(wrapper.vm.d_active_mutation_test_suite!.student_files_needed.length).toEqual(0);
    });

    test('Buggy Implementations - d_active_mutation_test_suite binding', async () => {
        wrapper.findAll('.mutation-test-suite-panel').at(1).trigger('click');
        await wrapper.vm.$nextTick();

        // Points per exposed bug
        expect(wrapper.vm.d_active_mutation_test_suite!.points_per_exposed_bug).not.toEqual(905.5);

        set_validated_input_text(wrapper.find('#points-per-exposed-bug'), '905.5');
        expect(wrapper.vm.d_active_mutation_test_suite!.points_per_exposed_bug).toEqual(905.5);

        // Use custom max points
        expect(wrapper.vm.d_active_mutation_test_suite!.max_points).toBeNull();

        let use_custom_max_points_toggle = wrapper.find('#use-custom-max-points');
        use_custom_max_points_toggle.find('.on-border').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_active_mutation_test_suite!.max_points).toEqual(0);

        // max points
        expect(wrapper.vm.d_active_mutation_test_suite!.max_points).toEqual(0);

        set_validated_input_text(wrapper.find('#max-points'), '3');
        expect(wrapper.vm.d_active_mutation_test_suite!.max_points).toEqual(3);

        // max num student tests
        expect(wrapper.vm.d_active_mutation_test_suite!.max_num_student_tests).not.toEqual(100);

        set_validated_input_text(wrapper.find('#max-num-student-tests'), '100');
        expect(wrapper.vm.d_active_mutation_test_suite!.max_num_student_tests).toEqual(100);

        // buggy implementation names
        expect(wrapper.vm.d_active_mutation_test_suite!.buggy_impl_names).toEqual([]);

        wrapper.find('#buggy-implementation-names-input').setValue('Bug_41 Bug_23 Bug_3');

        wrapper.find('#add-buggy-impl-names-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_active_mutation_test_suite!.buggy_impl_names.length).toEqual(3);
        expect(wrapper.vm.d_active_mutation_test_suite!.buggy_impl_names).toContain("Bug_3");
        expect(wrapper.vm.d_active_mutation_test_suite!.buggy_impl_names).toContain("Bug_23");
        expect(wrapper.vm.d_active_mutation_test_suite!.buggy_impl_names).toContain("Bug_41");

        wrapper.findAll('.remove-buggy-impl-name-container').at(2).trigger('click');

        expect(wrapper.vm.d_active_mutation_test_suite!.buggy_impl_names.length).toEqual(2);
        expect(wrapper.vm.d_active_mutation_test_suite!.buggy_impl_names).toContain("Bug_3");
        expect(wrapper.vm.d_active_mutation_test_suite!.buggy_impl_names).toContain("Bug_23");
        expect(wrapper.vm.d_active_mutation_test_suite!.buggy_impl_names).not.toContain("Bug_41");
    });

    test('Commands - d_active_mutation_test_suite binding',  async () => {
        wrapper.findAll('.mutation-test-suite-panel').at(1).trigger('click');
        await wrapper.vm.$nextTick();

        // setup command
        expect(wrapper.vm.d_active_mutation_test_suite!.use_setup_command).toBe(false);
        wrapper.find('#use-setup-command').setChecked(true);
        wrapper.find('#setup-command').find('.resource-limits-label').trigger('click');

        // name
        expect(
            wrapper.vm.d_active_mutation_test_suite!.setup_command.name
        ).not.toEqual("Tim Hortons");
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(true);

        set_validated_input_text(
            wrapper.find('#setup-command').find('#name'), 'Tim Hortons'
        );
        expect(wrapper.vm.d_active_mutation_test_suite!.setup_command.name).toEqual("Tim Hortons");
        expect(wrapper.find('.save-button').is('[disabled]')).toBe(false);


        // command
        expect(wrapper.vm.d_active_mutation_test_suite!.setup_command.cmd).not.toEqual("Bagel");

        set_validated_input_text(
            wrapper.find('#setup-command').find('#cmd'), 'Bagel'
        );
        expect(wrapper.vm.d_active_mutation_test_suite!.setup_command.cmd).toEqual("Bagel");

        // time limit
        expect(wrapper.vm.d_active_mutation_test_suite!.setup_command.time_limit).not.toEqual(20);

        set_validated_input_text(
            wrapper.find('#setup-command').find('#time-limit'), '20'
        );
        expect(wrapper.vm.d_active_mutation_test_suite!.setup_command.time_limit).toEqual(20);

        // stack size limit
        expect(
            wrapper.vm.d_active_mutation_test_suite!.setup_command.stack_size_limit
        ).not.toEqual(11);

        set_validated_input_text(
            wrapper.find('#setup-command').find('#stack-size-limit'), '11'
        );
        expect(wrapper.vm.d_active_mutation_test_suite!.setup_command.stack_size_limit).toEqual(11);

        // virtual memory limit
        expect(
            wrapper.vm.d_active_mutation_test_suite!.setup_command.virtual_memory_limit
        ).not.toEqual(12);

        set_validated_input_text(
            wrapper.find('#setup-command').find('#virtual-memory-limit'), '12'
        );
        expect(
            wrapper.vm.d_active_mutation_test_suite!.setup_command.virtual_memory_limit
        ).toEqual(12);

        // process spawn limit
        expect(
            wrapper.vm.d_active_mutation_test_suite!.setup_command.process_spawn_limit
        ).not.toEqual(13);

        set_validated_input_text(
            wrapper.find('#setup-command').find('#process-spawn-limit'), '13'
        );
        expect(
            wrapper.vm.d_active_mutation_test_suite!.setup_command.process_spawn_limit
        ).toEqual(13);
    });

    test('Edit Feedback Settings - d_active_mutation_test_suite binding', async () => {
        wrapper.findAll('.mutation-test-suite-panel').at(1).trigger('click');
        await wrapper.vm.$nextTick();

        // visible
        expect(
            wrapper.vm.d_active_mutation_test_suite!.past_limit_submission_fdbk_config.visible
        ).toBe(false);

        wrapper.find('#past-limit-visible').setChecked(true);
        await wrapper.vm.$nextTick();

        expect(
            wrapper.vm.d_active_mutation_test_suite!.past_limit_submission_fdbk_config.visible
        ).toBe(true);

        wrapper.find({ref: 'past_limit_edit_feedback_settings'}).find(
            '.advanced-settings-label'
        ).trigger('click');

        // return code correctness
        expect(
            wrapper.vm.d_active_mutation_test_suite!.past_limit_submission_fdbk_config
                .bugs_exposed_fdbk_level
        ).toEqual(BugsExposedFeedbackLevel.exposed_bug_names);

        wrapper.find('#past-limit-return-code-correctness').setValue(
            BugsExposedFeedbackLevel.num_bugs_exposed
        );
        expect(
            wrapper.vm.d_active_mutation_test_suite!.past_limit_submission_fdbk_config
                .bugs_exposed_fdbk_level
        ).toEqual(BugsExposedFeedbackLevel.num_bugs_exposed);

        // show invalid test names
        expect(
            wrapper.vm.d_active_mutation_test_suite!.past_limit_submission_fdbk_config
                .show_invalid_test_names
        ).toBe(false);

        wrapper.find('#past-limit-show-invalid-test-names').setChecked(true);
        expect(
            wrapper.vm.d_active_mutation_test_suite!.past_limit_submission_fdbk_config
                .show_invalid_test_names
        ).toBe(true);

        // show points
        expect(
            wrapper.vm.d_active_mutation_test_suite!.past_limit_submission_fdbk_config.show_points
        ).toBe(false);

        wrapper.find('#past-limit-show-points').setChecked(true);
        expect(
            wrapper.vm.d_active_mutation_test_suite!.past_limit_submission_fdbk_config.show_points
        ).toBe(true);

        // show setup return code
        expect(
            wrapper.vm.d_active_mutation_test_suite!.past_limit_submission_fdbk_config
                .show_setup_return_code
        ).toBe(false);

        wrapper.find('#past-limit-show-setup-return-code').setChecked(true);
        expect(
            wrapper.vm.d_active_mutation_test_suite!.past_limit_submission_fdbk_config
                .show_setup_return_code
        ).toBe(true);

        // show setup stdout
        expect(
            wrapper.vm.d_active_mutation_test_suite!.past_limit_submission_fdbk_config
                .show_setup_stdout
        ).toBe(false);

        wrapper.find('#past-limit-show-setup-stdout').setChecked(true);
        expect(
            wrapper.vm.d_active_mutation_test_suite!.past_limit_submission_fdbk_config
                .show_setup_stdout
        ).toBe(true);

        // show setup stderr
        expect(
            wrapper.vm.d_active_mutation_test_suite!.past_limit_submission_fdbk_config
                .show_setup_stderr
        ).toBe(false);

        wrapper.find('#past-limit-show-setup-stderr').setChecked(true);
        expect(
            wrapper.vm.d_active_mutation_test_suite!.past_limit_submission_fdbk_config
                .show_setup_stderr
        ).toBe(true);

        // show get test names return code
        expect(
            wrapper.vm.d_active_mutation_test_suite!.past_limit_submission_fdbk_config
                .show_get_test_names_return_code
        ).toBe(false);

        wrapper.find('#past-limit-show-get-test-names-return-code').setChecked(true);
        expect(
            wrapper.vm.d_active_mutation_test_suite!.past_limit_submission_fdbk_config
                .show_get_test_names_return_code
        ).toBe(true);

        // show get test names stdout
        expect(
            wrapper.vm.d_active_mutation_test_suite!.past_limit_submission_fdbk_config
                .show_get_test_names_stdout
        ).toBe(false);

        wrapper.find('#past-limit-show-get-test-names-stdout').setChecked(true);
        expect(
            wrapper.vm.d_active_mutation_test_suite!.past_limit_submission_fdbk_config
                .show_get_test_names_stdout
        ).toBe(true);

        // show get test names stderr
        expect(
            wrapper.vm.d_active_mutation_test_suite!.past_limit_submission_fdbk_config
                .show_get_test_names_stderr
        ).toBe(false);

        wrapper.find('#past-limit-show-get-test-names-stderr').setChecked(true);
        expect(
            wrapper.vm.d_active_mutation_test_suite!.past_limit_submission_fdbk_config
                .show_get_test_names_stderr
        ).toBe(true);

        // show validity check stdout
        expect(
            wrapper.vm.d_active_mutation_test_suite!.past_limit_submission_fdbk_config
                .show_validity_check_stdout
        ).toBe(false);

        wrapper.find('#past-limit-show-validity-check-stdout').setChecked(true);
        expect(
            wrapper.vm.d_active_mutation_test_suite!.past_limit_submission_fdbk_config
                .show_validity_check_stdout
        ).toBe(true);

        // show validity check stderr
        expect(
            wrapper.vm.d_active_mutation_test_suite!.past_limit_submission_fdbk_config
                .show_validity_check_stderr
        ).toBe(false);

        wrapper.find('#past-limit-show-validity-check-stderr').setChecked(true);
        expect(
            wrapper.vm.d_active_mutation_test_suite!.past_limit_submission_fdbk_config
                .show_validity_check_stderr
        ).toBe(true);

        // show grade buggy impls stdout
        expect(
            wrapper.vm.d_active_mutation_test_suite!.past_limit_submission_fdbk_config
                .show_grade_buggy_impls_stdout
        ).toBe(false);

        wrapper.find('#past-limit-show-grade-buggy-impls-stdout').setChecked(true);
        expect(
            wrapper.vm.d_active_mutation_test_suite!.past_limit_submission_fdbk_config
                .show_grade_buggy_impls_stdout
        ).toBe(true);

        // show grade buggy impls stderr
        expect(
            wrapper.vm.d_active_mutation_test_suite!.past_limit_submission_fdbk_config
                .show_grade_buggy_impls_stderr
        ).toBe(false);

        wrapper.find('#past-limit-show-grade-buggy-impls-stderr').setChecked(true);
        expect(
            wrapper.vm.d_active_mutation_test_suite!.past_limit_submission_fdbk_config
                .show_validity_check_stderr
        ).toBe(true);
    });
});
