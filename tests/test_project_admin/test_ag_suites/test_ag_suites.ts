import { mount, Wrapper } from '@vue/test-utils';

import * as ag_cli from 'ag-client-typescript';
import * as sinon from "sinon";

import APIErrors from '@/components/api_errors.vue';
import AGSuites from '@/components/project_admin/ag_suites/ag_suites.vue';
import { deep_copy } from '@/utils';

import * as data_ut from '@/tests/data_utils';
import { managed_mount } from '@/tests/setup';
import {
    get_validated_input_text,
    set_validated_input_text,
    validated_input_is_valid
} from '@/tests/utils';

function make_wrapper(project: ag_cli.Project) {
    let wrapper = managed_mount(AGSuites, {
        propsData: {
            project: project
        }
    });
    return wrapper;
}

let project: ag_cli.Project;
let get_sandbox_docker_images: sinon.SinonStub;
let get_all_suites_from_project: sinon.SinonStub;

beforeEach(() => {
    project = data_ut.make_project(data_ut.make_course().pk);

    get_sandbox_docker_images = sinon.stub(ag_cli, 'get_sandbox_docker_images').returns(
        Promise.resolve([])
    );
    get_all_suites_from_project = sinon.stub(ag_cli.AGTestSuite, 'get_all_from_project').rejects();
});

describe('Creating ag_test_suite', () => {
    let wrapper: Wrapper<AGSuites>;

    beforeEach(() => {
        get_all_suites_from_project.resolves([]);

        wrapper = make_wrapper(project);
    });

    afterEach(() => {
        sinon.restore();

        if (wrapper.exists()) {
            wrapper.destroy();
        }
    });

    test('d_new_ag_test_suite_name binding', async () => {
        expect(wrapper.vm.d_show_new_ag_test_suite_modal).toBe(false);
        expect(wrapper.find({ref: 'new_ag_test_suite_modal'}).exists()).toBe(false);

        wrapper.find('#add-ag-test-suite-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_show_new_ag_test_suite_modal).toBe(true);
        expect(wrapper.find({ref: 'new_ag_test_suite_modal'}).exists()).toBe(true);

        let d_new_ag_test_suite_name_input = wrapper.find({ref: 'new_ag_test_suite_name'});

        set_validated_input_text(d_new_ag_test_suite_name_input, "Suite I");
        expect(validated_input_is_valid(d_new_ag_test_suite_name_input)).toBe(true);
        expect(wrapper.vm.d_new_ag_test_suite_name).toEqual("Suite I");

        wrapper.vm.d_new_ag_test_suite_name = "Suite II";
        expect(get_validated_input_text(d_new_ag_test_suite_name_input)).toEqual("Suite II");
    });

    test('Creating a suite - successfully', async () => {
        let create_ag_suite_stub = sinon.stub(ag_cli.AGTestSuite, 'create').callsFake(
            () => ag_cli.AGTestSuite.notify_ag_test_suite_created(new_suite)
        );

        let new_suite = data_ut.make_ag_test_suite(project.pk);

        expect(wrapper.vm.d_show_new_ag_test_suite_modal).toBe(false);
        expect(wrapper.find({ref: 'new_ag_test_suite_modal'}).exists()).toBe(false);

        wrapper.find('#add-ag-test-suite-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_show_new_ag_test_suite_modal).toBe(true);
        expect(wrapper.find({ref: 'new_ag_test_suite_modal'}).exists()).toBe(true);
        expect(wrapper.vm.d_ag_test_suites.length).toEqual(0);

        wrapper.vm.d_new_ag_test_suite_name = "Sweet";
        wrapper.find('#add-ag-test-suite-form').trigger('submit');
        await wrapper.vm.$nextTick();

        expect(create_ag_suite_stub.calledOnce).toBe(true);
        expect(wrapper.vm.d_new_ag_test_suite_name).toBe("");
        expect(wrapper.vm.d_ag_test_suites.length).toEqual(1);
        expect(wrapper.vm.d_active_ag_test_suite).toEqual(new_suite);
        expect(wrapper.vm.d_show_new_ag_test_suite_modal).toBe(false);
        expect(wrapper.find({ref: 'new_ag_test_suite_modal'}).exists()).toBe(false);
    });

    test('Creating a suite - unsuccessfully', async () => {
        let create_ag_suite_stub = sinon.stub(ag_cli.AGTestSuite, 'create').returns(
            Promise.reject(
                new ag_cli.HttpError(
                    400,
                    {__all__: "Ag test suite with this Name and ag_cli.Project already exists."}
                )
            )
        );

        expect(wrapper.vm.d_show_new_ag_test_suite_modal).toBe(false);
        expect(wrapper.find({ref: 'new_ag_test_suite_modal'}).exists()).toBe(false);

        wrapper.find('#add-ag-test-suite-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_show_new_ag_test_suite_modal).toBe(true);
        expect(wrapper.find({ref: 'new_ag_test_suite_modal'}).exists()).toBe(true);
        expect(wrapper.vm.d_ag_test_suites.length).toEqual(0);

        wrapper.vm.d_new_ag_test_suite_name = "Sweet";
        wrapper.find('#add-ag-test-suite-form').trigger('submit');
        await wrapper.vm.$nextTick();

        expect(create_ag_suite_stub.calledOnce).toBe(true);
        expect(wrapper.vm.d_ag_test_suites.length).toEqual(0);

        let api_errors = <APIErrors> wrapper.find({ref: 'api_errors'}).vm;
        expect(api_errors.d_api_errors.length).toBe(1);
        expect(wrapper.vm.d_show_new_ag_test_suite_modal).toBe(true);
        expect(wrapper.find({ref: 'new_ag_test_suite_modal'}).exists()).toBe(true);
    });
});

describe('Changing ag_test_suite', () => {
    test('Suite changed', async () => {
        let suite = data_ut.make_ag_test_suite(project.pk);

        get_all_suites_from_project.resolves([suite]);

        let wrapper = make_wrapper(project);
        await wrapper.vm.$nextTick();

        let updated_suite = deep_copy(suite, ag_cli.AGTestSuite);
        updated_suite.name = 'Updated name';

        expect(wrapper.vm.d_ag_test_suites[0]).toEqual(suite);
        expect(wrapper.vm.d_ag_test_suites[0]).not.toEqual(updated_suite);

        ag_cli.AGTestSuite.notify_ag_test_suite_changed(updated_suite);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_ag_test_suites[0]).not.toEqual(suite);
        expect(wrapper.vm.d_ag_test_suites[0]).toEqual(updated_suite);
        expect(wrapper.vm.d_ag_test_suites[0].name).toEqual(updated_suite.name);

        sinon.restore();

        if (wrapper.exists()) {
            wrapper.destroy();
        }
    });
});

describe('Deleting ag_test_suite', () => {
    let wrapper: Wrapper<AGSuites>;
    let first_suite: ag_cli.AGTestSuite;
    let middle_suite: ag_cli.AGTestSuite;
    let last_suite: ag_cli.AGTestSuite;

    beforeEach(() => {
        first_suite = data_ut.make_ag_test_suite(project.pk);
        middle_suite = data_ut.make_ag_test_suite(project.pk);
        last_suite = data_ut.make_ag_test_suite(project.pk);

        get_all_suites_from_project.resolves([first_suite, middle_suite, last_suite]);

        wrapper = make_wrapper(project);
    });

    afterEach(() => {
        sinon.restore();

        if (wrapper.exists()) {
            wrapper.destroy();
        }
    });

    test('Delete first suite in suites', async () => {
        expect(wrapper.vm.d_ag_test_suites.length).toEqual(3);

        ag_cli.AGTestSuite.notify_ag_test_suite_deleted(first_suite);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_ag_test_suites.length).toEqual(2);
        expect(wrapper.vm.d_ag_test_suites[0]).toEqual(middle_suite);
        expect(wrapper.vm.d_ag_test_suites[1]).toEqual(last_suite);
    });

    test('Delete active first suite in suites', async () => {
        expect(wrapper.vm.d_ag_test_suites.length).toEqual(3);

        wrapper.vm.update_active_item(first_suite);
        await wrapper.vm.$nextTick();

        ag_cli.AGTestSuite.notify_ag_test_suite_deleted(first_suite);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_ag_test_suites.length).toEqual(2);
        expect(wrapper.vm.d_active_ag_test_suite!.pk).toEqual(middle_suite.pk);
        expect(wrapper.vm.d_ag_test_suites[0]).toEqual(middle_suite);
        expect(wrapper.vm.d_ag_test_suites[1]).toEqual(last_suite);
    });

    test('Delete last suite in suites', async () => {
        expect(wrapper.vm.d_ag_test_suites.length).toEqual(3);

        ag_cli.AGTestSuite.notify_ag_test_suite_deleted(last_suite);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_ag_test_suites.length).toEqual(2);
        expect(wrapper.vm.d_ag_test_suites[0]).toEqual(first_suite);
        expect(wrapper.vm.d_ag_test_suites[1]).toEqual(middle_suite);
    });

    test('Delete active last suite in suites', async () => {
        expect(wrapper.vm.d_ag_test_suites.length).toEqual(3);

        wrapper.vm.update_active_item(last_suite);
        await wrapper.vm.$nextTick();

        ag_cli.AGTestSuite.notify_ag_test_suite_deleted(last_suite);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_ag_test_suites.length).toEqual(2);
        expect(wrapper.vm.d_active_ag_test_suite!.pk).toEqual(middle_suite.pk);
        expect(wrapper.vm.d_ag_test_suites[0]).toEqual(first_suite);
        expect(wrapper.vm.d_ag_test_suites[1]).toEqual(middle_suite);
    });

    test('Delete middle suite in suites', async () => {
        expect(wrapper.vm.d_ag_test_suites.length).toEqual(3);

        ag_cli.AGTestSuite.notify_ag_test_suite_deleted(middle_suite);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_ag_test_suites.length).toEqual(2);
        expect(wrapper.vm.d_ag_test_suites[0]).toEqual(first_suite);
        expect(wrapper.vm.d_ag_test_suites[1]).toEqual(last_suite);
    });

    test('Delete active middle suite in suites', async () => {
        expect(wrapper.vm.d_ag_test_suites.length).toEqual(3);

        wrapper.vm.update_active_item(middle_suite);
        await wrapper.vm.$nextTick();

        ag_cli.AGTestSuite.notify_ag_test_suite_deleted(middle_suite);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_ag_test_suites.length).toEqual(2);
        expect(wrapper.vm.d_active_ag_test_suite!.pk).toEqual(last_suite.pk);
        expect(wrapper.vm.d_ag_test_suites[0]).toEqual(first_suite);
        expect(wrapper.vm.d_ag_test_suites[1]).toEqual(last_suite);
    });

    test('Delete all suites - active_suite gets set to null', async () => {
        expect(wrapper.vm.d_ag_test_suites.length).toEqual(3);

        wrapper.vm.update_active_item(first_suite);
        await wrapper.vm.$nextTick();

        ag_cli.AGTestSuite.notify_ag_test_suite_deleted(first_suite);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_ag_test_suites.length).toEqual(2);
        expect(wrapper.vm.d_ag_test_suites[0]).toEqual(middle_suite);
        expect(wrapper.vm.d_ag_test_suites[1]).toEqual(last_suite);

        ag_cli.AGTestSuite.notify_ag_test_suite_deleted(middle_suite);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_ag_test_suites.length).toEqual(1);
        expect(wrapper.vm.d_ag_test_suites[0]).toEqual(last_suite);

        ag_cli.AGTestSuite.notify_ag_test_suite_deleted(last_suite);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_ag_test_suites.length).toEqual(0);
        expect(wrapper.vm.d_active_ag_test_suite).toBe(null);
    });
});

describe('Creating ag_test_case', () => {
    // Note that this also covers the case where a test was cloned
    test('Case created', async () => {
        let suite_1 = data_ut.make_ag_test_suite(project.pk);

        get_all_suites_from_project.resolves([suite_1]);

        let wrapper = make_wrapper(project);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_ag_test_suites[0]).toEqual(suite_1);
        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases.length).toEqual(0);

        let case_created = data_ut.make_ag_test_case(suite_1.pk);
        ag_cli.AGTestCase.notify_ag_test_case_created(case_created);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases.length).toEqual(1);
        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases[0]).toEqual(case_created);
    });
});

describe('Changing ag_test_case', () => {
    test('Case changed', async () => {
        let suite_1 = data_ut.make_ag_test_suite(project.pk);
        let case_1 = data_ut.make_ag_test_case(suite_1.pk);
        case_1.ag_test_commands = [data_ut.make_ag_test_command(case_1.pk)];
        suite_1.ag_test_cases = [case_1];

        get_all_suites_from_project.resolves([suite_1]);

        let wrapper = make_wrapper(project);
        await wrapper.vm.$nextTick();

        let updated_case_1 = deep_copy(case_1, ag_cli.AGTestCase);
        updated_case_1.name = 'Updated name';

        expect(wrapper.vm.d_ag_test_suites[0]).toEqual(suite_1);
        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases.length).toEqual(1);
        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases[0]).toEqual(case_1);
        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases[0]).not.toEqual(updated_case_1);

        ag_cli.AGTestCase.notify_ag_test_case_changed(updated_case_1);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases.length).toEqual(1);
        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases[0]).toEqual(updated_case_1);
        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases[0]).not.toEqual(case_1);

        sinon.restore();

        if (wrapper.exists()) {
            wrapper.destroy();
        }
    });
});

describe('Deleting ag_test_case', () => {
    let wrapper: Wrapper<AGSuites>;
    let suite: ag_cli.AGTestSuite;
    let first_case: ag_cli.AGTestCase;
    let middle_case: ag_cli.AGTestCase;
    let last_case: ag_cli.AGTestCase;

    beforeEach(() => {
        suite = data_ut.make_ag_test_suite(project.pk);
        first_case = data_ut.make_ag_test_case(suite.pk);
        middle_case = data_ut.make_ag_test_case(suite.pk);
        last_case = data_ut.make_ag_test_case(suite.pk);

        first_case.ag_test_commands = [data_ut.make_ag_test_command(first_case.pk)];
        middle_case.ag_test_commands = [data_ut.make_ag_test_command(middle_case.pk)];
        last_case.ag_test_commands = [data_ut.make_ag_test_command(last_case.pk)];

        suite.ag_test_cases = [
          first_case,
          middle_case,
          last_case
        ];

        get_all_suites_from_project.resolves([suite]);

        wrapper = make_wrapper(project);
    });

    afterEach(() => {
        sinon.restore();

        if (wrapper.exists()) {
            wrapper.destroy();
        }
    });

    test('First case deleted', async () => {
        expect(wrapper.vm.d_ag_test_suites[0]).toEqual(suite);
        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases.length).toEqual(3);

        ag_cli.AGTestCase.notify_ag_test_case_deleted(first_case);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases.length).toEqual(2);
        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases[0]).toEqual(middle_case);
        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases[1]).toEqual(last_case);
    });

    test('active first case deleted', async () => {
        wrapper.vm.update_active_item(first_case);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_active_ag_test_command).toEqual(first_case.ag_test_commands[0]);
        expect(wrapper.vm.d_ag_test_suites[0]).toEqual(suite);
        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases.length).toEqual(3);

        ag_cli.AGTestCase.notify_ag_test_case_deleted(first_case);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases.length).toEqual(2);
        expect(wrapper.vm.d_active_ag_test_command).toEqual(middle_case.ag_test_commands[0]);
        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases[0]).toEqual(middle_case);
        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases[1]).toEqual(last_case);
    });

    test('Middle case deleted', async () => {
        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases.length).toEqual(3);

        ag_cli.AGTestCase.notify_ag_test_case_deleted(middle_case);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases.length).toEqual(2);
        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases[0]).toEqual(first_case);
        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases[1]).toEqual(last_case);
    });

    test('Active middle case deleted', async () => {
        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases.length).toEqual(3);

        wrapper.vm.update_active_item(middle_case);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_active_ag_test_command).toEqual(middle_case.ag_test_commands[0]);

        ag_cli.AGTestCase.notify_ag_test_case_deleted(middle_case);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases.length).toEqual(2);
        expect(wrapper.vm.d_active_ag_test_command).toEqual(last_case.ag_test_commands[0]);
        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases[0]).toEqual(first_case);
        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases[1]).toEqual(last_case);
    });

    test('last case deleted', async () => {
        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases.length).toEqual(3);

        ag_cli.AGTestCase.notify_ag_test_case_deleted(last_case);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases.length).toEqual(2);
        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases[0]).toEqual(first_case);
        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases[1]).toEqual(middle_case);
    });

    test('active last case deleted', async () => {
        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases.length).toEqual(3);

        wrapper.vm.update_active_item(last_case);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_active_ag_test_command).toEqual(last_case.ag_test_commands[0]);

        ag_cli.AGTestCase.notify_ag_test_case_deleted(last_case);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases.length).toEqual(2);
        expect(wrapper.vm.d_active_ag_test_command).toEqual(middle_case.ag_test_commands[0]);
        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases[0]).toEqual(first_case);
        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases[1]).toEqual(middle_case);
    });

    test('Delete all cases in suite - suite becomes active', async () => {
        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases.length).toEqual(3);

        wrapper.vm.update_active_item(first_case);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_active_ag_test_command).toEqual(first_case.ag_test_commands[0]);

        ag_cli.AGTestCase.notify_ag_test_case_deleted(first_case);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases.length).toEqual(2);
        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases[0]).toEqual(middle_case);
        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases[1]).toEqual(last_case);
        expect(wrapper.vm.d_active_ag_test_suite).toBeNull();
        expect(wrapper.vm.d_active_ag_test_command).toEqual(middle_case.ag_test_commands[0]);

        ag_cli.AGTestCase.notify_ag_test_case_deleted(middle_case);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases.length).toEqual(1);
        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases[0]).toEqual(last_case);
        expect(wrapper.vm.d_active_ag_test_command).toEqual(last_case.ag_test_commands[0]);

        ag_cli.AGTestCase.notify_ag_test_case_deleted(last_case);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases.length).toEqual(0);
        expect(wrapper.vm.d_active_ag_test_command).toBeNull();
        expect(wrapper.vm.d_active_ag_test_suite).toEqual(suite);
    });
});

describe('Creating ag_test_command', () => {
    test('Command created', async () => {
        let suite_1 = data_ut.make_ag_test_suite(project.pk);
        let suite_1_case_1 = data_ut.make_ag_test_case(suite_1.pk);
        let suite_1_case_1_command_1 = data_ut.make_ag_test_command(suite_1_case_1.pk);

        suite_1_case_1.ag_test_commands = [suite_1_case_1_command_1];
        suite_1.ag_test_cases = [suite_1_case_1];

        get_all_suites_from_project.resolves([suite_1]);

        let wrapper = make_wrapper(project);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases[0].ag_test_commands.length).toEqual(1);

        let command_created = data_ut.make_ag_test_command(suite_1_case_1.pk);
        ag_cli.AGTestCommand.notify_ag_test_command_created(command_created);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases[0].ag_test_commands.length).toEqual(2);
        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases[0].ag_test_commands[0]).toEqual(
            suite_1_case_1_command_1
        );
        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases[0].ag_test_commands[1]).toEqual(
            command_created
        );
        expect(wrapper.vm.d_active_ag_test_command).toEqual(command_created);

        sinon.restore();
        if (wrapper.exists()) {
            wrapper.destroy();
        }
    });
});

describe('Changing ag_test_command', () => {
    test('Command changed', async () => {
        let suite_1: ag_cli.AGTestSuite;
        let case_1: ag_cli.AGTestCase;
        let command_1: ag_cli.AGTestCommand;
        let command_2: ag_cli.AGTestCommand;

        suite_1 = data_ut.make_ag_test_suite(project.pk);
        case_1 = data_ut.make_ag_test_case(suite_1.pk);
        command_1 = data_ut.make_ag_test_command(case_1.pk);
        command_2 = data_ut.make_ag_test_command(case_1.pk);

        case_1.ag_test_commands = [command_1, command_2];
        suite_1.ag_test_cases = [case_1];

        get_all_suites_from_project.resolves([suite_1]);

        let wrapper = make_wrapper(project);
        await wrapper.vm.$nextTick();

        let updated_command_2 = deep_copy(command_2, ag_cli.AGTestCommand);
        updated_command_2.name = 'Updated name';

        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases[0].ag_test_commands.length).toEqual(2);
        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases[0].ag_test_commands[0]).toEqual(
            command_1
        );
        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases[0].ag_test_commands[1]).toEqual(
            command_2
        );
        expect(command_2).not.toEqual(updated_command_2);
        ag_cli.AGTestCommand.notify_ag_test_command_changed(updated_command_2);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases[0].ag_test_commands.length).toEqual(2);
        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases[0].ag_test_commands[0]).toEqual(
            command_1
        );
        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases[0].ag_test_commands[1]).toEqual(
            updated_command_2
        );
        sinon.restore();
        if (wrapper.exists()) {
            wrapper.destroy();
        }
    });
});

describe('Deleting ag_test_command', () => {
    let wrapper: Wrapper<AGSuites>;
    let parent_suite: ag_cli.AGTestSuite;
    let parent_case: ag_cli.AGTestCase;
    let first_command: ag_cli.AGTestCommand;
    let middle_command: ag_cli.AGTestCommand;
    let last_command: ag_cli.AGTestCommand;

    beforeEach(async () => {
        parent_suite = data_ut.make_ag_test_suite(project.pk);
        parent_case = data_ut.make_ag_test_case(parent_suite.pk);
        first_command = data_ut.make_ag_test_command(parent_case.pk);
        middle_command = data_ut.make_ag_test_command(parent_case.pk);
        last_command = data_ut.make_ag_test_command(parent_case.pk);

        parent_case.ag_test_commands = [
            first_command,
            middle_command,
            last_command
        ];

        parent_suite.ag_test_cases = [parent_case];

        get_all_suites_from_project.resolves([parent_suite]);

        wrapper = make_wrapper(project);
        await wrapper.vm.$nextTick();
    });

    afterEach(() => {
        sinon.restore();

        if (wrapper.exists()) {
            wrapper.destroy();
        }
    });

    test('First command deleted in case', async () => {
        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases[0].ag_test_commands.length).toEqual(3);
        ag_cli.AGTestCommand.notify_ag_test_command_deleted(first_command);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases[0].ag_test_commands.length).toEqual(2);
        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases[0].ag_test_commands[0]).toEqual(
            middle_command
        );
        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases[0].ag_test_commands[1]).toEqual(
            last_command
        );
    });

    test('active First command deleted in case', async () => {
        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases[0].ag_test_commands.length).toEqual(3);

        wrapper.vm.update_active_item(first_command);
        await wrapper.vm.$nextTick();
        ag_cli.AGTestCommand.notify_ag_test_command_deleted(first_command);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases[0].ag_test_commands.length).toEqual(2);
        expect(wrapper.vm.d_active_ag_test_command).toEqual(middle_command);
        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases[0].ag_test_commands[0]).toEqual(
            middle_command
        );
        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases[0].ag_test_commands[1]).toEqual(
            last_command
        );
    });

    test('Middle command deleted in case', async () => {
        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases[0].ag_test_commands.length).toEqual(3);
        ag_cli.AGTestCommand.notify_ag_test_command_deleted(middle_command);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases[0].ag_test_commands.length).toEqual(2);
        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases[0].ag_test_commands[0]).toEqual(
            first_command
        );
        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases[0].ag_test_commands[1]).toEqual(
            last_command
        );
    });

    test('Active middle command deleted in case', async () => {
        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases[0].ag_test_commands.length).toEqual(3);

        wrapper.vm.update_active_item(middle_command);
        await wrapper.vm.$nextTick();
        ag_cli.AGTestCommand.notify_ag_test_command_deleted(middle_command);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases[0].ag_test_commands.length).toEqual(2);
        expect(wrapper.vm.d_active_ag_test_command).toEqual(last_command);
        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases[0].ag_test_commands[0]).toEqual(
            first_command
        );
        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases[0].ag_test_commands[1]).toEqual(
            last_command
        );
    });

    test('Last command deleted in case', async () => {
        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases[0].ag_test_commands.length).toEqual(3);
        ag_cli.AGTestCommand.notify_ag_test_command_deleted(last_command);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases[0].ag_test_commands.length).toEqual(2);
        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases[0].ag_test_commands[0]).toEqual(
            first_command
        );
        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases[0].ag_test_commands[1]).toEqual(
            middle_command
        );
    });

    test('Active last command deleted in case', async () => {
        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases[0].ag_test_commands.length).toEqual(3);

        wrapper.vm.update_active_item(last_command);
        await wrapper.vm.$nextTick();
        ag_cli.AGTestCommand.notify_ag_test_command_deleted(last_command);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases[0].ag_test_commands.length).toEqual(2);
        expect(wrapper.vm.d_active_ag_test_command).toEqual(middle_command);
        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases[0].ag_test_commands[0]).toEqual(
            first_command
        );
        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases[0].ag_test_commands[1]).toEqual(
            middle_command
        );
    });
});

describe('Next/prev test buttons', () => {
    let wrapper: Wrapper<AGSuites>;
    let suite_1: ag_cli.AGTestSuite;
    let suite_1_case_1: ag_cli.AGTestCase;
    let suite_1_case_1_command_1: ag_cli.AGTestCommand;
    let suite_1_case_2: ag_cli.AGTestCase;
    let suite_1_case_2_command_1: ag_cli.AGTestCommand;
    let suite_1_case_2_command_2: ag_cli.AGTestCommand;

    let suite_2: ag_cli.AGTestSuite;
    let suite_2_case_1: ag_cli.AGTestCase;
    let suite_2_case_1_command_1: ag_cli.AGTestCommand;
    let suite_2_case_1_command_2: ag_cli.AGTestCommand;

    let suite_3: ag_cli.AGTestSuite;
    let suite_3_case_1: ag_cli.AGTestCase;
    let suite_3_case_1_command_1: ag_cli.AGTestCommand;

    beforeEach(async () => {
        suite_1 = data_ut.make_ag_test_suite(project.pk);
        suite_1_case_1 = data_ut.make_ag_test_case(suite_1.pk);
        suite_1_case_1_command_1 = data_ut.make_ag_test_command(suite_1_case_1.pk);
        suite_1_case_2 = data_ut.make_ag_test_case(suite_1.pk);
        suite_1_case_2_command_1 = data_ut.make_ag_test_command(suite_1_case_2.pk);
        suite_1_case_2_command_2 = data_ut.make_ag_test_command(suite_1_case_2.pk);

        suite_1_case_1.ag_test_commands = [suite_1_case_1_command_1];
        suite_1_case_2.ag_test_commands = [suite_1_case_2_command_1, suite_1_case_2_command_2];
        suite_1.ag_test_cases = [suite_1_case_1, suite_1_case_2];

        suite_2 = data_ut.make_ag_test_suite(project.pk);
        suite_2_case_1 = data_ut.make_ag_test_case(suite_2.pk);
        suite_2_case_1_command_1 = data_ut.make_ag_test_command(suite_2_case_1.pk);
        suite_2_case_1_command_2 = data_ut.make_ag_test_command(suite_2_case_1.pk);

        suite_2_case_1.ag_test_commands = [suite_2_case_1_command_1, suite_2_case_1_command_2];
        suite_2.ag_test_cases = [suite_2_case_1];

        suite_3 = data_ut.make_ag_test_suite(project.pk);
        suite_3_case_1 = data_ut.make_ag_test_case(suite_3.pk);
        suite_3_case_1_command_1 = data_ut.make_ag_test_command(suite_3_case_1.pk);

        suite_3_case_1.ag_test_commands = [suite_3_case_1_command_1];
        suite_3.ag_test_cases = [suite_3_case_1];

        get_all_suites_from_project.resolves([suite_1, suite_2, suite_3]);

        wrapper = make_wrapper(project);
        await wrapper.vm.$nextTick();
    });

    afterEach(() => {
        sinon.restore();

        if (wrapper.exists()) {
            wrapper.destroy();
        }
    });

    test('prev_ag_test_case_is_available (false) - d_active_ag_test_suite is null', async () => {
        expect(wrapper.vm.prev_ag_test_case_is_available).toBe(false);
        expect(wrapper.findAll('#prev-ag-test-case-button').length).toEqual(0);
    });

    test('prev_ag_test_case_is_available (false) - d_active_ag_test_command is null', async () => {
        wrapper.vm.update_active_item(suite_1);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.prev_ag_test_case_is_available).toBe(false);
        expect(wrapper.findAll('#prev-ag-test-case-button').length).toEqual(0);
    });

    test('prev_ag_test_case_is_available (false) - suite index is 0, case index is 0', async () => {
        wrapper.vm.update_active_item(suite_1_case_1);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.prev_ag_test_case_is_available).toBe(false);
        expect(wrapper.find('#prev-ag-test-case-button').is('[disabled]')).toBe(true);
    });

    test('prev_ag_test_case_is_available (false) - suite index != 0, case index is 0, ' +
         'prev suite doesnt have any cases',
         async () => {
        ag_cli.AGTestCase.notify_ag_test_case_deleted(suite_2_case_1);
        await wrapper.vm.$nextTick();

        wrapper.vm.update_active_item(suite_3_case_1_command_1);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.prev_ag_test_case_is_available).toBe(false);
        expect(wrapper.find('#prev-ag-test-case-button').is('[disabled]')).toBe(true);
    });

    test("prev_ag_test_case_is_available (false) - suite index != 0, case index is 0, " +
         "prev suite's last case doesnt have enough commands",
         async () => {
        ag_cli.AGTestCommand.notify_ag_test_command_deleted(suite_1_case_2_command_2);
        await wrapper.vm.$nextTick();

        wrapper.vm.update_active_item(suite_2_case_1_command_2);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.prev_ag_test_case_is_available).toBe(false);
        expect(wrapper.find('#prev-ag-test-case-button').is('[disabled]')).toBe(true);
    });

    test("prev_ag_test_case_is_available (true) - suite index != 0, case index is 0, " +
         "prev suite's last case has enough commands",
         async () => {
        wrapper.vm.update_active_item(suite_3_case_1_command_1);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.prev_ag_test_case_is_available).toBe(true);
        expect(wrapper.find('#prev-ag-test-case-button').is('[disabled]')).toBe(false);
    });

    test('prev_ag_test_case_is_available (false) - suite index is 0, case index != 0, ' +
         'prev case does not have enough commands',
         async () => {
        wrapper.vm.update_active_item(suite_1_case_2_command_2);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.prev_ag_test_case_is_available).toBe(false);
        expect(wrapper.find('#prev-ag-test-case-button').is('[disabled]')).toBe(true);
    });

    test('prev_ag_test_case_is_available (true) - suite index is 0, case index != 0, prev ' +
         'case has enough commands',
         async () => {
        wrapper.vm.update_active_item(suite_1_case_2_command_1);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.prev_ag_test_case_is_available).toBe(true);
        expect(wrapper.find('#prev-ag-test-case-button').is('[disabled]')).toBe(false);
    });

    test('go_to_prev_command - prev case in same suite', async () => {
        wrapper.vm.update_active_item(suite_1_case_2_command_1);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_active_ag_test_command).toEqual(suite_1_case_2_command_1);

        expect(wrapper.find('#prev-ag-test-case-button').is('[disabled]')).toBe(false);
        wrapper.find('#prev-ag-test-case-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_active_ag_test_command).toEqual(suite_1_case_1_command_1);
    });

    test('go_to_prev_command - last case in previous suite', async () => {
        wrapper.vm.update_active_item(suite_2_case_1_command_2);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_active_ag_test_command).toEqual(suite_2_case_1_command_2);

        expect(wrapper.find('#prev-ag-test-case-button').is('[disabled]')).toBe(false);
        wrapper.find('#prev-ag-test-case-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_active_ag_test_command).toEqual(suite_1_case_2_command_2);
    });

    test('next_ag_test_case_is_available (false) - d_active_ag_test_suite is null',
         async () => {
        expect(wrapper.vm.next_ag_test_case_is_available).toBe(false);
        expect(wrapper.findAll('#next-ag-test-case-button').length).toEqual(0);
    });

    test('next_ag_test_case_is_available (false) - d_active_ag_test_command is null',
         async () => {
        wrapper.vm.update_active_item(suite_1);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.next_ag_test_case_is_available).toBe(false);
        expect(wrapper.findAll('#next-ag-test-case-button').length).toEqual(0);
    });

    test('next_ag_test_case_is_available (false) - suite index is 0, case index is 0, ' +
         'next case doesnt have enough commands',
         async () => {
        let suite_1_case_1_command_2 = data_ut.make_ag_test_command(suite_1_case_1.pk);
        let suite_1_case_1_command_3 = data_ut.make_ag_test_command(suite_1_case_1.pk);

        ag_cli.AGTestCommand.notify_ag_test_command_created(suite_1_case_1_command_2);
        ag_cli.AGTestCommand.notify_ag_test_command_created(suite_1_case_1_command_3);

        wrapper.vm.update_active_item(suite_1_case_1_command_3);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.next_ag_test_case_is_available).toBe(false);
        expect(wrapper.find('#next-ag-test-case-button').is('[disabled]')).toBe(true);
    });

    test('next_ag_test_case_is_available (true) - suite index is 0, case index is 0, next ' +
         'case has enough commands',
         async () => {
        wrapper.vm.update_active_item(suite_1_case_1_command_1);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.next_ag_test_case_is_available).toBe(true);
        expect(wrapper.find('#next-ag-test-case-button').is('[disabled]')).toBe(false);
    });

    test('next_ag_test_case_is_available (false) - suite is the last suite, case is the ' +
         'last case in the suite',
         async () => {
        wrapper.vm.update_active_item(suite_3_case_1_command_1);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.next_ag_test_case_is_available).toBe(false);
        expect(wrapper.find('#next-ag-test-case-button').is('[disabled]')).toBe(true);
    });

    test('next_ag_test_case_is_available (false) - suite is not the last suite, ' +
         'case is the last case in the suite, next suite doesnt have any cases',
         async () => {
        ag_cli.AGTestCase.notify_ag_test_case_deleted(suite_3_case_1);

        wrapper.vm.update_active_item(suite_2_case_1_command_1);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.next_ag_test_case_is_available).toBe(false);
        expect(wrapper.find('#next-ag-test-case-button').is('[disabled]')).toBe(true);
    });

    test('next_ag_test_case_is_available (false) - suite is not the last suite, case is ' +
         'the last case in the suite, first case in next suite doesnt have enough commands',
         async () => {
        wrapper.vm.update_active_item(suite_2_case_1_command_2);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.next_ag_test_case_is_available).toBe(false);
        expect(wrapper.find('#next-ag-test-case-button').is('[disabled]')).toBe(true);
    });

    test('next_ag_test_case_is_available (true) - suite is not the last suite, case is' +
         'the last case in the suite, first case in the next suite has enough commands',
         async () => {
        wrapper.vm.update_active_item(suite_2_case_1_command_1);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.next_ag_test_case_is_available).toBe(true);
        expect(wrapper.find('#next-ag-test-case-button').is('[disabled]')).toBe(false);
    });

    test('go_to_next_command - next case in same suite', async () => {
        wrapper.vm.update_active_item(suite_1_case_1_command_1);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_active_ag_test_command).toEqual(suite_1_case_1_command_1);

        expect(wrapper.find('#next-ag-test-case-button').is('[disabled]')).toBe(false);
        wrapper.find('#next-ag-test-case-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_active_ag_test_command).toEqual(suite_1_case_2_command_1);
    });

    test('go_to_next_command - first case in next suite', async () => {
        wrapper.vm.update_active_item(suite_1_case_2_command_2);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_active_ag_test_command).toEqual(suite_1_case_2_command_2);

        expect(wrapper.find('#next-ag-test-case-button').is('[disabled]')).toBe(false);
        wrapper.find('#next-ag-test-case-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_active_ag_test_command).toEqual(suite_2_case_1_command_2);
    });
});

describe('Active_level', () => {
    let wrapper: Wrapper<AGSuites>;
    let suite_1: ag_cli.AGTestSuite;
    let suite_1_case_1: ag_cli.AGTestCase;
    let suite_1_case_1_command_1: ag_cli.AGTestCommand;

    beforeEach(() => {
        suite_1 = data_ut.make_ag_test_suite(project.pk);
        suite_1_case_1 = data_ut.make_ag_test_case(suite_1.pk);
        suite_1_case_1_command_1 = data_ut.make_ag_test_command(suite_1_case_1.pk);

        suite_1_case_1.ag_test_commands = [suite_1_case_1_command_1];
        suite_1.ag_test_cases = [suite_1_case_1];

        get_all_suites_from_project.resolves([suite_1]);

        wrapper = make_wrapper(project);
    });

    afterEach(() => {
        sinon.restore();

        if (wrapper.exists()) {
            wrapper.destroy();
        }
    });

    test('active_level_is_suite', async () => {
        expect(wrapper.vm.active_level_is_suite).toBe(false);

        wrapper.vm.update_active_item(suite_1);
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.active_level_is_suite).toBe(true);

        wrapper.vm.update_active_item(suite_1_case_1);
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.active_level_is_suite).toBe(false);

        wrapper.vm.update_active_item(suite_1_case_1_command_1);
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.active_level_is_suite).toBe(false);
    });

    test('active_level_is_command', async () => {
        expect(wrapper.vm.active_level_is_command).toBe(false);

        wrapper.vm.update_active_item(suite_1);
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.active_level_is_command).toBe(false);

        wrapper.vm.update_active_item(suite_1_case_1);
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.active_level_is_command).toBe(true);

        wrapper.vm.update_active_item(suite_1_case_1_command_1);
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.active_level_is_command).toBe(true);
    });
});

describe('AGSuites getter functions', () => {
    let wrapper: Wrapper<AGSuites>;

    afterEach(() => {
        sinon.restore();

        if (wrapper.exists()) {
            wrapper.destroy();
        }
    });

    test('parent_ag_test_case getter', async () => {
        let suite_1 = data_ut.make_ag_test_suite(project.pk);
        let suite_1_case_1 = data_ut.make_ag_test_case(suite_1.pk);
        let suite_1_case_1_command_1 = data_ut.make_ag_test_command(suite_1_case_1.pk);
        let suite_1_case_2 = data_ut.make_ag_test_case(suite_1.pk);
        let suite_1_case_2_command_1 = data_ut.make_ag_test_command(suite_1_case_2.pk);

        suite_1_case_1.ag_test_commands = [suite_1_case_1_command_1];
        suite_1_case_2.ag_test_commands = [ suite_1_case_2_command_1];
        suite_1.ag_test_cases = [suite_1_case_1, suite_1_case_2];

        get_all_suites_from_project.resolves([suite_1]);

        wrapper = make_wrapper(project);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.parent_ag_test_case).toBeNull();

        wrapper.vm.update_active_item(suite_1_case_1);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.parent_ag_test_case).toEqual(suite_1_case_1);

        wrapper.vm.update_active_item(suite_1_case_2_command_1);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.parent_ag_test_case).toEqual(suite_1_case_2);
    });

    test('parent_ag_test_suite getter', async () => {
        let suite_1 = data_ut.make_ag_test_suite(project.pk);
        let suite_1_case_1 = data_ut.make_ag_test_case(suite_1.pk);
        let suite_1_case_1_command_1 = data_ut.make_ag_test_command(suite_1_case_1.pk);
        let suite_2 = data_ut.make_ag_test_suite(project.pk);
        let suite_2_case_1 = data_ut.make_ag_test_case(suite_2.pk);
        let suite_2_case_1_command_1 = data_ut.make_ag_test_command(suite_2_case_1.pk);

        suite_1_case_1.ag_test_commands = [suite_1_case_1_command_1];
        suite_2_case_1.ag_test_commands = [suite_2_case_1_command_1];

        suite_1.ag_test_cases = [suite_1_case_1];
        suite_2.ag_test_cases = [suite_2_case_1];

        get_all_suites_from_project.resolves([suite_1, suite_2]);

        wrapper = make_wrapper(project);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.parent_ag_test_suite).toBeNull();

        wrapper.vm.update_active_item(suite_1);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.parent_ag_test_suite).toBeNull();

        wrapper.vm.update_active_item(suite_1_case_1);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.parent_ag_test_suite).toEqual(suite_1);

        wrapper.vm.update_active_item(suite_2_case_1);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.parent_ag_test_suite).toEqual(suite_2);
    });
});
