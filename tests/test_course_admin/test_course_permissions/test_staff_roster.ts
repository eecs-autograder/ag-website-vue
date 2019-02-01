import Permissions from '@/components/course_admin/permissions/permissions.vue';
import StaffRoster from '@/components/course_admin/permissions/staff_roster.vue';
import { config, mount, Wrapper } from '@vue/test-utils';
import { Course, Semester, User } from 'ag-client-typescript';

import { patch_async_class_method } from '../../mocking';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('StaffRoster.vue', () => {
    let wrapper: Wrapper<StaffRoster>;
    let staff_roster: StaffRoster;
    let original_match_media: (query: string) => MediaQueryList;
    let user_1: User;
    let user_2: User;
    let user_3: User;
    let user_4: User;
    let new_user_1: User;
    let new_user_2: User;
    let my_course: Course;
    let staff: User[];

    const $route = {
        path: '/web/course_admin/:courseId',
        params: {courseId: '2'}
    };

    beforeEach(() => {
        my_course = new Course({
            pk: 2, name: 'EECS 280', semester: Semester.winter, year: 2019, subtitle: '',
            num_late_days: 0, last_modified: ''
        });

        user_1 = new User({
                              pk: 1,
                              username: "coolmom@umich.edu",
                              first_name: "Amy",
                              last_name: "Poehler",
                              email: "coolmom@umich.edu",
                              is_superuser: true
                          });
        user_2 = new User({
                              pk: 2,
                              username: "amandaplease@umich.edu",
                              first_name: "Amanda",
                              last_name: "Bynes",
                              email: "amandaplease@umich.edu",
                              is_superuser: true
                          });
        user_3 = new User({
                              pk: 3,
                              username: "worldsbestboss@umich.edu",
                              first_name: "Steve",
                              last_name: "Carell",
                              email: "worldsbestbo$$@umich.edu",
                              is_superuser: true
                          });
        user_4 = new User({
                              pk: 3,
                              username: "freshPrince@umich.edu",
                              first_name: "Will",
                              last_name: "Smith",
                              email: "freshPrince@umich.edu",
                              is_superuser: true
                          });

        new_user_1 = new User({
                                  pk: 4,
                                  username: "letitsnow@umich.edu",
                                  first_name: "Brittany",
                                  last_name: "Snow",
                                  email: "letitsnow@umich.edu",
                                  is_superuser: true
                              });
        new_user_2 = new User({
                                  pk: 5,
                                  username: "sevenEleven@umich.edu",
                                  first_name: "Millie",
                                  last_name: "Brown",
                                  email: "sevenEleven@umich.edu",
                                  is_superuser: true
                              });

        original_match_media = window.matchMedia;
        Object.defineProperty(window, "matchMedia", {
            value: jest.fn(() => {
                return {matches: true};
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

    test('course prop is initialized to value passed in.', () => {
        wrapper = mount(StaffRoster, {
            propsData: {
                course: my_course
            }
        });

        staff_roster = wrapper.vm;
        expect(staff_roster.course).toEqual(my_course);
    });

    test('The created function calls the Course method "get_staff"', () => {
        staff = [user_1, user_2, user_3, user_4];

        return patch_async_class_method(Course,
                                        'get_staff',
                                        () => Promise.resolve(staff),
                                        async () => {

            wrapper = mount(StaffRoster, {
                propsData: {
                    course: my_course
                }
            });

            await wrapper.vm.$nextTick();
            staff_roster = wrapper.vm;
            expect(staff_roster.d_course).toEqual(my_course);
            expect(staff_roster.staff).toEqual(staff);
        });
    });

    test('Clicking the "Add to Roster" button with valid input prompts the Course ' +
         'add_staff method to be called',
         async () => {
        staff = [
            make_user(0, `user${0}`),
            make_user(1, `user${1}`),
            make_user(2, `user${2}`)
        ];

        return patch_async_class_method(Course,
                                        'get_staff',
                                        make_fake_get_staff_func(),
                                        async () => {

            wrapper = mount(StaffRoster, {
                propsData: {
                    course: my_course
                }
            });

            const spy = jest.fn();
            return patch_async_class_method(Course,
                                            'add_staff',
                                            spy,
                                            async () => {
                await wrapper.vm.$nextTick();
                staff_roster = wrapper.vm;
                expect(staff_roster.d_course).toEqual(my_course);
                expect(staff_roster.staff).toEqual(staff);

                let permissions = <Permissions> wrapper.find({ref: 'staff_permissions'}).vm;
                permissions.new_permissions_list = "letitsnow@umich.edu sevenEleven@umich.edu";
                await wrapper.vm.$nextTick();

                let add_staff_form = wrapper.find('#add-permissions-form');
                add_staff_form.trigger('submit');
                await wrapper.vm.$nextTick();

                staff.push(make_user(3, `user${3}`));

                expect(staff_roster.staff).toEqual(staff);
                expect(spy.mock.calls.length).toBe(1);
            });
        });
    });

    function make_fake_get_staff_func() {
        let counter = 0;
        let staff: User[] = [];
        for (let i = 0; i < 3; ++i) {
            staff.push(make_user(counter, `user${counter}`));
            counter += 1;
        }

        return () => {
            let to_return = staff.slice(0);
            staff.push(make_user(counter, `user${counter}`));
            counter += 1;
            return Promise.resolve(to_return);
        };
    }

    function make_user(pk: number, username: string): User {
        return new User({
            pk: pk,
            username: username,
            first_name: 'Steve the Llama',
            last_name: 'Spam',
            is_superuser: false,
            email: 'steve@thellama.com'
        });
    }

    test('Deleting a user from the roster causes the Course "remove_staff" method to' +
        ' be called',
         async () => {

        staff = [user_1, user_2, user_3, user_4];

        return patch_async_class_method(Course,
                                        'get_staff',
                                        () => Promise.resolve(staff),
                                        async () => {

            wrapper = mount(StaffRoster, {
                propsData: {
                    course: my_course
                }
            });

            await wrapper.vm.$nextTick();
            staff_roster = wrapper.vm;
            expect(staff_roster.d_course).toEqual(my_course);
            expect(staff_roster.staff).toEqual(staff);

            // clicking on an x calls remove_handgraders
            const spy = jest.fn();
            return patch_async_class_method(Course,
                                            'remove_staff',
                                            spy,
                                            async () => {

                let staff_permissions = wrapper.find(
                    {ref: 'staff_permissions'});
                let delete_permission_buttons = staff_permissions.findAll(
                    '.delete-enrollee'
                );
                delete_permission_buttons.at(1).trigger('click');
                await wrapper.vm.$nextTick();

                expect(spy.mock.calls.length).toBe(1);
            });
        });
    });
});
