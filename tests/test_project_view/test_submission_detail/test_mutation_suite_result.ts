import { config, mount, Wrapper } from '@vue/test-utils';

import * as ag_cli from 'ag-client-typescript';
import * as sinon from 'sinon';

import MutationSuiteResult from '@/components/project_view/submission_detail/mutation_suite_result.vue';

import * as data_ut from '@/tests/data_utils';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('MutationSuiteResult tests', () => {
    let wrapper: Wrapper<MutationSuiteResult>;
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

    beforeEach(() => {
        user = data_ut.make_user();
        group = data_ut.make_group(1, 1, {member_names: [user.username]});
        submission = data_ut.make_submission(group);

        mutation_test_suite_result = data_ut.make_mutation_test_suite_result_feedback(1);

        get_mutation_test_suite_result_setup_stdout_stub = sinon.stub(
            ag_cli.ResultOutput, 'get_mutation_test_suite_result_setup_stdout'
        ).returns(Promise.resolve(""));

        get_mutation_test_suite_result_setup_stderr_stub = sinon.stub(
            ag_cli.ResultOutput, 'get_mutation_test_suite_result_setup_stderr'
        ).returns(Promise.resolve(""));

        get_mutation_test_suite_result_get_student_test_names_stdout_stub = sinon.stub(
            ag_cli.ResultOutput, 'get_mutation_test_suite_result_get_student_test_names_stdout'
        ).returns(Promise.resolve(""));

        get_mutation_test_suite_result_get_student_test_names_stderr_stub = sinon.stub(
            ag_cli.ResultOutput, 'get_mutation_test_suite_result_get_student_test_names_stderr'
        ).returns(Promise.resolve(""));

        get_mutation_test_suite_result_validity_check_stdout_stub = sinon.stub(
            ag_cli.ResultOutput, 'get_mutation_test_suite_result_validity_check_stdout'
        ).returns(Promise.resolve(""));

        get_mutation_test_suite_result_validity_check_stderr_stub = sinon.stub(
            ag_cli.ResultOutput, 'get_mutation_test_suite_result_validity_check_stderr'
        ).returns(Promise.resolve(""));

        get_mutation_test_suite_result_grade_buggy_impls_stdout_stub = sinon.stub(
            ag_cli.ResultOutput, 'get_mutation_test_suite_result_grade_buggy_impls_stdout'
        ).returns(Promise.resolve(""));

        get_mutation_test_suite_result_grade_buggy_impls_stderr_stub = sinon.stub(
            ag_cli.ResultOutput, 'get_mutation_test_suite_result_grade_buggy_impls_stderr'
        ).returns(Promise.resolve(""));
    });

    afterEach(() => {
       sinon.restore();
    });

    test('stubbing', async () => {
        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 8; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(get_mutation_test_suite_result_setup_stdout_stub.callCount).toEqual(1);
        expect(get_mutation_test_suite_result_setup_stderr_stub.callCount).toEqual(1);
        expect(get_mutation_test_suite_result_get_student_test_names_stdout_stub.callCount).toEqual(
            1
        );
        expect(get_mutation_test_suite_result_get_student_test_names_stderr_stub.callCount).toEqual(
            1
        );
        expect(get_mutation_test_suite_result_validity_check_stdout_stub.callCount).toEqual(1);
        expect(get_mutation_test_suite_result_validity_check_stderr_stub.callCount).toEqual(1);
        expect(get_mutation_test_suite_result_grade_buggy_impls_stdout_stub.callCount).toEqual(1);
        expect(get_mutation_test_suite_result_grade_buggy_impls_stderr_stub.callCount).toEqual(1);
    });

    test('setup-section is not visible when setup_return_code is null and ' +
         'setup_timed_out is false',
         async () => {
        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 8; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.mutation_test_suite_result.setup_return_code).toBeNull();
        expect(wrapper.vm.mutation_test_suite_result.setup_timed_out).toBeNull();
        expect(wrapper.find('#setup-section').exists()).toBe(false);
    });

    test('setup-section visible when setup_return_code is not null',
         async () => {
        mutation_test_suite_result.setup_return_code = 1;
        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 8; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.mutation_test_suite_result.setup_return_code).not.toBeNull();
        expect(wrapper.vm.mutation_test_suite_result.setup_timed_out).toBeNull();
        expect(wrapper.find('#setup-section').exists()).toBe(true);
    });

    test('setup-section visible when setup_timed_out is true', async () => {
        mutation_test_suite_result.setup_timed_out = true;
        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 8; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.mutation_test_suite_result.setup_return_code).toBeNull();
        expect(wrapper.vm.mutation_test_suite_result.setup_timed_out).toBe(true);
        expect(wrapper.find('#setup-section').exists()).toBe(true);
    });

    test('Setup command name is null', async () => {
        mutation_test_suite_result.setup_return_code = 0;

        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 8; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.mutation_test_suite_result.setup_command_name).toBeNull();
        expect(wrapper.find('#setup-command-name').text()).toContain("Setup");
    });

    test('Setup command name is not null', async () => {
        mutation_test_suite_result.setup_return_code = 0;
        mutation_test_suite_result.setup_command_name = "Compile";

        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 8; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.mutation_test_suite_result.setup_command_name).toEqual("Compile");
        expect(wrapper.find('#setup-command-name').text()).toContain("Compile");
    });

    test('get_setup_return_code_correctness - setup_timed_out is true', async () => {
        mutation_test_suite_result.setup_timed_out = true;
        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 8; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.get_setup_return_code_correctness()).toEqual("Timed Out");
        expect(wrapper.find('#setup-return-code-correctness').text()).toContain("Timed Out");
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
        for (let i = 0; i < 8; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.get_setup_return_code_correctness()).toEqual("Correct");
        expect(wrapper.find('#setup-return-code-correctness').text()).toContain("Correct");
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
        for (let i = 0; i < 8; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.get_setup_return_code_correctness()).toEqual("Incorrect");
        expect(wrapper.find('#setup-return-code-correctness').text()).toContain("Incorrect");
        expect(wrapper.find('#setup-return-code').text()).toContain("1");
    });

    test('setup-stdout-section is visible when show-setup-stdout is true', async () => {
        mutation_test_suite_result.setup_return_code = 1;
        mutation_test_suite_result.fdbk_settings.show_setup_stdout = true;

        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 8; ++i) {
            await wrapper.vm.$nextTick();
        }
        expect(wrapper.vm.mutation_test_suite_result.setup_return_code).toBe(1);
        expect(wrapper.vm.mutation_test_suite_result.fdbk_settings.show_setup_stdout).toBe(true);
        expect(wrapper.find('#setup-stdout-section').exists()).toBe(true);
    });

    test('setup-stdout-section is not visible when show-setup-stdout is false', async () => {
        mutation_test_suite_result.setup_return_code = 1;
        mutation_test_suite_result.fdbk_settings.show_setup_stdout = false;
        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 8; ++i) {
            await wrapper.vm.$nextTick();
        }
        expect(wrapper.vm.mutation_test_suite_result.setup_return_code).toBe(1);
        expect(wrapper.vm.mutation_test_suite_result.fdbk_settings.show_setup_stdout).toBe(false);
        expect(wrapper.find('#setup-stdout-section').exists()).toBe(false);
    });

    test('show_setup_stdout is true, and setup_stdout_content is null', async () => {
        mutation_test_suite_result.setup_return_code = 1;
        mutation_test_suite_result.fdbk_settings.show_setup_stdout = true;

        get_mutation_test_suite_result_setup_stdout_stub.returns(Promise.resolve(null));

        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 8; ++i) {
            await wrapper.vm.$nextTick();
        }
        expect(wrapper.vm.mutation_test_suite_result.setup_return_code).toBe(1);
        expect(wrapper.vm.mutation_test_suite_result.fdbk_settings.show_setup_stdout).toBe(true);
        expect(wrapper.find('#setup-stdout-section').exists()).toBe(true);
        expect(wrapper.find('#setup-stdout-section').text()).toContain("No Output");
    });

    test('show_setup_stdout is true, and setup_stdout_content is not null', async () => {
        mutation_test_suite_result.setup_return_code = 1;
        mutation_test_suite_result.fdbk_settings.show_setup_stdout = true;

        get_mutation_test_suite_result_setup_stdout_stub.returns(
            Promise.resolve(
            "setup stdout content"
            )
        );

        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 8; ++i) {
            await wrapper.vm.$nextTick();
        }
        expect(wrapper.vm.mutation_test_suite_result.setup_return_code).toBe(1);
        expect(wrapper.vm.mutation_test_suite_result.fdbk_settings.show_setup_stdout).toBe(true);
        expect(wrapper.find('#setup-stdout-section').exists()).toBe(true);
        expect(wrapper.find('#setup-stdout-section').text()).toContain(
            "setup stdout content"
        );
    });




    test('setup-stderr-section is not visible when show-setup-stderr is false', async () => {
        mutation_test_suite_result.setup_return_code = 1;
        mutation_test_suite_result.fdbk_settings.show_setup_stderr = false;
        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 8; ++i) {
            await wrapper.vm.$nextTick();
        }
        expect(wrapper.vm.mutation_test_suite_result.setup_return_code).toBe(1);
        expect(wrapper.vm.mutation_test_suite_result.fdbk_settings.show_setup_stderr).toBe(false);
        expect(wrapper.find('#setup-stderr-section').exists()).toBe(false);
    });

    test('show_setup_stderr is true, and setup_stderr_content is null', async () => {
        mutation_test_suite_result.setup_return_code = 1;
        mutation_test_suite_result.fdbk_settings.show_setup_stderr = true;

        get_mutation_test_suite_result_setup_stderr_stub.returns(Promise.resolve(null));

        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 8; ++i) {
            await wrapper.vm.$nextTick();
        }
        expect(wrapper.vm.mutation_test_suite_result.setup_return_code).toBe(1);
        expect(wrapper.vm.mutation_test_suite_result.fdbk_settings.show_setup_stderr).toBe(true);
        expect(wrapper.find('#setup-stderr-section').exists()).toBe(true);
        expect(wrapper.find('#setup-stderr-section').text()).toContain("No Output");
    });

    test('show_setup_stderr is true, and setup_stderr_content is not null', async () => {
        mutation_test_suite_result.setup_return_code = 1;
        mutation_test_suite_result.fdbk_settings.show_setup_stderr = true;

        get_mutation_test_suite_result_setup_stderr_stub.returns(
            Promise.resolve(
                "setup stderr content"
            )
        );

        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 8; ++i) {
            await wrapper.vm.$nextTick();
        }
        expect(wrapper.vm.mutation_test_suite_result.setup_return_code).toBe(1);
        expect(wrapper.vm.mutation_test_suite_result.fdbk_settings.show_setup_stderr).toBe(true);
        expect(wrapper.find('#setup-stderr-section').exists()).toBe(true);
        expect(wrapper.find('#setup-stderr-section').text()).toContain(
            "setup stderr content"
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
        for (let i = 0; i < 8; ++i) {
            await wrapper.vm.$nextTick();
        }
        expect(wrapper.vm.mutation_test_suite_result.num_bugs_exposed).toBeNull();
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
        for (let i = 0; i < 8; ++i) {
            await wrapper.vm.$nextTick();
        }
        expect(wrapper.vm.mutation_test_suite_result.num_bugs_exposed).toBe(5);
        expect(wrapper.find('#num-bugs-exposed-section').exists()).toBe(true);
        expect(wrapper.find('#num-bugs-exposed-section').text()).toContain('5');
    });

    test('bugs_exposed_fdbk_level === exposed_bug_names', async () => {
        mutation_test_suite_result.fdbk_settings.bugs_exposed_fdbk_level
            = ag_cli.BugsExposedFeedbackLevel.exposed_bug_names;
        mutation_test_suite_result.bugs_exposed = ["bug_1", "bug_2"];

        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 8; ++i) {
            await wrapper.vm.$nextTick();
        }
        expect(wrapper.vm.mutation_test_suite_result.fdbk_settings.bugs_exposed_fdbk_level).toEqual(
            ag_cli.BugsExposedFeedbackLevel.exposed_bug_names
        );
        expect(wrapper.find('#list-of-bug-names-exposed').exists()).toBe(true);
        expect(wrapper.find('#list-of-bug-names-exposed').text()).toContain(
            "bug_1"
        );
        expect(wrapper.find('#list-of-bug-names-exposed').text()).toContain(
            "bug_2"
        );
    });

    test('bugs_exposed_fdbk_level !== exposed_bug_names', async () => {
        mutation_test_suite_result.fdbk_settings.bugs_exposed_fdbk_level
            = ag_cli.BugsExposedFeedbackLevel.num_bugs_exposed;

        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 8; ++i) {
            await wrapper.vm.$nextTick();
        }
        expect(wrapper.vm.mutation_test_suite_result.fdbk_settings.bugs_exposed_fdbk_level).toEqual(
            ag_cli.BugsExposedFeedbackLevel.num_bugs_exposed
        );
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
        for (let i = 0; i < 8; ++i) {
            await wrapper.vm.$nextTick();
        }
        expect(
            wrapper.vm.mutation_test_suite_result.fdbk_settings.show_grade_buggy_impls_stdout
        ).toBe(false);
        expect(wrapper.find('#buggy-stdout-section').exists()).toBe(false);
    });

    test('show_grade_buggy_impls_stdout === true AND grade_buggy_stdout_content === null',
         async () => {
        mutation_test_suite_result.fdbk_settings.show_grade_buggy_impls_stdout = true;

        get_mutation_test_suite_result_grade_buggy_impls_stdout_stub.returns(Promise.resolve(null));

        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 8; ++i) {
            await wrapper.vm.$nextTick();
        }
        expect(
            wrapper.vm.mutation_test_suite_result.fdbk_settings.show_grade_buggy_impls_stdout
        ).toBe(true);
        expect(wrapper.find('#buggy-stdout-section').exists()).toBe(true);
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
        for (let i = 0; i < 8; ++i) {
            await wrapper.vm.$nextTick();
        }
        expect(
            wrapper.vm.mutation_test_suite_result.fdbk_settings.show_grade_buggy_impls_stdout
        ).toBe(true);

        expect(wrapper.find('#buggy-stdout-section').exists()).toBe(true);
        expect(wrapper.find('#buggy-stdout-section').text()).toContain(
            'grade buggy impls stdout content'
        );
    });

    test('student-tests-section - student_tests.length === 0',
         async () => {
        mutation_test_suite_result.student_tests = [];

        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 8; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(get_mutation_test_suite_result_get_student_test_names_stdout_stub.callCount).toEqual(
            1
        );

        expect(wrapper.find('#student-tests-section').exists()).toBe(false);
    });

    test('student-tests-section - student_tests.length !== 0', async () => {
        mutation_test_suite_result.student_tests = ["test_one", "test_two"];

        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 8; ++i) {
            await wrapper.vm.$nextTick();
        }
        expect(get_mutation_test_suite_result_get_student_test_names_stdout_stub.callCount).toEqual(
            1
        );

        expect(wrapper.find('#student-tests-section').exists()).toBe(true);
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
        for (let i = 0; i < 8; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.mutation_test_suite_result.fdbk_settings.show_validity_check_stdout).toBe(
            false
        );
        expect(wrapper.find('#validity-check-stdout-section').exists()).toBe(false);
    });

    test('show_validity_check_stdout === true AND validity_check_stdout_content === null',
         async () => {
        mutation_test_suite_result.student_tests = ["test_one", "test_two"];
        mutation_test_suite_result.fdbk_settings.show_validity_check_stdout = true;

        get_mutation_test_suite_result_validity_check_stdout_stub.returns(Promise.resolve(null));

        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 8; ++i) {
            await wrapper.vm.$nextTick();
        }
        expect(get_mutation_test_suite_result_get_student_test_names_stdout_stub.callCount).toEqual(
            1
        );

        expect(wrapper.vm.mutation_test_suite_result.fdbk_settings.show_validity_check_stdout).toBe(
            true
        );
        expect(wrapper.find('#validity-check-stdout-section').exists()).toBe(true);
        expect(wrapper.find('#validity-check-stdout-section').text()).toContain("No Output");
    });

    test('show_validity_check_stdout === true AND validity_check_stdout_content !== null',
         async () => {
        mutation_test_suite_result.student_tests = ["test_one", "test_two"];
        mutation_test_suite_result.fdbk_settings.show_validity_check_stdout = true;

        get_mutation_test_suite_result_validity_check_stdout_stub.returns(
            Promise.resolve(
                "validity check stdout content"
            )
        );

        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 8; ++i) {
            await wrapper.vm.$nextTick();
        }
        expect(get_mutation_test_suite_result_get_student_test_names_stdout_stub.callCount).toEqual(
            1
        );
        expect(wrapper.vm.mutation_test_suite_result.fdbk_settings.show_validity_check_stdout).toBe(
            true
        );
        expect(wrapper.find('#validity-check-stdout-section').exists()).toBe(true);
        expect(wrapper.find('#validity-check-stdout-section').text()).toContain(
            "validity check stdout content"
        );
    });

    test('show_validity_check_stderr === true AND validity_check_stderr_content === null',
         async () => {
        mutation_test_suite_result.student_tests = ["test_one", "test_two"];
        mutation_test_suite_result.fdbk_settings.show_validity_check_stderr = true;

        get_mutation_test_suite_result_validity_check_stderr_stub.returns(Promise.resolve(null));

        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 8; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.mutation_test_suite_result.fdbk_settings.show_validity_check_stderr).toBe(
            true
        );
        expect(wrapper.find('#validity-check-stderr-section').exists()).toBe(true);
        expect(wrapper.find('#validity-check-stderr-section').text()).toContain("No Output");
    });

    test('show_validity_check_stderr === true AND validity_check_stderr_content !== null',
         async () => {
        mutation_test_suite_result.student_tests = ["test_one", "test_two"];
        mutation_test_suite_result.fdbk_settings.show_validity_check_stderr = true;

        get_mutation_test_suite_result_validity_check_stderr_stub.returns(
            Promise.resolve(
                "validity check stderr content"
            )
        );

        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 8; ++i) {
        await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.mutation_test_suite_result.fdbk_settings.show_validity_check_stderr).toBe(
            true
        );
        expect(wrapper.find('#validity-check-stderr-section').exists()).toBe(true);
        expect(wrapper.find('#validity-check-stderr-section').text()).toContain(
            "validity check stderr content"
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
        for (let i = 0; i < 8; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.mutation_test_suite_result.fdbk_settings.show_validity_check_stderr).toBe(
            false
        );
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
        for (let i = 0; i < 8; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.find('#test-names-stdout-section').exists()).toBe(false);
    });

    test('show_get_test_names_stdout === true AND test_names_stdout_content === null',
         async () => {
        mutation_test_suite_result.student_tests = ["test_one", "test_two"];
        mutation_test_suite_result.fdbk_settings.show_get_test_names_stdout = true;
        get_mutation_test_suite_result_get_student_test_names_stdout_stub.returns(
            Promise.resolve(null)
        );

        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 8; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.find('#test-names-stdout-section').exists()).toBe(true);
        expect(wrapper.find('#test-names-stdout-section').text()).toContain("No Output");
    });

    test('show_get_test_names_stdout === true AND test_names_stdout_content !== null',
         async () => {
        mutation_test_suite_result.student_tests = ["test_one", "test_two"];
        mutation_test_suite_result.fdbk_settings.show_get_test_names_stdout = true;
        get_mutation_test_suite_result_get_student_test_names_stdout_stub.returns(
            Promise.resolve("test_names_stdout_content")
        );

        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 8; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.find('#test-names-stdout-section').exists()).toBe(true);
        expect(wrapper.find('#test-names-stdout-section').text()).toContain(
            "test_names_stdout_content"
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
        for (let i = 0; i < 8; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.find('#test-names-stderr-section').exists()).toBe(false);
    });

    test('show_get_test_names_stderr === true AND test_names_stderr_content === null',
         async () => {
        mutation_test_suite_result.student_tests = ["test_one", "test_two"];
        mutation_test_suite_result.fdbk_settings.show_get_test_names_stderr = true;
        get_mutation_test_suite_result_get_student_test_names_stderr_stub.returns(
            Promise.resolve(null)
        );

        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 8; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.find('#test-names-stderr-section').exists()).toBe(true);
        expect(wrapper.find('#test-names-stderr-section').text()).toContain("No Output");
    });

    test('show_get_test_names_stderr === true AND test_names_stderr_content !== null',
         async () => {
        mutation_test_suite_result.student_tests = ["test_one", "test_two"];
        mutation_test_suite_result.fdbk_settings.show_get_test_names_stderr = true;
        get_mutation_test_suite_result_get_student_test_names_stderr_stub.returns(
            Promise.resolve("test_names_stderr_content")
        );

        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 8; ++i) {
            await wrapper.vm.$nextTick();
        }
        expect(get_mutation_test_suite_result_get_student_test_names_stdout_stub.callCount).toEqual(
            1
        );
        expect(wrapper.find('#test-names-stderr-section').exists()).toBe(true);
        expect(wrapper.find('#test-names-stderr-section').text()).toContain(
            "test_names_stderr_content"
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
        for (let i = 0; i < 8; ++i) {
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
        for (let i = 0; i < 8; ++i) {
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
        for (let i = 0; i < 8; ++i) {
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
        for (let i = 0; i < 8; ++i) {
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
        for (let i = 0; i < 8; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(get_mutation_test_suite_result_get_student_test_names_stdout_stub.callCount).toEqual(
            1
        );
        expect(wrapper.find('#invalid-tests-section').exists()).toBe(true);
        expect(wrapper.find('#list-of-incorrectly-reported-bug-tests').text()).toContain(
            "test_three"
        );
        expect(wrapper.find('#list-of-incorrectly-reported-bug-tests').text()).toContain(
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
        for (let i = 0; i < 8; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(get_mutation_test_suite_result_get_student_test_names_stdout_stub.callCount).toEqual(
            1
        );
        expect(wrapper.find('#invalid-tests-section').exists()).toBe(true);
        expect(wrapper.find('#list-of-incorrectly-reported-bug-tests').text()).toContain(
            "test_three"
        );
        expect(wrapper.find('#list-of-incorrectly-reported-bug-tests').text()).toContain(
            "test_four"
        );
        expect(wrapper.find('.test-timed-out').exists()).toBe(true);
        expect(wrapper.findAll('.invalid-test').at(0).find(
            '.test-timed-out'
        ).exists()).toBe(true);
        expect(wrapper.findAll('.invalid-test').at(1).find(
            '.test-timed-out'
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
        for (let i = 0; i < 8; ++i) {
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
        for (let i = 0; i < 8; ++i) {
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
        for (let i = 0; i < 8; ++i) {
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
        for (let i = 0; i < 8; ++i) {
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
        for (let i = 0; i < 8; ++i) {
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
        for (let i = 0; i < 8; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.test_timed_out("test_one")).toBe(false);
        expect(wrapper.vm.test_timed_out("test_two")).toBe(false);
        expect(wrapper.vm.test_timed_out("test_three")).toBe(true);
        expect(wrapper.vm.test_timed_out("test_four")).toBe(true);
    });
});


describe('MutationSuiteResult Watcher tests', () => {
    let wrapper: Wrapper<MutationSuiteResult>;
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

    beforeEach(() => {
        user = data_ut.make_user();
        group = data_ut.make_group(1, 1, {member_names: [user.username]});
        submission = data_ut.make_submission(group);

        mutation_test_suite_result = data_ut.make_mutation_test_suite_result_feedback(1);

        get_mutation_test_suite_result_setup_stdout_stub = sinon.stub(
            ag_cli.ResultOutput, 'get_mutation_test_suite_result_setup_stdout'
        ).returns(Promise.resolve(""));

        get_mutation_test_suite_result_setup_stderr_stub = sinon.stub(
            ag_cli.ResultOutput, 'get_mutation_test_suite_result_setup_stderr'
        ).returns(Promise.resolve(""));

        get_mutation_test_suite_result_get_student_test_names_stdout_stub = sinon.stub(
            ag_cli.ResultOutput, 'get_mutation_test_suite_result_get_student_test_names_stdout'
        ).returns(Promise.resolve(""));

        get_mutation_test_suite_result_get_student_test_names_stderr_stub = sinon.stub(
            ag_cli.ResultOutput, 'get_mutation_test_suite_result_get_student_test_names_stderr'
        ).returns(Promise.resolve(""));

        get_mutation_test_suite_result_validity_check_stdout_stub = sinon.stub(
            ag_cli.ResultOutput, 'get_mutation_test_suite_result_validity_check_stdout'
        ).returns(Promise.resolve(""));

        get_mutation_test_suite_result_validity_check_stderr_stub = sinon.stub(
            ag_cli.ResultOutput, 'get_mutation_test_suite_result_validity_check_stderr'
        ).returns(Promise.resolve(""));

        get_mutation_test_suite_result_grade_buggy_impls_stdout_stub = sinon.stub(
            ag_cli.ResultOutput, 'get_mutation_test_suite_result_grade_buggy_impls_stdout'
        ).returns(Promise.resolve(""));

        get_mutation_test_suite_result_grade_buggy_impls_stderr_stub = sinon.stub(
            ag_cli.ResultOutput, 'get_mutation_test_suite_result_grade_buggy_impls_stderr'
        ).returns(Promise.resolve(""));

        wrapper = mount(MutationSuiteResult, {
            propsData: {
                mutation_test_suite_result: mutation_test_suite_result,
                submission: submission,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
    });

    afterEach(() => {
        sinon.restore();
    });

    test('submission Watcher', async () => {
        for (let i = 0; i < 8; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.d_submission).toEqual(submission);
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

        let updated_submission = data_ut.make_submission(group);
        wrapper.setProps({submission: updated_submission});

        for (let i = 0; i < 8; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.d_submission).toEqual(updated_submission);
        expect(get_mutation_test_suite_result_setup_stdout_stub.calledTwice).toBe(true);
        expect(get_mutation_test_suite_result_setup_stderr_stub.calledTwice).toBe(true);
        expect(get_mutation_test_suite_result_get_student_test_names_stdout_stub.calledTwice).toBe(
            true
        );
        expect(get_mutation_test_suite_result_get_student_test_names_stderr_stub.calledTwice).toBe(
            true
        );
        expect(get_mutation_test_suite_result_validity_check_stdout_stub.calledTwice).toBe(true);
        expect(get_mutation_test_suite_result_validity_check_stderr_stub.calledTwice).toBe(true);
        expect(get_mutation_test_suite_result_grade_buggy_impls_stdout_stub.calledTwice).toBe(true);
        expect(get_mutation_test_suite_result_grade_buggy_impls_stderr_stub.calledTwice).toBe(true);
    });

    test('mutation_test_suite_result Watcher', async () => {
        for (let i = 0; i < 8; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.d_mutation_test_suite_result).toEqual(mutation_test_suite_result);
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

        let updated_mutation_test_suite_result = data_ut.make_mutation_test_suite_result_feedback(
            1
        );
        wrapper.setProps({mutation_test_suite_result: updated_mutation_test_suite_result});

        for (let i = 0; i < 8; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.d_mutation_test_suite_result).toEqual(updated_mutation_test_suite_result);
        expect(get_mutation_test_suite_result_setup_stdout_stub.calledTwice).toBe(true);
        expect(get_mutation_test_suite_result_setup_stderr_stub.calledTwice).toBe(true);
        expect(get_mutation_test_suite_result_get_student_test_names_stdout_stub.calledTwice).toBe(
            true
        );
        expect(get_mutation_test_suite_result_get_student_test_names_stderr_stub.calledTwice).toBe(
            true
        );
        expect(get_mutation_test_suite_result_validity_check_stdout_stub.calledTwice).toBe(true);
        expect(get_mutation_test_suite_result_validity_check_stderr_stub.calledTwice).toBe(true);
        expect(get_mutation_test_suite_result_grade_buggy_impls_stdout_stub.calledTwice).toBe(true);
        expect(get_mutation_test_suite_result_grade_buggy_impls_stderr_stub.calledTwice).toBe(true);
    });

    test('fdbk_category Watcher', async () => {
        for (let i = 0; i < 8; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.d_fdbk_category).toEqual(ag_cli.FeedbackCategory.max);
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

        wrapper.setProps({fdbk_category: ag_cli.FeedbackCategory.past_limit_submission});

        for (let i = 0; i < 8; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.d_fdbk_category).toEqual(ag_cli.FeedbackCategory.past_limit_submission);
        expect(get_mutation_test_suite_result_setup_stdout_stub.calledTwice).toBe(true);
        expect(get_mutation_test_suite_result_setup_stderr_stub.calledTwice).toBe(true);
        expect(get_mutation_test_suite_result_get_student_test_names_stdout_stub.calledTwice).toBe(
            true
        );
        expect(get_mutation_test_suite_result_get_student_test_names_stderr_stub.calledTwice).toBe(
            true
        );
        expect(get_mutation_test_suite_result_validity_check_stdout_stub.calledTwice).toBe(true);
        expect(get_mutation_test_suite_result_validity_check_stderr_stub.calledTwice).toBe(true);
        expect(get_mutation_test_suite_result_grade_buggy_impls_stdout_stub.calledTwice).toBe(true);
        expect(get_mutation_test_suite_result_grade_buggy_impls_stderr_stub.calledTwice).toBe(true);
    });
});
