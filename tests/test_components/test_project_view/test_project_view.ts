import { Wrapper } from '@vue/test-utils';

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
import { managed_mount, managed_shallow_mount } from '@/tests/setup';
import { wait_for_load, wait_until } from '@/tests/utils';


let wrapper: Wrapper<ProjectView>;
let project: Project;
let course: Course;
let user: User;
let group: Group;

let router_replace: sinon.SinonStub;
let groups_is_member_of_stub: sinon.SinonStub;
let user_roles_stub: sinon.SinonStub;
let handgrading_rubric_stub: sinon.SinonStub;
let handgrading_result_stub: sinon.SinonStub;

beforeEach(async () => {
    sinon.stub(User, 'get_num_late_days').returns(Promise.resolve({late_days_remaining: 0}));
    user_roles_stub = sinon.stub(
        User, 'get_current_user_roles').resolves(data_ut.make_user_roles());
    sinon.stub(Submission, 'get_final_graded_submission_from_group').rejects(
        new HttpError(403, ''));
    handgrading_rubric_stub = sinon.stub(
        HandgradingRubric, 'get_from_project').rejects(new HttpError(403, ''));
    handgrading_result_stub = sinon.stub(
        HandgradingResult, 'get_by_group_pk').rejects(new HttpError(403, ''));

    course = data_ut.make_course();
    project = data_ut.make_project(course.pk);

    user = data_ut.make_user();
    data_ut.set_global_current_user(user);

    sinon.stub(Project, 'get_by_pk').withArgs(project.pk).resolves(project);
    sinon.stub(Course, 'get_by_pk').withArgs(course.pk).resolves(course);

    group = data_ut.make_group(project.pk, 1, {member_names: [user.username]});
    groups_is_member_of_stub = sinon.stub(user, 'groups_is_member_of').resolves([
        group
    ]);
    sinon.stub(Submission, 'get_all_from_group_with_results').resolves([]);

    router_replace = sinon.stub().resolves();
});

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

afterEach(() => {
    sinon.restore();
});

describe('Submit tab tests', () => {
    test('Submit tab, no group for this project', async () => {
        let other_project = data_ut.make_project(course.pk);
        groups_is_member_of_stub.resolves([
            data_ut.make_group(other_project.pk, 1, {member_names: [user.username]})
        ]);
        wrapper = managed_mount(ProjectView, {mocks: get_router_mocks()});
        expect(await wait_for_load(wrapper)).toBe(true);

        expect(wrapper.findComponent({name: 'Submit'}).exists()).toBe(false);
        expect(wrapper.findComponent({name: 'GroupRegistration'}).exists()).toBe(true);
    });

    test('Current user is in new group', async () => {
        groups_is_member_of_stub.resolves([]);
        wrapper = managed_mount(ProjectView, {mocks: get_router_mocks()});
        expect(await wait_for_load(wrapper)).toBe(true);

        expect(wrapper.findComponent({name: 'Submit'}).exists()).toBe(false);
        expect(wrapper.findComponent({name: 'GroupRegistration'}).exists()).toBe(true);

        let new_group = data_ut.make_group(project.pk, 1, {member_names: [user.username]});
        Group.notify_group_created(new_group);

        await wrapper.vm.$nextTick();

        expect(wrapper.vm.group).toEqual(new_group);
        expect(wrapper.findComponent({name: 'Submit'}).exists()).toBe(true);
        expect(wrapper.findComponent({name: 'GroupRegistration'}).exists()).toBe(false);
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
        expect(wrapper.findComponent({name: 'Submit'}).exists()).toBe(false);
        expect(wrapper.findComponent({name: 'GroupRegistration'}).exists()).toBe(true);
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
        expect(wrapper.findComponent({name: 'Submit'}).exists()).toBe(false);
        expect(wrapper.findComponent({name: 'GroupRegistration'}).exists()).toBe(true);
    });

    test('Submit tab hidden from handgraders', async () => {
        user_roles_stub.resolves(data_ut.make_user_roles({is_handgrader: true}));
        wrapper = managed_mount(ProjectView, {mocks: get_router_mocks()});
        expect(await wait_for_load(wrapper)).toBe(true);

        expect(wrapper.findComponent({name: 'Submit'}).exists()).toBe(false);
        expect(wrapper.findComponent({ref: 'submit_tab'}).exists()).toBe(false);
    });

    test('Guests can see submit tab', async () => {
        user_roles_stub.resolves(data_ut.make_user_roles());
        wrapper = managed_mount(ProjectView, {mocks: get_router_mocks()});
        expect(await wait_for_load(wrapper)).toBe(true);

        expect(wrapper.findComponent({name: 'Submit'}).exists()).toBe(true);
        expect(wrapper.findComponent({ref: 'submit_tab'}).exists()).toBe(true);
    });

    test('My Submissions tab selected after submission', async () => {
        let refresh_stub = sinon.stub(group, 'refresh');
        wrapper = managed_mount(ProjectView, {mocks: get_router_mocks()});
        expect(await wait_for_load(wrapper)).toBe(true);

        expect(refresh_stub.callCount).toEqual(0);
        wrapper.findComponent({name: 'Submit'}).vm.$emit('submitted');
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.d_current_tab).toEqual('my_submissions');
        expect(refresh_stub.callCount).toEqual(1);
    });
});

describe('My submissions tab tests', () => {
    test('my_submissions tab unavailable if no group', async () => {
        groups_is_member_of_stub.resolves([]);
        wrapper = managed_mount(ProjectView, {
            mocks: get_router_mocks({current_tab: 'my_submissions'})
        });
        expect(await wait_for_load(wrapper)).toBe(true);

        expect(wrapper.vm.d_current_tab).toEqual('submit');
        expect(wrapper.findComponent({name: 'SubmissionList'}).exists()).toBe(false);

        wrapper.findAll('.nav-link').at(1).trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_current_tab).toEqual('submit');
        expect(wrapper.findComponent({name: 'SubmissionList'}).exists()).toBe(false);
    });

    test('My submissions tab hidden from handgraders', async () => {
        user_roles_stub.resolves(data_ut.make_user_roles({is_handgrader: true}));
        wrapper = managed_mount(
            ProjectView, {mocks: get_router_mocks({current_tab: 'my_submissions'})});
        expect(await wait_for_load(wrapper)).toBe(true);

        expect(wrapper.findComponent({name: 'SubmissionList'}).exists()).toBe(false);
        expect(wrapper.findComponent({ref: 'my_submissions_tab'}).exists()).toBe(false);
    });

    test('Guests can see my submissions tab', async () => {
        user_roles_stub.resolves(data_ut.make_user_roles());
        wrapper = managed_mount(
            ProjectView, {mocks: get_router_mocks({current_tab: 'my_submissions'})});
        expect(await wait_for_load(wrapper)).toBe(true);

        expect(wrapper.findComponent({name: 'SubmissionList'}).exists()).toBe(true);
        expect(wrapper.findComponent({ref: 'my_submissions_tab'}).exists()).toBe(true);
    });
});

describe('Student lookup tab tests', () => {
    test('Student lookup tab hidden from students', async () => {
        user_roles_stub.resolves(data_ut.make_user_roles({is_student: true}));
        wrapper = managed_shallow_mount(
            ProjectView, {mocks: get_router_mocks({current_tab: 'student_lookup'})});
        expect(await wait_for_load(wrapper)).toBe(true);

        expect(wrapper.findComponent({ref: 'student_lookup_tab'}).exists()).toBe(false);
    });

    test('Student lookup tab hidden from handgraders', async () => {
        user_roles_stub.resolves(data_ut.make_user_roles({is_handgrader: true}));
        wrapper = managed_shallow_mount(
            ProjectView, {mocks: get_router_mocks({current_tab: 'student_lookup'})});
        expect(await wait_for_load(wrapper)).toBe(true);

        expect(wrapper.findComponent({ref: 'student_lookup_tab'}).exists()).toBe(false);
    });

    test('Staff can see student lookup tab', async () => {
        user_roles_stub.resolves(data_ut.make_user_roles({is_staff: true}));
        wrapper = managed_shallow_mount(
            ProjectView, {mocks: get_router_mocks({current_tab: 'student_lookup'})});
        expect(await wait_for_load(wrapper)).toBe(true);

        expect(wrapper.findComponent({ref: 'student_lookup_tab'}).exists()).toBe(true);
    });
});


describe('Handgrading tab tests', () => {
    test('No handgrading rubric, handgrading tab not shown', async () => {
        wrapper = managed_shallow_mount(
            ProjectView, {mocks: get_router_mocks({current_tab: 'handgrading'})});
        expect(await wait_for_load(wrapper)).toBe(true);

        expect(wrapper.findComponent({name: 'HandgradingContainer'}).exists()).toBe(false);
        expect(wrapper.findComponent({ref: 'handgrading_tab'}).exists()).toBe(false);
    });

    test('Handgrading rubric exists, handgrading tab shown to staff', async () => {
        project.has_handgrading_rubric = true;
        user_roles_stub.resolves(data_ut.make_user_roles({is_staff: true}));
        handgrading_rubric_stub.resolves(data_ut.make_handgrading_rubric(project.pk));
        wrapper = managed_shallow_mount(
            ProjectView, {mocks: get_router_mocks({current_tab: 'handgrading'})});
        expect(await wait_for_load(wrapper)).toBe(true);

        expect(wrapper.findComponent({name: 'HandgradingContainer'}).exists()).toBe(true);
        expect(wrapper.findComponent({ref: 'handgrading_tab'}).exists()).toBe(true);
    });

    test('Handgrading rubric exists, handgrading tab shown to handgrader', async () => {
        project.has_handgrading_rubric = true;
        user_roles_stub.resolves(data_ut.make_user_roles({is_handgrader: true}));
        handgrading_rubric_stub.resolves(data_ut.make_handgrading_rubric(project.pk));
        wrapper = managed_shallow_mount(
            ProjectView, {mocks: get_router_mocks({current_tab: 'handgrading'})});
        expect(await wait_for_load(wrapper)).toBe(true);

        expect(wrapper.findComponent({name: 'HandgradingContainer'}).exists()).toBe(true);
        expect(wrapper.findComponent({ref: 'handgrading_tab'}).exists()).toBe(true);
    });

    test('Handgrading rubric exists, handgrading hidden from student', async () => {
        project.has_handgrading_rubric = true;
        user_roles_stub.resolves(data_ut.make_user_roles({is_student: true}));
        handgrading_rubric_stub.resolves(data_ut.make_handgrading_rubric(project.pk));
        wrapper = managed_shallow_mount(
            ProjectView, {mocks: get_router_mocks({current_tab: 'handgrading'})});
        expect(await wait_for_load(wrapper)).toBe(true);

        expect(wrapper.findComponent({name: 'HandgradingContainer'}).exists()).toBe(false);
        expect(wrapper.findComponent({ref: 'handgrading_tab'}).exists()).toBe(false);
    });

    test('Handgrading tab selected initially for handgraders, no query param', async () => {
        project.has_handgrading_rubric = true;
        user_roles_stub.resolves(data_ut.make_user_roles({is_handgrader: true}));
        handgrading_rubric_stub.resolves(data_ut.make_handgrading_rubric(project.pk));
        wrapper = managed_shallow_mount(ProjectView, {mocks: get_router_mocks()});
        expect(await wait_for_load(wrapper)).toBe(true);

        expect(wrapper.findComponent({name: 'HandgradingContainer'}).exists()).toBe(true);
        expect(wrapper.findComponent({ref: 'handgrading_tab'}).exists()).toBe(true);
        expect(wrapper.vm.d_current_tab).toEqual('handgrading');
    });
});

describe('Handgrading result tab tests', () => {
    test('No handgrading result, handgrading result tab not shown', async () => {
        // User roles don't matter here
        user_roles_stub.resolves(data_ut.make_user_roles({is_admin: true}));
        wrapper = managed_mount(
            ProjectView, {mocks: get_router_mocks({current_tab: 'handgrading_result'})});
        expect(await wait_for_load(wrapper)).toBe(true);

        expect(wrapper.findComponent({name: 'Handgrading'}).exists()).toBe(false);
        expect(wrapper.findComponent({ref: 'handgrading_result_tab'}).exists()).toBe(false);
    });

    test('No group, handgrading result not requested', async () => {
        groups_is_member_of_stub.resolves([]);
        handgrading_result_stub.rejects(new Error("This shouldn't happen"));
        wrapper = managed_mount(
            ProjectView, {mocks: get_router_mocks({current_tab: 'handgrading_result'})});
        expect(await wait_for_load(wrapper)).toBe(true);

        expect(wrapper.findComponent({name: 'Handgrading'}).exists()).toBe(false);
        expect(wrapper.findComponent({ref: 'handgrading_result_tab'}).exists()).toBe(false);
    });

    test('Handgrading result exists, handgrading result tab shown', async () => {
        let rubric = data_ut.make_handgrading_rubric(project.pk);
        handgrading_result_stub.withArgs(group.pk).resolves(
            data_ut.make_handgrading_result(rubric, group.pk, 2));
        wrapper = managed_mount(
            ProjectView, {mocks: get_router_mocks({current_tab: 'handgrading_result'})});
        expect(await wait_for_load(wrapper)).toBe(true);

        expect(wrapper.findComponent({name: 'Handgrading'}).exists()).toBe(true);
        expect(wrapper.findComponent({ref: 'handgrading_result_tab'}).exists()).toBe(true);
    });
});

describe('Tab selection and lazy loading tests', ()  => {
    beforeEach(async () => {
        project.has_handgrading_rubric = true;
        user_roles_stub.resolves(data_ut.make_user_roles({is_staff: true}));
        let rubric = data_ut.make_handgrading_rubric(project.pk);
        handgrading_rubric_stub.resolves(rubric);
        handgrading_result_stub.withArgs(group.pk).resolves(
        data_ut.make_handgrading_result(rubric, group.pk, 2));

        wrapper = managed_shallow_mount(ProjectView, {mocks: get_router_mocks()});
        expect(await wait_for_load(wrapper)).toBe(true);
        expect(wrapper.findComponent({name: 'Submit'}).exists()).toBe(true);
        expect(wrapper.findComponent({name: 'SubmissionList'}).exists()).toBe(false);
        expect(wrapper.findComponent({name: 'StudentLookup'}).exists()).toBe(false);
        expect(wrapper.findComponent({name: 'HandgradingContainer'}).exists()).toBe(false);
        expect(wrapper.findComponent({name: 'Handgrading'}).exists()).toBe(false);
    });

    test('Requested tab on load', async () => {
        wrapper = managed_mount(ProjectView, {
            mocks: get_router_mocks({current_tab: 'my_submissions'})
        });

        expect(
            await wait_until(wrapper, w => w.findComponent({name: 'SubmissionList'}).exists())
        ).toBe(true);
        expect(wrapper.findComponent({name: 'SubmissionList'}).isVisible()).toBe(true);
        expect(wrapper.vm.d_current_tab).toEqual('my_submissions');
        expect(router_replace.calledOnce).toBe(true);
        expect(router_replace.firstCall.calledWith({query: {current_tab: 'my_submissions'}}));
    });

    test('Submit tab loaded initially, select another tab and then submit again', async () => {
        expect(
            await wait_until(wrapper, w => w.findComponent({name: 'Submit'}).exists())
        ).toBe(true);

        let tabs = wrapper.findAll('.nav-link');
        tabs.at(1).trigger('click');

        expect(
            await wait_until(wrapper, w => w.findComponent({name: 'SubmissionList'}).exists())
        ).toBe(true);
        expect(wrapper.findComponent({name: 'SubmissionList'}).isVisible()).toBe(true);
        expect(wrapper.findComponent({name: 'Submit'}).isVisible()).toBe(false);
        expect(wrapper.vm.d_current_tab).toEqual('my_submissions');
        expect(router_replace.calledOnce).toBe(true);

        await tabs.at(0).trigger('click');
        expect(wrapper.vm.d_current_tab).toEqual('submit');
        expect(router_replace.calledTwice).toBe(true);
        expect(router_replace.secondCall.calledWith({query: {current_tab: 'submit'}}));
        expect(wrapper.findComponent({name: 'SubmissionList'}).isVisible()).toBe(false);
    });

    test('Clicking on my_submissions tab', async () => {
        expect(wrapper.findComponent({name: 'SubmissionList'}).exists()).toBe(false);
        let tabs = wrapper.findAll('.nav-link');
        tabs.at(1).trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_current_tab).toEqual('my_submissions');
        expect(router_replace.calledOnce).toBe(true);
        expect(router_replace.firstCall.calledWith({query: {current_tab: 'my_submissions'}}));

        expect(wrapper.findComponent({name: 'SubmissionList'}).exists()).toBe(true);
        expect(wrapper.findComponent({name: 'SubmissionList'}).isVisible()).toBe(true);

        tabs.at(0).trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.findComponent({name: 'SubmissionList'}).exists()).toBe(true);
        expect(wrapper.findComponent({name: 'SubmissionList'}).isVisible()).toBe(false);
    });

    test('Clicking on student_lookup tab', async () => {
        let tabs = wrapper.findAll('.nav-link');
        tabs.at(2).trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_current_tab).toEqual('student_lookup');
        expect(router_replace.calledOnce).toBe(true);
        expect(router_replace.firstCall.calledWith({query: {current_tab: 'student_lookup'}}));

        expect(wrapper.findComponent({name: 'StudentLookup'}).exists()).toBe(true);
        expect(wrapper.findComponent({name: 'StudentLookup'}).isVisible()).toBe(true);
    });

    test('Clicking on handgrading tab', async () => {
        expect(wrapper.findComponent({name: 'HandgradingContainer'}).exists()).toBe(false);
        let tabs = wrapper.findAll('.nav-link');
        tabs.at(3).trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_current_tab).toEqual('handgrading');
        expect(router_replace.calledOnce).toBe(true);
        expect(router_replace.firstCall.calledWith({query: {current_tab: 'handgrading'}}));

        expect(wrapper.findComponent({name: 'HandgradingContainer'}).exists()).toBe(true);
        expect(wrapper.findComponent({name: 'HandgradingContainer'}).isVisible()).toBe(true);

        tabs.at(0).trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.findComponent({name: 'HandgradingContainer'}).exists()).toBe(true);
        expect(wrapper.findComponent({name: 'HandgradingContainer'}).isVisible()).toBe(false);
    });

    test('Clicking on handgrading results tab', async () => {
        expect(wrapper.findComponent({name: 'Handgrading'}).exists()).toBe(false);
        let tabs = wrapper.findAll('.nav-link');
        tabs.at(4).trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_current_tab).toEqual('handgrading_result');
        expect(router_replace.calledOnce).toBe(true);
        expect(router_replace.firstCall.calledWith({query: {current_tab: 'handgrading_result'}}));

        expect(wrapper.findComponent({name: 'Handgrading'}).exists()).toBe(true);
        expect(wrapper.findComponent({name: 'Handgrading'}).isVisible()).toBe(true);

        tabs.at(0).trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.findComponent({name: 'Handgrading'}).exists()).toBe(true);
        expect(wrapper.findComponent({name: 'Handgrading'}).isVisible()).toBe(false);
    });
});
