import { Wrapper } from "@vue/test-utils";

import {
    Annotation,
    Course,
    Criterion,
    HandgradingRubric,
    HttpError,
    PointsStyle,
    Project,
    User,
} from "ag-client-typescript";
import * as sinon from 'sinon';

import APIErrors from "@/components/api_errors.vue";
import AnnotationForm from "@/components/project_admin/handgrading_settings/annotation_form.vue";
import CriterionForm from "@/components/project_admin/handgrading_settings/criterion_form.vue";
import HandgradingSettings from "@/components/project_admin/handgrading_settings/handgrading_settings.vue";
import SelectObject from "@/components/select_object.vue";
import { deep_copy } from '@/utils';

import * as data_ut from "@/tests/data_utils";
import { managed_mount } from '@/tests/setup';
import {
    checkbox_is_checked, expect_html_element_has_value,
    get_validated_input_text,
    set_select_object_value,
    set_validated_input_text,
    validated_input_is_valid,
    wait_for_load,
    wait_until
} from "@/tests/utils";

let user: User;
let course: Course;
let current_project: Project;

beforeEach(() => {
    user = data_ut.make_user();
    data_ut.set_global_current_user(user);
    course = data_ut.make_course();
    data_ut.set_global_current_course(course);
    current_project = data_ut.make_project(course.pk);
    data_ut.set_global_current_project(current_project);
});

describe('Initialize handgrading tests', () => {
    let wrapper: Wrapper<HandgradingSettings>;

    test('Create new handgrading rubric', async () => {
        sinon.stub(user, 'courses_is_admin_for').returns(Promise.resolve([course]));
        sinon.stub(Project, 'get_all_from_course').returns(Promise.resolve([]));

        let project = data_ut.make_project(course.pk);

        let rubric =  new HandgradingRubric({
            pk: 3,
            project: project.pk,
            last_modified: '',
            points_style: PointsStyle.start_at_zero_and_add,
            max_points: null,
            show_grades_and_rubric_to_students: false,
            handgraders_can_leave_comments: false,
            handgraders_can_adjust_points: false,
            criteria: [],
            annotations: []
        });

        let new_rubric_stub = sinon.stub(HandgradingRubric, 'create').returns(
            Promise.resolve(rubric));

        wrapper = managed_mount(HandgradingSettings, {
            propsData: {
                course: course,
                project: project
            },
        });

        expect(await wait_for_load(wrapper)).toBe(true);
        expect(wrapper.vm.d_handgrading_rubric).toBeNull();
        expect(wrapper.find('#rubric-columns-container').exists()).toEqual(false);

        await wrapper.find('#new-rubric-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(new_rubric_stub.calledOnceWith(project.pk, {}));
        expect(wrapper.vm.d_handgrading_rubric).toEqual(rubric);
    });

    test('Import rubric from same course', async () => {
        sinon.stub(user, 'courses_is_admin_for').returns(Promise.resolve([course]));
        let project_to_import_from = data_ut.make_project(
            course.pk, {has_handgrading_rubric: true});
        let other_project = data_ut.make_project(course.pk, {has_handgrading_rubric: true});

        let get_projects_stub = sinon.stub(
            Project, 'get_all_from_course'
        ).resolves([current_project, other_project, project_to_import_from]);

        let rubric =  new HandgradingRubric({
            pk: 3,
            project: project_to_import_from.pk,
            last_modified: '',
            points_style: PointsStyle.start_at_zero_and_add,
            max_points: null,
            show_grades_and_rubric_to_students: false,
            handgraders_can_leave_comments: false,
            handgraders_can_adjust_points: false,
            criteria: [],
            annotations: []
        });

        let import_rubric_stub = sinon.stub(
            HandgradingRubric, 'import_from_project').returns(Promise.resolve(rubric));

        wrapper = managed_mount(HandgradingSettings, {
            propsData: {
                course: course,
                project: current_project
            },
        });
        expect(await wait_for_load(wrapper)).toBe(true);

        expect(wrapper.vm.d_course_to_import_from).toEqual(course);
        expect(wrapper.vm.d_project_to_import_from).toBeNull();
        // The current project doesn't have a rubric, so it's filtered out.
        expect(wrapper.vm.d_selected_course_projects).toEqual(
            [other_project, project_to_import_from]);
        let select_project_to_import_from
            = <Wrapper<SelectObject>> wrapper.findComponent({ref: 'project_to_import_from'});
        // "Select a project" is index 0, other_project is 1, project_to_import_from is 2
        await select_project_to_import_from.findAll('option').at(2).setSelected();

        expect(wrapper.vm.d_project_to_import_from).toEqual(project_to_import_from);

        await wrapper.find('#import-button-container .green-button').trigger('click');
        expect(await wait_until(wrapper, w => !w.vm.d_import_request_pending)).toBe(true);

        expect(wrapper.vm.d_handgrading_rubric).toEqual(rubric);

        expect(get_projects_stub.calledOnceWith(course.pk));
        expect(import_rubric_stub.calledOnceWith(current_project.pk, project_to_import_from.pk));
    });

    test('Import rubric from different course', async () => {
        let course_to_import_from = data_ut.make_course();

        sinon.stub(user, 'courses_is_admin_for').returns(
            Promise.resolve([course, course_to_import_from]));
        let project_to_import_from = data_ut.make_project(
            course_to_import_from.pk, {has_handgrading_rubric: true});
        let other_project = data_ut.make_project(
            course_to_import_from.pk, {has_handgrading_rubric: true});
        let other_project_no_rubric = data_ut.make_project(course_to_import_from.pk);

        let get_projects_stub = sinon.stub(Project, 'get_all_from_course');

        get_projects_stub.withArgs(course.pk).returns(Promise.resolve([current_project]));
        get_projects_stub.withArgs(course_to_import_from.pk).resolves([
            other_project, other_project_no_rubric, project_to_import_from
        ]);

        let rubric = new HandgradingRubric({
            pk: 3,
            project: project_to_import_from.pk,
            last_modified: '',
            points_style: PointsStyle.start_at_zero_and_add,
            max_points: null,
            show_grades_and_rubric_to_students: false,
            handgraders_can_leave_comments: false,
            handgraders_can_adjust_points: false,
            criteria: [],
            annotations: []
        });

        let import_rubric_stub = sinon.stub(
            HandgradingRubric, 'import_from_project').returns(Promise.resolve(rubric));

        wrapper = managed_mount(HandgradingSettings, {
            propsData: {
                course: course,
                project: current_project
            },
        });
        expect(await wait_for_load(wrapper)).toBe(true);

        expect(wrapper.vm.d_course_to_import_from).toEqual(course);
        expect(wrapper.vm.d_selected_course_projects).toEqual([]);
        await set_select_object_value(
            wrapper.findComponent({ref: 'course_to_import_from'}), course_to_import_from.pk);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_project_to_import_from).toBeNull();
        expect(wrapper.vm.d_selected_course_projects).toEqual(
            [other_project, project_to_import_from]);
        let select_project_to_import_from
            = <Wrapper<SelectObject>> wrapper.findComponent({ref: 'project_to_import_from'});
        // "Select a project" is index 0, other_project is 1, project_to_import_from is 2
        await select_project_to_import_from.findAll('option').at(2).setSelected();

        expect(wrapper.vm.d_project_to_import_from).toEqual(project_to_import_from);

        await wrapper.find('#import-button-container .green-button').trigger('click');
        expect(await wait_until(wrapper, w => !w.vm.d_import_request_pending)).toBe(true);

        expect(wrapper.vm.d_handgrading_rubric).toEqual(rubric);
        expect(import_rubric_stub.calledOnceWith(current_project.pk, project_to_import_from.pk));
    });

    test('Selecting course with no projects resets d_project_to_import_from', async () => {
        let no_projects_course = data_ut.make_course();
        let current_course_project = data_ut.make_project(course.pk);
        let project_with_rubric = data_ut.make_project(course.pk, {has_handgrading_rubric: true});

        sinon.stub(user, 'courses_is_admin_for').returns(
            Promise.resolve([course, no_projects_course]));

        let get_projects_stub = sinon.stub(Project, 'get_all_from_course');
        get_projects_stub.withArgs(no_projects_course.pk).returns(Promise.resolve([]));
        get_projects_stub.withArgs(course.pk).resolves([
            current_course_project, project_with_rubric
        ]);

        wrapper = managed_mount(HandgradingSettings, {
            propsData: {
                course: course,
                project: current_course_project
            }
        });
        expect(await wait_for_load(wrapper)).toBe(true);

        expect(wrapper.vm.d_project_to_import_from).toBeNull();
        expect(wrapper.vm.d_selected_course_projects).toEqual([project_with_rubric]);

        let select_project_to_import_from = <Wrapper<SelectObject>> wrapper.findComponent(
            {ref: 'project_to_import_from'});
        await select_project_to_import_from.findAll('option').at(1).setSelected();

        await wrapper.vm.$nextTick();
        expect(wrapper.vm.d_project_to_import_from).toEqual(project_with_rubric);

        expect(
            wrapper.find('#import-button-container .green-button').element
        ).not.toBeDisabled();

        await set_select_object_value(
            wrapper.findComponent({ref: 'course_to_import_from'}), no_projects_course.pk);

        expect(wrapper.vm.d_project_to_import_from).toBeNull();
        expect(wrapper.vm.d_selected_course_projects).toEqual([]);

        expect(
            wrapper.find('#import-button-container .green-button').element
        ).toBeDisabled();
    });
});

describe('Handgrading settings tests', () => {
    let rubric: HandgradingRubric;
    let wrapper: Wrapper<HandgradingSettings>;

    beforeEach(async () => {
        current_project.has_handgrading_rubric = true;
        rubric = new HandgradingRubric({
            pk: 3,
            project: current_project.pk,
            last_modified: '',
            points_style: PointsStyle.start_at_zero_and_add,
            max_points: null,
            show_grades_and_rubric_to_students: false,
            handgraders_can_leave_comments: false,
            handgraders_can_adjust_points: false,
            criteria: [],
            annotations: []
        });

        sinon.stub(HandgradingRubric, 'get_from_project').returns(Promise.resolve(rubric));

        wrapper = managed_mount(HandgradingSettings, {
            propsData: {
                course: course,
                project: current_project
            }
        });

        await wrapper.vm.$nextTick();
        expect(wrapper.vm.d_handgrading_rubric).toEqual(rubric);
    });

    afterEach(() => {
        sinon.restore();
    });

    test('Publish grades binding', () => {
        expect(checkbox_is_checked(
            wrapper.find('#publish-grades'))
        ).toEqual(wrapper.vm.d_handgrading_rubric!.show_grades_and_rubric_to_students);

        wrapper.find('#publish-grades').setChecked(true);

        expect(wrapper.vm.d_handgrading_rubric!.show_grades_and_rubric_to_students).toEqual(true);
    });

    test('Show only applied rubric binding', () => {
        expect(checkbox_is_checked(
            wrapper.find('#show-only-applied-rubrics'))
        ).toEqual(wrapper.vm.d_handgrading_rubric!.show_only_applied_rubric_to_students);

        wrapper.find('#show-only-applied-rubrics').setChecked(true);

        expect(wrapper.vm.d_handgrading_rubric!.show_only_applied_rubric_to_students).toEqual(true);
    });

    test('Points style binding', () => {
        expect_html_element_has_value(
            wrapper.find('#points-style'), PointsStyle.start_at_zero_and_add);

        wrapper.find('#points-style').setValue(PointsStyle.start_at_max_and_subtract);

        expect(
            wrapper.vm.d_handgrading_rubric!.points_style
        ).toEqual(PointsStyle.start_at_max_and_subtract);
    });

    test('Points style start at 0, max points binding', () => {
        expect(
            wrapper.vm.d_handgrading_rubric!.points_style
        ).toEqual(PointsStyle.start_at_zero_and_add);

        expect(wrapper.vm.d_handgrading_rubric!.max_points).toBeNull();
        expect(get_validated_input_text(wrapper.find('#max-points'))).toEqual('');
        expect(validated_input_is_valid(wrapper.find('#max-points'))).toEqual(true);

        set_validated_input_text(wrapper.find('#max-points'), '42');
        expect(wrapper.vm.d_handgrading_rubric!.max_points).toEqual(42);
    });

    test('Points style start at max, error max points empty, zero, or negative', async () => {
        // Switching points style should make the max points validators rerun

        expect(
            wrapper.vm.d_handgrading_rubric!.points_style
        ).toEqual(PointsStyle.start_at_zero_and_add);
        expect(wrapper.vm.d_handgrading_rubric!.max_points).toBeNull();

        wrapper.vm.d_handgrading_rubric!.points_style = PointsStyle.start_at_max_and_subtract;
        await wrapper.vm.$nextTick();
        expect(validated_input_is_valid(wrapper.find('#max-points'))).toEqual(false);

        await wrapper.find('#points-style').setValue(PointsStyle.start_at_zero_and_add);
        expect(validated_input_is_valid(wrapper.find('#max-points'))).toEqual(true);

        await wrapper.find('#points-style').setValue(PointsStyle.start_at_max_and_subtract);
        expect(validated_input_is_valid(wrapper.find('#max-points'))).toEqual(false);

        await set_validated_input_text(wrapper.find('#max-points'), '1');
        expect(validated_input_is_valid(wrapper.find('#max-points'))).toEqual(true);

        await set_validated_input_text(wrapper.find('#max-points'), '0');
        expect(validated_input_is_valid(wrapper.find('#max-points'))).toEqual(false);

        await set_validated_input_text(wrapper.find('#max-points'), '-1');
        expect(validated_input_is_valid(wrapper.find('#max-points'))).toEqual(false);
    });

    test('Handgraders can leave comments binding', () => {
        expect(checkbox_is_checked(
            wrapper.find('#handgraders-can-leave-comments'))
        ).toEqual(wrapper.vm.d_handgrading_rubric!.handgraders_can_leave_comments);

        wrapper.find('#handgraders-can-leave-comments').setChecked(true);

        expect(wrapper.vm.d_handgrading_rubric!.handgraders_can_leave_comments).toEqual(true);
    });

    test('Handgraders can adjust points binding', () => {
        expect(checkbox_is_checked(
            wrapper.find('#handgraders-can-adjust-points'))
        ).toEqual(wrapper.vm.d_handgrading_rubric!.handgraders_can_adjust_points);

        wrapper.find('#handgraders-can-adjust-points').setChecked(true);

        expect(wrapper.vm.d_handgrading_rubric!.handgraders_can_adjust_points).toEqual(true);
    });

    test('Save button disabled when invalid', async () => {
        await set_validated_input_text(wrapper.find('#max-points'), '-1');
        expect(validated_input_is_valid(wrapper.find('#max-points'))).toEqual(false);
        expect(wrapper.find('[data-testid=save_rubric_button]').element).toBeDisabled();
    });

    test('Save settings', async () => {
        let save_stub = sinon.stub(rubric, 'save').returns(Promise.resolve());
        expect(wrapper.find('[data-testid=save_rubric_button]').element).not.toBeDisabled();
        wrapper.findComponent({ref: 'handgrading_settings_form'}).trigger('submit');

        await wrapper.vm.$nextTick();
        expect(save_stub.calledOnce).toEqual(true);
    });

    test('API error', async () => {
        sinon.stub(rubric, 'save').returns(
            Promise.reject(new HttpError(403, 'Permission denied')));

        let api_errors = <APIErrors> wrapper.findComponent({ref: 'settings_form_errors'}).vm;
        expect(api_errors.d_api_errors.length).toEqual(0);
        await wrapper.findComponent({ref: 'handgrading_settings_form'}).trigger('submit');
        expect(await wait_until(wrapper, w => !w.vm.d_saving));

        expect(api_errors.d_api_errors.length).toEqual(1);
    });
});

describe('Criteria and annotation tests', () => {
    let rubric: HandgradingRubric;
    let wrapper: Wrapper<HandgradingSettings>;

    beforeEach(async () => {
        current_project.has_handgrading_rubric = true;
        rubric = new HandgradingRubric({
            pk: 3,
            project: current_project.pk,
            last_modified: '',
            points_style: PointsStyle.start_at_zero_and_add,
            max_points: null,
            show_grades_and_rubric_to_students: false,
            handgraders_can_leave_comments: false,
            handgraders_can_adjust_points: false,
            criteria: [],
            annotations: []
        });
        rubric.criteria = [data_ut.make_criterion(rubric.pk), data_ut.make_criterion(rubric.pk)];
        rubric.annotations = [
            data_ut.make_annotation(rubric.pk), data_ut.make_annotation(rubric.pk)
        ];

        sinon.stub(HandgradingRubric, 'get_from_project').returns(Promise.resolve(rubric));

        wrapper = managed_mount(HandgradingSettings, {
            propsData: {
                course: course,
                project: current_project
            }
        });
        expect(await wait_for_load(wrapper)).toBe(true);
        expect(wrapper.vm.d_handgrading_rubric).toEqual(rubric);

        expect(wrapper.findAllComponents({name: 'SingleCriterion'}).length).toEqual(2);
        expect(wrapper.findAllComponents({name: 'SingleAnnotation'}).length).toEqual(2);
    });

    test('Create criterion', async () => {
        let new_criterion = data_ut.make_criterion(rubric.pk);
        sinon.stub(Criterion, 'create').callsFake(() => {
            Criterion.notify_criterion_created(new_criterion);
            return Promise.resolve(new_criterion);
        });
        wrapper.vm.d_create_criterion_modal_is_open = true;
        await wrapper.vm.$nextTick();

        expect(wrapper.find('[data-testid=create_criterion_button]').element).toBeDisabled();

        let criterion_form
            = <Wrapper<CriterionForm>> wrapper.findComponent({ref: 'create_criterion_form'});
        criterion_form.vm.d_form_data = {
            short_description: 'An criteria', long_description: '', points: 1
        };

        await wrapper.vm.$nextTick();
        expect(wrapper.find('[data-testid=create_criterion_button]').element).not.toBeDisabled();

        criterion_form.vm.submit();
        expect(await wait_until(wrapper, w => !w.vm.d_creating_criterion)).toBe(true);
        await wrapper.vm.$nextTick();
        expect(wrapper.findComponent({ref: 'create_criterion_modal'}).exists()).toBe(false);

        expect(wrapper.vm.d_handgrading_rubric!.criteria.length).toEqual(3);
        expect(wrapper.findAllComponents({name: 'SingleCriterion'}).length).toEqual(3);

        expect(wrapper.vm.d_handgrading_rubric!.criteria[2]).toEqual(new_criterion);
    });

    test('Create criterion API error', async () => {
        sinon.stub(Criterion, 'create').returns(
            Promise.reject(new HttpError(403, 'Permission denied')));

        wrapper.vm.d_create_criterion_modal_is_open = true;
        await wrapper.vm.$nextTick();

        let api_errors = <APIErrors> wrapper.findComponent({ref: 'create_criterion_errors'}).vm;
        expect(api_errors.d_api_errors.length).toEqual(0);

        let criterion_form
            = <Wrapper<CriterionForm>> wrapper.findComponent({ref: 'create_criterion_form'});
        criterion_form.vm.submit();

        expect(await wait_until(wrapper, w => !w.vm.d_creating_criterion)).toBe(true);
        expect(api_errors.d_api_errors.length).toEqual(1);
        expect(wrapper.findComponent({ref: 'create_criterion_modal'}).exists()).toBe(true);
    });

    test('Criterion changed', () => {
        let updated_criterion = new Criterion(rubric.criteria[1]);
        updated_criterion.short_description = 'New description!';
        updated_criterion.long_description = 'Looooooong';
        updated_criterion.points = 19;
        Criterion.notify_criterion_changed(updated_criterion);

        expect(wrapper.vm.d_handgrading_rubric!.criteria[1]).not.toBe(updated_criterion);
        expect(wrapper.vm.d_handgrading_rubric!.criteria[1]).toEqual(updated_criterion);
    });

    test('Criterion deleted', async () => {
        let expected = [rubric.criteria[1]];
        Criterion.notify_criterion_deleted(rubric.criteria[0]);
        await wrapper.vm.$nextTick();

        expect(wrapper.findAllComponents({name: 'SingleCriterion'}).length).toEqual(1);
        expect(wrapper.vm.d_handgrading_rubric!.criteria).toEqual(expected);
    });

    test('Change criteria order', async () => {
        let order_stub = sinon.stub(Criterion, 'update_order');
        wrapper.findComponent({ref: "criteria_order"}).vm.$emit('change');
        await wrapper.vm.$nextTick();
        expect(
            order_stub.calledOnceWith(rubric.pk, rubric.criteria.map(item => item.pk))
        ).toBe(true);
    });

    test('Create annotation', async () => {
        let new_annotation = data_ut.make_annotation(rubric.pk);
        sinon.stub(Annotation, 'create').callsFake(() => {
            Annotation.notify_annotation_created(new_annotation);
            return Promise.resolve(new_annotation);
        });
        wrapper.vm.d_create_annotation_modal_is_open = true;
        await wrapper.vm.$nextTick();

        expect(wrapper.find('[data-testid=create_annotation_button]').element).toBeDisabled();

        let annotation_form
            = <Wrapper<AnnotationForm>> wrapper.findComponent({ref: 'create_annotation_form'});
        annotation_form.vm.d_form_data = {
            short_description: 'An annotation',
            long_description: 'Some description',
            deduction: -1,
            max_deduction: -2
        };

        await wrapper.vm.$nextTick();
        expect(wrapper.find('[data-testid=create_annotation_button]').element).not.toBeDisabled();

        annotation_form.vm.submit();
        expect(await wait_until(wrapper, w => !w.vm.d_creating_annotation)).toBe(true);
        await wrapper.vm.$nextTick();
        expect(wrapper.findComponent({ref: 'create_annotation_modal'}).exists()).toBe(false);

        expect(wrapper.vm.d_handgrading_rubric!.annotations.length).toEqual(3);
        expect(wrapper.findAllComponents({name: 'SingleAnnotation'}).length).toEqual(3);

        expect(wrapper.vm.d_handgrading_rubric!.annotations[2]).toEqual(new_annotation);
    });

    test('Create annotation API error', async () => {
        sinon.stub(Annotation, 'create').returns(
            Promise.reject(new HttpError(403, 'Permission denied')));

        wrapper.vm.d_create_annotation_modal_is_open = true;
        await wrapper.vm.$nextTick();

        let api_errors = <APIErrors> wrapper.findComponent({ref: 'create_annotation_errors'}).vm;
        expect(api_errors.d_api_errors.length).toEqual(0);

        let annotation_form
            = <Wrapper<AnnotationForm>> wrapper.findComponent({ref: 'create_annotation_form'});
        annotation_form.vm.submit();

        expect(await wait_until(wrapper, w => !w.vm.d_creating_annotation)).toBe(true);
        await wrapper.vm.$nextTick();
        expect(api_errors.d_api_errors.length).toEqual(1);
        expect(wrapper.findComponent({ref: 'create_annotation_modal'}).exists()).toBe(true);
    });

    test('Annotation changed', async () => {
        let updated_annotation = new Annotation(rubric.annotations[1]);
        updated_annotation.short_description = 'New description!';
        updated_annotation.long_description = 'Looooooong';
        updated_annotation.deduction = -2;
        updated_annotation.max_deduction = -8;
        Annotation.notify_annotation_changed(updated_annotation);

        expect(wrapper.vm.d_handgrading_rubric!.annotations[1]).not.toBe(updated_annotation);
        expect(wrapper.vm.d_handgrading_rubric!.annotations[1]).toEqual(updated_annotation);
    });

    test('Annotation deleted', async () => {
        let expected = [rubric.annotations[1]];
        Annotation.notify_annotation_deleted(rubric.annotations[0]);
        await wrapper.vm.$nextTick();

        expect(wrapper.findAllComponents({name: 'SingleAnnotation'}).length).toEqual(1);
        expect(wrapper.vm.d_handgrading_rubric!.annotations).toEqual(expected);
    });

    test('Change annotation order', async () => {
        let order_stub = sinon.stub(Annotation, 'update_order');
        wrapper.findComponent({ref: "annotation_order"}).vm.$emit('change');
        await wrapper.vm.$nextTick();
        expect(
            order_stub.calledOnceWith(rubric.pk, rubric.annotations.map(item => item.pk))
        ).toBe(true);
    });

    test('Observer updates from other rubric ignored', () => {
        let original_rubric = deep_copy(wrapper.vm.d_handgrading_rubric!, HandgradingRubric);

        let other_rubric = data_ut.make_handgrading_rubric(original_rubric.project);
        let other_criterion = data_ut.make_criterion(other_rubric.pk);
        let other_annotation = data_ut.make_annotation(other_rubric.pk);

        Criterion.notify_criterion_created(other_criterion);
        Criterion.notify_criterion_changed(other_criterion);
        Criterion.notify_criterion_deleted(other_criterion);
        Annotation.notify_annotation_created(other_annotation);
        Annotation.notify_annotation_changed(other_annotation);
        Annotation.notify_annotation_deleted(other_annotation);

        expect(wrapper.vm.d_handgrading_rubric).toEqual(original_rubric);
    });
});
