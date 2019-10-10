import { WrapperArray } from '@vue/test-utils';

import * as ag_cli from 'ag-client-typescript';
import * as sinon from 'sinon';

import FilePanel from '@/components/handgrading/file_panel.vue';
import Handgrading from '@/components/handgrading/handgrading.vue';

import * as data_ut from '@/tests/data_utils';
import { managed_mount } from '@/tests/setup';
import { get_validated_input_text, set_validated_input_text, wait_until } from '@/tests/utils';

let result: ag_cli.HandgradingResult;
let submission: ag_cli.Submission;

beforeEach(() => {
    let project = data_ut.make_project(data_ut.make_course().pk);
    let group = data_ut.make_group(project.pk);
    submission = data_ut.make_submission(
        group, {submitted_filenames: ['file1.txt', 'file2.cpp', 'file3.py']});
    result = data_ut.make_handgrading_result(
        data_ut.make_handgrading_rubric(project.pk), group.pk, submission.pk,
        {submitted_filenames: submission.submitted_filenames});

    data_ut.set_global_user_roles(data_ut.make_user_roles({is_staff: true}));
});

describe('Adjust points test', () => {
    test('Adjust points binding', async () => {
        result.points_adjustment = 43;
        let wrapper = managed_mount(Handgrading, {
            propsData: {
                handgrading_result: result,
                readonly_handgrading_results: false,
            }
        });
        expect(get_validated_input_text(wrapper.find({ref: 'adjust_points'}))).toEqual('43');

        set_validated_input_text(wrapper.find({ref: 'adjust_points'}), '-1');
        expect(wrapper.vm.d_handgrading_result.points_adjustment).toEqual(-1);

        wrapper.vm.d_handgrading_result.points_adjustment = -2;
        await wrapper.vm.$nextTick();
        expect(get_validated_input_text(wrapper.find({ref: 'adjust_points'}))).toEqual('-2');
    });

    test('Invalid empty adjust points', async () => {
        let wrapper = managed_mount(Handgrading, {
            propsData: {
                handgrading_result: result,
                readonly_handgrading_results: false,
            }
        });
        expect(get_validated_input_text(wrapper.find({ref: 'adjust_points'}))).toEqual('0');
        expect(wrapper.find('#save-adjust-points').is('[disabled]')).toBe(false);

        set_validated_input_text(wrapper.find({ref: 'adjust_points'}), '  ');
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.d_handgrading_result.points_adjustment).toEqual(0);
        expect(wrapper.find('#save-adjust-points').is('[disabled]')).toBe(true);
    });

    test('Save adjusted points', async () => {
        let wrapper = managed_mount(Handgrading, {
            propsData: {
                handgrading_result: result,
                readonly_handgrading_results: false,
            }
        });
        let save_stub = sinon.stub(wrapper.vm.d_handgrading_result, 'save');
        expect(get_validated_input_text(wrapper.find({ref: 'adjust_points'}))).toEqual('0');
        expect(wrapper.find('#save-adjust-points').is('[disabled]')).toBe(false);

        set_validated_input_text(wrapper.find({ref: 'adjust_points'}), '-1');
        expect(wrapper.find('#save-adjust-points').is('[disabled]')).toBe(false);
        wrapper.find('#save-adjust-points').trigger('click');
        expect(await wait_until(wrapper, w => w.vm.d_saving === false)).toBe(true);

        expect(wrapper.vm.d_handgrading_result.points_adjustment).toEqual(-1);
        expect(save_stub.calledOnce).toBe(true);
    });

    test('Handgraders can adjust points', async () => {
        result.handgrading_rubric.handgraders_can_adjust_points = true;
        let wrapper = managed_mount(Handgrading, {
            propsData: {
                handgrading_result: result,
                readonly_handgrading_results: false,
            }
        });
        await wrapper.vm.$nextTick();
        data_ut.set_global_user_roles(data_ut.make_user_roles({is_handgrader: true}));
        expect(wrapper.find({ref: 'adjust_points'}).exists()).toBe(true);
    });

    test("Handgraders can't adjust points", async () => {
        result.handgrading_rubric.handgraders_can_adjust_points = false;
        let wrapper = managed_mount(Handgrading, {
            propsData: {
                handgrading_result: result,
                readonly_handgrading_results: false,
            }
        });
        await wrapper.vm.$nextTick();
        data_ut.set_global_user_roles(data_ut.make_user_roles({is_handgrader: true}));
        expect(wrapper.find({ref: 'adjust_points'}).exists()).toBe(false);
    });
});

test('One file panel per submitted file', async () => {
    let wrapper = managed_mount(Handgrading, {
        propsData: {
            handgrading_result: result,
            readonly_handgrading_results: false,
        }
    });
    let panels = <WrapperArray<FilePanel>> wrapper.findAll({name: 'FilePanel'});
    expect(panels.length).toEqual(3);
    expect(panels.at(0).vm.filename).toEqual('file1.txt');
    expect(panels.at(1).vm.filename).toEqual('file2.cpp');
    expect(panels.at(2).vm.filename).toEqual('file3.py');

    expect(panels.at(0).vm.handgrading_result).toBe(wrapper.vm.d_handgrading_result);
    expect(panels.at(1).vm.handgrading_result).toBe(wrapper.vm.d_handgrading_result);
    expect(panels.at(2).vm.handgrading_result).toBe(wrapper.vm.d_handgrading_result);
});

describe('Score tests', () => {
    test('Score displayed', async () => {
        fail();
    });

    test('Negative total points shows as zero', async () => {
        fail();
    });
});

describe('Checkbox tests', () => {
    test('Expand/collapse checkbox list', async () => {
        fail();
    });

    test('Checkboxes displayed', async () => {
        fail();
    });

    test('Toggle checkbox, grading not marked as done, score updated locally', async () => {
        fail();
    });

    test('Toggle checkbox, grading marked as done, result refreshes', async () => {
        fail();
    });
});

describe('Comment tests', () => {
    // Check valu passed to file panels
    test('Expand/collapse comment list', async () => {
        fail();
    });

    test('Staff can leave custom comment', async () => {
        fail();
    });

    test('Handgraders allowed to leave custom comments', async () => {
        fail();
    });

    test('Handgraders not allowed to leave custom comments', async () => {
        fail();
    });

    test('Custom general and inline comments, applied annotations listed together', async () => {
        fail();
    });

    test('Delete custom general comment', async () => {
        fail();
    });

    test('Delete custom inline comment', async () => {
        fail();
    });

    test('Delete applied annotation', async () => {
        fail();
    });
});

describe('Annotations reference list', () => {
    test('Expand/collapse annotation list', async () => {
        fail();
    });

    test('Annotations listed', async () => {
        fail();
    });
});

describe('Footer tests', () => {
    test('Toggle finished grading', async () => {
        fail();
    });

    test('Prev disabled', async () => {
        fail();
    });

    test('Next disabled', async () => {
        fail();
    });

    test('Next labeled as "Skip" when unfinished', async () => {
        fail();
    });

    test('Next labeled as "Next" when finished', async () => {
        fail();
    });
});

describe('Observer updates', () => {
    test('Applied annotation created', async () => {
        fail();
    });

    test('Applied annotation deleted', async () => {
        fail();
    });

    test('Comment created', async () => {
        fail();
    });

    test('Comment deleted', async () => {
        fail();
    });
});
test('', async () => {
    fail();
});

test('Read-only mode', async () => {
    // Use staff user, make handgraders can do things true,
    // check that:
    // - adjust points and leave comment are gone
    // - checkboxes are not toggleable
    // - deletion x's are gone
    // - annotation list is not shown
    // Make sure still there:
    // - score
    // - checkboxes
    // - comments
    fail();
});
