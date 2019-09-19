import { config, mount, Wrapper } from '@vue/test-utils';

import {
    ExpectedStudentFile,
    Project,
    UltimateSubmissionPolicy
} from 'ag-client-typescript';
import * as sinon from "sinon";

import ExpectedStudentFiles from '@/components/project_admin/expected_student_files/expected_student_files.vue';

import * as data_ut from '@/tests/data_utils';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('ExpectedStudentFiles tests', () => {
    let wrapper: Wrapper<ExpectedStudentFiles>;
    let component: ExpectedStudentFiles;
    let project: Project;
    let file_1_has_wildcard: ExpectedStudentFile;
    let file_2_no_wildcard: ExpectedStudentFile;
    let file_3_no_wildcard: ExpectedStudentFile;
    let new_file: ExpectedStudentFile;
    let existing_files: ExpectedStudentFile[];

    beforeEach(() => {
        project = data_ut.make_project(data_ut.make_course().pk);

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
            file_2_no_wildcard,
            file_3_no_wildcard,
        ];

        new_file = new ExpectedStudentFile({
            pk: 4,
            project: 10,
            pattern: "zebra.cpp",
            min_num_matches: 1,
            max_num_matches: 1,
            last_modified: "now"
        });

        project.expected_student_files = existing_files;

        wrapper = mount(ExpectedStudentFiles, {
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

    test('Existing files used from project', () => {
        expect(component.expected_student_files.length).toEqual(3);
        expect(component.expected_student_files[0]).toEqual(file_1_has_wildcard);
        expect(component.expected_student_files[1]).toEqual(file_2_no_wildcard);
        expect(component.expected_student_files[2]).toEqual(file_3_no_wildcard);
    });

    // Note that create/delete/edit actions are handled in child components,
    // and the parent project_admin.vue handles observer events.
});
