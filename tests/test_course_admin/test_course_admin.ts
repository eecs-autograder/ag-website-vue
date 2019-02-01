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

    test.skip('hold', async () => {
    });
});
