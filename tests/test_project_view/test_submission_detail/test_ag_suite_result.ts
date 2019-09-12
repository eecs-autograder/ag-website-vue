import { config, mount, Wrapper } from '@vue/test-utils';

import * as ag_cli from 'ag-client-typescript';
import * as sinon from 'sinon';

import AGSuiteResult from '@/components/project_view/submission_detail/ag_suite_result.vue';
import { CorrectnessLevel } from '@/components/project_view/submission_detail/correctness_icon.vue';

import * as data_ut from '@/tests/data_utils';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('AGSuiteResult tests', () => {
    let wrapper: Wrapper<AGSuiteResult>;
    let group: ag_cli.Group;
    let submission: ag_cli.Submission;
    let user: ag_cli.User;
    let ag_test_suite_result: ag_cli.AGTestSuiteResultFeedback;

    beforeEach(() => {
        user = data_ut.make_user();
        group = data_ut.make_group(1, 1, {member_names: [user.username]});
        submission = data_ut.make_submission(group);
        ag_test_suite_result = data_ut.make_ag_test_suite_result_feedback(1);

        wrapper = mount(AGSuiteResult, {
            propsData: {
                submission: submission,
                ag_test_suite_result: ag_test_suite_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
    });

    test('case_setup_result_panel - decide_whether_to_open_setup === true', async () => {
        wrapper.setProps({is_first_suite: true});
        await wrapper.vm.$nextTick();

        sinon.stub(ag_cli.ResultOutput, 'get_ag_test_suite_result_setup_stdout');
        sinon.stub(ag_cli.ResultOutput, 'get_ag_test_suite_result_setup_stderr');

        let updated_ag_test_suite_result = data_ut.make_ag_test_suite_result_feedback(
            1,
            {
                setup_return_code: 1,
                setup_name: "Compile"
            }
        );
        wrapper.setProps({ag_test_suite_result: updated_ag_test_suite_result});

        expect(wrapper.vm.setup_correctness_level).toEqual(CorrectnessLevel.none_correct);
        expect(wrapper.vm.first_incorrect_setup).toEqual(updated_ag_test_suite_result);

        let setup_panel = wrapper.find({ref: 'ag_case_setup_result_detail_panel'});
        expect(setup_panel.find('.panel-header-open').exists()).toBe(true);
    });

    test('case_panel - decide_whether_to_open_case === true', async () => {
        wrapper.setProps({is_first_suite: true});
        await wrapper.vm.$nextTick();

        sinon.stub(ag_cli.ResultOutput, 'get_ag_test_suite_result_setup_stdout');
        sinon.stub(ag_cli.ResultOutput, 'get_ag_test_suite_result_setup_stderr');

        let ag_case_result_maize = data_ut.make_ag_test_case_result_feedback(1);
        let ag_command_result_maize_1 = data_ut.make_ag_test_command_result_feedback(
          10,
          {
              return_code_correct: true,
              stdout_correct: true,
              stderr_correct: true
          }
        );
        let ag_command_result_maize_2 = data_ut.make_ag_test_command_result_feedback(
            20,
            {
                return_code_correct: true,
                stdout_correct: true,
                stderr_correct: true
            }
        );

        ag_case_result_maize.ag_test_command_results = [
            ag_command_result_maize_1,
            ag_command_result_maize_2
        ];

        let ag_case_result_blue = data_ut.make_ag_test_case_result_feedback(1);
        let ag_command_result_blue_1 = data_ut.make_ag_test_command_result_feedback(
            10,
            {
                return_code_correct: true,
                stdout_correct: true,
                stderr_correct: true
            }
        );
        let ag_command_result_blue_2 = data_ut.make_ag_test_command_result_feedback(
            20,
            {
                return_code_correct: false,
                stdout_correct: true,
                stderr_correct: true
            }
        );

        ag_case_result_blue.ag_test_command_results = [
            ag_command_result_blue_1,
            ag_command_result_blue_2
        ];

        let updated_ag_test_suite_result = data_ut.make_ag_test_suite_result_feedback(
            1,
            {
                ag_test_case_results: [
                    ag_case_result_maize,
                    ag_case_result_blue
                ]
            }
        );

        wrapper.setProps({ag_test_suite_result: updated_ag_test_suite_result});

        expect(wrapper.vm.case_result_correctness(ag_case_result_blue)).toEqual(
            CorrectnessLevel.some_correct
        );
        expect(wrapper.vm.first_incorrect_case).toEqual(ag_case_result_blue);

        expect(wrapper.findAll({ref: 'ag_case_result_detail_panel'}).length).toEqual(2);
        expect(wrapper.findAll({ref: 'ag_case_result_detail_panel'}).at(
            1
        ).find('.panel-header-open').exists()).toBe(true);
    });

    test('setup_correctness_level - setup_return_code === 0', async () => {
        wrapper.vm.ag_test_suite_result.setup_return_code = 0;

        expect(wrapper.vm.setup_correctness_level).toEqual(
            CorrectnessLevel.all_correct
        );
    });

    test('setup_correctness_level - setup_return_code === null', async () => {
        wrapper.vm.ag_test_suite_result.setup_return_code = null;

        expect(wrapper.vm.setup_correctness_level).toEqual(
            CorrectnessLevel.not_available
        );
    });

    test('setup_correctness_level - setup_return_code !== 0 && setup_return_code !== null',
         async () => {
        wrapper.vm.ag_test_suite_result.setup_return_code = 1;

        expect(wrapper.vm.setup_correctness_level).toEqual(
            CorrectnessLevel.none_correct
        );
    });

    test('case_result_correctness - return_code_correctness ' +
         '=== CorrectnessLevel.not_available',
         async () => {
        let case_pk = 1;
        let case_result = data_ut.make_ag_test_case_result_feedback(case_pk);
        let command_1_result = data_ut.make_ag_test_command_result_feedback(
            1,
            {
                stdout_correct: false,
                stderr_correct: false
            }
        );
        let command_2_result = data_ut.make_ag_test_command_result_feedback(
            2,
            {
                stdout_correct: false,
                stderr_correct: false
            }
        );
        let command_3_result = data_ut.make_ag_test_command_result_feedback(
            3,
            {
                stdout_correct: false,
                stderr_correct: false
            }
        );

        case_result.ag_test_command_results = [
            command_1_result,
            command_2_result,
            command_3_result
        ];

        expect(wrapper.vm.case_result_return_code_correctness(case_result)).toEqual(
            CorrectnessLevel.not_available
        );
        expect(wrapper.vm.case_result_output_correctness(case_result)).toEqual(
            CorrectnessLevel.none_correct
        );
        expect(wrapper.vm.case_result_correctness(case_result)).toEqual(
            CorrectnessLevel.none_correct
        );
    });

    test('case_result_correctness - output_correctness ' +
         '=== CorrectnessLevel.not_available',
         async () => {
        let case_pk = 1;
        let case_result = data_ut.make_ag_test_case_result_feedback(case_pk);
        let command_1_result = data_ut.make_ag_test_command_result_feedback(
            1,
            {
                return_code_correct: true
            }
        );
        let command_2_result = data_ut.make_ag_test_command_result_feedback(
            2,
            {
                return_code_correct: true
            }
        );
        let command_3_result = data_ut.make_ag_test_command_result_feedback(
            3,
            {
                return_code_correct: true
            }
        );

        case_result.ag_test_command_results = [
            command_1_result,
            command_2_result,
            command_3_result
        ];

        expect(wrapper.vm.case_result_return_code_correctness(case_result)).toEqual(
            CorrectnessLevel.all_correct
        );
        expect(wrapper.vm.case_result_output_correctness(case_result)).toEqual(
            CorrectnessLevel.not_available
        );
        expect(wrapper.vm.case_result_correctness(case_result)).toEqual(
            CorrectnessLevel.all_correct
        );
    });

    test('case_result_correctness - return_code_correctness === all_correct && ' +
         'output_correctness === all_correct',
         async () => {
        let case_pk = 1;
        let case_result = data_ut.make_ag_test_case_result_feedback(case_pk);
        let command_1_result = data_ut.make_ag_test_command_result_feedback(
            1,
            {
                return_code_correct: true,
                stdout_correct: true,
                stderr_correct: true
            }
        );
        let command_2_result = data_ut.make_ag_test_command_result_feedback(
            2,
            {
                return_code_correct: true,
                stdout_correct: true,
                stderr_correct: true
            }
        );
        let command_3_result = data_ut.make_ag_test_command_result_feedback(
            3,
            {
                return_code_correct: true,
                stdout_correct: true,
                stderr_correct: true
            }
        );

        case_result.ag_test_command_results = [
            command_1_result,
            command_2_result,
            command_3_result
        ];

        expect(wrapper.vm.case_result_return_code_correctness(case_result)).toEqual(
            CorrectnessLevel.all_correct
        );
        expect(wrapper.vm.case_result_output_correctness(case_result)).toEqual(
            CorrectnessLevel.all_correct
        );
        expect(wrapper.vm.case_result_correctness(case_result)).toEqual(
            CorrectnessLevel.all_correct
        );
    });

    test('case_result_correctness - return_code_correctness === none_correct && ' +
         'output_correctness === none_correct',
         async () => {
        let case_pk = 1;
        let case_result = data_ut.make_ag_test_case_result_feedback(case_pk);
        let command_1_result = data_ut.make_ag_test_command_result_feedback(
            1,
            {
                return_code_correct: false,
                stdout_correct: false,
                stderr_correct: false
            }
        );
        let command_2_result = data_ut.make_ag_test_command_result_feedback(
            2,
            {
                return_code_correct: false,
                stdout_correct: false,
                stderr_correct: false
            }
        );
        let command_3_result = data_ut.make_ag_test_command_result_feedback(
            3,
            {
                return_code_correct: false,
                stdout_correct: false,
                stderr_correct: false
            }
        );

        case_result.ag_test_command_results = [
            command_1_result,
            command_2_result,
            command_3_result
        ];

        expect(wrapper.vm.case_result_return_code_correctness(case_result)).toEqual(
            CorrectnessLevel.none_correct
        );
        expect(wrapper.vm.case_result_output_correctness(case_result)).toEqual(
            CorrectnessLevel.none_correct
        );
        expect(wrapper.vm.case_result_correctness(case_result)).toEqual(
            CorrectnessLevel.none_correct
        );
    });

    test('case_result_correctness - return_code_correctness === some_correct',
         async () => {
        let case_pk = 1;
        let case_result = data_ut.make_ag_test_case_result_feedback(case_pk);
        let command_1_result = data_ut.make_ag_test_command_result_feedback(
            1,
            {
                return_code_correct: false,
                stdout_correct: true,
                stderr_correct: true
            }
        );
        let command_2_result = data_ut.make_ag_test_command_result_feedback(
            2,
            {
                return_code_correct: true,
                stdout_correct: true,
                stderr_correct: true
            }
        );
        let command_3_result = data_ut.make_ag_test_command_result_feedback(
            3,
            {
                return_code_correct: true,
                stdout_correct: true,
                stderr_correct: true
            }
        );

        case_result.ag_test_command_results = [
            command_1_result,
            command_2_result,
            command_3_result
        ];

        expect(wrapper.vm.case_result_return_code_correctness(case_result)).toEqual(
            CorrectnessLevel.some_correct
        );
        expect(wrapper.vm.case_result_output_correctness(case_result)).toEqual(
            CorrectnessLevel.all_correct
        );
        expect(wrapper.vm.case_result_correctness(case_result)).toEqual(
            CorrectnessLevel.some_correct
        );
    });

    test('case_result_correctness - output_correctness === some_correct',
         async () => {
        let case_pk = 1;
        let case_result = data_ut.make_ag_test_case_result_feedback(case_pk);
        let command_1_result = data_ut.make_ag_test_command_result_feedback(
            1,
            {
                return_code_correct: true,
                stdout_correct: true,
                stderr_correct: true
            }
        );
        let command_2_result = data_ut.make_ag_test_command_result_feedback(
            2,
            {
                return_code_correct: true,
                stdout_correct: false,
                stderr_correct: true
            }
        );
        let command_3_result = data_ut.make_ag_test_command_result_feedback(
            3,
            {
                return_code_correct: true,
                stdout_correct: true,
                stderr_correct: false
            }
        );

        case_result.ag_test_command_results = [
            command_1_result,
            command_2_result,
            command_3_result
        ];

        expect(wrapper.vm.case_result_return_code_correctness(case_result)).toEqual(
            CorrectnessLevel.all_correct
        );
        expect(wrapper.vm.case_result_output_correctness(case_result)).toEqual(
            CorrectnessLevel.some_correct
        );
        expect(wrapper.vm.case_result_correctness(case_result)).toEqual(
            CorrectnessLevel.some_correct
        );
    });

    test('case_result_correctness - return_code_correctness === all_correct && ' +
         'output_correctness === none_correct',
         async () => {
        let case_pk = 1;
        let case_result = data_ut.make_ag_test_case_result_feedback(case_pk);
        let command_1_result = data_ut.make_ag_test_command_result_feedback(
            1,
            {
                return_code_correct: true,
                stdout_correct: false,
                stderr_correct: false
            }
        );
        let command_2_result = data_ut.make_ag_test_command_result_feedback(
            2,
            {
                return_code_correct: true,
                stdout_correct: false,
                stderr_correct: false
            }
        );
        let command_3_result = data_ut.make_ag_test_command_result_feedback(
            3,
            {
                return_code_correct: true,
                stdout_correct: false,
                stderr_correct: false
            }
        );

        case_result.ag_test_command_results = [
            command_1_result,
            command_2_result,
            command_3_result
        ];

        expect(wrapper.vm.case_result_return_code_correctness(case_result)).toEqual(
            CorrectnessLevel.all_correct
        );
        expect(wrapper.vm.case_result_output_correctness(case_result)).toEqual(
            CorrectnessLevel.none_correct
        );
        expect(wrapper.vm.case_result_correctness(case_result)).toEqual(
            CorrectnessLevel.some_correct
        );
    });

    test('case_result_correctness - return_code_correctness === none_correct && ' +
         'output_correctness === all_correct',
         async () => {
        let case_pk = 1;
        let case_result = data_ut.make_ag_test_case_result_feedback(case_pk);
        let command_1_result = data_ut.make_ag_test_command_result_feedback(
            1,
            {
                return_code_correct: false,
                stdout_correct: true,
                stderr_correct: true
            }
        );
        let command_2_result = data_ut.make_ag_test_command_result_feedback(
            2,
            {
                return_code_correct: false,
                stdout_correct: true,
                stderr_correct: true
            }
        );
        let command_3_result = data_ut.make_ag_test_command_result_feedback(
            3,
            {
                return_code_correct: false,
                stdout_correct: true,
                stderr_correct: true
            }
        );

        case_result.ag_test_command_results = [
            command_1_result,
            command_2_result,
            command_3_result
        ];

        expect(wrapper.vm.case_result_return_code_correctness(case_result)).toEqual(
            CorrectnessLevel.none_correct
        );
        expect(wrapper.vm.case_result_output_correctness(case_result)).toEqual(
            CorrectnessLevel.all_correct
        );
        expect(wrapper.vm.case_result_correctness(case_result)).toEqual(
            CorrectnessLevel.some_correct
        );
    });

    test('case_result_return_code_correctness - all commands have ' +
         'return_code_correct === null',
         async () => {
        let case_pk = 1;
        let case_result = data_ut.make_ag_test_case_result_feedback(case_pk);
        let command_1_result = data_ut.make_ag_test_command_result_feedback(1);
        let command_2_result = data_ut.make_ag_test_command_result_feedback(2);
        let command_3_result = data_ut.make_ag_test_command_result_feedback(3);

        case_result.ag_test_command_results = [
            command_1_result,
            command_2_result,
            command_3_result
        ];

        expect(command_1_result.return_code_correct).toEqual(null);
        expect(command_2_result.return_code_correct).toEqual(null);
        expect(command_3_result.return_code_correct).toEqual(null);

        expect(wrapper.vm.case_result_return_code_correctness(case_result)).toEqual(
            CorrectnessLevel.not_available
        );
    });

    test('case_result_return_code_correctness - all commands have ' +
         'return_code_correct = true',
         async () => {
        let case_pk = 1;
        let case_result = data_ut.make_ag_test_case_result_feedback(case_pk);
        let command_1_result = data_ut.make_ag_test_command_result_feedback(
            1,
            {
                return_code_correct: true
            }
        );
        let command_2_result = data_ut.make_ag_test_command_result_feedback(
            2,
            {
                return_code_correct: true
            }
        );
        let command_3_result = data_ut.make_ag_test_command_result_feedback(
            3,
            {
                return_code_correct: true
            }
        );

        case_result.ag_test_command_results = [
            command_1_result,
            command_2_result,
            command_3_result
        ];

        expect(command_1_result.return_code_correct).toEqual(true);
        expect(command_2_result.return_code_correct).toEqual(true);
        expect(command_3_result.return_code_correct).toEqual(true);

        expect(wrapper.vm.case_result_return_code_correctness(case_result)).toEqual(
            CorrectnessLevel.all_correct
        );
    });

    test('case_result_return_code_correctness - all commands have ' +
         'return_code_correct = true or return_code_correct = null',
         async () => {
        let case_pk = 1;
        let case_result = data_ut.make_ag_test_case_result_feedback(case_pk);
        let command_1_result = data_ut.make_ag_test_command_result_feedback(
            1,
            {
                return_code_correct: true
            }
        );
        let command_2_result = data_ut.make_ag_test_command_result_feedback(
            2,
            {
                return_code_correct: null
            }
        );
        let command_3_result = data_ut.make_ag_test_command_result_feedback(
            3,
            {
                return_code_correct: true
            }
        );

        case_result.ag_test_command_results = [
            command_1_result,
            command_2_result,
            command_3_result
        ];

        expect(command_1_result.return_code_correct).toEqual(true);
        expect(command_2_result.return_code_correct).toEqual(null);
        expect(command_3_result.return_code_correct).toEqual(true);

        expect(wrapper.vm.case_result_return_code_correctness(case_result)).toEqual(
            CorrectnessLevel.all_correct
        );
    });

    test('case_result_return_code_correctness - all commands have return_code_correct ' +
         '= false',
         async () => {
        let case_pk = 1;
        let case_result = data_ut.make_ag_test_case_result_feedback(case_pk);
        let command_1_result = data_ut.make_ag_test_command_result_feedback(
            1,
            {
                return_code_correct: false
            }
        );
        let command_2_result = data_ut.make_ag_test_command_result_feedback(
            2,
            {
                return_code_correct: false
            }
        );
        let command_3_result = data_ut.make_ag_test_command_result_feedback(
            3,
            {
                return_code_correct: false
            }
        );

        case_result.ag_test_command_results = [
            command_1_result,
            command_2_result,
            command_3_result
        ];

        expect(command_1_result.return_code_correct).toEqual(false);
        expect(command_2_result.return_code_correct).toEqual(false);
        expect(command_3_result.return_code_correct).toEqual(false);

        expect(wrapper.vm.case_result_return_code_correctness(case_result)).toEqual(
            CorrectnessLevel.none_correct
        );
    });

    test('case_result_return_code_correctness - some commands have return_code_correct ' +
         '= false but not all',
         async () => {
        let case_pk = 1;
        let case_result = data_ut.make_ag_test_case_result_feedback(case_pk);
        let command_1_result = data_ut.make_ag_test_command_result_feedback(
            1,
            {
                return_code_correct: true
            }
        );
        let command_2_result = data_ut.make_ag_test_command_result_feedback(
            2,
            {
                return_code_correct: false
            }
        );
        let command_3_result = data_ut.make_ag_test_command_result_feedback(
            3,
            {
                return_code_correct: true
            }
        );

        case_result.ag_test_command_results = [
            command_1_result,
            command_2_result,
            command_3_result
        ];

        expect(command_1_result.return_code_correct).toEqual(true);
        expect(command_2_result.return_code_correct).toEqual(false);
        expect(command_3_result.return_code_correct).toEqual(true);

        expect(wrapper.vm.case_result_return_code_correctness(case_result)).toEqual(
            CorrectnessLevel.some_correct
        );
    });

    test('case_result_output_correctness - every command has stdout_correct = null ' +
         'AND stderr_correct = null',
         async () => {
        let case_pk = 1;
        let case_result = data_ut.make_ag_test_case_result_feedback(case_pk);
        let command_1_result = data_ut.make_ag_test_command_result_feedback(
            1,
            {
                stdout_correct: null,
                stderr_correct: null
            }
        );
        let command_2_result = data_ut.make_ag_test_command_result_feedback(
            2,
            {
                stdout_correct: null,
                stderr_correct: null
            }
        );
        let command_3_result = data_ut.make_ag_test_command_result_feedback(
            3,
            {
                stdout_correct: null,
                stderr_correct: null
            }
        );
        case_result.ag_test_command_results = [
            command_1_result,
            command_2_result,
            command_3_result
        ];

        expect(wrapper.vm.case_result_output_correctness(case_result)).toEqual(
            CorrectnessLevel.not_available
        );
    });

    test('case_result_output_correctness - every command has stdout_correct = true ' +
         'AND stderr_correct = true',
         async () => {
        let case_pk = 1;
        let case_result = data_ut.make_ag_test_case_result_feedback(case_pk);
        let command_1_result = data_ut.make_ag_test_command_result_feedback(
            1,
            {
                stdout_correct: true,
                stderr_correct: true
            }
        );
        let command_2_result = data_ut.make_ag_test_command_result_feedback(
            2,
            {
                stdout_correct: true,
                stderr_correct: true
            }
        );
        let command_3_result = data_ut.make_ag_test_command_result_feedback(
            3,
            {
                stdout_correct: true,
                stderr_correct: true
            }
        );
        case_result.ag_test_command_results = [
            command_1_result,
            command_2_result,
            command_3_result
        ];

        expect(wrapper.vm.case_result_output_correctness(case_result)).toEqual(
            CorrectnessLevel.all_correct
        );
    });

    test('case_result_output_correctness - every command has stdout_correct = true || false ' +
         'AND stderr_correct = true || false',
         async () => {
        let case_pk = 1;
        let case_result = data_ut.make_ag_test_case_result_feedback(case_pk);
        let command_1_result = data_ut.make_ag_test_command_result_feedback(
            1,
            {
                stdout_correct: true,
                stderr_correct: true
            }
        );
        let command_2_result = data_ut.make_ag_test_command_result_feedback(
            2,
            {
                stdout_correct: true,
                stderr_correct: null
            }
        );
        let command_3_result = data_ut.make_ag_test_command_result_feedback(
            3,
            {
                stdout_correct: null,
                stderr_correct: true
            }
        );

        let command_4_result = data_ut.make_ag_test_command_result_feedback(
            4,
            {
                stdout_correct: null,
                stderr_correct: null
            }
        );
        case_result.ag_test_command_results = [
            command_1_result,
            command_2_result,
            command_3_result,
            command_4_result
        ];

        expect(wrapper.vm.case_result_output_correctness(case_result)).toEqual(
            CorrectnessLevel.all_correct
        );
    });

    test('case_result_output_correctness - every command has stdout_correct = false ' +
         'AND stderr_correct = false',
         async () => {
        let case_pk = 1;
        let case_result = data_ut.make_ag_test_case_result_feedback(case_pk);
        let command_1_result = data_ut.make_ag_test_command_result_feedback(
            1,
            {
                stdout_correct: false,
                stderr_correct: false
            }
        );
        let command_2_result = data_ut.make_ag_test_command_result_feedback(
            2,
            {
                stdout_correct: false,
                stderr_correct: false
            }
        );
        let command_3_result = data_ut.make_ag_test_command_result_feedback(
            3,
            {
                stdout_correct: false,
                stderr_correct: false
            }
        );

        case_result.ag_test_command_results = [
            command_1_result,
            command_2_result,
            command_3_result
        ];

        expect(wrapper.vm.case_result_output_correctness(case_result)).toEqual(
            CorrectnessLevel.none_correct
        );
    });

    test('case_result_output_correctness - some commands have stdout_correct = false ' +
         'AND stderr_correct = false but not all',
         async () => {
        let case_pk = 1;
        let case_result = data_ut.make_ag_test_case_result_feedback(case_pk);
        let command_1_result = data_ut.make_ag_test_command_result_feedback(
            1,
            {
                stdout_correct: false,
                stderr_correct: true
            }
        );
        let command_2_result = data_ut.make_ag_test_command_result_feedback(
            2,
            {
                stdout_correct: true,
                stderr_correct: false
            }
        );
        let command_3_result = data_ut.make_ag_test_command_result_feedback(
            3,
            {
                stdout_correct: false,
                stderr_correct: false
            }
        );

        case_result.ag_test_command_results = [
            command_1_result,
            command_2_result,
            command_3_result
        ];

        expect(wrapper.vm.case_result_output_correctness(case_result)).toEqual(
            CorrectnessLevel.some_correct
        );
    });

    test('decide_whether_to_open_setup - first_incorrect_setup === null AND ' +
         'first_incorrect_case === null AND setup_level_correctness === none_correct',
         async () => {
        expect(wrapper.vm.first_incorrect_setup).toBeNull();
        expect(wrapper.vm.first_incorrect_case).toBeNull();

        wrapper.vm.ag_test_suite_result.setup_return_code = 1;

        expect(wrapper.vm.setup_correctness_level).toEqual(CorrectnessLevel.none_correct);
        expect(wrapper.vm.decide_whether_to_open_setup()).toBe(true);
    });

    test('decide_whether_to_open_setup - first_incorrect_setup === null AND ' +
         'first_incorrect_case === null AND setup_timed_out === true',
         async () => {
        expect(wrapper.vm.first_incorrect_setup).toBeNull();
        expect(wrapper.vm.first_incorrect_case).toBeNull();

        wrapper.vm.ag_test_suite_result.setup_timed_out = true;

        expect(wrapper.vm.decide_whether_to_open_setup()).toBe(true);

        expect(wrapper.vm.first_incorrect_setup).toEqual(wrapper.vm.ag_test_suite_result);
        expect(wrapper.vm.first_incorrect_case).toBeNull();
    });

    test('decide_whether_to_open_setup - first_incorrect_setup !== null', async () => {
        expect(wrapper.vm.first_incorrect_setup).toBeNull();
        expect(wrapper.vm.first_incorrect_case).toBeNull();

        wrapper.vm.ag_test_suite_result.setup_timed_out = true;

        expect(wrapper.vm.decide_whether_to_open_setup()).toBe(true);

        expect(wrapper.vm.first_incorrect_setup).toEqual(wrapper.vm.ag_test_suite_result);
        expect(wrapper.vm.first_incorrect_case).toBeNull();

        expect(wrapper.vm.decide_whether_to_open_setup()).toBe(true);
    });

    test('decide_whether_to_open_setup - first_incorrect_case !== null', async () => {
        expect(wrapper.vm.first_incorrect_setup).toBeNull();
        expect(wrapper.vm.first_incorrect_case).toBeNull();

        wrapper.vm.ag_test_suite_result.setup_timed_out = true;

        let case_1_result = data_ut.make_ag_test_case_result_feedback(1);

        expect(wrapper.vm.decide_whether_to_open_case(
            CorrectnessLevel.some_correct,
            case_1_result
        )).toBe(true);

        expect(wrapper.vm.first_incorrect_setup).toBeNull();
        expect(wrapper.vm.first_incorrect_case).toEqual(case_1_result);

        expect(wrapper.vm.decide_whether_to_open_setup()).toBe(false);

        expect(wrapper.vm.first_incorrect_setup).toBeNull();
        expect(wrapper.vm.first_incorrect_case).toEqual(case_1_result);
    });

    test('decide_whether_to_open_case - first_incorrect_setup === null AND ' +
         'first_incorrect_case === null AND case_correctness_level = all_correct',
         async () => {
        expect(wrapper.vm.first_incorrect_setup).toBeNull();
        expect(wrapper.vm.first_incorrect_case).toBeNull();

        let case_pk = 1;
        let case_result = data_ut.make_ag_test_case_result_feedback(case_pk);
        let case_level_correctness = CorrectnessLevel.all_correct;

        expect(wrapper.vm.decide_whether_to_open_case(
            case_level_correctness,
            case_result
        )).toBe(false);
    });

    test('decide_whether_to_open_case - first_incorrect_setup === null AND ' +
         'first_incorrect_case === null AND case_correctness_level = not_available',
         async () => {
        expect(wrapper.vm.first_incorrect_setup).toBeNull();
        expect(wrapper.vm.first_incorrect_case).toBeNull();

        let case_pk = 1;
        let case_result = data_ut.make_ag_test_case_result_feedback(case_pk);
        let case_level_correctness = CorrectnessLevel.not_available;

        expect(wrapper.vm.decide_whether_to_open_case(
            case_level_correctness,
            case_result
        )).toBe(false);
    });

    test('decide_whether_to_open_case - first_incorrect_setup === null AND ' +
         'first_incorrect_case === null AND case_correctness_level = some_correct',
         async () => {
        expect(wrapper.vm.first_incorrect_setup).toBeNull();
        expect(wrapper.vm.first_incorrect_case).toBeNull();

        let case_pk = 1;
        let case_result = data_ut.make_ag_test_case_result_feedback(case_pk);
        let case_level_correctness = CorrectnessLevel.some_correct;

        expect(wrapper.vm.decide_whether_to_open_case(
            case_level_correctness,
            case_result
        )).toBe(true);
    });

    test('decide_whether_to_open_case - first_incorrect_setup === null AND ' +
         'first_incorrect_case === null AND case_correctness_level = none_correct',
         async () => {
        expect(wrapper.vm.first_incorrect_setup).toBeNull();
        expect(wrapper.vm.first_incorrect_case).toBeNull();

        let case_pk = 1;
        let case_result = data_ut.make_ag_test_case_result_feedback(case_pk);
        let case_level_correctness = CorrectnessLevel.none_correct;

        expect(wrapper.vm.decide_whether_to_open_case(
            case_level_correctness,
            case_result
        )).toBe(true);
    });

    test('decide_whether_to_open_case - first_incorrect_case !== null',
         async () => {
        let case_1_result = data_ut.make_ag_test_case_result_feedback(1);

        expect(wrapper.vm.first_incorrect_case).toBeNull();

        wrapper.vm.decide_whether_to_open_case(
            CorrectnessLevel.none_correct,
            case_1_result
        );

        expect(wrapper.vm.first_incorrect_case).not.toBeNull();

        let case_2_result = data_ut.make_ag_test_case_result_feedback(2);

        expect(wrapper.vm.decide_whether_to_open_case(
            CorrectnessLevel.none_correct,
            case_2_result
        )).toBe(false);
    });

    test('decide_whether_to_open_case - first_incorrect_setup !== null',
         async () => {
        expect(wrapper.vm.first_incorrect_setup).toBeNull();
        expect(wrapper.vm.first_incorrect_case).toBeNull();

        wrapper.vm.ag_test_suite_result.setup_return_code = 1;
        wrapper.vm.decide_whether_to_open_setup();

        expect(wrapper.vm.first_incorrect_setup).not.toBeNull();

        let case_1_result = data_ut.make_ag_test_case_result_feedback(1);

        expect(wrapper.vm.decide_whether_to_open_case(
            CorrectnessLevel.none_correct,
            case_1_result
        )).toBe(false);
    });
});
