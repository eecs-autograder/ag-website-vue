import { Location } from 'vue-router';

import { config, mount, Wrapper } from '@vue/test-utils';

import { Course, Project, Semester, UltimateSubmissionPolicy, User, UserRoles } from 'ag-client-typescript';
import * as sinon from 'sinon';

import CourseView from '@/components/course_view.vue';

import * as data_ut from '@/tests/data_utils';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('CourseView tests', () => {
    let wrapper: Wrapper<CourseView>;
    let course: Course;
    let project1: Project;
    let project2: Project;

    let $route: Location;

    let user_roles_stub: sinon.SinonStub;
    let get_projects_stub: sinon.SinonStub;

    beforeEach(() => {
        course = data_ut.make_course();

        $route = {
            path: '/web/course/:course_id',
            params: {
                course_id: course.pk.toString()
            },
            query: { }
        };

        project1 = data_ut.make_project(course.pk);
        project2 = data_ut.make_project(course.pk);

        sinon.stub(Course, 'get_by_pk').withArgs(course.pk).returns(
            Promise.resolve(course)
        );

        user_roles_stub = sinon.stub(User, 'get_current_user_roles').withArgs(course.pk).returns(
            Promise.resolve(data_ut.make_user_roles())
        );
        get_projects_stub = sinon.stub(Project, 'get_all_from_course').withArgs(course.pk).returns(
            Promise.resolve([project1, project2])
        );
    });

    afterEach(() => {
        sinon.restore();

        if (wrapper.exists()) {
            wrapper.destroy();
        }
    });

    test('User is NOT an admin for the course whose projects they are viewing', async () => {
        wrapper = mount(CourseView, {
            stubs: ['router-link', 'router-view'],
            mocks: {
                $route
            }
        });
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        expect(wrapper.findAll('.project').length).toEqual(2);

        expect(wrapper.vm.d_loading).toBe(false);
        expect(wrapper.findAll('.cog').length).toEqual(0);
    });

    test('User IS an admin for the course whose projects they are viewing', async () => {
        user_roles_stub.returns(
            Promise.resolve(data_ut.make_user_roles({is_admin: true, is_staff: true}))
        );

        wrapper = mount(CourseView, {
            stubs: ['router-link', 'router-view'],
            mocks: {
                $route
            }
        });
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        expect(wrapper.findAll('.project').length).toEqual(2);

        expect(wrapper.vm.d_loading).toBe(false);
        expect(wrapper.findAll('.cog').length).toEqual(2);
    });

    test('No projects have been published', async () => {
        get_projects_stub.returns(Promise.resolve([]));

        wrapper = mount(CourseView, {
            stubs: ['router-link', 'router-view'],
            mocks: {
                $route
            }
        });
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        expect(wrapper.findAll('.project').length).toEqual(0);

        expect(wrapper.vm.d_loading).toBe(false);
        expect(wrapper.find('#no-projects-message').exists()).toBe(true);
    });
});
