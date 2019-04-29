import APIErrors from '@/components/api_errors.vue';
import ProjectSettings from '@/components/project_admin/project_settings.vue';
import ValidatedInput from '@/components/validated_input.vue';
import { config, mount, Wrapper } from '@vue/test-utils';
import { Project, UltimateSubmissionPolicy } from 'ag-client-typescript';
import { AxiosError } from 'axios';
import moment from 'moment';
import * as sinon from 'sinon';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('ProjectSettings created() tests', () => {
    let wrapper: Wrapper<ProjectSettings>;
    let component: ProjectSettings;
    let project: Project;
    let original_match_media: (query: string) => MediaQueryList;

    beforeEach(() => {
        original_match_media = window.matchMedia;
        Object.defineProperty(window, "matchMedia", {
            value: jest.fn(() => {
                return {matches: true};
            })
        });

        project = new Project({
            pk: 3,
            name: "Project 200",
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
            submission_limit_reset_time: "00:00:00",
            submission_limit_reset_timezone: "",
            num_bonus_submissions: 1,
            total_submission_limit: null,
            allow_late_days: true,
            ultimate_submission_policy: UltimateSubmissionPolicy.best,
            hide_ultimate_submission_fdbk: false
        });
    });

    afterEach(() => {
        Object.defineProperty(window, "matchMedia", {
            value: original_match_media
        });

        if (wrapper.exists()) {
            wrapper.destroy();
        }
    });

    test('Data members assigned correct values in created() - all are null', async () => {
        wrapper = mount(ProjectSettings, {
            propsData: {
                project: project
            }
        });
        component = wrapper.vm;

        expect(component.d_project).toEqual(project);
        expect(component.d_project.submission_limit_per_day).toBeNull();
        expect(component.submission_limit_per_day).toEqual("");
        expect(component.submission_limit_reset_time).toEqual("12:00 AM");

        expect(component.d_project.soft_closing_time).toBeNull();
        expect(component.has_soft_closing_time).toBe(false);
        expect(component.soft_closing_time).toEqual(moment().format("YYYY-MM-DD hh:mm a"));

        expect(component.d_project.closing_time).toBeNull();
        expect(component.has_closing_time).toBe(false);
        expect(component.closing_time).toEqual(moment().format("YYYY-MM-DD hh:mm a"));
    });

    test('Data members assigned correct values in created() - all are NOT null', async () => {
        project.submission_limit_per_day = 2;
        project.soft_closing_time = "2019-04-18T01:48:00Z";
        project.closing_time = "2019-04-18T01:49:00.000Z";

        wrapper = mount(ProjectSettings, {
            propsData: {
                project: project
            }
        });
        component = wrapper.vm;

        expect(component.d_project).toEqual(project);
        expect(component.d_project.submission_limit_per_day).toEqual(2);
        expect(component.submission_limit_per_day).toEqual("2");
        expect(component.submission_limit_reset_time).toEqual("12:00 AM");

        expect(component.d_project.soft_closing_time).not.toBeNull();
        expect(component.has_soft_closing_time).toBe(true);
        expect(component.soft_closing_time).toEqual("2019-04-17 09:48 pm");

        expect(component.d_project.closing_time).not.toBeNull();
        expect(component.has_closing_time).toBe(true);
        expect(component.closing_time).toEqual("2019-04-17 09:49 pm");
    });
});

describe('ProjectSettings tests', () => {
    let wrapper: Wrapper<ProjectSettings>;
    let component: ProjectSettings;
    let project: Project;
    let original_match_media: (query: string) => MediaQueryList;

    beforeEach(() => {
        original_match_media = window.matchMedia;
        Object.defineProperty(window, "matchMedia", {
            value: jest.fn(() => {
                return {matches: true};
            })
        });

        project = new Project({
            pk: 3,
            name: "Project 200",
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

        wrapper = mount(ProjectSettings, {
            propsData: {
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

    // for some reason, v-modeling d_project.submission_limit_per_day is not causing
    // submission_limit_per_day_exists to get re-evaluated when d_project.submission_limit_per_day
    // changes. I think it has something to do with the variable being of type null or number,
    // because d_expected_student_file.pattern is able to cause its computed function
    // to re-evaluate in the expected student file form?
    test('When submission_limit_per_day_exists, the allow_submissions_past_limit input is ' +
          'accessible ',
         async () => {

        expect(component.submission_limit_per_day_exists).toBe(false);
        expect(wrapper.findAll('#allow-submissions-past-limit').length).toEqual(0);

        let daily_submission_limit_input = wrapper.find('#submission-limit-per-day');
        (<HTMLInputElement> daily_submission_limit_input.element).value = "7";
        daily_submission_limit_input.trigger('input');
        await component.$nextTick();

        expect(component.submission_limit_per_day).not.toBeNull();
        expect(component.submission_limit_per_day_exists).toBe(true);
        expect(wrapper.findAll('#allow-submissions-past-limit').length).toEqual(1);
    });

    // Submission policy is not re-evaluating when the nested property changes (just in tests)
    // Should I just make another variable to keep track of the submission policy selected?
    test.skip('submission_policy_selected', async () => {
        expect(component.d_project.ultimate_submission_policy).toEqual(
            project.ultimate_submission_policy
        );
        expect(component.submission_policy_selected).toEqual(
            component.final_graded_submission_policy_options[2].label
        );

        component.d_project.ultimate_submission_policy
            = UltimateSubmissionPolicy.best_with_normal_fdbk;
        await component.$nextTick();
        expect(component.submission_policy_selected).toEqual(
            component.final_graded_submission_policy_options[1].label
        );

        component.d_project.ultimate_submission_policy = UltimateSubmissionPolicy.most_recent;
        await component.$nextTick();
        expect(component.submission_policy_selected).toEqual(
            component.final_graded_submission_policy_options[0].label
        );
    });

    test('d_project.submission_limit_per_day is assigned a non null value in ' +
         'save_project_settings() when the user has entered a numeric input',
         async () => {
        let save_settings_stub = sinon.stub(component.d_project, 'save');

        let daily_submission_limit_input = wrapper.find('#submission-limit-per-day');
        (<HTMLInputElement> daily_submission_limit_input.element).value = "7";
        daily_submission_limit_input.trigger('input');
        await component.$nextTick();

        expect(component.submission_limit_per_day_exists).toBe(true);
        expect(component.settings_form_is_valid).toBe(true);

        wrapper.find({ref: 'project_settings_form'}).trigger('submit.native');
        await component.$nextTick();

        expect(save_settings_stub.firstCall.thisValue.submission_limit_per_day).toEqual(7);
    });

    test('d_project.submission_limit_per_day is assigned a null value in ' +
         'save_project_settings() when the user has entered a non-numeric input',
         async () => {
        let save_settings_stub = sinon.stub(component.d_project, 'save');

        let daily_submission_limit_input = wrapper.find('#submission-limit-per-day');
        (<HTMLInputElement> daily_submission_limit_input.element).value = "blah";
        daily_submission_limit_input.trigger('input');
        await component.$nextTick();

        expect(component.submission_limit_per_day_exists).toBe(false);
        expect(component.settings_form_is_valid).toBe(true);

        wrapper.find({ref: 'project_settings_form'}).trigger('submit.native');
        await component.$nextTick();

        expect(save_settings_stub.firstCall.thisValue.submission_limit_per_day).toBeNull();
    });

    test('d_project.submission_limit_reset_time is assigned the correct value on save()',
         async () => {
        let save_settings_stub = sinon.stub(component.d_project, 'save');

        component.submission_limit_reset_time = "08:45 PM";
        await component.$nextTick();

        expect(component.settings_form_is_valid).toBe(true);

        wrapper.find({ref: 'project_settings_form'}).trigger('submit.native');
        await component.$nextTick();

        expect(save_settings_stub.firstCall.thisValue.submission_limit_reset_time).toEqual(
            "20:45:00"
        );
    });

    test('d_project.soft_closing_time is assigned a non-null value when ' +
         'has_soft_closing_time is true',
         async () => {
        let save_settings_stub = sinon.stub(component.d_project, 'save');
        wrapper.setData({has_soft_closing_time: true});
        component.soft_closing_time = "2019-05-09 09:54 pm";
        await component.$nextTick();

        expect(component.has_soft_closing_time).toBe(true);
        expect(component.settings_form_is_valid).toBe(true);

        wrapper.find({ref: 'project_settings_form'}).trigger('submit.native');
        await component.$nextTick();

        expect(save_settings_stub.firstCall.thisValue.soft_closing_time).toEqual(
            "2019-05-10T01:54:00.000Z"
        );
    });

    test('d_project.soft_closing_time is assigned a null value when ' +
         'has_soft_closing_time is false',
         async () => {
        let save_settings_stub = sinon.stub(component.d_project, 'save');

        wrapper.setData({has_soft_closing_time: true});
        component.soft_closing_time = "2019-04-17 09:48 pm";
        await component.$nextTick();

        wrapper.setData({has_soft_closing_time: false});
        await component.$nextTick();

        expect(component.has_soft_closing_time).toBe(false);
        expect(component.settings_form_is_valid).toBe(true);

        wrapper.find({ref: 'project_settings_form'}).trigger('submit.native');
        await component.$nextTick();

        expect(save_settings_stub.firstCall.thisValue.soft_closing_time).toBeNull();
    });

    test('d_project.closing_time is assigned a non-null value when has_closing_time is true',
         async () => {
        let save_settings_stub = sinon.stub(component.d_project, 'save');
        wrapper.setData({has_closing_time: true});
        component.closing_time = "2019-04-17 09:48 pm";
        await component.$nextTick();

        expect(component.has_closing_time).toBe(true);
        expect(component.settings_form_is_valid).toBe(true);

        wrapper.find({ref: 'project_settings_form'}).trigger('submit.native');
        await component.$nextTick();

        expect(save_settings_stub.firstCall.thisValue.closing_time).toEqual(
            "2019-04-18T01:48:00.000Z"
        );
    });

    test('d_project.closing_time is assigned a null value when has_closing_time is false',
         async () => {
        let save_settings_stub = sinon.stub(component.d_project, 'save');

        wrapper.setData({has_closing_time: true});
        component.closing_time = "2019-04-17 09:48 pm";
        await component.$nextTick();

        wrapper.setData({has_closing_time: false});
        await component.$nextTick();

        expect(component.has_closing_time).toBe(false);
        expect(component.settings_form_is_valid).toBe(true);

        wrapper.find({ref: 'project_settings_form'}).trigger('submit.native');
        await component.$nextTick();

        expect(save_settings_stub.firstCall.thisValue.closing_time).toBeNull();
    });

    test('Successful attempt to save project settings', async () => {
        let save_settings_stub = sinon.stub(component.d_project, 'save');

        expect(component.settings_form_is_valid).toBe(true);

        wrapper.find({ref: 'project_settings_form'}).trigger('submit.native');
        await component.$nextTick();

        expect(save_settings_stub.firstCall.thisValue).toEqual(component.d_project);
    });

    test('Unsuccessful attempt to save project settings', async () => {
        let axios_response_instance: AxiosError = {
            name: 'AxiosError',
            message: 'u heked up',
            response: {
                data: {
                    __all__: "Project with this name already exists in course?"
                },
                status: 400,
                statusText: 'OK',
                headers: {},
                request: {},
                config: {}
            },
            config: {},
        };

        let save_settings_stub = sinon.stub(component.d_project, 'save');
        save_settings_stub.returns(Promise.reject(axios_response_instance));

        expect(component.settings_form_is_valid).toBe(true);

        let project_name_input = wrapper.find({ref: 'project_name_input'}).find('#input');
        (<HTMLInputElement> project_name_input.element).value = "AlreadyExists.cpp";
        project_name_input.trigger('input');
        await component.$nextTick();

        expect(component.settings_form_is_valid).toBe(true);

        wrapper.find({ref: 'project_settings_form'}).trigger('submit.native');
        await component.$nextTick();

        expect(save_settings_stub.calledOnce).toBe(true);

        let api_errors = <APIErrors> wrapper.find({ref: 'api_errors'}).vm;
        expect(api_errors.d_api_errors.length).toBe(1);
    });
});


describe('Invalid input tests', () => {
    let wrapper: Wrapper<ProjectSettings>;
    let component: ProjectSettings;
    let project: Project;
    let original_match_media: (query: string) => MediaQueryList;

    beforeEach(() => {
        original_match_media = window.matchMedia;
        Object.defineProperty(window, "matchMedia", {
            value: jest.fn(() => {
                return {matches: true};
            })
        });

        project = new Project({
            pk: 3,
            name: "Project 200",
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

        wrapper = mount(ProjectSettings, {
            propsData: {
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

    test('Error project name is blank', async () => {
        let project_name_input = wrapper.find({ref: "project_name_input"}).find('#input');
        let project_name_validator = <ValidatedInput> wrapper.find({ref: "project_name_input"}).vm;

        expect(project_name_validator.is_valid).toBe(true);

        (<HTMLInputElement> project_name_input.element).value = "   ";
        project_name_input.trigger('input');
        await component.$nextTick();

        expect(project_name_validator.is_valid).toBe(false);
    });

    test('min_group_size is blank or not a number', async () => {
        let min_num_matches_input = wrapper.find({ref: "min_group_size_input"}).find('#input');
        let min_num_matches_validator = <ValidatedInput> wrapper.find(
            {ref: "min_group_size_input"}
            ).vm;

        expect(min_num_matches_validator.is_valid).toBe(true);

        (<HTMLInputElement> min_num_matches_input.element).value = "   ";
        min_num_matches_input.trigger('input');
        await component.$nextTick();

        expect(min_num_matches_validator.is_valid).toBe(false);

        (<HTMLInputElement> min_num_matches_input.element).value = "Winterfell";
        min_num_matches_input.trigger('input');
        await component.$nextTick();

        expect(min_num_matches_validator.is_valid).toBe(false);
    });

    test('min_group_size is negative', async () => {
        let min_num_matches_input = wrapper.find(
            {ref: "min_group_size_input"}
        ).find('#input');
        let min_num_matches_validator = <ValidatedInput> wrapper.find(
            {ref: "min_group_size_input"}
        ).vm;

        expect(min_num_matches_validator.is_valid).toBe(true);

        (<HTMLInputElement> min_num_matches_input.element).value = "-8";
        min_num_matches_input.trigger('input');
        await component.$nextTick();

        expect(min_num_matches_validator.is_valid).toBe(false);
    });

    test('max_group_size is blank or not a number', async () => {
        let max_num_matches_input = wrapper.find({ref: "max_group_size_input"}).find('#input');
        let max_num_matches_validator = <ValidatedInput> wrapper.find(
            {ref: "max_group_size_input"}
        ).vm;

        expect(max_num_matches_validator.is_valid).toBe(true);

        (<HTMLInputElement> max_num_matches_input.element).value = "   ";
        max_num_matches_input.trigger('input');
        await component.$nextTick();

        expect(max_num_matches_validator.is_valid).toBe(false);

        (<HTMLInputElement> max_num_matches_input.element).value = "Horn Hill";
        max_num_matches_input.trigger('input');
        await component.$nextTick();

        expect(max_num_matches_validator.is_valid).toBe(false);
    });

    test('max_group_size is negative', async () => {
        let max_num_matches_input = wrapper.find(
            {ref: "max_group_size_input"}
        ).find('#input');
        let max_num_matches_validator = <ValidatedInput> wrapper.find(
            {ref: "max_group_size_input"}
        ).vm;

        expect(max_num_matches_validator.is_valid).toBe(true);

        (<HTMLInputElement> max_num_matches_input.element).value = "-8";
        max_num_matches_input.trigger('input');
        await component.$nextTick();

        expect(max_num_matches_validator.is_valid).toBe(false);
    });

    test('Submission_limit_per_day_exists only returns true when the input only consists ' +
         'of numbers',
         async () => {
        let daily_submission_limit_input = wrapper.find('#submission-limit-per-day');

        expect(component.submission_limit_per_day_exists).toBe(false);

        (<HTMLInputElement> daily_submission_limit_input.element).value = "2";
        daily_submission_limit_input.trigger('input');
        await component.$nextTick();

        expect(component.submission_limit_per_day_exists).toBe(true);

        (<HTMLInputElement> daily_submission_limit_input.element).value = "2abc";
        daily_submission_limit_input.trigger('input');
        await component.$nextTick();

        expect(component.submission_limit_per_day_exists).toBe(false);

        (<HTMLInputElement> daily_submission_limit_input.element).value = "abc2";
        daily_submission_limit_input.trigger('input');
        await component.$nextTick();

        expect(component.submission_limit_per_day_exists).toBe(false);

        (<HTMLInputElement> daily_submission_limit_input.element).value = "4abc5";
        daily_submission_limit_input.trigger('input');
        await component.$nextTick();

        expect(component.submission_limit_per_day_exists).toBe(false);

        (<HTMLInputElement> daily_submission_limit_input.element).value = "  ";
        daily_submission_limit_input.trigger('input');
        await component.$nextTick();

        expect(component.submission_limit_per_day_exists).toBe(false);

        (<HTMLInputElement> daily_submission_limit_input.element).value = ".?4";
        daily_submission_limit_input.trigger('input');
        await component.$nextTick();

        expect(component.submission_limit_per_day_exists).toBe(false);

        (<HTMLInputElement> daily_submission_limit_input.element).value = "100";
        daily_submission_limit_input.trigger('input');
        await component.$nextTick();

        expect(component.submission_limit_per_day_exists).toBe(true);
    });

    test('num_bonus_submissions is empty or not a number', async () => {
        let bonus_submissions_input = wrapper.find(
            {ref: "bonus_submissions_input"}
        ).find('#input');
        let bonus_submissions_validator = <ValidatedInput> wrapper.find(
            {ref: "bonus_submissions_input"}
        ).vm;

        expect(bonus_submissions_validator.is_valid).toBe(true);

        (<HTMLInputElement> bonus_submissions_input.element).value = "   ";
        bonus_submissions_input.trigger('input');
        await component.$nextTick();

        expect(bonus_submissions_validator.is_valid).toBe(false);

        (<HTMLInputElement> bonus_submissions_input.element).value = "King's Landing";
        bonus_submissions_input.trigger('input');
        await component.$nextTick();

        expect(bonus_submissions_validator.is_valid).toBe(false);
    });

    test('num_bonus_submissions is negative', async () => {
        let bonus_submissions_input = wrapper.find(
            {ref: "bonus_submissions_input"}
        ).find('#input');
        let bonus_submissions_validator = <ValidatedInput> wrapper.find(
            {ref: "bonus_submissions_input"}
        ).vm;

        expect(bonus_submissions_validator.is_valid).toBe(true);

        (<HTMLInputElement> bonus_submissions_input.element).value = "-18";
        bonus_submissions_input.trigger('input');
        await component.$nextTick();

        expect(bonus_submissions_validator.is_valid).toBe(false);
    });

});
