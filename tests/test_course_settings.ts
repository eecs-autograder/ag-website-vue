import CourseSettings from '@/components/course_settings.vue';
import ValidatedForm from '@/components/validated_form.vue';
import ValidatedInput from '@/components/validated_input.vue';
import { config, mount, Wrapper } from '@vue/test-utils';
import { Course, Semester } from 'ag-client-typescript';
import { AxiosError } from 'axios';

import { patch_async_class_method } from './mocking';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('CourseSettings.vue', () => {
    let wrapper: Wrapper<CourseSettings>;
    let course_settings: CourseSettings;
    let course_1: Course;
    let original_match_media: (query: string) => MediaQueryList;

    beforeEach(() => {
        course_1 = new Course({
            pk: 1, name: 'EECS 280', semester: Semester.winter, year: 2019, subtitle: '',
            num_late_days: 0, allowed_guest_domain: '', last_modified: ''
        });

        original_match_media = window.matchMedia;

        Object.defineProperty(window, "matchMedia", {
            value: jest.fn(() => {
                return {matches: true};
            })
        });

        wrapper = mount(CourseSettings, {
            propsData: {
                course: course_1,
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

    test('Course name is not the empty string - violates condition', async () => {
        let validated_name_input = <ValidatedInput> wrapper.find({ref: 'course_name_input'}).vm;
        let name_input = wrapper.find({ref: 'course_name_input'}).find('#input');

        expect(course_settings.d_course.name).toEqual(course_1.name);
        expect(validated_name_input.is_valid).toBe(true);

        (<HTMLInputElement> name_input.element).value = "     ";
        name_input.trigger('input');
        await course_settings.$nextTick();

        expect(validated_name_input.is_valid).toBe(false);
    });

    test('Year must be a number - violates condition', async () => {
        let validated_year_input = <ValidatedInput> wrapper.find({ref: 'course_year_input'}).vm;
        let year_input = wrapper.find({ref: 'course_year_input'}).find('#input');

        expect(course_settings.course.year).toEqual(2019);
        expect(validated_year_input.is_valid).toBe(true);

        (<HTMLInputElement> year_input.element).value = "twenty-nineteen";
        year_input.trigger('input');

        expect(validated_year_input.is_valid).toBe(false);
    });

    test('Year must be a valid year (greater >= 2000) - violates condition', async () => {
        let validated_year_input = <ValidatedInput> wrapper.find({ref: 'course_year_input'}).vm;
        let year_input = wrapper.find({ref: 'course_year_input'}).find('#input');

        expect(course_settings.course.year).toEqual(2019);
        expect(validated_year_input.is_valid).toBe(true);

        (<HTMLInputElement> year_input.element).value = "1999";
        year_input.trigger('input');

        expect(validated_year_input.is_valid).toBe(false);
    });

    test('Year must be a valid year (greater >= 2000) - meets condition', async () => {
        let validated_year_input = <ValidatedInput> wrapper.find({ref: 'course_year_input'}).vm;
        let year_input = wrapper.find({ref: 'course_year_input'}).find('#input');

        expect(course_settings.course.year).toEqual(2019);
        expect(validated_year_input.is_valid).toBe(true);

        (<HTMLInputElement> year_input.element).value = "2000";
        year_input.trigger('input');

        expect(validated_year_input.is_valid).toBe(true);
    });

    test('Year must not be empty - violates condition', async () => {
        let validated_year_input = <ValidatedInput> wrapper.find({ref: 'course_year_input'}).vm;
        let year_input = wrapper.find({ref: 'course_year_input'}).find('#input');

        expect(course_settings.course.year).toEqual(2019);
        expect(validated_year_input.is_valid).toBe(true);

        (<HTMLInputElement> year_input.element).value = "";
        year_input.trigger('input');

        expect(validated_year_input.is_valid).toBe(false);
    });

    test('Late days cannot be negative - violates condition', async () => {
        let validated_late_days_input = <ValidatedInput> wrapper.find(
            {ref: 'course_late_days_input'}).vm;
        let late_days_input = wrapper.find({ref: 'course_late_days_input'}).find('#input');

        expect(course_settings.course.num_late_days).toEqual(0);
        expect(validated_late_days_input.is_valid).toBe(true);

        (<HTMLInputElement> late_days_input.element).value = "-1";
        late_days_input.trigger('input');

        expect(validated_late_days_input.is_valid).toBe(false);
    });

    test('Late days cannot be negative - meets condition', async () => {
        let validated_late_days_input = <ValidatedInput> wrapper.find(
            {ref: 'course_late_days_input'}).vm;
        let late_days_input = wrapper.find({ref: 'course_late_days_input'}).find('#input');

        expect(course_settings.course.num_late_days).toEqual(0);
        expect(validated_late_days_input.is_valid).toBe(true);

        (<HTMLInputElement> late_days_input.element).value = "0";
        late_days_input.trigger('input');

        expect(validated_late_days_input.is_valid).toBe(true);
    });

    test('Late days must be a number - violates condition', async () => {
        let validated_late_days_input = <ValidatedInput> wrapper.find(
            {ref: 'course_late_days_input'}).vm;
        let late_days_input = wrapper.find({ref: 'course_late_days_input'}).find('#input');

        expect(course_settings.course.num_late_days).toEqual(0);
        expect(validated_late_days_input.is_valid).toBe(true);

        (<HTMLInputElement> late_days_input.element).value = "zero";
        late_days_input.trigger('input');

        expect(validated_late_days_input.is_valid).toBe(false);
    });

    test('Late days cannot be empty - violates condition', async () => {
        let validated_late_days_input = <ValidatedInput> wrapper.find(
            {ref: 'course_late_days_input'}).vm;
        let late_days_input = wrapper.find({ref: 'course_late_days_input'}).find('#input');

        expect(course_settings.course.num_late_days).toEqual(0);
        expect(validated_late_days_input.is_valid).toBe(true);

        (<HTMLInputElement> late_days_input.element).value = "";
        late_days_input.trigger('input');

        expect(validated_late_days_input.is_valid).toBe(false);
    });

    test('Clicking on the save updates button calls course.save', async () => {
        const spy = jest.fn();

        return patch_async_class_method(
            Course,
            'save',
            spy,
            async () => {

            let settings_form = <ValidatedForm> wrapper.find('#course-settings-form').vm;

            expect(settings_form.is_valid).toBe(true);
            expect(course_settings.settings_form_is_valid).toBe(true);

            wrapper.find('#course-settings-form').trigger('submit.native');
            await course_settings.$nextTick();

            expect(spy.mock.calls.length).toBe(1);
        });
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

        wrapper = mount(CourseSettings, {
            propsData: {
                course: course_1,
            }
        });

        course_settings = wrapper.vm;

        return patch_async_class_method(
            Course,
            'save',
            () => Promise.reject(axios_response_instance),
            async () => {

            let settings_form = <ValidatedForm> wrapper.find('#course-settings-form').vm;

            expect(settings_form.is_valid).toBe(true);
            expect(course_settings.settings_form_is_valid).toBe(true);

            wrapper.find('#course-settings-form').trigger('submit.native');
            await course_settings.$nextTick();

            expect(course_settings.api_errors.length).toEqual(1);
        });
    });
});
