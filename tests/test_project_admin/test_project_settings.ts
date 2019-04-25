import APIErrors from '@/components/api_errors.vue';
import ProjectSettings from '@/components/project_admin/project_settings.vue';
import ValidatedInput from '@/components/validated_input.vue';
import { config, mount, Wrapper } from '@vue/test-utils';
import { Project, UltimateSubmissionPolicy } from 'ag-client-typescript';
import { AxiosError } from 'axios';
import * as sinon from 'sinon';

beforeAll(() => {
    config.logModifiedComponents = false;
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

    test('Data members assigned correct values in created()', async () => {
        expect(component.d_project).toEqual(project);
        expect(component.submission_limit_per_day).toEqual("");
        expect(component.total_submission_limit).toEqual("");
        expect(component.has_soft_closing_time).toBe(false);
        expect(component.has_closing_time).toBe(false);
    });

    test('Successful attempt to save project settings', async () => {
        let save_settings_stub = sinon.stub(component.d_project, 'save');

        expect(component.settings_form_is_valid).toBe(true);

        wrapper.find({ref: 'project_settings_form'}).trigger('submit.native');
        await component.$nextTick();

        expect(save_settings_stub.firstCall.thisValue).toEqual(component.d_project);
    });

    test('When submission_limit_per_day_exists, the allow_submissions_past_limit input is ' +
         'accessible ',
         async () => {
        let daily_submission_limit_input = wrapper.find(
            {ref: "daily_submission_limit_input"}
        ).find('#input');

        expect(component.submission_limit_per_day_exists).toBe(false);

        expect(wrapper.findAll('#allow-submissions-past-limit').length).toEqual(0);

        (<HTMLInputElement> daily_submission_limit_input.element).value = "2";
        daily_submission_limit_input.trigger('input');
        await component.$nextTick();

        expect(component.submission_limit_per_day_exists).toBe(true);
        expect(wrapper.findAll('#allow-submissions-past-limit').length).toEqual(1);
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
        let daily_submission_limit_input = wrapper.find(
            {ref: "daily_submission_limit_input"}
        ).find('#input');

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
