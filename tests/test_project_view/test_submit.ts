import { mount, Wrapper } from '@vue/test-utils';

import { Course, GradingStatus, Group, HttpError, Project, Submission, User } from "ag-client-typescript";
// @ts-ignore
import moment from "moment";
import * as sinon from 'sinon';

import APIErrors from "@/components/api_errors.vue";
import Submit from '@/components/project_view/submit.vue';
import { format_datetime } from '@/utils';

import * as data_ut from '@/tests/data_utils';
import { compress_whitespace } from '@/tests/utils';

let current_user: User;
let course: Course;
let project: Project;
let group: Group;

let late_days_remaining: number;

beforeEach(() => {
    current_user = data_ut.make_user();
    course = data_ut.make_course();
    project = data_ut.make_project(course.pk);
    group = data_ut.make_group(project.pk, 1, {member_names: [current_user.username]});

    late_days_remaining = 0;

    data_ut.set_global_current_user(current_user);
    sinon.stub(User, 'get_num_late_days').withArgs(course.pk, current_user.pk).callsFake(() => {
        return Promise.resolve({late_days_remaining: late_days_remaining});
    });
});

afterEach(() => {
    sinon.restore();
});

describe('Deadline info tests', () => {
    test('Project has soft closing time, group has no extension', () => {
        project.soft_closing_time = moment([2018, 4, 18, 16, 33]).toISOString();

        const wrapper = mount(Submit, {
            propsData: {
                course: course,
                project: project,
                group: group,
            }
        });

        let deadline_text = wrapper.find('#deadline-text');
        expect(deadline_text.exists()).toBe(true);
        expect(deadline_text.text()).toContain('Due');
        expect(deadline_text.text()).toContain(format_datetime(project.soft_closing_time));

        expect(wrapper.find('#extension-text').exists()).toBe(false);
    });

    test('Soft closing time null', () => {
        const wrapper = mount(Submit, {
            propsData: {
                course: course,
                project: project,
                group: group,
            }
        });

        expect(wrapper.find('#deadline-text').exists()).toBe(false);
    });

    test('Group has extension', () => {
        group.extended_due_date = moment([2019, 5, 13, 18, 29]).toISOString();

        const wrapper = mount(Submit, {
            propsData: {
                course: course,
                project: project,
                group: group,
            }
        });

        let extension_text = wrapper.find('#extension-text');
        expect(extension_text.exists()).toBe(true);
        expect(extension_text.text()).toContain('Extension');
        expect(extension_text.text()).toContain(format_datetime(group.extended_due_date));
    });

    test('Current user used late day', async () => {
        group.late_days_used[current_user.username] = 1;
        const wrapper = mount(Submit, {
            propsData: {
                course: course,
                project: project,
                group: group,
            }
        });
        await wrapper.vm.$nextTick();

        let late_days_wrapper = wrapper.find('#late-days-used');
        expect(late_days_wrapper.exists()).toBe(true);
        expect(
            compress_whitespace(late_days_wrapper.text())
        ).toEqual('1 late day used on this project.');

        group.late_days_used[current_user.username] = 2;
        wrapper.vm.$forceUpdate();
        await wrapper.vm.$nextTick();

        expect(
            compress_whitespace(late_days_wrapper.text())
        ).toEqual('2 late days used on this project.');
    });
});

describe('Submit button text tests', () => {
    test('Submission would use late day', async () => {
        project.soft_closing_time = moment().subtract(3, 'h').toISOString();
        late_days_remaining = 1;

        const wrapper = mount(Submit, {
            propsData: {
                course: course,
                project: project,
                group: group,
            }
        });

        await wrapper.vm.$nextTick();

        let file_upload = wrapper.find({ref: 'submit_file_upload'});
        await file_upload.vm.$nextTick();
        expect(
            file_upload.vm.$slots.upload_button_text![0].text!.trim()
        ).toEqual('Submit (Use late day)');
    });

    test('Submission would use late day with extension', async () => {
        project.soft_closing_time = moment().subtract(3, 'h').toISOString();
        group.extended_due_date = moment(project.soft_closing_time).add(1, 'h').toISOString();
        late_days_remaining = 1;

        const wrapper = mount(Submit, {
            propsData: {
                course: course,
                project: project,
                group: group,
            }
        });

        await wrapper.vm.$nextTick();

        let file_upload = wrapper.find({ref: 'submit_file_upload'});
        await file_upload.vm.$nextTick();
        expect(
            file_upload.vm.$slots.upload_button_text![0].text!.trim()
        ).toEqual('Submit (Use late day)');
    });

    test('Submission would use late day with extension and late day used', async () => {
        project.soft_closing_time = moment().subtract(3, 'd').toISOString();
        group.extended_due_date = moment(project.soft_closing_time).add(1, 'd').toISOString();
        group.late_days_used[current_user.username] = 1;
        late_days_remaining = 1;

        const wrapper = mount(Submit, {
            propsData: {
                course: course,
                project: project,
                group: group,
            }
        });

        await wrapper.vm.$nextTick();

        let file_upload = wrapper.find({ref: 'submit_file_upload'});
        await file_upload.vm.$nextTick();
        expect(
            file_upload.vm.$slots.upload_button_text![0].text!.trim()
        ).toEqual('Submit (Use late day)');
    });

    test("Submission would use late day but project doesn't allow late days", async () => {
        project.soft_closing_time = moment().subtract(3, 'h').toISOString();
        project.allow_late_days = false;
        late_days_remaining = 1;

        const wrapper = mount(Submit, {
            propsData: {
                course: course,
                project: project,
                group: group,
            }
        });

        await wrapper.vm.$nextTick();

        let file_upload = wrapper.find({ref: 'submit_file_upload'});
        await file_upload.vm.$nextTick();
        expect(
            file_upload.vm.$slots.upload_button_text![0].text!.trim()
        ).toEqual('Submit');
    });

    test('Deadline past and user has no late days', async () => {
        project.soft_closing_time = moment().subtract(3, 'h').toISOString();

        const wrapper = mount(Submit, {
            propsData: {
                course: course,
                project: project,
                group: group,
            }
        });

        await wrapper.vm.$nextTick();

        let file_upload = wrapper.find({ref: 'submit_file_upload'});
        await file_upload.vm.$nextTick();
        expect(
            file_upload.vm.$slots.upload_button_text![0].text!.trim()
        ).toEqual('Submit');
    });

    test('Soft closing time is null', async () => {
        const wrapper = mount(Submit, {
            propsData: {
                course: course,
                project: project,
                group: group,
            }
        });

        await wrapper.vm.$nextTick();

        let file_upload = wrapper.find({ref: 'submit_file_upload'});
        await file_upload.vm.$nextTick();
        expect(
            file_upload.vm.$slots.upload_button_text![0].text!.trim()
        ).toEqual('Submit');
    });
});

describe('Group members tests', () => {
    test('Group size 1, no group members shown', () => {
        const wrapper = mount(Submit, {
            propsData: {
                course: course,
                project: project,
                group: group,
            }
        });
        expect(wrapper.find('#group-members-container').exists()).toBe(false);
    });

    test('Group size more than 1, group members shown', () => {
        group.member_names = ['llama@llama.net', 'ninja@ninja.net'];

        const wrapper = mount(Submit, {
            propsData: {
                course: course,
                project: project,
                group: group,
            }
        });

        expect(wrapper.findAll('.group-member').length).toEqual(2);
    });
});

describe('Submission limit, bonus submission, late day tests', () => {
    test('No submissions per day limit', () => {
        const wrapper = mount(Submit, {
            propsData: {
                course: course,
                project: project,
                group: group,
            }
        });

        expect(wrapper.find('#submissions-used').exists()).toBe(false);
    });

    test("Num submissions used, groups don't pool submissions", () => {
        project.submission_limit_per_day = 3;
        group.num_submits_towards_limit = 0;

        const wrapper = mount(Submit, {
            propsData: {
                course: course,
                project: project,
                group: group,
            }
        });

        expect(compress_whitespace(wrapper.find('#submissions-used').text())).toEqual(
            '0/3 submissions used today.'
        );
    });

    test('Num submissions used, groups pool submissions', () => {
        project.submission_limit_per_day = 3;
        project.groups_combine_daily_submissions = true;
        group.member_names = ['llama@llama.net', 'ninja@ninja.net'];
        group.num_submits_towards_limit = 2;

        const wrapper = mount(Submit, {
            propsData: {
                course: course,
                project: project,
                group: group,
            }
        });

        expect(compress_whitespace(wrapper.find('#submissions-used').text())).toEqual(
            '2/6 submissions used today.'
        );
    });

    test("Num submissions used towards total submission limit, project does not have a " +
         "total_submission_limit",
         () => {
        project.total_submission_limit = null;

        const wrapper = mount(Submit, {
            propsData: {
                course: course,
                project: project,
                group: group,
            }
        });

        expect(wrapper.find('#submissions-used-towards-limit').exists()).toBe(false);
    });

    test("Num submissions used towards total submission limit, project has a" +
         "total_submission_limit",
         () => {
        project.total_submission_limit = 10;
        group.num_submits_towards_limit = 4;

        const wrapper = mount(Submit, {
            propsData: {
                course: course,
                project: project,
                group: group,
            }
        });

        expect(compress_whitespace(wrapper.find('#submissions-used-towards-limit').text())).toEqual(
            '4/10 total submissions used (forever!).'
        );
    });

    test("Project doesn't allot bonus submissions, group has no bonus submissions", () => {
        const wrapper = mount(Submit, {
            propsData: {
                course: course,
                project: project,
                group: group,
            }
        });

        expect(wrapper.find('#bonus-submissions-remaining').exists()).toBe(false);
    });

    test('Project allots bonus submissions, groups num bonus submissions shown', () => {
        project.num_bonus_submissions = 2;
        group.bonus_submissions_remaining = 2;
        const wrapper = mount(Submit, {
            propsData: {
                course: course,
                project: project,
                group: group,
            }
        });

        expect(
            compress_whitespace(wrapper.find('#bonus-submissions-remaining').text())
        ).toEqual('2 bonus submissions remaining.');
    });

    test("Project doesn't allot bonus submissions, group has bonus submissions", () => {
        project.num_bonus_submissions = 0;
        group.bonus_submissions_remaining = 1;
        const wrapper = mount(Submit, {
            propsData: {
                course: course,
                project: project,
                group: group,
            }
        });

        expect(
            compress_whitespace(wrapper.find('#bonus-submissions-remaining').text())
        ).toEqual('1 bonus submission remaining.');
    });

    test("Course doesn't allot late days, user has no late days", async () => {
        const wrapper = mount(Submit, {
            propsData: {
                course: course,
                project: project,
                group: group,
            }
        });
        await wrapper.vm.$nextTick();
        expect(wrapper.find('#late-days-remaining').exists()).toBe(false);
    });

    test('Course allots late days, user late days shown', async () => {
        course.num_late_days = 2;
        late_days_remaining = 2;
        const wrapper = mount(Submit, {
            propsData: {
                course: course,
                project: project,
                group: group,
            }
        });
        await wrapper.vm.$nextTick();

        expect(
            compress_whitespace(wrapper.find('#late-days-remaining').text())
        ).toEqual('2 late days remaining.');
    });

    test("Course doesn't allot late days, user has late days", async () => {
        course.num_late_days = 0;
        late_days_remaining = 1;
        const wrapper = mount(Submit, {
            propsData: {
                course: course,
                project: project,
                group: group,
            }
        });
        await wrapper.vm.$nextTick();

        expect(
            compress_whitespace(wrapper.find('#late-days-remaining').text())
        ).toEqual('1 late day remaining.');
    });

    test("Course allots late days, project doesn't allow late days", async () => {
        course.num_late_days = 2;
        late_days_remaining = 2;
        project.allow_late_days = false;

        const wrapper = mount(Submit, {
            propsData: {
                course: course,
                project: project,
                group: group,
            }
        });
        await wrapper.vm.$nextTick();
        expect(wrapper.find('#late-days-remaining').exists()).toBe(false);
    });
});

describe('Submitted file validation tests', () => {
    beforeEach(() => {
        project.expected_student_files = [
            data_ut.make_expected_student_file(project.pk, 'required'),
            data_ut.make_expected_student_file(
                project.pk, 'too_many_*', {min_num_matches: 0, max_num_matches: 2}),
            data_ut.make_expected_student_file(
                project.pk, 'too_few_*', {min_num_matches: 1, max_num_matches: 2})
        ];
    });

    test('Only required files submitted', async () => {
        let files = [
            new File(['spam'], 'required'),
            new File(['spam'], 'too_few_1'),
        ];

        const wrapper = mount(Submit, {
            propsData: {
                course: course,
                project: project,
                group: group,
            }
        });

        let file_upload = wrapper.find({ref: 'submit_file_upload'});
        file_upload.vm.$emit('upload_files', files);

        await wrapper.vm.$nextTick();

        expect(wrapper.findAll('.file-list-header').length).toEqual(1);
        expect(wrapper.findAll('.file-list-header').at(0).text()).toEqual('Files to submit');

        expect(wrapper.findAll('.file-list').length).toEqual(1);
        let file_list = wrapper.findAll('.file-list').at(0);
        expect(file_list.findAll('li').length).toEqual(2);
        expect(file_list.findAll('li').at(0).text()).toEqual('required');
        expect(file_list.findAll('li').at(1).text()).toEqual('too_few_1');

        let submit_button = wrapper.find({ref: 'submit_button'});
        expect(submit_button.text().trim()).toEqual('Submit');
        expect(submit_button.is('[disabled]')).toBe(false);
    });

    test('Extra and missing files', async () => {
        let files = [
            new File(['spam'], 'too_many_1'),
            new File(['spam'], 'too_many_2'),
            new File(['spam'], 'too_many_3'),
            new File(['spam'], 'unexpected'),
        ];

        const wrapper = mount(Submit, {
            propsData: {
                course: course,
                project: project,
                group: group,
            }
        });

        let file_upload = wrapper.find({ref: 'submit_file_upload'});
        file_upload.vm.$emit('upload_files', files);

        await wrapper.vm.$nextTick();

        expect(wrapper.findAll('.file-list-header').at(0).text()).toEqual('Files to submit');

        let submitted_files = wrapper.findAll('.file-list').at(0);
        expect(submitted_files.findAll('li').length).toEqual(4);
        expect(submitted_files.findAll('li').at(0).text()).toEqual('too_many_1');
        expect(submitted_files.findAll('li').at(1).text()).toEqual('too_many_2');
        expect(submitted_files.findAll('li').at(2).text()).toEqual('too_many_3');
        expect(submitted_files.findAll('li').at(3).text()).toEqual('unexpected');

        let missing_files = wrapper.findAll('.file-list').at(1);
        expect(missing_files.findAll('li').length).toEqual(2);
        expect(missing_files.findAll('li').at(0).text()).toEqual('required');
        expect(compress_whitespace(missing_files.findAll('li').at(1).text())).toEqual(
            'Expected at least 1 file(s) matching the pattern too_few_* but got 0'
        );

        let unexpected_files = wrapper.findAll('.file-list').at(2);
        expect(unexpected_files.findAll('li').length).toEqual(2);
        expect(unexpected_files.findAll('li').at(0).text()).toEqual('unexpected');
        expect(compress_whitespace(unexpected_files.findAll('li').at(1).text())).toEqual(
            'Expected no more than 2 file(s) matching the pattern too_many_* but got 3'
        );

        let submit_button = wrapper.find({ref: 'submit_button'});
        expect(submit_button.text().trim()).toEqual('Submit Anyway');
        expect(submit_button.is('[disabled]')).toBe(false);
    });
});

describe('Submit tests', () => {
    let submit_stub: sinon.SinonStub;

    beforeEach(() => {
        project.expected_student_files = [
            data_ut.make_expected_student_file(project.pk, 'required'),
        ];

        submit_stub = sinon.stub(Submission, 'create');
    });

    test('Submit with no missing files', async () => {
        submit_stub.callsFake(
            (group_pk: number, files: File[], callback?: (event: ProgressEvent) => void) => {
                // tslint:disable-next-line: no-object-literal-type-assertion
                callback!(<ProgressEvent> {lengthComputable: true, loaded: 20, total: 20});
                return Promise.resolve(new Submission({
                    pk: 42,
                    group: group_pk,
                    timestamp: moment().toISOString(),
                    submitter: current_user.username,
                    submitted_filenames: files.map((file) => file.name),
                    discarded_files: [],
                    missing_files: {},
                    status: GradingStatus.received,
                    count_towards_daily_limit: true,
                    is_past_daily_limit: false,
                    is_bonus_submission: false,
                    count_towards_total_limit: true,
                    does_not_count_for: [],
                    position_in_queue: 0,
                    last_modified: moment().toISOString(),
                }));
            }
        );

        const wrapper = mount(Submit, {
            propsData: {
                course: course,
                project: project,
                group: group,
            }
        });
        // Make sure that this variable is reset when we submit.
        expect(wrapper.vm.d_submit_progress).toEqual(0);
        wrapper.vm.d_submit_progress = 20;

        let files_to_submit = [new File(['spam'], 'required')];
        let file_upload = wrapper.find({ref: 'submit_file_upload'});
        file_upload.vm.$emit('upload_files', files_to_submit);

        await wrapper.vm.$nextTick();

        // Make sure that this variable is reset when we submit.
        expect(wrapper.vm.d_submit_progress).toEqual(0);

        let submit_button = wrapper.find({ref: 'submit_button'});
        submit_button.trigger('click');
        await wrapper.vm.$nextTick();

        expect(submit_stub.calledWith(group.pk, files_to_submit)).toBe(true);
        expect(wrapper.vm.d_submit_progress).toEqual(100);

        expect(wrapper.find({ref: 'confirm_submit_modal'}).exists()).toBe(false);

        expect(wrapper.emitted().submitted.length).toEqual(1);
    });

    test('Submit API error', async () => {
        submit_stub.returns(
            Promise.reject(
                new HttpError(400, {'submission': "Wait for ur submit to finish plz"})
            )
        );

        const wrapper = mount(Submit, {
            propsData: {
                course: course,
                project: project,
                group: group,
            }
        });

        let file_upload = wrapper.find({ref: 'submit_file_upload'});
        file_upload.vm.$emit('upload_files', []);

        await wrapper.vm.$nextTick();

        let submit_button = wrapper.find({ref: 'submit_button'});
        submit_button.trigger('click');
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        let api_errors = <Wrapper<APIErrors>> wrapper.find({ref: 'api_errors'});
        expect(api_errors.vm.d_api_errors.length).toBe(1);
        expect(submit_stub.calledOnce).toBe(true);

        expect(wrapper.find({ref: 'confirm_submit_modal'}).exists()).toBe(true);
    });

    test('Cancel submit', async () => {
        const wrapper = mount(Submit, {
            propsData: {
                course: course,
                project: project,
                group: group,
            }
        });

        wrapper.find({ref: 'submit_file_upload'}).vm.$emit('upload_files', []);
        await wrapper.vm.$nextTick();
        expect(wrapper.find({ref: 'confirm_submit_modal'}).exists()).toBe(true);

        wrapper.find({ref: 'cancel_submit_button'}).trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.find({ref: 'confirm_submit_modal'}).exists()).toBe(false);
        expect(submit_stub.calledOnce).toBe(false);
    });
});
