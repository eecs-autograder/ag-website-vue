import APIErrors from '@/components/api_errors.vue';
import CreateExpectedStudentFile from '@/components/expected_student_files/create_expected_student_file.vue';
import ExpectedStudentFileForm from '@/components/expected_student_files/expected_student_file_form.vue';
import { config, mount, Wrapper } from '@vue/test-utils';
import { ExpectedStudentFile, Project, UltimateSubmissionPolicy } from 'ag-client-typescript';
import { AxiosError } from 'axios';
import * as sinon from "sinon";

beforeAll(() => {
    config.logModifiedComponents = false;
});

afterEach(() => {
   sinon.restore();
});

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
            hide_ultimate_submission_fdbk: false
        });

        wrapper = mount(CreateExpectedStudentFile, {
            propsData: {
                project: project_1
            }
        });
        component = wrapper.vm;
    });

    test('Successful creation of a file', async () => {
        fail("The only way for the test to pass is to call the function for submitting, " +
             "but the event should really come from the form - so we know the form is valid" +
             "but that approach is not working right now.");
        let create_stub = sinon.stub(ExpectedStudentFile, 'create');

        let form_wrapper = wrapper.find({ref: 'form'});
        let form_component = <ExpectedStudentFileForm> form_wrapper.vm;
        form_component.d_expected_student_file.pattern = "Giraffe.cpp";
        await component.$nextTick();

        form_component.submit_form();
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
        fail("The only way for the test to pass is to call the function for submitting, " +
             "but the event should really come from the form - so we know the form is valid" +
             "but that approach is not working right now.");
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

        let form_wrapper = wrapper.find({ref: 'form'});
        let form_component = <ExpectedStudentFileForm> form_wrapper.vm;
        form_component.d_expected_student_file.pattern = "Giraffe.cpp";
        await component.$nextTick();

        sinon.stub(ExpectedStudentFile, 'create').rejects(axios_response_instance);
        form_component.submit_form();
        await component.$nextTick();

        let api_errors = <APIErrors> wrapper.find({ref: 'api_errors'}).vm;
        expect(api_errors.d_api_errors.length).toBeGreaterThan(0);
    });

    test("The 'create' button is disabled when an input value is invalid", async () => {
        fail("The button is always registering as disabled so this test passing " +
             "really doesnt prove anything");
        let create_stub = sinon.stub(ExpectedStudentFile, 'create');

        expect(component.project).toEqual(project_1);

        let form_wrapper = wrapper.find({ref: 'form'});

        expect(wrapper.find('.add-file-button').is('[disabled]')).toBe(true);

        form_wrapper.trigger('submit.native');
        await component.$nextTick();

        expect(create_stub.callCount).toEqual(0);
    });
});
