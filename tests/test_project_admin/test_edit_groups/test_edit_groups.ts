import APIErrors from '@/components/api_errors.vue';
import EditSingleGroup from '@/components/project_admin/edit_groups/create_single_group.vue';
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

jest.mock('file-saver');

describe('EditSingleGroup tests', () => {
    let wrapper: Wrapper<EditSingleGroup>;
    let component: EditSingleGroup;
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

        wrapper = mount(EditSingleGroup, {
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

    });

    test('A minimum of 1 member name fields can be edited to create a group',
         async () => {

    });

    test('A maximum of max_group_size member name fields can be edited to create a group',
         async () => {

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

    });
});
