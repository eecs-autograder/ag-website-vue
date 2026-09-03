import { Course, HttpError, Semester } from 'ag-client-typescript';
import * as sinon from 'sinon';

import APIErrors from '@/components/api_errors.vue';
import Modal from '@/components/modal.vue';
import SingleCourse from '@/components/course_list/single_course.vue';
import ValidatedIntInput from '@/components/validated_input/ValidatedIntInput.vue';
import ValidatedTextInput from '@/components/validated_input/ValidatedTextInput.vue';
import { assert_not_null } from '@/utils';

import * as data_ut from '@/tests/data_utils';
import { managed_mount } from '@/tests/setup';
import {
    expect_html_element_has_value,
    set_validated_input_text,
    wait_until,
} from '@/tests/utils';


describe('SingleCourse.vue', () => {
    let course: Course;

    beforeEach(() => {
        course = data_ut.make_course();
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

    function open_clone_modal(wrapper: ReturnType<typeof make_wrapper>) {
        return wrapper.find('.clone-course').trigger('click');
    }

    function clone_form_inputs(wrapper: ReturnType<typeof make_wrapper>) {
        return {
            name_input: wrapper.findComponent(ValidatedTextInput).find('input'),
            semester_select: wrapper.find('[data-testid=semester]'),
            year_input: wrapper.findComponent(ValidatedIntInput).find('input'),
            submit_button: wrapper.find('.create-clone-button'),
        };
    }

    test('Clone form fields default to the course name, semester, and year', async () => {
        let wrapper = make_wrapper();
        await open_clone_modal(wrapper);

        let {name_input, semester_select, year_input} = clone_form_inputs(wrapper);
        expect_html_element_has_value(name_input, course.name);
        expect_html_element_has_value(semester_select, course.semester);
        expect_html_element_has_value(year_input, `${course.year}`);
    });

    test('Clone form semester and year default when course semester and year are null',
         async () => {
        course.semester = null;
        course.year = null;
        let wrapper = make_wrapper(course);
        await open_clone_modal(wrapper);

        let {semester_select, year_input} = clone_form_inputs(wrapper);
        expect_html_element_has_value(semester_select, Semester.fall);
        expect_html_element_has_value(year_input, `${(new Date()).getFullYear()}`);
    });

    test('If the user is an admin, they have the option to clone or edit a course', async () => {
        let wrapper = make_wrapper(course, true);

        expect(wrapper.findAll('.clone-course').length).toEqual(1);
        expect(wrapper.findAll('.edit-course-settings').length).toEqual(1);
    });

    test("Clone and edit options hidden from non-admin users", async () => {
        let wrapper = make_wrapper(course, false);

        expect(wrapper.findAll('.clone-course').length).toEqual(0);
        expect(wrapper.findAll('.edit-course-settings').length).toEqual(0);
    });

    test('Semester binding - for clone of course', async () => {
        let wrapper = make_wrapper();
        await open_clone_modal(wrapper);
        let {semester_select} = clone_form_inputs(wrapper);

        expect_html_element_has_value(semester_select, course.semester);

        await semester_select.setValue(Semester.summer);
        expect_html_element_has_value(semester_select, Semester.summer);

        await semester_select.setValue(Semester.winter);
        expect_html_element_has_value(semester_select, Semester.winter);
    });

    test('The newly cloned course name cannot be an empty string', async () => {
        let wrapper = make_wrapper();
        await open_clone_modal(wrapper);
        let {name_input, submit_button} = clone_form_inputs(wrapper);

        await set_validated_input_text(name_input, "");
        expect(wrapper.findComponent(Modal).exists()).toBe(true);
        expect(submit_button.element).toBeDisabled();

        await set_validated_input_text(name_input, "    ");
        expect(submit_button.element).toBeDisabled();
        expect(wrapper.findComponent(Modal).exists()).toBe(true);
    });

    test('The newly cloned course year must be greater >= 2000 - violates condition',
         async () => {
        let wrapper = make_wrapper();
        await open_clone_modal(wrapper);
        let {year_input, submit_button} = clone_form_inputs(wrapper);

        expect(submit_button.element).not.toBeDisabled();

        await set_validated_input_text(year_input, "1999");
        expect(submit_button.element).toBeDisabled();
    });

    test('The newly cloned course year must be greater >= 2000 - meets condition', async () => {
        let wrapper = make_wrapper();
        await open_clone_modal(wrapper);
        let {year_input, submit_button} = clone_form_inputs(wrapper);

        expect(submit_button.element).not.toBeDisabled();

        await set_validated_input_text(year_input, "2000");
        expect(submit_button.element).not.toBeDisabled();
    });

    test('The newly cloned course year must be a number - violates condition', async () => {
        let wrapper = make_wrapper();
        await open_clone_modal(wrapper);
        let {year_input, submit_button} = clone_form_inputs(wrapper);

        expect(submit_button.element).not.toBeDisabled();

        await set_validated_input_text(year_input, "spoon");
        expect(submit_button.element).toBeDisabled();
    });

    test('The newly cloned course year cannot be empty - violates condition', async () => {
        let wrapper = make_wrapper();
        await open_clone_modal(wrapper);
        let {year_input, submit_button} = clone_form_inputs(wrapper);

        expect(submit_button.element).not.toBeDisabled();

        await set_validated_input_text(year_input, "    ");
        expect(submit_button.element).toBeDisabled();
    });

    test("Successful clone", async () => {
        let wrapper = make_wrapper();

        let new_name = "New Course";
        await open_clone_modal(wrapper);
        let {name_input, submit_button} = clone_form_inputs(wrapper);
        await set_validated_input_text(name_input, new_name);
        expect(submit_button.element).not.toBeDisabled();

        let copy_course_stub = sinon.stub(course, 'copy');
        await wrapper.find('form').trigger('submit');

        await wait_until(wrapper, w => !w.findComponent(Modal).exists());
        assert_not_null(course.semester);
        assert_not_null(course.year);
        expect(copy_course_stub.firstCall.calledWith(
            new_name, course.semester, course.year
        )).toBe(true);
        expect(wrapper.findComponent(Modal).exists()).toBe(false);
    });

    test("API errors handled", async () => {
        let wrapper = make_wrapper();

        await open_clone_modal(wrapper);
        let {name_input, submit_button} = clone_form_inputs(wrapper);
        await set_validated_input_text(name_input, "Some course name");
        expect(submit_button.element).not.toBeDisabled();

        sinon.stub(course, 'copy').rejects(
            new HttpError(400, {__all__: "This data is bad."})
        );
        await wrapper.find('form').trigger('submit');
        expect(await wait_until(wrapper, w => !w.find('[role="status"]').exists())).toBe(true);

        let api_errors = wrapper.findComponent(APIErrors);
        expect(api_errors.findAll('.error-msg-container').length).toBe(1);
        expect(wrapper.findComponent(Modal).exists()).toBe(true);
    });
});
