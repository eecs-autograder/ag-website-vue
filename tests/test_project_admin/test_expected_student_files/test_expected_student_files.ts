import { config, mount, Wrapper } from '@vue/test-utils';

import {
    ExpectedStudentFile,
    Project,
    UltimateSubmissionPolicy
} from 'ag-client-typescript';
import * as sinon from "sinon";

import ExpectedStudentFiles from '@/components/project_admin/expected_student_files/expected_student_files.vue';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('ExpectedStudentFiles tests', () => {
    let wrapper: Wrapper<ExpectedStudentFiles>;
    let component: ExpectedStudentFiles;
    let project_1: Project;
    let file_1_has_wildcard: ExpectedStudentFile;
    let file_2_no_wildcard: ExpectedStudentFile;
    let file_3_no_wildcard: ExpectedStudentFile;
    let new_file: ExpectedStudentFile;
    let existing_files: ExpectedStudentFile[];

    beforeEach(() => {
        project_1 = new Project({
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
            instructor_files: [],
            expected_student_files: [],
            has_handgrading_rubric: false,
        });

        file_1_has_wildcard = new ExpectedStudentFile({
            pk: 1,
            project: 10,
            pattern: "elephant*.cpp",
            min_num_matches: 2,
            max_num_matches: 4,
            last_modified: "now"
        });

        file_2_no_wildcard = new ExpectedStudentFile({
            pk: 2,
            project: 10,
            pattern: "monkey?.cpp",
            min_num_matches: 1,
            max_num_matches: 2,
            last_modified: "now"
        });

        file_3_no_wildcard = new ExpectedStudentFile({
            pk: 3,
            project: 10,
            pattern: "penguin.cpp",
            min_num_matches: 1,
            max_num_matches: 1,
            last_modified: "now"
        });

        existing_files = [
            file_1_has_wildcard,
            file_3_no_wildcard,
            file_2_no_wildcard
        ];

        new_file = new ExpectedStudentFile({
            pk: 4,
            project: 10,
            pattern: "zebra.cpp",
            min_num_matches: 1,
            max_num_matches: 1,
            last_modified: "now"
        });

        sinon.stub(ExpectedStudentFile, "get_all_from_project").returns(
            Promise.resolve(existing_files)
        );

        wrapper = mount(ExpectedStudentFiles, {
           propsData: {
               project: project_1
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

    test('Existing files get fetched and sorted', () => {
        expect(component.expected_student_files.length).toEqual(3);
        expect(component.expected_student_files[0]).toEqual(file_1_has_wildcard);
        expect(component.expected_student_files[1]).toEqual(file_2_no_wildcard);
        expect(component.expected_student_files[2]).toEqual(file_3_no_wildcard);
    });

    test('Create a file', async () => {
        expect(component.expected_student_files.length).toEqual(3);

        ExpectedStudentFile.notify_expected_student_file_created(new_file);

        expect(component.expected_student_files.length).toEqual(4);
        expect(component.expected_student_files[0]).toEqual(file_1_has_wildcard);
        expect(component.expected_student_files[1]).toEqual(file_2_no_wildcard);
        expect(component.expected_student_files[2]).toEqual(file_3_no_wildcard);
        expect(component.expected_student_files[3]).toEqual(new_file);
    });

    test('Delete a file', async () => {
        expect(component.expected_student_files.length).toEqual(3);

        ExpectedStudentFile.notify_expected_student_file_deleted(file_2_no_wildcard);
        await component.$nextTick();

        expect(component.expected_student_files.length).toEqual(2);
        expect(component.expected_student_files[0]).toEqual(file_1_has_wildcard);
        expect(component.expected_student_files[1]).toEqual(file_3_no_wildcard);
    });

    test('Edit a file - no pattern to pattern', async () => {
        let updated_file = new ExpectedStudentFile({
            pk: 3,
            project: 10,
            pattern: "aardvarks?.cpp",
            min_num_matches: 1,
            max_num_matches: 6,
            last_modified: "now"
        });

        ExpectedStudentFile.notify_expected_student_file_changed(updated_file);
        await component.$nextTick();

        expect(component.expected_student_files.length).toEqual(3);
        expect(component.expected_student_files[0]).toEqual(updated_file);
        expect(component.expected_student_files[1]).toEqual(file_1_has_wildcard);
        expect(component.expected_student_files[2]).toEqual(file_2_no_wildcard);
    });

    test('Edit a file - pattern to no pattern', async () => {
        let updated_file = new ExpectedStudentFile({
            pk: 2,
            project: 10,
            pattern: "aardvarks.cpp",
            min_num_matches: 1,
            max_num_matches: 1,
            last_modified: "now"
        });

        ExpectedStudentFile.notify_expected_student_file_changed(updated_file);
        await component.$nextTick();

        expect(component.expected_student_files.length).toEqual(3);
        expect(component.expected_student_files[0]).toEqual(updated_file);
        expect(component.expected_student_files[1]).toEqual(file_1_has_wildcard);
        expect(component.expected_student_files[2]).toEqual(file_3_no_wildcard);
    });
});
