import { config, mount, Wrapper } from '@vue/test-utils';

import { Course, HttpError, Semester } from 'ag-client-typescript';
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
        expect(component.d_course.name).toEqual(course.name);
        expect(validated_name_input.is_valid).toBe(true);

        set_validated_input_text(wrapper.find({ref: 'course_name_input'}), '   ');
        expect(validated_name_input.is_valid).toBe(false);
    });

    test('Subtitle binding', async () => {
        let subtitle_input = wrapper.find({ref: 'subtitle'});

        expect(get_validated_input_text(subtitle_input)).toEqual('');
        expect(validated_input_is_valid(subtitle_input)).toBe(true);

        let new_text = 'norisetanoreisat';
        set_validated_input_text(subtitle_input, new_text);
        expect(wrapper.vm.d_course.subtitle).toEqual(new_text);
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

        expect(component.d_course.year).toEqual(2019);
        expect(validated_year_input.is_valid).toBe(true);

        set_validated_input_text(wrapper.find({ref: 'course_year_input'}), "twenty-nineteen");
        expect(validated_year_input.is_valid).toBe(false);
    });

    test('Year must be an integer - violates condition', async () => {
        let validated_year_input = <ValidatedInput> wrapper.find({ref: 'course_year_input'}).vm;

        expect(component.d_course.year).toEqual(2019);
        expect(validated_year_input.is_valid).toBe(true);

        set_validated_input_text(wrapper.find({ref: 'course_year_input'}), "2020.5");
        expect(validated_year_input.is_valid).toBe(false);
    });

    test('Year must be a valid year (greater >= 2000) - violates condition', async () => {
        let validated_year_input = <ValidatedInput> wrapper.find({ref: 'course_year_input'}).vm;

        expect(component.d_course.year).toEqual(2019);
        expect(validated_year_input.is_valid).toBe(true);

        set_validated_input_text(wrapper.find({ref: 'course_year_input'}), "1999");
        expect(validated_year_input.is_valid).toBe(false);
    });

    test('Year must be a valid year (greater >= 2000) - meets condition', async () => {
        let validated_year_input = <ValidatedInput> wrapper.find({ref: 'course_year_input'}).vm;

        expect(component.d_course.year).toEqual(2019);
        expect(validated_year_input.is_valid).toBe(true);

        set_validated_input_text(wrapper.find({ref: 'course_year_input'}), "2000");
        expect(validated_year_input.is_valid).toBe(true);
    });

    test('Year must not be empty - violates condition', async () => {
        let validated_year_input = <ValidatedInput> wrapper.find({ref: 'course_year_input'}).vm;

        expect(component.d_course.year).toEqual(2019);
        expect(validated_year_input.is_valid).toBe(true);

        set_validated_input_text(wrapper.find({ref: 'course_year_input'}), "");
        expect(validated_year_input.is_valid).toBe(false);
    });

    test('Late days cannot be negative - violates condition', async () => {
        let validated_late_days_input = <ValidatedInput> wrapper.find(
            {ref: 'course_late_days_input'}).vm;

        expect(component.d_course.num_late_days).toEqual(0);
        expect(validated_late_days_input.is_valid).toBe(true);

        set_validated_input_text(wrapper.find({ref: 'course_late_days_input'}), "-1");
        expect(validated_late_days_input.is_valid).toBe(false);
    });

    test('Late days cannot be negative - meets condition', async () => {
        let validated_late_days_input = <ValidatedInput> wrapper.find(
            {ref: 'course_late_days_input'}).vm;

        expect(component.d_course.num_late_days).toEqual(0);
        expect(validated_late_days_input.is_valid).toBe(true);

        set_validated_input_text(wrapper.find({ref: 'course_late_days_input'}), "0");
        expect(validated_late_days_input.is_valid).toBe(true);
    });

    test('Late days must be a number - violates condition', async () => {
        let validated_late_days_input = <ValidatedInput> wrapper.find(
            {ref: 'course_late_days_input'}).vm;

        expect(component.d_course.num_late_days).toEqual(0);
        expect(validated_late_days_input.is_valid).toBe(true);

        set_validated_input_text(wrapper.find({ref: 'course_late_days_input'}), "zero");
        expect(validated_late_days_input.is_valid).toBe(false);
    });

    test('Late days must be an integer - violates condition', async () => {
        let validated_late_days_input = <ValidatedInput> wrapper.find(
            {ref: 'course_late_days_input'}).vm;

        expect(component.d_course.num_late_days).toEqual(0);
        expect(validated_late_days_input.is_valid).toBe(true);

        set_validated_input_text(wrapper.find({ref: 'course_late_days_input'}), "1.5");
        expect(validated_late_days_input.is_valid).toBe(false);
    });

    test('Late days cannot be empty - violates condition', async () => {
        let validated_late_days_input = <ValidatedInput> wrapper.find(
            {ref: 'course_late_days_input'}).vm;

        expect(component.d_course.num_late_days).toEqual(0);
        expect(validated_late_days_input.is_valid).toBe(true);

        set_validated_input_text(wrapper.find({ref: 'course_late_days_input'}), "");
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

    test('Clicking on the save button calls course.save', async () => {
        let save_settings_stub = sinon.stub(component.d_course, 'save');

        let settings_form = <ValidatedForm> wrapper.find('#course-settings-form').vm;

        expect(settings_form.is_valid).toBe(true);
        expect(component.settings_form_is_valid).toBe(true);

        wrapper.find('#course-settings-form').trigger('submit');
        await component.$nextTick();

        expect(save_settings_stub.calledOnce).toBe(true);
    });

    test('Course must be unique among courses - violates condition', async () => {
        sinon.stub(component.d_course, 'save').returns(
            Promise.reject(
                new HttpError(400, {
                    'name': 'Name cannot be blank',
                    'size': 'Size must be < 42'
                })
            )
        );

        let settings_form = <ValidatedForm> wrapper.find('#course-settings-form').vm;

        expect(settings_form.is_valid).toBe(true);
        expect(component.settings_form_is_valid).toBe(true);

        wrapper.find('#course-settings-form').trigger('submit');
        await component.$nextTick();

        let api_errors = <APIErrors> wrapper.find({ref: 'api_errors'}).vm;
        expect(api_errors.d_api_errors.length).toBe(2);
    });
});
