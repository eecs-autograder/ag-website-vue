import * as vue_test_utils from '@vue/test-utils';

import {
    AGCommand,
    AGTestCase,
    AGTestCaseFeedbackConfig,
    AGTestCaseResultFeedback,
    AGTestCommand,
    AGTestCommandFeedbackConfig,
    AGTestCommandResultFeedback,
    AGTestSuite,
    AGTestSuiteFeedbackConfig,
    AGTestSuiteResultFeedback,
    Annotation,
    BugsExposedFeedbackLevel,
    Course,
    Criterion,
    ExpectedOutputSource,
    ExpectedReturnCode,
    ExpectedStudentFile,
    GradingStatus,
    Group,
    GroupWithHandgradingResultSummary,
    HandgradingResult,
    HandgradingRubric,
    InstructorFile,
    MutationTestSuite,
    MutationTestSuiteFeedbackConfig,
    MutationTestSuiteResultFeedback,
    PointsStyle,
    Project,
    Semester,
    StdinSource,
    Submission,
    SubmissionResultFeedback,
    SubmissionWithResults,
    UltimateSubmissionPolicy,
    User,
    UserRoles,
    ValueFeedbackLevel,
} from 'ag-client-typescript';

import { GlobalData } from '@/app.vue';
import { safe_assign } from "@/utils";

function* counter() {
    let count = 1;
    while (true) {
        yield count;
        count += 1;
    }
}

export function set_global_current_user(user: User) {
   provided_global_data().current_user = user;
}

export function set_global_current_course(course: Course) {
   provided_global_data().current_course = course;
}

export function set_global_current_project(project: Project) {
   provided_global_data().current_project = project;
}

export function reset_provided_global_data() {
    vue_test_utils.config.provide!['globals'] = undefined;
}

function provided_global_data(): GlobalData {
    if (vue_test_utils.config.provide!['globals'] === undefined) {
        vue_test_utils.config.provide!['globals'] = new GlobalData();
    }
    return vue_test_utils.config.provide!['globals'];
}

const USER_PKS = counter();

export function make_user(args: Partial<User> = {}): User {
    let defaults = {
        pk: USER_PKS.next().value,
        username: `user_${random_id()}`,
        first_name: `First${random_id()}`,
        last_name: `Last${random_id()}`,
        email: '',
        is_superuser: false,
    };
    safe_assign(defaults, args);
    return new User(defaults);
}

export function make_user_roles(args: Partial<UserRoles> = {}): UserRoles {
    let defaults = {
        is_admin: false,
        is_staff: false,
        is_student: false,
        is_handgrader: false,
    };
    safe_assign(defaults, args);
    return new UserRoles(defaults);
}

const COURSE_PKS = counter();

export function make_course(args: Partial<Course> = {}): Course {
    let defaults = {
        pk: COURSE_PKS.next().value,
        name: `Course ${random_id()}`,
        semester: Semester.winter,
        year: 2019,
        subtitle: '',
        num_late_days: 0,
        allowed_guest_domain: '',
        last_modified: now_str()
    };
    safe_assign(defaults, args);
    return new Course(defaults);
}

const PROJECT_PKS = counter();

export function make_project(course_pk: number, args: Partial<Project> = {}): Project {
    let defaults = {
        pk: PROJECT_PKS.next().value,
        name: `Project ${random_id()}`,
        course: course_pk,
        last_modified: now_str(),
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
        num_bonus_submissions: 0,
        total_submission_limit: null,
        allow_late_days: true,
        ultimate_submission_policy: UltimateSubmissionPolicy.best,
        hide_ultimate_submission_fdbk: false,
        instructor_files: [],
        expected_student_files: [],
        has_handgrading_rubric: false,
    };
    safe_assign(defaults, args);
    defaults.course = course_pk;
    return new Project(defaults);
}

const EXPECTED_STUDENT_FILE_PKS = counter();

export function make_expected_student_file(
    project_pk: number, pattern: string, args: Partial<ExpectedStudentFile> = {}
): ExpectedStudentFile {
    let defaults = {
        pk: EXPECTED_STUDENT_FILE_PKS.next().value,
        project: project_pk,
        pattern: pattern,
        min_num_matches: 1,
        max_num_matches: 1,
        last_modified: now_str(),
    };
    safe_assign(defaults, args);
    defaults.project = project_pk;
    return new ExpectedStudentFile(defaults);
}

const INSTRUCTOR_FILE_PKS = counter();

export function make_instructor_file(
    project_pk: number, name: string, args: Partial<InstructorFile> = {}
): InstructorFile {
    let defaults = {
        pk: INSTRUCTOR_FILE_PKS.next().value,
        project: project_pk,
        name: name,
        size: rand_int(1000),
        last_modified: now_str(),
    };
    safe_assign(defaults, args);
    defaults.project = project_pk;
    return new InstructorFile(defaults);
}

const GROUP_PKS = counter();

export function make_group(project_pk: number,
                           num_members: number = 1,
                           args: Partial<Group> = {}): Group {
    let defaults = {
        pk: GROUP_PKS.next().value,
        project: project_pk,
        member_names: Array(num_members).fill('').map(() => `user_${random_id()}`),
        extended_due_date: null,
        bonus_submissions_remaining: 0,
        late_days_used: {},
        num_submissions: 0,
        num_submits_towards_limit: 0,
        created_at: now_str(),
        last_modified: now_str(),
    };
    safe_assign(defaults, args);
    defaults.project = project_pk;
    return new Group(defaults);
}

const SUBMISSION_PKS = counter();

export function make_submission(group: Group, args: Partial<Submission> = {}): Submission {
    let defaults = {
        pk: SUBMISSION_PKS.next().value,
        group: group.pk,
        timestamp: now_str(),
        submitter: group.member_names[0],
        submitted_filenames: [],
        discarded_files: [],
        missing_files: {},
        status: GradingStatus.received,
        count_towards_daily_limit: true,
        is_past_daily_limit: false,
        is_bonus_submission: false,
        count_towards_total_limit: true,
        does_not_count_for: [],
        position_in_queue: 0,
        last_modified: now_str(),
    };
    safe_assign(defaults, args);
    defaults.group = group.pk;
    return new Submission(defaults);
}

export function make_submission_with_results(
    group: Group,
    submission_args: Partial<Submission> = {},
    result_args: Partial<SubmissionResultFeedback> = {}
): SubmissionWithResults {
    let submission = make_submission(group, submission_args);
    let result_defaults = {
        pk: submission.pk,
        total_points: 0,
        total_points_possible: 0,
        ag_test_suite_results: [],
        student_test_suite_results: [],
    };
    safe_assign(result_defaults, result_args);
    return {
        results: result_defaults,
        ...submission
    };
}

const AG_TEST_SUITE_PKS = counter();

export function make_ag_test_suite(project_pk: number,
                                   args: Partial<AGTestSuite> = {}): AGTestSuite {
    let defaults = {
        pk: AG_TEST_SUITE_PKS.next().value,
        name: `AG Test Suite ${random_id()}`,
        project: project_pk,
        last_modified: now_str(),
        read_only_instructor_files: true,
        setup_suite_cmd: "",
        setup_suite_cmd_name: "",
        sandbox_docker_image: {
            pk: 1,
            name: "default",
            tag: "default",
            display_name: "Default"
        },
        allow_network_access: false,
        deferred: true,
        normal_fdbk_config: make_ag_test_suite_fdbk_config(),
        past_limit_submission_fdbk_config: make_ag_test_suite_fdbk_config(),
        staff_viewer_fdbk_config: make_ag_test_suite_fdbk_config(),
        ultimate_submission_fdbk_config: make_ag_test_suite_fdbk_config(),
        ag_test_cases: [],
        instructor_files_needed: [],
        student_files_needed: []
    };
    safe_assign(defaults, args);
    defaults.project = project_pk;
    return new AGTestSuite(defaults);
}

export function make_ag_test_suite_fdbk_config(
        args: Partial<AGTestSuiteFeedbackConfig> = {}): AGTestSuiteFeedbackConfig {
    let defaults = {
        show_individual_tests: false,
        show_setup_return_code: false,
        show_setup_stderr: false,
        show_setup_stdout: false,
        show_setup_timed_out: false,
        visible: false
    };
    safe_assign(defaults, args);
    return defaults;
}

const AG_TEST_CASE_PKS = counter();

export function make_ag_test_case(ag_test_suite_pk: number,
                                  args: Partial<AGTestCase> = {}): AGTestCase {
    let defaults = {
        pk: AG_TEST_CASE_PKS.next().value,
        name: `AG Test Case ${random_id()}`,
        ag_test_suite: ag_test_suite_pk,
        normal_fdbk_config: make_ag_test_case_feedback_config(),
        ultimate_submission_fdbk_config: make_ag_test_case_feedback_config(),
        past_limit_submission_fdbk_config: make_ag_test_case_feedback_config(),
        staff_viewer_fdbk_config: make_ag_test_case_feedback_config(),
        last_modified: '',
        ag_test_commands: []
    };
    safe_assign(defaults, args);
    defaults.ag_test_suite = ag_test_suite_pk;
    return new AGTestCase(defaults);
}

export function make_ag_test_case_feedback_config(args: Partial<AGTestCaseFeedbackConfig> = {}) {
    let defaults = {
        visible: false,
        show_individual_commands: false
    };
    safe_assign(defaults, args);
    return defaults;
}

const AG_TEST_COMMAND_PKS = counter();

export function make_ag_test_command(ag_test_case_pk: number,
                                     args: Partial<AGTestCommand> = {}): AGTestCommand {
    let defaults = {
        pk: AG_TEST_COMMAND_PKS.next().value,
        name: `AG Test Command ${random_id()}`,
        ag_test_case: ag_test_case_pk,
        last_modified: now_str(),
        cmd: "true",
        stdin_source: StdinSource.none,
        stdin_text: "",
        stdin_instructor_file: null,
        expected_return_code: ExpectedReturnCode.none,
        expected_stdout_source: ExpectedOutputSource.none,
        expected_stdout_text: "",
        expected_stdout_instructor_file: null,
        expected_stderr_source: ExpectedOutputSource.none,
        expected_stderr_text: "",
        expected_stderr_instructor_file: null,
        ignore_case: false,
        ignore_whitespace: false,
        ignore_whitespace_changes: false,
        ignore_blank_lines: false,
        points_for_correct_return_code: 0,
        points_for_correct_stdout: 0,
        points_for_correct_stderr: 0,
        deduction_for_wrong_return_code: 0,
        deduction_for_wrong_stdout: 0,
        deduction_for_wrong_stderr: 0,
        normal_fdbk_config: make_ag_test_command_fdbk_config(),
        first_failed_test_normal_fdbk_config: null,
        ultimate_submission_fdbk_config: make_ag_test_command_fdbk_config(),
        past_limit_submission_fdbk_config: make_ag_test_command_fdbk_config(),
        staff_viewer_fdbk_config: make_ag_test_command_fdbk_config(),
        time_limit: 10,
        stack_size_limit: 10000000,
        virtual_memory_limit: 500000000,
        process_spawn_limit: 0
    };
    safe_assign(defaults, args);
    defaults.ag_test_case = ag_test_case_pk;
    return new AGTestCommand(defaults);
}

export function make_ag_test_command_fdbk_config(
        args: Partial<AGTestCommandFeedbackConfig> = {}): AGTestCommandFeedbackConfig {
    let defaults = {
        visible: false,
        return_code_fdbk_level: ValueFeedbackLevel.no_feedback,
        stdout_fdbk_level: ValueFeedbackLevel.no_feedback,
        stderr_fdbk_level: ValueFeedbackLevel.no_feedback,
        show_points: false,
        show_actual_return_code: false,
        show_actual_stdout: false,
        show_actual_stderr: false,
        show_whether_timed_out: false
    };
    safe_assign(defaults, args);
    return defaults;
}

export function make_ag_command(args: Partial<AGCommand> = {}): AGCommand {
    let defaults = {
        name: '',
        cmd: 'true',
        time_limit: 10,
        stack_size_limit: 10000000,
        virtual_memory_limit: 500000000,
        process_spawn_limit: 0,
    };
    safe_assign(defaults, args);
    return defaults;
}

const MUTATION_TEST_SUITE_PKS = counter();

export function make_mutation_test_suite(
        project_pk: number,
        args: Partial<MutationTestSuite> = {}): MutationTestSuite {
    let defaults = {
        pk: MUTATION_TEST_SUITE_PKS.next().value,
        name: `Mutation Test Suite ${random_id()}`,
        project: project_pk,
        last_modified: now_str(),
        read_only_instructor_files: true,
        buggy_impl_names: [],
        use_setup_command: false,
        setup_command: make_ag_command(),
        get_student_test_names_command: make_ag_command(),
        max_num_student_tests: 10,
        student_test_validity_check_command: make_ag_command(),
        grade_buggy_impl_command: make_ag_command(),
        points_per_exposed_bug: "0",
        max_points: null,
        deferred: false,
        sandbox_docker_image: {
            pk: 1,
            name: "default",
            tag: "default",
            display_name: "Default"
        },
        allow_network_access: false,
        normal_fdbk_config: make_mutation_test_suite_fdbk_config(),
        ultimate_submission_fdbk_config: make_mutation_test_suite_fdbk_config(),
        past_limit_submission_fdbk_config: make_mutation_test_suite_fdbk_config(),
        staff_viewer_fdbk_config: make_mutation_test_suite_fdbk_config(),
        instructor_files_needed: [],
        student_files_needed: [],
    };
    safe_assign(defaults, args);
    defaults.project = project_pk;
    return new MutationTestSuite(defaults);
}

export function make_mutation_test_suite_fdbk_config(
        args: Partial<MutationTestSuiteFeedbackConfig> = {}): MutationTestSuiteFeedbackConfig {
    let defaults = {
        visible: false,
        show_setup_return_code: false,
        show_setup_stdout: false,
        show_setup_stderr: false,
        show_invalid_test_names: false,
        show_points: false,
        bugs_exposed_fdbk_level: BugsExposedFeedbackLevel.exposed_bug_names,
        show_get_test_names_return_code: false,
        show_get_test_names_stdout: false,
        show_get_test_names_stderr: false,
        show_validity_check_stdout: false,
        show_validity_check_stderr: false,
        show_grade_buggy_impls_stdout: false,
        show_grade_buggy_impls_stderr: false
    };
    safe_assign(defaults, args);
    return defaults;
}

const AG_TEST_COMMAND_RESULT_FEEDBACK_PKS = counter();

export function make_ag_test_command_result_feedback(
    ag_test_command_pk: number,
    args: Partial<AGTestCommandResultFeedback> = {}): AGTestCommandResultFeedback {
    let defaults = {
        pk: AG_TEST_COMMAND_RESULT_FEEDBACK_PKS.next().value,
        ag_test_command_pk: ag_test_command_pk,
        ag_test_command_name: `AG Test Command ${ag_test_command_pk}`,
        fdbk_settings: make_ag_test_command_fdbk_config(),
        timed_out: false,
        return_code_correct: null,
        expected_return_code: null,
        actual_return_code: null,
        return_code_points: 0,
        return_code_points_possible: 0,
        stdout_correct: null,
        stdout_points: 0,
        stdout_points_possible: 0,
        stderr_correct: null,
        stderr_points: 0,
        stderr_points_possible: 0,
        total_points: 0,
        total_points_possible: 0
    };
    safe_assign(defaults, args);
    return defaults;
}

const AG_TEST_CASE_RESULT_FEEDBACK_PKS = counter();

export function make_ag_test_case_result_feedback(
    ag_test_case_pk: number,
    args: Partial<AGTestCaseResultFeedback> = {}): AGTestCaseResultFeedback {
    let defaults = {
        pk: AG_TEST_CASE_RESULT_FEEDBACK_PKS.next().value,
        ag_test_case_pk: ag_test_case_pk,
        ag_test_case_name: `AG Test Case ${ag_test_case_pk}`,
        fdbk_settings: make_ag_test_case_feedback_config(),
        total_points: 0,
        total_points_possible: 0,
        ag_test_command_results: []
    };
    safe_assign(defaults, args);
    return defaults;
}

const AG_TEST_SUITE_RESULT_FEEDBACK_PKS = counter();

export function make_ag_test_suite_result_feedback(
    ag_test_suite_pk: number,
    args: Partial<AGTestSuiteResultFeedback> = {}): AGTestSuiteResultFeedback {
    let defaults = {
        pk: AG_TEST_SUITE_RESULT_FEEDBACK_PKS.next().value,
        ag_test_suite_pk: ag_test_suite_pk,
        ag_test_suite_name: `AG Test Suite ${ag_test_suite_pk}`,
        fdbk_settings: make_ag_test_suite_fdbk_config(),
        total_points: 0,
        total_points_possible: 0,
        setup_name: null,
        setup_return_code: null,
        setup_timed_out: null,
        ag_test_case_results: []
    };
    safe_assign(defaults, args);
    return defaults;
}

const MUTATION_TEST_SUITE_RESULT_FEEDBACK_PKS = counter();

export function make_mutation_test_suite_result_feedback(
    mutation_test_suite_pk: number,
    args: Partial<MutationTestSuiteResultFeedback> = {}): MutationTestSuiteResultFeedback {
    let defaults = {
        pk: MUTATION_TEST_SUITE_RESULT_FEEDBACK_PKS.next().value,
        student_test_suite_name: `Mutation Test Suite ${mutation_test_suite_pk}`,
        student_test_suite_pk: mutation_test_suite_pk,
        fdbk_settings: make_mutation_test_suite_fdbk_config(),
        has_setup_command: false,
        setup_command_name: null,
        setup_return_code: null,
        setup_timed_out: null,
        get_student_test_names_return_code: null,
        get_student_test_names_timed_out: null,
        student_tests: [],
        discarded_tests: [],
        invalid_tests: null,
        timed_out_tests: null,
        num_bugs_exposed: null,
        bugs_exposed: null,
        total_points: 0,
        total_points_possible: 0
    };
    safe_assign(defaults, args);
    return defaults;
}

const HANDGRADING_RUBRIC_PKS = counter();

export function make_handgrading_rubric(project_pk: number,
                                        args: Partial<HandgradingRubric> = {}): HandgradingRubric {
    let defaults = {
        pk: HANDGRADING_RUBRIC_PKS.next().value,
        project: project_pk,
        last_modified: now_str(),
        criteria: [],
        annotations: [],
        handgraders_can_leave_comments: false,
        handgraders_can_adjust_points: false,
        points_style: PointsStyle.start_at_zero_and_add,
        max_points: null,
        show_grades_and_rubric_to_students: false,
    };
    safe_assign(defaults, args);
    defaults.project = project_pk;
    return new HandgradingRubric(defaults);
}

const HANDGRADING_RESULT_PKS = counter();

export function make_handgrading_result(handgrading_rubric: HandgradingRubric,
                                        group_pk: number,
                                        submission_pk: number,
                                        args: Partial<HandgradingResult> = {}): HandgradingResult {
    let defaults = {
        pk: HANDGRADING_RESULT_PKS.next().value,
        handgrading_rubric: handgrading_rubric,
        group: group_pk,
        submission: submission_pk,
        last_modified: now_str(),
        finished_grading: false,
        points_adjustment: 0,
        submitted_filenames: [],
        total_points: 0,
        total_points_possible: 0,
        applied_annotations: [],
        comments: [],
        criterion_results: [],
    };
    safe_assign(defaults, args);
    return new HandgradingResult(defaults);
}

export function make_group_summary(
    project_pk: number,
    num_members: number = 1,
    group_args: Partial<Group> = {},
    handgrading_result: {
        finished_grading: boolean;
        total_points: number;
        total_points_possible: number;
    } | null = null
): GroupWithHandgradingResultSummary {
    let group = make_group(project_pk, num_members, group_args);
    return {
        handgrading_result: handgrading_result,
        ...group
    };
}

const CRITERION_PKS = counter();

export function make_criterion(rubric_pk: number,
                               args: Partial<Criterion> = {}): Criterion {
    let defaults = {
        pk: CRITERION_PKS.next().value,
        handgrading_rubric: rubric_pk,
        short_description: 'An criteria',
        long_description: '',
        points: 0,
        last_modified: now_str(),
    };
    safe_assign(defaults, args);
    defaults.handgrading_rubric = rubric_pk;
    return new Criterion(defaults);
}

const ANNOTATION_PKS = counter();

export function make_annotation(rubric_pk: number,
                                args: Partial<Annotation> = {}): Annotation {
    let defaults = {
        pk: ANNOTATION_PKS.next().value,
        handgrading_rubric: rubric_pk,
        short_description: 'An criteria',
        long_description: '',
        deduction: 0,
        max_deduction: null,
        last_modified: now_str(),
    };
    safe_assign(defaults, args);
    defaults.handgrading_rubric = rubric_pk;
    return new Annotation(defaults);
}

function random_id() {
    let result = '';
    let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 20; ++i) {
        result += chars.charAt(rand_int(chars.length - 1));
    }
    return result;
}

function rand_int(max: number) {
    return Math.floor(Math.random() * max);
}

function now_str() {
    return (new Date()).toISOString();
}
