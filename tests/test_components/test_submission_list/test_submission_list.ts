import { mount, Wrapper } from '@vue/test-utils';

import * as ag_cli from 'ag-client-typescript';
import * as sinon from 'sinon';

import SubmissionList from '@/components/submission_list/submission_list.vue';
import SubmissionPanel from '@/components/submission_list/submission_panel.vue';
import * as utils from '@/utils';


import * as data_ut from '@/tests/data_utils';
import { wait_fixed, wait_for_load } from '@/tests/utils';
import { MutantHintService } from '@/components/project_view/submission_detail/mutant_hints/mutant_hint_service';

let user: ag_cli.User;
let course: ag_cli.Course;
let project: ag_cli.Project;
let group: ag_cli.Group;

let get_submissions_with_results_stub: sinon.SinonStub;
let get_submissions_stub: sinon.SinonStub;
let get_ultimate_submission_stub: sinon.SinonStub;
let get_submission_result_stub: sinon.SinonStub;
let get_all_unlocked_hints_stub: sinon.SinonStub;

beforeEach(() => {
    user = data_ut.make_user();
    data_ut.set_global_current_user(user);

    course = data_ut.make_course();
    project = data_ut.make_project(course.pk);
    group = data_ut.make_group(project.pk, 1, {member_names: [user.username]});

    get_submissions_with_results_stub = sinon.stub(
        ag_cli.Submission, 'get_all_from_group_with_results').rejects();
    get_submissions_stub = sinon.stub(ag_cli.Submission, 'get_all_from_group').rejects();

    get_ultimate_submission_stub = sinon.stub(
        ag_cli.Submission, 'get_final_graded_submission_from_group'
    ).rejects(new ag_cli.HttpError(403, ''));
    get_submission_result_stub = sinon.stub(
        ag_cli.SubmissionResults, 'get_submission_result').rejects();

        get_all_unlocked_hints_stub = sinon.stub(
            MutantHintService, 'get_all_unlocked_hints'
        ).resolves([]);
});

describe('Submission list tests', () => {
    test('Initialization with no submissions', async () => {
        get_submissions_with_results_stub.withArgs(group.pk).resolves([]);
        let wrapper = mount(SubmissionList, {
            propsData: {
                course: course,
                project: project,
                group: group,
            }
        });
        expect(await wait_for_load(wrapper)).toBe(true);

        expect(wrapper.findAllComponents({name: 'SubmissionPanel'}).length).toEqual(0);
        expect(wrapper.findAll('.active').length).toEqual(0);
        expect(wrapper.vm.d_selected_submission).toBeNull();
        expect(wrapper.vm.d_ultimate_submission).toBeNull();
        expect(wrapper.vm.d_submissions).toEqual([]);
    });

    test('submission_detail is not visible when d_selected_submission === null', async () => {
        get_submissions_with_results_stub.withArgs(group.pk).resolves([]);
        let wrapper = mount(SubmissionList, {
            propsData: {
                course: course,
                project: project,
                group: group,
            }
        });
        expect(await wait_for_load(wrapper)).toBe(true);

        expect(wrapper.findComponent({ref: 'submission_detail'}).exists()).toBe(false);
    });

    test('submission_detail is not visible when d_selected_submission !== null', async () => {
        let submission3 = data_ut.make_submission_with_results(group);
        let submission2 = data_ut.make_submission_with_results(group);
        let submission1 = data_ut.make_submission_with_results(group);
        get_submissions_with_results_stub.withArgs(group.pk).resolves(
            [submission1, submission2, submission3]);

        let wrapper = mount(SubmissionList, {
            propsData: {
                course: course,
                project: project,
                group: group,
            }
        });
        expect(await wait_for_load(wrapper)).toBe(true);

        expect(wrapper.vm.d_selected_submission).toEqual(submission1);
        expect(wrapper.findComponent({ref: 'submission_detail'}).exists()).toBe(true);
    });

    test('received submission selected on load', () => {
        let received = data_ut.make_submission_with_results(
            group, {status: ag_cli.GradingStatus.received});
        let finished = data_ut.make_submission_with_results(group);
        get_ultimate_submission_stub.resolves(new ag_cli.Submission(finished));
        get_submission_result_stub.resolves(finished.results);
        return do_initially_selected_submission_test([finished, received], received, true);
    });

    test('queued submission selected on load', () => {
        let queued = data_ut.make_submission_with_results(
            group, {status: ag_cli.GradingStatus.queued});
        let finished = data_ut.make_submission_with_results(group);
        get_ultimate_submission_stub.resolves(new ag_cli.Submission(finished));
        get_submission_result_stub.resolves(finished.results);
        return do_initially_selected_submission_test([finished, queued], queued, true);
    });

    test('being_graded submission selected on load', () => {
        let being_graded = data_ut.make_submission_with_results(
            group, {status: ag_cli.GradingStatus.being_graded});
        let finished = data_ut.make_submission_with_results(group);
        get_ultimate_submission_stub.resolves(new ag_cli.Submission(finished));
        get_submission_result_stub.resolves(finished.results);
        return do_initially_selected_submission_test([finished, being_graded], being_graded, true);
    });

    test('Most recent submission selected on load if no ultimate or new submission', () => {
        let submission3 = data_ut.make_submission_with_results(group);
        let submission2 = data_ut.make_submission_with_results(group);
        let submission1 = data_ut.make_submission_with_results(group);

        return do_initially_selected_submission_test(
            [submission1, submission2, submission3], submission1);
    });

    async function do_initially_selected_submission_test(
        submissions: ag_cli.SubmissionWithResults[],
        expected: ag_cli.SubmissionWithResults,
        has_ultimate_submission = false
    ) {
        get_submissions_with_results_stub.withArgs(group.pk).resolves(submissions);

        let wrapper = mount(SubmissionList, {
            propsData: {
                course: course,
                project: project,
                group: group,
            }
        });

        expect(await wait_for_load(wrapper)).toBe(true);

        expect(wrapper.findAllComponents({name: 'SubmissionPanel'}).length).toEqual(
            has_ultimate_submission ? submissions.length + 1 : submissions.length);
        expect(wrapper.findAll('.active').length).toEqual(1);
        expect(wrapper.vm.d_selected_submission).toEqual(expected);
    }

    test('Group input change', async () => {
        let current_group_submission = data_ut.make_submission_with_results(group);
        get_submissions_with_results_stub.withArgs(group.pk).resolves([current_group_submission]);
        // We need to make sure that the ultimate submission is reset
        // to null if unavailable for the new group.
        get_ultimate_submission_stub.withArgs(group.pk).resolves(
            new ag_cli.Submission(current_group_submission));
        get_submission_result_stub.withArgs(
            current_group_submission.pk, ag_cli.FeedbackCategory.ultimate_submission
        ).resolves(current_group_submission.results);

        let other_group = data_ut.make_group(project.pk);
        let other_group_submission2 = data_ut.make_submission_with_results(other_group);
        let other_group_submission = data_ut.make_submission_with_results(other_group);
        get_submissions_with_results_stub.withArgs(other_group.pk).resolves(
            [other_group_submission, other_group_submission2]);

        let wrapper = mount(SubmissionList, {
            propsData: {
                course: course,
                project: project,
                group: group,
            }
        });
        expect(await wait_for_load(wrapper)).toBe(true);
        expect(await wait_for_load(wrapper)).toBe(true);

        expect(wrapper.findAllComponents({name: 'SubmissionPanel'}).length).toEqual(2);
        expect(
            wrapper.findAll('[data-testid=all_submissions_submission_panel]').length
        ).toEqual(1);
        expect(wrapper.vm.d_submissions).toEqual([current_group_submission]);

        await wrapper.setProps({group: other_group});
        expect(await wait_for_load(wrapper)).toBe(true);

        expect(wrapper.findAllComponents({name: 'SubmissionPanel'}).length).toEqual(2);
        expect(
            wrapper.findAll('[data-testid=all_submissions_submission_panel]').length
        ).toEqual(2);
        expect(wrapper.vm.d_submissions).toEqual(
            [other_group_submission, other_group_submission2]);

        expect(wrapper.vm.d_selected_submission).toEqual(other_group_submission);
        expect(wrapper.vm.d_ultimate_submission).toBeNull();
    });

    test('update_submission_created', async () => {
        let submission = data_ut.make_submission_with_results(group);
        get_submissions_with_results_stub.withArgs(group.pk).resolves([submission]);

        let wrapper = mount(SubmissionList, {
            propsData: {
                course: course,
                project: project,
                group: group,
            }
        });
        expect(await wait_for_load(wrapper)).toBe(true);

        expect(wrapper.findAllComponents({name: 'SubmissionPanel'}).length).toEqual(1);
        expect(wrapper.vm.d_submissions).toEqual([submission]);

        // This update can only happen when we create a new submission locally,
        // so we just populate it with empty results.
        let new_submission_with_results = data_ut.make_submission_with_results(group);

        let new_submission = new ag_cli.Submission(new_submission_with_results);
        ag_cli.Submission.notify_submission_created(new_submission);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_submissions).toEqual([new_submission_with_results, submission]);
        expect(wrapper.findAllComponents({name: 'SubmissionPanel'}).length).toEqual(2);
        expect(wrapper.vm.d_selected_submission).toEqual(new_submission_with_results);
    });

    test('update_submission_changed', async () => {
        let submissions = [
            data_ut.make_submission_with_results(
                group, {status: ag_cli.GradingStatus.finished_grading}),
            data_ut.make_submission_with_results(group, {status: ag_cli.GradingStatus.queued}),
        ];
        get_submissions_with_results_stub.withArgs(group.pk).resolves(submissions);

        let wrapper = mount(SubmissionList, {
            propsData: {
                course: course,
                project: project,
                group: group,
            }
        });
        expect(await wait_for_load(wrapper)).toBe(true);
        expect(wrapper.findAllComponents({name: 'SubmissionPanel'}).length).toEqual(2);

        let removed_submission = new ag_cli.Submission(submissions[1]);
        removed_submission.status = ag_cli.GradingStatus.removed_from_queue;

        ag_cli.Submission.notify_submission_changed(removed_submission);
        expect(wrapper.vm.d_submissions[0].status).toEqual(ag_cli.GradingStatus.finished_grading);
        expect(wrapper.vm.d_submissions[1].status).toEqual(
            ag_cli.GradingStatus.removed_from_queue);
    });

    test('Submission updates from other group ignored', async () => {
        get_submissions_with_results_stub.withArgs(group.pk).resolves([]);

        let wrapper = mount(SubmissionList, {
            propsData: {
                course: course,
                project: project,
                group: group,
            }
        });
        expect(await wait_for_load(wrapper)).toBe(true);

        let other_group = data_ut.make_group(project.pk);
        let other_submission = data_ut.make_submission(other_group);
        ag_cli.Submission.notify_submission_created(other_submission);
        ag_cli.Submission.notify_submission_changed(other_submission);

        expect(wrapper.vm.d_submissions).toEqual([]);
    });
});

describe('Ultimate submission tests', () => {
    describe('Ultimate submission available tests', () => {
        let ultimate_submission_with_results: ag_cli.SubmissionWithResults;
        let ultimate_submission: ag_cli.Submission;
        let submission: ag_cli.SubmissionWithResults;

        beforeEach(() => {
            ultimate_submission_with_results = data_ut.make_submission_with_results(
                group, {}, {total_points: 24, total_points_possible: 38});
            ultimate_submission = new ag_cli.Submission(ultimate_submission_with_results);
            submission = data_ut.make_submission_with_results(group);
            get_submissions_with_results_stub.withArgs(group.pk).resolves(
                [submission, ultimate_submission_with_results]);

            get_ultimate_submission_stub.withArgs(group.pk).resolves(
                new ag_cli.Submission(ultimate_submission_with_results)
            );
            get_submission_result_stub.withArgs(
                ultimate_submission_with_results.pk, ag_cli.FeedbackCategory.ultimate_submission
            ).resolves(ultimate_submission_with_results.results);
        });

        test('Ultimate submission fdbk results requested for non-staff', async () => {
            data_ut.set_global_user_roles(data_ut.make_user_roles({is_student: true}));
            let wrapper = mount(SubmissionList, {
                propsData: {
                    course: course,
                    project: project,
                    group: group,
                }
            });
            expect(await wait_for_load(wrapper)).toBe(true);
            check_data(wrapper);
            expect(get_submission_result_stub.calledOnce).toBe(true);
        });

        test('Results from submissions with results used for staff', async () => {
            data_ut.set_global_user_roles(data_ut.make_user_roles({is_staff: true}));
            let wrapper = mount(SubmissionList, {
                propsData: {
                    course: course,
                    project: project,
                    group: group,
                }
            });
            expect(await wait_for_load(wrapper)).toBe(true);
            check_data(wrapper);
            expect(get_submission_result_stub.calledOnce).toBe(false);
        });

        function check_data(wrapper: Wrapper<SubmissionList>) {
            expect(wrapper.vm.d_ultimate_submission).toEqual(ultimate_submission_with_results);

            // Ultimate submission shows up once on its own and once in "All Submissions"
            expect(wrapper.findAllComponents({name: 'SubmissionPanel'}).length).toEqual(3);
            expect(wrapper.findAll('.active').length).toEqual(2);
            expect(wrapper.vm.d_selected_submission).toEqual(ultimate_submission_with_results);

            expect(wrapper.vm.d_submissions).toEqual(
                [submission, ultimate_submission_with_results]);

            let ultimate_submission_regular_panel
                = <Wrapper<SubmissionPanel>> wrapper.findAllComponents(
                    {name: 'SubmissionPanel'}).at(2);
            expect(ultimate_submission_regular_panel.vm.submission).toEqual(
                ultimate_submission_with_results);
        }
    });

    test('403 response ignored', async () => {
        get_submissions_with_results_stub.resolves([]);
        get_ultimate_submission_stub.rejects(new ag_cli.HttpError(403, ''));
        let wrapper = mount(SubmissionList, {
            propsData: {
                course: course,
                project: project,
                group: group,
            }
        });
        expect(await wait_for_load(wrapper)).toBe(true);
        expect(wrapper.vm.d_ultimate_submission).toBeNull();
    });

    test('404 response ignored', async () => {
        get_submissions_with_results_stub.resolves([]);
        get_ultimate_submission_stub.rejects(new ag_cli.HttpError(404, ''));
        let wrapper = mount(SubmissionList, {
            propsData: {
                course: course,
                project: project,
                group: group,
            }
        });
        expect(await wait_for_load(wrapper)).toBe(true);
        expect(wrapper.vm.d_ultimate_submission).toBeNull();
    });
});

describe('Polling tests', () => {
    let submission: ag_cli.SubmissionWithResults;

    // We'll call this function whenever we want submission_list's poller to
    // wake up from sleeping.
    let resolve_sleep: () => void;
    let sleep_stub: sinon.SinonStub;

    beforeEach(() => {
        submission = data_ut.make_submission_with_results(group);

        sleep_stub = sinon.stub(utils, 'sleep').callsFake(() => {
            return new Promise((resolve, reject) => {
                resolve_sleep = resolve;
            });
        });
    });

    test('Submissions unchanged when refreshed, results not reloaded', async () => {
        get_submissions_stub.withArgs(group.pk).resolves([new ag_cli.Submission(submission)]);
        get_submissions_with_results_stub.withArgs(group.pk).resolves([submission]);

        let wrapper = mount(SubmissionList, {
            propsData: {
                course: course,
                project: project,
                group: group,
            }
        });
        expect(await wait_for_load(wrapper)).toBe(true);

        expect(wrapper.vm.d_submissions).toEqual([submission]);
        resolve_sleep();
        await wrapper.vm.$nextTick();

        expect(get_submissions_stub.calledOnce).toBe(true);
        expect(wrapper.vm.d_submissions).toEqual([submission]);
    });

    test('New submissions present when refreshed, results reloaded', async () => {
        let new_submission = data_ut.make_submission_with_results(group);
        get_submissions_stub.withArgs(group.pk).onFirstCall().resolves(
            [new ag_cli.Submission(new_submission), new ag_cli.Submission(submission)]
        );
        get_submissions_with_results_stub.withArgs(group.pk).onFirstCall().resolves(
            [submission]
        ).onSecondCall().resolves(
            [new_submission, submission]
        );

        let wrapper = mount(SubmissionList, {
            propsData: {
                course: course,
                project: project,
                group: group,
            }
        });
        expect(await wait_for_load(wrapper)).toBe(true);

        expect(wrapper.vm.d_submissions).toEqual([submission]);
        resolve_sleep();
        await wait_fixed(wrapper, 5);

        expect(get_submissions_stub.calledOnce).toBe(true);
        expect(wrapper.vm.d_submissions).toEqual([new_submission, submission]);
    });

    test('Submission last_modified changed when refreshed, results reloaded', async () => {
        submission.status = ag_cli.GradingStatus.being_graded;
        let new_last_modified_submission = new ag_cli.Submission(submission);
        let current_last_modified = new Date(submission.last_modified);
        current_last_modified.setHours(current_last_modified.getHours() + 1);
        new_last_modified_submission.last_modified = current_last_modified.toISOString();
        get_submissions_stub.withArgs(group.pk).onFirstCall().resolves(
            [new_last_modified_submission]
        );

        let submission_with_updated_results
            = <ag_cli.SubmissionWithResults> JSON.parse(JSON.stringify(submission));
        submission_with_updated_results.status = ag_cli.GradingStatus.finished_grading;
        submission_with_updated_results.results.total_points = 19;
        submission_with_updated_results.results.total_points_possible = 24;
        get_submissions_with_results_stub.withArgs(group.pk).onFirstCall().resolves(
            [submission]
        ).onSecondCall().resolves(
            [submission_with_updated_results]
        );

        let wrapper = mount(SubmissionList, {
            propsData: {
                course: course,
                project: project,
                group: group,
            }
        });
        expect(await wait_for_load(wrapper)).toBe(true);

        expect(wrapper.vm.d_submissions).toEqual([submission]);
        resolve_sleep();
        await wait_fixed(wrapper, 5);

        expect(get_submissions_stub.calledOnce).toBe(true);
        expect(wrapper.vm.d_submissions).toEqual([submission_with_updated_results]);
    });

    test('Group changed, old polling stopped and new polling started', async () => {
        get_submissions_with_results_stub.resolves([]);
        let wrapper = mount(SubmissionList, {
            propsData: {
                course: course,
                project: project,
                group: group,
            }
        });
        expect(await wait_for_load(wrapper)).toBe(true);

        let current_poller = wrapper.vm.plain_submissions_poller;
        expect(current_poller!.continue).toBe(true);

        let current_resolve_sleep = resolve_sleep;

        let new_group = data_ut.make_group(project.pk);
        await wrapper.setProps({group: new_group});
        expect(await wait_for_load(wrapper)).toBe(true);

        current_resolve_sleep();
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        expect(current_poller!.continue).toBe(false);
        expect(get_submissions_stub.notCalled).toBe(true);

        expect(wrapper.vm.plain_submissions_poller).not.toBe(current_poller);
        expect(wrapper.vm.plain_submissions_poller!.continue).toBe(true);
    });

    test('Current polling stopped on destroy', async () => {
        get_submissions_with_results_stub.resolves([]);
        let wrapper = mount(SubmissionList, {
            propsData: {
                course: course,
                project: project,
                group: group,
            }
        });
        expect(await wait_for_load(wrapper)).toBe(true);

        let current_poller = wrapper.vm.plain_submissions_poller;
        expect(current_poller!.continue).toBe(true);

        wrapper.destroy();

        resolve_sleep();
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();
        resolve_sleep();
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        expect(current_poller!.continue).toBe(false);
        expect(get_submissions_stub.notCalled).toBe(true);
    });
});
