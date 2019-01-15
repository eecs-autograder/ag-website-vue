import { config, mount, Wrapper } from '@vue/test-utils';
import { Course, Project, Semester, UltimateSubmissionPolicy, User } from 'ag-client-typescript';
import { AxiosResponse } from 'axios';
import Vue from 'vue';

import CourseAdmin from '../../src/components/course_admin/course_admin.vue';
import Dropdown from '../../src/components/dropdown.vue';
import Tabs from '../../src/components/tabs/tabs.vue';
import ValidatedInput from '../../src/components/validated_input.vue';
import { patch_async_class_method, patch_async_static_method } from '../mocking';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('CourseAdmin.vue', () => {
    let wrapper: Wrapper<CourseAdmin>;
    let course_admin_component: CourseAdmin;
    let course_admin_page: Wrapper<Vue>;
    let course: Course;
    let updated_course: Course;
    let original_match_media: (query: string) => MediaQueryList;
    let course_admins: User[];
    let course_staff: User[];
    let course_students: User[];
    let course_handgraders: User[];
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
             num_late_days: 0, last_modified: ''});
        updated_course = new Course(
            {pk: 2, name: 'EECS 281', semester: Semester.fall, year: 2018, subtitle: '',
             num_late_days: 0, last_modified: ''});

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

        course_admins = [user1, user2, user3];
        course_staff = [user1, user2, user3];
        course_students = [user1, user2, user3];
        course_handgraders = [user1, user2, user3];

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

    test.only('Admin Permissions - cannot add empty string', async () => {
        await patch_async_static_method(
            Course, 'get_by_pk',
            () =>  Promise.resolve(course), async () => {

            let mock_get_by_pk = await Course.get_by_pk(2);
            expect(mock_get_by_pk).toEqual(course);

            wrapper = mount(CourseAdmin, {
                mocks: {
                    $route
                }
            });

            await wrapper.vm.$nextTick();

            // course_admin_component = wrapper.vm;
            // course_admin_page = wrapper.find({ref: 'course_admin_component'});

            await patch_async_class_method(
                Course, 'get_admins',
                () => Promise.resolve(course_admins),
                async () => {

                let mock_get_admins = await course.get_admins();
                expect(mock_get_admins).toEqual(course_admins);

                // course_admin_component.role_selected = 'admin';
                // await wrapper.vm.$nextTick();

                // wrapper.vm.current_tab_index = 1;
                // await wrapper.vm.$nextTick();

                // expect(course_admin_component.current_tab_index).toEqual(1);
                // console.log(wrapper.html());

                // let outer_tabs = <Tabs> wrapper.find({ref: 'course_admin_tabs'}).vm;

                // outer_tabs.d_active_tab_index = 1;
                // course_admin_component.role_selected = "admin";
                // await wrapper.vm.$nextTick();
                // let tab_2 = wrapper.find({ref: 'permissions_tab'});
                // tab_2.trigger('click');

                let tabs = wrapper.findAll('.tab-header');
                // console.log(permissions_tab.at(1).html());
                tabs.at(1).trigger('click');
                await wrapper.vm.$nextTick();
                console.log(wrapper.html());
                // display block dropdown content

                // console.log(course_admin_component.role_selected);
                // console.log(course_admin_page.html()); //settings is still active

                // let role_dropdown = <Dropdown> wrapper.find({ref: 'permission_dropdown'}).vm;
                // // console.log(role_dropdown);
                //
                // let permissions_tab = wrapper.find('#permissions-tab');
                // permissions_tab.trigger('click');
                // await wrapper.vm.$nextTick();
                // console.log(wrapper.html());
                //
                let dropdown_rows = wrapper.findAll('.dropdown-row');
                dropdown_rows.at(0).trigger('click');
                await wrapper.vm.$nextTick();
                console.log(wrapper.html());
                //
                // console.log(wrapper.vm.role_selected);

                // console.log(wrapper.vm.role_selected);
                // let dropdown_rows = wrapper.findAll()
                // console.log(wrapper.html());
                // console.log(course_admin_component.admins);
                // console.log(course_admin_page.html());
                // await course_admin_component.$nextTick();

                // console.log(course_admin_page.html());

                //
                // await course_admin_component.$nextTick();

                // console.log(wrapper.html());

                // course_admin_component.role_selected = "admin";
                // await course_admin_component.$nextTick();

                // expect(course_admin_component.admins).toEqual(course_admins);

                // let add_admins_form = wrapper.find('#add-admins-form');
                // let validated_input_component =
                    // <ValidatedInput> wrapper.find({ref: 'new_admin_list'}).vm;
                // let new_admin_list_input = wrapper.find({ref: 'new_admin_list'}).find('#input');

                // expect(course_admin_component.new_project_name).toEqual("");
                //
                // add_admins_form.trigger('submit');
                // await course_admin_component.$nextTick();
                //
                // expect(wrapper.findAll('.error-li').length).toEqual(1);
            });
        });
    });

    test.skip('Admin Permissions - commas are substituted for spaces', () => {
        wrapper = mount(CourseAdmin);
    });

    test.skip('Admin Permissions - whitespace is trimmed before adding individuals', () => {
        wrapper = mount(CourseAdmin);
    });

    test.skip('Admin Permissions - admins are displayed in alphabeticala order based on username',
              () => {
        wrapper = mount(CourseAdmin);
    });

    test.skip('Admin Permissions - admins can be deleted', () => {
        wrapper = mount(CourseAdmin);
    });


    test.skip('Staff Permissions - cannot add empty string', () => {
        wrapper = mount(CourseAdmin);
    });

    test.skip('Staff Permissions - commas are substituted for spaces', () => {
        wrapper = mount(CourseAdmin);
    });

    test.skip('Staff Permissions - whitespace is trimmed before adding individuals', () => {
        wrapper = mount(CourseAdmin);
    });

    test.skip('Staff Permissions - staff can be deleted', () => {
        wrapper = mount(CourseAdmin);
    });


    test.skip('Student Permissions - cannot add empty string', () => {
        wrapper = mount(CourseAdmin);
    });

    test.skip('Student Permissions - commas are substituted for spaces', () => {
        wrapper = mount(CourseAdmin);
    });

    test.skip('Student Permissions - whitespace is trimmed before adding individuals', () => {
        wrapper = mount(CourseAdmin);
    });

    test.skip('Student Permissions - students can be deleted', () => {
        wrapper = mount(CourseAdmin);
    });


    test.skip('Handgrader Permissions - cannot add empty string', () => {
        wrapper = mount(CourseAdmin);
    });

    test.skip('Handgrader Permissions - commas are substituted for spaces', () => {
        wrapper = mount(CourseAdmin);
    });

    test.skip('Handgrader Permissions - whitespace is trimmed before adding individuals', () => {
        wrapper = mount(CourseAdmin);
    });

    test.skip('Handgrader Permissions - handgraders can be deleted', () => {
        wrapper = mount(CourseAdmin);
    });
});
