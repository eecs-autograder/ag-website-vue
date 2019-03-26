import ExpectedStudentFileForm from '@/components/expected_student_files/expected_student_file_form.vue';
import ExpectedStudentFiles from '@/components/expected_student_files/expected_student_files.vue';
import { config, mount, Wrapper } from '@vue/test-utils';
import {
    ExpectedStudentFile,
    Project,
    UltimateSubmissionPolicy
} from 'ag-client-typescript';
import * as sinon from "sinon";

beforeAll(() => {
    config.logModifiedComponents = false;
});

afterEach(() => {
    sinon.restore();
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
            hide_ultimate_submission_fdbk: false
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
            pattern: "monkey.cpp",
            min_num_matches: 2,
            max_num_matches: 4,
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

    // Needs to be present to get coverage for destroy() in ESFs
    afterEach(() => {
        if (wrapper.exists()) {
            wrapper.destroy();
        }
    });

    function call_notify_expected_student_file_deleted(file_to_delete: ExpectedStudentFile) {
        ExpectedStudentFile.notify_expected_student_file_deleted(file_to_delete);
    }

    function call_notify_expected_student_file_created(created_file: ExpectedStudentFile) {
        console.log("A new file was created!");
        ExpectedStudentFile.notify_expected_student_file_created(created_file);
    }

    function call_notify_expected_student_file_changed(
        file_that_changed: ExpectedStudentFile) {
        ExpectedStudentFile.notify_expected_student_file_changed(file_that_changed);
    }

    test('Existing files get fetched and sorted', () => {
        expect(component.expected_student_files.length).toEqual(3);
        expect(component.expected_student_files[0]).toEqual(file_1_has_wildcard);
        expect(component.expected_student_files[1]).toEqual(file_2_no_wildcard);
        expect(component.expected_student_files[2]).toEqual(file_3_no_wildcard);
    });

    test('Create a file', async () => {
        fail("TypeError: Cannot read property '_isDestroyed' of undefined, regarding " +
             "wrapper.destroy");

        sinon.stub(ExpectedStudentFile, "create").callsFake(
            () => call_notify_expected_student_file_created(new_file)
        );
        expect(component.expected_student_files.length).toEqual(3);

        let create_file_container = wrapper.find({ref: 'create_expected_student_file'});
        let form_component = <ExpectedStudentFileForm> create_file_container.find(
            {ref: 'form'}
        ).vm;
        form_component.d_expected_student_file.pattern = "zebra.cpp";
        await component.$nextTick();

        form_component.submit_form();
        await component.$nextTick();

        expect(component.expected_student_files.length).toEqual(4);
        expect(component.expected_student_files[0]).toEqual(file_1_has_wildcard);
        expect(component.expected_student_files[1]).toEqual(file_2_no_wildcard);
        expect(component.expected_student_files[2]).toEqual(file_3_no_wildcard);
        expect(component.expected_student_files[3]).toEqual(new_file);
    });

    test('Delete a file', async () => {
        wrapper.findAll('.delete-file').at(1).trigger('click');
        await component.$nextTick();

        console.log(wrapper.html());

        let delete_stub = sinon.stub(file_2_no_wildcard, "delete").callsFake(
            () => call_notify_expected_student_file_deleted(file_2_no_wildcard)
        );

        wrapper.find('.modal-delete-button').trigger('click');
        await component.$nextTick();

        expect(delete_stub.calledOnce).toBe(true);
        expect(component.expected_student_files.length).toEqual(2);
        expect(component.expected_student_files[0]).toEqual(file_1_has_wildcard);
        expect(component.expected_student_files[1]).toEqual(file_3_no_wildcard);
    });

    test('Edit a file', async () => {
        fail("Max call stack exceeded");
        let updated_file = new ExpectedStudentFile({
            pk: 3,
            project: 10,
            pattern: "aardvarks?.cpp",
            min_num_matches: 1,
            max_num_matches: 1,
            last_modified: "now"
        });

        let file_to_edit = wrapper.findAll('#single-expected-student-file').at(2);
        file_to_edit.find('.edit-file').trigger('click');
        await component.$nextTick();

        let form_component = <ExpectedStudentFileForm> file_to_edit.find({ref: 'form'}).vm;

        expect(form_component.d_expected_student_file.pattern).toEqual(file_3_no_wildcard.pattern);
        expect(form_component.d_expected_student_file.min_num_matches).toEqual(
            file_3_no_wildcard.min_num_matches
        );
        expect(form_component.d_expected_student_file.max_num_matches).toEqual(
            file_3_no_wildcard.max_num_matches
        );

        // MAX CALL STACK SIZE EXCEEDED from this line?
        form_component.d_expected_student_file.pattern = "aardvarks?.cpp";
        await component.$nextTick();

        sinon.stub(file_3_no_wildcard, "save").callsFake(
            () => call_notify_expected_student_file_changed(updated_file)
        );

        form_component.submit_form();
        await component.$nextTick();

        expect(component.expected_student_files.length).toEqual(3);
        expect(component.expected_student_files[0]).toEqual(file_3_no_wildcard);
        expect(component.expected_student_files[1]).toEqual(file_1_has_wildcard);
        expect(component.expected_student_files[2]).toEqual(file_2_no_wildcard);
    });
});
