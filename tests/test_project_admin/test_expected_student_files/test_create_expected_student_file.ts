import { config, mount, Wrapper } from '@vue/test-utils';

import { ExpectedStudentFile, HttpError, Project, UltimateSubmissionPolicy } from 'ag-client-typescript';
import * as sinon from "sinon";

import APIErrors from '@/components/api_errors.vue';
import CreateExpectedStudentFile from '@/components/project_admin/expected_student_files/create_expected_student_file.vue';
import ExpectedStudentFileForm from '@/components/project_admin/expected_student_files/expected_student_file_form.vue';


describe('CreateExpectedStudentFile tests', () => {
    let wrapper: Wrapper<CreateExpectedStudentFile>;
    let component: CreateExpectedStudentFile;
    let project_1: Project;

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

        wrapper = mount(CreateExpectedStudentFile, {
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

    test('Successful creation of a file', async () => {
        let create_stub = sinon.stub(ExpectedStudentFile, 'create');
        let form_wrapper = wrapper.findComponent({ref: 'form'});
        let form_component = <ExpectedStudentFileForm> form_wrapper.vm;
        form_component.d_expected_student_file.pattern = "Giraffe.cpp";
        await component.$nextTick();

        wrapper.findComponent({ref: 'form'}).trigger('submit');
        await component.$nextTick();

        expect(create_stub.getCall(0).args[0]).toEqual(project_1.pk);
        expect(create_stub.getCall(0).args[1]
        ).toEqual({
            pattern: "Giraffe.cpp",
            min_num_matches: 1,
            max_num_matches: 1
        });
    });

    test('Unsuccessful creation of a file - name is not unique', async () => {
        let form_wrapper = wrapper.findComponent({ref: 'form'});
        let form_component = <ExpectedStudentFileForm> form_wrapper.vm;
        form_component.d_expected_student_file.pattern = "Giraffe.cpp";
        await component.$nextTick();

        sinon.stub(ExpectedStudentFile, 'create').rejects(
            new HttpError(400, {__all__: "File with this name already exists in project"})
        );
        wrapper.findComponent({ref: 'form'}).trigger('submit');
        await component.$nextTick();

        let api_errors = <APIErrors> wrapper.findComponent({ref: 'api_errors'}).vm;
        expect(api_errors.d_api_errors.length).toBeGreaterThan(0);
    });

    test("The 'create' button is disabled when an input value is invalid", async () => {
        expect(component.project).toEqual(project_1);

        let form_wrapper = wrapper.findComponent({ref: 'form'});
        let form_component = <ExpectedStudentFileForm> form_wrapper.vm;
        form_component.d_expected_student_file.pattern = "   ";
        await component.$nextTick();

        expect(wrapper.find('.add-file-button').element).toBeDisabled();
        expect(component.pattern_is_valid).toBe(false);
    });
});
