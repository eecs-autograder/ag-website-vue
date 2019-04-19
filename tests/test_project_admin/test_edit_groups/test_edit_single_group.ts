import APIErrors from '@/components/api_errors.vue';
import EditSingleGroup from '@/components/project_admin/edit_groups/edit_single_group.vue';
import ValidatedInput from '@/components/validated_input.vue';
import { config, mount, Wrapper } from '@vue/test-utils';
import {
    Course,
    Group,
    Project,
    Semester,
    UltimateSubmissionPolicy
} from 'ag-client-typescript';
import { AxiosError } from 'axios';
import * as sinon from "sinon";

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('EditSingleGroup tests', () => {
    let wrapper: Wrapper<EditSingleGroup>;
    let component: EditSingleGroup;
    let course: Course;
    let group: Group;
    let project: Project;
    let original_match_media: (query: string) => MediaQueryList;

    beforeEach(() => {
        course = new Course({
            pk: 1, name: 'EECS 280', semester: Semester.winter, year: 2019, subtitle: '',
            num_late_days: 0, allowed_guest_domain: '@cornell.edu', last_modified: ''
        });

        group = new Group({
            pk: 1,
            project: 2,
            extended_due_date: "2019-04-18T15:26:06.965696Z",
            member_names: [
                "kevin@cornell.edu",
                "oscar@cornell.edu"
            ],
            bonus_submissions_remaining: 0,
            late_days_used: {"oscar@cornell.edu": 2},
            num_submissions: 3,
            num_submits_towards_limit: 2,
            created_at: "9am",
            last_modified: "10am"
        });

        project = new Project({
            pk: 2,
            name: "Project 1 - Statistics",
            last_modified: "today",
            course: 1,
            visible_to_students: true,
            closing_time: null,
            soft_closing_time: null,
            disallow_student_submissions: true,
            disallow_group_registration: true,
            guests_can_submit: true,
            min_group_size: 2,
            max_group_size: 3,
            submission_limit_per_day: null,
            allow_submissions_past_limit: true,
            groups_combine_daily_submissions: false,
            submission_limit_reset_time: "",
            submission_limit_reset_timezone: "",
            num_bonus_submissions: 1,
            total_submission_limit: null,
            allow_late_days: true,
            ultimate_submission_policy: UltimateSubmissionPolicy.best,
            hide_ultimate_submission_fdbk: false
        });

        original_match_media = window.matchMedia;
        Object.defineProperty(window, "matchMedia", {
            value: jest.fn(() => {
                return {matches: true};
            })
        });

        let get_course_by_pk_stub = sinon.stub(Course, 'get_by_pk');
        get_course_by_pk_stub.returns(Promise.resolve(course));

        wrapper = mount(EditSingleGroup, {
            propsData: {
                project: project,
                group: group
            }
        });
        component = wrapper.vm;
    });

    afterEach(() => {
        Object.defineProperty(window, "matchMedia", {
            value: original_match_media
        });

        sinon.restore();

        if (wrapper.exists()) {
            wrapper.destroy();
        }
    });

    test('If the extended due date of the group passed in is not null, has extension is ' +
         'set to true',
         async () => {
        expect(component.min_group_size).toEqual(project.min_group_size);
        expect(component.max_group_size).toEqual(project.max_group_size);
        expect(component.d_group.member_names[0]).toEqual(group.member_names[0]);
        expect(component.d_group.member_names[1]).toEqual(group.member_names[1]);
        expect(component.d_group.bonus_submissions_remaining).toEqual(
            group.bonus_submissions_remaining
        );
        expect(component.allowed_guest_domain).toEqual(course.allowed_guest_domain);
        expect(component.has_extension).toBe(true);
    });

    test('A group must have at least one member', async () => {
        expect(component.d_group.member_names.length).toEqual(2);
        expect(wrapper.findAll({ref: 'member_name_input'}).length).toEqual(2);

        let delete_member_2_button = wrapper.findAll(".remove-member-button").at(1);
        delete_member_2_button.trigger('click');

        expect(component.d_group.member_names.length).toEqual(1);
        expect(wrapper.findAll({ref: 'member_name_input'}).length).toEqual(1);

        let delete_only_member_button = wrapper.findAll(".remove-member-button").at(0);
        delete_only_member_button.trigger('click');

        expect(component.d_group.member_names.length).toEqual(1);
        expect(wrapper.findAll({ref: 'member_name_input'}).length).toEqual(1);
    });

    test('A group can have at most max_group_size members', async () => {
        expect(component.d_group.member_names.length).toEqual(2);
        expect(wrapper.findAll({ref: 'member_name_input'}).length).toEqual(2);

        wrapper.find(".add-member-button").trigger('click');

        expect(component.d_group.member_names.length).toEqual(3);
        expect(wrapper.findAll({ref: 'member_name_input'}).length).toEqual(3);

        wrapper.find(".add-member-button").trigger('click');
        await component.$nextTick();

        expect(component.d_group.member_names.length).toEqual(3);
        expect(wrapper.findAll({ref: 'member_name_input'}).length).toEqual(3);
    });

    test('Member names cannot be empty', async () => {
        let member_name_inputs = wrapper.findAll({ref: 'member_name_input'});

        let member_1_name_input = member_name_inputs.at(0).find('#input');
        let member_1_name_validator = <ValidatedInput> wrapper.findAll(
            { ref: "member_name_input" }
        ).at(0).vm;
        (<HTMLInputElement> member_1_name_input.element).value = "";
        member_1_name_input.trigger('input');
        await component.$nextTick();

        expect(member_1_name_validator.is_valid).toBe(false);
    });

    test('bonus_submissions_remaining cannot be a negative number', async () => {
        let bonus_submissions_input = wrapper.find(
            {ref: 'bonus_submissions_remaining_input'}
        ).find("#input");
        let bonus_submissions_validator = <ValidatedInput> wrapper.find(
            {ref: 'bonus_submissions_remaining_input'}
        ).vm;
        (<HTMLInputElement> bonus_submissions_input.element).value = "-4";
        bonus_submissions_input.trigger('input');
        await component.$nextTick();

        expect(bonus_submissions_validator.is_valid).toBe(false);
    });

    test('bonus_submissions_remaining cannot be empty or not a number', async () => {
        let bonus_submissions_input = wrapper.find(
            {ref: 'bonus_submissions_remaining_input'}
        ).find("#input");
        let bonus_submissions_validator = <ValidatedInput> wrapper.find(
            {ref: 'bonus_submissions_remaining_input'}
        ).vm;
        (<HTMLInputElement> bonus_submissions_input.element).value = "";
        bonus_submissions_input.trigger('input');
        await component.$nextTick();

        expect(bonus_submissions_validator.is_valid).toBe(false);

        (<HTMLInputElement> bonus_submissions_input.element).value = "scranton";
        bonus_submissions_input.trigger('input');
        await component.$nextTick();

        expect(bonus_submissions_validator.is_valid).toBe(false);
    });

    // update bonus submissions remaining, extension
    test('Successful call to Group.save after updating member names', async () => {
        let save_group_stub = sinon.stub(component.d_group,  'save');

        let member_name_inputs = wrapper.findAll({ref: 'member_name_input'});

        let member_1_name_input = member_name_inputs.at(0).find('#input');
        (<HTMLInputElement> member_1_name_input.element).value = "stanley@cornell.edu";
        member_1_name_input.trigger('input');
        await component.$nextTick();

        let member_2_name_input = member_name_inputs.at(1).find('#input');
        (<HTMLInputElement> member_2_name_input.element).value = "phyllis@cornell.edu";
        member_2_name_input.trigger('input');
        await component.$nextTick();

        wrapper.find({ref: 'edit_group_form'}).trigger('submit.native');
        await component.$nextTick();

        expect(save_group_stub.calledOnce);
        expect(save_group_stub.firstCall.thisValue).toEqual(component.d_group);
    });


    test('Call to save without an extension', async () => {
        let save_group_stub = sinon.stub(component.d_group,  'save');

        component.has_extension = false;
        await component.$nextTick();

        wrapper.find({ref: 'edit_group_form'}).trigger('submit.native');
        await component.$nextTick();

        expect(save_group_stub.calledOnce);
        expect(save_group_stub.firstCall.thisValue.extended_due_date).toBeNull();
    });

    // this should start out with a group with no extension - perhaps different describe block
    test.skip('Call to save with an extension', async () => {
        let save_group_stub = sinon.stub(component.d_group,  'save');

        wrapper.find({ref: 'edit_group_form'}).trigger('submit.native');
        await component.$nextTick();

        expect(save_group_stub.calledOnce);
        expect(save_group_stub.firstCall.thisValue.extended_due_date).toEqual(
            group.extended_due_date
        );
    });

    test('Group member must be enrolled in course - violates condition', async () => {
        let save_group_stub = sinon.stub(component.d_group,  'save');
        let axios_response_instance: AxiosError = {
            name: 'AxiosError',
            message: 'u heked up',
            response: {
                data: {
                    __all__: "Error in \"members\": This project only accepts submissions " +
                             "from enrolled students."
                },
                status: 400,
                statusText: 'OK',
                headers: {},
                request: {},
                config: {}
            },
            config: {},
        };
        save_group_stub.returns(Promise.reject(axios_response_instance));

        let member_name_inputs = wrapper.findAll({ref: 'member_name_input'});

        let member_1_name_input = member_name_inputs.at(0).find('#input');
        (<HTMLInputElement> member_1_name_input.element).value = "michael@cornell.edu";
        member_1_name_input.trigger('input');
        await component.$nextTick();

        let member_2_name_input = member_name_inputs.at(1).find('#input');
        (<HTMLInputElement> member_2_name_input.element).value = "ryan@cornell.edu";
        member_2_name_input.trigger('input');
        await component.$nextTick();

        wrapper.find({ref: 'edit_group_form'}).trigger('submit.native');
        await component.$nextTick();

        let api_errors = <APIErrors> wrapper.find({ref: 'api_errors'}).vm;
        expect(api_errors.d_api_errors.length).toBe(1);
        expect(save_group_stub.calledOnce);
    });

    test("When the prop 'group' changes in the parent component, d_group is updated",
         async () => {
        let different_group =   new Group({
            pk: 2,
            project: 2,
            extended_due_date: null,
            member_names: [
                "kelly@cornell.edu",
                "erin@cornell.edu"
            ],
            bonus_submissions_remaining: 0,
            late_days_used: {},
            num_submissions: 3,
            num_submits_towards_limit: 2,
            created_at: "9am",
            last_modified: "11am"
         });

        await component.$nextTick();

        expect(component.d_group).toEqual(group);

        wrapper.setProps({group: different_group});
        await component.$nextTick();

        expect(component.d_group).toEqual(different_group);
        expect(component.has_extension).toBe(false);
    });
});
