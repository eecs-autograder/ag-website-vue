import { mount, Wrapper } from '@vue/test-utils';

import { Course, Semester } from 'ag-client-typescript';

import CourseForm from '@/components/course_admin/course_form.vue';
import ValidatedInput from '@/components/validated_input.vue';

import {
    expect_html_element_has_value,
    get_validated_input_text,
    set_data,
    set_validated_input_text,
    validated_input_is_valid
} from "@/tests/utils";

import * as data_ut from '../data_utils';


test('Course form default year and allowed guest domain', async () => {
    let current_year = (new Date()).getFullYear();
    let user_domain = '@an_domain.egg';
    data_ut.set_global_current_user(data_ut.make_user({username: 'user' + user_domain}));

    let wrapper = mount(CourseForm);
    expect(wrapper.vm.d_form_data.allowed_guest_domain).toEqual(user_domain);
    expect(wrapper.vm.d_form_data.year).toEqual(current_year);
});

describe('CourseForm tests', () => {
    let wrapper: Wrapper<CourseForm>;
    let course: Course;

    beforeEach(() => {
        course = data_ut.make_course({
            name: 'EECS 280', semester: Semester.winter, year: 2019, subtitle: 'An subtitlee',
            num_late_days: 2, allowed_guest_domain: '@domaine.'
        });

        wrapper = mount(CourseForm, {
            propsData: {
                course: course,
            }
        });
    });

    test('Form data initialized from input course', async () => {
        expect(wrapper.vm.d_form_data).not.toBe(course);

        expect(
            get_validated_input_text(wrapper.findComponent({ref: 'course_name_input'}))
        ).toEqual(course.name);
        expect(
            get_validated_input_text(wrapper.findComponent({ref: 'subtitle'}))
        ).toEqual(course.subtitle);
        expect_html_element_has_value(wrapper.find('[data-testid=semester]'), course.semester);
        expect(
            get_validated_input_text(wrapper.findComponent({ref: 'course_year_input'}))
        ).toEqual(course.year!.toString());
        expect(
            get_validated_input_text(wrapper.findComponent({ref: 'course_late_days_input'}))
        ).toEqual(course.num_late_days.toString());
        expect(
            get_validated_input_text(wrapper.findComponent({ref: 'allowed_guest_domain'}))
        ).toEqual(course.allowed_guest_domain);
    });

    test('Course changed', async () => {
        let new_course = data_ut.make_course();
        await wrapper.setProps({course: new_course});
        expect(wrapper.vm.d_form_data.name).toEqual(new_course.name);
    });

    test('Course name is not the empty string - violates condition', async () => {
        let name_input = wrapper.findComponent({ref: 'course_name_input'});
        expect(wrapper.vm.d_form_data.name).toEqual(course.name);
        expect(validated_input_is_valid(name_input)).toBe(true);

        await set_validated_input_text(name_input, '   ');
        expect(validated_input_is_valid(name_input)).toBe(false);
    });

    test('Subtitle binding', async () => {
        let subtitle_input = wrapper.findComponent({ref: 'subtitle'});
        expect(validated_input_is_valid(subtitle_input)).toBe(true);

        let new_text = 'norisetanoreisat';
        await set_validated_input_text(subtitle_input, new_text);
        expect(wrapper.vm.d_form_data.subtitle).toEqual(new_text);
    });

    test('Semester binding', async () => {
        let semester_select = wrapper.find('[data-testid=semester]');

        await semester_select.setValue(Semester.summer);
        expect(wrapper.vm.d_form_data.semester).toEqual(Semester.summer);

        await semester_select.setValue(Semester.winter);
        expect(wrapper.vm.d_form_data.semester).toEqual(Semester.winter);

        await set_data(wrapper, {d_form_data: {semester: Semester.spring}});
        expect_html_element_has_value(semester_select, Semester.spring);
    });

    test('Year must be a number - violates condition', async () => {
        let year_input = wrapper.findComponent({ref: 'course_year_input'});

        expect(wrapper.vm.d_form_data.year).toEqual(2019);
        expect(validated_input_is_valid(year_input)).toBe(true);

        await set_validated_input_text(year_input, "twenty-nineteen");
        expect(validated_input_is_valid(year_input)).toBe(false);
    });

    test('Year must be an integer - violates condition', async () => {
        let year_input = wrapper.findComponent({ref: 'course_year_input'});

        expect(wrapper.vm.d_form_data.year).toEqual(2019);
        expect(validated_input_is_valid(year_input)).toBe(true);

        await set_validated_input_text(wrapper.findComponent({ref: 'course_year_input'}), "2020.5");
        expect(validated_input_is_valid(year_input)).toBe(false);
    });

    test('Year must be a valid year (greater >= 2000) - violates condition', async () => {
        let year_input = wrapper.findComponent({ref: 'course_year_input'});

        expect(wrapper.vm.d_form_data.year).toEqual(2019);
        expect(validated_input_is_valid(year_input)).toBe(true);

        await set_validated_input_text(year_input, "1999");
        expect(validated_input_is_valid(year_input)).toBe(false);
    });

    test('Year must be a valid year (greater >= 2000) - meets condition', async () => {
        let year_input = wrapper.findComponent({ref: 'course_year_input'});

        expect(wrapper.vm.d_form_data.year).toEqual(2019);
        expect(validated_input_is_valid(year_input)).toBe(true);

        await set_validated_input_text(year_input, "2000");
        expect(validated_input_is_valid(year_input)).toBe(true);
    });

    test('Year must not be empty - violates condition', async () => {
        let year_input = wrapper.findComponent({ref: 'course_year_input'});

        expect(wrapper.vm.d_form_data.year).toEqual(2019);
        expect(validated_input_is_valid(year_input)).toBe(true);

        await set_validated_input_text(year_input, "");
        expect(validated_input_is_valid(year_input)).toBe(false);
    });

    test('Late days cannot be negative - violates condition', async () => {
        let late_days_input = wrapper.findComponent({ref: 'course_late_days_input'});
        expect(validated_input_is_valid(late_days_input)).toBe(true);

        await set_validated_input_text(late_days_input, "-1");
        expect(validated_input_is_valid(late_days_input)).toBe(false);
    });

    test('Late days cannot be negative - meets condition', async () => {
        let late_days_input = wrapper.findComponent({ref: 'course_late_days_input'});
        expect(validated_input_is_valid(late_days_input)).toBe(true);

        await set_validated_input_text(late_days_input, "0");
        expect(validated_input_is_valid(late_days_input)).toBe(true);
    });

    test('Late days must be a number - violates condition', async () => {
        let late_days_input = wrapper.findComponent({ref: 'course_late_days_input'});
        expect(validated_input_is_valid(late_days_input)).toBe(true);

        await set_validated_input_text(late_days_input, "zero");
        expect(validated_input_is_valid(late_days_input)).toBe(false);
    });

    test('Late days must be an integer - violates condition', async () => {
        let late_days_input = wrapper.findComponent({ref: 'course_late_days_input'});
        expect(validated_input_is_valid(late_days_input)).toBe(true);

        await set_validated_input_text(late_days_input, "1.5");
        expect(validated_input_is_valid(late_days_input)).toBe(false);
    });

    test('Late days cannot be empty - violates condition', async () => {
        let late_days_input = wrapper.findComponent({ref: 'course_late_days_input'});
        expect(validated_input_is_valid(late_days_input)).toBe(true);

        await set_validated_input_text(late_days_input, "");
        expect(validated_input_is_valid(late_days_input)).toBe(false);
    });

    test('Allowed guest domain binding', async () => {
        let allowed_guest_domain_input = wrapper.findComponent({ref: 'allowed_guest_domain'});

        await set_validated_input_text(allowed_guest_domain_input, '@llama.net');
        expect(wrapper.vm.d_form_data.allowed_guest_domain).toEqual('@llama.net');

        expect(validated_input_is_valid(allowed_guest_domain_input)).toEqual(true);

        await set_validated_input_text(allowed_guest_domain_input, '');
        expect(wrapper.vm.d_form_data.allowed_guest_domain).toEqual('');

        expect(validated_input_is_valid(allowed_guest_domain_input)).toEqual(true);

        await set_data(wrapper, {d_form_data: {allowed_guest_domain: '@spam.spam'}});
        expect(get_validated_input_text(allowed_guest_domain_input)).toEqual('@spam.spam');

        expect(validated_input_is_valid(allowed_guest_domain_input)).toEqual(true);

        await set_data(wrapper, {d_form_data: {allowed_guest_domain: ''}});
        expect(get_validated_input_text(allowed_guest_domain_input)).toEqual('');

        expect(validated_input_is_valid(allowed_guest_domain_input)).toEqual(true);
    });
});
