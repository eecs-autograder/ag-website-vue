import { Vue } from 'vue-property-decorator';

import { Wrapper, WrapperArray } from '@vue/test-utils';

import * as ag_cli from 'ag-client-typescript';
import * as sinon from 'sinon';

import FilePanel from '@/components/handgrading/file_panel.vue';
import Handgrading from '@/components/handgrading/handgrading.vue';

import * as data_ut from '@/tests/data_utils';
import { managed_mount } from '@/tests/setup';
import {
    compress_whitespace,
    get_validated_input_text,
    set_validated_input_text,
    wait_until
} from '@/tests/utils';

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
        expect(await wait_until(wrapper, w => !w.vm.saving)).toBe(true);

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
    let panels = <WrapperArray<FilePanel>>wrapper.findAll({name: 'FilePanel'});
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
        expect(wrapper.findAll('.criterion').isVisible()).toBe(true);

        wrapper.findAll('.collapsible-section-header').at(0).trigger('click');
        await wrapper.vm.$nextTick();
        expect(wrapper.findAll('.criterion').length).toEqual(2);
        expect(wrapper.findAll('.criterion').isVisible()).toBe(false);

        wrapper.findAll('.collapsible-section-header').at(0).trigger('click');
        await wrapper.vm.$nextTick();
        expect(wrapper.findAll('.criterion').length).toEqual(2);
        expect(wrapper.findAll('.criterion').isVisible()).toBe(true);
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
            save_stub = sinon.stub(
                wrapper.vm.d_handgrading_result.criterion_results[0], 'save'
            ).callsFake(() => {
                ag_cli.CriterionResult.notify_criterion_result_changed(
                    wrapper.vm.d_handgrading_result.criterion_results[0]
                );
            });
        });

        test('Toggle checkbox, grading not marked as done, score updated locally', async () => {
            criteria.at(0).trigger('click');
            expect(await wait_until(wrapper, w => !w.vm.saving)).toBe(true);

            expect(wrapper.vm.d_handgrading_result.criterion_results[0].selected).toBe(false);
            expect(wrapper.find('.grading-sidebar-header .score').text()).toEqual('0/4');
            expect(save_stub.calledOnce).toBe(true);

            criteria.at(0).trigger('click');
            expect(await wait_until(wrapper, w => !w.vm.saving)).toBe(true);

            expect(wrapper.vm.d_handgrading_result.criterion_results[0].selected).toBe(true);
            expect(wrapper.find('.grading-sidebar-header .score').text()).toEqual('4/4');
            expect(save_stub.calledTwice).toBe(true);
        });

        test('Toggle checkbox, grading marked as done, result refreshes', async () => {
            wrapper.vm.d_handgrading_result.finished_grading = true;
            let refresh_result_stub = sinon.stub(
                wrapper.vm.d_handgrading_result, 'refresh'
            ).onFirstCall().callsFake(() => {
                wrapper.vm.d_handgrading_result.total_points = 3;
                return Promise.resolve({});
            }).onSecondCall().callsFake(() => {
                wrapper.vm.d_handgrading_result.total_points = 2;
                return Promise.resolve({});
            });

            criteria.at(0).trigger('click');
            expect(await wait_until(wrapper, w => !w.vm.saving)).toBe(true);

            expect(wrapper.vm.d_handgrading_result.criterion_results[0].selected).toBe(false);
            expect(wrapper.find('.grading-sidebar-header .score').text()).toEqual('3/4');
            expect(save_stub.calledOnce).toBe(true);

            criteria.at(0).trigger('click');
            expect(await wait_until(wrapper, w => !w.vm.saving)).toBe(true);

            expect(wrapper.vm.d_handgrading_result.criterion_results[0].selected).toBe(true);
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
        expect(wrapper.findAll('.comment').isVisible()).toBe(true);

        wrapper.findAll('.collapsible-section-header').at(1).trigger('click');
        await wrapper.vm.$nextTick();
        expect(wrapper.findAll('.comment').length).toEqual(4);
        expect(wrapper.findAll('.comment').isVisible()).toBe(false);

        wrapper.findAll('.collapsible-section-header').at(1).trigger('click');
        await wrapper.vm.$nextTick();
        expect(wrapper.findAll('.comment').length).toEqual(4);
        expect(wrapper.findAll('.comment').isVisible()).toBe(true);
    });

    test('Staff can leave custom comment', async () => {
        expect(wrapper.find('.new-comment').exists()).toBe(true);
        let new_comment_text = "noresatnersatoineratoienrastoier";
        wrapper.find('.new-comment .input').setValue(new_comment_text);

        let new_comment = data_ut.make_comment(result, null, new_comment_text);
        sinon.stub(ag_cli.Comment, 'create').withArgs(
            result.pk, {text: new_comment_text}
        ).resolves(new_comment);
        wrapper.find('.new-comment .blue-button').trigger('click');
        expect(await wait_until(wrapper, w => !w.vm.saving)).toBe(true);

        expect(wrapper.vm.d_handgrading_result.comments[2]).toEqual(new_comment);
    });

    test('Handgraders allowed to leave custom comments', async () => {
        wrapper.vm.d_handgrading_result.handgrading_rubric.handgraders_can_leave_comments = true;
        data_ut.set_global_user_roles(data_ut.make_user_roles({is_handgrader: true}));
        wrapper.vm.$forceUpdate();
        await wrapper.vm.$nextTick();
        expect(wrapper.find('.new-comment').exists()).toBe(true);
        expect(wrapper.findAll('.comment').at(0).find('.delete').exists()).toBe(true);
    });

    test('Handgraders not allowed to leave custom comments', async () => {
        wrapper.vm.d_handgrading_result.handgrading_rubric.handgraders_can_leave_comments = false;
        data_ut.set_global_user_roles(data_ut.make_user_roles({is_handgrader: true}));
        expect(wrapper.find('.new-comment').exists()).toBe(false);
        expect(wrapper.findAll('.comment').at(0).find('.delete').exists()).toBe(false);
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
        expect(wrapper.vm.d_handgrading_result.comments.length).toEqual(2);
        let to_delete = wrapper.vm.d_handgrading_result.comments[1];
        expect(to_delete).toEqual(comment_without_location_0);

        let delete_stub = sinon.stub(
            to_delete, 'delete'
        ).callsFake(() => {
            ag_cli.Comment.notify_comment_deleted(to_delete);
        });
        wrapper.findAll('.comment').at(0).find('.delete').trigger('click');
        expect(await wait_until(wrapper, w => !w.vm.saving)).toBe(true);

        expect(wrapper.vm.d_handgrading_result.comments).toEqual([comment_with_location_3]);
        expect(delete_stub.calledOnce).toBe(true);
    });

    test('Delete custom inline comment', async () => {
        expect(wrapper.vm.d_handgrading_result.comments.length).toEqual(2);
        let to_delete = wrapper.vm.d_handgrading_result.comments[0];
        expect(to_delete).toEqual(comment_with_location_3);

        let delete_stub = sinon.stub(
            to_delete, 'delete'
        ).callsFake(() => {
            ag_cli.Comment.notify_comment_deleted(to_delete);
        });
        wrapper.findAll('.comment').at(3).find('.delete').trigger('click');
        expect(await wait_until(wrapper, w => !w.vm.saving)).toBe(true);

        expect(wrapper.vm.d_handgrading_result.comments).toEqual([comment_without_location_0]);
        expect(delete_stub.calledOnce).toBe(true);
    });

    test('Delete applied annotation', async () => {
        expect(wrapper.vm.d_handgrading_result.applied_annotations.length).toEqual(2);
        let to_delete = wrapper.vm.d_handgrading_result.applied_annotations[0];
        expect(to_delete).toEqual(applied_empty_long_description_annotation_2);

        let delete_stub = sinon.stub(
            to_delete, 'delete'
        ).callsFake(() => {
            ag_cli.AppliedAnnotation.notify_applied_annotation_deleted(to_delete);
        });
        wrapper.findAll('.comment').at(2).find('.delete').trigger('click');
        expect(await wait_until(wrapper, w => !w.vm.saving)).toBe(true);

        expect(wrapper.vm.d_handgrading_result.applied_annotations).toEqual(
            [applied_long_description_annotation_1]);
        expect(delete_stub.calledOnce).toBe(true);
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
        expect(wrapper.findAll('.annotation').isVisible()).toBe(false);

        wrapper.findAll('.collapsible-section-header').at(2).trigger('click');
        await wrapper.vm.$nextTick();
        expect(wrapper.findAll('.annotation').length).toEqual(2);
        expect(wrapper.findAll('.annotation').isVisible()).toBe(true);

        wrapper.findAll('.collapsible-section-header').at(2).trigger('click');
        await wrapper.vm.$nextTick();
        expect(wrapper.findAll('.annotation').length).toEqual(2);
        expect(wrapper.findAll('.annotation').isVisible()).toBe(false);
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
