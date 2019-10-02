import { config, Wrapper } from '@vue/test-utils';

import {
    Course,
    Group,
    HandgradingResult,
    HandgradingRubric,
    HttpError,
    Project,
    Submission,
    User,
} from 'ag-client-typescript';
import * as sinon from 'sinon';

import ProjectView from '@/components/project_view/project_view.vue';

import * as data_ut from '@/tests/data_utils';
import { managed_mount } from '@/tests/setup';
import { wait_for_load, wait_until } from '@/tests/utils';

beforeAll(() => {
    config.logModifiedComponents = false;
});

beforeEach(() => {
    sinon.stub(User, 'get_num_late_days').returns(Promise.resolve({late_days_remaining: 0}));
    sinon.stub(User, 'get_current_user_roles').returns(
        Promise.resolve(data_ut.make_user_roles()));
    sinon.stub(Submission, 'get_final_graded_submission_from_group').rejects(
        new HttpError(403, ''));
    sinon.stub(HandgradingRubric, 'get_from_project').rejects(new HttpError(403, ''));
    sinon.stub(HandgradingResult, 'get_by_group_pk').rejects(new HttpError(403, ''));
});

afterEach(() => {
    sinon.restore();
});

describe('Changing Tabs', ()  => {
    let wrapper: Wrapper<ProjectView>;
    let project: Project;
    let course: Course;
    let user: User;

    let router_replace: sinon.SinonStub;

    let groups_is_member_of_stub: sinon.SinonStub;

    function get_router_mocks(query = {}) {
        return {
            $route: {
                params: {
                    project_id: project.pk.toString()
                },
                query: query
            },
            $router: {
                replace: router_replace
            }
        };
    }

    beforeEach(async () => {
        course = data_ut.make_course();
        project = data_ut.make_project(course.pk);

        user = data_ut.make_user();
        data_ut.set_global_current_user(user);

        sinon.stub(Project, 'get_by_pk').withArgs(project.pk).resolves(project);
        sinon.stub(Course, 'get_by_pk').withArgs(course.pk).resolves(course);
        groups_is_member_of_stub = sinon.stub(user, 'groups_is_member_of').resolves([
            data_ut.make_group(project.pk, 1, {member_names: [user.username]})
        ]);
        sinon.stub(Submission, 'get_all_from_group_with_results').resolves([]);

        router_replace = sinon.stub();

        wrapper = managed_mount(ProjectView, {mocks: get_router_mocks()});
        await wait_for_load(wrapper);
    });

    afterEach(() => {
        sinon.restore();
    });

    test('Clicking on submit tab', async () => {
        let tabs = wrapper.findAll('.nav-link');
        expect(tabs.length).toEqual(3);
        tabs.at(1).trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_current_tab).toEqual('my_submissions');
        expect(router_replace.calledOnce).toBe(true);

        tabs.at(0).trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_current_tab).toEqual('submit');
        expect(router_replace.calledTwice).toBe(true);
        expect(router_replace.secondCall.calledWith({query: {current_tab: 'submit'}}));
    });

    test('Clicking on my_submissions tab', async () => {
        expect(wrapper.find({name: 'SubmissionList'}).exists()).toBe(false);
        let tabs = wrapper.findAll('.nav-link');
        tabs.at(1).trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_current_tab).toEqual('my_submissions');
        expect(router_replace.calledOnce).toBe(true);
        expect(router_replace.firstCall.calledWith({query: {current_tab: 'my_submissions'}}));

        expect(wrapper.find({name: 'SubmissionList'}).exists()).toBe(true);
        expect(wrapper.find({name: 'SubmissionList'}).isVisible()).toBe(true);

        tabs.at(0).trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.find({name: 'SubmissionList'}).exists()).toBe(true);
        expect(wrapper.find({name: 'SubmissionList'}).isVisible()).toBe(false);
    });

    test('my_submissions tab unavailable if no group', async () => {
        groups_is_member_of_stub.resolves([]);
        wrapper = managed_mount(ProjectView, {
            mocks: get_router_mocks({current_tab: 'my_submissions'})
        });
        expect(await wait_for_load(wrapper)).toBe(true);

        expect(wrapper.vm.d_current_tab).toEqual('submit');
        expect(wrapper.find({name: 'SubmissionList'}).exists()).toBe(false);

        wrapper.findAll('.nav-link').at(1).trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_current_tab).toEqual('submit');
        expect(wrapper.find({name: 'SubmissionList'}).exists()).toBe(false);
    });

    test('Clicking on student_lookup tab', async () => {
        let tabs = wrapper.findAll('.nav-link');
        tabs.at(2).trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_current_tab).toEqual('student_lookup');
        expect(router_replace.calledOnce).toBe(true);
        expect(router_replace.firstCall.calledWith({query: {current_tab: 'student_lookup'}}));
    });

    test('Submit tab, no group for this project', async () => {
        let other_project = data_ut.make_project(course.pk);
        groups_is_member_of_stub.resolves([
            data_ut.make_group(other_project.pk, 1, {member_names: [user.username]})
        ]);
        wrapper = managed_mount(ProjectView, {mocks: get_router_mocks()});
        expect(await wait_for_load(wrapper)).toBe(true);

        expect(wrapper.find({name: 'Submit'}).exists()).toBe(false);
        expect(wrapper.find({name: 'GroupRegistration'}).exists()).toBe(true);
    });

    test('Current user is in new group', async () => {
        groups_is_member_of_stub.resolves([]);
        wrapper = managed_mount(ProjectView, {mocks: get_router_mocks()});
        expect(await wait_for_load(wrapper)).toBe(true);

        expect(wrapper.find({name: 'Submit'}).exists()).toBe(false);
        expect(wrapper.find({name: 'GroupRegistration'}).exists()).toBe(true);

        let new_group = data_ut.make_group(project.pk, 1, {member_names: [user.username]});
        Group.notify_group_created(new_group);

        await wrapper.vm.$nextTick();

        expect(wrapper.vm.group).toEqual(new_group);
        expect(wrapper.find({name: 'Submit'}).exists()).toBe(true);
        expect(wrapper.find({name: 'GroupRegistration'}).exists()).toBe(false);
    });

    test('Current user not in new group', async () => {
        groups_is_member_of_stub.resolves([]);
        wrapper = managed_mount(ProjectView, {mocks: get_router_mocks()});
        expect(await wait_for_load(wrapper)).toBe(true);

        Group.notify_group_created(
            data_ut.make_group(project.pk, 1, {member_names: ['other_user']})
        );

        await wrapper.vm.$nextTick();

        expect(wrapper.vm.group).toBe(null);
        expect(wrapper.find({name: 'Submit'}).exists()).toBe(false);
        expect(wrapper.find({name: 'GroupRegistration'}).exists()).toBe(true);
    });

    test('New group is for different project', async () => {
        groups_is_member_of_stub.resolves([]);
        wrapper = managed_mount(ProjectView, {mocks: get_router_mocks()});
        expect(await wait_for_load(wrapper)).toBe(true);

        let other_project = data_ut.make_project(course.pk);
        Group.notify_group_created(
            data_ut.make_group(other_project.pk, 1, {member_names: [user.username]})
        );

        await wrapper.vm.$nextTick();

        expect(wrapper.vm.group).toBe(null);
        expect(wrapper.find({name: 'Submit'}).exists()).toBe(false);
        expect(wrapper.find({name: 'GroupRegistration'}).exists()).toBe(true);
    });

    test('Requested tab on load', async () => {
        wrapper = managed_mount(ProjectView, {
            mocks: get_router_mocks({current_tab: 'my_submissions'})
        });
        expect(await wait_for_load(wrapper)).toBe(true);

        await wait_until(wrapper, w => w.vm.d_current_tab === 'my_submissions');
        expect(wrapper.vm.d_current_tab).toEqual('my_submissions');
        expect(router_replace.calledOnce).toBe(true);
        expect(router_replace.firstCall.calledWith({query: {current_tab: 'my_submissions'}}));

        expect(wrapper.find({name: 'SubmissionList'}).exists()).toBe(true);
        expect(wrapper.find({name: 'SubmissionList'}).isVisible()).toBe(true);
    });

    test('No handgrading rubric, handgrading tab not shown', async () => {
        fail();
    });

    test('Handgrading rubric exists, handgrading tab shown to staff', async () => {
        fail();
    });

    test('Handgrading rubric exists, handgrading tab shown to handgrader', async () => {
        fail();
    });

    test('Handgrading rubric exists, handgrading hidden from student', async () => {
        fail();
    });

    test('Clicking on handgrading tab', async () => {
        fail();
    });

    test('No handgrading result, handgrading result tab not shown', async () => {
        fail();
    });

    test('No group, handgrading result tab not shown to student', async () => {
        fail();
    });

    test('Handgrading result exists, handgrading result tab shown', async () => {
        fail();
    });

    test('Clicking on handgrading results tab', async () => {
        fail();
    });

    test('Submit and my submissions unavailable to non-student handgrader', async () => {
        fail();
    });
});
