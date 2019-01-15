import CourseSettings from '@/components/course_admin/course_settings.vue';
import ValidatedInput from '@/components/validated_input.vue';
import { config, mount, Wrapper } from '@vue/test-utils';
import { Course, Semester, User } from 'ag-client-typescript';
import { AxiosResponse } from 'axios';
import Vue from 'vue';

import {
    patch_async_class_method,
    patch_async_static_method,
    patch_component_method
} from '../mocking';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('CourseSettings.vue', () => {
    let wrapper: Wrapper<CourseSettings>;
    let course_settings: CourseSettings;
    let course: Course;
    let updated_course: Course;
    let original_match_media: (query: string) => MediaQueryList;

    beforeEach(() => {
        course = new Course({
            pk: 2, name: 'EECS 280', semester: Semester.winter, year: 2019, subtitle: '',
            num_late_days: 0, last_modified: ''
        });
        updated_course = new Course({
            pk: 2, name: 'EECS 281', semester: Semester.fall, year: 2018, subtitle: '',
            num_late_days: 0, last_modified: ''
        });
        original_match_media = window.matchMedia;
        Object.defineProperty(window, "matchMedia", {
            value: jest.fn(() => {
                return {matches: true};
            })
        });

        wrapper = mount(CourseSettings, {
            propsData: {
                course: course,
            }
        });

        course_settings = wrapper.vm;
    });

    afterEach(() => {
        Object.defineProperty(window, "matchMedia", {
            value: original_match_media
        });

        if (wrapper.exists()) {
            console.log("wrapper exists");
            wrapper.destroy();
        }
    });

    test('Course name is not the empty string', async () => {
        let validated_input_component = <ValidatedInput> wrapper.find(
            {ref: 'course_name'}).vm;
        let name_input = wrapper.find({ref: 'course_name'}).find('#input');

        expect(course_settings.course.name).toEqual(course.name);
        expect(validated_input_component.is_valid).toBe(true);
        expect(wrapper.findAll('.error-li').length).toEqual(0);

        (<HTMLInputElement> name_input.element).value = "";
        name_input.trigger('input');

        expect(validated_input_component.is_valid).toBe(false);
        expect(wrapper.findAll('.error-li').length).toEqual(1);
    });

    test('Year must be a number', async () => {
        let validated_input_component = <ValidatedInput> wrapper.find(
            {ref: 'course_year'}).vm;
        let year_input = wrapper.find({ref: 'course_year'}).find('#input');

        expect(course_settings.course.year).toEqual(2019);
        expect(validated_input_component.is_valid).toBe(true);
        expect(wrapper.findAll('.error-li').length).toEqual(0);

        (<HTMLInputElement> year_input.element).value = "twenty-nineteen";
        year_input.trigger('input');

        expect(validated_input_component.is_valid).toBe(false);
        expect(wrapper.findAll('.error-li').length).toEqual(1);
    });

    test('Year must be a valid year (greater >= 2000)', async () => {
        let validated_input_component = <ValidatedInput> wrapper.find(
            {ref: 'course_year'}).vm;
        let year_input = wrapper.find({ref: 'course_year'}).find('#input');

        expect(course_settings.course.year).toEqual(2019);
        expect(validated_input_component.is_valid).toBe(true);
        expect(wrapper.findAll('.error-li').length).toEqual(0);

        (<HTMLInputElement> year_input.element).value = "1999";
        year_input.trigger('input');

        expect(validated_input_component.is_valid).toBe(false);
        expect(wrapper.findAll('.error-li').length).toEqual(1);

        (<HTMLInputElement> year_input.element).value = "2000";
        year_input.trigger('input');

        expect(validated_input_component.is_valid).toBe(true);
        expect(wrapper.findAll('.error-li').length).toEqual(0);
    });

    test('Year must not be empty', async () => {
        let validated_input_component = <ValidatedInput> wrapper.find(
            {ref: 'course_year'}).vm;
        let year_input = wrapper.find({ref: 'course_year'}).find('#input');

        expect(course_settings.course.year).toEqual(2019);
        expect(validated_input_component.is_valid).toBe(true);
        expect(wrapper.findAll('.error-li').length).toEqual(0);

        (<HTMLInputElement> year_input.element).value = "";
        year_input.trigger('input');

        expect(validated_input_component.is_valid).toBe(false);
        expect(wrapper.findAll('.error-li').length).toEqual(1);
    });

    test('Late days cannot be negative', async () => {
        let validated_input_component = <ValidatedInput> wrapper.find(
            {ref: 'course_late_days'}).vm;
        let late_days_input = wrapper.find({ref: 'course_late_days'}).find('#input');

        expect(course_settings.course.num_late_days).toEqual(0);
        expect(validated_input_component.is_valid).toBe(true);

        (<HTMLInputElement> late_days_input.element).value = "-1";
        late_days_input.trigger('input');

        expect(validated_input_component.is_valid).toBe(false);
        expect(wrapper.findAll('.error-li').length).toEqual(1);

        (<HTMLInputElement> late_days_input.element).value = "1";
        late_days_input.trigger('input');

        expect(validated_input_component.is_valid).toBe(true);
        expect(wrapper.findAll('.error-li').length).toEqual(0);
    });

    test('Late days must be a number', async () => {
        let validated_input_component = <ValidatedInput> wrapper.find(
            {ref: 'course_late_days'}).vm;
        let late_days_input = wrapper.find({ref: 'course_late_days'}).find('#input');

        expect(course_settings.course.num_late_days).toEqual(0);
        expect(validated_input_component.is_valid).toBe(true);
        expect(wrapper.findAll('.error-li').length).toEqual(0);

        (<HTMLInputElement> late_days_input.element).value = "zero";
        late_days_input.trigger('input');

        expect(validated_input_component.is_valid).toBe(false);
        expect(wrapper.findAll('.error-li').length).toEqual(1);
    });

    test('Late days cannot be empty', async () => {
        let validated_input_component = <ValidatedInput> wrapper.find(
            {ref: 'course_late_days'}).vm;
        let late_days_input = wrapper.find({ref: 'course_late_days'}).find('#input');

        expect(course_settings.course.num_late_days).toEqual(0);
        expect(validated_input_component.is_valid).toBe(true);
        expect(wrapper.findAll('.error-li').length).toEqual(0);

        (<HTMLInputElement> late_days_input.element).value = "";
        late_days_input.trigger('input');

        expect(validated_input_component.is_valid).toBe(false);
        expect(wrapper.findAll('.error-li').length).toEqual(1);
    });

    test('Clicking on the save updates button calls course.save', async () => {
        const spy = jest.fn();

        await patch_async_class_method(
            Course, 'save',
            spy,
            async () => {

                expect(course_settings.settings_form_is_valid).toBe(true);
                let settings_form = wrapper.find('#course-settings-form');

                settings_form.trigger('submit.native');
                await course_settings.$nextTick();

                expect(spy.mock.calls.length).toBe(1);
            }
        );
    });

    // 153 155 156
    test.skip('Course must be unique among courses', async () => {
        let axios_response_instance: AxiosResponse = {
            data: {
                __all__: "A course with this name, semester, and year " +
                         "already exists."
            },
            status: 400,
            statusText: 'OK',
            headers: {},
            config: {},
            request: {}
        };

        wrapper = mount(CourseSettings, {
            propsData: {
                course: course,
            }
        });

        course_settings = wrapper.vm;

        await patch_async_class_method(
            Course, 'save',
            () => Promise.reject(axios_response_instance),
            async () => {

                let mock_result = await course.save();
                expect(mock_result).toEqual(axios_response_instance);

                expect(course_settings.settings_form_is_valid).toBe(true);
                let settings_form = wrapper.find('#course-settings-form');

                settings_form.trigger('submit.native');
                await course_settings.$nextTick();

                expect(wrapper.findAll('.error-li').length).toEqual(1);
            }
        );
    });
});
