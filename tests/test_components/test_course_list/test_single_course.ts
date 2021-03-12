import { Course, HttpError, Semester } from 'ag-client-typescript';
import * as sinon from 'sinon';

import APIErrors from '@/components/api_errors.vue';
import SingleCourse from '@/components/course_list/single_course.vue';
import { assert_not_null } from '@/utils';

import * as data_ut from '@/tests/data_utils';
import { managed_mount } from '@/tests/setup';
import { expect_html_element_has_value, set_data, set_validated_input_text, validated_input_is_valid, wait_until } from '@/tests/utils';


describe('SingleCourse.vue', () => {
    let course: Course;
    let clone_of_course: Course;

    beforeEach(() => {
        course = data_ut.make_course();

        clone_of_course = new Course({
            pk: 2, name: 'EECS 280', semester: Semester.winter, year: 2020, subtitle: '',
            num_late_days: 0, allowed_guest_domain: '', last_modified: ''
        });
    });

    function make_wrapper(course_ = course, is_admin = true) {
        return managed_mount(SingleCourse, {
            propsData: {
                course: course_,
                is_admin: is_admin
            },
            stubs: ['router-link', 'router-view']
        });
    }

    test('SingleCourse data members are initialized from input course', async () => {
        let wrapper = managed_mount(SingleCourse, {
            propsData: {
                course: course
            },
            stubs: ['router-link', 'router-view']
        });

        expect(wrapper.vm.course).toEqual(course);
        expect(wrapper.vm.is_admin).toBe(false);
        expect(wrapper.vm.new_course_year).toEqual(wrapper.vm.course.year);
    });

    test('SingleCourse data members use defaults when semester and year are null', async () => {
        course.semester = null;
        course.year = null;
        let wrapper = make_wrapper(course, false);

        expect(wrapper.vm.course).toEqual(course);
        expect(wrapper.vm.is_admin).toBe(false);

        expect(wrapper.vm.new_course_semester).toEqual(Semester.fall);
        expect(wrapper.vm.new_course_year).toEqual((new Date()).getFullYear());
    });

    test('If the user is an admin, they have the option to clone or edit a course', async () => {
        let wrapper = make_wrapper();

        expect(wrapper.vm.is_admin).toBe(true);
        expect(wrapper.findAll('.clone-course').length).toEqual(1);
        expect(wrapper.findAll('.edit-course-settings').length).toEqual(1);
    });

    test('Semester binding - for clone of course', async () => {
        let wrapper = make_wrapper();

        await wrapper.find('.clone-course').trigger('click');
        let semester_select = wrapper.find('[data-testid=semester]');

        expect(wrapper.vm.new_course_semester).toEqual(course.semester);

        await semester_select.setValue(Semester.summer);
        expect(wrapper.vm.new_course_semester).toEqual(Semester.summer);

        await semester_select.setValue(Semester.winter);
        expect(wrapper.vm.new_course_semester).toEqual(Semester.winter);

        await set_data(wrapper, {new_course_semester: Semester.spring});
        expect_html_element_has_value(semester_select, Semester.spring);
    });

    test("Clone and edit options hidden from non-admin users", async () => {
        let wrapper = make_wrapper(course, false);
        expect(wrapper.vm.is_admin).toBe(false);
        expect(wrapper.findAll('.clone-course').length).toEqual(0);
        expect(wrapper.findAll('.edit-course-settings').length).toEqual(0);
    });

    test('The newly cloned course name cannot be an empty string', async () => {
        let wrapper = make_wrapper();

        await wrapper.find('.clone-course').trigger('click');
        let clone_name_input = wrapper.findComponent({ref: "copy_of_course_name"});

        await set_validated_input_text(clone_name_input, "");

        expect(wrapper.findComponent({ref: 'clone_course_modal'}).exists()).toBe(true);
        expect(wrapper.vm.d_show_clone_course_modal).toBe(true);
        expect(validated_input_is_valid(clone_name_input)).toBe(false);

        await set_validated_input_text(clone_name_input, "    ");

        expect(validated_input_is_valid(clone_name_input)).toBe(false);
        expect(wrapper.vm.clone_course_form_is_valid).toBe(false);
        expect(wrapper.vm.d_show_clone_course_modal).toBe(true);
    });

    test('The newly cloned course year must be greater >= 2000 - violates condition', async () => {
        let wrapper = make_wrapper();

        await wrapper.find('.clone-course').trigger('click');
        let clone_year_input = wrapper.findComponent({ref: "copy_of_course_year"});

        expect(wrapper.findComponent({ref: 'clone_course_modal'}).exists()).toBe(true);
        expect(wrapper.vm.new_course_year).toEqual(wrapper.vm.course.year);
        expect(validated_input_is_valid(clone_year_input)).toBe(true);

        await set_validated_input_text(clone_year_input, "1999");

        expect(validated_input_is_valid(clone_year_input)).toBe(false);
        expect(wrapper.vm.clone_course_form_is_valid).toBe(false);
    });

    test('The newly cloned course year must be greater >= 2000 - meets condition', async () => {
        let wrapper = make_wrapper();

        await wrapper.find('.clone-course').trigger('click');
        let clone_year_input = wrapper.findComponent({ref: "copy_of_course_year"});

        expect(wrapper.findComponent({ref: 'clone_course_modal'}).exists()).toBe(true);
        expect(wrapper.vm.new_course_year).toEqual(wrapper.vm.course.year);
        expect(validated_input_is_valid(clone_year_input)).toBe(true);

        await set_validated_input_text(wrapper.findComponent({ref: 'copy_of_course_year'}), "2000");
        expect(validated_input_is_valid(clone_year_input)).toBe(true);
    });

    test('The newly cloned course year must be a number - violates condition', async () => {
        let wrapper = make_wrapper();

        await wrapper.find('.clone-course').trigger('click');
        let clone_year_input = wrapper.findComponent({ref: "copy_of_course_year"});

        expect(wrapper.findComponent({ref: 'clone_course_modal'}).exists()).toBe(true);
        expect(wrapper.vm.new_course_year).toEqual(wrapper.vm.course.year);
        expect(validated_input_is_valid(clone_year_input)).toBe(true);

        await set_validated_input_text(clone_year_input, "spoon");
        expect(validated_input_is_valid(clone_year_input)).toBe(false);
    });

    test('The newly cloned course year cannot be empty - violates condition', async () => {
        let wrapper = make_wrapper();

        await wrapper.find('.clone-course').trigger('click');
        let clone_year_input = wrapper.findComponent({ref: "copy_of_course_year"});

        expect(wrapper.findComponent({ref: 'clone_course_modal'}).exists()).toBe(true);
        expect(wrapper.vm.new_course_year).toEqual(wrapper.vm.course.year);
        expect(validated_input_is_valid(clone_year_input)).toBe(true);

        await set_validated_input_text(clone_year_input, "    ");

        expect(validated_input_is_valid(clone_year_input)).toBe(false);
    });

    test("Successful clone", async () => {
        let wrapper = make_wrapper();

        let new_name = "New Course";
        await wrapper.find('.clone-course').trigger('click');
        let clone_name_input = wrapper.findComponent({ref: "copy_of_course_name"});
        await set_validated_input_text(clone_name_input, new_name);
        expect(validated_input_is_valid(clone_name_input)).toBe(true);

        let copy_course_stub = sinon.stub(wrapper.vm.course, 'copy');
        await wrapper.findComponent({ref: 'clone_course_form'}).trigger('submit');

        assert_not_null(course.semester);
        assert_not_null(course.year);
        expect(copy_course_stub.firstCall.calledWith(
            new_name, course.semester, course.year
        )).toBe(true);
        expect(wrapper.findComponent({ref: 'clone_course_modal'}).exists()).toBe(false);
    });

    test("API errors handled", async () => {
        let wrapper = make_wrapper();

        await wrapper.find('.clone-course').trigger('click');
        let clone_name_input = wrapper.findComponent({ref: "copy_of_course_name"});
        await set_validated_input_text(clone_name_input, "Some course name");
        expect(validated_input_is_valid(clone_name_input)).toBe(true);

        let copy_course_stub = sinon.stub(wrapper.vm.course, 'copy').rejects(
            new HttpError(400, {__all__: "This data is bad."})
        );
        await wrapper.findComponent({ref: 'clone_course_form'}).trigger('submit');
        expect(await wait_until(wrapper, w => !w.vm.d_cloning)).toBe(true);

        let api_errors = <APIErrors> wrapper.findComponent({ref: 'api_errors'}).vm;
        expect(copy_course_stub.calledOnce);
        expect(api_errors.d_api_errors.length).toBe(1);
        expect(wrapper.findComponent({ref: 'clone_course_modal'}).exists()).toBe(true);
    });
});
