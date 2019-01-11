import CourseAdmin from '@/components/course_admin.vue';
import Dropdown from '@/components/dropdown.vue';
import Tabs from '@/components/tabs/tabs.vue';
import ValidatedInput from '@/components/validated_input.vue';
import { config, mount, Wrapper } from '@vue/test-utils';
import { Course, Project, Semester, UltimateSubmissionPolicy, User } from 'ag-client-typescript';
import { AxiosResponse } from 'axios';
import Vue from 'vue';

import { patch_async_class_method, patch_async_static_method } from './mocking';

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
    let new_project: Project;
    let project_1: Project;
    let project_2: Project;
    let projects: Project[];

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

        // project_1 = new Project({
        //     pk: 1,
        //     name: "Project 1",
        //     last_modified: "today",
        //     course: 2,
        //     visible_to_students: true,
        //     closing_time: null,
        //     soft_closing_time: null,
        //     disallow_student_submissions: true,
        //     disallow_group_registration: true,
        //     guests_can_submit: true,
        //     min_group_size: 1,
        //     max_group_size: 1,
        //     submission_limit_per_day: null,
        //     allow_submissions_past_limit: true,
        //     groups_combine_daily_submissions: false,
        //     submission_limit_reset_time: "",
        //     submission_limit_reset_timezone: "",
        //     num_bonus_submissions: 1,
        //     total_submission_limit: null,
        //     allow_late_days: true,
        //     ultimate_submission_policy: UltimateSubmissionPolicy.best,
        //     hide_ultimate_submission_fdbk: false
        // });
        //
        // project_2 = new Project({
        //     pk: 2,
        //     name: "Project 2",
        //     last_modified: "today",
        //     course: 2,
        //     visible_to_students: true,
        //     closing_time: null,
        //     soft_closing_time: null,
        //     disallow_student_submissions: true,
        //     disallow_group_registration: true,
        //     guests_can_submit: true,
        //     min_group_size: 1,
        //     max_group_size: 1,
        //     submission_limit_per_day: null,
        //     allow_submissions_past_limit: true,
        //     groups_combine_daily_submissions: false,
        //     submission_limit_reset_time: "",
        //     submission_limit_reset_timezone: "",
        //     num_bonus_submissions: 1,
        //     total_submission_limit: null,
        //     allow_late_days: true,
        //     ultimate_submission_policy: UltimateSubmissionPolicy.best,
        //     hide_ultimate_submission_fdbk: false
        // });
        //
        // projects = [project_1, project_2];
        //
        // new_project = new Project({
        //     pk: 3,
        //     name: "Project 3",
        //     last_modified: "today",
        //     course: 2,
        //     visible_to_students: true,
        //     closing_time: null,
        //     soft_closing_time: null,
        //     disallow_student_submissions: true,
        //     disallow_group_registration: true,
        //     guests_can_submit: true,
        //     min_group_size: 1,
        //     max_group_size: 1,
        //     submission_limit_per_day: null,
        //     allow_submissions_past_limit: true,
        //     groups_combine_daily_submissions: false,
        //     submission_limit_reset_time: "",
        //     submission_limit_reset_timezone: "",
        //     num_bonus_submissions: 1,
        //     total_submission_limit: null,
        //     allow_late_days: true,
        //     ultimate_submission_policy: UltimateSubmissionPolicy.best,
        //     hide_ultimate_submission_fdbk: false,
        // });

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

    // SETTINGS TAB *****************************************************************************

    test('Course name is not the empty string', async () => {
        await patch_async_static_method(
            Course, 'get_by_pk',
            () =>  Promise.resolve(course), async () => {

            let mock_result = await Course.get_by_pk(2);
            expect(mock_result).toEqual(course);

            wrapper = mount(CourseAdmin, {
                mocks: {
                    $route
                }
            });

            await wrapper.vm.$nextTick();

            course_admin_component = wrapper.vm;
            course_admin_page = wrapper.find({ref: 'course_admin_component'});

            let validated_input_component = <ValidatedInput> wrapper.find({ref: 'course_name'}).vm;
            let name_input = wrapper.find({ref: 'course_name'}).find('#input');

            expect(course_admin_component.course!.name).toEqual(course.name);
            expect(validated_input_component.is_valid).toBe(true);

            (<HTMLInputElement> name_input.element).value = "";
            name_input.trigger('input');

            expect(validated_input_component.is_valid).toBe(false);
        });
    });

    test('Year must be a number', async () => {
        await patch_async_static_method(
            Course, 'get_by_pk',
            () => Promise.resolve(course), async () => {

            let mock_result = await Course.get_by_pk(2);
            expect(mock_result).toEqual(course);

            wrapper = mount(CourseAdmin, {
                mocks: {
                    $route
                }
            });

            await wrapper.vm.$nextTick();

            course_admin_component = wrapper.vm;
            course_admin_page = wrapper.find({ref: 'course_admin_component'});

            let validated_input_component = <ValidatedInput> wrapper.find(
                {ref: 'course_year'}).vm;
            let year_input = wrapper.find({ref: 'course_year'}).find('#input');

            expect(course_admin_component.course!.year).toEqual(2019);
            expect(validated_input_component.is_valid).toBe(true);

            (<HTMLInputElement> year_input.element).value = "twenty-nineteen";
            year_input.trigger('input');

            expect(validated_input_component.is_valid).toBe(false);
        });
    });

    test('Year must be a valid year (greater >= 2000)', async () => {
        await patch_async_static_method(
            Course, 'get_by_pk',
            () => Promise.resolve(course), async () => {

            let mock_result = await Course.get_by_pk(2);
            expect(mock_result).toEqual(course);

            wrapper = mount(CourseAdmin, {
                mocks: {
                    $route
                }
            });

            await wrapper.vm.$nextTick();

            course_admin_component = wrapper.vm;
            course_admin_page = wrapper.find({ref: 'course_admin_component'});

            let validated_input_component = <ValidatedInput> wrapper.find(
                {ref: 'course_year'}).vm;
            let year_input = wrapper.find({ref: 'course_year'}).find('#input');

            expect(course_admin_component.course!.year).toEqual(2019);
            expect(validated_input_component.is_valid).toBe(true);

            (<HTMLInputElement> year_input.element).value = "1999";
            year_input.trigger('input');

            expect(validated_input_component.is_valid).toBe(false);

            (<HTMLInputElement> year_input.element).value = "2000";
            year_input.trigger('input');

            expect(validated_input_component.is_valid).toBe(true);
        });
    });

    test('Year must not be empty', async () => {
        await patch_async_static_method(
            Course, 'get_by_pk',
            () => Promise.resolve(course), async () => {

            let mock_result = await Course.get_by_pk(2);
            expect(mock_result).toEqual(course);

            wrapper = mount(CourseAdmin, {
                mocks: {
                    $route
                }
            });

            await wrapper.vm.$nextTick();

            course_admin_component = wrapper.vm;
            course_admin_page = wrapper.find({ref: 'course_admin_component'});

            let validated_input_component = <ValidatedInput> wrapper.find(
                {ref: 'course_year'}).vm;
            let year_input = wrapper.find({ref: 'course_year'}).find('#input');

            expect(course_admin_component.course!.year).toEqual(2019);
            expect(validated_input_component.is_valid).toBe(true);

            (<HTMLInputElement> year_input.element).value = "";
            year_input.trigger('input');

            expect(validated_input_component.is_valid).toBe(false);
        });
    });

    test('Late days cannot be negative', async () => {
        await patch_async_static_method(
            Course, 'get_by_pk',
            () => Promise.resolve(course), async () => {

            let mock_result = await Course.get_by_pk(2);
            expect(mock_result).toEqual(course);

            wrapper = mount(CourseAdmin, {
                mocks: {
                    $route
                }
            });

            await wrapper.vm.$nextTick();

            course_admin_component = wrapper.vm;
            course_admin_page = wrapper.find({ref: 'course_admin_component'});

            let validated_input_component = <ValidatedInput> wrapper.find(
                {ref: 'course_late_days'}).vm;
            let late_days_input = wrapper.find({ref: 'course_late_days'}).find('#input');

            expect(course_admin_component.course!.num_late_days).toEqual(0);
            expect(validated_input_component.is_valid).toBe(true);

            (<HTMLInputElement> late_days_input.element).value = "-1";
            late_days_input.trigger('input');

            expect(validated_input_component.is_valid).toBe(false);

            (<HTMLInputElement> late_days_input.element).value = "1";
            late_days_input.trigger('input');

            expect(validated_input_component.is_valid).toBe(true);
        });
    });

    test('Late days must be a number', async () => {
        await patch_async_static_method(
            Course, 'get_by_pk',
            () => Promise.resolve(course), async () => {

            let mock_result = await Course.get_by_pk(2);
            expect(mock_result).toEqual(course);

            wrapper = mount(CourseAdmin, {
                mocks: {
                    $route
                }
            });

            await wrapper.vm.$nextTick();

            course_admin_component = wrapper.vm;
            course_admin_page = wrapper.find({ref: 'course_admin_component'});

            let validated_input_component = <ValidatedInput> wrapper.find(
                {ref: 'course_late_days'}).vm;
            let late_days_input = wrapper.find({ref: 'course_late_days'}).find('#input');

            expect(course_admin_component.course!.num_late_days).toEqual(0);
            expect(validated_input_component.is_valid).toBe(true);

            (<HTMLInputElement> late_days_input.element).value = "zero";
            late_days_input.trigger('input');

            expect(validated_input_component.is_valid).toBe(false);
        });
    });

    test('Late days cannot be empty', async () => {
        await patch_async_static_method(
            Course, 'get_by_pk',
            () => Promise.resolve(course), async () => {

            let mock_result = await Course.get_by_pk(2);
            expect(mock_result).toEqual(course);

            wrapper = mount(CourseAdmin, {
                mocks: {
                    $route
                }
            });

            await wrapper.vm.$nextTick();

            course_admin_component = wrapper.vm;
            course_admin_page = wrapper.find({ref: 'course_admin_component'});

            let validated_input_component = <ValidatedInput> wrapper.find(
                {ref: 'course_late_days'}).vm;
            let late_days_input = wrapper.find({ref: 'course_late_days'}).find('#input');

            expect(course_admin_component.course!.num_late_days).toEqual(0);
            expect(validated_input_component.is_valid).toBe(true);

            (<HTMLInputElement> late_days_input.element).value = "";
            late_days_input.trigger('input');

            expect(validated_input_component.is_valid).toBe(false);
        });
    });

    test.skip('Course must be unique among courses',
              async () => {
        let axios_response_instance: AxiosResponse = {
            data: {
                __all__: "A course with this name, semester, and year " +
                         "already exists."
            },
            status: 400,
            statusText: 'OK',
            headers: {},
            config: {},
            request: {}
        };

        await patch_async_static_method(
            Course, 'get_by_pk',
            () => Promise.resolve(course), async () => {

            let mock_result = await Course.get_by_pk(2);
            expect(mock_result).toEqual(course);

            wrapper = mount(CourseAdmin, {
                mocks: {
                    $route
                }
            });

            await wrapper.vm.$nextTick();

            course_admin_component = wrapper.vm;

            await patch_async_class_method(
                Course, 'save',
                () => Promise.reject(axios_response_instance),
                async () => {

                    let mock_result = await course.save();
                    expect(mock_result).toEqual(axios_response_instance);

                    expect(course_admin_component.settings_form_is_valid).toBe(true);
                    let settings_form = wrapper.find('#course-settings-form');
                    // console.log(settings_form.html());

                    settings_form.trigger('submit.native');
                    await course_admin_component.$nextTick();

                    // console.log(settings_form.html());

                    expect(wrapper.findAll('.error-li').length).toEqual(1);
            });
        });
    });

    // PERMISSIONS TAB **************************************************************************

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

    // PROJECT TAB ******************************************************************************

    // this won't work at the moment because non-empty input validator is not applied
    test('New project name cannot be an empty string', async () => {
        await patch_async_static_method(
            Course, 'get_by_pk',
            () =>  Promise.resolve(course), async () => {

            let mock_result = await Course.get_by_pk(2);
            expect(mock_result).toEqual(course);

            wrapper = mount(CourseAdmin, {
                mocks: {
                    $route
                }
            });

            await wrapper.vm.$nextTick();
            await patch_async_static_method(
                Project, 'get_all_from_course',
                () => Promise.resolve(projects),
                async () => {

                    let mock_result = await Project.get_all_from_course(2);
                    expect(mock_result).toEqual(projects);

                    await patch_async_class_method(
                        Project, 'create',
                        () => Promise.resolve(new_project),
                        async () => {

                        // wrapper.vm.current_tab_index = 2;
                        // await wrapper.vm.$nextTick();
                        console.log(wrapper.html());

                    });
            });
        });
            // course_admin_component = wrapper.vm;
            // course_admin_page = wrapper.find({ref: 'course_admin_component'});

            // let validated_input_component =
                // <ValidatedInput> wrapper.find({ref: 'new_project'}).vm;
            // let new_project_name_input = wrapper.find({ref: 'new_project'}).find('#input');
            //
            // expect(course_admin_component.new_project_name).toEqual("");
            // expect(validated_input_component.is_valid).toBe(false);
            //
            // (<HTMLInputElement> new_project_name_input.element).value = "Project 1";
            // new_project_name_input.trigger('input');
            //
            // expect(validated_input_component.is_valid).toBe(true);
    });

    // Skipping until we figure out how to handle the axiosResponse error business
    test.skip('New project name must be unique among projects in the same course', () => {
        wrapper = mount(CourseAdmin);
    });

    test.skip('Clicking on a project takes you to the submission page for that project', () => {
        wrapper = mount(CourseAdmin);
    });

    test.skip('Clicking on edit project takes you to the project_admin component for that project',
              () => {
        wrapper = mount(CourseAdmin);
    });

});
