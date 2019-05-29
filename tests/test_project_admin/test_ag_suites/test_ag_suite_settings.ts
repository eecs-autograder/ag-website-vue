import AGSuiteSettings from '@/components/project_admin/ag_suites/ag_suite_settings.vue';
import { config, mount, Wrapper } from '@vue/test-utils';
import { AxiosError } from 'axios';

import {
    AGTestSuite,
    AGTestSuiteFeedbackConfig, ExpectedStudentFile,
    InstructorFile,
    Project,
    UltimateSubmissionPolicy
} from 'ag-client-typescript';

import * as sinon from "sinon";
import { createDeflateRaw } from 'zlib';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('ExpectedStudentFiles tests', () => {
    let wrapper: Wrapper<AGSuiteSettings>;
    let component: AGSuiteSettings;
    let ag_suite: AGTestSuite;
    let project: Project;
    let student_file_1: ExpectedStudentFile;
    let student_file_2: ExpectedStudentFile;
    let student_file_3: ExpectedStudentFile;
    let instructor_file_1: InstructorFile;
    let instructor_file_2: InstructorFile;
    let instructor_file_3: InstructorFile;
    let default_feedback_config: AGTestSuiteFeedbackConfig;
    let original_match_media: (query: string) => MediaQueryList;

    beforeEach(() => {
        original_match_media = window.matchMedia;
        Object.defineProperty(window, "matchMedia", {
            value: jest.fn(() => {
                return {matches: true};
            })
        });

        default_feedback_config = {
            show_individual_tests: false,
            show_setup_return_code: false,
            show_setup_stderr: false,
            show_setup_stdout: false,
            show_setup_timed_out: false,
            visible: false
        };

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
            pattern: "add_me.cpp",
            min_num_matches: 1,
            max_num_matches: 2,
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
            name: "zebra.cpp",
            size: 2,
            last_modified: "now"
        });

        instructor_file_3 = new InstructorFile({
            pk: 6,
            project: 10,
            name: "add_me.cpp",
            size: 2,
            last_modified: "now"
        });

        ag_suite = new AGTestSuite({
            pk: 1,
            name: "Suite 1",
            project: 10,
            last_modified: "",
            read_only_instructor_files: true,
            setup_suite_cmd: "",
            setup_suite_cmd_name: "",
            sandbox_docker_image: {
                pk: 1,
                name: "Sandy",
                tag: "",
                display_name: "Hi everyone"
            },
            allow_network_access: false,
            deferred: true,
            normal_fdbk_config: default_feedback_config,
            past_limit_submission_fdbk_config: default_feedback_config,
            staff_viewer_fdbk_config: default_feedback_config,
            ultimate_submission_fdbk_config: default_feedback_config,
            ag_test_cases: [],
            instructor_files_needed: [instructor_file_2, instructor_file_1],
            student_files_needed: [student_file_2, student_file_1]
        });

        project = new Project({
            pk: 10,
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
            expected_student_files: [student_file_2, student_file_1, student_file_3],
            instructor_files: [instructor_file_2, instructor_file_1, instructor_file_3]
        });

        wrapper = mount(AGSuiteSettings, {
            propsData: {
                test_suite: ag_suite,
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

    test('Student files & Instructor files get sorted', async () => {
        expect(component.d_test_suite).toEqual(ag_suite);
        expect(component.project).toEqual(project);

        expect(component.d_test_suite!.instructor_files_needed[0]).toEqual(instructor_file_1);
        expect(component.d_test_suite!.instructor_files_needed[1]).toEqual(instructor_file_2);

        expect(component.d_test_suite!.student_files_needed[0]).toEqual(student_file_1);
        expect(component.d_test_suite!.student_files_needed[1]).toEqual(student_file_2);
    });

    test.skip('Adding a student file', () => {

    });

    test('Deleting a student file', async () => {
        expect(component.d_test_suite!.student_files_needed.length).toEqual(2);
        expect(component.d_test_suite!.student_files_needed[0]).toEqual(student_file_1);
        expect(component.d_test_suite!.student_files_needed[1]).toEqual(student_file_2);

        let student_files_section = wrapper.find('.student-files');
        student_files_section.findAll('.file').at(1).find(
            '.delete-file-icon-container'
        ).trigger('click');
        await component.$nextTick();

        expect(component.d_test_suite!.student_files_needed.length).toEqual(1);
        expect(component.d_test_suite!.student_files_needed[0]).toEqual(student_file_1);
    });

    test.skip('Adding an instructor file', () => {

    });

    test('Deleting an instructor file', async () => {
        expect(component.d_test_suite!.instructor_files_needed.length).toEqual(2);
        expect(component.d_test_suite!.instructor_files_needed[0]).toEqual(instructor_file_1);
        expect(component.d_test_suite!.instructor_files_needed[1]).toEqual(instructor_file_2);

        let student_files_section = wrapper.find('.instructor-files');
        student_files_section.findAll('.file').at(1).find(
            '.delete-file-icon-container'
        ).trigger('click');
        await component.$nextTick();

        expect(component.d_test_suite!.instructor_files_needed.length).toEqual(1);
        expect(component.d_test_suite!.instructor_files_needed[0]).toEqual(instructor_file_1);
    });

    test.skip('ExpectedStudentFile filter function on dropdown typeahead', () => {

    });

    test('expected_student_files_available', () => {
        expect(component.expected_student_files_available).toEqual([student_file_3]);
    });

    test.skip('InstructorFile filter function on dropdown typeahead', () => {

    });

    test('instructor_files_available', () => {
        expect(component.instructor_files_available).toEqual([instructor_file_3]);
    });

    test('Save suite settings - successful', async () => {
        let save_stub = sinon.stub(component.d_test_suite!, 'save');

        wrapper.find('#suite-settings-form').trigger('submit.native');
        await component.$nextTick();

        expect(save_stub.calledOnce).toBe(true);
    });

    test('Save suite settings - unsuccessful', async () => {
        let save_stub = sinon.stub(ag_suite, 'save');
        let axios_response_instance: AxiosError = {
            name: 'AxiosError',
            message: 'u heked up',
            response: {
                data: {
                    __all__: "File with this name already exists in project"
                },
                status: 400,
                statusText: 'OK',
                headers: {},
                request: {},
                config: {}
            },
            config: {},
        };
        save_stub.returns(Promise.reject(axios_response_instance));

        wrapper.find('#suite-settings-form').trigger('submit.native');
        await component.$nextTick();

        expect(save_stub.calledOnce).toBe(true);
    });

    test('Delete a Suite', async () => {
        let delete_stub = sinon.stub(component.d_test_suite!, 'delete');



        expect(delete_stub.calledOnce).toBe(true);
    });
});
