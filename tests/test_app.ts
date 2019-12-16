import VueRouter from 'vue-router';

import { createLocalVue, mount, Wrapper } from "@vue/test-utils";

import { Course, User, UserRoles } from 'ag-client-typescript';
import * as sinon from 'sinon';

import App, { GlobalData } from '@/app.vue';

import { make_course, make_project, make_user, make_user_roles } from '@/tests/data_utils';
import { compress_whitespace } from '@/tests/utils';

afterEach(() => {
    sinon.restore();
});

describe('app.vue tests', () => {
    let wrapper: Wrapper<App>;
    let user: User;

    beforeEach(async () => {
        user = make_user();
        sinon.stub(User, 'get_current').resolves(user);

        const local_vue = createLocalVue();
        local_vue.use(VueRouter);

        wrapper = mount(App, {
            localVue: local_vue,
            router: new VueRouter ({
                routes: [],
                mode: 'history'
            })
        });
        await wrapper.vm.$nextTick();
    });

    test('Initialization', () => {
        expect(wrapper.vm.d_loading).toBe(false);
        expect(wrapper.vm.globals.current_user).toEqual(user);
        expect(wrapper.vm.globals.current_course).toBeNull();
        expect(wrapper.vm.globals.current_project).toBeNull();

        expect(wrapper.vm.globals.user_roles).toEqual(make_user_roles());
    });

    test('Course name breadcrumb display', async () => {
        let course = make_course();
        sinon.stub(User, 'get_current_user_roles').withArgs(course.pk).resolves(make_user_roles());

        await wrapper.vm.globals.set_current_course(course);
        await wrapper.vm.$nextTick();

        expect(compress_whitespace(wrapper.text())).toEqual(
            `Autograder - ${course.name} ${course.semester} ${course.year}`
        );

        wrapper.vm.globals.current_course!.year = null;
        await wrapper.vm.$nextTick();

        expect(compress_whitespace(wrapper.text())).toEqual(
            `Autograder - ${course.name} ${course.semester}`
        );

        wrapper.vm.globals.current_course!.semester = null;
        await wrapper.vm.$nextTick();

        expect(compress_whitespace(wrapper.text())).toEqual(`Autograder - ${course.name}`);
    });

    test('Navigation breadcrumbs for non-admin', async () => {
        let course = make_course();
        let project = make_project(course.pk);

        sinon.stub(User, 'get_current_user_roles').withArgs(course.pk).resolves(make_user_roles());

        await wrapper.vm.globals.set_current_project(project, course);
        await wrapper.vm.$nextTick();

        expect(wrapper.findAll('.fa-cog').length).toEqual(0);
        expect(compress_whitespace(wrapper.text())).toEqual(
            `Autograder - ${course.name} ${course.semester} ${course.year} - ${project.name}`
        );
    });

    test('Navigation breadcrumbs for admin', async () => {
        let course = make_course();
        let project = make_project(course.pk);

        sinon.stub(User, 'get_current_user_roles').withArgs(course.pk).resolves(
            make_user_roles({
                is_admin: true
            }));

        await wrapper.vm.globals.set_current_project(project, course);
        await wrapper.vm.$nextTick();

        expect(wrapper.findAll('.fa-cog').length).toEqual(2);
    });
});

describe('GlobalData tests', () => {
    let globals: GlobalData;

    beforeEach(() => {
        globals = new GlobalData();
    });

    test('Set current course', async () => {
        let course = make_course();
        let user_roles = make_user_roles({
            is_staff: true,
            is_handgrader: true,
        });

        sinon.stub(User, 'get_current_user_roles').withArgs(course.pk).resolves(user_roles);
        await globals.set_current_course(course);

        expect(globals.user_roles).toEqual(user_roles);
    });

    test('Set current course to null', async () => {
        let course = make_course();
        let project = make_project(course.pk);

        sinon.stub(User, 'get_current_user_roles').withArgs(course.pk).resolves(make_user_roles());

        await globals.set_current_project(project, course);
        await globals.set_current_course(null);
        expect(globals.current_course).toBeNull();
        expect(globals.current_project).toBeNull();
    });

    test('Set current project', async () => {
        let course = make_course();
        sinon.stub(Course, 'get_by_pk').withArgs(course.pk).resolves(course);
        let project = make_project(course.pk);

        sinon.stub(User, 'get_current_user_roles').withArgs(course.pk).resolves(make_user_roles());

        await globals.set_current_project(project);
        expect(globals.current_course).toEqual(course);
        expect(globals.current_project).toEqual(project);
    });
});
