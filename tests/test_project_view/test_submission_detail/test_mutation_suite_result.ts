import { mount, Wrapper } from '@vue/test-utils';

import * as ag_cli from 'ag-client-typescript';
import * as sinon from 'sinon';

import MutationSuiteResult from '@/components/project_view/submission_detail/mutation_suite_result.vue';
import { ReturnCodeCorrectness } from '@/components/project_view/submission_detail/return_code_correctness';

import * as data_ut from '@/tests/data_utils';

let group: ag_cli.Group;
let mutation_test_suite_result: ag_cli.MutationTestSuiteResultFeedback;
let submission: ag_cli.Submission;
let user: ag_cli.User;

let get_mutation_test_suite_result_setup_stdout_stub: sinon.SinonStub;
let get_mutation_test_suite_result_setup_stderr_stub: sinon.SinonStub;
let get_mutation_test_suite_result_get_student_test_names_stdout_stub: sinon.SinonStub;
let get_mutation_test_suite_result_get_student_test_names_stderr_stub: sinon.SinonStub;
let get_mutation_test_suite_result_validity_check_stdout_stub: sinon.SinonStub;
let get_mutation_test_suite_result_validity_check_stderr_stub: sinon.SinonStub;
let get_mutation_test_suite_result_grade_buggy_impls_stdout_stub: sinon.SinonStub;
let get_mutation_test_suite_result_grade_buggy_impls_stderr_stub: sinon.SinonStub;
let get_mutation_test_suite_result_output_size_stub: sinon.SinonStub;

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

    get_mutation_test_suite_result_setup_stdout_stub = sinon.stub(
        ag_cli.ResultOutput, 'get_mutation_test_suite_result_setup_stdout'
    ).returns(Promise.resolve(setup_stdout_content));

    get_mutation_test_suite_result_setup_stderr_stub = sinon.stub(
        ag_cli.ResultOutput, 'get_mutation_test_suite_result_setup_stderr'
    ).returns(Promise.resolve(setup_stderr_content));

    get_mutation_test_suite_result_get_student_test_names_stdout_stub = sinon.stub(
        ag_cli.ResultOutput, 'get_mutation_test_suite_result_get_student_test_names_stdout'
    ).returns(Promise.resolve(student_test_names_stdout_content));

    get_mutation_test_suite_result_get_student_test_names_stderr_stub = sinon.stub(
        ag_cli.ResultOutput, 'get_mutation_test_suite_result_get_student_test_names_stderr'
    ).returns(Promise.resolve(student_test_names_stderr_content));

    get_mutation_test_suite_result_validity_check_stdout_stub = sinon.stub(
        ag_cli.ResultOutput, 'get_mutation_test_suite_result_validity_check_stdout'
    ).returns(Promise.resolve(validity_check_stdout_content));

    get_mutation_test_suite_result_validity_check_stderr_stub = sinon.stub(
        ag_cli.ResultOutput, 'get_mutation_test_suite_result_validity_check_stderr'
    ).returns(Promise.resolve(validity_check_stderr_content));

    get_mutation_test_suite_result_grade_buggy_impls_stdout_stub = sinon.stub(
        ag_cli.ResultOutput, 'get_mutation_test_suite_result_grade_buggy_impls_stdout'
    ).returns(Promise.resolve(grade_buggy_impls_stdout_content));

    get_mutation_test_suite_result_grade_buggy_impls_stderr_stub = sinon.stub(
        ag_cli.ResultOutput, 'get_mutation_test_suite_result_grade_buggy_impls_stderr'
    ).returns(Promise.resolve(grade_buggy_impls_stderr_content));

    get_mutation_test_suite_result_output_size_stub = sinon.stub(
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

describe('MutationSuiteResult tests', () => {
    let wrapper: Wrapper<MutationSuiteResult>;

    test('setup-section is not visible when setup_return_code === null and ' +
         'setup_timed_out === false',
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

        expect(wrapper.vm.d_mutation_test_suite_result!.setup_return_code).toBeNull();
        expect(wrapper.vm.d_mutation_test_suite_result!.setup_timed_out).toBeNull();
        expect(wrapper.find('#setup-section').exists()).toBe(false);
    });

    test('setup-section visible when setup_return_code !== null',
         async () => {
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

        expect(wrapper.vm.d_mutation_test_suite_result!.setup_return_code).not.toBeNull();
        expect(wrapper.vm.d_mutation_test_suite_result!.setup_timed_out).toBeNull();
        expect(wrapper.find('#setup-section').exists()).toBe(true);
    });

    test('setup-section visible when setup_timed_out === true', async () => {
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

        expect(wrapper.vm.mutation_test_suite_result.setup_return_code).toBeNull();
        expect(wrapper.vm.mutation_test_suite_result.setup_timed_out).toBe(true);
        expect(wrapper.find('#setup-section').exists()).toBe(true);
    });

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

        expect(wrapper.vm.d_mutation_test_suite_result!.setup_command_name).toBeNull();
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

        expect(wrapper.vm.d_mutation_test_suite_result!.setup_command_name).toEqual("Compile");
        expect(wrapper.find('#setup-command-name').text()).toContain("Compile");
    });

    test('get_setup_return_code_correctness - setup_timed_out === true', async () => {
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

        expect(wrapper.vm.setup_return_code_correctness).toEqual(ReturnCodeCorrectness.timed_out);
        expect(wrapper.find('#setup-return-code-correctness-icon').find(
            '.timed-out-icon'
        ).exists()).toBe(true);
        expect(wrapper.find('#setup-return-code').exists()).toBe(false);
    });

    test('get_setup_return_code_correctness - setup_return_code === 0', async () => {
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

        expect(wrapper.vm.setup_return_code_correctness).toEqual("Correct");
        expect(wrapper.find('#setup-return-code-correctness-icon').find(
            '.correct-icon'
        ).exists()).toBe(true);
        expect(wrapper.find('#setup-return-code').text()).toContain("0");
    });

    test('get_setup_return_code_correctness - setup_return_code === 1', async () => {
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

        expect(wrapper.vm.setup_return_code_correctness).toEqual("Incorrect");
        expect(wrapper.find('#setup-return-code-correctness-icon').find(
            '.incorrect-icon'
        ).exists()).toBe(true);
        expect(wrapper.find('#setup-return-code').text()).toContain("1");
    });

    test('setup-stdout-section is visible when show_setup_stdout === true ' +
         '&& d_setup_stdout_content === null',
         async () => {
        mutation_test_suite_result.setup_return_code = 1;
        mutation_test_suite_result.fdbk_settings.show_setup_stdout = true;

        get_mutation_test_suite_result_output_size_stub.onFirstCall().returns(Promise.resolve(
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
        expect(wrapper.vm.d_mutation_test_suite_result!.setup_return_code).toBe(1);
        expect(get_mutation_test_suite_result_output_size_stub.calledOnce).toBe(true);
        expect(get_mutation_test_suite_result_setup_stdout_stub.callCount).toEqual(0);
        expect(wrapper.vm.d_setup_stdout_content).toBeNull();
        expect(wrapper.vm.d_mutation_test_suite_result!.fdbk_settings.show_setup_stdout).toBe(true);
        expect(wrapper.find('#setup-stdout-section').text()).toContain("No Output");
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
        expect(wrapper.vm.d_mutation_test_suite_result!.setup_return_code).toBe(1);
        expect(get_mutation_test_suite_result_output_size_stub.calledOnce).toBe(true);
        expect(get_mutation_test_suite_result_setup_stdout_stub.calledOnce).toBe(true);
        expect(wrapper.vm.d_setup_stdout_content).toEqual(setup_stdout_content);
        expect(wrapper.vm.d_mutation_test_suite_result!.fdbk_settings.show_setup_stdout).toBe(true);
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
        expect(wrapper.vm.d_mutation_test_suite_result!.setup_return_code).toBe(1);
        expect(wrapper.vm.d_mutation_test_suite_result!.fdbk_settings.show_setup_stdout).toBe(
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
        expect(wrapper.vm.d_mutation_test_suite_result!.setup_return_code).toBe(1);
        expect(wrapper.vm.d_mutation_test_suite_result!.fdbk_settings.show_setup_stderr).toBe(
            false
        );
        expect(wrapper.find('#setup-stderr-section').exists()).toBe(false);
    });

    test('show_setup_stderr === true, and setup_stderr_content === null', async () => {
        mutation_test_suite_result.setup_return_code = 1;
        mutation_test_suite_result.fdbk_settings.show_setup_stderr = true;

        get_mutation_test_suite_result_output_size_stub.onFirstCall().returns(Promise.resolve(
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
        expect(wrapper.vm.d_mutation_test_suite_result!.setup_return_code).toBe(1);
        expect(wrapper.vm.d_mutation_test_suite_result!.fdbk_settings.show_setup_stderr).toBe(true);
        expect(get_mutation_test_suite_result_output_size_stub.calledOnce).toBe(true);
        expect(get_mutation_test_suite_result_setup_stderr_stub.callCount).toEqual(0);
        expect(wrapper.vm.d_setup_stderr_content).toBeNull();
        expect(wrapper.find('#setup-stderr-section').text()).toContain("No Output");
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
        expect(wrapper.vm.d_mutation_test_suite_result!.setup_return_code).toBe(1);
        expect(wrapper.vm.d_mutation_test_suite_result!.fdbk_settings.show_setup_stderr).toBe(true);
        expect(get_mutation_test_suite_result_output_size_stub.calledOnce).toBe(true);
        expect(get_mutation_test_suite_result_setup_stderr_stub.calledOnce).toBe(true);
        expect(wrapper.vm.d_setup_stderr_content).toEqual(setup_stderr_content);
        expect(wrapper.find('#setup-stderr-section').text()).toContain(
            setup_stderr_content
        );
    });

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
        expect(wrapper.vm.d_mutation_test_suite_result!.num_bugs_exposed).toBeNull();
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
        expect(wrapper.vm.d_mutation_test_suite_result!.num_bugs_exposed).toBe(5);
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
            wrapper.vm.d_mutation_test_suite_result!.fdbk_settings.bugs_exposed_fdbk_level
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
            wrapper.vm.d_mutation_test_suite_result!.fdbk_settings.bugs_exposed_fdbk_level
        ).toEqual(ag_cli.BugsExposedFeedbackLevel.num_bugs_exposed);
        expect(wrapper.find('#list-of-bug-names-exposed').exists()).toBe(false);
    });

    test('show_grade_buggy_impls_stdout === false', async () => {
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
            wrapper.vm.d_mutation_test_suite_result!.fdbk_settings.show_grade_buggy_impls_stdout
        ).toBe(false);
        expect(wrapper.find('#buggy-stdout-section').exists()).toBe(false);
    });

    test('show_grade_buggy_impls_stdout === true AND grade_buggy_stdout_content === null',
         async () => {
        mutation_test_suite_result.fdbk_settings.show_grade_buggy_impls_stdout = true;

        get_mutation_test_suite_result_output_size_stub.onFirstCall().returns(Promise.resolve(
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
            wrapper.vm.d_mutation_test_suite_result!.fdbk_settings.show_grade_buggy_impls_stdout
        ).toBe(true);
        expect(get_mutation_test_suite_result_output_size_stub.calledOnce).toBe(true);
        expect(get_mutation_test_suite_result_grade_buggy_impls_stdout_stub.callCount).toEqual(0);
        expect(wrapper.vm.d_grade_buggy_stdout_content).toBeNull();
        expect(wrapper.find('#buggy-stdout-section').text()).toContain('No Output');
    });

    test('show_grade_buggy_impls_stdout === true AND grade_buggy_stdout_content !== null',
         async () => {
        mutation_test_suite_result.fdbk_settings.show_grade_buggy_impls_stdout = true;

        get_mutation_test_suite_result_grade_buggy_impls_stdout_stub.returns(
            Promise.resolve(
                "grade buggy impls stdout content"
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
        expect(
            wrapper.vm.d_mutation_test_suite_result!.fdbk_settings.show_grade_buggy_impls_stdout
        ).toBe(true);
        expect(get_mutation_test_suite_result_output_size_stub.calledOnce).toBe(true);
        expect(get_mutation_test_suite_result_grade_buggy_impls_stdout_stub.calledOnce).toBe(true);
        expect(wrapper.vm.d_grade_buggy_stdout_content).toEqual(grade_buggy_impls_stdout_content);
        expect(wrapper.find('#buggy-stdout-section').text()).toContain(
            grade_buggy_impls_stdout_content
        );
    });

    test('show_grade_buggy_impls_stderr === false', async () => {
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
            wrapper.vm.d_mutation_test_suite_result!.fdbk_settings.show_grade_buggy_impls_stderr
        ).toBe(false);
        expect(wrapper.find('#buggy-stderr-section').exists()).toBe(false);
    });

    test('show_grade_buggy_impls_stderr === true AND grade_buggy_stderr_content === null',
         async () => {
        mutation_test_suite_result.fdbk_settings.show_grade_buggy_impls_stderr = true;

        get_mutation_test_suite_result_output_size_stub.onFirstCall().returns(Promise.resolve(
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
            wrapper.vm.d_mutation_test_suite_result!.fdbk_settings.show_grade_buggy_impls_stderr
        ).toBe(true);
        expect(get_mutation_test_suite_result_output_size_stub.calledOnce).toBe(true);
        expect(get_mutation_test_suite_result_grade_buggy_impls_stderr_stub.callCount).toEqual(0);
        expect(wrapper.vm.d_grade_buggy_stderr_content).toBeNull();
        expect(wrapper.find('#buggy-stderr-section').text()).toContain('No Output');
    });

    test('show_grade_buggy_impls_stderr === true AND grade_buggy_stderr_content !== null',
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
            wrapper.vm.d_mutation_test_suite_result!.fdbk_settings.show_grade_buggy_impls_stderr
        ).toBe(true);
        expect(get_mutation_test_suite_result_output_size_stub.calledOnce).toBe(true);
        expect(get_mutation_test_suite_result_grade_buggy_impls_stdout_stub.calledOnce).toBe(true);
        expect(wrapper.vm.d_grade_buggy_stderr_content).toEqual(grade_buggy_impls_stderr_content);
        expect(wrapper.find('#buggy-stderr-section').text()).toContain(
            grade_buggy_impls_stderr_content
        );
    });

    test('show_validity_check_stdout === false', async () => {
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
            wrapper.vm.d_mutation_test_suite_result!.fdbk_settings.show_validity_check_stdout
        ).toBe(false);
        expect(wrapper.find('#validity-check-stdout-section').exists()).toBe(false);
    });

    test('show_validity_check_stdout === true AND validity_check_stdout_content === null',
         async () => {
        mutation_test_suite_result.student_tests = ["test_one", "test_two"];
        mutation_test_suite_result.fdbk_settings.show_validity_check_stdout = true;

        get_mutation_test_suite_result_output_size_stub.onFirstCall().returns(Promise.resolve(
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
            wrapper.vm.d_mutation_test_suite_result!.fdbk_settings.show_validity_check_stdout
        ).toBe(true);
        expect(get_mutation_test_suite_result_output_size_stub.calledOnce).toBe(true);
        expect(get_mutation_test_suite_result_validity_check_stdout_stub.callCount).toEqual(0);
        expect(wrapper.vm.d_validity_checkout_stdout_content).toBeNull();
        expect(wrapper.find('#validity-check-stdout-section').text()).toContain("No Output");
    });

    test('show_validity_check_stdout === true AND validity_check_stdout_content !== null',
         async () => {
        mutation_test_suite_result.student_tests = ["test_one", "test_two"];
        mutation_test_suite_result.fdbk_settings.show_validity_check_stdout = true;

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
            wrapper.vm.d_mutation_test_suite_result!.fdbk_settings.show_validity_check_stdout
        ).toBe(true);
        expect(get_mutation_test_suite_result_output_size_stub.calledOnce).toBe(true);
        expect(get_mutation_test_suite_result_validity_check_stdout_stub.calledOnce).toBe(true);
        expect(wrapper.vm.d_validity_checkout_stdout_content).toEqual(
            validity_check_stdout_content
        );
        expect(wrapper.find('#validity-check-stdout-section').text()).toContain(
            validity_check_stdout_content
        );
    });

    test('show_validity_check_stderr === true AND validity_check_stderr_content === null',
         async () => {
        mutation_test_suite_result.student_tests = ["test_one", "test_two"];
        mutation_test_suite_result.fdbk_settings.show_validity_check_stderr = true;

        get_mutation_test_suite_result_output_size_stub.onFirstCall().returns(Promise.resolve(
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
            wrapper.vm.d_mutation_test_suite_result!.fdbk_settings.show_validity_check_stderr
        ).toBe(true);
        expect(get_mutation_test_suite_result_output_size_stub.calledOnce).toBe(true);
        expect(get_mutation_test_suite_result_validity_check_stderr_stub.callCount).toEqual(0);
        expect(wrapper.vm.d_validity_checkout_stderr_content).toBeNull();
        expect(wrapper.find('#validity-check-stderr-section').text()).toContain("No Output");
    });

    test('show_validity_check_stderr === true AND validity_check_stderr_content !== null',
         async () => {
        mutation_test_suite_result.student_tests = ["test_one", "test_two"];
        mutation_test_suite_result.fdbk_settings.show_validity_check_stderr = true;

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
            wrapper.vm.d_mutation_test_suite_result!.fdbk_settings.show_validity_check_stderr
        ).toBe(true);
        expect(get_mutation_test_suite_result_output_size_stub.calledOnce).toBe(true);
        expect(get_mutation_test_suite_result_validity_check_stderr_stub.calledOnce).toBe(true);
        expect(wrapper.vm.d_validity_checkout_stderr_content).toEqual(
            validity_check_stderr_content
        );
        expect(wrapper.find('#validity-check-stderr-section').text()).toContain(
            validity_check_stderr_content
        );
    });

    test('show_validity_check_stderr === false', async () => {
        mutation_test_suite_result.student_tests = ["test_one", "test_two"];
        mutation_test_suite_result.fdbk_settings.show_validity_check_stderr = false;

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
            wrapper.vm.d_mutation_test_suite_result!.fdbk_settings.show_validity_check_stderr
        ).toBe(false);
        expect(wrapper.find('#validity-check-stderr-section').exists()).toBe(false);
    });

    test('show_get_test_names_stdout === false', async () => {
        mutation_test_suite_result.student_tests = ["test_one", "test_two"];
        mutation_test_suite_result.fdbk_settings.show_get_test_names_stdout = false;

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

        get_mutation_test_suite_result_output_size_stub.onFirstCall().returns(Promise.resolve(
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

        expect(get_mutation_test_suite_result_output_size_stub.calledOnce).toBe(true);
        expect(get_mutation_test_suite_result_get_student_test_names_stdout_stub.callCount).toEqual(
            0
        );
        expect(wrapper.vm.d_student_test_names_stdout_content).toBeNull();
        expect(wrapper.find('#test-names-stdout-section').text()).toContain("No Output");
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

        expect(get_mutation_test_suite_result_output_size_stub.calledOnce).toBe(true);
        expect(get_mutation_test_suite_result_get_student_test_names_stdout_stub.calledOnce).toBe(
            true
        );
        expect(wrapper.vm.d_student_test_names_stdout_content).toEqual(
            student_test_names_stdout_content
        );
        expect(wrapper.find('#test-names-stdout-section').text()).toContain(
            student_test_names_stdout_content
        );
    });

    test('show_get_test_names_stderr === false', async () => {
        mutation_test_suite_result.student_tests = ["test_one", "test_two"];
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

        expect(wrapper.find('#test-names-stderr-section').exists()).toBe(false);
    });

    test('show_get_test_names_stderr === true AND test_names_stderr_content === null',
         async () => {
        mutation_test_suite_result.student_tests = ["test_one", "test_two"];
        mutation_test_suite_result.fdbk_settings.show_get_test_names_stderr = true;

        get_mutation_test_suite_result_output_size_stub.onFirstCall().returns(Promise.resolve(
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

        expect(get_mutation_test_suite_result_output_size_stub.calledOnce).toBe(true);
        expect(get_mutation_test_suite_result_get_student_test_names_stderr_stub.callCount).toEqual(
            0
        );
        expect(wrapper.vm.d_student_test_names_stderr_content).toBeNull();
        expect(wrapper.find('#test-names-stderr-section').text()).toContain("No Output");
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
        expect(get_mutation_test_suite_result_output_size_stub.calledOnce).toBe(true);
        expect(get_mutation_test_suite_result_get_student_test_names_stderr_stub.calledOnce).toBe(
            true
        );
        expect(wrapper.vm.d_student_test_names_stderr_content).toEqual(
            student_test_names_stderr_content
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
        expect(get_mutation_test_suite_result_get_student_test_names_stdout_stub.callCount).toEqual(
            1
        );
        expect(wrapper.find('#discarded-tests-section').exists()).toBe(true);
        expect(wrapper.find('#num-tests-accepted').text()).toEqual("3");
        expect(wrapper.find('#total-tests-submitted').text()).toEqual("5");
        expect(wrapper.find('#list-of-discarded-tests').text()).toContain("test_four");
        expect(wrapper.find('#list-of-discarded-tests').text()).toContain("test_five");
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

        expect(get_mutation_test_suite_result_get_student_test_names_stdout_stub.callCount).toEqual(
            1
        );
        expect(wrapper.find('#invalid-tests-section').exists()).toBe(false);
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

        expect(get_mutation_test_suite_result_get_student_test_names_stdout_stub.callCount).toEqual(
            1
        );
        expect(wrapper.find('#invalid-tests-section').exists()).toBe(false);
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

        expect(get_mutation_test_suite_result_get_student_test_names_stdout_stub.callCount).toEqual(
            1
        );
        expect(wrapper.find('#invalid-tests-section').exists()).toBe(true);
        expect(wrapper.find('#list-of-invalid-tests').text()).toContain(
            "test_three"
        );
        expect(wrapper.find('#list-of-invalid-tests').text()).toContain(
            "test_four"
        );
        expect(wrapper.find('.test-timed-out').exists()).toBe(false);
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

        expect(get_mutation_test_suite_result_get_student_test_names_stdout_stub.callCount).toEqual(
            1
        );
        expect(wrapper.find('#invalid-tests-section').exists()).toBe(true);
        expect(wrapper.find('#list-of-invalid-tests').text()).toContain(
            "test_three"
        );
        expect(wrapper.find('#list-of-invalid-tests').text()).toContain(
            "test_four"
        );
        expect(wrapper.find('.invalid-test-timed-out').exists()).toBe(true);
        expect(wrapper.findAll('.single-invalid-test').at(0).find(
            '.invalid-test-timed-out'
        ).exists()).toBe(true);
        expect(wrapper.findAll('.single-invalid-test').at(1).find(
            '.invalid-test-timed-out'
        ).exists()).toBe(false);
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

        expect(get_mutation_test_suite_result_get_student_test_names_stdout_stub.callCount).toEqual(
            1
        );
        expect(wrapper.find('#valid-tests-section').exists()).toBe(false);
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

        expect(get_mutation_test_suite_result_get_student_test_names_stdout_stub.callCount).toEqual(
            1
        );
        expect(wrapper.find('#valid-tests-section').exists()).toBe(true);
        expect(wrapper.find('#list-of-valid-tests').text()).toContain('test_two');
        expect(wrapper.find('#list-of-valid-tests').text()).toContain('test_three');
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
    });

    test('show_setup_fieldset getter', async () => {
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

        expect(wrapper.vm.d_mutation_test_suite_result!.fdbk_settings.show_setup_stdout).toBe(true);
        expect(
            wrapper.vm.d_mutation_test_suite_result!.fdbk_settings.show_setup_stderr
        ).toBe(false);
        expect(wrapper.vm.d_mutation_test_suite_result!.setup_return_code).toBeNull();
        expect(wrapper.vm.d_mutation_test_suite_result!.setup_timed_out).toBeNull();
        expect(wrapper.vm.show_setup_fieldset).toBe(true);

        wrapper.vm.d_mutation_test_suite_result!.fdbk_settings.show_setup_stdout = false;
        wrapper.vm.d_mutation_test_suite_result!.fdbk_settings.show_setup_stderr = true;

        expect(
            wrapper.vm.d_mutation_test_suite_result!.fdbk_settings.show_setup_stdout
        ).toBe(false);
        expect(wrapper.vm.d_mutation_test_suite_result!.fdbk_settings.show_setup_stderr).toBe(true);
        expect(wrapper.vm.d_mutation_test_suite_result!.setup_return_code).toBeNull();
        expect(wrapper.vm.d_mutation_test_suite_result!.setup_timed_out).toBeNull();
        expect(wrapper.vm.show_setup_fieldset).toBe(true);

        wrapper.vm.d_mutation_test_suite_result!.fdbk_settings.show_setup_stderr = false;
        wrapper.vm.d_mutation_test_suite_result!.setup_return_code = 0;

        expect(
            wrapper.vm.d_mutation_test_suite_result!.fdbk_settings.show_setup_stdout
        ).toBe(false);
        expect(
            wrapper.vm.d_mutation_test_suite_result!.fdbk_settings.show_setup_stderr
        ).toBe(false);
        expect(wrapper.vm.d_mutation_test_suite_result!.setup_return_code).not.toBeNull();
        expect(wrapper.vm.d_mutation_test_suite_result!.setup_timed_out).toBeNull();
        expect(wrapper.vm.show_setup_fieldset).toBe(true);

        wrapper.vm.d_mutation_test_suite_result!.setup_return_code = null;
        wrapper.vm.d_mutation_test_suite_result!.setup_timed_out = false;

        wrapper.vm.d_mutation_test_suite_result!.setup_return_code = null;
        expect(
            wrapper.vm.d_mutation_test_suite_result!.fdbk_settings.show_setup_stdout
        ).toBe(false);
        expect(
            wrapper.vm.d_mutation_test_suite_result!.fdbk_settings.show_setup_stderr
        ).toBe(false);
        expect(wrapper.vm.d_mutation_test_suite_result!.setup_return_code).toBeNull();
        expect(wrapper.vm.d_mutation_test_suite_result!.setup_timed_out).not.toBeNull();
        expect(wrapper.vm.show_setup_fieldset).toBe(false);

        wrapper.vm.d_mutation_test_suite_result!.setup_timed_out = true;

        wrapper.vm.d_mutation_test_suite_result!.setup_return_code = null;
        expect(
            wrapper.vm.d_mutation_test_suite_result!.fdbk_settings.show_setup_stdout
        ).toBe(false);
        expect(
            wrapper.vm.d_mutation_test_suite_result!.fdbk_settings.show_setup_stderr
        ).toBe(false);
        expect(wrapper.vm.d_mutation_test_suite_result!.setup_return_code).toBeNull();
        expect(wrapper.vm.d_mutation_test_suite_result!.setup_timed_out).not.toBeNull();
        expect(wrapper.vm.show_setup_fieldset).toBe(true);
    });

    test('show_buggy_implementations_fieldset getter', async () => {
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
            wrapper.vm.d_mutation_test_suite_result!.fdbk_settings.show_grade_buggy_impls_stdout
        ).toBe(false);
        expect(
            wrapper.vm.d_mutation_test_suite_result!.fdbk_settings.show_grade_buggy_impls_stderr
        ).toBe(false);
        expect(wrapper.vm.d_mutation_test_suite_result!.num_bugs_exposed).toBeNull();
        expect(wrapper.vm.show_buggy_implementations_fieldset).toBe(false);

        wrapper.vm.d_mutation_test_suite_result!.fdbk_settings.show_grade_buggy_impls_stdout = true;

        expect(
            wrapper.vm.d_mutation_test_suite_result!.fdbk_settings.show_grade_buggy_impls_stdout
        ).toBe(true);
        expect(
            wrapper.vm.d_mutation_test_suite_result!.fdbk_settings.show_grade_buggy_impls_stderr
        ).toBe(false);
        expect(wrapper.vm.d_mutation_test_suite_result!.num_bugs_exposed).toBeNull();
        expect(wrapper.vm.show_buggy_implementations_fieldset).toBe(true);

        wrapper.vm.d_mutation_test_suite_result!.fdbk_settings.show_grade_buggy_impls_stdout
            = false;
        wrapper.vm.d_mutation_test_suite_result!.fdbk_settings.show_grade_buggy_impls_stderr = true;

        expect(
            wrapper.vm.d_mutation_test_suite_result!.fdbk_settings.show_grade_buggy_impls_stdout
        ).toBe(false);
        expect(
            wrapper.vm.d_mutation_test_suite_result!.fdbk_settings.show_grade_buggy_impls_stderr
        ).toBe(true);
        expect(wrapper.vm.d_mutation_test_suite_result!.num_bugs_exposed).toBeNull();
        expect(wrapper.vm.show_buggy_implementations_fieldset).toBe(true);

        wrapper.vm.d_mutation_test_suite_result!.fdbk_settings.show_grade_buggy_impls_stderr
            = false;
        wrapper.vm.d_mutation_test_suite_result!.num_bugs_exposed = 3;

        expect(
            wrapper.vm.d_mutation_test_suite_result!.fdbk_settings.show_grade_buggy_impls_stdout
        ).toBe(false);
        expect(
            wrapper.vm.d_mutation_test_suite_result!.fdbk_settings.show_grade_buggy_impls_stderr
        ).toBe(false);
        expect(wrapper.vm.d_mutation_test_suite_result!.num_bugs_exposed).toEqual(3);
        expect(wrapper.vm.show_buggy_implementations_fieldset).toBe(true);
    });

    test('show_test_names_fieldset getter', async () => {
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
            wrapper.vm.d_mutation_test_suite_result!.fdbk_settings.show_get_test_names_stdout
        ).toBe(false);
        expect(
            wrapper.vm.d_mutation_test_suite_result!.fdbk_settings.show_get_test_names_stderr
        ).toBe(false);
        expect(wrapper.vm.d_mutation_test_suite_result!.discarded_tests.length).toEqual(0);
        expect(wrapper.vm.d_mutation_test_suite_result!.invalid_tests).toBeNull();
        expect(wrapper.vm.get_valid_tests().length).toEqual(0);
        expect(wrapper.vm.show_test_names_fieldset).toBe(false);

        wrapper.vm.d_mutation_test_suite_result!.fdbk_settings.show_get_test_names_stdout = true;

        expect(
            wrapper.vm.d_mutation_test_suite_result!.fdbk_settings.show_get_test_names_stdout
        ).toBe(true);
        expect(
            wrapper.vm.d_mutation_test_suite_result!.fdbk_settings.show_get_test_names_stderr
        ).toBe(false);
        expect(wrapper.vm.d_mutation_test_suite_result!.discarded_tests.length).toEqual(0);
        expect(wrapper.vm.d_mutation_test_suite_result!.invalid_tests).toBeNull();
        expect(wrapper.vm.get_valid_tests().length).toEqual(0);
        expect(wrapper.vm.show_test_names_fieldset).toBe(true);

        wrapper.vm.d_mutation_test_suite_result!.fdbk_settings.show_get_test_names_stdout = false;
        wrapper.vm.d_mutation_test_suite_result!.fdbk_settings.show_get_test_names_stderr = true;

        expect(
            wrapper.vm.d_mutation_test_suite_result!.fdbk_settings.show_get_test_names_stdout
        ).toBe(false);
        expect(
            wrapper.vm.d_mutation_test_suite_result!.fdbk_settings.show_get_test_names_stderr
        ).toBe(true);
        expect(wrapper.vm.d_mutation_test_suite_result!.discarded_tests.length).toEqual(0);
        expect(wrapper.vm.d_mutation_test_suite_result!.invalid_tests).toBeNull();
        expect(wrapper.vm.get_valid_tests().length).toEqual(0);
        expect(wrapper.vm.show_test_names_fieldset).toBe(true);

        wrapper.vm.d_mutation_test_suite_result!.fdbk_settings.show_get_test_names_stderr = false;
        wrapper.vm.d_mutation_test_suite_result!.discarded_tests = ['one_test'];

        expect(
            wrapper.vm.d_mutation_test_suite_result!.fdbk_settings.show_get_test_names_stdout
        ).toBe(false);
        expect(
            wrapper.vm.d_mutation_test_suite_result!.fdbk_settings.show_get_test_names_stderr
        ).toBe(false);
        expect(wrapper.vm.d_mutation_test_suite_result!.discarded_tests.length).toEqual(1);
        expect(wrapper.vm.d_mutation_test_suite_result!.invalid_tests).toBeNull();
        expect(wrapper.vm.get_valid_tests().length).toEqual(0);
        expect(wrapper.vm.show_test_names_fieldset).toBe(true);

        wrapper.vm.d_mutation_test_suite_result!.discarded_tests = [];
        wrapper.vm.d_mutation_test_suite_result!.invalid_tests = ['one_test'];

        expect(
            wrapper.vm.d_mutation_test_suite_result!.fdbk_settings.show_get_test_names_stdout
        ).toBe(false);
        expect(
            wrapper.vm.d_mutation_test_suite_result!.fdbk_settings.show_get_test_names_stderr
        ).toBe(false);
        expect(wrapper.vm.d_mutation_test_suite_result!.discarded_tests.length).toEqual(0);
        expect(wrapper.vm.d_mutation_test_suite_result!.invalid_tests!.length).toEqual(1);
        expect(wrapper.vm.get_valid_tests().length).toEqual(0);
        expect(wrapper.vm.show_test_names_fieldset).toBe(true);

        wrapper.vm.d_mutation_test_suite_result!.invalid_tests = null;
        wrapper.vm.d_mutation_test_suite_result!.student_tests = ['one_test'];

        expect(
            wrapper.vm.d_mutation_test_suite_result!.fdbk_settings.show_get_test_names_stdout
        ).toBe(false);
        expect(
            wrapper.vm.d_mutation_test_suite_result!.fdbk_settings.show_get_test_names_stderr
        ).toBe(false);
        expect(wrapper.vm.d_mutation_test_suite_result!.discarded_tests.length).toEqual(0);
        expect(wrapper.vm.d_mutation_test_suite_result!.invalid_tests).toBeNull();
        expect(wrapper.vm.get_valid_tests().length).toEqual(1);
        expect(wrapper.vm.show_test_names_fieldset).toBe(true);
    });
});


describe('MutationSuiteResult Watcher tests', () => {
    let wrapper: Wrapper<MutationSuiteResult>;

    beforeEach(() => {
        get_mutation_test_suite_result_output_size_stub.onFirstCall().returns(Promise.resolve(
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

        get_mutation_test_suite_result_output_size_stub.onSecondCall().returns(Promise.resolve(
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
    });

    test('submission Watcher', async () => {
        for (let i = 0; i < 9; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.d_submission).toEqual(submission);
        expect(get_mutation_test_suite_result_output_size_stub.calledOnce).toBe(true);
        expect(get_mutation_test_suite_result_setup_stdout_stub.callCount).toEqual(0);
        expect(get_mutation_test_suite_result_setup_stderr_stub.callCount).toEqual(0);
        expect(get_mutation_test_suite_result_get_student_test_names_stdout_stub.callCount).toEqual(
            0
        );
        expect(get_mutation_test_suite_result_get_student_test_names_stderr_stub.callCount).toEqual(
            0
        );
        expect(get_mutation_test_suite_result_validity_check_stdout_stub.callCount).toEqual(0);
        expect(get_mutation_test_suite_result_validity_check_stderr_stub.callCount).toEqual(0);
        expect(get_mutation_test_suite_result_grade_buggy_impls_stdout_stub.callCount).toEqual(0);
        expect(get_mutation_test_suite_result_grade_buggy_impls_stderr_stub.callCount).toEqual(0);

        expect(wrapper.vm.d_setup_stdout_content).toBeNull();
        expect(wrapper.vm.d_setup_stderr_content).toBeNull();
        expect(wrapper.vm.d_student_test_names_stdout_content).toBeNull();
        expect(wrapper.vm.d_student_test_names_stderr_content).toBeNull();
        expect(wrapper.vm.d_validity_checkout_stdout_content).toBeNull();
        expect(wrapper.vm.d_validity_checkout_stderr_content).toBeNull();
        expect(wrapper.vm.d_grade_buggy_stdout_content).toBeNull();
        expect(wrapper.vm.d_grade_buggy_stderr_content).toBeNull();

        let updated_submission = data_ut.make_submission(group);
        wrapper.setProps({submission: updated_submission});

        for (let i = 0; i < 9; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.d_submission).toEqual(updated_submission);
        expect(get_mutation_test_suite_result_output_size_stub.calledTwice).toBe(true);
        expect(get_mutation_test_suite_result_setup_stdout_stub.calledOnce).toBe(true);
        expect(get_mutation_test_suite_result_setup_stderr_stub.calledOnce).toBe(true);
        expect(get_mutation_test_suite_result_get_student_test_names_stdout_stub.calledOnce).toBe(
            true
        );
        expect(get_mutation_test_suite_result_get_student_test_names_stderr_stub.calledOnce).toBe(
            true
        );
        expect(get_mutation_test_suite_result_validity_check_stdout_stub.calledOnce).toBe(true);
        expect(get_mutation_test_suite_result_validity_check_stderr_stub.calledOnce).toBe(true);
        expect(get_mutation_test_suite_result_grade_buggy_impls_stdout_stub.calledOnce).toBe(true);
        expect(get_mutation_test_suite_result_grade_buggy_impls_stderr_stub.calledOnce).toBe(true);

        expect(wrapper.vm.d_setup_stdout_content).toEqual(setup_stdout_content);
        expect(wrapper.vm.d_setup_stderr_content).toEqual(setup_stderr_content);
        expect(wrapper.vm.d_student_test_names_stdout_content).toEqual(
            student_test_names_stdout_content
        );
        expect(wrapper.vm.d_student_test_names_stderr_content).toEqual(
            student_test_names_stderr_content
        );
        expect(wrapper.vm.d_validity_checkout_stdout_content).toEqual(
            validity_check_stdout_content
        );
        expect(wrapper.vm.d_validity_checkout_stderr_content).toEqual(
            validity_check_stderr_content
        );
        expect(wrapper.vm.d_grade_buggy_stdout_content).toEqual(grade_buggy_impls_stdout_content);
        expect(wrapper.vm.d_grade_buggy_stderr_content).toEqual(grade_buggy_impls_stderr_content);
    });

    test('mutation_test_suite_result Watcher', async () => {
        for (let i = 0; i < 9; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.d_mutation_test_suite_result).toEqual(mutation_test_suite_result);
        expect(get_mutation_test_suite_result_output_size_stub.calledOnce).toBe(true);
        expect(get_mutation_test_suite_result_setup_stdout_stub.callCount).toEqual(0);
        expect(get_mutation_test_suite_result_setup_stderr_stub.callCount).toEqual(0);
        expect(get_mutation_test_suite_result_get_student_test_names_stdout_stub.callCount).toEqual(
            0
        );
        expect(get_mutation_test_suite_result_get_student_test_names_stderr_stub.callCount).toEqual(
            0
        );
        expect(get_mutation_test_suite_result_validity_check_stdout_stub.callCount).toEqual(0);
        expect(get_mutation_test_suite_result_validity_check_stderr_stub.callCount).toEqual(0);
        expect(get_mutation_test_suite_result_grade_buggy_impls_stdout_stub.callCount).toEqual(0);
        expect(get_mutation_test_suite_result_grade_buggy_impls_stderr_stub.callCount).toEqual(0);

        expect(wrapper.vm.d_setup_stdout_content).toBeNull();
        expect(wrapper.vm.d_setup_stderr_content).toBeNull();
        expect(wrapper.vm.d_student_test_names_stdout_content).toBeNull();
        expect(wrapper.vm.d_student_test_names_stderr_content).toBeNull();
        expect(wrapper.vm.d_validity_checkout_stdout_content).toBeNull();
        expect(wrapper.vm.d_validity_checkout_stderr_content).toBeNull();
        expect(wrapper.vm.d_grade_buggy_stdout_content).toBeNull();
        expect(wrapper.vm.d_grade_buggy_stderr_content).toBeNull();

        let updated_mutation_test_suite_result = data_ut.make_mutation_test_suite_result_feedback(
            1
        );
        wrapper.setProps({mutation_test_suite_result: updated_mutation_test_suite_result});

        for (let i = 0; i < 9; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.d_mutation_test_suite_result).toEqual(updated_mutation_test_suite_result);
        expect(get_mutation_test_suite_result_output_size_stub.calledTwice).toBe(true);
        expect(get_mutation_test_suite_result_setup_stdout_stub.calledOnce).toBe(true);
        expect(get_mutation_test_suite_result_setup_stderr_stub.calledOnce).toBe(true);
        expect(get_mutation_test_suite_result_get_student_test_names_stdout_stub.calledOnce).toBe(
            true
        );
        expect(get_mutation_test_suite_result_get_student_test_names_stderr_stub.calledOnce).toBe(
            true
        );
        expect(get_mutation_test_suite_result_validity_check_stdout_stub.calledOnce).toBe(true);
        expect(get_mutation_test_suite_result_validity_check_stderr_stub.calledOnce).toBe(true);
        expect(get_mutation_test_suite_result_grade_buggy_impls_stdout_stub.calledOnce).toBe(true);
        expect(get_mutation_test_suite_result_grade_buggy_impls_stderr_stub.calledOnce).toBe(true);

        expect(wrapper.vm.d_setup_stdout_content).toEqual(setup_stdout_content);
        expect(wrapper.vm.d_setup_stderr_content).toEqual(setup_stderr_content);
        expect(wrapper.vm.d_student_test_names_stdout_content).toEqual(
            student_test_names_stdout_content
        );
        expect(wrapper.vm.d_student_test_names_stderr_content).toEqual(
            student_test_names_stderr_content
        );
        expect(wrapper.vm.d_validity_checkout_stdout_content).toEqual(
            validity_check_stdout_content
        );
        expect(wrapper.vm.d_validity_checkout_stderr_content).toEqual(
            validity_check_stderr_content
        );
        expect(wrapper.vm.d_grade_buggy_stdout_content).toEqual(grade_buggy_impls_stdout_content);
        expect(wrapper.vm.d_grade_buggy_stderr_content).toEqual(grade_buggy_impls_stderr_content);
    });

    test('fdbk_category Watcher', async () => {
        for (let i = 0; i < 9; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.d_fdbk_category).toEqual(ag_cli.FeedbackCategory.max);
        expect(get_mutation_test_suite_result_output_size_stub.calledOnce).toBe(true);
        expect(get_mutation_test_suite_result_setup_stdout_stub.callCount).toEqual(0);
        expect(get_mutation_test_suite_result_setup_stderr_stub.callCount).toEqual(0);
        expect(get_mutation_test_suite_result_get_student_test_names_stdout_stub.callCount).toEqual(
            0
        );
        expect(get_mutation_test_suite_result_get_student_test_names_stderr_stub.callCount).toEqual(
            0
        );
        expect(get_mutation_test_suite_result_validity_check_stdout_stub.callCount).toEqual(0);
        expect(get_mutation_test_suite_result_validity_check_stderr_stub.callCount).toEqual(0);
        expect(get_mutation_test_suite_result_grade_buggy_impls_stdout_stub.callCount).toEqual(0);
        expect(get_mutation_test_suite_result_grade_buggy_impls_stderr_stub.callCount).toEqual(0);

        expect(wrapper.vm.d_setup_stdout_content).toBeNull();
        expect(wrapper.vm.d_setup_stderr_content).toBeNull();
        expect(wrapper.vm.d_student_test_names_stdout_content).toBeNull();
        expect(wrapper.vm.d_student_test_names_stderr_content).toBeNull();
        expect(wrapper.vm.d_validity_checkout_stdout_content).toBeNull();
        expect(wrapper.vm.d_validity_checkout_stderr_content).toBeNull();
        expect(wrapper.vm.d_grade_buggy_stdout_content).toBeNull();
        expect(wrapper.vm.d_grade_buggy_stderr_content).toBeNull();

        wrapper.setProps({fdbk_category: ag_cli.FeedbackCategory.past_limit_submission});

        for (let i = 0; i < 9; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.d_fdbk_category).toEqual(ag_cli.FeedbackCategory.past_limit_submission);
        expect(get_mutation_test_suite_result_output_size_stub.calledTwice).toBe(true);
        expect(get_mutation_test_suite_result_setup_stdout_stub.calledOnce).toBe(true);
        expect(get_mutation_test_suite_result_setup_stderr_stub.calledOnce).toBe(true);
        expect(get_mutation_test_suite_result_get_student_test_names_stdout_stub.calledOnce).toBe(
            true
        );
        expect(get_mutation_test_suite_result_get_student_test_names_stderr_stub.calledOnce).toBe(
            true
        );
        expect(get_mutation_test_suite_result_validity_check_stdout_stub.calledOnce).toBe(true);
        expect(get_mutation_test_suite_result_validity_check_stderr_stub.calledOnce).toBe(true);
        expect(get_mutation_test_suite_result_grade_buggy_impls_stdout_stub.calledOnce).toBe(true);
        expect(get_mutation_test_suite_result_grade_buggy_impls_stderr_stub.calledOnce).toBe(true);

        expect(wrapper.vm.d_setup_stdout_content).toEqual(setup_stdout_content);
        expect(wrapper.vm.d_setup_stderr_content).toEqual(setup_stderr_content);
        expect(wrapper.vm.d_student_test_names_stdout_content).toEqual(
            student_test_names_stdout_content
        );
        expect(wrapper.vm.d_student_test_names_stderr_content).toEqual(
            student_test_names_stderr_content
        );
        expect(wrapper.vm.d_validity_checkout_stdout_content).toEqual(
            validity_check_stdout_content
        );
        expect(wrapper.vm.d_validity_checkout_stderr_content).toEqual(
            validity_check_stderr_content
        );
        expect(wrapper.vm.d_grade_buggy_stdout_content).toEqual(grade_buggy_impls_stdout_content);
        expect(wrapper.vm.d_grade_buggy_stderr_content).toEqual(grade_buggy_impls_stderr_content);
    });
});
