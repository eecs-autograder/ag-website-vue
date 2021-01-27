import { Wrapper } from '@vue/test-utils';

import {
    BugsExposedFeedbackLevel,
    HttpError,
    MutationTestSuite,
    Project,
} from 'ag-client-typescript';
// tslint:disable-next-line:no-duplicate-imports
import * as ag_cli from 'ag-client-typescript';
import * as sinon from "sinon";

import APIErrors from '@/components/api_errors.vue';
import BuggyImplementations from '@/components/project_admin/mutation_suites/buggy_implementations.vue';
import MutationCommands from '@/components/project_admin/mutation_suites/mutation_commands.vue';
import MutationSuites from '@/components/project_admin/mutation_suites/mutation_suites.vue';
import SuiteSettings from '@/components/project_admin/suite_settings.vue';
import { deep_copy } from '@/utils';

import * as data_ut from '@/tests/data_utils';
import { managed_mount } from '@/tests/setup';
import {
    find_by_name,
    get_validated_input_text,
    set_validated_input_text,
    validated_input_is_valid,
    wait_for_load,
} from '@/tests/utils';


describe('MutationSuites tests', () => {
    let wrapper: Wrapper<MutationSuites>;
    let project: Project;
    let expected_student_files: ag_cli.ExpectedStudentFile[];
    let instructor_files: ag_cli.InstructorFile[];
    let global_sandbox_docker_images: ag_cli.SandboxDockerImage[];
    let course_sandbox_docker_images: ag_cli.SandboxDockerImage[];

    let mutation_test_suite_1: MutationTestSuite;
    let mutation_test_suite_2: MutationTestSuite;
    let mutation_test_suite_3: MutationTestSuite;

    beforeEach(async () => {
        let course = data_ut.make_course();

        project = data_ut.make_project(course.pk);
        expected_student_files = [
            data_ut.make_expected_student_file(project.pk, "elephant*.cpp"),
            data_ut.make_expected_student_file(project.pk, "monkey?.cpp"),
            data_ut.make_expected_student_file(project.pk, "zebra.cpp"),
        ];
        instructor_files =  [
            data_ut.make_instructor_file(project.pk, "penguin.cpp"),
            data_ut.make_instructor_file(project.pk, "rabit.cpp"),
            data_ut.make_instructor_file(project.pk, "walrus.cpp"),
        ];
        project.expected_student_files = expected_student_files;
        project.instructor_files = instructor_files;

        global_sandbox_docker_images = [
            data_ut.make_sandbox_docker_image(null), data_ut.make_sandbox_docker_image(null)
        ];
        course_sandbox_docker_images = [
            data_ut.make_sandbox_docker_image(course.pk),
            data_ut.make_sandbox_docker_image(course.pk)
        ];
        sinon.stub(ag_cli.SandboxDockerImage, 'get_images').withArgs(
            null
        ).resolves(
            global_sandbox_docker_images
        ).withArgs(course.pk).resolves(course_sandbox_docker_images);

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

        wrapper = managed_mount(MutationSuites, {
            propsData: {
                project: project
            }
        });
        expect(await wait_for_load(wrapper)).toBe(true);
    });

    test('Update mutation test suites order', async () => {
        let order_stub = sinon.stub(ag_cli.MutationTestSuite, 'update_order');
        wrapper.findComponent({ref: 'mutation_test_suite_order'}).vm.$emit('change');
        await wrapper.vm.$nextTick();
        expect(
            order_stub.calledOnceWith(project.pk, [
                mutation_test_suite_1.pk,
                mutation_test_suite_2.pk,
                mutation_test_suite_3.pk,
            ])
        ).toBe(true);
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

        let d_new_mutation_test_suite_name_input
            = wrapper.findComponent({ref: 'new_mutation_test_suite_name'});
        set_validated_input_text(d_new_mutation_test_suite_name_input, "Suite I");
        expect(validated_input_is_valid(d_new_mutation_test_suite_name_input)).toBe(true);
        expect(wrapper.vm.d_new_mutation_test_suite_name).toEqual("Suite I");

        wrapper.vm.d_new_mutation_test_suite_name = "Suite II";
        await wrapper.vm.$nextTick();
        expect(get_validated_input_text(d_new_mutation_test_suite_name_input)).toEqual("Suite II");
    });

    test('add mutation_test_suite - successful', async () => {
        expect(wrapper.vm.d_mutation_test_suites.length).toEqual(3);
        expect(wrapper.vm.d_show_new_mutation_test_suite_modal).toBe(false);
        expect(wrapper.findComponent({ref: 'new_mutation_test_suite_modal'}).exists()).toBe(false);

        let new_mutation_suite = data_ut.make_mutation_test_suite(project.pk);
        let create_stub = sinon.stub(MutationTestSuite, 'create').returns(
            Promise.resolve(
                new_mutation_suite
            )
        );
        create_stub.callsFake(() => {
            MutationTestSuite.notify_mutation_test_suite_created(new_mutation_suite);
            return Promise.resolve(new_mutation_suite);
        });

        wrapper.find('#add-mutation-test-suite-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_show_new_mutation_test_suite_modal).toBe(true);
        expect(wrapper.findComponent({ref: 'new_mutation_test_suite_modal'}).exists()).toBe(true);

        let d_new_mutation_test_suite_name_input
            = wrapper.findComponent({ref: 'new_mutation_test_suite_name'});

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
        expect(wrapper.findComponent({ref: 'new_mutation_test_suite_modal'}).exists()).toBe(false);
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
        expect(wrapper.findComponent({ref: 'new_mutation_test_suite_modal'}).exists()).toBe(false);

        wrapper.find('#add-mutation-test-suite-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_show_new_mutation_test_suite_modal).toBe(true);
        expect(wrapper.findComponent({ref: 'new_mutation_test_suite_modal'}).exists()).toBe(true);

        let d_new_mutation_test_suite_name_input
            = wrapper.findComponent({ref: 'new_mutation_test_suite_name'});

        set_validated_input_text(d_new_mutation_test_suite_name_input, "Suite 2");
        expect(validated_input_is_valid(d_new_mutation_test_suite_name_input)).toBe(true);
        expect(wrapper.vm.d_new_mutation_test_suite_name).toEqual("Suite 2");

        wrapper.find('#create-mutation-test-suite-form').trigger('submit');
        await wrapper.vm.$nextTick();

        expect(create_stub.calledOnce).toBe(true);
        expect(create_stub.firstCall.calledWith(project.pk, {name: "Suite 2"})).toBe(true);
        expect(wrapper.vm.d_mutation_test_suites.length).toEqual(3);
        expect(wrapper.vm.d_show_new_mutation_test_suite_modal).toBe(true);
        expect(wrapper.findComponent({ref: 'new_mutation_test_suite_modal'}).exists()).toBe(true);

        let api_errors = <APIErrors> wrapper.findComponent({ref: 'create_errors'}).vm;
        expect(api_errors.d_api_errors.length).toBe(1);
    });

    test('save mutation_test_suite - successful', async () => {
        wrapper.findAll('.mutation-test-suite-panel').at(1).trigger('click');
        await wrapper.vm.$nextTick();

        let save_stub = sinon.stub(wrapper.vm.d_active_mutation_test_suite!, 'save');
        expect(wrapper.vm.d_active_mutation_test_suite).toEqual(mutation_test_suite_2);
        expect(wrapper.vm.d_mutation_test_suites.length).toEqual(3);
        expect(wrapper.find('.save-button').element).not.toBeDisabled();

        wrapper.find('#mutation-test-suite-form').trigger('submit');
        await wrapper.vm.$nextTick();

        expect(save_stub.callCount).toEqual(1);
        expect(wrapper.vm.d_mutation_test_suites.length).toEqual(3);
    });

    test('save mutation_test_suite - unsuccessful', async () => {
        Element.prototype.scrollIntoView = () => {};
        await wrapper.findAll('.mutation-test-suite-panel').at(1).trigger('click');

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
        expect(wrapper.find('.save-button').element).not.toBeDisabled();

        wrapper.find('#mutation-test-suite-form').trigger('submit');
        await wrapper.vm.$nextTick();

        let api_errors = <APIErrors> wrapper.findComponent({ref: 'save_errors'}).vm;
        expect(api_errors.d_api_errors.length).toBe(1);
        expect(save_stub.callCount).toEqual(1);
    });

    test('delete_mutation_test_suite - confirm deletion', async () => {
        let delete_stub = sinon.stub(mutation_test_suite_2, 'delete');
        delete_stub.callsFake(
            () => {
                MutationTestSuite.notify_mutation_test_suite_deleted(mutation_test_suite_2);
                return Promise.resolve();
            }
        );

        wrapper.findAll('.mutation-test-suite-panel').at(1).trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_active_mutation_test_suite).toEqual(mutation_test_suite_2);
        expect(wrapper.vm.d_mutation_test_suites.length).toEqual(3);
        expect(wrapper.vm.d_show_delete_mutation_test_suite_modal).toBe(false);
        expect(
            wrapper.findComponent({ref: 'delete_mutation_test_suite_modal'}).exists()
        ).toBe(false);

        await wrapper.find('.delete-mutation-test-suite-button').trigger('click');

        expect(wrapper.vm.d_show_delete_mutation_test_suite_modal).toBe(true);
        expect(
            wrapper.findComponent({ref: 'delete_mutation_test_suite_modal'}).exists()
        ).toBe(true);

        wrapper.find('.modal-delete-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(delete_stub.calledOnce).toBe(true);
        expect(wrapper.vm.d_mutation_test_suites.length).toEqual(2);
        expect(wrapper.vm.d_mutation_test_suites[0]).toEqual(mutation_test_suite_1);
        expect(wrapper.vm.d_mutation_test_suites[1]).toEqual(mutation_test_suite_3);
        expect(wrapper.vm.d_active_mutation_test_suite).toBeNull();
        expect(wrapper.vm.d_show_delete_mutation_test_suite_modal).toBe(false);
        expect(
            wrapper.findComponent({ref: 'delete_mutation_test_suite_modal'}).exists()
        ).toBe(false);
    });

    test('delete_mutation_test_suite - cancel deletion', async () => {
        let delete_stub = sinon.stub(mutation_test_suite_2, 'delete');

        wrapper.findAll('.mutation-test-suite-panel').at(1).trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_active_mutation_test_suite).toEqual(mutation_test_suite_2);
        expect(wrapper.vm.d_mutation_test_suites.length).toEqual(3);
        expect(wrapper.vm.d_show_delete_mutation_test_suite_modal).toBe(false);
        expect(
            wrapper.findComponent({ref: 'delete_mutation_test_suite_modal'}).exists()
        ).toBe(false);

        wrapper.find('.delete-mutation-test-suite-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_show_delete_mutation_test_suite_modal).toBe(true);
        expect(
            wrapper.findComponent({ref: 'delete_mutation_test_suite_modal'}).exists()
        ).toBe(true);

        wrapper.find('.modal-cancel-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(delete_stub.callCount).toEqual(0);
        expect(wrapper.vm.d_mutation_test_suites.length).toEqual(3);
        expect(wrapper.vm.d_show_delete_mutation_test_suite_modal).toBe(false);
        expect(
            wrapper.findComponent({ref: 'delete_mutation_test_suite_modal'}).exists()
        ).toBe(false);
    });

    test('API errors handled on delete', async () => {
        sinon.stub(mutation_test_suite_2, 'delete').rejects(new HttpError(403, 'errar'));

        wrapper.findAll('.mutation-test-suite-panel').at(1).trigger('click');
        await wrapper.vm.$nextTick();

        wrapper.find('.delete-mutation-test-suite-button').trigger('click');
        await wrapper.vm.$nextTick();

        wrapper.find('.modal-delete-button').trigger('click');
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        let errors = <APIErrors> wrapper.findComponent({ref: 'delete_errors'}).vm;
        expect(errors.d_api_errors.length).toEqual(1);
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

    test('SandboxDockerImages loaded', async () => {
        expect(wrapper.vm.d_docker_images).toEqual(
            global_sandbox_docker_images.concat(course_sandbox_docker_images)
        );
    });

    test('SuiteSettings bindings', async () => {
        wrapper.vm.d_active_mutation_test_suite = mutation_test_suite_1;
        await wrapper.vm.$nextTick();

        let suite_settings = find_by_name<SuiteSettings>(wrapper, 'SuiteSettings');
        expect(suite_settings.vm.suite).toEqual(mutation_test_suite_1);
        expect(suite_settings.vm.project).toEqual(project);
        expect(suite_settings.vm.docker_images).toEqual(
            global_sandbox_docker_images.concat(course_sandbox_docker_images)
        );

        let new_name = 'this is very new name';
        suite_settings.vm.$emit('field_change', {name: new_name});
        expect(wrapper.vm.d_active_mutation_test_suite!.name).toEqual(new_name);
    });

    test('Buggy Implementations - d_active_mutation_test_suite binding', async () => {
        wrapper.vm.d_active_mutation_test_suite = mutation_test_suite_2;
        await wrapper.vm.$nextTick();

        let buggy_impl_form = find_by_name<BuggyImplementations>(wrapper, 'BuggyImplementations');
        expect(buggy_impl_form.vm.value).toEqual(mutation_test_suite_2);

        let to_emit = new MutationTestSuite(mutation_test_suite_2);
        let new_name = 'yet a new name';
        to_emit.name = new_name;

        buggy_impl_form.vm.$emit('input', to_emit);
        expect(wrapper.vm.d_active_mutation_test_suite).toEqual(to_emit);
    });

    test('Commands - d_active_mutation_test_suite binding',  async () => {
        wrapper.findAll('.mutation-test-suite-panel').at(1).trigger('click');
        await wrapper.vm.$nextTick();

        let mutation_commands = find_by_name<MutationCommands>(wrapper, 'MutationCommands');
        expect(mutation_commands.vm.value).toBe(wrapper.vm.d_active_mutation_test_suite);

        let to_emit = deep_copy(wrapper.vm.d_active_mutation_test_suite!, MutationTestSuite);
        to_emit.setup_command.time_limit = 44;
        to_emit.setup_command.process_spawn_limit = 14;

        mutation_commands.vm.$emit('input', to_emit);
        expect(wrapper.vm.d_active_mutation_test_suite).toEqual(to_emit);
    });

    test('Edit Feedback Settings - d_active_mutation_test_suite binding', async () => {
        wrapper.findAll('.mutation-test-suite-panel').at(1).trigger('click');
        await wrapper.vm.$nextTick();

        // visible
        expect(
            wrapper.vm.d_active_mutation_test_suite!.past_limit_submission_fdbk_config.visible
        ).toBe(false);

        wrapper.findAll('[data-testid=mutation_suite_is_visible]').at(2).setChecked(true);
        await wrapper.vm.$nextTick();

        expect(
            wrapper.vm.d_active_mutation_test_suite!.past_limit_submission_fdbk_config.visible
        ).toBe(true);

        await wrapper.findComponent({ref: 'past_limit_edit_feedback_settings'}).find(
            '.advanced-settings-label'
        ).trigger('click');

        // return code correctness
        expect(
            wrapper.vm.d_active_mutation_test_suite!.past_limit_submission_fdbk_config
                .bugs_exposed_fdbk_level
        ).toEqual(BugsExposedFeedbackLevel.exposed_bug_names);

        wrapper.find('[data-testid=bugs_exposed_fdbk_level]').setValue(
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

        wrapper.find('[data-testid=show_invalid_test_names]').setChecked(true);
        expect(
            wrapper.vm.d_active_mutation_test_suite!.past_limit_submission_fdbk_config
                .show_invalid_test_names
        ).toBe(true);

        // show points
        expect(
            wrapper.vm.d_active_mutation_test_suite!.past_limit_submission_fdbk_config.show_points
        ).toBe(false);

        wrapper.find('[data-testid=show_points]').setChecked(true);
        expect(
            wrapper.vm.d_active_mutation_test_suite!.past_limit_submission_fdbk_config.show_points
        ).toBe(true);

        // show setup return code
        expect(
            wrapper.vm.d_active_mutation_test_suite!.past_limit_submission_fdbk_config
                .show_setup_return_code
        ).toBe(false);

        wrapper.find('[data-testid=show_setup_return_code]').setChecked(true);
        expect(
            wrapper.vm.d_active_mutation_test_suite!.past_limit_submission_fdbk_config
                .show_setup_return_code
        ).toBe(true);

        // show setup stdout
        expect(
            wrapper.vm.d_active_mutation_test_suite!.past_limit_submission_fdbk_config
                .show_setup_stdout
        ).toBe(false);

        wrapper.find('[data-testid=show_setup_stdout]').setChecked(true);
        expect(
            wrapper.vm.d_active_mutation_test_suite!.past_limit_submission_fdbk_config
                .show_setup_stdout
        ).toBe(true);

        // show setup stderr
        expect(
            wrapper.vm.d_active_mutation_test_suite!.past_limit_submission_fdbk_config
                .show_setup_stderr
        ).toBe(false);

        wrapper.find('[data-testid=show_setup_stderr]').setChecked(true);
        expect(
            wrapper.vm.d_active_mutation_test_suite!.past_limit_submission_fdbk_config
                .show_setup_stderr
        ).toBe(true);

        // show get test names return code
        expect(
            wrapper.vm.d_active_mutation_test_suite!.past_limit_submission_fdbk_config
                .show_get_test_names_return_code
        ).toBe(false);

        wrapper.find('[data-testid=show_test_name_discovery_return_code]').setChecked(true);
        expect(
            wrapper.vm.d_active_mutation_test_suite!.past_limit_submission_fdbk_config
                .show_get_test_names_return_code
        ).toBe(true);

        // show get test names stdout
        expect(
            wrapper.vm.d_active_mutation_test_suite!.past_limit_submission_fdbk_config
                .show_get_test_names_stdout
        ).toBe(false);

        wrapper.find('[data-testid=show_test_name_discovery_stdout]').setChecked(true);
        expect(
            wrapper.vm.d_active_mutation_test_suite!.past_limit_submission_fdbk_config
                .show_get_test_names_stdout
        ).toBe(true);

        // show get test names stderr
        expect(
            wrapper.vm.d_active_mutation_test_suite!.past_limit_submission_fdbk_config
                .show_get_test_names_stderr
        ).toBe(false);

        wrapper.find('[data-testid=show_test_name_discovery_stderr]').setChecked(true);
        expect(
            wrapper.vm.d_active_mutation_test_suite!.past_limit_submission_fdbk_config
                .show_get_test_names_stderr
        ).toBe(true);

        // show validity check stdout
        expect(
            wrapper.vm.d_active_mutation_test_suite!.past_limit_submission_fdbk_config
                .show_validity_check_stdout
        ).toBe(false);

        wrapper.find('[data-testid=show_validity_check_stdout]').setChecked(true);
        expect(
            wrapper.vm.d_active_mutation_test_suite!.past_limit_submission_fdbk_config
                .show_validity_check_stdout
        ).toBe(true);

        // show validity check stderr
        expect(
            wrapper.vm.d_active_mutation_test_suite!.past_limit_submission_fdbk_config
                .show_validity_check_stderr
        ).toBe(false);

        wrapper.find('[data-testid=show_validity_check_stderr]').setChecked(true);
        expect(
            wrapper.vm.d_active_mutation_test_suite!.past_limit_submission_fdbk_config
                .show_validity_check_stderr
        ).toBe(true);

        // show grade buggy impls stdout
        expect(
            wrapper.vm.d_active_mutation_test_suite!.past_limit_submission_fdbk_config
                .show_grade_buggy_impls_stdout
        ).toBe(false);

        wrapper.find('[data-testid=show_grade_buggy_impls_stdout]').setChecked(true);
        expect(
            wrapper.vm.d_active_mutation_test_suite!.past_limit_submission_fdbk_config
                .show_grade_buggy_impls_stdout
        ).toBe(true);

        // show grade buggy impls stderr
        expect(
            wrapper.vm.d_active_mutation_test_suite!.past_limit_submission_fdbk_config
                .show_grade_buggy_impls_stderr
        ).toBe(false);

        wrapper.find('[data-testid=show_grade_buggy_impls_stderr]').setChecked(true);
        expect(
            wrapper.vm.d_active_mutation_test_suite!.past_limit_submission_fdbk_config
                .show_validity_check_stderr
        ).toBe(true);
    });
});

test('Suite updates from other project ignored', async () => {
    sinon.stub(ag_cli.SandboxDockerImage, 'get_images').returns(Promise.resolve([]));
    sinon.stub(MutationTestSuite, 'get_all_from_project').resolves([]);
    let course = data_ut.make_course();
    let project = data_ut.make_project(course.pk);
    let other_project = data_ut.make_project(course.pk);
    let new_suite = data_ut.make_mutation_test_suite(other_project.pk);
    let wrapper = managed_mount(MutationSuites, {
        propsData: {
            project: project
        }
    });
    expect(await wait_for_load(wrapper)).toBe(true);

    expect(wrapper.vm.d_mutation_test_suites).toEqual([]);

    ag_cli.MutationTestSuite.notify_mutation_test_suite_created(new_suite);
    ag_cli.MutationTestSuite.notify_mutation_test_suite_changed(new_suite);
    ag_cli.MutationTestSuite.notify_mutation_test_suite_order_updated(other_project.pk, [4, 5, 2]);
    ag_cli.MutationTestSuite.notify_mutation_test_suite_deleted(new_suite);

    expect(wrapper.vm.d_mutation_test_suites).toEqual([]);
});

describe('InstructorFile and ExpectedStudentFile observer tests', () => {
    let wrapper: Wrapper<MutationSuites>;
    let project: Project;
    let mutation_test_suites: ag_cli.MutationTestSuite[];
    let expected_student_files: ag_cli.ExpectedStudentFile[];
    let instructor_files: ag_cli.InstructorFile[];

    beforeEach(async () => {
        project = data_ut.make_project(data_ut.make_course().pk);
        expected_student_files = [
            data_ut.make_expected_student_file(project.pk, "file1.cpp"),
            data_ut.make_expected_student_file(project.pk, "file2.cpp"),
        ];
        instructor_files =  [
            data_ut.make_instructor_file(project.pk, "file3.cpp"),
            data_ut.make_instructor_file(project.pk, "file4.cpp"),
        ];
        project.expected_student_files = expected_student_files;
        project.instructor_files = instructor_files;

        mutation_test_suites = [
            data_ut.make_mutation_test_suite(project.pk, {
                instructor_files_needed: instructor_files,
                student_files_needed: expected_student_files,
            }),
            data_ut.make_mutation_test_suite(project.pk, {
                instructor_files_needed: [instructor_files[0]],
                student_files_needed: [expected_student_files[0]],
            }),
        ];

        sinon.stub(MutationTestSuite, 'get_all_from_project').resolves(mutation_test_suites);
        sinon.stub(ag_cli.SandboxDockerImage, 'get_images').resolves([]);

        wrapper = managed_mount(MutationSuites, {
            propsData: {
                project: project
            }
        });
        expect(await wait_for_load(wrapper)).toBe(true);
    });

    test('Deleted InstructorFile removed from instructor_files_needed', async () => {
        ag_cli.InstructorFile.notify_instructor_file_deleted(instructor_files[0]);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_mutation_test_suites[0].instructor_files_needed.length).toEqual(1);
        expect(
            wrapper.vm.d_mutation_test_suites[0].instructor_files_needed[0]
        ).toEqual(instructor_files[1]);

        expect(wrapper.vm.d_mutation_test_suites[1].instructor_files_needed.length).toEqual(0);

        ag_cli.InstructorFile.notify_instructor_file_deleted(instructor_files[1]);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_mutation_test_suites[0].instructor_files_needed.length).toEqual(0);
        expect(wrapper.vm.d_mutation_test_suites[1].instructor_files_needed.length).toEqual(0);

        // Make sure we didn't delete the wrong kind of file
        expect(wrapper.vm.d_mutation_test_suites[0].student_files_needed.length).toEqual(2);
        expect(wrapper.vm.d_mutation_test_suites[1].student_files_needed.length).toEqual(1);
    });

    test('Deleted ExpectedStudentFile removed from student_files_needed', async () => {
        ag_cli.ExpectedStudentFile.notify_expected_student_file_deleted(
            expected_student_files[0]);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_mutation_test_suites[0].student_files_needed.length).toEqual(1);
        expect(
            wrapper.vm.d_mutation_test_suites[0].student_files_needed[0]
        ).toEqual(expected_student_files[1]);

        expect(wrapper.vm.d_mutation_test_suites[1].student_files_needed.length).toEqual(0);

        ag_cli.ExpectedStudentFile.notify_expected_student_file_deleted(expected_student_files[1]);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_mutation_test_suites[0].student_files_needed.length).toEqual(0);
        expect(wrapper.vm.d_mutation_test_suites[1].student_files_needed.length).toEqual(0);

        // Make sure we didn't delete the wrong kind of file
        expect(wrapper.vm.d_mutation_test_suites[0].instructor_files_needed.length).toEqual(2);
        expect(wrapper.vm.d_mutation_test_suites[1].instructor_files_needed.length).toEqual(1);
    });
});
