import CourseAdmin from '@/components/course_admin/course_admin.vue';
import { config, mount, Wrapper } from '@vue/test-utils';
import { Course, Project, Semester, User } from 'ag-client-typescript';

import { patch_async_class_method, patch_async_static_method } from '../mocking';

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
    let admins: User[];
    let projects: Project[];

    const $route = {
        path: '/web/course_admin/:courseId',
        params: {
            courseId: '2'
        }
    };

    beforeEach(() => {

        course = new Course({
            pk: 1, name: 'EECS 280', semester: Semester.winter, year: 2019, subtitle: '',
            num_late_days: 0, allowed_guest_domain: '',
            last_modified: '2019-02-04T17:53:11.230945Z'
        });

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

        admins = [user1, user2, user3];

        projects = [];

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
        await patch_async_static_method(
            Course,
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
            expect(course_admin_component.current_tab_index).toEqual(0);
            expect(course_admin_component.role_selected).toEqual("");
        });
    });

    test('Changing tabs to permissions tab by clicking on item in dropdown', async () => {
        await patch_async_static_method(
            Course,
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

            // mock getting admins
            return patch_async_class_method(
                Course,
                'get_admins',
                () => Promise.resolve(admins),
                async () => {

                let highlighted_item = wrapper.find(".highlight");
                expect(highlighted_item.text()).toContain("Admin");
                highlighted_item.trigger('click');
                await course_admin_component.$nextTick();

                expect(course_admin_component.role_selected).toEqual("Admin");
                expect(course_admin_component.current_tab_index).toEqual(1);
            })
        });
    });

    test('Changing tabs to permissions tab by pressing enter on item in dropdown', async () => {
        await patch_async_static_method(
            Course,
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

            let highlighted_item = wrapper.find(".highlight");
            expect(highlighted_item.text()).toContain("Admin");
            highlighted_item.trigger("keydown", {code: "Enter" });
            await course_admin_component.$nextTick();

            // mock getting admins
            return patch_async_class_method(
                Course,
                'get_admins',
                () => Promise.resolve(admins),
                async () => {

                expect(course_admin_component.role_selected).toEqual("Admin");
                expect(course_admin_component.current_tab_index).toEqual(1);
            });
        });
    });

    test('Changing tabs from permissions tab', async () => {
        // making an http request
        await patch_async_static_method(
            Course,
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
            await course_admin_component.$nextTick();

            // mock getting admins
            return patch_async_class_method(
                Course,
                'get_admins',
                () => Promise.resolve(admins),
                async () => {

                let highlighted_item = wrapper.find(".highlight");
                expect(highlighted_item.text()).toContain("Admin");
                highlighted_item.trigger('click');
                await course_admin_component.$nextTick();

                expect(course_admin_component.role_selected).toEqual("Admin");

                // mock getting projects
                return patch_async_static_method(
                    Project,
                    'get_all_from_course',
                    () => Promise.resolve(projects),
                    async () => {

                    let tabs = wrapper.findAll('.tab-label');
                    expect(tabs.length).toEqual(3);
                    tabs.at(2).trigger('click');
                    await course_admin_component.$nextTick();

                    expect(course_admin_component.current_tab_index).toEqual(2);
                    expect(course_admin_component.role_selected).toEqual("");
                });
            });
        });
    });
});
