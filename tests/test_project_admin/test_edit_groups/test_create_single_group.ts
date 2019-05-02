import APIErrors from '@/components/api_errors.vue';
import CreateSingleGroup from '@/components/project_admin/edit_groups/create_single_group.vue';
import ValidatedInput from '@/components/validated_input.vue';
import { config, mount, Wrapper } from '@vue/test-utils';
import {
    Course,
    Group,
    NewGroupData,
    Project,
    Semester,
    UltimateSubmissionPolicy
} from 'ag-client-typescript';
import { AxiosError } from 'axios';
import * as sinon from "sinon";

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('CreateSingleGroup tests', () => {
    let wrapper: Wrapper<CreateSingleGroup>;
    let component: CreateSingleGroup;
    let course: Course;
    let project: Project;
    let original_match_media: (query: string) => MediaQueryList;

    beforeEach(() => {

        course = new Course({
            pk: 1, name: 'EECS 280', semester: Semester.winter, year: 2019, subtitle: '',
            num_late_days: 0, allowed_guest_domain: '@cornell.edu', last_modified: ''
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

        wrapper = mount(CreateSingleGroup, {
            propsData: {
                project: project
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

    test('There are min_group_size number of editable member name fields at the time of ' +
         'creation',
         async () => {
        expect(component.min_group_size).toEqual(project.min_group_size);
        expect(component.max_group_size).toEqual(project.max_group_size);
        expect(component.group_members.length).toEqual(project.min_group_size);
        expect(component.allowed_guest_domain).toEqual(course.allowed_guest_domain);
        for (let i = 0; i < component.min_group_size; ++i) {
            expect(component.group_members[i].id).toEqual(i + 1);
            expect(component.group_members[i].username).toEqual(course.allowed_guest_domain);
        }
    });

    test('A minimum of 1 member name fields can be edited to create a group',
         async () => {
        expect(component.group_members.length).toEqual(2);
        expect(wrapper.findAll('.member-name-input').length).toEqual(2);

        let delete_member_2_button = wrapper.findAll(".remove-member-button").at(1);
        delete_member_2_button.trigger('click');

        expect(component.group_members.length).toEqual(1);
        expect(wrapper.findAll('.member-name-input').length).toEqual(1);

        let delete_only_member_button = wrapper.findAll(".remove-member-button").at(0);
        delete_only_member_button.trigger('click');

        expect(component.group_members.length).toEqual(1);
        expect(wrapper.findAll('.member-name-input').length).toEqual(1);
    });

    test('A maximum of max_group_size member name fields can be edited to create a group',
         async () => {
        expect(component.group_members.length).toEqual(2);
        expect(wrapper.findAll('.member-name-input').length).toEqual(2);

        wrapper.find(".add-member-button").trigger('click');
        await component.$nextTick();

        expect(component.group_members.length).toEqual(3);
        expect(wrapper.findAll('.member-name-input').length).toEqual(3);

        wrapper.find(".add-member-button").trigger('click');
        await component.$nextTick();

        expect(component.group_members.length).toEqual(3);
        expect(wrapper.findAll('.member-name-input').length).toEqual(3);
    });

    test('Successful creation of a group', async () => {
        let create_group_stub = sinon.stub(Group, 'create');
        let group_members = ["abernard@cornell.edu", "amartin@cornell.edu"];

        let member_name_inputs = wrapper.findAll('.member-name-input');

        let member_1_name_input = member_name_inputs.at(0);
        (<HTMLInputElement> member_1_name_input.element).value = group_members[0];
        member_1_name_input.trigger('input');
        await component.$nextTick();

        let member_2_name_input = member_name_inputs.at(1);
        (<HTMLInputElement> member_2_name_input.element).value = group_members[1];
        member_2_name_input.trigger('input');
        await component.$nextTick();

        wrapper.find({ref: 'create_group_form'}).trigger('submit.native');
        await component.$nextTick();

        expect(create_group_stub.firstCall.calledWith(
            project.pk, new NewGroupData({member_names: group_members})
        ));
    });

    test('Usernames of group members are trimmed before attempt to create group',
         async () => {
        let create_group_stub = sinon.stub(Group, 'create');
        let group_members = [
            "   abernard@cornell.edu  ",
            "  amartin@cornell.edu",
            "kelly@cornell.edu   "
        ];

        let trimmed_group_members = [
            "abernard@cornell.edu",
            "amartin@cornell.edu",
            "kelly@cornell.edu"
        ];

        wrapper.find(".add-member-button").trigger('click');
        await component.$nextTick();

        let member_name_inputs = wrapper.findAll('.member-name-input');

        let member_1_name_input = member_name_inputs.at(0);
        (<HTMLInputElement> member_1_name_input.element).value = group_members[0];
        member_1_name_input.trigger('input');
        await component.$nextTick();

        let member_2_name_input = member_name_inputs.at(1);
        (<HTMLInputElement> member_2_name_input.element).value = group_members[1];
        member_2_name_input.trigger('input');
        await component.$nextTick();

        let member_3_name_input = member_name_inputs.at(2);
        (<HTMLInputElement> member_3_name_input.element).value = group_members[2];
        member_3_name_input.trigger('input');
        await component.$nextTick();

        wrapper.find({ref: 'create_group_form'}).trigger('submit.native');
        await component.$nextTick();

        expect(create_group_stub.firstCall.calledWith(
            project.pk, new NewGroupData({member_names: trimmed_group_members})
        ));
    });

    test('Blank or incomplete member names are thrown out before create()', async () => {
        let create_group_stub = sinon.stub(Group, 'create');
        let group_members = [
            "    ",
            "  amartin@cornell.edu",
            component.allowed_guest_domain
        ];

        let creatable_group_members = [
            "amartin@cornell.edu"
        ];

        wrapper.find(".add-member-button").trigger('click');
        await component.$nextTick();

        let member_name_inputs = wrapper.findAll('.member-name-input');

        let member_1_name_input = member_name_inputs.at(0);
        (<HTMLInputElement> member_1_name_input.element).value = group_members[0];
        member_1_name_input.trigger('input');
        await component.$nextTick();

        let member_2_name_input = member_name_inputs.at(1);
        (<HTMLInputElement> member_2_name_input.element).value = group_members[1];
        member_2_name_input.trigger('input');
        await component.$nextTick();

        let member_3_name_input = member_name_inputs.at(2);
        (<HTMLInputElement> member_3_name_input.element).value = group_members[2];
        member_3_name_input.trigger('input');
        await component.$nextTick();

        wrapper.find({ref: 'create_group_form'}).trigger('submit.native');
        await component.$nextTick();

        expect(create_group_stub.firstCall.calledWith(
            project.pk, new NewGroupData({member_names: creatable_group_members})
        ));
    });

    test('Group member must be enrolled in course - violates condition', async () => {
        let create_group_stub = sinon.stub(Group, 'create');
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
        create_group_stub.returns(Promise.reject(axios_response_instance));

        let member_name_inputs = wrapper.findAll('.member-name-input');

        let member_1_name_input = member_name_inputs.at(0);
        (<HTMLInputElement> member_1_name_input.element).value = "sprinkles@cornell.edu";
        member_1_name_input.trigger('input');
        await component.$nextTick();

        let member_2_name_input = member_name_inputs.at(1);
        (<HTMLInputElement> member_2_name_input.element).value = "bandit@cornell.edu";
        member_2_name_input.trigger('input');
        await component.$nextTick();

        wrapper.find({ref: 'create_group_form'}).trigger('submit.native');
        await component.$nextTick();

        let api_errors = <APIErrors> wrapper.find({ref: 'api_errors'}).vm;
        expect(api_errors.d_api_errors.length).toBe(1);
    });
});
