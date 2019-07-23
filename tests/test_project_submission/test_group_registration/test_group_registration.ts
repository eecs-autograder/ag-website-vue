import { mount, Wrapper } from '@vue/test-utils';

import { Course, Project, Semester, UltimateSubmissionPolicy } from 'ag-client-typescript';
import * as sinon from 'sinon';

import GroupRegistration from '@/components/project_submission/group_registration/group_registration.vue';

describe('GroupRegistration tests', () => {
    let wrapper: Wrapper<GroupRegistration>;
    let component: GroupRegistration;
    let project: Project;
    let course: Course;

    beforeEach(() => {
        project = new Project({
            pk: 44,
            name: "Project 200",
            last_modified: "today",
            course: 2,
            visible_to_students: true,
            closing_time: null,
            soft_closing_time: null,
            disallow_student_submissions: true,
            disallow_group_registration: true,
            guests_can_submit: true,
            min_group_size: 1,
            max_group_size: 1,
            submission_limit_per_day: null,
            allow_submissions_past_limit: true,
            groups_combine_daily_submissions: false,
            submission_limit_reset_time: "",
            submission_limit_reset_timezone: "",
            num_bonus_submissions: 1,
            total_submission_limit: null,
            allow_late_days: true,
            ultimate_submission_policy: UltimateSubmissionPolicy.best,
            hide_ultimate_submission_fdbk: false,
            instructor_files: [],
            expected_student_files: [],
            has_handgrading_rubric: false
        });

        course = new Course({
            pk: 1, name: 'EECS 280', semester: Semester.winter, year: 2019, subtitle: '',
            num_late_days: 0, allowed_guest_domain: '', last_modified: ''
        });

        wrapper = mount(GroupRegistration, {
            propsData: {
                project: project,
                course: course
            }
        });
        component = wrapper.vm;
    });

    afterEach(() => {
        sinon.restore();
    });

    test('first test', () => {
        expect(true).toBe(true);
        // Error in "invited_users": You cannot send an invitation to yourself
    });
});
