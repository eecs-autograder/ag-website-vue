import { config, mount, Wrapper } from '@vue/test-utils';

import { Course, HttpError, Semester } from 'ag-client-typescript';
import * as sinon from 'sinon';

import APIErrors from '@/components/api_errors.vue';
import CourseSettings from '@/components/course_admin/course_settings.vue';
import ValidatedForm from '@/components/validated_form.vue';

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

    test('Clicking on the save button calls course.save', async () => {
        let save_settings_stub = sinon.stub(component.d_course, 'save');
        expect(component.d_settings_form_is_valid).toBe(true);

        let updated_data = {
            name: 'An updated name',
            semester: Semester.summer,
            year: 2222,
            num_late_days: 48,
        };
        wrapper.find({ref: 'course_form'}).vm.$emit('submit', updated_data);
        await component.$nextTick();

        expect(wrapper.vm.d_course.name).toEqual(updated_data.name);
        expect(wrapper.vm.d_course.semester).toEqual(updated_data.semester);
        expect(wrapper.vm.d_course.year).toEqual(updated_data.year);
        expect(wrapper.vm.d_course.num_late_days).toEqual(updated_data.num_late_days);

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

        expect(component.d_settings_form_is_valid).toBe(true);

        wrapper.find({ref: 'course_form'}).trigger('submit');
        await component.$nextTick();

        let api_errors = <APIErrors> wrapper.find({ref: 'api_errors'}).vm;
        expect(api_errors.d_api_errors.length).toBe(2);
    });
});
