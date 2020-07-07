import { mount, Wrapper } from '@vue/test-utils';

import { Course, HttpError, Semester } from 'ag-client-typescript';
import * as sinon from 'sinon';

import APIErrors from '@/components/api_errors.vue';
import CourseSettings from '@/components/course_admin/course_settings.vue';

import { make_course } from '../data_utils';
import { api_error_count, wait_until } from '../utils';

describe('Course settings', () => {
    let wrapper: Wrapper<CourseSettings>;
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
    });

    test('Clicking on the save button calls course.save', async () => {
        let save_settings_stub = sinon.stub(wrapper.vm.d_course, 'save');
        expect(wrapper.vm.d_settings_form_is_valid).toBe(true);

        let updated_data = {
            name: 'An updated name',
            semester: Semester.summer,
            year: 2222,
            num_late_days: 48,
        };
        wrapper.findComponent({ref: 'course_form'}).vm.$emit('submit', updated_data);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_course.name).toEqual(updated_data.name);
        expect(wrapper.vm.d_course.semester).toEqual(updated_data.semester);
        expect(wrapper.vm.d_course.year).toEqual(updated_data.year);
        expect(wrapper.vm.d_course.num_late_days).toEqual(updated_data.num_late_days);

        expect(save_settings_stub.calledOnce).toBe(true);
    });

    test('Course must be unique among courses - violates condition', async () => {
        sinon.stub(wrapper.vm.d_course, 'save').returns(
            Promise.reject(
                new HttpError(400, {
                    'name': 'Name cannot be blank',
                    'size': 'Size must be < 42'
                })
            )
        );

        expect(wrapper.vm.d_settings_form_is_valid).toBe(true);

        wrapper.findComponent({ref: 'course_form'}).trigger('submit');
        await wrapper.vm.$nextTick();

        let api_errors = <APIErrors> wrapper.findComponent({ref: 'api_errors'}).vm;
        expect(api_errors.d_api_errors.length).toBe(2);
    });
});

describe('Delete project tests', () => {
    let wrapper: Wrapper<CourseSettings>;
    let course: Course;
    let router_push_stub: sinon.SinonStub;

    beforeEach(() => {
        course = make_course();
        router_push_stub = sinon.stub();

        wrapper = mount(CourseSettings, {
            propsData: {
                course: course,
            },
            mocks: {
                $router: {
                    push: router_push_stub
                }
            }
        });
    });

    test('Delete course', async () => {
        let delete_stub = sinon.stub(course, 'delete');
        await wrapper.find('[data-testid=show_delete_course_modal_button]').trigger('click');
        await wrapper.find('[data-testid=delete_course_button]').trigger('click');
        expect(await wait_until(wrapper, w => !w.vm.d_deleting)).toBe(true);

        expect(delete_stub.calledOnce).toBe(true);
        expect(router_push_stub.calledOnce).toBe(true);
        let args = router_push_stub.firstCall.args[0];
        expect(args.name).toEqual('course_list');
    });

    test('Delete project API errors handled', async () => {
        sinon.stub(course, 'delete').rejects(new HttpError(403, 'Noope'));
        await wrapper.find('[data-testid=show_delete_course_modal_button]').trigger('click');
        await wrapper.find('[data-testid=delete_course_button]').trigger('click');
        expect(await wait_until(wrapper, w => !w.vm.d_deleting)).toBe(true);

        expect(router_push_stub.callCount).toEqual(0);
        expect(api_error_count(wrapper, {ref: 'delete_errors'})).toEqual(1);
    });
});
