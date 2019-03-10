import SingleCourse from '@/components/course_list/single_course.vue';
import Modal from '@/components/modal.vue';
import ValidatedInput from '@/components/validated_input.vue';
import { config, mount, Wrapper } from '@vue/test-utils';
import { Course, Semester } from 'ag-client-typescript';
import { AxiosError } from 'axios';

import { patch_async_class_method } from '../mocking';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('SingleCourse.vue', () => {
    let wrapper: Wrapper<SingleCourse>;
    let single_course: SingleCourse;
    let course_1: Course;
    let course_with_null_values: Course;
    let clone_of_course: Course;
    let original_match_media: (query: string) => MediaQueryList;

    beforeEach(() => {
        original_match_media = window.matchMedia;
        Object.defineProperty(window, "matchMedia", {
            value: jest.fn(() => {
                return {matches: true};
            })
        });

        course_1 = new Course({
            pk: 1, name: 'EECS 280', semester: Semester.winter, year: 2019, subtitle: '',
            num_late_days: 0, allowed_guest_domain: '', last_modified: ''
        });

        course_with_null_values = new Course({
            pk: 1, name: 'EECS 280', semester: null, year: null, subtitle: '',
            num_late_days: 0, allowed_guest_domain: '', last_modified: ''
        });

        clone_of_course = new Course({
            pk: 2, name: 'EECS 280', semester: Semester.winter, year: 2020, subtitle: '',
            num_late_days: 0, allowed_guest_domain: '', last_modified: ''
        });
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

    test('SingleCourse data members are initialized correctly', async () => {
        wrapper = mount(SingleCourse, {
            propsData: {
                course: course_1
            },
            stubs: ['router-link', 'router-view']
        });
        single_course = wrapper.vm;
        await single_course.$nextTick();

        expect(single_course.course).toEqual(course_1);
        expect(single_course.is_admin).toBe(false);
        expect(single_course.new_course_year).toEqual(single_course.course.year);
    });

    test('If the user is an admin, they have the option to clone or edit a course',
         async () => {
        wrapper = mount(SingleCourse, {
            propsData: {
                course: course_1,
                is_admin: true
            },
            stubs: ['router-link', 'router-view']
        });
        single_course = wrapper.vm;
        await single_course.$nextTick();

        expect(single_course.is_admin).toBe(true);
        expect(wrapper.findAll('.clone-course').length).toEqual(1);
        expect(wrapper.findAll('.edit-admin-settings').length).toEqual(1);
    });

    test("If the user is not an admin, they don't have the option to clone or edit a course",
         async () => {
        wrapper = mount(SingleCourse, {
            propsData: {
                course: course_1,
                is_admin: false
            },
            stubs: ['router-link', 'router-view']
        });
        single_course = wrapper.vm;
        await single_course.$nextTick();

        expect(single_course.is_admin).toBe(false);
        expect(wrapper.findAll('.clone-course').length).toEqual(0);
        expect(wrapper.findAll('.edit-admin-settings').length).toEqual(0);
    });

    test('SingleCourse with a Course as input whose semester and year are null',
         async () => {
         wrapper = mount(SingleCourse, {
             propsData: {
                 course: course_with_null_values
             },
             stubs: ['router-link', 'router-view']
         });
         single_course = wrapper.vm;
         await single_course.$nextTick();

         expect(single_course.course).toEqual(course_with_null_values);
         expect(single_course.is_admin).toBe(false);
         expect(single_course.new_course_semester).toEqual(Semester.fall);
         expect(single_course.new_course_year).toEqual(2000);
    });

    test('The newly cloned course name cannot be an empty string', async () => {
        wrapper = mount(SingleCourse, {
            propsData: {
                course: course_1,
                is_admin: true
            },
            stubs: ['router-link', 'router-view']
        });

        single_course = wrapper.vm;
        await single_course.$nextTick();

        wrapper.find('.clone-course').trigger('click');
        await single_course.$nextTick();

        let modal = <Modal> wrapper.find({ ref: 'clone_course_modal'}).vm;
        let clone_name_input = <ValidatedInput> wrapper.find(
            {ref: "copy_of_course_name"}
        ).vm;

        expect(modal.is_open).toBe(true);
        expect(clone_name_input.is_valid).toBe(false);

        let clone_name = wrapper.find({ref: 'copy_of_course_name'}).find('#input');
        (<HTMLInputElement> clone_name.element).value = "   ";
        clone_name.trigger('input');
        await single_course.$nextTick();

        expect(clone_name_input.is_valid).toBe(false);
        expect(single_course.clone_course_form_is_valid).toBe(false);
    });

    test('The newly cloned course year must be greater >= 2000 - violates condition',
         async () => {
        wrapper = mount(SingleCourse, {
            propsData: {
                course: course_1,
                is_admin: true
            },
            stubs: ['router-link', 'router-view']
        });

        single_course = wrapper.vm;
        await single_course.$nextTick();

        wrapper.find('.clone-course').trigger('click');
        await single_course.$nextTick();

        let modal = <Modal> wrapper.find({ ref: 'clone_course_modal'}).vm;
        let clone_year_input = <ValidatedInput> wrapper.find(
            {ref: "copy_of_course_year"}
        ).vm;

        expect(modal.is_open).toBe(true);
        expect(single_course.new_course_year).toEqual(single_course.course.year);
        expect(clone_year_input.is_valid).toBe(true);

        let clone_year = wrapper.find({ref: 'copy_of_course_year'}).find('#input');
        (<HTMLInputElement> clone_year.element).value = "1999";
        clone_year.trigger('input');
        await single_course.$nextTick();

        expect(clone_year_input.is_valid).toBe(false);
        expect(single_course.clone_course_form_is_valid).toBe(false);
    });

    test('The newly cloned course year must be greater >= 2000 - meets condition',
         async () => {
         wrapper = mount(SingleCourse, {
             propsData: {
                 course: course_1,
                 is_admin: true
             },
             stubs: ['router-link', 'router-view']
         });

         single_course = wrapper.vm;
         await single_course.$nextTick();

         wrapper.find('.clone-course').trigger('click');
         await single_course.$nextTick();

         let modal = <Modal> wrapper.find({ ref: 'clone_course_modal'}).vm;
         let clone_year_input = <ValidatedInput> wrapper.find(
             {ref: "copy_of_course_year"}
         ).vm;

         expect(modal.is_open).toBe(true);
         expect(single_course.new_course_year).toEqual(single_course.course.year);
         expect(clone_year_input.is_valid).toBe(true);

         let clone_year = wrapper.find({ref: 'copy_of_course_year'}).find('#input');
         (<HTMLInputElement> clone_year.element).value = "2000";
         clone_year.trigger('input');
         await single_course.$nextTick();

         expect(clone_year_input.is_valid).toBe(true);
    });

    test('The newly cloned course year must be a number - violates condition',
         async () => {
        wrapper = mount(SingleCourse, {
            propsData: {
                course: course_1,
                is_admin: true
            },
            stubs: ['router-link', 'router-view']
        });

        single_course = wrapper.vm;
        await single_course.$nextTick();

        wrapper.find('.clone-course').trigger('click');
        await single_course.$nextTick();

        let modal = <Modal> wrapper.find({ ref: 'clone_course_modal'}).vm;
        let clone_year_input = <ValidatedInput> wrapper.find(
        {ref: "copy_of_course_year"}
        ).vm;

        expect(modal.is_open).toBe(true);
        expect(single_course.new_course_year).toEqual(single_course.course.year);
        expect(clone_year_input.is_valid).toBe(true);

        let clone_year = wrapper.find({ref: 'copy_of_course_year'}).find('#input');
        (<HTMLInputElement> clone_year.element).value = "spoon";
        clone_year.trigger('input');
        await single_course.$nextTick();

        expect(clone_year_input.is_valid).toBe(false);
    });

    test('The newly cloned course year cannot be an empty string - violates condition',
         async () => {
        wrapper = mount(SingleCourse, {
            propsData: {
                course: course_1,
                is_admin: true
            },
            stubs: ['router-link', 'router-view']
        });

        single_course = wrapper.vm;
        await single_course.$nextTick();

        wrapper.find('.clone-course').trigger('click');
        await single_course.$nextTick();

        let modal = <Modal> wrapper.find({ ref: 'clone_course_modal'}).vm;
        let clone_year_input = <ValidatedInput> wrapper.find({ref: "copy_of_course_year"}).vm;

        expect(modal.is_open).toBe(true);
        expect(single_course.new_course_year).toEqual(single_course.course.year);
        expect(clone_year_input.is_valid).toBe(true);

        let clone_year = wrapper.find({ref: 'copy_of_course_year'}).find('#input');
        (<HTMLInputElement> clone_year.element).value = "    ";
        clone_year.trigger('input');
        await single_course.$nextTick();

        expect(clone_year_input.is_valid).toBe(false);
    });

    test("When creating a clone of a course the clone's combination of " +
         "(course name, year, semester) must be unique - violates condition",
         async () => {

        let axios_response_instance: AxiosError = {
            name: 'AxiosError',
            message: 'u heked up',
            response: {
                data: {
                    __all__: "A course with this name, semester, and year already exists."
                },
                status: 400,
                statusText: 'OK',
                headers: {},
                request: {},
                config: {}
            },
            config: {},
        };

        wrapper = mount(SingleCourse, {
            propsData: {
                course: course_1,
                is_admin: true
            },
            stubs: ['router-link', 'router-view']
        });

        single_course = wrapper.vm;
        await single_course.$nextTick();

        wrapper.find('.clone-course').trigger('click');
        await single_course.$nextTick();

        let modal = <Modal> wrapper.find({ ref: 'clone_course_modal'}).vm;
        let clone_name_input = <ValidatedInput> wrapper.find({ref: "copy_of_course_name"}).vm;
        let clone_year_input = <ValidatedInput> wrapper.find({ref: "copy_of_course_year"}).vm;

        expect(modal.is_open).toBe(true);

        let clone_name = wrapper.find({ref: 'copy_of_course_name'}).find('#input');
        (<HTMLInputElement> clone_name.element).value = single_course.course.name;
        clone_name.trigger('input');
        await single_course.$nextTick();

        single_course.new_course_semester = course_1.semester !== null
                                            ? course_1.semester : Semester.winter;

        expect(clone_name_input.is_valid).toBe(true);
        expect(clone_year_input.is_valid).toBe(true);
        expect(single_course.new_course_name).toEqual(single_course.course.name);
        expect(single_course.new_course_semester).toEqual(single_course.course.semester);
        expect(single_course.new_course_year).toEqual(single_course.course.year);

        return patch_async_class_method(
            Course,
            'copy',
            () => Promise.reject(axios_response_instance),
            async () => {

            wrapper.find('#clone-course-form').trigger('submit.native');
            await single_course.$nextTick();

            expect(single_course.api_errors.length).toBeGreaterThan(0);
            expect(modal.is_open).toBe(true);
        });
    });

    test("Users can dismiss api_errors that result from an unsuccessful cloning attempt",
         async () => {

         let axios_response_instance: AxiosError = {
             name: 'AxiosError',
             message: 'u heked up',
             response: {
                 data: {
                     __all__: "A course with this name, semester, and year already exists."
                 },
                 status: 400,
                 statusText: 'OK',
                 headers: {},
                 request: {},
                 config: {}
             },
             config: {},
         };

         wrapper = mount(SingleCourse, {
             propsData: {
                 course: course_1,
                 is_admin: true
             },
             stubs: ['router-link', 'router-view']
         });

         single_course = wrapper.vm;
         await single_course.$nextTick();

         wrapper.find('.clone-course').trigger('click');
         await single_course.$nextTick();

         let modal = <Modal> wrapper.find({ ref: 'clone_course_modal'}).vm;
         let clone_name_input = <ValidatedInput> wrapper.find({ref: "copy_of_course_name"}).vm;
         let clone_year_input = <ValidatedInput> wrapper.find({ref: "copy_of_course_year"}).vm;

         expect(modal.is_open).toBe(true);

         let clone_name = wrapper.find({ref: 'copy_of_course_name'}).find('#input');
         (<HTMLInputElement> clone_name.element).value = single_course.course.name;
         clone_name.trigger('input');
         await single_course.$nextTick();

         single_course.new_course_semester = course_1.semester !== null
             ? course_1.semester : Semester.winter;

         expect(clone_name_input.is_valid).toBe(true);
         expect(clone_year_input.is_valid).toBe(true);
         expect(single_course.new_course_name).toEqual(single_course.course.name);
         expect(single_course.new_course_semester).toEqual(single_course.course.semester);
         expect(single_course.new_course_year).toEqual(single_course.course.year);

         return patch_async_class_method(
             Course,
             'copy',
             () => Promise.reject(axios_response_instance),
             async () => {

             wrapper.find('#clone-course-form').trigger('submit.native');
             await single_course.$nextTick();

             expect(single_course.api_errors.length).toBeGreaterThan(0);
             expect(modal.is_open).toBe(true);

             wrapper.find('.dismiss-error-button').trigger('click');

             expect(single_course.api_errors.length).toEqual(0);
             expect(modal.is_open).toBe(true);
         });
     });

    test("Cloning a course whose semester and year are null",
         async () => {

         const spy = jest.fn();
         wrapper = mount(SingleCourse, {
             propsData: {
                 course: course_with_null_values,
                 is_admin: true
             },
             stubs: ['router-link', 'router-view']
         });

         single_course = wrapper.vm;
         await single_course.$nextTick();

         wrapper.find('.clone-course').trigger('click');
         await single_course.$nextTick();

         let modal = <Modal> wrapper.find({ref: 'clone_course_modal'}).vm;
         let clone_name_input = <ValidatedInput> wrapper.find({ref: "copy_of_course_name"}).vm;
         let clone_year_input = <ValidatedInput> wrapper.find({ref: "copy_of_course_year"}).vm;

         expect(modal.is_open).toBe(true);

         let clone_name = wrapper.find({ref: 'copy_of_course_name'}).find('#input');
         (<HTMLInputElement> clone_name.element).value = "New Course";
         clone_name.trigger('input');
         await single_course.$nextTick();

         expect(clone_name_input.is_valid).toBe(true);
         expect(clone_year_input.is_valid).toBe(true);
         expect(single_course.new_course_name).toEqual("New Course");
         expect(single_course.new_course_semester).toEqual(Semester.fall);
         expect(single_course.new_course_year).toEqual(2000);
         expect(single_course.clone_course_form_is_valid).toBe(true);

         return patch_async_class_method(
             Course,
             'copy',
             spy,
             async () => {

             wrapper.find('#clone-course-form').trigger('submit.native');
             await single_course.$nextTick();

             expect(spy.mock.calls.length).toBe(1);
             expect(modal.is_open).toBe(false);
             expect(single_course.new_course_name).toEqual("");
             expect(single_course.new_course_semester).toEqual(Semester.fall);
             expect(single_course.new_course_year).toEqual(2000);
         });
     });

    test("When creating a clone of a course the clone's combination of " +
         "(course name, year, semester) must be unique - meets condition",
         async () => {

         const spy = jest.fn();
         wrapper = mount(SingleCourse, {
             propsData: {
                 course: course_1,
                 is_admin: true
             },
             stubs: ['router-link', 'router-view']
         });

         single_course = wrapper.vm;
         await single_course.$nextTick();

         wrapper.find('.clone-course').trigger('click');
         await single_course.$nextTick();

         let modal = <Modal> wrapper.find({ref: 'clone_course_modal'}).vm;
         let clone_name_input = <ValidatedInput> wrapper.find({ref: "copy_of_course_name"}).vm;
         let clone_year_input = <ValidatedInput> wrapper.find({ref: "copy_of_course_year"}).vm;

         expect(modal.is_open).toBe(true);

         let clone_name = wrapper.find({ref: 'copy_of_course_name'}).find('#input');
         (<HTMLInputElement> clone_name.element).value = "New Course";
         clone_name.trigger('input');
         await single_course.$nextTick();

         expect(clone_name_input.is_valid).toBe(true);
         expect(clone_year_input.is_valid).toBe(true);
         expect(single_course.new_course_name).toEqual("New Course");
         expect(single_course.new_course_semester).toEqual(Semester.fall);
         expect(single_course.new_course_year).toEqual(single_course.course.year);
         expect(single_course.clone_course_form_is_valid).toBe(true);

         return patch_async_class_method(
             Course,
             'copy',
             spy,
             async () => {

             wrapper.find('#clone-course-form').trigger('submit.native');
             await single_course.$nextTick();

             expect(spy.mock.calls.length).toBe(1);
             expect(modal.is_open).toBe(false);
             expect(single_course.new_course_name).toEqual("");
             expect(single_course.new_course_semester).toEqual(Semester.fall);
             expect(single_course.new_course_year).toEqual(single_course.course.year);
         });
     });
});
