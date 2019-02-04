import CourseAdmin from '@/components/course_admin/course_admin.vue';
import Dropdown from '@/components/dropdown.vue';
import { config, mount, Wrapper } from '@vue/test-utils';
import { Course, Semester, User } from 'ag-client-typescript';
import { prependListener } from 'cluster';
import Vue from 'vue';

import { patch_async_static_method } from '../mocking';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('CourseAdmin.vue', () => {
    let wrapper: Wrapper<CourseAdmin>;
    let course_admin_component: CourseAdmin;
    let course: Course;
    let original_match_media: (query: string) => MediaQueryList;
    let user1: User;
    let user2: User;
    let user3: User;

    const $route = {
        path: '/web/course_admin/:courseId',
        params: { courseId: '2' }
    };

    beforeEach(() => {

        course = new Course(
            {pk: 2, name: 'EECS 280', semester: Semester.winter, year: 2019, subtitle: '',
             num_late_days: 0, last_modified: '2019-02-04T17:53:11.230945Z'});

        user1 = new User({
            pk: 1,
            username: "amandaplease@umich.edu",
            first_name: "Amanda",
            last_name: "Bynes",
            email: "amandaplease@umich.edu",
            is_superuser: true
        });

        user2 = new User({
            pk: 2,
            username: "coolmom@umich.edu",
            first_name: "Amy",
            last_name: "Poehler",
            email: "coolmom@umich.edu",
            is_superuser: true
        });

        user3 = new User({
            pk: 3,
            username: "worldsbestboss@umich.edu",
            first_name: "Steve",
            last_name: "Carell",
            email: "worldsbestboss@umich.edu",
            is_superuser: true
        });

        config.logModifiedComponents = false;
        original_match_media = window.matchMedia;
        Object.defineProperty(window, "matchMedia", {
            value: jest.fn(() => {
                return { matches: true };
            })
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

    test('Course Admin loads course', async () => {
        await patch_async_static_method(Course,
                                        'get_by_pk',
                                        () =>  Promise.resolve(course),
                                        async () => {

            let mock_result = await Course.get_by_pk(2);
            expect(mock_result).toEqual(course);

            wrapper = mount(CourseAdmin, {
                mocks: {
                    $route
                }
            });

            await wrapper.vm.$nextTick();

            course_admin_component = wrapper.vm;
            expect(course_admin_component.course).toEqual(course);
        });
    });

    test('Changing tabs to permissions tab', async () => {
        await patch_async_static_method(Course,
                                        'get_by_pk',
                                        () =>  Promise.resolve(course),
                                        async () => {

            let mock_result = await Course.get_by_pk(2);
            expect(mock_result).toEqual(course);

            wrapper = mount(CourseAdmin, {
                mocks: {
                    $route
                }
            });

            await wrapper.vm.$nextTick();

            course_admin_component = wrapper.vm;
            expect(course_admin_component.course).toEqual(course);

            let permissions_tab = wrapper.find('.permissions-tab-header');
            permissions_tab.trigger('click');

            let permissions_dropdown = <Dropdown> wrapper.find({ref: 'permission_dropdown'}).vm;
            expect(permissions_dropdown.d_is_open).toBe(true);

            console.log(permissions_dropdown.d_highlighted_index);

            let highlighted_item = wrapper.find(".highlight");
            expect(highlighted_item.text()).toContain("Admin");
            highlighted_item.trigger('click');

            expect(course_admin_component.role_selected).toEqual("Admin");
        });
    });

    test('Changing tabs from permissions tab', async () => {
        await patch_async_static_method(Course,
                                        'get_by_pk',
                                        () =>  Promise.resolve(course),
                                        async () => {

            let mock_result = await Course.get_by_pk(2);
            expect(mock_result).toEqual(course);

            wrapper = mount(CourseAdmin, {
                mocks: {
                    $route
                }
            });

            await wrapper.vm.$nextTick();

            course_admin_component = wrapper.vm;
            expect(course_admin_component.course).toEqual(course);

            let permissions_tab = wrapper.find('.permissions-tab-header');
            permissions_tab.trigger('click');

            let permissions_dropdown = <Dropdown> wrapper.find({ref: 'permission_dropdown'}).vm;
            expect(permissions_dropdown.d_is_open).toBe(true);

            let highlighted_item = wrapper.find(".highlight");
            expect(highlighted_item.text()).toContain("Admin");
            highlighted_item.trigger('click');

            expect(course_admin_component.role_selected).toEqual("Admin");

            let tabs = wrapper.findAll('.tab-label');
            expect(tabs.length).toEqual(3);
            tabs.at(2).trigger('click');
            await wrapper.vm.$nextTick();

            expect(course_admin_component.current_tab_index).toEqual(2);
            expect(course_admin_component.role_selected).toEqual("");
        });
    });
});
