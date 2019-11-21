import { config, mount, Wrapper } from '@vue/test-utils';

import { Course, HttpError, Semester } from 'ag-client-typescript';
import * as sinon from 'sinon';

import APIErrors from '@/components/api_errors.vue';
import SingleCourse from '@/components/course_list/single_course.vue';
import ValidatedInput from '@/components/validated_input.vue';

import { expect_html_element_has_value } from '@/tests/utils';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('SingleCourse.vue', () => {
    let wrapper: Wrapper<SingleCourse>;
    let component: SingleCourse;
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
        sinon.restore();

        Object.defineProperty(window, "matchMedia", {
            value: original_match_media
        });

        if (wrapper.exists()) {
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
        component = wrapper.vm;
        await component.$nextTick();

        expect(component.course).toEqual(course_1);
        expect(component.is_admin).toBe(false);
        expect(component.new_course_year).toEqual(component.course.year);
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
        component = wrapper.vm;
        await component.$nextTick();

        expect(component.is_admin).toBe(true);
        expect(wrapper.findAll('.clone-course').length).toEqual(1);
        expect(wrapper.findAll('.edit-course-settings').length).toEqual(1);
    });

    test('Semester binding - for clone of course', async () => {
        wrapper = mount(SingleCourse, {
            propsData: {
                course: course_1,
                is_admin: true
            },
            stubs: ['router-link', 'router-view']
        });
        component = wrapper.vm;
        await component.$nextTick();

        wrapper.find('.clone-course').trigger('click');
        await component.$nextTick();

        let semester_select = wrapper.find('#semester');

        expect(component.new_course_semester).toEqual(course_1.semester);

        semester_select.setValue(Semester.summer);
        expect(component.new_course_semester).toEqual(Semester.summer);

        semester_select.setValue(Semester.winter);
        expect(component.new_course_semester).toEqual(Semester.winter);

        component.new_course_semester = Semester.spring;
        expect_html_element_has_value(semester_select, Semester.spring);
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
        component = wrapper.vm;
        await component.$nextTick();

        expect(component.is_admin).toBe(false);
        expect(wrapper.findAll('.clone-course').length).toEqual(0);
        expect(wrapper.findAll('.edit-course-settings').length).toEqual(0);
    });

    test('SingleCourse with a Course as input whose semester and year are null',
         async () => {
         wrapper = mount(SingleCourse, {
             propsData: {
                 course: course_with_null_values
             },
             stubs: ['router-link', 'router-view']
         });
         component = wrapper.vm;
         await component.$nextTick();

         expect(component.course).toEqual(course_with_null_values);
         expect(component.is_admin).toBe(false);
         expect(component.new_course_semester).toEqual(Semester.fall);
         expect(component.new_course_year).toEqual((new Date()).getFullYear());
    });

    test('The newly cloned course name cannot be an empty string', async () => {
        wrapper = mount(SingleCourse, {
            propsData: {
                course: course_1,
                is_admin: true
            },
            stubs: ['router-link', 'router-view']
        });

        component = wrapper.vm;
        await component.$nextTick();

        wrapper.find('.clone-course').trigger('click');
        await component.$nextTick();

        let clone_name_input = <ValidatedInput> wrapper.find(
            {ref: "copy_of_course_name"}
        ).vm;

        let clone_name = wrapper.find({ref: 'copy_of_course_name'}).find('#input');
        (<HTMLInputElement> clone_name.element).value = "";
        clone_name.trigger('input');
        await component.$nextTick();

        expect(wrapper.find({ref: 'clone_course_modal'}).exists()).toBe(true);
        expect(wrapper.vm.d_show_clone_course_modal).toBe(true);
        expect(clone_name_input.is_valid).toBe(false);

        (<HTMLInputElement> clone_name.element).value = "   ";
        clone_name.trigger('input');
        await component.$nextTick();

        expect(clone_name_input.is_valid).toBe(false);
        expect(component.clone_course_form_is_valid).toBe(false);
        expect(wrapper.vm.d_show_clone_course_modal).toBe(true);
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

        component = wrapper.vm;
        await component.$nextTick();

        wrapper.find('.clone-course').trigger('click');
        await component.$nextTick();

        let clone_year_input = <ValidatedInput> wrapper.find(
            {ref: "copy_of_course_year"}
        ).vm;

        expect(wrapper.find({ref: 'clone_course_modal'}).exists()).toBe(true);
        expect(component.new_course_year).toEqual(component.course.year);
        expect(clone_year_input.is_valid).toBe(true);

        let clone_year = wrapper.find({ref: 'copy_of_course_year'}).find('#input');
        (<HTMLInputElement> clone_year.element).value = "1999";
        clone_year.trigger('input');
        await component.$nextTick();

        expect(clone_year_input.is_valid).toBe(false);
        expect(component.clone_course_form_is_valid).toBe(false);
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

         component = wrapper.vm;
         await component.$nextTick();

         wrapper.find('.clone-course').trigger('click');
         await component.$nextTick();

         let clone_year_input = <ValidatedInput> wrapper.find(
             {ref: "copy_of_course_year"}
         ).vm;

         expect(wrapper.find({ref: 'clone_course_modal'}).exists()).toBe(true);
         expect(component.new_course_year).toEqual(component.course.year);
         expect(clone_year_input.is_valid).toBe(true);

         let clone_year = wrapper.find({ref: 'copy_of_course_year'}).find('#input');
         (<HTMLInputElement> clone_year.element).value = "2000";
         clone_year.trigger('input');
         await component.$nextTick();

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

        component = wrapper.vm;
        await component.$nextTick();

        wrapper.find('.clone-course').trigger('click');
        await component.$nextTick();

        let clone_year_input = <ValidatedInput> wrapper.find(
        {ref: "copy_of_course_year"}
        ).vm;

        expect(wrapper.find({ref: 'clone_course_modal'}).exists()).toBe(true);
        expect(component.new_course_year).toEqual(component.course.year);
        expect(clone_year_input.is_valid).toBe(true);

        let clone_year = wrapper.find({ref: 'copy_of_course_year'}).find('#input');
        (<HTMLInputElement> clone_year.element).value = "spoon";
        clone_year.trigger('input');
        await component.$nextTick();

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

        component = wrapper.vm;
        await component.$nextTick();

        wrapper.find('.clone-course').trigger('click');
        await component.$nextTick();

        let clone_year_input = <ValidatedInput> wrapper.find({ref: "copy_of_course_year"}).vm;

        expect(wrapper.find({ref: 'clone_course_modal'}).exists()).toBe(true);
        expect(component.new_course_year).toEqual(component.course.year);
        expect(clone_year_input.is_valid).toBe(true);

        let clone_year = wrapper.find({ref: 'copy_of_course_year'}).find('#input');
        (<HTMLInputElement> clone_year.element).value = "    ";
        clone_year.trigger('input');
        await component.$nextTick();

        expect(clone_year_input.is_valid).toBe(false);
    });

    test("When creating a clone of a course the clone's combination of " +
         "(course name, year, semester) must be unique - violates condition",
         async () => {

        wrapper = mount(SingleCourse, {
            propsData: {
                course: course_1,
                is_admin: true
            },
            stubs: ['router-link', 'router-view']
        });

        component = wrapper.vm;
        await component.$nextTick();

        wrapper.find('.clone-course').trigger('click');
        await component.$nextTick();

        let clone_name_input = <ValidatedInput> wrapper.find({ref: "copy_of_course_name"}).vm;
        let clone_year_input = <ValidatedInput> wrapper.find({ref: "copy_of_course_year"}).vm;

        expect(wrapper.find({ref: 'clone_course_modal'}).exists()).toBe(true);

        let clone_name = wrapper.find({ref: 'copy_of_course_name'}).find('#input');
        (<HTMLInputElement> clone_name.element).value = component.course.name;
        clone_name.trigger('input');
        await component.$nextTick();

        component.new_course_semester = course_1.semester !== null
                                            ? course_1.semester : Semester.winter;

        expect(clone_name_input.is_valid).toBe(true);
        expect(clone_year_input.is_valid).toBe(true);
        expect(component.new_course_name).toEqual(component.course.name);
        expect(component.new_course_semester).toEqual(component.course.semester);
        expect(component.new_course_year).toEqual(component.course.year);

        let copy_course_stub = sinon.stub(component.course, 'copy').returns(
            Promise.reject(
                new HttpError(
                    400,
                    {__all__: "A course with this name, semester, and year already exists."}
                )
            )
        );

        wrapper.find({ref: 'clone_course_form'}).trigger('submit');
        await component.$nextTick();

        let api_errors = <APIErrors> wrapper.find({ref: 'api_errors'}).vm;
        expect(copy_course_stub.calledOnce);
        expect(api_errors.d_api_errors.length).toBe(1);
        expect(wrapper.find({ref: 'clone_course_modal'}).exists()).toBe(true);
    });

    test("Cloning a course whose semester and year are null",
         async () => {
        wrapper = mount(SingleCourse, {
            propsData: {
                course: course_with_null_values,
                is_admin: true
            },
            stubs: ['router-link', 'router-view']
        });

        component = wrapper.vm;
        await component.$nextTick();

        wrapper.find('.clone-course').trigger('click');
        await component.$nextTick();

        let clone_name_input = <ValidatedInput> wrapper.find({ref: "copy_of_course_name"}).vm;
        let clone_year_input = <ValidatedInput> wrapper.find({ref: "copy_of_course_year"}).vm;

        expect(wrapper.find({ref: 'clone_course_modal'}).exists()).toBe(true);

        let clone_name = wrapper.find({ref: 'copy_of_course_name'}).find('#input');
        (<HTMLInputElement> clone_name.element).value = "New Course";
        clone_name.trigger('input');
        await component.$nextTick();

        let current_year = (new Date()).getFullYear();

        expect(clone_name_input.is_valid).toBe(true);
        expect(clone_year_input.is_valid).toBe(true);
        expect(component.new_course_name).toEqual("New Course");
        expect(component.new_course_semester).toEqual(Semester.fall);
        expect(component.new_course_year).toEqual(current_year);
        expect(component.clone_course_form_is_valid).toBe(true);

        let copy_course_stub = sinon.stub(component.course, 'copy');
        wrapper.find({ref: 'clone_course_form'}).trigger('submit');
        await component.$nextTick();

        expect(copy_course_stub.firstCall.calledWith(
            "New Course", Semester.fall, current_year
        )).toBe(true);
        expect(wrapper.find({ref: 'clone_course_modal'}).exists()).toBe(false);
        expect(component.new_course_name).toEqual("New Course");
        expect(component.new_course_semester).toEqual(Semester.fall);
        expect(component.new_course_year).toEqual(current_year);
     });

    test("When creating a clone of a course the clone's combination of " +
         "(course name, year, semester) must be unique - meets condition",
         async () => {

        wrapper = mount(SingleCourse, {
            propsData: {
                course: course_1,
                is_admin: true
            },
            stubs: ['router-link', 'router-view']
        });

        component = wrapper.vm;
        await component.$nextTick();

        wrapper.find('.clone-course').trigger('click');
        await component.$nextTick();

        let clone_name_input = <ValidatedInput> wrapper.find({ref: "copy_of_course_name"}).vm;
        let clone_year_input = <ValidatedInput> wrapper.find({ref: "copy_of_course_year"}).vm;

        expect(wrapper.find({ref: 'clone_course_modal'}).exists()).toBe(true);
        expect(wrapper.vm.d_show_clone_course_modal).toBe(true);

        let clone_name = wrapper.find({ref: 'copy_of_course_name'}).find('#input');
        (<HTMLInputElement> clone_name.element).value = "New Course";
        clone_name.trigger('input');
        await component.$nextTick();

        expect(clone_name_input.is_valid).toBe(true);
        expect(clone_year_input.is_valid).toBe(true);
        expect(component.new_course_name).toEqual("New Course");
        expect(component.new_course_semester).toEqual(course_1.semester);
        expect(component.new_course_year).toEqual(course_1.year);
        expect(component.clone_course_form_is_valid).toBe(true);

        let copy_course_stub = sinon.stub(component.course, 'copy');
        wrapper.find({ref: 'clone_course_form'}).trigger('submit');
        await component.$nextTick();

        expect(copy_course_stub.firstCall.calledWith(
            "New Course", course_1.semester, course_1.year
        )).toBe(true);
        expect(wrapper.find({ref: 'clone_course_modal'}).exists()).toBe(false);
        expect(wrapper.vm.d_show_clone_course_modal).toBe(false);
        expect(component.new_course_name).toEqual("New Course");
        expect(component.new_course_semester).toEqual(course_1.semester);
        expect(component.new_course_year).toEqual(course_1.year);
     });
});
