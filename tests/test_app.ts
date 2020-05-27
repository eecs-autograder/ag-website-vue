import VueRouter from 'vue-router';

import { createLocalVue, Wrapper } from "@vue/test-utils";

import { Course, HttpClient, HttpError, User } from 'ag-client-typescript';
import * as sinon from 'sinon';

import App, { GlobalData } from '@/app.vue';
import APIErrors from '@/components/api_errors.vue';
import * as cookie from '@/cookie';
import { GlobalErrorsSubject } from '@/error_handling';

import { make_course, make_project, make_user, make_user_roles } from '@/tests/data_utils';
import { compress_whitespace, wait_for_load } from '@/tests/utils';

import { managed_mount } from './setup';

function make_wrapper() {
    const local_vue = createLocalVue();
    local_vue.use(VueRouter);

    return managed_mount(App, {
        localVue: local_vue,
        router: new VueRouter ({
            routes: [],
            mode: 'history'
        })
    });
}

describe('app.vue tests', () => {
    let wrapper: Wrapper<App>;
    let user: User;

    beforeEach(async () => {
        user = make_user();
        sinon.stub(User, 'get_current').resolves(user);
        sinon.stub(cookie, 'get_cookie').returns('tokey');

        wrapper = make_wrapper();
        expect(await wait_for_load(wrapper)).toBe(true);
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

        expect(compress_whitespace(wrapper.find('#breadcrumbs').text())).toEqual(
            `Autograder - ${course.name} ${course.semester} ${course.year}`
        );

        wrapper.vm.globals.current_course!.year = null;
        await wrapper.vm.$nextTick();

        expect(compress_whitespace(wrapper.find('#breadcrumbs').text())).toEqual(
            `Autograder - ${course.name} ${course.semester}`
        );

        wrapper.vm.globals.current_course!.semester = null;
        await wrapper.vm.$nextTick();

        expect(compress_whitespace(wrapper.find('#breadcrumbs').text())).toEqual(
            `Autograder - ${course.name}`);
    });

    test('Navigation breadcrumbs for non-admin', async () => {
        let course = make_course();
        let project = make_project(course.pk);

        sinon.stub(User, 'get_current_user_roles').withArgs(course.pk).resolves(make_user_roles());

        await wrapper.vm.globals.set_current_project(project, course);
        await wrapper.vm.$nextTick();

        expect(wrapper.findAll('.fa-cog').length).toEqual(0);
        expect(compress_whitespace(wrapper.find('#breadcrumbs').text())).toEqual(
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

    test('Global errors displayed', async () => {
        expect(wrapper.findComponent({ref: 'global_errors'}).element).not.toBeVisible();
        GlobalErrorsSubject.get_instance().report_error(new HttpError(401, 'log in plz'));
        await wrapper.vm.$nextTick();

        expect(wrapper.findComponent({ref: 'global_errors'}).element).toBeVisible();
        expect(
            (<APIErrors> wrapper.findComponent({ref: 'global_errors'}).vm).d_api_errors.length
        ).toBe(1);
    });
});

test('API error handled in login', async () => {
    sinon.stub(console, 'error');
    sinon.stub(User, 'get_current').rejects(new Error('Network Error'));

    let wrapper = make_wrapper();
    expect(await wait_for_load(wrapper)).toBe(true);
    await wrapper.find('[data-testid=login_button]').trigger('click');

    expect(
        (<APIErrors> wrapper.findComponent({ref: 'global_errors'}).vm).d_api_errors.length
    ).toBe(1);
});

describe('Login tests', () => {
    test('Token cookie available, login on create', async () => {
        let fake_token_val = 'tokey';
        sinon.stub(cookie, 'get_cookie').returns(fake_token_val);
        let authenticate_stub = sinon.stub(HttpClient.get_instance(), 'authenticate');
        let user = make_user();
        sinon.stub(User, 'get_current').resolves(user);

        let wrapper = make_wrapper();
        expect(await wait_for_load(wrapper)).toBe(true);

        expect(wrapper.vm.globals.current_user).toEqual(user);
        expect(authenticate_stub.calledOnceWith(fake_token_val)).toBe(true);
    });

    test('Token cookie unavailable, auth redirect called on button click', async () => {
        let location_assign_stub = sinon.stub(window.location, 'assign');
        sinon.stub(cookie, 'get_cookie').returns(null);
        let authenticate_stub = sinon.stub(HttpClient.get_instance(), 'authenticate');
        let fake_redirect_url = '/oauth2/something/or/other/';
        sinon.stub(User, 'get_current').rejects(
            new HttpError(
                401, '', '/url/',
                {'www-authenticate': `Redirect_to: ${fake_redirect_url}`}
            )
        );

        let wrapper = make_wrapper();
        expect(await wait_for_load(wrapper)).toBe(true);

        expect(location_assign_stub.callCount).toEqual(0);
        expect(wrapper.vm.globals.current_user).toBeNull();

        wrapper.find('[data-testid=login_button]').trigger('click');
        await wrapper.vm.$nextTick();

        expect(location_assign_stub.calledOnceWith(fake_redirect_url)).toBe(true);
        expect(authenticate_stub.callCount).toEqual(0);
        expect(wrapper.vm.globals.current_user).toBeNull();
    });

    test('Auth token bad, token cookie deleted', async () => {
        let fake_token_val = 'tokey';
        let delete_cookie_stub = sinon.stub(cookie, 'delete_all_cookies');
        sinon.stub(cookie, 'get_cookie').returns(fake_token_val);
        let authenticate_stub = sinon.stub(HttpClient.get_instance(), 'authenticate');
        sinon.stub(User, 'get_current').rejects(new HttpError(401, 'unauthorized'));

        let wrapper = make_wrapper();
        expect(await wait_for_load(wrapper)).toBe(true);

        expect(authenticate_stub.calledOnceWith(fake_token_val)).toBe(true);
        expect(delete_cookie_stub.calledOnce).toBe(true);
        expect(wrapper.vm.globals.current_user).toBeNull();
    });
});

test('Logout', async () => {
    sinon.stub(User, 'get_current').resolves(make_user());
    sinon.stub(cookie, 'get_cookie').returns('tokey');
    let delete_cookie_stub = sinon.stub(cookie, 'delete_all_cookies');

    let wrapper = make_wrapper();
    expect(await wait_for_load(wrapper)).toBe(true);
    expect(wrapper.find('#welcome').exists()).toBe(false);

    await wrapper.find('[data-testid=logout_button]').trigger('click');
    expect(delete_cookie_stub.calledOnce).toBe(true);

    expect(wrapper.vm.globals.current_user).toBeNull();
    expect(wrapper.find('#welcome').exists()).toBe(true);
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
