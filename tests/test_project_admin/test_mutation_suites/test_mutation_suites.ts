import { config, mount, Wrapper } from '@vue/test-utils';

import {
    ExpectedStudentFile,
    HttpError, InstructorFile,
    MutationTestSuite,
    Project, SandboxDockerImageData, UltimateSubmissionPolicy
} from 'ag-client-typescript';
// tslint:disable-next-line:no-duplicate-imports
import * as ag_cli from 'ag-client-typescript';
import * as sinon from "sinon";

import APIErrors from '@/components/api_errors.vue';
import BuggyImplementations from '@/components/project_admin/mutation_suites/buggy_implementations.vue';
import MutationCommands from '@/components/project_admin/mutation_suites/mutation_commands.vue';
import MutationSuiteGeneralSettings from '@/components/project_admin/mutation_suites/mutation_suite_general_settings.vue';
import MutationSuites from '@/components/project_admin/mutation_suites/mutation_suites.vue';

import { create_mutation_suite } from '@/tests/test_project_admin/test_mutation_suites/test_buggy_implementations';
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
    let component: MutationSuites;
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

        project = new Project({
            pk: 1,
            name: "Detroit Zoo",
            last_modified: "today",
            course: 2,
            visible_to_students: true,
            closing_time: null,
            soft_closing_time: null,
            disallow_student_submissions: true,
            disallow_group_registration: true,
            guests_can_submit: true,
            min_group_size: 1,
            max_group_size: 1,
            submission_limit_per_day: null,
            allow_submissions_past_limit: true,
            groups_combine_daily_submissions: false,
            submission_limit_reset_time: "",
            submission_limit_reset_timezone: "",
            num_bonus_submissions: 1,
            total_submission_limit: null,
            allow_late_days: true,
            ultimate_submission_policy: UltimateSubmissionPolicy.best,
            hide_ultimate_submission_fdbk: false,
            expected_student_files: [],
            instructor_files: [],
            has_handgrading_rubric: false
        });

        mutation_test_suite_1 = create_mutation_suite(1, "Suite 1", project.pk);
        mutation_test_suite_2 = create_mutation_suite(2, "Suite 2", project.pk);
        mutation_test_suite_3 = create_mutation_suite(3, "Suite 3", project.pk);

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
        component = wrapper.vm;
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
        expect(component.d_mutation_test_suites.length).toEqual(3);

        wrapper.findAll('.mutation-test-suite-panel').at(1).trigger('click');
        await component.$nextTick();

        expect(component.d_active_mutation_test_suite).toEqual(mutation_test_suite_2);

        wrapper.findAll('.mutation-test-suite-panel').at(0).trigger('click');
        await component.$nextTick();

        expect(component.d_active_mutation_test_suite).toEqual(mutation_test_suite_1);

        wrapper.findAll('.mutation-test-suite-panel').at(0).trigger('click');
        await component.$nextTick();

        expect(component.d_active_mutation_test_suite).toEqual(mutation_test_suite_1);
    });

    test('d_new_mutation_test_suite_name binding', async () => {
        expect(component.d_new_mutation_test_suite_name).toEqual("");
        wrapper.find('#add-mutation-test-suite-button').trigger('click');
        await component.$nextTick();

        let d_new_mutation_test_suite_name_input = wrapper.find(
            {ref: 'new_mutation_test_suite_name'}
        );

        set_validated_input_text(d_new_mutation_test_suite_name_input, "Suite I");
        expect(validated_input_is_valid(d_new_mutation_test_suite_name_input)).toBe(true);
        expect(component.d_new_mutation_test_suite_name).toEqual("Suite I");

        component.d_new_mutation_test_suite_name = "Suite II";
        expect(get_validated_input_text(d_new_mutation_test_suite_name_input)).toEqual("Suite II");
    });

    test('add mutation_test_suite - successful', async () => {
        expect(component.d_mutation_test_suites.length).toEqual(3);

        let new_mutation_suite = create_mutation_suite(4, "Suite 4", project.pk);

        let create_stub = sinon.stub(MutationTestSuite, 'create').returns(
            Promise.resolve(
                new_mutation_suite
            )
        );
        create_stub.callsFake(() => MutationTestSuite.notify_mutation_test_suite_created(
            new_mutation_suite
        ));
        wrapper.find('#add-mutation-test-suite-button').trigger('click');
        await component.$nextTick();

        let d_new_mutation_test_suite_name_input = wrapper.find(
            {ref: 'new_mutation_test_suite_name'}
        );

        set_validated_input_text(d_new_mutation_test_suite_name_input, "Suite 4");
        expect(validated_input_is_valid(d_new_mutation_test_suite_name_input)).toBe(true);
        expect(component.d_new_mutation_test_suite_name).toEqual("Suite 4");

        wrapper.find('#create-mutation-test-suite-form').trigger('submit');
        await component.$nextTick();

        expect(create_stub.calledOnce).toBe(true);
        expect(component.d_new_mutation_test_suite_name).toEqual("");
        expect(create_stub.firstCall.calledWith(project.pk, {name: "Suite 4"})).toBe(true);
        expect(component.d_mutation_test_suites.length).toEqual(4);
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
        wrapper.find('#add-mutation-test-suite-button').trigger('click');
        await component.$nextTick();

        let d_new_mutation_test_suite_name_input = wrapper.find(
            {ref: 'new_mutation_test_suite_name'}
        );

        set_validated_input_text(d_new_mutation_test_suite_name_input, "Suite 2");
        expect(validated_input_is_valid(d_new_mutation_test_suite_name_input)).toBe(true);
        expect(component.d_new_mutation_test_suite_name).toEqual("Suite 2");

        wrapper.find('#create-mutation-test-suite-form').trigger('submit');
        await component.$nextTick();

        expect(create_stub.calledOnce).toBe(true);
        expect(create_stub.firstCall.calledWith(project.pk, {name: "Suite 2"})).toBe(true);
        expect(component.d_mutation_test_suites.length).toEqual(3);

        let api_errors = <APIErrors> wrapper.find({ref: 'api_errors'}).vm;
        expect(api_errors.d_api_errors.length).toBe(1);
    });

    test('delete_mutation_test_suite - cancel deletion', async () => {
        let delete_stub = sinon.stub(mutation_test_suite_2, 'delete');

        wrapper.findAll('.mutation-test-suite-panel').at(1).trigger('click');
        await component.$nextTick();

        expect(component.d_active_mutation_test_suite).toEqual(mutation_test_suite_2);
        expect(component.d_mutation_test_suites.length).toEqual(3);

        wrapper.setData({d_current_tab_index: 4});
        await component.$nextTick();

        wrapper.find('.delete-mutation-test-suite-button').trigger('click');
        await component.$nextTick();

        wrapper.find('.modal-cancel-button').trigger('click');
        await component.$nextTick();

        expect(delete_stub.callCount).toEqual(0);
        expect(component.d_mutation_test_suites.length).toEqual(3);
    });

    test('Edit General MutationTestSuite settings', async () => {
        wrapper.findAll('.mutation-test-suite-panel').at(2).trigger('click');
        await component.$nextTick();

        expect(component.d_active_mutation_test_suite).toEqual(mutation_test_suite_3);

        let updated_mutation_test_suite_3 = create_mutation_suite(3, "Suite 3", project.pk);
        updated_mutation_test_suite_3.name = "Updated suite 3";
        updated_mutation_test_suite_3.deferred = true;
        updated_mutation_test_suite_3.sandbox_docker_image = sandbox_docker_image_2;
        updated_mutation_test_suite_3.allow_network_access = true;
        updated_mutation_test_suite_3.instructor_files_needed = [
            instructor_file_1,
            instructor_file_2
        ];
        updated_mutation_test_suite_3.student_files_needed = [
            student_file_2,
            student_file_3
        ];

        wrapper.setData({d_current_tab_index: 0});
        await component.$nextTick();

        let mutation_suite_general_settings = wrapper.find(
            {ref: 'mutation_suite_general_settings'}
        );
        let mutation_suite_general_settings_component = <MutationSuiteGeneralSettings>
            (mutation_suite_general_settings).vm;

        let save_general_settings_stub = sinon.stub(
            mutation_suite_general_settings_component.d_mutation_test_suite!, 'save'
        );
        save_general_settings_stub.callsFake(
            () => MutationTestSuite.notify_mutation_test_suite_changed(
                updated_mutation_test_suite_3
            )
        );
        mutation_suite_general_settings.find(
            '#mutation-test-suite-settings-form'
        ).trigger('submit');
        await component.$nextTick();

        expect(save_general_settings_stub.calledOnce).toBe(true);
        expect(mutation_test_suite_3).not.toEqual(updated_mutation_test_suite_3);
        expect(component.d_mutation_test_suites[2]).toEqual(updated_mutation_test_suite_3);
    });

    test('Edit Buggy Implementations settings', async () => {
        wrapper.findAll('.mutation-test-suite-panel').at(2).trigger('click');
        await component.$nextTick();

        expect(component.d_active_mutation_test_suite).toEqual(mutation_test_suite_3);
        expect(component.d_mutation_test_suites[2]).toEqual(mutation_test_suite_3);

        let updated_mutation_test_suite_3 = create_mutation_suite(3, "Suite 3", project.pk);
        updated_mutation_test_suite_3.points_per_exposed_bug = "2.5";
        updated_mutation_test_suite_3.max_points = null;
        updated_mutation_test_suite_3.max_num_student_tests = 9;
        updated_mutation_test_suite_3.buggy_impl_names = [
            "Bug_2",
            "Bug_12",
            "Bug_1",
            "Bug_4",
            "Bug_3",
            "Bug_7"
        ];

        wrapper.setData({d_current_tab_index: 1});
        await component.$nextTick();

        let buggy_impls = wrapper.find({ref: 'buggy_implementations'});
        let buggy_impls_component = <BuggyImplementations> (buggy_impls).vm;
        let save_buggy_impls_stub = sinon.stub(
            buggy_impls_component.d_mutation_test_suite!, 'save'
        );
        save_buggy_impls_stub.callsFake(() =>
            MutationTestSuite.notify_mutation_test_suite_changed(updated_mutation_test_suite_3)
        );
        buggy_impls.find('#buggy-implementation-settings-form').trigger('submit');
        await component.$nextTick();

        expect(save_buggy_impls_stub.calledOnce).toBe(true);
        expect(mutation_test_suite_3).not.toEqual(updated_mutation_test_suite_3);
        expect(component.d_mutation_test_suites[2]).toEqual(updated_mutation_test_suite_3);
    });

    test('Edit Command settings - use setup command ', async () => {
        wrapper.findAll('.mutation-test-suite-panel').at(0).trigger('click');
        await component.$nextTick();

        expect(component.d_active_mutation_test_suite).toEqual(mutation_test_suite_1);
        expect(component.d_mutation_test_suites[0]).toEqual(mutation_test_suite_1);

        let updated_mutation_test_suite_1 = create_mutation_suite(1, "Suite 1", project.pk);
        updated_mutation_test_suite_1.use_setup_command = true;
        updated_mutation_test_suite_1.setup_command.name = "Updated Setup Command";
        updated_mutation_test_suite_1.get_student_test_names_command.time_limit = 11;
        updated_mutation_test_suite_1.student_test_validity_check_command.stack_size_limit
            = 200000;
        updated_mutation_test_suite_1.grade_buggy_impl_command.virtual_memory_limit = 6000000;

        wrapper.setData({d_current_tab_index: 2});
        await component.$nextTick();

        let mutation_commands = wrapper.find({ref: 'mutation_commands'});
        let mutation_commands_component = <MutationCommands> (mutation_commands).vm;
        let save_mutation_commands_stub = sinon.stub(
            mutation_commands_component.d_mutation_test_suite!, 'save'
        );
        save_mutation_commands_stub.callsFake(() =>
            MutationTestSuite.notify_mutation_test_suite_changed(updated_mutation_test_suite_1)
        );
        mutation_commands.find('#save-commands').trigger('click');
        await component.$nextTick();

        expect(save_mutation_commands_stub.calledOnce).toBe(true);
        expect(mutation_test_suite_1).not.toEqual(updated_mutation_test_suite_1);
        expect(component.d_mutation_test_suites[0]).toEqual(updated_mutation_test_suite_1);
    });

    test.skip('Edit Feedback settings', async () => {
        fail();
        wrapper.setData({d_current_tab_index: 4});
        await component.$nextTick();
    });

    test('delete_mutation_test_suite - confirm deletion', async () => {
        let delete_stub = sinon.stub(mutation_test_suite_2, 'delete');
        delete_stub.callsFake(
            () => MutationTestSuite.notify_mutation_test_suite_deleted(mutation_test_suite_2)
        );

        wrapper.findAll('.mutation-test-suite-panel').at(1).trigger('click');
        await component.$nextTick();

        expect(component.d_active_mutation_test_suite).toEqual(mutation_test_suite_2);
        expect(component.d_mutation_test_suites.length).toEqual(3);

        wrapper.setData({d_current_tab_index: 4});
        await component.$nextTick();

        wrapper.find('.delete-mutation-test-suite-button').trigger('click');
        await component.$nextTick();

        wrapper.find('.modal-delete-button').trigger('click');
        await component.$nextTick();

        expect(delete_stub.calledOnce).toBe(true);
        expect(component.d_mutation_test_suites.length).toEqual(2);
        expect(component.d_mutation_test_suites[0]).toEqual(mutation_test_suite_1);
        expect(component.d_mutation_test_suites[1]).toEqual(mutation_test_suite_3);
        expect(component.d_active_mutation_test_suite).toBeNull();
    });

    test('delete_mutation_test_suite - confirm deletion', async () => {
        let delete_stub = sinon.stub(mutation_test_suite_2, 'delete');
        delete_stub.callsFake(
            () => MutationTestSuite.notify_mutation_test_suite_deleted(mutation_test_suite_2)
        );

        wrapper.findAll('.mutation-test-suite-panel').at(1).trigger('click');
        await component.$nextTick();

        expect(component.d_active_mutation_test_suite).toEqual(mutation_test_suite_2);
        expect(component.d_mutation_test_suites.length).toEqual(3);

        wrapper.setData({d_current_tab_index: 4});
        await component.$nextTick();

        wrapper.find('.delete-mutation-test-suite-button').trigger('click');
        await component.$nextTick();

        wrapper.find('.modal-delete-button').trigger('click');
        await component.$nextTick();

        expect(delete_stub.calledOnce).toBe(true);
        expect(component.d_mutation_test_suites.length).toEqual(2);
        expect(component.d_mutation_test_suites[0]).toEqual(mutation_test_suite_1);
        expect(component.d_mutation_test_suites[1]).toEqual(mutation_test_suite_3);
        expect(component.d_active_mutation_test_suite).toBeNull();
        expect(component.d_current_tab_index).toEqual(0);
    });

    test('update_mutation_test_suite_changed and was the active mutation suite',
         async () => {
        let updated_mutation_test_suite_1 = create_mutation_suite(1, "Suite 1", project.pk);
        updated_mutation_test_suite_1.use_setup_command = true;
        updated_mutation_test_suite_1.setup_command.name = "Updated Setup Command";
        updated_mutation_test_suite_1.get_student_test_names_command.time_limit = 11;
        updated_mutation_test_suite_1.student_test_validity_check_command.stack_size_limit
            = 200000;
        updated_mutation_test_suite_1.grade_buggy_impl_command.virtual_memory_limit = 6000000;

        wrapper.findAll('.mutation-test-suite-panel').at(0).trigger('click');
        await component.$nextTick();

        expect(component.d_active_mutation_test_suite).toEqual(mutation_test_suite_1);
        expect(component.d_mutation_test_suites[0]).toEqual(mutation_test_suite_1);

        MutationTestSuite.notify_mutation_test_suite_changed(updated_mutation_test_suite_1);

        expect(component.d_active_mutation_test_suite).toEqual(updated_mutation_test_suite_1);
        expect(component.d_mutation_test_suites[0]).toEqual(updated_mutation_test_suite_1);
    });

    test('update_mutation_test_suite_changed and was not the active mutation suite',
         async () => {
        let updated_mutation_test_suite_3 = create_mutation_suite(3, "Suite 3", project.pk);
        updated_mutation_test_suite_3.use_setup_command = true;
        updated_mutation_test_suite_3.setup_command.name = "Updated Setup Command";
        updated_mutation_test_suite_3.get_student_test_names_command.time_limit = 11;
        updated_mutation_test_suite_3.student_test_validity_check_command.stack_size_limit
            = 200000;
        updated_mutation_test_suite_3.grade_buggy_impl_command.virtual_memory_limit = 6000000;

        wrapper.findAll('.mutation-test-suite-panel').at(0).trigger('click');
        await component.$nextTick();

        expect(component.d_active_mutation_test_suite).toEqual(mutation_test_suite_1);
        expect(component.d_mutation_test_suites[0]).toEqual(mutation_test_suite_1);

        MutationTestSuite.notify_mutation_test_suite_changed(updated_mutation_test_suite_3);

        expect(component.d_active_mutation_test_suite).toEqual(mutation_test_suite_1);
        expect(component.d_mutation_test_suites[0]).toEqual(mutation_test_suite_1);
    });

    test('update_mutation_test_suites_order_changed', () => {
        expect(() => MutationTestSuite.notify_mutation_test_suite_order_updated(
            project.pk, [1, 2])
        ).toThrow(Error("Method not implemented."));
    });
});
