import * as ag_cli from 'ag-client-typescript';
import * as sinon from 'sinon';

import GroupMembers from '@/components/project_view/group_members.vue';

import * as data_ut from '@/tests/data_utils';
import { managed_mount } from '@/tests/setup';
import { wait_fixed } from '@/tests/utils';

let course: ag_cli.Course;
let project: ag_cli.Project;
let group: ag_cli.Group;

beforeEach(() => {
    course = data_ut.make_course();
    project = data_ut.make_project(course.pk);
    group = data_ut.make_group(project.pk, 3);

    data_ut.set_global_current_course(course);
});

test('Member names shown', async () => {
    const wrapper = managed_mount(GroupMembers, {
        propsData: {
            group: group,
        }
    });

    expect(wrapper.findAll('.header-cell').length).toEqual(1);

    let members = wrapper.findAllComponents({ref: 'member_name'});
    expect(members.at(0).text()).toEqual(group.member_names[0]);
    expect(members.at(1).text()).toEqual(group.member_names[1]);
    expect(members.at(2).text()).toEqual(group.member_names[2]);

});

test('Late days shown and updated on group change', async () => {
    let get_late_days_stub = sinon.stub(ag_cli.User, 'get_num_late_days');
    get_late_days_stub.withArgs(
        course.pk, group.member_names[0]
    ).resolves({late_days_remaining: 1});
    get_late_days_stub.withArgs(
        course.pk, group.member_names[1]
    ).resolves({late_days_remaining: 0});
    get_late_days_stub.withArgs(
        course.pk, group.member_names[2]
    ).resolves({late_days_remaining: 3});

    course.num_late_days = 1;
    const wrapper = managed_mount(GroupMembers, {
        propsData: {
            group: group,
            include_late_day_totals: true
        }
    });

    await wait_fixed(wrapper, 4);
    expect(wrapper.findAll('.header-cell').length).toEqual(2);

    let totals = wrapper.findAllComponents({ref: 'late_days'});
    expect(totals.length).toEqual(3);
    expect(totals.at(0).text()).toEqual('1');
    expect(totals.at(1).text()).toEqual('0');
    expect(totals.at(2).text()).toEqual('3');

    let new_group = data_ut.make_group(project.pk);
    get_late_days_stub.withArgs(
        course.pk, new_group.member_names[0]
    ).resolves({late_days_remaining: 10});

    await wrapper.setProps({group: new_group});
    await wrapper.vm.$nextTick();
    totals = wrapper.findAllComponents({ref: 'late_days'});
    expect(totals.at(0).text()).toEqual('10');
    expect(totals.length).toEqual(1);
});

test('Course has no late days, late days not shown', async () => {
    course.num_late_days = 0;
    const wrapper = managed_mount(GroupMembers, {
        propsData: {
            group: group,
            include_late_day_totals: true
        }
    });

    await wait_fixed(wrapper, 4);
    expect(wrapper.findAll('.header-cell').length).toEqual(1);
    expect(wrapper.findComponent({ref: 'late_days'}).exists()).toBe(false);
});

test('Course has late days but include_late_days_false, late days not shown', async () => {
    course.num_late_days = 1;
    const wrapper = managed_mount(GroupMembers, {
        propsData: {
            group: group,
            include_late_day_totals: false
        }
    });

    await wait_fixed(wrapper, 4);
    expect(wrapper.findAll('.header-cell').length).toEqual(1);
    expect(wrapper.findComponent({ref: 'late_days'}).exists()).toBe(false);
});
