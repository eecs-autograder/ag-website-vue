import { Vue } from 'vue-property-decorator';

import { Wrapper, WrapperArray } from '@vue/test-utils';

import * as ag_cli from 'ag-client-typescript';
import * as sinon from 'sinon';

import FilePanel from '@/components/project_view/handgrading/file_panel.vue';
import Handgrading from '@/components/project_view/handgrading/handgrading.vue';
import { assert_not_null } from '@/utils';

import * as data_ut from '@/tests/data_utils';
import { managed_mount } from '@/tests/setup';
import {
    checkbox_is_checked,
    compress_whitespace,
    emitted,
    get_validated_input_text,
    set_validated_input_text,
    wait_until,
} from '@/tests/utils';

let project: ag_cli.Project;
let rubric: ag_cli.HandgradingRubric;
let result: ag_cli.HandgradingResult;
let submission: ag_cli.Submission;

let has_correct_submission_stub: sinon.SinonStub;

beforeEach(() => {
    project = data_ut.make_project(data_ut.make_course().pk);
    data_ut.set_global_current_project(project);
    let group = data_ut.make_group(project.pk);
    submission = data_ut.make_submission(
        group, {submitted_filenames: ['file1.txt', 'file2.cpp', 'file3.py']});
    rubric = data_ut.make_handgrading_rubric(project.pk);
    result = data_ut.make_handgrading_result(
        rubric, group.pk, submission.pk,
        {submitted_filenames: submission.submitted_filenames});

    data_ut.set_global_user_roles(data_ut.make_user_roles({is_staff: true}));

    has_correct_submission_stub = sinon.stub(
        ag_cli.HandgradingResult.prototype, 'has_correct_submission').resolves(true);
});

test('Result input is deep copied', async () => {
    let wrapper = managed_mount(Handgrading, {
        propsData: {
            handgrading_result: result,
            readonly_handgrading_results: false,
        }
    });
    expect(wrapper.vm.d_handgrading_result).toEqual(result);
    expect(wrapper.vm.d_handgrading_result).not.toBe(result);
});

test('Result changed, new result deep copied', async () => {
    let wrapper = managed_mount(Handgrading, {
        propsData: {
            handgrading_result: result,
            readonly_handgrading_results: false,
        }
    });

    let new_result = new ag_cli.HandgradingResult(result);
    new_result.finished_grading = !new_result.finished_grading;
    wrapper.setProps({handgrading_result: new_result});
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.d_handgrading_result).toEqual(new_result);
    expect(wrapper.vm.d_handgrading_result).not.toBe(new_result);
});

test('Reset handgrading result', async () => {
    let new_result = data_ut.make_handgrading_result(rubric, result.group, submission.pk);
    sinon.stub(ag_cli.HandgradingResult, 'reset').withArgs(result.group).resolves(new_result);

    let wrapper = managed_mount(Handgrading, {
        propsData: {
            handgrading_result: result,
            readonly_handgrading_results: true,
        }
    });
    expect(wrapper.find('.danger-zone-container').exists()).toBe(false);
    expect(wrapper.find('[data-testid=show_reset_handgrading_modal_button]').exists()).toBe(false);

    wrapper.setProps({readonly_handgrading_results: false});
    await wrapper.vm.$nextTick();

    wrapper.find('[data-testid=show_reset_handgrading_modal_button]').trigger('click');
    await wrapper.vm.$nextTick();

    wrapper.find('[data-testid=reset_handgrading_button]').trigger('click');
    await wrapper.vm.$nextTick();
    expect(await wait_until(wrapper, w => !w.vm.d_resetting)).toBe(true);

    expect(wrapper.findComponent({ref: 'reset_handgrading_modal'}).exists()).toBe(false);
    expect(wrapper.vm.d_handgrading_result!.pk).toEqual(new_result.pk);
});

test('Has correct submission, no warning', async () => {
    let wrapper = managed_mount(Handgrading, {
        propsData: {
            handgrading_result: result,
            readonly_handgrading_results: true,
        }
    });
    expect(await wait_until(wrapper, w => w.vm.d_has_correct_submission !== null));
    expect(wrapper.find('.has-wrong-submission').exists()).toBe(false);
});

test('Has incorrect submission, edit mode warning', async () => {
    has_correct_submission_stub.resolves(false);
    let wrapper = managed_mount(Handgrading, {
        propsData: {
            handgrading_result: result,
            readonly_handgrading_results: false,
        }
    });
    expect(await wait_until(wrapper, w => w.vm.d_has_correct_submission !== null));
    expect(wrapper.find('.has-wrong-submission').text()).toContain(
        'reset this handgrading result');

    project.ultimate_submission_policy = ag_cli.UltimateSubmissionPolicy.best;
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.has-wrong-submission').text()).not.toContain(
        'most recent');
    expect(wrapper.find('.has-wrong-submission').text()).toContain(
        'best');

    project.ultimate_submission_policy = ag_cli.UltimateSubmissionPolicy.most_recent;
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.has-wrong-submission').text()).toContain(
        'most recent');
    expect(wrapper.find('.has-wrong-submission').text()).not.toContain(
        'best');
});

test('Has incorrect submission, readonly mode warning', async () => {
    has_correct_submission_stub.resolves(false);
    let wrapper = managed_mount(Handgrading, {
        propsData: {
            handgrading_result: result,
            readonly_handgrading_results: true,
        }
    });
    expect(await wait_until(wrapper, w => w.vm.d_has_correct_submission !== null));
    expect(wrapper.find('.has-wrong-submission').text()).toContain(
        'contact your course staff');
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
        expect(
            get_validated_input_text(wrapper.findComponent({ref: 'adjust_points'}))
        ).toEqual('43');

        set_validated_input_text(wrapper.findComponent({ref: 'adjust_points'}), '-1');
        expect(wrapper.vm.d_handgrading_result!.points_adjustment).toEqual(-1);

        wrapper.vm.d_handgrading_result!.points_adjustment = -2;
        await wrapper.vm.$nextTick();
        expect(
            get_validated_input_text(wrapper.findComponent({ref: 'adjust_points'}))
        ).toEqual('-2');
    });

    test('Invalid empty adjust points', async () => {
        let wrapper = managed_mount(Handgrading, {
            propsData: {
                handgrading_result: result,
                readonly_handgrading_results: false,
            }
        });
        expect(
            get_validated_input_text(wrapper.findComponent({ref: 'adjust_points'}))
        ).toEqual('0');
        expect(wrapper.find('#save-adjust-points').element).not.toBeDisabled();

        set_validated_input_text(wrapper.findComponent({ref: 'adjust_points'}), '  ');
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.d_handgrading_result!.points_adjustment).toEqual(0);
        expect(wrapper.find('#save-adjust-points').element).toBeDisabled();
    });

    test('Save adjusted points', async () => {
        let wrapper = managed_mount(Handgrading, {
            propsData: {
                handgrading_result: result,
                readonly_handgrading_results: false,
            }
        });
        let save_stub = sinon.stub(wrapper.vm.d_handgrading_result!, 'save_points_adjustment');
        expect(
            get_validated_input_text(wrapper.findComponent({ref: 'adjust_points'}))
        ).toEqual('0');
        expect(wrapper.find('#save-adjust-points').element).not.toBeDisabled();

        set_validated_input_text(wrapper.findComponent({ref: 'adjust_points'}), '-1');
        expect(wrapper.find('#save-adjust-points').element).not.toBeDisabled();
        wrapper.find('#save-adjust-points').trigger('click');
        expect(await wait_until(wrapper, w => !w.vm.saving)).toBe(true);

        expect(wrapper.vm.d_handgrading_result!.points_adjustment).toEqual(-1);
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
        expect(wrapper.findComponent({ref: 'adjust_points'}).exists()).toBe(true);
    });

    test("Handgraders can't adjust points", async () => {
        result.handgrading_rubric.handgraders_can_adjust_points = false;
        let wrapper = managed_mount(Handgrading, {
            propsData: {
                handgrading_result: result,
                readonly_handgrading_results: false,
            }
        });
        data_ut.set_global_user_roles(data_ut.make_user_roles({is_handgrader: true}));
        await wrapper.vm.$nextTick();
        expect(wrapper.findComponent({ref: 'adjust_points'}).exists()).toBe(false);
    });
});

test('One file panel per submitted file', async () => {
    let wrapper = managed_mount(Handgrading, {
        propsData: {
            handgrading_result: result,
            readonly_handgrading_results: false,
        }
    });
    let panels = <WrapperArray<FilePanel>> wrapper.findAllComponents({name: 'FilePanel'});
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
        result.total_points = 48;
        result.total_points_possible = 70;
        let wrapper = managed_mount(Handgrading, {
            propsData: {
                handgrading_result: result,
                readonly_handgrading_results: false,
            }
        });
        expect(wrapper.find('.grading-sidebar-header .score').text()).toEqual('48/70');
    });

    test('Negative total points shows as zero', async () => {
        result.total_points = -10;
        result.total_points_possible = 70;
        let wrapper = managed_mount(Handgrading, {
            propsData: {
                handgrading_result: result,
                readonly_handgrading_results: false,
            }
        });
        expect(wrapper.find('.grading-sidebar-header .score').text()).toEqual('0/70');
    });
});

describe('Checkbox tests', () => {
    let wrapper: Wrapper<Handgrading>;

    let checkbox_with_long_description: ag_cli.Criterion;
    let checkbox_empty_long_description: ag_cli.Criterion;

    beforeEach(() => {
        checkbox_with_long_description = data_ut.make_criterion(
            result.handgrading_rubric.pk,
            {
                short_description: "I am an criterion",
                long_description: "I am such long description of very length",
                points: 4
            }
        );
        checkbox_empty_long_description = data_ut.make_criterion(
            result.handgrading_rubric.pk,
            {
                short_description: "I am another criterion",
                long_description: "",
                points: -2
            }
        );

        result.handgrading_rubric.criteria = [
            checkbox_with_long_description, checkbox_empty_long_description
        ];
        data_ut.make_criterion_result(result, checkbox_with_long_description, true);
        data_ut.make_criterion_result(result, checkbox_empty_long_description, false);
        result.total_points = 4;
        result.total_points_possible = 4;

        wrapper = managed_mount(Handgrading, {
            propsData: {
                handgrading_result: result,
                readonly_handgrading_results: false,
            }
        });
    });

    test('Expand/collapse checkbox list', async () => {
        expect(wrapper.findAll('.criterion').length).toEqual(2);
        expect(wrapper.findAll('.criterion').at(0).isVisible()).toBe(true);

        wrapper.findAll('.collapsible-section-header').at(0).trigger('click');
        await wrapper.vm.$nextTick();
        expect(wrapper.findAll('.criterion').length).toEqual(2);
        expect(wrapper.findAll('.criterion').at(0).isVisible()).toBe(false);

        wrapper.findAll('.collapsible-section-header').at(0).trigger('click');
        await wrapper.vm.$nextTick();
        expect(wrapper.findAll('.criterion').length).toEqual(2);
        expect(wrapper.findAll('.criterion').at(0).isVisible()).toBe(true);
    });

    test('Checkboxes displayed', async () => {
        let criteria = wrapper.findAll('.criterion');

        expect(
            criteria.at(0).find('.short-description').text()
        ).toEqual(checkbox_with_long_description.short_description);
        expect(
            criteria.at(0).find('.long-description').text()
        ).toEqual(checkbox_with_long_description.long_description);
        expect(
            criteria.at(0).find('.points').text()
        ).toEqual(checkbox_with_long_description.points.toString());
        expect(criteria.at(0).find('.criterion-checkbox .fa-check').exists()).toBe(true);

        expect(
            criteria.at(1).find('.short-description').text()
        ).toEqual(checkbox_empty_long_description.short_description);
        expect(criteria.at(1).find('.long-description').exists()).toBe(false);
        expect(
            criteria.at(1).find('.points').text()
        ).toEqual(checkbox_empty_long_description.points.toString());
        expect(criteria.at(1).find('.criterion-checkbox .fa-check').exists()).toBe(false);
    });

    describe('Toggle checkbox tests', () => {
        let criteria: WrapperArray<Vue>;
        let save_stub: sinon.SinonStub;

        beforeEach(async () => {
            expect(wrapper.find('.grading-sidebar-header .score').text()).toEqual('4/4');
            criteria = wrapper.findAll('.criterion');
            assert_not_null(wrapper.vm.d_handgrading_result);
            let criterion_result = wrapper.vm.d_handgrading_result.criterion_results[0];
            save_stub = sinon.stub(
                criterion_result, 'save'
            ).callsFake(() => {
                ag_cli.CriterionResult.notify_criterion_result_changed(criterion_result);
                return Promise.resolve();
            });
        });

        test('Toggle checkbox, grading not marked as done, score updated locally', async () => {
            criteria.at(0).trigger('click');
            expect(await wait_until(wrapper, w => !w.vm.saving)).toBe(true);

            expect(wrapper.vm.d_handgrading_result!.criterion_results[0].selected).toBe(false);
            expect(wrapper.find('.grading-sidebar-header .score').text()).toEqual('0/4');
            expect(save_stub.calledOnce).toBe(true);

            criteria.at(0).trigger('click');
            expect(await wait_until(wrapper, w => !w.vm.saving)).toBe(true);

            expect(wrapper.vm.d_handgrading_result!.criterion_results[0].selected).toBe(true);
            expect(wrapper.find('.grading-sidebar-header .score').text()).toEqual('4/4');
            expect(save_stub.calledTwice).toBe(true);
        });

        test('Toggle checkbox, grading marked as done, result refreshes', async () => {
            wrapper.vm.d_handgrading_result!.finished_grading = true;
            let refresh_result_stub = sinon.stub(
                wrapper.vm.d_handgrading_result!, 'refresh'
            ).onFirstCall().callsFake(() => {
                wrapper.vm.d_handgrading_result!.total_points = 3;
                return Promise.resolve();
            }).onSecondCall().callsFake(() => {
                wrapper.vm.d_handgrading_result!.total_points = 2;
                return Promise.resolve();
            });

            criteria.at(0).trigger('click');
            expect(await wait_until(wrapper, w => !w.vm.saving)).toBe(true);

            expect(wrapper.vm.d_handgrading_result!.criterion_results[0].selected).toBe(false);
            expect(wrapper.find('.grading-sidebar-header .score').text()).toEqual('3/4');
            expect(save_stub.calledOnce).toBe(true);

            criteria.at(0).trigger('click');
            expect(await wait_until(wrapper, w => !w.vm.saving)).toBe(true);

            expect(wrapper.vm.d_handgrading_result!.criterion_results[0].selected).toBe(true);
            expect(wrapper.find('.grading-sidebar-header .score').text()).toEqual('2/4');
            expect(save_stub.calledTwice).toBe(true);

            expect(refresh_result_stub.callCount).toEqual(2);
        });
    });
});

describe('Comment tests', () => {
    let wrapper: Wrapper<Handgrading>;

    let annotation_with_long_description: ag_cli.Annotation;
    let annotation_empty_long_description: ag_cli.Annotation;
    let annotation_unaligned_max_deduction: ag_cli.Annotation;

    // The number at the end of these names describes the ordering
    // of these elements in the displayed comment/applied annotation
    // list in the grading sidebar.
    let comment_with_location_3: ag_cli.Comment;
    let comment_without_location_0: ag_cli.Comment;
    let applied_empty_long_description_annotation_2: ag_cli.AppliedAnnotation;
    let applied_long_description_annotation_1: ag_cli.AppliedAnnotation;

    beforeEach(() => {
        annotation_with_long_description = data_ut.make_annotation(
            result.handgrading_rubric.pk,
            {
                short_description: "I am annotation",
                long_description: "I am such long annotation description of length",
                deduction: -2
            }
        );

        annotation_empty_long_description = data_ut.make_annotation(
            result.handgrading_rubric.pk,
            {
                short_description: "I am other annotation",
                deduction: -1,
                max_deduction: -3,
            }
        );

        annotation_unaligned_max_deduction = data_ut.make_annotation(
            result.handgrading_rubric.pk,
            {
                short_description: "I have unaligned max deduction",
                deduction: -3,
                // Not a multiple of -3
                max_deduction: -5
            }
        );

        result.handgrading_rubric.annotations = [
            annotation_with_long_description, annotation_empty_long_description
        ];
        comment_with_location_3 = data_ut.make_comment(
            result, {filename: 'file3.py', first_line: 19, last_line: 19}, 'What a comment');
        comment_without_location_0 = data_ut.make_comment(result, null, 'A general comment');

        applied_empty_long_description_annotation_2 = data_ut.make_applied_annotation(
            result, annotation_empty_long_description,
            {filename: 'file3.py', first_line: 5, last_line: 7}
        );
        applied_long_description_annotation_1 = data_ut.make_applied_annotation(
            result, annotation_with_long_description,
            {filename: 'file2.cpp', first_line: 10, last_line: 10}
        );
        result.total_points_possible = 10;
        result.total_points = 7;

        data_ut.set_global_user_roles(data_ut.make_user_roles({is_staff: true}));
        wrapper = managed_mount(Handgrading, {
            propsData: {
                handgrading_result: result,
                readonly_handgrading_results: false,
            }
        });
    });

    test('Expand/collapse comment list', async () => {
        expect(wrapper.findAll('.comment').length).toEqual(4);
        expect(wrapper.findAll('.comment').at(0).isVisible()).toBe(true);

        wrapper.findAll('.collapsible-section-header').at(1).trigger('click');
        await wrapper.vm.$nextTick();
        expect(wrapper.findAll('.comment').length).toEqual(4);
        expect(wrapper.findAll('.comment').at(0).isVisible()).toBe(false);

        wrapper.findAll('.collapsible-section-header').at(1).trigger('click');
        await wrapper.vm.$nextTick();
        expect(wrapper.findAll('.comment').length).toEqual(4);
        expect(wrapper.findAll('.comment').at(0).isVisible()).toBe(true);
    });

    test('Staff can leave custom comment', async () => {
        expect(wrapper.find('#new-comment').exists()).toBe(true);
        let new_comment_text = "noresatnersatoineratoienrastoier";
        wrapper.find('#new-comment .input').setValue(new_comment_text);

        let new_comment = data_ut.make_comment(result, null, new_comment_text);
        sinon.stub(ag_cli.Comment, 'create').withArgs(
            result.pk, {text: new_comment_text}
        ).resolves(new_comment);
        wrapper.find('#new-comment .blue-button').trigger('click');
        expect(await wait_until(wrapper, w => !w.vm.saving)).toBe(true);

        expect(wrapper.vm.d_handgrading_result!.comments[2]).toEqual(new_comment);
    });

    test('Handgraders allowed to leave custom comments', async () => {
        wrapper.vm.d_handgrading_result!.handgrading_rubric.handgraders_can_leave_comments = true;
        data_ut.set_global_user_roles(data_ut.make_user_roles({is_handgrader: true}));
        expect(await wait_until(wrapper, w => !w.vm.saving)).toBe(true);
        await wrapper.vm.$nextTick();
        expect(wrapper.find('#new-comment').exists()).toBe(true);

        expect(wrapper.findAll('.comment').at(0).find('.delete').exists()).toBe(true);
        expect(wrapper.findAll('.comment').at(3).find('.delete').exists()).toBe(true);
        // Can always delete applied annotations
        expect(wrapper.findAll('.comment').at(1).find('.delete').exists()).toBe(true);
        expect(wrapper.findAll('.comment').at(2).find('.delete').exists()).toBe(true);
    });

    test('Handgraders not allowed to leave custom comments', async () => {
        wrapper.vm.d_handgrading_result!.handgrading_rubric.handgraders_can_leave_comments = false;
        data_ut.set_global_user_roles(data_ut.make_user_roles({is_handgrader: true}));
        await wrapper.vm.$nextTick();
        expect(wrapper.find('#new-comment').exists()).toBe(false);

        expect(wrapper.findAll('.comment').at(0).find('.delete').exists()).toBe(false);
        expect(wrapper.findAll('.comment').at(3).find('.delete').exists()).toBe(false);
        // Can always delete applied annotations
        expect(wrapper.findAll('.comment').at(1).find('.delete').exists()).toBe(true);
        expect(wrapper.findAll('.comment').at(2).find('.delete').exists()).toBe(true);
    });

    test('Custom general and inline comments, applied annotations listed together', async () => {
        let comments = wrapper.findAll('.comment');

        expect(compress_whitespace(comments.at(0).find('.short-description').text())).toEqual(
            comment_without_location_0.text);
        expect(comments.at(0).find('.long-description').exists()).toBe(false);
        expect(comments.at(0).find('.deduction').exists()).toBe(false);
        expect(comments.at(0).find('.location').exists()).toBe(false);

        let annotation = applied_long_description_annotation_1.annotation;
        expect(compress_whitespace(comments.at(1).find('.short-description').text())).toEqual(
            `${annotation.short_description} (${annotation.deduction})`);
        expect(comments.at(1).find('.deduction').text()).toEqual(`(${annotation.deduction})`);
        expect(comments.at(1).find('.long-description').text()).toEqual(
            annotation.long_description);
        let location = applied_long_description_annotation_1.location;
        expect(comments.at(1).find('.location').text()).toEqual(
            `${location.filename}:${location.first_line + 1}`);

        annotation = applied_empty_long_description_annotation_2.annotation;
        expect(compress_whitespace(comments.at(2).find('.short-description').text())).toEqual(
            annotation.short_description
            + ` (${annotation.deduction}/${annotation.max_deduction} max)`
        );
        expect(comments.at(2).find('.deduction').text()).toEqual(
            `(${annotation.deduction}/${annotation.max_deduction} max)`
        );
        expect(comments.at(2).find('.long-description').exists()).toBe(false);
        location = applied_empty_long_description_annotation_2.location;
        expect(comments.at(2).find('.location').text()).toEqual(
            `${location.filename}:${location.first_line + 1} - ${location.last_line + 1}`);

        expect(compress_whitespace(comments.at(3).find('.short-description').text())).toEqual(
            comment_with_location_3.text);
        expect(comments.at(3).find('.deduction').exists()).toBe(false);
        expect(comments.at(3).find('.long-description').exists()).toBe(false);
        location = comment_with_location_3.location!;
        expect(comments.at(3).find('.location').text()).toEqual(
            `${location.filename}:${location.first_line + 1}`);
    });

    test('Delete custom general comment', async () => {
        expect(wrapper.vm.d_handgrading_result!.comments.length).toEqual(2);
        let to_delete = wrapper.vm.d_handgrading_result!.comments[1];
        expect(to_delete).toEqual(comment_without_location_0);

        let delete_stub = sinon.stub(
            to_delete, 'delete'
        ).callsFake(() => {
            ag_cli.Comment.notify_comment_deleted(to_delete);
            return Promise.resolve();
        });
        wrapper.findAll('.comment').at(0).find('.delete').trigger('click');
        expect(await wait_until(wrapper, w => !w.vm.saving)).toBe(true);

        expect(wrapper.vm.d_handgrading_result!.comments).toEqual([comment_with_location_3]);
        expect(delete_stub.calledOnce).toBe(true);
    });

    test('Delete custom inline comment', async () => {
        expect(wrapper.vm.d_handgrading_result!.comments.length).toEqual(2);
        let to_delete = wrapper.vm.d_handgrading_result!.comments[0];
        expect(to_delete).toEqual(comment_with_location_3);

        let delete_stub = sinon.stub(
            to_delete, 'delete'
        ).callsFake(() => {
            ag_cli.Comment.notify_comment_deleted(to_delete);
            return Promise.resolve();
        });
        wrapper.findAll('.comment').at(3).find('.delete').trigger('click');
        expect(await wait_until(wrapper, w => !w.vm.saving)).toBe(true);

        expect(wrapper.vm.d_handgrading_result!.comments).toEqual([comment_without_location_0]);
        expect(delete_stub.calledOnce).toBe(true);
    });

    test('Delete applied annotation', async () => {
        expect(wrapper.vm.d_handgrading_result!.applied_annotations.length).toEqual(2);
        let to_delete = wrapper.vm.d_handgrading_result!.applied_annotations[0];
        expect(to_delete).toEqual(applied_empty_long_description_annotation_2);

        let delete_stub = sinon.stub(
            to_delete, 'delete'
        ).callsFake(() => {
            ag_cli.AppliedAnnotation.notify_applied_annotation_deleted(to_delete);
            return Promise.resolve();
        });
        wrapper.findAll('.comment').at(2).find('.delete').trigger('click');
        expect(await wait_until(wrapper, w => !w.vm.saving)).toBe(true);

        expect(wrapper.vm.d_handgrading_result!.applied_annotations).toEqual(
            [applied_long_description_annotation_1]);
        expect(delete_stub.calledOnce).toBe(true);
    });

    test('Add applied annotations beyond max deduction', async () => {
        for (let i = 1; i <= 3; ++i) {
            let applied_annotation = data_ut.make_applied_annotation(
                result,
                annotation_empty_long_description,
                {filename: 'file1.txt', first_line: i, last_line: i}
            );
            ag_cli.AppliedAnnotation.notify_applied_annotation_created(applied_annotation);
        }
        expect(await wait_until(wrapper, w => !w.vm.saving)).toBe(true);
        await wrapper.vm.$nextTick();
        expect(wrapper.find('.grading-sidebar-header .score').text()).toEqual('5/10');
    });

    test('Delete all applied annotations after exceeding max deduction', async () => {
        for (let i = 1; i <= 4; ++i) {
            let applied_annotation = data_ut.make_applied_annotation(
                result,
                annotation_empty_long_description,
                {filename: 'file1.txt', first_line: i, last_line: i}
            );
            ag_cli.AppliedAnnotation.notify_applied_annotation_created(applied_annotation);
        }
        expect(await wait_until(wrapper, w => !w.vm.saving)).toBe(true);
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.d_handgrading_result!.applied_annotations.length).toEqual(6);
        expect(wrapper.find('.grading-sidebar-header .score').text()).toEqual('5/10');

        const delete_stubs =
            wrapper.vm.d_handgrading_result!.applied_annotations.map(annotation => {
                return sinon.stub(
                    annotation, 'delete'
                ).callsFake(() => {
                    ag_cli.AppliedAnnotation.notify_applied_annotation_deleted(annotation);
                    return Promise.resolve();
                });
            });
        for (let i = 0; i < 6; ++i) {
            wrapper.findAll('.comment').at(1).find('.delete').trigger('click');
            expect(await wait_until(wrapper, w => !w.vm.saving)).toBe(true);
        }
        expect(wrapper.vm.d_handgrading_result!.applied_annotations.length).toEqual(0);
        expect(wrapper.find('.grading-sidebar-header .score').text()).toEqual('10/10');

        for (const stub of delete_stubs) {
            expect(stub.calledOnce).toBe(true);
        }
    });

    test('Add applied annotation across unaligned max deduction', async () => {
        const add_annotation = (i: number) => {
            let applied_annotation = data_ut.make_applied_annotation(
                result,
                annotation_unaligned_max_deduction,
                {filename: 'file3.py', first_line: i, last_line: i}
            );
            ag_cli.AppliedAnnotation.notify_applied_annotation_created(applied_annotation);
        };

        add_annotation(1);
        expect(await wait_until(wrapper, w => !w.vm.saving)).toBe(true);
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.d_handgrading_result!.applied_annotations.length).toEqual(3);
        expect(wrapper.find('.grading-sidebar-header .score').text()).toEqual('4/10');

        add_annotation(2);
        expect(await wait_until(wrapper, w => !w.vm.saving)).toBe(true);
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.d_handgrading_result!.applied_annotations.length).toEqual(4);
        expect(wrapper.find('.grading-sidebar-header .score').text()).toEqual('2/10');
    });

    test('Delete applied annotation across unaligned max deduction', async () => {
        const add_annotation = (i: number) => {
            let applied_annotation = data_ut.make_applied_annotation(
                result,
                annotation_unaligned_max_deduction,
                {filename: 'file3.py', first_line: i, last_line: i}
            );
            ag_cli.AppliedAnnotation.notify_applied_annotation_created(applied_annotation);
        };

        add_annotation(1);
        add_annotation(2);
        expect(await wait_until(wrapper, w => !w.vm.saving)).toBe(true);
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.d_handgrading_result!.applied_annotations.length).toEqual(4);
        expect(wrapper.find('.grading-sidebar-header .score').text()).toEqual('2/10');
        
        let to_delete = wrapper.vm.d_handgrading_result!.applied_annotations[3];
        let delete_stub = sinon.stub(
            to_delete, 'delete'
        ).callsFake(() => {
            ag_cli.AppliedAnnotation.notify_applied_annotation_deleted(to_delete);
            return Promise.resolve();
        });
        wrapper.findAll('.comment').at(3).find('.delete').trigger('click');
        expect(await wait_until(wrapper, w => !w.vm.saving)).toBe(true);

        expect(delete_stub.calledOnce).toBe(true);
        expect(wrapper.find('.grading-sidebar-header .score').text()).toEqual('4/10');
    });
});

describe('Annotations reference list', () => {
    let annotations: ag_cli.Annotation[];

    let wrapper: Wrapper<Handgrading>;

    beforeEach(() => {
        annotations = [
            data_ut.make_annotation(
                result.handgrading_rubric.pk,
                {
                    deduction: -1,
                    short_description: 'I am annotation',
                    long_description: 'I am long descriptions',
                }
            ),
            data_ut.make_annotation(
                result.handgrading_rubric.pk,
                {
                    deduction: -2,
                    max_deduction: -8,
                    short_description: 'I am max',
                    long_description: ''
                }
            )
        ];
        result.handgrading_rubric.annotations = annotations;

        wrapper = managed_mount(Handgrading, {
            propsData: {
                handgrading_result: result,
                readonly_handgrading_results: false,
            }
        });
    });

    test('Expand/collapse annotation list', async () => {
        expect(wrapper.findAll('.annotation').length).toEqual(2);
        expect(wrapper.findAll('.annotation').at(0).isVisible()).toBe(false);

        wrapper.findAll('.collapsible-section-header').at(2).trigger('click');
        await wrapper.vm.$nextTick();
        expect(wrapper.findAll('.annotation').length).toEqual(2);
        expect(wrapper.findAll('.annotation').at(0).isVisible()).toBe(true);

        wrapper.findAll('.collapsible-section-header').at(2).trigger('click');
        await wrapper.vm.$nextTick();
        expect(wrapper.findAll('.annotation').length).toEqual(2);
        expect(wrapper.findAll('.annotation').at(0).isVisible()).toBe(false);
    });

    test('Annotations listed', async () => {
        wrapper.findAll('.collapsible-section-header').at(2).trigger('click');
        await wrapper.vm.$nextTick();

        let annotation_wrappers = wrapper.findAll('.annotation');
        expect(annotation_wrappers.at(0).find('.short-description').text()).toEqual(
            annotations[0].short_description);
        expect(annotation_wrappers.at(0).find('.points').text()).toEqual(
            annotations[0].deduction.toString());
        expect(annotation_wrappers.at(0).find('.long-description').text()).toEqual(
            annotations[0].long_description);
        expect(annotation_wrappers.at(0).find('.max-deduction').exists()).toBe(false);

        expect(annotation_wrappers.at(1).find('.short-description').text()).toEqual(
            annotations[1].short_description);
        expect(annotation_wrappers.at(1).find('.points').text()).toEqual(
            annotations[1].deduction.toString());
        expect(annotation_wrappers.at(1).find('.long-description').exists()).toBe(false);
        expect(annotation_wrappers.at(1).find('.max-deduction').text()).toEqual(
            `${annotations[1].max_deduction} max total deduction`);
    });
});

describe('Footer tests', () => {
    test('Toggle finished grading', async () => {
        let wrapper = managed_mount(Handgrading, {
            propsData: {
                handgrading_result: result,
                readonly_handgrading_results: false,
            }
        });

        assert_not_null(wrapper.vm.d_handgrading_result);
        let save_result_stub = sinon.stub(
            wrapper.vm.d_handgrading_result, 'save_finished_grading');
        expect(checkbox_is_checked(wrapper.find('#finished-grading'))).toBe(false);

        await wrapper.find('#finished-grading').trigger('click');
        expect(await wait_until(wrapper, w => !w.vm.saving)).toBe(true);
        expect(checkbox_is_checked(wrapper.find('#finished-grading'))).toBe(true);
        expect(save_result_stub.calledOnce).toBe(true);

        await wrapper.find('#finished-grading').trigger('click');
        expect(await wait_until(wrapper, w => !w.vm.saving)).toBe(true);
        expect(checkbox_is_checked(wrapper.find('#finished-grading'))).toBe(false);
        expect(save_result_stub.calledTwice).toBe(true);
    });

    test('Prev disabled', () => {
        let wrapper = managed_mount(Handgrading, {
            propsData: {
                handgrading_result: result,
                readonly_handgrading_results: false,
                is_first: true,
            }
        });

        expect(wrapper.find('#prev-button').element).toBeDisabled();
    });

    test('Next disabled', () => {
        let wrapper = managed_mount(Handgrading, {
            propsData: {
                handgrading_result: result,
                readonly_handgrading_results: false,
                is_last: true,
            }
        });

        expect(wrapper.find('#next-button').element).toBeDisabled();
    });

    test('Prev not disabled, emit events when clicked', () => {
        let wrapper = managed_mount(Handgrading, {
            propsData: {
                handgrading_result: result,
                readonly_handgrading_results: false,
            }
        });

        wrapper.find('#prev-button').trigger('click');
        expect(emitted(wrapper, 'prev_group').length).toBe(1);
    });

    test('Next not disabled, emit events when clicked', () => {
        let wrapper = managed_mount(Handgrading, {
            propsData: {
                handgrading_result: result,
                readonly_handgrading_results: false,
            }
        });

        wrapper.find('#next-button').trigger('click');
        expect(emitted(wrapper, 'next_group').length).toBe(1);
    });

    test('Next labeled as "Skip" when unfinished', () => {
        let wrapper = managed_mount(Handgrading, {
            propsData: {
                handgrading_result: result,
                readonly_handgrading_results: false,
            }
        });

        expect(wrapper.vm.d_handgrading_result!.finished_grading).toBe(false);
        expect(wrapper.find('#next-button').text()).toEqual('Skip');
    });

    test('Next labeled as "Next" when finished', async () => {
        let wrapper = managed_mount(Handgrading, {
            propsData: {
                handgrading_result: result,
                readonly_handgrading_results: false,
            }
        });

        wrapper.vm.d_handgrading_result!.finished_grading = true;
        await wrapper.vm.$nextTick();
        expect(wrapper.find('#next-button').text()).toEqual('Next');
    });
});

describe('Observer updates', () => {
    test('Applied annotation created', async () => {
        let annotation = data_ut.make_annotation(result.handgrading_rubric.pk);
        result.handgrading_rubric.annotations = [annotation];
        let wrapper = managed_mount(Handgrading, {
            propsData: {
                handgrading_result: result,
                readonly_handgrading_results: false,
            }
        });

        expect(wrapper.findAll('.comment').length).toEqual(0);

        let applied_annotation = data_ut.make_applied_annotation(
            result, annotation, {filename: 'file1.txt', first_line: 1, last_line: 1});
        ag_cli.AppliedAnnotation.notify_applied_annotation_created(applied_annotation);

        await wrapper.vm.$nextTick();
        expect(wrapper.findAll('.comment').length).toEqual(1);
        expect(wrapper.vm.d_handgrading_result!.applied_annotations).toEqual([applied_annotation]);
    });

    test('Comment created', async () => {
        let wrapper = managed_mount(Handgrading, {
            propsData: {
                handgrading_result: result,
                readonly_handgrading_results: false,
            }
        });

        expect(wrapper.findAll('.comment').length).toEqual(0);

        let comment = data_ut.make_comment(
            result, {filename: 'file1.txt', first_line: 1, last_line: 1}, 'nsetanost');
        ag_cli.Comment.notify_comment_created(comment);

        await wrapper.vm.$nextTick();
        expect(wrapper.findAll('.comment').length).toEqual(1);
        expect(wrapper.vm.d_handgrading_result!.comments).toEqual([comment]);
    });
});

test('Read-only mode', async () => {
    let criterion = data_ut.make_criterion(
        result.handgrading_rubric.pk,
        {
            short_description: "I am an criterion",
            long_description: "I am such long description of very length",
            points: 4
        }
    );
    let unselected_criterion = data_ut.make_criterion(
        result.handgrading_rubric.pk,
        {
            short_description: "Unselected",
            long_description: "",
            points: -1,
        }
    );
    result.handgrading_rubric.criteria = [criterion, unselected_criterion];
    result.criterion_results = [
        data_ut.make_criterion_result(result, criterion, true),
        data_ut.make_criterion_result(result, unselected_criterion, false),
    ];

    let annotation = data_ut.make_annotation(
        result.handgrading_rubric.pk,
        {
            short_description: "I am annotation",
            long_description: "I am such long annotation description of length",
            deduction: -2
        }
    );
    result.handgrading_rubric.annotations = [annotation];
    data_ut.make_comment(result, null, 'A general comment');
    data_ut.make_comment(
        result, {filename: 'file3.py', first_line: 1, last_line: 1}, 'What a comment');
    data_ut.make_applied_annotation(
        result, annotation, {filename: 'file3.py', first_line: 2, last_line: 2});

    result.handgrading_rubric.handgraders_can_adjust_points = true;
    result.handgrading_rubric.handgraders_can_leave_comments = true;

    result.total_points = 3;
    result.total_points_possible = 8;

    let wrapper = managed_mount(Handgrading, {
        propsData: {
            handgrading_result: result,
            readonly_handgrading_results: true,
        }
    });

    // Adjust points and leave comment are gone
    expect(wrapper.find('#adjust-points-container').exists()).toBe(false);
    expect(wrapper.findComponent({ref: 'adjust_points'}).exists()).toBe(false);
    expect(wrapper.find('#new-comment').exists()).toBe(false);

    // Checkboxes are not toggleable
    let save_criterion_result_stub = sinon.stub(
        wrapper.vm.d_handgrading_result!.criterion_results[0], 'save');
    let checkbox = wrapper.findAll('.criterion').at(0);
    checkbox.trigger('click');
    await wrapper.vm.$nextTick();
    expect(save_criterion_result_stub.callCount).toEqual(0);

    // Unselected checkbox is grayed out
    let unselected_checkbox = wrapper.findAll('.criterion').at(1);
    expect(unselected_checkbox.classes().includes('grayed-out')).toBe(true);
    expect(checkbox.classes().includes('grayed-out')).toBe(false);

    // Checkbox is still shown
    expect(checkbox.find('.criterion-checkbox .fa-check').exists()).toBe(true);

    // Deletion x's are gone
    expect(wrapper.findAll('.delete').length).toEqual(0);

    // Annotation reference list is not shown
    expect(wrapper.findComponent({ref: 'annotation_reference'}).exists()).toBe(false);
    expect(wrapper.findAll('.annotation').length).toEqual(0);

    // Comments still shown
    expect(wrapper.findAll('.comment').length).toEqual(3);

    // Score still shown
    expect(wrapper.find('.grading-sidebar-header .score').text()).toEqual('3/8');
});
