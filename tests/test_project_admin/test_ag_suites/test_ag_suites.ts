import { config, mount, Wrapper } from '@vue/test-utils';

import {
    AGTestCase,
    AGTestCommand,
    AGTestSuite,
    HttpError,
    InstructorFile,
    Project,
} from 'ag-client-typescript';
// tslint:disable-next-line:no-duplicate-imports
import * as ag_cli from 'ag-client-typescript';
import * as sinon from "sinon";

import APIErrors from '@/components/api_errors.vue';
import AGSuites from '@/components/project_admin/ag_suites/ag_suites.vue';
import { deep_copy } from '@/utils';

import * as data_ut from '@/tests/data_utils';
import {
    get_validated_input_text,
    set_validated_input_text,
    validated_input_is_valid
} from '@/tests/utils';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('creating ag_test_suite', () => {
    let wrapper: Wrapper<AGSuites>;
    let project: Project;

    beforeEach(() => {
        project = data_ut.make_project(data_ut.make_course().pk);

        sinon.stub(ag_cli, 'get_sandbox_docker_images').returns(Promise.resolve([]));
        sinon.stub(AGTestSuite, 'get_all_from_project').returns(Promise.resolve([]));

        wrapper = mount(AGSuites, {
            propsData: {
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

    test('Creating a suite - successfully', async () => {
        let create_ag_suite_stub = sinon.stub(AGTestSuite, 'create').callsFake(
            () => AGTestSuite.notify_ag_test_suite_created(new_suite)
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
        let create_ag_suite_stub = sinon.stub(AGTestSuite, 'create').returns(
            Promise.reject(
                new HttpError(
                    400,
                    {__all__: "Ag test suite with this Name and Project already exists."}
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

describe('ag_test_suite changed', () => {
    let wrapper: Wrapper<AGSuites>;
    let project: Project;
    let suite: AGTestSuite;

    beforeEach(() => {
        project = data_ut.make_project(data_ut.make_course().pk);
        suite = data_ut.make_ag_test_suite(project.pk);

        sinon.stub(ag_cli, 'get_sandbox_docker_images').returns(Promise.resolve([]));
        sinon.stub(AGTestSuite, 'get_all_from_project').returns(Promise.resolve([suite]));

        wrapper = mount(AGSuites, {
           propsData: {
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

    test('Suite changed', async () => {
        let updated_suite = deep_copy(suite, AGTestSuite);
        updated_suite.name = 'Updated name';

        expect(wrapper.vm.d_ag_test_suites[0]).toEqual(suite);
        expect(wrapper.vm.d_ag_test_suites[0]).not.toEqual(updated_suite);

        AGTestSuite.notify_ag_test_suite_changed(updated_suite);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_ag_test_suites[0]).not.toEqual(suite);
        expect(wrapper.vm.d_ag_test_suites[0]).toEqual(updated_suite);
        expect(wrapper.vm.d_ag_test_suites[0].name).toEqual(updated_suite.name);
    });
});

describe('deleting ag_test_suite', () => {

});

describe('creating ag_test_case', () => {
    let wrapper: Wrapper<AGSuites>;
    let ag_test_suite: AGTestSuite;
    let project: Project;

    beforeEach(() => {
        project = data_ut.make_project(data_ut.make_course().pk);
        ag_test_suite = data_ut.make_ag_test_suite(project.pk);

        sinon.stub(ag_cli, 'get_sandbox_docker_images').returns(Promise.resolve([]));
        sinon.stub(AGTestSuite, 'get_all_from_project').returns(Promise.resolve(
            [ag_test_suite]
        ));

        wrapper = mount(AGSuites, {
           propsData: {
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

    test('Case created', async () => {
        expect(wrapper.vm.d_ag_test_suites[0]).toEqual(ag_test_suite);
        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases.length).toEqual(0);

        let ag_test_case = data_ut.make_ag_test_case(ag_test_suite.pk);
        AGTestCase.notify_ag_test_case_created(ag_test_case);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases.length).toEqual(1);
        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases[0]).toEqual(ag_test_case);
    });
});

describe('deleting ag_test_case', () => {

});

describe('prev_ag_test_case_is_available', () => {

});

describe('go_to_prev_command', () => {

});

describe('next_ag_test_case_is_available', () => {

});

describe('go_to_next_command', () => {

});

describe('active_level', () => {

});

describe('AGSuites getter functions', () => {
    let wrapper: Wrapper<AGSuites>;
    let project: Project;

    beforeEach(() => {
        wrapper = mount(AGSuites, {
           propsData: {
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

    test.skip('parent_ag_test_case getter', async () => {
        let ag_test_suite: AGTestSuite;
        let ag_test_case_1: AGTestCase;
        let ag_test_command_1: AGTestCommand;
        let ag_test_case_a: AGTestCase;
        let ag_test_command_a: AGTestCommand;

        expect(wrapper.vm.parent_ag_test_case).toBeNull();

        wrapper.vm.update_active_item(ag_test_case_1);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.parent_ag_test_case).toEqual(ag_test_case_1);

        wrapper.vm.update_active_item(ag_test_command_a);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.parent_ag_test_case).toEqual(ag_test_case_a);
    });

    test.skip('parent_ag_test_suite getter', async () => {
        let ag_test_suite_1: AGTestSuite;
        let ag_test_case_1: AGTestCase;
        let ag_test_command_1: AGTestCommand;
        let ag_test_suite_2: AGTestSuite;
        let ag_test_case_2

        expect(wrapper.vm.parent_ag_test_suite).toBeNull();

        wrapper.vm.update_active_item(ag_suite_pets);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.parent_ag_test_suite).toBeNull();

        wrapper.vm.update_active_item(ag_case_blue);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.parent_ag_test_suite).toEqual(ag_suite_colors);

        wrapper.vm.update_active_item(ag_command_bird_1);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.parent_ag_test_suite).toEqual(ag_suite_pets);
    });
});



describe('AGSuites tests', () => {
    let wrapper: Wrapper<AGSuites>;
    let component: AGSuites;
    let ag_suite_colors: AGTestSuite;

    let ag_case_purple: AGTestCase;
    let ag_command_purple_1: AGTestCommand;
    let ag_command_purple_2: AGTestCommand;

    let ag_case_blue: AGTestCase;
    let ag_command_blue_1: AGTestCommand;

    let ag_case_green: AGTestCase;
    let ag_command_green_1: AGTestCommand;
    let ag_command_green_2: AGTestCommand;
    let ag_command_green_3: AGTestCommand;

    let ag_suite_pets: AGTestSuite;

    let ag_case_dog: AGTestCase;
    let ag_command_dog_1: AGTestCommand;

    let ag_case_bird: AGTestCase;
    let ag_command_bird_1: AGTestCommand;

    let ag_suite_beverages: AGTestSuite;
    let ag_case_sprite: AGTestCase;
    let ag_command_sprite_1: AGTestCommand;

    let instructor_file_1: InstructorFile;
    let instructor_file_2: InstructorFile;
    let instructor_file_3: InstructorFile;
    let project: Project;

    beforeEach(() => {
        instructor_file_1 = new InstructorFile({
            pk: 1,
            project: 10,
            name: "antarctica.cpp",
            size: 2,
            last_modified: "now"
        });

        instructor_file_2 = new InstructorFile({
            pk: 2,
            project: 10,
            name: "africa.cpp",
            size: 2,
            last_modified: "now"
        });

        instructor_file_3 = new InstructorFile({
            pk: 3,
            project: 10,
            name: "asia.cpp",
            size: 2,
            last_modified: "now"
        });

        project = data_ut.make_project(
            data_ut.make_course().pk,
            {
                instructor_files: [
                    instructor_file_1,
                    instructor_file_2,
                    instructor_file_3
                ]
            }
        );

        ag_suite_colors = data_ut.make_ag_test_suite(project.pk);
        ag_case_purple = data_ut.make_ag_test_case(ag_suite_colors.pk);
        ag_command_purple_1 = data_ut.make_ag_test_command(ag_case_purple.pk);
        ag_command_purple_2 = data_ut.make_ag_test_command(ag_case_purple.pk);
        ag_case_blue = data_ut.make_ag_test_case(ag_suite_colors.pk);
        ag_command_blue_1 = data_ut.make_ag_test_command(ag_case_blue.pk);
        ag_case_green = data_ut.make_ag_test_case(ag_suite_colors.pk);
        ag_command_green_1 = data_ut.make_ag_test_command(ag_case_green.pk);
        ag_command_green_2 = data_ut.make_ag_test_command(ag_case_green.pk);
        ag_command_green_3 = data_ut.make_ag_test_command(ag_case_green.pk);

        ag_case_purple.ag_test_commands = [
            ag_command_purple_1,
            ag_command_purple_2
        ];
        ag_case_blue.ag_test_commands = [
            ag_command_blue_1
        ];
        ag_case_green.ag_test_commands = [
            ag_command_green_1,
            ag_command_green_2,
            ag_command_green_3
        ];
        ag_suite_colors.ag_test_cases = [
            ag_case_purple,
            ag_case_blue,
            ag_case_green
        ];

        ag_suite_pets = data_ut.make_ag_test_suite(project.pk);
        ag_case_dog = data_ut.make_ag_test_case(ag_suite_pets.pk);
        ag_command_dog_1 = data_ut.make_ag_test_command(ag_case_dog.pk);
        ag_case_bird = data_ut.make_ag_test_case(ag_suite_pets.pk);
        ag_command_bird_1 = data_ut.make_ag_test_command(ag_case_bird.pk);

        ag_case_dog.ag_test_commands = [ag_command_dog_1];
        ag_case_bird.ag_test_commands = [ag_command_bird_1];
        ag_suite_pets.ag_test_cases = [ag_case_dog, ag_case_bird];

        ag_suite_beverages = data_ut.make_ag_test_suite(project.pk);
        ag_case_sprite = data_ut.make_ag_test_case(ag_suite_beverages.pk);
        ag_command_sprite_1 = data_ut.make_ag_test_command(ag_case_sprite.pk);

        ag_case_sprite.ag_test_commands = [ag_command_sprite_1];
        ag_suite_beverages.ag_test_cases = [ag_case_sprite];

        sinon.stub(ag_cli, 'get_sandbox_docker_images').returns(Promise.resolve([]));

        sinon.stub(AGTestSuite, 'get_all_from_project').returns(
            Promise.resolve([ag_suite_colors, ag_suite_pets, ag_suite_beverages])
        );

        wrapper = mount(AGSuites, {
            propsData: {
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

    // Suite Related -----------------------------------------------------------------------------

    test.skip('d_new_ag_test_suite_name binding', async () => {
        expect(wrapper.vm.d_show_new_ag_test_suite_modal).toBe(false);
        expect(wrapper.find({ref: 'new_ag_test_suite_modal'}).exists()).toBe(false);

        wrapper.find('#add-ag-test-suite-button').trigger('click');
        await component.$nextTick();

        expect(wrapper.vm.d_show_new_ag_test_suite_modal).toBe(true);
        expect(wrapper.find({ref: 'new_ag_test_suite_modal'}).exists()).toBe(true);

        let d_new_ag_test_suite_name_input = wrapper.find({ref: 'new_ag_test_suite_name'});

        set_validated_input_text(d_new_ag_test_suite_name_input, "Suite I");
        expect(validated_input_is_valid(d_new_ag_test_suite_name_input)).toBe(true);
        expect(component.d_new_ag_test_suite_name).toEqual("Suite I");

        component.d_new_ag_test_suite_name = "Suite II";
        expect(get_validated_input_text(d_new_ag_test_suite_name_input)).toEqual("Suite II");
    });

    test.skip('Delete first suite in suites', async () => {
        expect(component.d_ag_test_suites.length).toEqual(3);

        AGTestSuite.notify_ag_test_suite_deleted(ag_suite_colors);
        await component.$nextTick();

        expect(component.d_ag_test_suites.length).toEqual(2);
    });

    test.skip('Delete active first suite in suites', async () => {
        expect(component.d_ag_test_suites.length).toEqual(3);

        component.update_active_item(ag_suite_colors);
        await component.$nextTick();

        AGTestSuite.notify_ag_test_suite_deleted(ag_suite_colors);
        await component.$nextTick();

        expect(component.d_ag_test_suites.length).toEqual(2);
        expect(component.d_active_ag_test_suite!.pk).toEqual(ag_suite_pets.pk);
    });

    test.skip('Delete last suite in suites', async () => {
        expect(component.d_ag_test_suites.length).toEqual(3);

        AGTestSuite.notify_ag_test_suite_deleted(ag_suite_beverages);
        await component.$nextTick();

        expect(component.d_ag_test_suites.length).toEqual(2);
    });

    test.skip('Delete active last suite in suites', async () => {
        expect(component.d_ag_test_suites.length).toEqual(3);

        component.update_active_item(ag_suite_beverages);
        await component.$nextTick();

        AGTestSuite.notify_ag_test_suite_deleted(ag_suite_beverages);
        await component.$nextTick();

        expect(component.d_ag_test_suites.length).toEqual(2);
        expect(component.d_active_ag_test_suite!.pk).toEqual(ag_suite_pets.pk);
    });

    test.skip('Delete middle suite in suites', async () => {
        expect(component.d_ag_test_suites.length).toEqual(3);

        AGTestSuite.notify_ag_test_suite_deleted(ag_suite_pets);
        await component.$nextTick();

        expect(component.d_ag_test_suites.length).toEqual(2);
    });

    test.skip('Delete active middle suite in suites', async () => {
        expect(component.d_ag_test_suites.length).toEqual(3);

        component.update_active_item(ag_suite_pets);
        await component.$nextTick();

        AGTestSuite.notify_ag_test_suite_deleted(ag_suite_pets);
        await component.$nextTick();

        expect(component.d_ag_test_suites.length).toEqual(2);
        expect(component.d_active_ag_test_suite!.pk).toEqual(ag_suite_beverages.pk);
    });

    test.skip('Delete all suites - active_suite gets set to null', async () => {
        expect(component.d_ag_test_suites.length).toEqual(3);

        component.update_active_item(ag_suite_colors);
        await component.$nextTick();

        AGTestSuite.notify_ag_test_suite_deleted(ag_suite_colors);
        await component.$nextTick();

        expect(component.d_ag_test_suites.length).toEqual(2);

        AGTestSuite.notify_ag_test_suite_deleted(ag_suite_pets);
        await component.$nextTick();

        expect(component.d_ag_test_suites.length).toEqual(1);

        AGTestSuite.notify_ag_test_suite_deleted(ag_suite_beverages);
        await component.$nextTick();

        expect(component.d_ag_test_suites.length).toEqual(0);
        expect(component.d_active_ag_test_suite).toBe(null);
    });

    // Case Related ------------------------------------------------------------------------------

    test.skip('Case changed', async () => {
        let updated_ag_case_bird = deep_copy(ag_case_bird, AGTestCase);
        updated_ag_case_bird.name = 'Updated name';

        expect(component.d_ag_test_suites[1]).toEqual(ag_suite_pets);
        expect(component.d_ag_test_suites[1].ag_test_cases.length).toEqual(2);
        expect(component.d_ag_test_suites[1].ag_test_cases[1]).toEqual(ag_case_bird);
        expect(component.d_ag_test_suites[1].ag_test_cases[1]).not.toEqual(updated_ag_case_bird);

        AGTestCase.notify_ag_test_case_changed(updated_ag_case_bird);
        await component.$nextTick();

        expect(component.d_ag_test_suites[1].ag_test_cases.length).toEqual(2);
        expect(component.d_ag_test_suites[1].ag_test_cases[1]).toEqual(updated_ag_case_bird);
    });

    test.skip('Clone an ag test case', async () => {
        let new_case = data_ut.make_ag_test_case(ag_suite_colors.pk);
        let new_case_name = "New Case Name";
        let clone_case_stub = sinon.stub(ag_case_blue, 'copy').callsFake(
            () => AGTestCase.notify_ag_test_case_created(new_case)
        );

        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases.length).toEqual(3);

        wrapper.vm.update_active_item(ag_case_blue);
        await wrapper.vm.$nextTick();

        wrapper.find('#ag-test-case-menu').trigger('click');
        await component.$nextTick();

        let ag_case_blue_panel = wrapper.findAll('#ag-test-case-panel').at(1);
        ag_case_blue_panel.find({ref: 'clone_ag_test_case_menu_item'}).trigger('click');
        await wrapper.vm.$nextTick();

        let ag_test_case_clone_name = ag_case_blue_panel.find({ref: 'ag_test_case_clone_name'});
        set_validated_input_text(ag_test_case_clone_name, new_case_name);

        ag_case_blue_panel.find('#clone-ag-test-case-form').trigger('submit');
        await wrapper.vm.$nextTick();

        expect(clone_case_stub.calledOnce).toBe(true);
        expect(clone_case_stub.firstCall.calledWith(new_case_name)).toBe(true);
        expect(clone_case_stub.calledOn(ag_case_blue)).toBe(true);
        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases.length).toEqual(4);
        expect(wrapper.vm.d_ag_test_suites[0].ag_test_cases[3]).toEqual(new_case);
    });

    test.skip('First case deleted', async () => {
        expect(component.d_ag_test_suites[0]).toEqual(ag_suite_colors);
        expect(component.d_ag_test_suites[0].ag_test_cases.length).toEqual(3);

        AGTestCase.notify_ag_test_case_deleted(ag_case_purple);
        await component.$nextTick();

        expect(component.d_ag_test_suites[0].ag_test_cases.length).toEqual(2);
    });

    test.skip('active first case deleted', async () => {
        component.update_active_item(ag_case_purple);
        await component.$nextTick();

        expect(component.d_active_ag_test_command).toEqual(ag_command_purple_1);
        expect(component.d_ag_test_suites[0]).toEqual(ag_suite_colors);
        expect(component.d_ag_test_suites[0].ag_test_cases.length).toEqual(3);

        AGTestCase.notify_ag_test_case_deleted(ag_case_purple);
        await component.$nextTick();

        expect(component.d_ag_test_suites[0].ag_test_cases.length).toEqual(2);
        expect(component.d_active_ag_test_command).toEqual(ag_command_blue_1);
    });

    test.skip('Middle case deleted', async () => {
        expect(component.d_ag_test_suites[0].ag_test_cases.length).toEqual(3);

        AGTestCase.notify_ag_test_case_deleted(ag_case_blue);
        await component.$nextTick();

        expect(component.d_ag_test_suites[1].ag_test_cases.length).toEqual(2);
    });

    test.skip('Active middle case deleted', async () => {
        expect(component.d_ag_test_suites[0].ag_test_cases.length).toEqual(3);

        component.update_active_item(ag_case_blue);
        await component.$nextTick();

        expect(component.d_active_ag_test_command).toEqual(ag_command_blue_1);

        AGTestCase.notify_ag_test_case_deleted(ag_case_blue);
        await component.$nextTick();

        expect(component.d_ag_test_suites[0].ag_test_cases.length).toEqual(2);
        expect(component.d_active_ag_test_command).toEqual(ag_command_green_1);
    });

    test.skip('last case deleted', async () => {
        expect(component.d_ag_test_suites[0]).toEqual(ag_suite_colors);
        expect(component.d_ag_test_suites[0].ag_test_cases.length).toEqual(3);

        AGTestCase.notify_ag_test_case_deleted(ag_case_green);
        await component.$nextTick();

        expect(component.d_ag_test_suites[0].ag_test_cases.length).toEqual(2);
    });

    test.skip('active last case deleted', async () => {
        component.update_active_item(ag_case_green);
        await component.$nextTick();

        expect(component.d_active_ag_test_command).toEqual(ag_command_green_1);
        expect(component.d_ag_test_suites[0]).toEqual(ag_suite_colors);
        expect(component.d_ag_test_suites[0].ag_test_cases.length).toEqual(3);

        AGTestCase.notify_ag_test_case_deleted(ag_case_green);
        await component.$nextTick();

        expect(component.d_ag_test_suites[1].ag_test_cases.length).toEqual(2);
        expect(component.d_active_ag_test_command).toEqual(ag_command_blue_1);
    });

    test.skip('Delete all cases in suite - suite becomes active', async () => {
        component.update_active_item(ag_case_dog);
        await component.$nextTick();

        expect(component.d_active_ag_test_command).toEqual(ag_command_dog_1);
        expect(component.d_ag_test_suites[1]).toEqual(ag_suite_pets);
        expect(component.d_ag_test_suites[1].ag_test_cases.length).toEqual(2);

        AGTestCase.notify_ag_test_case_deleted(ag_case_dog);
        await component.$nextTick();

        expect(component.d_ag_test_suites[1].ag_test_cases.length).toEqual(1);
        expect(component.d_active_ag_test_suite).toBeNull();
        expect(component.d_active_ag_test_command).toEqual(ag_command_bird_1);

        AGTestCase.notify_ag_test_case_deleted(ag_case_bird);
        await component.$nextTick();

        expect(component.d_ag_test_suites[1].ag_test_cases.length).toEqual(0);
        expect(component.d_active_ag_test_suite).toEqual(ag_suite_pets);
    });

    // Command Related ---------------------------------------------------------------------------

    test.skip('Command created', async () => {
        let ag_command_blue_2 = data_ut.make_ag_test_command(ag_case_blue.pk);

        expect(component.d_ag_test_suites[0].ag_test_cases[1].ag_test_commands.length).toEqual(1);

        AGTestCommand.notify_ag_test_command_created(ag_command_blue_2);
        await component.$nextTick();

        expect(component.d_ag_test_suites[0].ag_test_cases[1].ag_test_commands.length).toEqual(2);
        expect(component.d_active_ag_test_command).toEqual(ag_command_blue_2);
    });

    test.skip('Command changed', async () => {
        let updated_ag_command_purple_2 = deep_copy(ag_command_purple_2, AGTestCommand);
        updated_ag_command_purple_2.name = 'Updated name';

        expect(component.d_ag_test_suites[0].ag_test_cases[0].ag_test_commands.length).toEqual(2);
        expect(component.d_ag_test_suites[0].ag_test_cases[0].ag_test_commands[0]).toEqual(
            ag_command_purple_1
        );
        expect(ag_command_purple_2).not.toEqual(updated_ag_command_purple_2);

        AGTestCommand.notify_ag_test_command_changed(updated_ag_command_purple_2);
        await component.$nextTick();

        expect(component.d_ag_test_suites[0].ag_test_cases[0].ag_test_commands.length).toEqual(2);
        expect(component.d_ag_test_suites[0].ag_test_cases[0].ag_test_commands[1]).toEqual(
            updated_ag_command_purple_2
        );
    });

    test.skip('First command deleted in case', async () => {
        expect(component.d_ag_test_suites[0].ag_test_cases[2].ag_test_commands.length).toEqual(3);

        AGTestCommand.notify_ag_test_command_deleted(ag_command_green_1);
        await component.$nextTick();

        expect(component.d_ag_test_suites[0].ag_test_cases[2].ag_test_commands.length).toEqual(2);
    });

    test.skip('active First command deleted in case', async () => {
        expect(component.d_ag_test_suites[0].ag_test_cases[2].ag_test_commands.length).toEqual(3);

        component.update_active_item(ag_command_green_1);
        await component.$nextTick();

        AGTestCommand.notify_ag_test_command_deleted(ag_command_green_1);
        await component.$nextTick();

        expect(component.d_ag_test_suites[0].ag_test_cases[2].ag_test_commands.length).toEqual(2);
        expect(component.d_active_ag_test_command).toEqual(ag_command_green_2);
    });

    test.skip('Middle command deleted in case',
         async () => {
        expect(component.d_ag_test_suites[0].ag_test_cases[2].ag_test_commands.length).toEqual(3);

        AGTestCommand.notify_ag_test_command_deleted(ag_command_green_2);
        await component.$nextTick();

        expect(component.d_ag_test_suites[0].ag_test_cases[2].ag_test_commands.length).toEqual(2);
    });

    test.skip('Active middle command deleted in case', async () => {
        expect(component.d_ag_test_suites[0].ag_test_cases[2].ag_test_commands.length).toEqual(3);

        component.update_active_item(ag_command_green_2);
        await component.$nextTick();

        AGTestCommand.notify_ag_test_command_deleted(ag_command_green_2);
        await component.$nextTick();

        expect(component.d_ag_test_suites[0].ag_test_cases[2].ag_test_commands.length).toEqual(2);
        expect(component.d_active_ag_test_command).toEqual(ag_command_green_3);
    });

    test.skip('Last command deleted in case', async () => {
        expect(component.d_ag_test_suites[0].ag_test_cases[2].ag_test_commands.length).toEqual(3);

        AGTestCommand.notify_ag_test_command_deleted(ag_command_green_3);
        await component.$nextTick();

        expect(component.d_ag_test_suites[0].ag_test_cases[2].ag_test_commands.length).toEqual(2);
    });

    test.skip('Active last command deleted in case', async () => {
        expect(component.d_ag_test_suites[0].ag_test_cases[2].ag_test_commands.length).toEqual(3);

        component.update_active_item(ag_command_green_3);
        await component.$nextTick();

        AGTestCommand.notify_ag_test_command_deleted(ag_command_green_3);
        await component.$nextTick();

        expect(component.d_ag_test_suites[0].ag_test_cases[2].ag_test_commands.length).toEqual(2);
        expect(component.d_active_ag_test_command).toEqual(ag_command_green_2);
    });

    // Visiting Previous Test Case ---------------------------------------------------------------

    test.skip('prev_ag_test_case_is_available (false) - d_active_ag_test_suite is null',
              async () => {
        expect(component.prev_ag_test_case_is_available).toBe(false);
        expect(wrapper.findAll('#prev-ag-test-case-button').length).toEqual(0);
    });

    test.skip('prev_ag_test_case_is_available (false) - d_active_ag_test_command is null',
              async () => {
        component.update_active_item(ag_suite_colors);
        await component.$nextTick();

        expect(component.prev_ag_test_case_is_available).toBe(false);
        expect(wrapper.findAll('#prev-ag-test-case-button').length).toEqual(0);
    });

    test.skip('prev_ag_test_case_is_available (false) - suite index is 0, case index is 0',
         async () => {
        component.update_active_item(ag_case_purple);
        await component.$nextTick();

        expect(component.prev_ag_test_case_is_available).toBe(false);
        expect(wrapper.find('#prev-ag-test-case-button').is('[disabled]')).toBe(true);
    });

    test.skip('prev_ag_test_case_is_available (false) - suite index != 0, case index is 0, ' +
         'prev suite doesnt have any cases',
         async () => {
        AGTestCase.notify_ag_test_case_deleted(ag_case_dog);
        await component.$nextTick();

        AGTestCase.notify_ag_test_case_deleted(ag_case_bird);
        await component.$nextTick();

        component.update_active_item(ag_command_sprite_1);
        await component.$nextTick();

        expect(component.prev_ag_test_case_is_available).toBe(false);
        expect(wrapper.find('#prev-ag-test-case-button').is('[disabled]')).toBe(true);
    });

    test.skip("prev_ag_test_case_is_available (false) - suite index != 0, case index is 0, " +
         "prev suite's last case doesnt have enough commands",
         async () => {
        let ag_case_cat = data_ut.make_ag_test_case(ag_suite_pets.pk);

        AGTestCase.notify_ag_test_case_created(ag_case_cat);
        await component.$nextTick();

        component.update_active_item(ag_case_sprite);
        await component.$nextTick();

        expect(component.prev_ag_test_case_is_available).toBe(false);
        expect(wrapper.find('#prev-ag-test-case-button').is('[disabled]')).toBe(true);
    });

    test.skip("prev_ag_test_case_is_available (true) - suite index != 0, case index is 0, " +
         "prev suite's last case has enough commands",
         async () => {
        component.update_active_item(ag_command_sprite_1);
        await component.$nextTick();

        expect(component.prev_ag_test_case_is_available).toBe(true);
        expect(wrapper.find('#prev-ag-test-case-button').is('[disabled]')).toBe(false);
    });

    test.skip('prev_ag_test_case_is_available (false) - suite index is 0, case index != 0, ' +
         'prev case does not have enough commands',
         async () => {
        component.update_active_item(ag_command_green_3);
        await component.$nextTick();

        expect(component.prev_ag_test_case_is_available).toBe(false);
        expect(wrapper.find('#prev-ag-test-case-button').is('[disabled]')).toBe(true);
    });

    test.skip('prev_ag_test_case_is_available (true) - suite index is 0, case index != 0, prev ' +
         'case has enough commands',
         async () => {
        let ag_command_blue_2 = data_ut.make_ag_test_command(ag_case_blue.pk);

        AGTestCommand.notify_ag_test_command_created(ag_command_blue_2);
        await component.$nextTick();

        component.update_active_item(ag_command_green_2);
        await component.$nextTick();

        expect(component.prev_ag_test_case_is_available).toBe(true);
        expect(wrapper.find('#prev-ag-test-case-button').is('[disabled]')).toBe(false);
    });

    test.skip('go_to_prev_command - prev case in same suite', async () => {
        component.update_active_item(ag_command_blue_1);
        await component.$nextTick();

        expect(component.d_active_ag_test_command).toEqual(ag_command_blue_1);

        expect(wrapper.find('#prev-ag-test-case-button').is('[disabled]')).toBe(false);
        wrapper.find('#prev-ag-test-case-button').trigger('click');
        await component.$nextTick();

        expect(component.d_active_ag_test_command).toEqual(ag_command_purple_1);
    });

    test.skip('go_to_prev_command - last case in previous suite', async () => {
        component.update_active_item(ag_command_dog_1);
        await component.$nextTick();

        expect(component.d_active_ag_test_command).toEqual(ag_command_dog_1);

        expect(wrapper.find('#prev-ag-test-case-button').is('[disabled]')).toBe(false);
        wrapper.find('#prev-ag-test-case-button').trigger('click');
        await component.$nextTick();

        expect(component.d_active_ag_test_command).toEqual(ag_command_green_1);
    });

    // Visiting Next Test Case -------------------------------------------------------------------

    test.skip('next_ag_test_case_is_available (false) - d_active_ag_test_suite is null',
              async () => {
        expect(component.next_ag_test_case_is_available).toBe(false);
        expect(wrapper.findAll('#next-ag-test-case-button').length).toEqual(0);
    });

    test.skip('next_ag_test_case_is_available (false) - d_active_ag_test_command is null',
              async () => {
        component.update_active_item(ag_suite_colors);
        await component.$nextTick();

        expect(component.next_ag_test_case_is_available).toBe(false);
        expect(wrapper.findAll('#next-ag-test-case-button').length).toEqual(0);
    });

    test.skip('next_ag_test_case_is_available (false) - suite index is 0, case index is 0, ' +
         'next case doesnt have enough commands',
         async () => {
        component.update_active_item(ag_command_purple_2);
        await component.$nextTick();

        expect(component.next_ag_test_case_is_available).toBe(false);
        expect(wrapper.find('#next-ag-test-case-button').is('[disabled]')).toBe(true);
    });

    test.skip('next_ag_test_case_is_available (true) - suite index is 0, case index is 0, next ' +
         'case has enough commands',
         async () => {
        component.update_active_item(ag_command_purple_1);
        await component.$nextTick();

        expect(component.next_ag_test_case_is_available).toBe(true);
        expect(wrapper.find('#next-ag-test-case-button').is('[disabled]')).toBe(false);
    });

    test.skip('next_ag_test_case_is_available (false) - suite is the last suite, case is the ' +
         'last case in the suite',
         async () => {
        component.update_active_item(ag_command_sprite_1);
        await component.$nextTick();

        expect(component.next_ag_test_case_is_available).toBe(false);
        expect(wrapper.find('#next-ag-test-case-button').is('[disabled]')).toBe(true);
    });

    test.skip('next_ag_test_case_is_available (false) - suite is not the last suite, ' +
         'case is the last case in the suite, next suite doesnt have any cases',
         async () => {
        let new_suite = data_ut.make_ag_test_suite(project.pk);

        AGTestSuite.notify_ag_test_suite_created(new_suite);
        await component.$nextTick();

        component.update_active_item(ag_command_sprite_1);
        await component.$nextTick();

        expect(component.next_ag_test_case_is_available).toBe(false);
        expect(wrapper.find('#next-ag-test-case-button').is('[disabled]')).toBe(true);
    });

    test.skip('next_ag_test_case_is_available (false) - suite is not the last suite, case is ' +
         'the last case in the suite, first case in next suite doesnt have enough commands',
         async () => {
        component.update_active_item(ag_command_green_2);
        await component.$nextTick();

        expect(component.next_ag_test_case_is_available).toBe(false);
        expect(wrapper.find('#next-ag-test-case-button').is('[disabled]')).toBe(true);
    });

    test.skip('next_ag_test_case_is_available (true) - suite is not the last suite, case is' +
         'the last case in the suite, first case in the next suite has enough commands',
         async () => {
        component.update_active_item(ag_command_green_1);
        await component.$nextTick();

        expect(component.next_ag_test_case_is_available).toBe(true);
        expect(wrapper.find('#next-ag-test-case-button').is('[disabled]')).toBe(false);
    });

    test.skip('go_to_next_command - next case in same suite', async () => {
        component.update_active_item(ag_command_dog_1);
        await component.$nextTick();

        expect(component.d_active_ag_test_command).toEqual(ag_command_dog_1);

        expect(wrapper.find('#next-ag-test-case-button').is('[disabled]')).toBe(false);
        wrapper.find('#next-ag-test-case-button').trigger('click');
        await component.$nextTick();

        expect(component.d_active_ag_test_command).toEqual(ag_command_bird_1);
    });

    test.skip('go_to_next_command - first case in next suite', async () => {
        component.update_active_item(ag_command_green_1);
        await component.$nextTick();

        expect(component.d_active_ag_test_command).toEqual(ag_command_green_1);

        expect(wrapper.find('#next-ag-test-case-button').is('[disabled]')).toBe(false);
        wrapper.find('#next-ag-test-case-button').trigger('click');
        await component.$nextTick();

        expect(component.d_active_ag_test_command).toEqual(ag_command_dog_1);
    });

    test.skip('active_level_is_suite', async () => {
        expect(component.active_level_is_suite).toBe(false);

        component.update_active_item(ag_suite_colors);
        await component.$nextTick();
        expect(component.active_level_is_suite).toBe(true);

        component.update_active_item(ag_case_green);
        await component.$nextTick();
        expect(component.active_level_is_suite).toBe(false);

        component.update_active_item(ag_command_green_1);
        await component.$nextTick();
        expect(component.active_level_is_suite).toBe(false);
    });

    test.skip('active_level_is_command', async () => {
        expect(component.active_level_is_command).toBe(false);

        component.update_active_item(ag_suite_colors);
        await component.$nextTick();
        expect(component.active_level_is_command).toBe(false);

        component.update_active_item(ag_case_green);
        await component.$nextTick();
        expect(component.active_level_is_command).toBe(true);

        component.update_active_item(ag_command_green_1);
        await component.$nextTick();
        expect(component.active_level_is_command).toBe(true);
    });
});
