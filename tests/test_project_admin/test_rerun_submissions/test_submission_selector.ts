import { Wrapper } from '@vue/test-utils';

import * as ag_cli from 'ag-client-typescript';
import * as sinon from 'sinon';

import SubmissionSelector from '@/components/project_admin/rerun_submissions/submission_selector.vue';

import * as data_ut from '@/tests/data_utils';
import { managed_mount } from '@/tests/setup';
import { checkbox_is_checked, emitted, wait_for_load } from '@/tests/utils';

let group: ag_cli.Group;
let submissions: ag_cli.Submission[];

let wrapper: Wrapper<SubmissionSelector>;

beforeEach(async () => {
    let project = data_ut.make_project(data_ut.make_course().pk);
    group = data_ut.make_group(project.pk, 2);

    submissions = [
        data_ut.make_submission(group),
        data_ut.make_submission(group),
        data_ut.make_submission(group),
    ];
    sinon.stub(ag_cli.Submission, 'get_all_from_group').withArgs(group.pk).resolves(submissions);

    wrapper = managed_mount(SubmissionSelector, {
        propsData: {
            group: group
        }
    });
    expect(await wait_for_load(wrapper)).toBe(true);
});

test('Member names and submissions displayed', async () => {
    expect(wrapper.findAll('.member-name').at(0).text()).toEqual(group.member_names[0] + ',');
    expect(wrapper.findAll('.member-name').at(1).text()).toEqual(group.member_names[1]);

    expect(wrapper.findAll({ref: 'submission_checkbox'}).length).toEqual(submissions.length);
});

test('Toggle submission', async () => {
    expect(wrapper.vm.d_selected_submissions.size()).toEqual(0);
    expect(wrapper.emitted('submissions_selected')).toBeUndefined();
    expect(wrapper.emitted('submissions_unselected')).toBeUndefined();

    wrapper.findAll('.checkbox').at(1).setChecked(true);
    expect(wrapper.vm.d_selected_submissions.data).toEqual([submissions[1]]);
    expect(emitted(wrapper, 'submissions_selected')).toEqual([[[submissions[1]]]]);
    expect(wrapper.emitted('submissions_unselected')).toBeUndefined();

    wrapper.findAll('.checkbox').at(2).setChecked(true);
    expect(wrapper.vm.d_selected_submissions.size()).toEqual(2);
    expect(wrapper.vm.d_selected_submissions.has(submissions[1])).toBe(true);
    expect(wrapper.vm.d_selected_submissions.has(submissions[2])).toBe(true);
    expect(emitted(wrapper, 'submissions_selected')[1]).toEqual([[submissions[2]]]);
    expect(wrapper.emitted('submissions_unselected')).toBeUndefined();

    wrapper.findAll('.checkbox').at(1).setChecked(false);
    expect(wrapper.vm.d_selected_submissions.data).toEqual([submissions[2]]);
    expect(emitted(wrapper, 'submissions_selected').length).toEqual(2);
    expect(emitted(wrapper, 'submissions_unselected')).toEqual([[[submissions[1]]]]);
});

test('Select all and clear all', async () => {
    expect(wrapper.vm.d_selected_submissions.size()).toEqual(0);
    expect(wrapper.emitted('submissions_selected')).toBeUndefined();
    expect(wrapper.emitted('submissions_unselected')).toBeUndefined();

    wrapper.find({ref: 'select_all_button'}).trigger('click');
    await wrapper.vm.$nextTick();
    for (let checkbox of wrapper.findAll('.checkbox').wrappers) {
        expect(checkbox_is_checked(checkbox)).toBe(true);
    }
    expect(wrapper.vm.d_selected_submissions.size()).toEqual(submissions.length);
    expect(emitted(wrapper, 'submissions_selected')).toEqual([[submissions]]);
    expect(wrapper.emitted('submissions_unselected')).toBeUndefined();

    wrapper.find({ref: 'clear_all_button'}).trigger('click');
    await wrapper.vm.$nextTick();
    for (let checkbox of wrapper.findAll('.checkbox').wrappers) {
        expect(checkbox_is_checked(checkbox)).toBe(false);
    }
    expect(wrapper.vm.d_selected_submissions.size()).toEqual(0);
    expect(emitted(wrapper, 'submissions_unselected')).toEqual([[submissions]]);
    expect(emitted(wrapper, 'submissions_selected')).toEqual([[submissions]]);
});

test('Remove group button', () => {
    expect(wrapper.emitted('remove_group')).toBeUndefined();
    wrapper.find({ref: 'remove_group_button'}).trigger('click');
    expect(emitted(wrapper, 'remove_group')).toEqual([[group]]);
});
