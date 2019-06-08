import { config, mount, Wrapper } from '@vue/test-utils';

import { Course, Semester } from 'ag-client-typescript';
import { AxiosError } from 'axios';
import * as sinon from 'sinon';

import APIErrors from '@/components/api_errors.vue';
import CourseSettings from '@/components/course_admin/course_settings.vue';
import ValidatedForm from '@/components/validated_form.vue';
import ValidatedInput from '@/components/validated_input.vue';

import {
    expect_html_element_has_value,
    get_validated_input_text,
    set_validated_input_text,
    validated_input_is_valid
} from "@/tests/utils";

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('CourseSettings.vue', () => {
    let wrapper: Wrapper<CourseSettings>;
    let component: CourseSettings;
    let course: Course;

    beforeEach(() => {
        course = new Course({
            pk: 1, name: 'EECS 280', semester: Semester.winter, year: 2019, subtitle: '',
            num_late_days: 0, allowed_guest_domain: '', last_modified: ''
        });

        wrapper = mount(CourseSettings, {
            propsData: {
                course: course,
            }
        });
        component = wrapper.vm;
    });

    afterEach(() => {
        sinon.restore();
    });

    test('Course name is not the empty string - violates condition', async () => {
        let validated_name_input = <ValidatedInput> wrapper.find({ref: 'course_name_input'}).vm;
        let name_input = wrapper.find({ref: 'course_name_input'}).find('#input');

        expect(component.d_course.name).toEqual(course.name);
        expect(validated_name_input.is_valid).toBe(true);

        (<HTMLInputElement> name_input.element).value = "     ";
        name_input.trigger('input');
        await component.$nextTick();

        expect(validated_name_input.is_valid).toBe(false);
    });

    test('Semester binding', () => {
        let semester_select = wrapper.find('#semester');

        semester_select.setValue(Semester.summer);
        expect(component.d_course.semester).toEqual(Semester.summer);

        semester_select.setValue(Semester.winter);
        expect(component.d_course.semester).toEqual(Semester.winter);

        component.d_course.semester = Semester.spring;
        expect_html_element_has_value(semester_select, Semester.spring);
    });

    test('Year must be a number - violates condition', async () => {
        let validated_year_input = <ValidatedInput> wrapper.find({ref: 'course_year_input'}).vm;
        let year_input = wrapper.find({ref: 'course_year_input'}).find('#input');

        expect(component.d_course.year).toEqual(2019);
        expect(validated_year_input.is_valid).toBe(true);

        (<HTMLInputElement> year_input.element).value = "twenty-nineteen";
        year_input.trigger('input');

        expect(validated_year_input.is_valid).toBe(false);
    });

    test('Year must be an integer - violates condition', async () => {
        let validated_year_input = <ValidatedInput> wrapper.find({ref: 'course_year_input'}).vm;
        let year_input = wrapper.find({ref: 'course_year_input'}).find('#input');

        expect(component.d_course.year).toEqual(2019);
        expect(validated_year_input.is_valid).toBe(true);

        (<HTMLInputElement> year_input.element).value = "2020.5";
        year_input.trigger('input');

        expect(validated_year_input.is_valid).toBe(false);
    });

    test('Year must be a valid year (greater >= 2000) - violates condition', async () => {
        let validated_year_input = <ValidatedInput> wrapper.find({ref: 'course_year_input'}).vm;
        let year_input = wrapper.find({ref: 'course_year_input'}).find('#input');

        expect(component.d_course.year).toEqual(2019);
        expect(validated_year_input.is_valid).toBe(true);

        (<HTMLInputElement> year_input.element).value = "1999";
        year_input.trigger('input');

        expect(validated_year_input.is_valid).toBe(false);
    });

    test('Year must be a valid year (greater >= 2000) - meets condition', async () => {
        let validated_year_input = <ValidatedInput> wrapper.find({ref: 'course_year_input'}).vm;
        let year_input = wrapper.find({ref: 'course_year_input'}).find('#input');

        expect(component.d_course.year).toEqual(2019);
        expect(validated_year_input.is_valid).toBe(true);

        (<HTMLInputElement> year_input.element).value = "2000";
        year_input.trigger('input');

        expect(validated_year_input.is_valid).toBe(true);
    });

    test('Year must not be empty - violates condition', async () => {
        let validated_year_input = <ValidatedInput> wrapper.find({ref: 'course_year_input'}).vm;
        let year_input = wrapper.find({ref: 'course_year_input'}).find('#input');

        expect(component.d_course.year).toEqual(2019);
        expect(validated_year_input.is_valid).toBe(true);

        (<HTMLInputElement> year_input.element).value = "";
        year_input.trigger('input');

        expect(validated_year_input.is_valid).toBe(false);
    });

    test('Late days cannot be negative - violates condition', async () => {
        let validated_late_days_input = <ValidatedInput> wrapper.find(
            {ref: 'course_late_days_input'}).vm;
        let late_days_input = wrapper.find({ref: 'course_late_days_input'}).find('#input');

        expect(component.d_course.num_late_days).toEqual(0);
        expect(validated_late_days_input.is_valid).toBe(true);

        (<HTMLInputElement> late_days_input.element).value = "-1";
        late_days_input.trigger('input');

        expect(validated_late_days_input.is_valid).toBe(false);
    });

    test('Late days cannot be negative - meets condition', async () => {
        let validated_late_days_input = <ValidatedInput> wrapper.find(
            {ref: 'course_late_days_input'}).vm;
        let late_days_input = wrapper.find({ref: 'course_late_days_input'}).find('#input');

        expect(component.d_course.num_late_days).toEqual(0);
        expect(validated_late_days_input.is_valid).toBe(true);

        (<HTMLInputElement> late_days_input.element).value = "0";
        late_days_input.trigger('input');

        expect(validated_late_days_input.is_valid).toBe(true);
    });

    test('Late days must be a number - violates condition', async () => {
        let validated_late_days_input = <ValidatedInput> wrapper.find(
            {ref: 'course_late_days_input'}).vm;
        let late_days_input = wrapper.find({ref: 'course_late_days_input'}).find('#input');

        expect(component.d_course.num_late_days).toEqual(0);
        expect(validated_late_days_input.is_valid).toBe(true);

        (<HTMLInputElement> late_days_input.element).value = "zero";
        late_days_input.trigger('input');

        expect(validated_late_days_input.is_valid).toBe(false);
    });

    test('Late days must be an integer - violates condition', async () => {
        let validated_late_days_input = <ValidatedInput> wrapper.find(
            {ref: 'course_late_days_input'}).vm;
        let late_days_input = wrapper.find({ref: 'course_late_days_input'}).find('#input');

        expect(component.d_course.num_late_days).toEqual(0);
        expect(validated_late_days_input.is_valid).toBe(true);

        (<HTMLInputElement> late_days_input.element).value = "1.5";
        late_days_input.trigger('input');

        expect(validated_late_days_input.is_valid).toBe(false);
    });

    test('Late days cannot be empty - violates condition', async () => {
        let validated_late_days_input = <ValidatedInput> wrapper.find(
            {ref: 'course_late_days_input'}).vm;
        let late_days_input = wrapper.find({ref: 'course_late_days_input'}).find('#input');

        expect(component.d_course.num_late_days).toEqual(0);
        expect(validated_late_days_input.is_valid).toBe(true);

        (<HTMLInputElement> late_days_input.element).value = "";
        late_days_input.trigger('input');

        expect(validated_late_days_input.is_valid).toBe(false);
    });

    test('Allowed guest domain binding', () => {
        let allowed_guest_domain_input = wrapper.find('#allowed-guest-domain');

        set_validated_input_text(allowed_guest_domain_input, '@llama.net');
        expect(component.d_course.allowed_guest_domain).toEqual('@llama.net');

        expect(validated_input_is_valid(allowed_guest_domain_input)).toEqual(true);

        set_validated_input_text(allowed_guest_domain_input, '');
        expect(component.d_course.allowed_guest_domain).toEqual('');

        expect(validated_input_is_valid(allowed_guest_domain_input)).toEqual(true);

        component.d_course.allowed_guest_domain = '@spam.spam';
        expect(get_validated_input_text(allowed_guest_domain_input)).toEqual('@spam.spam');

        expect(validated_input_is_valid(allowed_guest_domain_input)).toEqual(true);

        component.d_course.allowed_guest_domain = '';
        expect(get_validated_input_text(allowed_guest_domain_input)).toEqual('');

        expect(validated_input_is_valid(allowed_guest_domain_input)).toEqual(true);
    });

    test('Clicking on the save updates button calls course.save', async () => {
        let save_settings_stub = sinon.stub(component.d_course, 'save');

        let settings_form = <ValidatedForm> wrapper.find('#course-settings-form').vm;

        expect(settings_form.is_valid).toBe(true);
        expect(component.settings_form_is_valid).toBe(true);

        wrapper.find('#course-settings-form').trigger('submit');
        await component.$nextTick();

        expect(save_settings_stub.calledOnce).toBe(true);
    });

    test('Course must be unique among courses - violates condition', async () => {
        let axios_response_instance: AxiosError = {
            name: 'AxiosError',
            message: 'u heked up',
            response: {
                data: {
                    __all__: "A course with this name, semester, and year " +
                             "already exists."
                },
                status: 400,
                statusText: 'OK',
                headers: {},
                request: {},
                config: {}
            },
            config: {},
        };
        sinon.stub(component.d_course, 'save').returns(Promise.reject(axios_response_instance));

        let settings_form = <ValidatedForm> wrapper.find('#course-settings-form').vm;

        expect(settings_form.is_valid).toBe(true);
        expect(component.settings_form_is_valid).toBe(true);

        wrapper.find('#course-settings-form').trigger('submit');
        await component.$nextTick();

        let api_errors = <APIErrors> wrapper.find({ref: 'api_errors'}).vm;
        expect(api_errors.d_api_errors.length).toBe(1);
    });
});
