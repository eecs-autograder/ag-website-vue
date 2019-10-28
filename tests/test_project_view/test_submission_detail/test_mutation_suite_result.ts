import { mount, Wrapper } from '@vue/test-utils';

import * as ag_cli from 'ag-client-typescript';
import * as sinon from 'sinon';

import MutationSuiteResult from '@/components/project_view/submission_detail/mutation_suite_result.vue';

import * as data_ut from '@/tests/data_utils';
let group: ag_cli.Group;
let mutation_test_suite_result: ag_cli.MutationTestSuiteResultFeedback;
let submission: ag_cli.Submission;
let user: ag_cli.User;

let get_setup_stdout_stub: sinon.SinonStub;
let get_setup_stderr_stub: sinon.SinonStub;
let get_student_test_names_stdout_stub: sinon.SinonStub;
let get_student_test_names_stderr_stub: sinon.SinonStub;
let get_validity_check_stdout_stub: sinon.SinonStub;
let get_validity_check_stderr_stub: sinon.SinonStub;
let get_grade_buggy_impls_stdout_stub: sinon.SinonStub;
let get_grade_buggy_impls_stderr_stub: sinon.SinonStub;
let get_output_size_stub: sinon.SinonStub;

let setup_stdout_content: string;
let setup_stderr_content: string;
let student_test_names_stdout_content: string;
let student_test_names_stderr_content: string;
let validity_check_stdout_content: string;
let validity_check_stderr_content: string;
let grade_buggy_impls_stdout_content: string;
let grade_buggy_impls_stderr_content: string;

beforeEach(() => {
    user = data_ut.make_user();
    group = data_ut.make_group(1, 1, {member_names: [user.username]});
    submission = data_ut.make_submission(group);
    mutation_test_suite_result = data_ut.make_mutation_test_suite_result_feedback(1);

    setup_stdout_content = "setup stdout content";
    setup_stderr_content = "setup stderr content";
    student_test_names_stdout_content = "student test names stdout content";
    student_test_names_stderr_content = "student test names stderr content";
    validity_check_stdout_content = "validity check stdout content";
    validity_check_stderr_content = "validity check stderr content";
    grade_buggy_impls_stdout_content = "grade buggy impls stdout content";
    grade_buggy_impls_stderr_content = "grade buggy impls stderr content";

    get_setup_stdout_stub = sinon.stub(
        ag_cli.ResultOutput, 'get_mutation_test_suite_result_setup_stdout'
    ).returns(Promise.resolve(setup_stdout_content));

    get_setup_stderr_stub = sinon.stub(
        ag_cli.ResultOutput, 'get_mutation_test_suite_result_setup_stderr'
    ).returns(Promise.resolve(setup_stderr_content));

    get_student_test_names_stdout_stub = sinon.stub(
        ag_cli.ResultOutput, 'get_mutation_test_suite_result_get_student_test_names_stdout'
    ).returns(Promise.resolve(student_test_names_stdout_content));

    get_student_test_names_stderr_stub = sinon.stub(
        ag_cli.ResultOutput, 'get_mutation_test_suite_result_get_student_test_names_stderr'
    ).returns(Promise.resolve(student_test_names_stderr_content));

    get_validity_check_stdout_stub = sinon.stub(
        ag_cli.ResultOutput, 'get_mutation_test_suite_result_validity_check_stdout'
    ).returns(Promise.resolve(validity_check_stdout_content));

    get_validity_check_stderr_stub = sinon.stub(
        ag_cli.ResultOutput, 'get_mutation_test_suite_result_validity_check_stderr'
    ).returns(Promise.resolve(validity_check_stderr_content));

    get_grade_buggy_impls_stdout_stub = sinon.stub(
        ag_cli.ResultOutput, 'get_mutation_test_suite_result_grade_buggy_impls_stdout'
    ).returns(Promise.resolve(grade_buggy_impls_stdout_content));

    get_grade_buggy_impls_stderr_stub = sinon.stub(
        ag_cli.ResultOutput, 'get_mutation_test_suite_result_grade_buggy_impls_stderr'
    ).returns(Promise.resolve(grade_buggy_impls_stderr_content));

    get_output_size_stub = sinon.stub(
        ag_cli.ResultOutput, 'get_mutation_test_suite_result_output_size'
    ).returns(Promise.resolve(
        {
            setup_stdout_size: 20,
            setup_stderr_size: 20,
            get_student_test_names_stdout_size: 20,
            get_student_test_names_stderr_size: 20,
            validity_check_stdout_size: 20,
            validity_check_stderr_size: 20,
            grade_buggy_impls_stdout_size: 20,
            grade_buggy_impls_stderr_size: 20
        }
    ));
});

afterEach(() => {
    sinon.restore();
});

describe('show_setup_fieldset getter', () => {
    let wrapper: Wrapper<MutationSuiteResult>;

    test('show_setup_fieldset - show_setup_stdout === false', async () => {
        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });

        for (let i = 0; i < 9; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.mutation_test_suite_result.fdbk_settings.show_setup_stdout).toBe(false);
        expect(wrapper.vm.mutation_test_suite_result.fdbk_settings.show_setup_stderr).toBe(false);
        expect(wrapper.vm.mutation_test_suite_result.setup_return_code).toBeNull();
        expect(wrapper.vm.mutation_test_suite_result.setup_timed_out).toBeNull();
        expect(wrapper.vm.show_setup_fieldset).toBe(false);
        expect(wrapper.find('#setup-section').exists()).toBe(false);
    });

    test('show_setup_fieldset - show_setup_stdout === true', async () => {
        mutation_test_suite_result!.fdbk_settings.show_setup_stdout = true;

        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });

        for (let i = 0; i < 9; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.mutation_test_suite_result.fdbk_settings.show_setup_stdout).toBe(true);
        expect(wrapper.vm.mutation_test_suite_result.fdbk_settings.show_setup_stderr).toBe(false);
        expect(wrapper.vm.mutation_test_suite_result.setup_return_code).toBeNull();
        expect(wrapper.vm.mutation_test_suite_result.setup_timed_out).toBeNull();
        expect(wrapper.vm.show_setup_fieldset).toBe(true);
        expect(wrapper.find('#setup-section').exists()).toBe(true);
    });

    test('show_setup_fieldset - show_setup_stderr === true', async () => {
        mutation_test_suite_result!.fdbk_settings.show_setup_stderr = true;

        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });

        for (let i = 0; i < 9; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.mutation_test_suite_result.fdbk_settings.show_setup_stdout).toBe(false);
        expect(wrapper.vm.mutation_test_suite_result.fdbk_settings.show_setup_stderr).toBe(true);
        expect(wrapper.vm.mutation_test_suite_result.setup_return_code).toBeNull();
        expect(wrapper.vm.mutation_test_suite_result.setup_timed_out).toBeNull();
        expect(wrapper.vm.show_setup_fieldset).toBe(true);
        expect(wrapper.find('#setup-section').exists()).toBe(true);
    });

    test('show_setup_fieldset - setup_return_code !== null', async () => {
        mutation_test_suite_result!.setup_return_code = 0;

        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });

        for (let i = 0; i < 9; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.mutation_test_suite_result.fdbk_settings.show_setup_stdout).toBe(false);
        expect(wrapper.vm.mutation_test_suite_result.fdbk_settings.show_setup_stderr).toBe(false);
        expect(wrapper.vm.mutation_test_suite_result.setup_return_code).not.toBeNull();
        expect(wrapper.vm.mutation_test_suite_result.setup_timed_out).toBeNull();
        expect(wrapper.vm.show_setup_fieldset).toBe(true);
        expect(wrapper.find('#setup-section').exists()).toBe(true);
    });

    test('show_setup_fieldset - setup_timed_out === false', async () => {
        mutation_test_suite_result!.setup_timed_out = false;

        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });

        for (let i = 0; i < 9; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.mutation_test_suite_result.fdbk_settings.show_setup_stdout).toBe(false);
        expect(wrapper.vm.mutation_test_suite_result.fdbk_settings.show_setup_stderr).toBe(false);
        expect(wrapper.vm.mutation_test_suite_result.setup_return_code).toBeNull();
        expect(wrapper.vm.mutation_test_suite_result.setup_timed_out).toBe(false);
        expect(wrapper.vm.show_setup_fieldset).toBe(false);
        expect(wrapper.find('#setup-section').exists()).toBe(false);
    });

    test('show_setup_fieldset - setup_timed_out === true', async () => {
        mutation_test_suite_result!.setup_timed_out = true;

        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });

        for (let i = 0; i < 9; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.mutation_test_suite_result.fdbk_settings.show_setup_stdout).toBe(false);
        expect(wrapper.vm.mutation_test_suite_result.fdbk_settings.show_setup_stderr).toBe(false);
        expect(wrapper.vm.mutation_test_suite_result.setup_return_code).toBeNull();
        expect(wrapper.vm.mutation_test_suite_result.setup_timed_out).toBe(true);
        expect(wrapper.vm.show_setup_fieldset).toBe(true);
        expect(wrapper.find('#setup-section').exists()).toBe(true);
    });
});

describe('show_buggy_implementations_fieldset getter', async () => {
    let wrapper: Wrapper<MutationSuiteResult>;

    test('show_buggy_implementations_fieldset - false', async () => {
        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });

        for (let i = 0; i < 9; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(
            wrapper.vm.mutation_test_suite_result.fdbk_settings.show_grade_buggy_impls_stdout
        ).toBe(false);
        expect(
            wrapper.vm.mutation_test_suite_result.fdbk_settings.show_grade_buggy_impls_stderr
        ).toBe(false);
        expect(wrapper.vm.mutation_test_suite_result.num_bugs_exposed).toBeNull();
        expect(wrapper.vm.show_buggy_implementations_fieldset).toBe(false);
        expect(wrapper.find('#buggy-implementations-section').exists()).toBe(false);
    });

    test('show_buggy_implementations_fieldset - show_grade_buggy_impls_stdout === true',
         async () => {
        mutation_test_suite_result!.fdbk_settings.show_grade_buggy_impls_stdout = true;
        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });

        for (let i = 0; i < 9; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(
            wrapper.vm.mutation_test_suite_result.fdbk_settings.show_grade_buggy_impls_stdout
        ).toBe(true);
        expect(
            wrapper.vm.mutation_test_suite_result.fdbk_settings.show_grade_buggy_impls_stderr
        ).toBe(false);
        expect(wrapper.vm.mutation_test_suite_result.num_bugs_exposed).toBeNull();
        expect(wrapper.vm.show_buggy_implementations_fieldset).toBe(true);
        expect(wrapper.find('#buggy-implementations-section').exists()).toBe(true);
    });

    test('show_buggy_implementations_fieldset - show_grade_buggy_impls_stdout === true',
         async () => {
        mutation_test_suite_result!.fdbk_settings.show_grade_buggy_impls_stderr = true;
        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });

        for (let i = 0; i < 9; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(
            wrapper.vm.mutation_test_suite_result.fdbk_settings.show_grade_buggy_impls_stdout
        ).toBe(false);
        expect(
            wrapper.vm.mutation_test_suite_result.fdbk_settings.show_grade_buggy_impls_stderr
        ).toBe(true);
        expect(wrapper.vm.mutation_test_suite_result.num_bugs_exposed).toBeNull();
        expect(wrapper.vm.show_buggy_implementations_fieldset).toBe(true);
        expect(wrapper.find('#buggy-implementations-section').exists()).toBe(true);
    });

    test('show_buggy_implementations_fieldset - num_bugs_exposed !== null', async () => {
        mutation_test_suite_result!.num_bugs_exposed = 1;
        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });

        for (let i = 0; i < 9; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(
            wrapper.vm.mutation_test_suite_result.fdbk_settings.show_grade_buggy_impls_stdout
        ).toBe(false);
        expect(
            wrapper.vm.mutation_test_suite_result.fdbk_settings.show_grade_buggy_impls_stderr
        ).toBe(false);
        expect(wrapper.vm.mutation_test_suite_result.num_bugs_exposed).toEqual(1);
        expect(wrapper.vm.show_buggy_implementations_fieldset).toBe(true);
        expect(wrapper.find('#buggy-implementations-section').exists()).toBe(true);
    });
});

describe('MutationSuiteResult setup section tests', () => {
    let wrapper: Wrapper<MutationSuiteResult>;

    test('Setup command name === null', async () => {
        mutation_test_suite_result.setup_return_code = 0;

        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 9; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.mutation_test_suite_result!.setup_command_name).toBeNull();
        expect(wrapper.find('#setup-command-name').text()).toContain("Setup");
    });

    test('Setup command name !== null', async () => {
        mutation_test_suite_result.setup_return_code = 0;
        mutation_test_suite_result.setup_command_name = "Compile";

        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 9; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.mutation_test_suite_result!.setup_command_name).toEqual("Compile");
        expect(wrapper.find('#setup-command-name').text()).toContain("Compile");
    });

    test('setup_timed_out === true', async () => {
        mutation_test_suite_result.setup_timed_out = true;
        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 9; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.find('#setup-return-code').find(
            '.timed-out-icon'
        ).exists()).toBe(true);
    });

    test('setup_return_code === 0', async () => {
        mutation_test_suite_result.setup_return_code = 0;
        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 9; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.find('#setup-return-code').find(
            '.correct-icon'
        ).exists()).toBe(true);
        expect(wrapper.find('#setup-return-code').text()).toContain("0");
    });

    test('setup_return_code === 1', async () => {
        mutation_test_suite_result.setup_return_code = 1;
        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 9; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.find('#setup-return-code').find(
            '.incorrect-icon'
        ).exists()).toBe(true);
        expect(wrapper.find('#setup-return-code').text()).toContain("1");
    });

    test('setup-stdout-section is visible when show_setup_stdout === true ' +
         '&& d_setup_stdout_content === null',
         async () => {
        mutation_test_suite_result.setup_return_code = 1;
        mutation_test_suite_result.fdbk_settings.show_setup_stdout = true;

        get_output_size_stub.onFirstCall().returns(
            Promise.resolve(
                {
                setup_stdout_size: null,
                setup_stderr_size: 20,
                get_student_test_names_stdout_size: 20,
                get_student_test_names_stderr_size: 20,
                validity_check_stdout_size: 20,
                validity_check_stderr_size: 20,
                grade_buggy_impls_stdout_size: 20,
                grade_buggy_impls_stderr_size: 20
            }
        ));

        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 9; ++i) {
            await wrapper.vm.$nextTick();
        }
        expect(wrapper.vm.mutation_test_suite_result!.setup_return_code).toBe(1);
        expect(get_output_size_stub.calledOnce).toBe(true);
        expect(get_setup_stdout_stub.callCount).toEqual(0);
        expect(wrapper.vm.d_setup_stdout_content).toBeNull();
        expect(wrapper.vm.mutation_test_suite_result!.fdbk_settings.show_setup_stdout).toBe(true);
        expect(wrapper.find('#setup-stdout-section').text()).toContain("No output");
    });

    test('setup-stdout-section is visible when show_setup_stdout === true' +
         ' && d_setup_stdout_content !== null',
         async () => {
        mutation_test_suite_result.setup_return_code = 1;
        mutation_test_suite_result.fdbk_settings.show_setup_stdout = true;

        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 9; ++i) {
            await wrapper.vm.$nextTick();
        }
        expect(wrapper.vm.mutation_test_suite_result!.setup_return_code).toBe(1);
        expect(get_output_size_stub.calledOnce).toBe(true);
        expect(get_setup_stdout_stub.calledOnce).toBe(true);
        expect(wrapper.vm.d_setup_stdout_content).toEqual(Promise.resolve(setup_stdout_content));
        expect(wrapper.vm.mutation_test_suite_result!.fdbk_settings.show_setup_stdout).toBe(true);
        expect(wrapper.find('#setup-stdout-section').text()).toContain(setup_stdout_content);
    });

    test('setup-stdout-section is not visible when show_setup_stdout === false', async () => {
        mutation_test_suite_result.setup_return_code = 1;
        mutation_test_suite_result.fdbk_settings.show_setup_stdout = false;
        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 9; ++i) {
            await wrapper.vm.$nextTick();
        }
        expect(wrapper.vm.mutation_test_suite_result!.setup_return_code).toBe(1);
        expect(wrapper.vm.mutation_test_suite_result!.fdbk_settings.show_setup_stdout).toBe(
            false
        );
        expect(wrapper.find('#setup-stdout-section').exists()).toBe(false);
    });

    test('setup-stderr-section is not visible when show_setup_stderr === false', async () => {
        mutation_test_suite_result.setup_return_code = 1;
        mutation_test_suite_result.fdbk_settings.show_setup_stderr = false;
        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 9; ++i) {
            await wrapper.vm.$nextTick();
        }
        expect(wrapper.vm.mutation_test_suite_result!.setup_return_code).toBe(1);
        expect(wrapper.vm.mutation_test_suite_result!.fdbk_settings.show_setup_stderr).toBe(
            false
        );
        expect(wrapper.find('#setup-stderr-section').exists()).toBe(false);
    });

    test('show_setup_stderr === true, and setup_stderr_content === null', async () => {
        mutation_test_suite_result.setup_return_code = 1;
        mutation_test_suite_result.fdbk_settings.show_setup_stderr = true;

        get_output_size_stub.onFirstCall().returns(Promise.resolve(
            {
                setup_stdout_size: 20,
                setup_stderr_size: null,
                get_student_test_names_stdout_size: 20,
                get_student_test_names_stderr_size: 20,
                validity_check_stdout_size: 20,
                validity_check_stderr_size: 20,
                grade_buggy_impls_stdout_size: 20,
                grade_buggy_impls_stderr_size: 20
            }
        ));

        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 9; ++i) {
            await wrapper.vm.$nextTick();
        }
        expect(wrapper.vm.mutation_test_suite_result!.setup_return_code).toBe(1);
        expect(wrapper.vm.mutation_test_suite_result!.fdbk_settings.show_setup_stderr).toBe(true);
        expect(get_output_size_stub.calledOnce).toBe(true);
        expect(get_setup_stderr_stub.callCount).toEqual(0);
        expect(wrapper.vm.d_setup_stderr_content).toBeNull();
        expect(wrapper.find('#setup-stderr-section').text()).toContain("No output");
    });

    test('show_setup_stderr === true, and setup_stderr_content !== null', async () => {
        mutation_test_suite_result.setup_return_code = 1;
        mutation_test_suite_result.fdbk_settings.show_setup_stderr = true;

        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 9; ++i) {
            await wrapper.vm.$nextTick();
        }
        expect(wrapper.vm.mutation_test_suite_result!.setup_return_code).toBe(1);
        expect(wrapper.vm.mutation_test_suite_result!.fdbk_settings.show_setup_stderr).toBe(true);
        expect(get_output_size_stub.calledOnce).toBe(true);
        expect(get_setup_stderr_stub.calledOnce).toBe(true);
        expect(wrapper.vm.d_setup_stderr_content).toEqual(Promise.resolve(setup_stderr_content));
        expect(wrapper.find('#setup-stderr-section').text()).toContain(
            setup_stderr_content
        );
    });
});

describe('MutationSuiteResult buggy implementations section tests', () => {
    let wrapper: Wrapper<MutationSuiteResult>;

    test('num_bugs_exposed === null', async () => {
        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 9; ++i) {
            await wrapper.vm.$nextTick();
        }
        expect(wrapper.vm.mutation_test_suite_result!.num_bugs_exposed).toBeNull();
        expect(wrapper.find('#num-bugs-exposed-section').exists()).toBe(false);
    });

    test('num_bugs_exposed !== null', async () => {
        mutation_test_suite_result.setup_return_code = 1;
        mutation_test_suite_result.num_bugs_exposed = 5;

        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 9; ++i) {
            await wrapper.vm.$nextTick();
        }
        expect(wrapper.vm.mutation_test_suite_result!.num_bugs_exposed).toBe(5);
        expect(wrapper.find('#num-bugs-exposed-section').text()).toContain('5');
    });

    test('bugs_exposed_fdbk_level === exposed_bug_names', async () => {
        mutation_test_suite_result.fdbk_settings.bugs_exposed_fdbk_level
            = ag_cli.BugsExposedFeedbackLevel.exposed_bug_names;
        mutation_test_suite_result.num_bugs_exposed = 2;
        mutation_test_suite_result.bugs_exposed = ["bug_1", "bug_2"];

        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 9; ++i) {
            await wrapper.vm.$nextTick();
        }
        expect(
            wrapper.vm.mutation_test_suite_result!.fdbk_settings.bugs_exposed_fdbk_level
        ).toEqual(ag_cli.BugsExposedFeedbackLevel.exposed_bug_names);
        expect(wrapper.find('#list-of-bugs').text()).toContain("bug_1");
        expect(wrapper.find('#list-of-bugs').text()).toContain("bug_2");
    });

    test('bugs_exposed_fdbk_level !== exposed_bug_names', async () => {
        mutation_test_suite_result.fdbk_settings.bugs_exposed_fdbk_level
            = ag_cli.BugsExposedFeedbackLevel.num_bugs_exposed;
        mutation_test_suite_result.num_bugs_exposed = 2;

        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 9; ++i) {
            await wrapper.vm.$nextTick();
        }
        expect(
            wrapper.vm.mutation_test_suite_result!.fdbk_settings.bugs_exposed_fdbk_level
        ).toEqual(ag_cli.BugsExposedFeedbackLevel.num_bugs_exposed);
        expect(wrapper.find('#list-of-bug-names-exposed').exists()).toBe(false);
    });

    test('show_grade_buggy_impls_stdout === false && show_grade_buggy_impls_stderr === false',
         async () => {
        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 9; ++i) {
            await wrapper.vm.$nextTick();
        }
        expect(
            wrapper.vm.mutation_test_suite_result!.fdbk_settings.show_grade_buggy_impls_stdout
        ).toBe(false);
        expect(
            wrapper.vm.mutation_test_suite_result!.fdbk_settings.show_grade_buggy_impls_stderr
        ).toBe(false);
        expect(wrapper.find('#buggy-stdout-section').exists()).toBe(false);
    });

    test('show_grade_buggy_impls_stdout === true AND grade_buggy_stdout_content === null ' +
         '- toggle show/hide button',
         async () => {
        mutation_test_suite_result.fdbk_settings.show_grade_buggy_impls_stdout = true;

        get_output_size_stub.onFirstCall().returns(Promise.resolve(
            {
                setup_stdout_size: 20,
                setup_stderr_size: 20,
                get_student_test_names_stdout_size: 20,
                get_student_test_names_stderr_size: 20,
                validity_check_stdout_size: 20,
                validity_check_stderr_size: 20,
                grade_buggy_impls_stdout_size: null,
                grade_buggy_impls_stderr_size: 20
            }
        ));

        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 9; ++i) {
            await wrapper.vm.$nextTick();
        }
        expect(
            wrapper.vm.mutation_test_suite_result!.fdbk_settings.show_grade_buggy_impls_stdout
        ).toBe(true);
        expect(get_output_size_stub.calledOnce).toBe(true);
        expect(get_grade_buggy_impls_stdout_stub.callCount).toEqual(0);
        expect(get_grade_buggy_impls_stderr_stub.callCount).toEqual(0);
        expect(wrapper.vm.d_show_buggy_implementations_output).toBe(false);
        expect(wrapper.vm.d_load_grade_buggy_output).toBe(false);
        expect(wrapper.find('#buggy-stdout-section').exists()).toBe(false);

        // show
        wrapper.find('#show-buggy-output-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(get_output_size_stub.calledOnce).toBe(true);
        expect(get_grade_buggy_impls_stdout_stub.callCount).toEqual(0);
        expect(get_grade_buggy_impls_stderr_stub.calledOnce).toBe(true);
        expect(wrapper.vm.d_show_buggy_implementations_output).toBe(true);
        expect(wrapper.vm.d_load_grade_buggy_output).toBe(true);
        expect(wrapper.vm.d_grade_buggy_stdout_content).toBeNull();
        expect(wrapper.find('#buggy-stdout-section').text()).toContain('No output');

        // hide
        wrapper.find('#show-buggy-output-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(get_output_size_stub.calledOnce).toBe(true);
        expect(get_grade_buggy_impls_stdout_stub.callCount).toEqual(0);
        expect(get_grade_buggy_impls_stderr_stub.calledOnce).toBe(true);
        expect(wrapper.vm.d_show_buggy_implementations_output).toBe(false);
        expect(wrapper.vm.d_load_grade_buggy_output).toBe(true);
        expect(wrapper.find('#buggy-stdout-section').exists()).toBe(false);

        // show again
        wrapper.find('#show-buggy-output-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(get_output_size_stub.calledOnce).toBe(true);
        expect(get_grade_buggy_impls_stdout_stub.callCount).toEqual(0);
        expect(get_grade_buggy_impls_stderr_stub.calledOnce).toBe(true);
        expect(wrapper.vm.d_show_buggy_implementations_output).toBe(true);
        expect(wrapper.vm.d_load_grade_buggy_output).toBe(true);
        expect(wrapper.find('#buggy-stdout-section').text()).toContain('No output');
    });

    test('show_grade_buggy_impls_stdout === true AND grade_buggy_stdout_content !== null ' +
         '- toggle show/hide button',
         async () => {
        mutation_test_suite_result.fdbk_settings.show_grade_buggy_impls_stdout = true;

        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 9; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(
            wrapper.vm.mutation_test_suite_result!.fdbk_settings.show_grade_buggy_impls_stdout
        ).toBe(true);
        expect(get_output_size_stub.calledOnce).toBe(true);
        expect(get_grade_buggy_impls_stdout_stub.callCount).toEqual(0);
        expect(get_grade_buggy_impls_stderr_stub.callCount).toEqual(0);
        expect(wrapper.vm.d_show_buggy_implementations_output).toBe(false);
        expect(wrapper.vm.d_load_grade_buggy_output).toBe(false);
        expect(wrapper.find('#buggy-stdout-section').exists()).toBe(false);

        // show
        wrapper.find('#show-buggy-output-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(get_output_size_stub.calledOnce).toBe(true);
        expect(get_grade_buggy_impls_stdout_stub.calledOnce).toBe(true);
        expect(get_grade_buggy_impls_stderr_stub.calledOnce).toBe(true);
        expect(wrapper.vm.d_show_buggy_implementations_output).toBe(true);
        expect(wrapper.vm.d_load_grade_buggy_output).toBe(true);
        expect(wrapper.vm.d_grade_buggy_stdout_content).toEqual(
            Promise.resolve(grade_buggy_impls_stdout_content)
        );
        expect(wrapper.find('#buggy-stdout-section').text()).toContain(
            grade_buggy_impls_stdout_content
        );

        // hide
        wrapper.find('#show-buggy-output-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(get_output_size_stub.calledOnce).toBe(true);
        expect(get_grade_buggy_impls_stdout_stub.calledOnce).toBe(true);
        expect(get_grade_buggy_impls_stderr_stub.calledOnce).toBe(true);
        expect(wrapper.vm.d_show_buggy_implementations_output).toBe(false);
        expect(wrapper.vm.d_load_grade_buggy_output).toBe(true);
        expect(wrapper.find('#buggy-stdout-section').exists()).toBe(false);

        // show again
        wrapper.find('#show-buggy-output-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(get_output_size_stub.calledOnce).toBe(true);
        expect(get_grade_buggy_impls_stdout_stub.calledOnce).toBe(true);
        expect(get_grade_buggy_impls_stderr_stub.calledOnce).toBe(true);
        expect(wrapper.vm.d_show_buggy_implementations_output).toBe(true);
        expect(wrapper.vm.d_grade_buggy_stdout_content).toEqual(
            Promise.resolve(grade_buggy_impls_stdout_content)
        );
        expect(wrapper.find('#buggy-stdout-section').text()).toContain(
            grade_buggy_impls_stdout_content
        );
    });

    test('show_grade_buggy_impls_stderr === true AND grade_buggy_stderr_content === null ' +
         '- toggle show/hide button',
         async () => {
        mutation_test_suite_result.fdbk_settings.show_grade_buggy_impls_stderr = true;

        get_output_size_stub.onFirstCall().returns(Promise.resolve(
            {
                setup_stdout_size: 20,
                setup_stderr_size: 20,
                get_student_test_names_stdout_size: 20,
                get_student_test_names_stderr_size: 20,
                validity_check_stdout_size: 20,
                validity_check_stderr_size: 20,
                grade_buggy_impls_stdout_size: 20,
                grade_buggy_impls_stderr_size: null
            }
        ));

        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 9; ++i) {
            await wrapper.vm.$nextTick();
        }
        expect(
            wrapper.vm.mutation_test_suite_result!.fdbk_settings.show_grade_buggy_impls_stderr
        ).toBe(true);
        expect(get_output_size_stub.calledOnce).toBe(true);
        expect(get_grade_buggy_impls_stderr_stub.callCount).toEqual(0);
        expect(get_grade_buggy_impls_stdout_stub.callCount).toEqual(0);
        expect(wrapper.vm.d_show_buggy_implementations_output).toBe(false);
        expect(wrapper.vm.d_load_grade_buggy_output).toBe(false);
        expect(wrapper.find('#buggy-stderr-section').exists()).toBe(false);

        // show
        wrapper.find('#show-buggy-output-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(get_output_size_stub.calledOnce).toBe(true);
        expect(get_grade_buggy_impls_stderr_stub.callCount).toEqual(0);
        expect(get_grade_buggy_impls_stdout_stub.calledOnce).toBe(true);
        expect(wrapper.vm.d_show_buggy_implementations_output).toBe(true);
        expect(wrapper.vm.d_load_grade_buggy_output).toBe(true);
        expect(wrapper.vm.d_grade_buggy_stderr_content).toBeNull();
        expect(wrapper.find('#buggy-stderr-section').text()).toContain('No output');

        // hide
        wrapper.find('#show-buggy-output-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(get_output_size_stub.calledOnce).toBe(true);
        expect(get_grade_buggy_impls_stderr_stub.callCount).toEqual(0);
        expect(get_grade_buggy_impls_stdout_stub.calledOnce).toBe(true);
        expect(wrapper.vm.d_show_buggy_implementations_output).toBe(false);
        expect(wrapper.vm.d_load_grade_buggy_output).toBe(true);
        expect(wrapper.find('#buggy-stderr-section').exists()).toBe(false);

        // show again
        wrapper.find('#show-buggy-output-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(get_output_size_stub.calledOnce).toBe(true);
        expect(get_grade_buggy_impls_stderr_stub.callCount).toEqual(0);
        expect(get_grade_buggy_impls_stdout_stub.calledOnce).toBe(true);
        expect(wrapper.vm.d_show_buggy_implementations_output).toBe(true);
        expect(wrapper.vm.d_load_grade_buggy_output).toBe(true);
        expect(wrapper.find('#buggy-stderr-section').text()).toContain('No output');
    });

    test('show_grade_buggy_impls_stderr === true AND grade_buggy_stderr_content !== null ' +
         '- toggle show/hide button',
         async () => {
        mutation_test_suite_result.fdbk_settings.show_grade_buggy_impls_stderr = true;

        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 9; ++i) {
            await wrapper.vm.$nextTick();
        }
        expect(
            wrapper.vm.mutation_test_suite_result!.fdbk_settings.show_grade_buggy_impls_stderr
        ).toBe(true);
        expect(get_output_size_stub.calledOnce).toBe(true);
        expect(get_grade_buggy_impls_stderr_stub.callCount).toEqual(0);
        expect(get_grade_buggy_impls_stdout_stub.callCount).toEqual(0);
        expect(wrapper.vm.d_show_buggy_implementations_output).toBe(false);
        expect(wrapper.vm.d_load_grade_buggy_output).toBe(false);
        expect(wrapper.find('#buggy-stderr-section').exists()).toBe(false);

        // show
        wrapper.find('#show-buggy-output-button').trigger('click');
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        expect(get_output_size_stub.calledOnce).toBe(true);
        expect(get_grade_buggy_impls_stderr_stub.calledOnce).toBe(true);
        expect(get_grade_buggy_impls_stdout_stub.calledOnce).toBe(true);
        expect(wrapper.vm.d_show_buggy_implementations_output).toBe(true);
        expect(wrapper.vm.d_load_grade_buggy_output).toBe(true);
        expect(wrapper.vm.d_grade_buggy_stderr_content).toEqual(
            Promise.resolve(grade_buggy_impls_stderr_content)
        );
        expect(wrapper.find('#buggy-stderr-section').text()).toContain(
            grade_buggy_impls_stderr_content
        );

        // hide
        wrapper.find('#show-buggy-output-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(get_output_size_stub.calledOnce).toBe(true);
        expect(get_grade_buggy_impls_stderr_stub.calledOnce).toBe(true);
        expect(get_grade_buggy_impls_stdout_stub.calledOnce).toBe(true);
        expect(wrapper.vm.d_show_buggy_implementations_output).toBe(false);
        expect(wrapper.vm.d_load_grade_buggy_output).toBe(true);
        expect(wrapper.find('#buggy-stderr-section').exists()).toBe(false);

        // show again
        wrapper.find('#show-buggy-output-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(get_output_size_stub.calledOnce).toBe(true);
        expect(get_grade_buggy_impls_stderr_stub.calledOnce).toBe(true);
        expect(get_grade_buggy_impls_stdout_stub.calledOnce).toBe(true);
        expect(wrapper.vm.d_show_buggy_implementations_output).toBe(true);
        expect(wrapper.vm.d_grade_buggy_stderr_content).toEqual(
            Promise.resolve(grade_buggy_impls_stderr_content)
        );
        expect(wrapper.find('#buggy-stderr-section').text()).toContain(
            grade_buggy_impls_stderr_content
        );
    });
});

describe('MutationSuiteResult student tests section tests', () => {
    let wrapper: Wrapper<MutationSuiteResult>;

    test('student_tests === []', async () => {
        mutation_test_suite_result.student_tests = [];

        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 9; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(
            wrapper.vm.mutation_test_suite_result!.fdbk_settings.show_get_test_names_stdout
        ).toBe(false);
        expect(
            wrapper.vm.mutation_test_suite_result!.fdbk_settings.show_get_test_names_stderr
        ).toBe(false);
        expect(wrapper.vm.mutation_test_suite_result!.student_tests.length).toEqual(0);
        expect(
            wrapper.vm.mutation_test_suite_result!.fdbk_settings.show_validity_check_stdout
        ).toBe(false);
        expect(
            wrapper.vm.mutation_test_suite_result!.fdbk_settings.show_validity_check_stderr
        ).toBe(false);
        expect(wrapper.find('#student-tests-section').exists()).toBe(true);
        expect(wrapper.find('#no-tests-submitted-message').exists()).toBe(true);
    });

    test('show_get_test_names_stdout === false && show_get_test_names_stderr === false',
         async () => {
        mutation_test_suite_result.student_tests = ["test_one", "test_two"];
        mutation_test_suite_result.fdbk_settings.show_get_test_names_stdout = false;
        mutation_test_suite_result.fdbk_settings.show_get_test_names_stderr = false;

        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 9; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.find('#test-names-stdout-section').exists()).toBe(false);
    });

    test('show_get_test_names_stdout === true AND test_names_stdout_content === null',
         async () => {
        mutation_test_suite_result.student_tests = ["test_one", "test_two"];
        mutation_test_suite_result.fdbk_settings.show_get_test_names_stdout = true;

        get_output_size_stub.onFirstCall().returns(
            Promise.resolve(
                {
                    setup_stdout_size: 20,
                    setup_stderr_size: 20,
                    get_student_test_names_stdout_size: null,
                    get_student_test_names_stderr_size: 20,
                    validity_check_stdout_size: 20,
                    validity_check_stderr_size: 20,
                    grade_buggy_impls_stdout_size: 20,
                    grade_buggy_impls_stderr_size: 20
                }
            )
        );

        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 9; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(get_output_size_stub.calledOnce).toBe(true);
        expect(get_student_test_names_stdout_stub.callCount).toEqual(0);
        expect(get_student_test_names_stderr_stub.callCount).toEqual(0);
        expect(wrapper.vm.d_show_student_test_names_output).toBe(false);
        expect(wrapper.vm.d_load_student_test_names_output).toBe(false);
        expect(wrapper.vm.d_student_test_names_stdout_content).toBeNull();
        expect(wrapper.find('#test-names-stdout-section').exists()).toBe(false);

        // show
        wrapper.find('#show-test-names-output-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(get_output_size_stub.calledOnce).toBe(true);
        expect(get_student_test_names_stdout_stub.callCount).toEqual(0);
        expect(get_student_test_names_stderr_stub.callCount).toEqual(1);
        expect(wrapper.vm.d_show_student_test_names_output).toBe(true);
        expect(wrapper.vm.d_load_student_test_names_output).toBe(true);
        expect(wrapper.vm.d_student_test_names_stdout_content).toBeNull();
        expect(wrapper.find('#test-names-stdout-section').text()).toContain("No output");

        // hide
        wrapper.find('#show-test-names-output-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(get_output_size_stub.calledOnce).toBe(true);
        expect(get_student_test_names_stdout_stub.callCount).toEqual(0);
        expect(get_student_test_names_stderr_stub.callCount).toEqual(1);
        expect(wrapper.vm.d_show_student_test_names_output).toBe(false);
        expect(wrapper.vm.d_load_student_test_names_output).toBe(true);
        expect(wrapper.vm.d_student_test_names_stdout_content).toBeNull();
        expect(wrapper.find('#test-names-stdout-section').exists()).toBe(false);

        // show again
        wrapper.find('#show-test-names-output-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(get_output_size_stub.calledOnce).toBe(true);
        expect(get_student_test_names_stdout_stub.callCount).toEqual(0);
        expect(get_student_test_names_stderr_stub.callCount).toEqual(1);
        expect(wrapper.vm.d_show_student_test_names_output).toBe(true);
        expect(wrapper.vm.d_load_student_test_names_output).toBe(true);
        expect(wrapper.vm.d_student_test_names_stdout_content).toBeNull();
        expect(wrapper.find('#test-names-stdout-section').text()).toContain("No output");
    });

    test('show_get_test_names_stdout === true AND test_names_stdout_content !== null',
         async () => {
        mutation_test_suite_result.student_tests = ["test_one", "test_two"];
        mutation_test_suite_result.fdbk_settings.show_get_test_names_stdout = true;

        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 9; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(get_output_size_stub.calledOnce).toBe(true);
        expect(get_student_test_names_stdout_stub.callCount).toEqual(0);
        expect(get_student_test_names_stderr_stub.callCount).toEqual(0);
        expect(wrapper.vm.d_show_student_test_names_output).toBe(false);
        expect(wrapper.vm.d_load_student_test_names_output).toBe(false);
        expect(wrapper.vm.d_student_test_names_stdout_content).toBeNull();
        expect(wrapper.find('#test-names-stdout-section').exists()).toBe(false);

        // show
        wrapper.find('#show-test-names-output-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(get_output_size_stub.calledOnce).toBe(true);
        expect(get_student_test_names_stdout_stub.callCount).toEqual(1);
        expect(get_student_test_names_stderr_stub.callCount).toEqual(1);
        expect(wrapper.vm.d_show_student_test_names_output).toBe(true);
        expect(wrapper.vm.d_load_student_test_names_output).toBe(true);
        expect(wrapper.vm.d_student_test_names_stdout_content).toEqual(
            Promise.resolve(student_test_names_stdout_content)
        );
        expect(wrapper.find('#test-names-stdout-section').text()).toContain(
            student_test_names_stdout_content
        );

        // hide
        wrapper.find('#show-test-names-output-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(get_output_size_stub.calledOnce).toBe(true);
        expect(get_student_test_names_stdout_stub.callCount).toEqual(1);
        expect(get_student_test_names_stderr_stub.callCount).toEqual(1);
        expect(wrapper.vm.d_show_student_test_names_output).toBe(false);
        expect(wrapper.vm.d_load_student_test_names_output).toBe(true);
        expect(wrapper.vm.d_student_test_names_stdout_content).toEqual(
            Promise.resolve(student_test_names_stdout_content)
        );
        expect(wrapper.find('#test-names-stdout-section').exists()).toBe(false);

        // show again
        wrapper.find('#show-test-names-output-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(get_output_size_stub.calledOnce).toBe(true);
        expect(get_student_test_names_stdout_stub.callCount).toEqual(1);
        expect(get_student_test_names_stderr_stub.callCount).toEqual(1);
        expect(wrapper.vm.d_show_student_test_names_output).toBe(true);
        expect(wrapper.vm.d_load_student_test_names_output).toBe(true);
        expect(wrapper.vm.d_student_test_names_stdout_content).toEqual(
            Promise.resolve(student_test_names_stdout_content)
        );
        expect(wrapper.find('#test-names-stdout-section').text()).toContain(
            student_test_names_stdout_content
        );
    });

    test('show_get_test_names_stderr === true AND test_names_stderr_content === null',
         async () => {
        mutation_test_suite_result.student_tests = ["test_one", "test_two"];
        mutation_test_suite_result.fdbk_settings.show_get_test_names_stderr = true;

        get_output_size_stub.onFirstCall().returns(
            Promise.resolve(
                {
                    setup_stdout_size: 20,
                    setup_stderr_size: 20,
                    get_student_test_names_stdout_size: 20,
                    get_student_test_names_stderr_size: null,
                    validity_check_stdout_size: 20,
                    validity_check_stderr_size: 20,
                    grade_buggy_impls_stdout_size: 20,
                    grade_buggy_impls_stderr_size: 20
                }
            )
        );

        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 9; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(get_output_size_stub.calledOnce).toBe(true);
        expect(get_student_test_names_stdout_stub.callCount).toEqual(0);
        expect(get_student_test_names_stderr_stub.callCount).toEqual(0);
        expect(wrapper.vm.d_show_student_test_names_output).toBe(false);
        expect(wrapper.vm.d_load_student_test_names_output).toBe(false);
        expect(wrapper.vm.d_student_test_names_stderr_content).toBeNull();
        expect(wrapper.find('#test-names-stderr-section').exists()).toBe(false);

        // show
        wrapper.find('#show-test-names-output-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(get_output_size_stub.calledOnce).toBe(true);
        expect(get_student_test_names_stdout_stub.callCount).toEqual(1);
        expect(get_student_test_names_stderr_stub.callCount).toEqual(0);
        expect(wrapper.vm.d_show_student_test_names_output).toBe(true);
        expect(wrapper.vm.d_load_student_test_names_output).toBe(true);
        expect(wrapper.vm.d_student_test_names_stderr_content).toBeNull();
        expect(wrapper.find('#test-names-stderr-section').text()).toContain("No output");

        // hide
        wrapper.find('#show-test-names-output-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(get_output_size_stub.calledOnce).toBe(true);
        expect(get_student_test_names_stdout_stub.callCount).toEqual(1);
        expect(get_student_test_names_stderr_stub.callCount).toEqual(0);
        expect(wrapper.vm.d_show_student_test_names_output).toBe(false);
        expect(wrapper.vm.d_load_student_test_names_output).toBe(true);
        expect(wrapper.vm.d_student_test_names_stderr_content).toBeNull();
        expect(wrapper.find('#test-names-stderr-section').exists()).toBe(false);

        // show again
        wrapper.find('#show-test-names-output-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(get_output_size_stub.calledOnce).toBe(true);
        expect(get_student_test_names_stdout_stub.callCount).toEqual(1);
        expect(get_student_test_names_stderr_stub.callCount).toEqual(0);
        expect(wrapper.vm.d_show_student_test_names_output).toBe(true);
        expect(wrapper.vm.d_load_student_test_names_output).toBe(true);
        expect(wrapper.vm.d_student_test_names_stderr_content).toBeNull();
        expect(wrapper.find('#test-names-stderr-section').text()).toContain("No output");
    });

    test('show_get_test_names_stderr === true AND test_names_stderr_content !== null',
         async () => {
        mutation_test_suite_result.student_tests = ["test_one", "test_two"];
        mutation_test_suite_result.fdbk_settings.show_get_test_names_stderr = true;

        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 9; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(get_output_size_stub.calledOnce).toBe(true);
        expect(get_student_test_names_stdout_stub.callCount).toEqual(0);
        expect(get_student_test_names_stderr_stub.callCount).toEqual(0);
        expect(wrapper.vm.d_show_student_test_names_output).toBe(false);
        expect(wrapper.vm.d_load_student_test_names_output).toBe(false);
        expect(wrapper.vm.d_student_test_names_stderr_content).toBeNull();
        expect(wrapper.find('#test-names-stderr-section').exists()).toBe(false);

        // show
        wrapper.find('#show-test-names-output-button').trigger('click');
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        expect(get_output_size_stub.calledOnce).toBe(true);
        expect(get_student_test_names_stdout_stub.callCount).toEqual(1);
        expect(get_student_test_names_stderr_stub.callCount).toEqual(1);
        expect(wrapper.vm.d_show_student_test_names_output).toBe(true);
        expect(wrapper.vm.d_load_student_test_names_output).toBe(true);
        expect(wrapper.vm.d_student_test_names_stderr_content).toEqual(
            Promise.resolve(student_test_names_stderr_content)
        );
        expect(wrapper.find('#test-names-stderr-section').text()).toContain(
            student_test_names_stderr_content
        );

        // hide
        wrapper.find('#show-test-names-output-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(get_output_size_stub.calledOnce).toBe(true);
        expect(get_student_test_names_stdout_stub.callCount).toEqual(1);
        expect(get_student_test_names_stderr_stub.callCount).toEqual(1);
        expect(wrapper.vm.d_show_student_test_names_output).toBe(false);
        expect(wrapper.vm.d_load_student_test_names_output).toBe(true);
        expect(wrapper.vm.d_student_test_names_stderr_content).toEqual(
            Promise.resolve(student_test_names_stderr_content)
        );
        expect(wrapper.find('#test-names-stderr-section').exists()).toBe(false);

        // show again
        wrapper.find('#show-test-names-output-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(get_output_size_stub.calledOnce).toBe(true);
        expect(get_student_test_names_stdout_stub.callCount).toEqual(1);
        expect(get_student_test_names_stderr_stub.callCount).toEqual(1);
        expect(wrapper.vm.d_show_student_test_names_output).toBe(true);
        expect(wrapper.vm.d_load_student_test_names_output).toBe(true);
        expect(wrapper.vm.d_student_test_names_stderr_content).toEqual(
            Promise.resolve(student_test_names_stderr_content)
        );
        expect(wrapper.find('#test-names-stderr-section').text()).toContain(
            student_test_names_stderr_content
        );
    });

    test('discarded_test.length === 0', async () => {
        mutation_test_suite_result.student_tests = ["test_one", "test_two"];
        mutation_test_suite_result.discarded_tests = [];

        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 9; ++i) {
            await wrapper.vm.$nextTick();
        }
        expect(wrapper.find('#discarded-tests-section').exists()).toBe(false);
    });

    test('discarded_tests.length !== 0', async () => {
        mutation_test_suite_result.student_tests = ["test_one", "test_two", "test_three"];
        mutation_test_suite_result.discarded_tests = ["test_four", "test_five"];

        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 9; ++i) {
            await wrapper.vm.$nextTick();
        }
        expect(get_student_test_names_stdout_stub.callCount).toEqual(0);
        expect(wrapper.find('#discarded-tests-section').exists()).toBe(true);
        expect(wrapper.find('#num-tests-accepted').text()).toEqual("3");
        expect(wrapper.find('#total-tests-submitted').text()).toEqual("5");
        expect(wrapper.find('#list-of-discarded-tests').text()).toContain("test_four");
        expect(wrapper.find('#list-of-discarded-tests').text()).toContain("test_five");
        expect(wrapper.find('#no-tests-submitted-message').exists()).toBe(false);
    });

    test('invalid_tests.length === null', async () => {
        mutation_test_suite_result.student_tests = ["test_one", "test_two"];
        mutation_test_suite_result.invalid_tests = null;

        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 9; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(get_student_test_names_stdout_stub.callCount).toEqual(
            0
        );
        expect(wrapper.find('#false-positive-tests-section').exists()).toBe(false);
        expect(wrapper.find('#no-tests-submitted-message').exists()).toBe(false);
    });

    test('invalid_tests.length === 0', async () => {
        mutation_test_suite_result.student_tests = ["test_one", "test_two"];
        mutation_test_suite_result.invalid_tests = [];

        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 9; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(get_student_test_names_stdout_stub.callCount).toEqual(0);
        expect(wrapper.find('#false-positive-tests-section').exists()).toBe(false);
        expect(wrapper.find('#no-tests-submitted-message').exists()).toBe(false);
    });

    test('invalid_tests.length !== 0 AND no tests timed out', async () => {
        mutation_test_suite_result.student_tests = ["test_one", "test_two"];
        mutation_test_suite_result.invalid_tests = ["test_three", "test_four"];

        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 9; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(get_student_test_names_stdout_stub.callCount).toEqual(0);
        expect(wrapper.find('#false-positive-tests-section').exists()).toBe(true);
        expect(wrapper.find('#list-of-false-positive-tests').text()).toContain("test_three");
        expect(wrapper.find('#list-of-false-positive-tests').text()).toContain("test_four");
        expect(wrapper.find('.test-timed-out').exists()).toBe(false);
        expect(wrapper.find('#no-tests-submitted-message').exists()).toBe(false);
    });

    test('invalid_tests.length !== 0 AND tests timed out', async () => {
        mutation_test_suite_result.student_tests = ["test_one", "test_two"];
        mutation_test_suite_result.invalid_tests = ["test_three", "test_four"];
        mutation_test_suite_result.timed_out_tests = ["test_three"];

        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 9; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(get_student_test_names_stdout_stub.callCount).toEqual(0);
        expect(wrapper.find('#false-positive-tests-section').exists()).toBe(true);
        expect(wrapper.find('#list-of-false-positive-tests').text()).toContain("test_three");
        expect(wrapper.find('#list-of-false-positive-tests').text()).toContain("test_four");
        expect(wrapper.find('.test-timed-out').exists()).toBe(true);
        expect(wrapper.findAll('.single-false-positive-test').at(0).find(
            '.test-timed-out'
        ).exists()).toBe(true);
        expect(wrapper.findAll('.single-false-positive-test').at(1).find(
            '.test-timed-out'
        ).exists()).toBe(false);
        expect(wrapper.find('#no-tests-submitted-message').exists()).toBe(false);
    });

    test('get_valid_tests.length === 0', async () => {
        mutation_test_suite_result.student_tests = [
            "test_one",
            "test_two",
            "test_three",
            "test_four"
        ];
        mutation_test_suite_result.invalid_tests = [
            "test_one",
            "test_two",
            "test_three",
            "test_four"
        ];

        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 9; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(get_student_test_names_stdout_stub.callCount).toEqual(0);
        expect(wrapper.find('#valid-tests-section').exists()).toBe(false);
        expect(wrapper.find('#no-tests-submitted-message').exists()).toBe(false);
    });

    test('get_valid_tests.length !== 0', async () => {
        mutation_test_suite_result.student_tests = [
            "test_one",
            "test_two",
            "test_three",
            "test_four"
        ];
        mutation_test_suite_result.invalid_tests = [
            "test_one",
            "test_four"
        ];

        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 9; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(get_student_test_names_stdout_stub.callCount).toEqual(0);
        expect(wrapper.find('#valid-tests-section').exists()).toBe(true);
        expect(wrapper.find('#list-of-valid-tests').text()).toContain('test_two');
        expect(wrapper.find('#list-of-valid-tests').text()).toContain('test_three');
        expect(wrapper.find('#no-tests-submitted-message').exists()).toBe(false);
    });

    test('get_valid_tests() - invalid_tests !== null', async () => {
        mutation_test_suite_result.student_tests = [
            "test_one",
            "test_two",
            "test_three",
            "test_four"
        ];
        mutation_test_suite_result.invalid_tests = [
            "test_one",
            "test_four"
        ];

        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 9; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.get_valid_tests()).toEqual(
            [
                "test_two",
                "test_three"
            ]
        );
        expect(wrapper.find('#no-tests-submitted-message').exists()).toBe(false);
    });

    test('get_valid_tests() - invalid_tests === null', async () => {
        mutation_test_suite_result.student_tests = [
            "test_one",
            "test_two",
            "test_three",
            "test_four"
        ];
        mutation_test_suite_result.invalid_tests = null;

        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 9; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.get_valid_tests()).toEqual(
            [
                "test_one",
                "test_two",
                "test_three",
                "test_four"
            ]
        );
        expect(wrapper.find('#no-tests-submitted-message').exists()).toBe(false);
    });

    test('test_timed_out() - timed_out_tests === null', async () => {
        mutation_test_suite_result.student_tests = [
            "test_one",
            "test_two",
            "test_three",
            "test_four"
        ];
        mutation_test_suite_result.timed_out_tests = null;

        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 9; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.test_timed_out("test_one")).toBe(false);
        expect(wrapper.vm.test_timed_out("test_two")).toBe(false);
        expect(wrapper.vm.test_timed_out("test_three")).toBe(false);
        expect(wrapper.vm.test_timed_out("test_four")).toBe(false);
        expect(wrapper.find('#no-tests-submitted-message').exists()).toBe(false);
    });

    test('test_timed_out() - timed_out_tests !== null', async () => {
        mutation_test_suite_result.student_tests = [
            "test_one",
            "test_two",
            "test_three",
            "test_four"
        ];
        mutation_test_suite_result.timed_out_tests = [
            "test_three",
            "test_four"
        ];

        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 9; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.test_timed_out("test_one")).toBe(false);
        expect(wrapper.vm.test_timed_out("test_two")).toBe(false);
        expect(wrapper.vm.test_timed_out("test_three")).toBe(true);
        expect(wrapper.vm.test_timed_out("test_four")).toBe(true);
        expect(wrapper.find('#no-tests-submitted-message').exists()).toBe(false);
    });
});


describe('MutationSuiteResult validity check related tests', () => {
    let wrapper: Wrapper<MutationSuiteResult>;

    test('show_validity_check_stdout === false && show_validity_check_stderr === false',
         async () => {
        mutation_test_suite_result.student_tests = ["test_one", "test_two"];
        mutation_test_suite_result.fdbk_settings.show_validity_check_stdout = false;

        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 9; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(
            wrapper.vm.mutation_test_suite_result!.fdbk_settings.show_validity_check_stdout
        ).toBe(false);
        expect(
            wrapper.vm.mutation_test_suite_result!.fdbk_settings.show_validity_check_stderr
        ).toBe(false);
        expect(wrapper.find('#validity-check-stdout-section').exists()).toBe(false);
    });

    test('show_validity_check_stdout === true AND validity_check_stdout_content === null',
         async () => {
        mutation_test_suite_result.fdbk_settings.show_validity_check_stdout = true;
        mutation_test_suite_result.student_tests = ['first_test'];

        get_output_size_stub.onFirstCall().returns(
            Promise.resolve(
                {
                    setup_stdout_size: 20,
                    setup_stderr_size: 20,
                    get_student_test_names_stdout_size: 20,
                    get_student_test_names_stderr_size: 20,
                    validity_check_stdout_size: null,
                    validity_check_stderr_size: 20,
                    grade_buggy_impls_stdout_size: 20,
                    grade_buggy_impls_stderr_size: 20
                }
            )
        );

        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 9; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(get_output_size_stub.calledOnce).toBe(true);
        expect(get_validity_check_stdout_stub.callCount).toEqual(0);
        expect(get_validity_check_stderr_stub.callCount).toEqual(0);
        expect(wrapper.vm.d_show_validity_check_output).toBe(false);
        expect(wrapper.vm.d_load_validity_check_output).toBe(false);
        expect(wrapper.vm.d_validity_check_stdout_content).toBeNull();
        expect(wrapper.find('#validity-check-stdout-section').exists()).toBe(false);

        // show
        wrapper.find('#show-validity-check-output-button').trigger('click');
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        expect(get_output_size_stub.calledOnce).toBe(true);
        expect(get_validity_check_stdout_stub.callCount).toEqual(0);
        expect(get_validity_check_stderr_stub.callCount).toEqual(1);
        expect(wrapper.vm.d_show_validity_check_output).toBe(true);
        expect(wrapper.vm.d_load_validity_check_output).toBe(true);
        expect(wrapper.vm.d_validity_check_stdout_content).toBeNull();
        expect(wrapper.find('#validity-check-stdout-section').text()).toContain("No output");

        // hide
        wrapper.find('#show-validity-check-output-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(get_output_size_stub.calledOnce).toBe(true);
        expect(get_validity_check_stdout_stub.callCount).toEqual(0);
        expect(get_validity_check_stderr_stub.callCount).toEqual(1);
        expect(wrapper.vm.d_show_validity_check_output).toBe(false);
        expect(wrapper.vm.d_load_validity_check_output).toBe(true);
        expect(wrapper.vm.d_validity_check_stdout_content).toBeNull();
        expect(wrapper.find('#validity-check-stdout-section').exists()).toBe(false);

        // show again
        wrapper.find('#show-validity-check-output-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(get_output_size_stub.calledOnce).toBe(true);
        expect(get_validity_check_stdout_stub.callCount).toEqual(0);
        expect(get_validity_check_stderr_stub.callCount).toEqual(1);
        expect(wrapper.vm.d_show_validity_check_output).toBe(true);
        expect(wrapper.vm.d_load_validity_check_output).toBe(true);
        expect(wrapper.vm.d_validity_check_stdout_content).toBeNull();
        expect(wrapper.find('#validity-check-stdout-section').text()).toContain("No output");
    });

    test('show_validity_check_stdout === true AND validity_check_stdout_content !== null',
         async () => {
        mutation_test_suite_result.fdbk_settings.show_validity_check_stdout = true;
        mutation_test_suite_result.student_tests = ['first_test'];


        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 9; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(get_output_size_stub.calledOnce).toBe(true);
        expect(get_validity_check_stdout_stub.callCount).toEqual(0);
        expect(get_validity_check_stderr_stub.callCount).toEqual(0);
        expect(wrapper.vm.d_show_validity_check_output).toBe(false);
        expect(wrapper.vm.d_load_validity_check_output).toBe(false);
        expect(wrapper.vm.d_validity_check_stdout_content).toBeNull();
        expect(wrapper.find('#validity-check-stdout-section').exists()).toBe(false);

        // show
        wrapper.find('#show-validity-check-output-button').trigger('click');
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        expect(get_output_size_stub.calledOnce).toBe(true);
        expect(get_validity_check_stdout_stub.callCount).toEqual(1);
        expect(get_validity_check_stderr_stub.callCount).toEqual(1);
        expect(wrapper.vm.d_show_validity_check_output).toBe(true);
        expect(wrapper.vm.d_load_validity_check_output).toBe(true);
        expect(wrapper.vm.d_validity_check_stdout_content).toEqual(
            Promise.resolve(validity_check_stdout_content)
        );
        expect(wrapper.find('#validity-check-stdout-section').text()).toContain(
            validity_check_stdout_content
        );

        // hide
        wrapper.find('#show-validity-check-output-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(get_output_size_stub.calledOnce).toBe(true);
        expect(get_validity_check_stdout_stub.callCount).toEqual(1);
        expect(get_validity_check_stderr_stub.callCount).toEqual(1);
        expect(wrapper.vm.d_show_validity_check_output).toBe(false);
        expect(wrapper.vm.d_load_validity_check_output).toBe(true);
        expect(wrapper.vm.d_validity_check_stdout_content).toEqual(
            Promise.resolve(validity_check_stdout_content)
        );
        expect(wrapper.find('#validity-check-stdout-section').exists()).toBe(false);

        // show again
        wrapper.find('#show-validity-check-output-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(get_output_size_stub.calledOnce).toBe(true);
        expect(get_validity_check_stdout_stub.callCount).toEqual(1);
        expect(get_validity_check_stderr_stub.callCount).toEqual(1);
        expect(wrapper.vm.d_show_validity_check_output).toBe(true);
        expect(wrapper.vm.d_load_validity_check_output).toBe(true);
        expect(wrapper.vm.d_validity_check_stdout_content).toEqual(
            Promise.resolve(validity_check_stdout_content)
        );
        expect(wrapper.find('#validity-check-stdout-section').text()).toContain(
            validity_check_stdout_content
        );
    });

    test('show_validity_check_stderr === true AND validity_check_stderr_content === null',
         async () => {
        mutation_test_suite_result.fdbk_settings.show_validity_check_stderr = true;
        mutation_test_suite_result.student_tests = ['first_test'];

        get_output_size_stub.onFirstCall().returns(
            Promise.resolve(
                {
                    setup_stdout_size: 20,
                    setup_stderr_size: 20,
                    get_student_test_names_stdout_size: 20,
                    get_student_test_names_stderr_size: 20,
                    validity_check_stdout_size: 20,
                    validity_check_stderr_size: null,
                    grade_buggy_impls_stdout_size: 20,
                    grade_buggy_impls_stderr_size: 20
                }
            )
        );

        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 9; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(get_output_size_stub.calledOnce).toBe(true);
        expect(get_validity_check_stdout_stub.callCount).toEqual(0);
        expect(get_validity_check_stderr_stub.callCount).toEqual(0);
        expect(wrapper.vm.d_show_validity_check_output).toBe(false);
        expect(wrapper.vm.d_load_validity_check_output).toBe(false);
        expect(wrapper.vm.d_validity_check_stderr_content).toBeNull();
        expect(wrapper.find('#validity-check-stderr-section').exists()).toBe(false);

        // show
        wrapper.find('#show-validity-check-output-button').trigger('click');
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        expect(get_output_size_stub.calledOnce).toBe(true);
        expect(get_validity_check_stdout_stub.callCount).toEqual(1);
        expect(get_validity_check_stderr_stub.callCount).toEqual(0);
        expect(wrapper.vm.d_show_validity_check_output).toBe(true);
        expect(wrapper.vm.d_load_validity_check_output).toBe(true);
        expect(wrapper.vm.d_validity_check_stderr_content).toBeNull();
        expect(wrapper.find('#validity-check-stderr-section').text()).toContain("No output");

        // hide
        wrapper.find('#show-validity-check-output-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(get_output_size_stub.calledOnce).toBe(true);
        expect(get_validity_check_stdout_stub.callCount).toEqual(1);
        expect(get_validity_check_stderr_stub.callCount).toEqual(0);
        expect(wrapper.vm.d_show_validity_check_output).toBe(false);
        expect(wrapper.vm.d_load_validity_check_output).toBe(true);
        expect(wrapper.vm.d_validity_check_stderr_content).toBeNull();
        expect(wrapper.find('#validity-check-stderr-section').exists()).toBe(false);

        // show again
        wrapper.find('#show-validity-check-output-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(get_output_size_stub.calledOnce).toBe(true);
        expect(get_validity_check_stdout_stub.callCount).toEqual(1);
        expect(get_validity_check_stderr_stub.callCount).toEqual(0);
        expect(wrapper.vm.d_show_validity_check_output).toBe(true);
        expect(wrapper.vm.d_load_validity_check_output).toBe(true);
        expect(wrapper.vm.d_validity_check_stderr_content).toBeNull();
        expect(wrapper.find('#validity-check-stderr-section').text()).toContain("No output");
    });

    test('show_validity_check_stderr === true AND validity_check_stderr_content !== null',
         async () => {
        mutation_test_suite_result.fdbk_settings.show_validity_check_stderr = true;
        mutation_test_suite_result.student_tests = ['first_test'];

        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 9; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(get_output_size_stub.calledOnce).toBe(true);
        expect(get_validity_check_stdout_stub.callCount).toEqual(0);
        expect(get_validity_check_stderr_stub.callCount).toEqual(0);
        expect(wrapper.vm.d_show_validity_check_output).toBe(false);
        expect(wrapper.vm.d_load_validity_check_output).toBe(false);
        expect(wrapper.vm.d_validity_check_stderr_content).toBeNull();
        expect(wrapper.find('#validity-check-stderr-section').exists()).toBe(false);

        // show
        wrapper.find('#show-validity-check-output-button').trigger('click');
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        expect(get_output_size_stub.calledOnce).toBe(true);
        expect(get_validity_check_stdout_stub.callCount).toEqual(1);
        expect(get_validity_check_stderr_stub.callCount).toEqual(1);
        expect(wrapper.vm.d_show_validity_check_output).toBe(true);
        expect(wrapper.vm.d_load_validity_check_output).toBe(true);
        expect(wrapper.vm.d_validity_check_stderr_content).toEqual(
            Promise.resolve(validity_check_stderr_content)
        );
        expect(wrapper.find('#validity-check-stderr-section').text()).toContain(
            validity_check_stderr_content
        );

        // hide
        wrapper.find('#show-validity-check-output-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(get_output_size_stub.calledOnce).toBe(true);
        expect(get_validity_check_stdout_stub.callCount).toEqual(1);
        expect(get_validity_check_stderr_stub.callCount).toEqual(1);
        expect(wrapper.vm.d_show_validity_check_output).toBe(false);
        expect(wrapper.vm.d_load_validity_check_output).toBe(true);
        expect(wrapper.vm.d_validity_check_stderr_content).toEqual(
            Promise.resolve(validity_check_stderr_content)
        );
        expect(wrapper.find('#validity-check-stderr-section').exists()).toBe(false);

        // show again
        wrapper.find('#show-validity-check-output-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(get_output_size_stub.calledOnce).toBe(true);
        expect(get_validity_check_stdout_stub.callCount).toEqual(1);
        expect(get_validity_check_stderr_stub.callCount).toEqual(1);
        expect(wrapper.vm.d_show_validity_check_output).toBe(true);
        expect(wrapper.vm.d_load_validity_check_output).toBe(true);
        expect(wrapper.vm.d_validity_check_stderr_content).toEqual(
            Promise.resolve(validity_check_stderr_content)
        );
        expect(wrapper.find('#validity-check-stderr-section').text()).toContain(
            validity_check_stderr_content
        );
    });
});

describe('MutationSuiteResult Watcher tests', () => {
    let wrapper: Wrapper<MutationSuiteResult>;

    beforeEach(async () => {
        get_output_size_stub.onFirstCall().returns(Promise.resolve(
            {
                setup_stdout_size: null,
                setup_stderr_size: null,
                get_student_test_names_stdout_size: null,
                get_student_test_names_stderr_size: null,
                validity_check_stdout_size: null,
                validity_check_stderr_size: null,
                grade_buggy_impls_stdout_size: null,
                grade_buggy_impls_stderr_size: null
            }
        ));

        get_output_size_stub.onSecondCall().returns(Promise.resolve(
            {
                setup_stdout_size: 20,
                setup_stderr_size: 20,
                get_student_test_names_stdout_size: 20,
                get_student_test_names_stderr_size: 20,
                validity_check_stdout_size: 20,
                validity_check_stderr_size: 20,
                grade_buggy_impls_stdout_size: 20,
                grade_buggy_impls_stderr_size: 20
            }
        ));

        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });

        for (let i = 0; i < 9; ++i) {
            await wrapper.vm.$nextTick();
        }
    });

    test('mutation_test_suite_result Watcher', async () => {
        expect(wrapper.vm.mutation_test_suite_result).toEqual(mutation_test_suite_result);

        expect(get_output_size_stub.calledOnce).toBe(true);
        expect(get_setup_stdout_stub.callCount).toEqual(0);
        expect(get_setup_stderr_stub.callCount).toEqual(0);
        expect(get_student_test_names_stdout_stub.callCount).toEqual(0);
        expect(get_student_test_names_stderr_stub.callCount).toEqual(0);
        expect(get_validity_check_stdout_stub.callCount).toEqual(0);
        expect(get_validity_check_stderr_stub.callCount).toEqual(0);
        expect(get_grade_buggy_impls_stdout_stub.callCount).toEqual(0);
        expect(get_grade_buggy_impls_stderr_stub.callCount).toEqual(0);

        expect(wrapper.vm.d_setup_stdout_content).toBeNull();
        expect(wrapper.vm.d_setup_stderr_content).toBeNull();
        expect(wrapper.vm.d_student_test_names_stdout_content).toBeNull();
        expect(wrapper.vm.d_student_test_names_stderr_content).toBeNull();
        expect(wrapper.vm.d_validity_check_stdout_content).toBeNull();
        expect(wrapper.vm.d_validity_check_stderr_content).toBeNull();
        expect(wrapper.vm.d_grade_buggy_stdout_content).toBeNull();
        expect(wrapper.vm.d_grade_buggy_stderr_content).toBeNull();

        let updated_suite_result = data_ut.make_mutation_test_suite_result_feedback(1);
        wrapper.setProps({mutation_test_suite_result: updated_suite_result});

        for (let i = 0; i < 9; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.mutation_test_suite_result).toEqual(updated_suite_result);
        expect(get_output_size_stub.calledTwice).toBe(true);
        expect(get_setup_stdout_stub.calledOnce).toBe(true);
        expect(get_setup_stderr_stub.calledOnce).toBe(true);
        expect(get_student_test_names_stdout_stub.callCount).toEqual(0);
        expect(get_student_test_names_stderr_stub.callCount).toEqual(0);
        expect(get_validity_check_stdout_stub.callCount).toEqual(0);
        expect(get_validity_check_stderr_stub.callCount).toEqual(0);
        expect(get_grade_buggy_impls_stdout_stub.callCount).toEqual(0);
        expect(get_grade_buggy_impls_stderr_stub.callCount).toEqual(0);

        expect(wrapper.vm.d_setup_stdout_content).toEqual(Promise.resolve(setup_stdout_content));
        expect(wrapper.vm.d_setup_stderr_content).toEqual(Promise.resolve(setup_stderr_content));
        expect(wrapper.vm.d_student_test_names_stdout_content).toBeNull();
        expect(wrapper.vm.d_student_test_names_stderr_content).toBeNull();
        expect(wrapper.vm.d_validity_check_stdout_content).toBeNull();
        expect(wrapper.vm.d_validity_check_stderr_content).toBeNull();
        expect(wrapper.vm.d_grade_buggy_stdout_content).toBeNull();
        expect(wrapper.vm.d_grade_buggy_stderr_content).toBeNull();
    });

    test('submission Watcher', async () => {
        expect(wrapper.vm.fdbk_category).not.toEqual(ag_cli.FeedbackCategory.normal);
        expect(get_output_size_stub.calledOnce).toBe(true);
        expect(get_setup_stdout_stub.callCount).toEqual(0);
        expect(get_setup_stderr_stub.callCount).toEqual(0);
        expect(get_grade_buggy_impls_stdout_stub.callCount).toEqual(0);
        expect(get_grade_buggy_impls_stderr_stub.callCount).toEqual(0);
        expect(get_student_test_names_stdout_stub.callCount).toEqual(0);
        expect(get_student_test_names_stderr_stub.callCount).toEqual(0);
        expect(get_validity_check_stdout_stub.callCount).toEqual(0);
        expect(get_validity_check_stderr_stub.callCount).toEqual(0);

        expect(wrapper.vm.d_setup_stdout_content).toBeNull();
        expect(wrapper.vm.d_setup_stderr_content).toBeNull();
        expect(wrapper.vm.d_student_test_names_stdout_content).toBeNull();
        expect(wrapper.vm.d_student_test_names_stderr_content).toBeNull();
        expect(wrapper.vm.d_validity_check_stdout_content).toBeNull();
        expect(wrapper.vm.d_validity_check_stderr_content).toBeNull();
        expect(wrapper.vm.d_grade_buggy_stdout_content).toBeNull();
        expect(wrapper.vm.d_grade_buggy_stderr_content).toBeNull();

        let updated_submission = data_ut.make_submission(group);
        wrapper.setProps({submission: updated_submission});
        for (let i = 0; i < 9; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(get_output_size_stub.calledOnce).toBe(true);
        expect(get_setup_stdout_stub.callCount).toEqual(0);
        expect(get_setup_stderr_stub.callCount).toEqual(0);
        expect(get_grade_buggy_impls_stdout_stub.callCount).toEqual(0);
        expect(get_grade_buggy_impls_stderr_stub.callCount).toEqual(0);
        expect(get_student_test_names_stdout_stub.callCount).toEqual(0);
        expect(get_student_test_names_stderr_stub.callCount).toEqual(0);
        expect(get_validity_check_stdout_stub.callCount).toEqual(0);
        expect(get_validity_check_stderr_stub.callCount).toEqual(0);

        expect(wrapper.vm.d_setup_stdout_content).toBeNull();
        expect(wrapper.vm.d_setup_stderr_content).toBeNull();
        expect(wrapper.vm.d_student_test_names_stdout_content).toBeNull();
        expect(wrapper.vm.d_student_test_names_stderr_content).toBeNull();
        expect(wrapper.vm.d_validity_check_stdout_content).toBeNull();
        expect(wrapper.vm.d_validity_check_stderr_content).toBeNull();
        expect(wrapper.vm.d_grade_buggy_stdout_content).toBeNull();
        expect(wrapper.vm.d_grade_buggy_stderr_content).toBeNull();
    });

    test('fdbk_category Watcher', async () => {
        expect(wrapper.vm.fdbk_category).not.toEqual(ag_cli.FeedbackCategory.normal);
        expect(get_output_size_stub.calledOnce).toBe(true);
        expect(get_setup_stdout_stub.callCount).toEqual(0);
        expect(get_setup_stderr_stub.callCount).toEqual(0);
        expect(get_grade_buggy_impls_stdout_stub.callCount).toEqual(0);
        expect(get_grade_buggy_impls_stderr_stub.callCount).toEqual(0);
        expect(get_student_test_names_stdout_stub.callCount).toEqual(0);
        expect(get_student_test_names_stderr_stub.callCount).toEqual(0);
        expect(get_validity_check_stdout_stub.callCount).toEqual(0);
        expect(get_validity_check_stderr_stub.callCount).toEqual(0);

        expect(wrapper.vm.d_setup_stdout_content).toBeNull();
        expect(wrapper.vm.d_setup_stderr_content).toBeNull();
        expect(wrapper.vm.d_student_test_names_stdout_content).toBeNull();
        expect(wrapper.vm.d_student_test_names_stderr_content).toBeNull();
        expect(wrapper.vm.d_validity_check_stdout_content).toBeNull();
        expect(wrapper.vm.d_validity_check_stderr_content).toBeNull();
        expect(wrapper.vm.d_grade_buggy_stdout_content).toBeNull();
        expect(wrapper.vm.d_grade_buggy_stderr_content).toBeNull();

        wrapper.setProps({fdbk_category: ag_cli.FeedbackCategory.normal});
        for (let i = 0; i < 9; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.fdbk_category).toEqual(ag_cli.FeedbackCategory.normal);
        expect(get_output_size_stub.calledOnce).toBe(true);
        expect(get_setup_stdout_stub.callCount).toEqual(0);
        expect(get_setup_stderr_stub.callCount).toEqual(0);
        expect(get_grade_buggy_impls_stdout_stub.callCount).toEqual(0);
        expect(get_grade_buggy_impls_stderr_stub.callCount).toEqual(0);
        expect(get_student_test_names_stdout_stub.callCount).toEqual(0);
        expect(get_student_test_names_stderr_stub.callCount).toEqual(0);
        expect(get_validity_check_stdout_stub.callCount).toEqual(0);
        expect(get_validity_check_stderr_stub.callCount).toEqual(0);

        expect(wrapper.vm.d_setup_stdout_content).toBeNull();
        expect(wrapper.vm.d_setup_stderr_content).toBeNull();
        expect(wrapper.vm.d_student_test_names_stdout_content).toBeNull();
        expect(wrapper.vm.d_student_test_names_stderr_content).toBeNull();
        expect(wrapper.vm.d_validity_check_stdout_content).toBeNull();
        expect(wrapper.vm.d_validity_check_stderr_content).toBeNull();
        expect(wrapper.vm.d_grade_buggy_stdout_content).toBeNull();
        expect(wrapper.vm.d_grade_buggy_stderr_content).toBeNull();
    });
});

describe('MutationSuiteResult get_output tests', () => {
    let wrapper: Wrapper<MutationSuiteResult>;

    beforeEach(async () => {
        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });

        for (let i = 0; i < 9; ++i) {
            await wrapper.vm.$nextTick();
        }
    });

    test('get_output - d_load_student_test_names_output === false ' +
         '&& d_load_validity_check_output === false && d_load_grade_buggy_output === false ',
         async () => {
        expect(get_output_size_stub.callCount).toEqual(1);
        expect(get_setup_stdout_stub.callCount).toEqual(1);
        expect(get_setup_stderr_stub.callCount).toEqual(1);
        expect(get_grade_buggy_impls_stdout_stub.callCount).toEqual(0);
        expect(get_grade_buggy_impls_stderr_stub.callCount).toEqual(0);
        expect(get_student_test_names_stdout_stub.callCount).toEqual(0);
        expect(get_student_test_names_stderr_stub.callCount).toEqual(0);
        expect(get_validity_check_stdout_stub.callCount).toEqual(0);
        expect(get_validity_check_stderr_stub.callCount).toEqual(0);
    });

    test('get_output - d_load_grade_buggy_output === true ', async () => {
        expect(get_output_size_stub.callCount).toEqual(1);
        expect(get_setup_stdout_stub.callCount).toEqual(1);
        expect(get_setup_stderr_stub.callCount).toEqual(1);
        expect(get_grade_buggy_impls_stdout_stub.callCount).toEqual(0);
        expect(get_grade_buggy_impls_stderr_stub.callCount).toEqual(0);
        expect(get_student_test_names_stdout_stub.callCount).toEqual(0);
        expect(get_student_test_names_stderr_stub.callCount).toEqual(0);
        expect(get_validity_check_stdout_stub.callCount).toEqual(0);
        expect(get_validity_check_stderr_stub.callCount).toEqual(0);

        wrapper.vm.d_load_grade_buggy_output = true;

        let updated_suite_result = data_ut.make_mutation_test_suite_result_feedback(1);
        wrapper.setProps({mutation_test_suite_result: updated_suite_result});

        for (let i = 0; i < 9; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(get_output_size_stub.callCount).toEqual(2);
        expect(get_setup_stdout_stub.callCount).toEqual(2);
        expect(get_setup_stderr_stub.callCount).toEqual(2);
        expect(get_grade_buggy_impls_stdout_stub.callCount).toEqual(1);
        expect(get_grade_buggy_impls_stderr_stub.callCount).toEqual(1);
        expect(get_student_test_names_stdout_stub.callCount).toEqual(0);
        expect(get_student_test_names_stderr_stub.callCount).toEqual(0);
        expect(get_validity_check_stdout_stub.callCount).toEqual(0);
        expect(get_validity_check_stderr_stub.callCount).toEqual(0);
    });

    test('get_output - d_load_student_test_names_output === true', async () => {
        expect(get_output_size_stub.callCount).toEqual(1);
        expect(get_setup_stdout_stub.callCount).toEqual(1);
        expect(get_setup_stderr_stub.callCount).toEqual(1);
        expect(get_grade_buggy_impls_stdout_stub.callCount).toEqual(0);
        expect(get_grade_buggy_impls_stderr_stub.callCount).toEqual(0);
        expect(get_student_test_names_stdout_stub.callCount).toEqual(0);
        expect(get_student_test_names_stderr_stub.callCount).toEqual(0);
        expect(get_validity_check_stdout_stub.callCount).toEqual(0);
        expect(get_validity_check_stderr_stub.callCount).toEqual(0);

        wrapper.vm.d_load_student_test_names_output = true;

        let updated_suite_result = data_ut.make_mutation_test_suite_result_feedback(1);
        wrapper.setProps({mutation_test_suite_result: updated_suite_result});

        for (let i = 0; i < 9; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(get_output_size_stub.callCount).toEqual(2);
        expect(get_setup_stdout_stub.callCount).toEqual(2);
        expect(get_setup_stderr_stub.callCount).toEqual(2);
        expect(get_grade_buggy_impls_stdout_stub.callCount).toEqual(0);
        expect(get_grade_buggy_impls_stderr_stub.callCount).toEqual(0);
        expect(get_student_test_names_stdout_stub.callCount).toEqual(1);
        expect(get_student_test_names_stderr_stub.callCount).toEqual(1);
        expect(get_validity_check_stdout_stub.callCount).toEqual(0);
        expect(get_validity_check_stderr_stub.callCount).toEqual(0);
    });

    test('get_output - d_load_validity_check_output === true', async () => {
        expect(get_output_size_stub.callCount).toEqual(1);
        expect(get_setup_stdout_stub.callCount).toEqual(1);
        expect(get_setup_stderr_stub.callCount).toEqual(1);
        expect(get_grade_buggy_impls_stdout_stub.callCount).toEqual(0);
        expect(get_grade_buggy_impls_stderr_stub.callCount).toEqual(0);
        expect(get_student_test_names_stdout_stub.callCount).toEqual(0);
        expect(get_student_test_names_stderr_stub.callCount).toEqual(0);
        expect(get_validity_check_stdout_stub.callCount).toEqual(0);
        expect(get_validity_check_stderr_stub.callCount).toEqual(0);

        wrapper.vm.d_load_validity_check_output = true;

        let updated_suite_result = data_ut.make_mutation_test_suite_result_feedback(1);
        wrapper.setProps({mutation_test_suite_result: updated_suite_result});

        for (let i = 0; i < 9; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(get_output_size_stub.callCount).toEqual(2);
        expect(get_setup_stdout_stub.callCount).toEqual(2);
        expect(get_setup_stderr_stub.callCount).toEqual(2);
        expect(get_grade_buggy_impls_stdout_stub.callCount).toEqual(0);
        expect(get_grade_buggy_impls_stderr_stub.callCount).toEqual(0);
        expect(get_student_test_names_stdout_stub.callCount).toEqual(0);
        expect(get_student_test_names_stderr_stub.callCount).toEqual(0);
        expect(get_validity_check_stdout_stub.callCount).toEqual(1);
        expect(get_validity_check_stderr_stub.callCount).toEqual(1);
    });
});
