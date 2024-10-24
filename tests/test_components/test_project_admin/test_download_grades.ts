import { Wrapper } from '@vue/test-utils';

import * as ag_cli from 'ag-client-typescript';
const file_saver = require('file-saver');
import * as sinon from 'sinon';

import APIErrors from '@/components/api_errors.vue';
import DownloadGrades, { DownloadTask, DownloadType } from '@/components/project_admin/download_grades.vue';
import { safe_assign } from '@/utils';

import * as data_ut from '@/tests/data_utils';
import { managed_mount } from '@/tests/setup';
import { wait_for_load, wait_until } from '@/tests/utils';

const DOWNLOAD_TASK_PKS = data_ut.counter();

function make_download_task(
    project_pk: number, download_type: DownloadType, data: Partial<DownloadTask> = {}
) {
    let defaults = {
        pk: DOWNLOAD_TASK_PKS.next().value,
        project: project_pk,
        download_type: download_type,
        result_filename: '',
        progress: 0,
        error_msg: '',
        created_at: (new Date()).toISOString(),
    };
    safe_assign(defaults, data);
    return defaults;
}

let course: ag_cli.Course;
let project: ag_cli.Project;

let http_get_stub: sinon.SinonStub;
let http_get_file_stub: sinon.SinonStub;
let http_post_stub: sinon.SinonStub;
let save_as_stub: sinon.SinonStub;

beforeEach(() => {
    course = data_ut.make_course();
    project = data_ut.make_project(course.pk);

    http_get_stub = sinon.stub(ag_cli.HttpClient.get_instance(), 'get');
    http_get_file_stub = sinon.stub(ag_cli.HttpClient.get_instance(), 'get_file');
    save_as_stub = sinon.stub(file_saver, 'saveAs');
});

afterEach(() => {
    save_as_stub.restore();
});

function get_tasks_stub_resolves(data: DownloadTask[]) {
    http_get_stub.withArgs(
        `/projects/${project.pk}/download_tasks/`
    ).resolves(new ag_cli.HttpResponse({status: 200, data: data, headers: {}}));
}

test('Download tasks fetched, sorted, and displayed', async () => {
    let with_error = make_download_task(
        project.pk, DownloadType.all_scores, {error_msg: 'I am error', progress: 10});
    let download_1 = make_download_task(project.pk, DownloadType.all_scores, {progress: 15});
    let download_2 = make_download_task(
        project.pk, DownloadType.all_submission_files, {progress: 100});

    get_tasks_stub_resolves([download_1, download_2, with_error]);
    let wrapper = managed_mount(DownloadGrades, {propsData: {project: project}});
    expect(await wait_for_load(wrapper)).toBe(true);
    expect(wrapper.vm.project).toEqual(project);

    let download_rows = wrapper.findAll('.download-row');
    expect(download_rows.at(0).find('.file-name').text()).toEqual(
        project.name + '_all_submission_files.zip');
    expect(download_rows.at(0).find('.progress').text()).toEqual(
        download_2.progress.toString() + '%');

    expect(download_rows.at(1).find('.file-name').exists()).toBe(false);
    expect(download_rows.at(1).find('.progress').text()).toEqual(
        download_1.progress.toString() + '%');

    expect(download_rows.at(2).find('.file').text()).toEqual('ERROR');
    expect(download_rows.at(2).find('.file-name').exists()).toBe(false);
    expect(download_rows.at(2).find('.progress').text()).toEqual(
        with_error.progress.toString() + '%');
});

describe('Create task tests', () => {
    let wrapper: Wrapper<DownloadGrades>;

    beforeEach(async () => {
        http_post_stub = sinon.stub(ag_cli.HttpClient.get_instance(), 'post').callsFake(
            (url: string, data: unknown) => {
                let task_data = <DownloadTask> data;
                let result = make_download_task(project.pk, task_data.download_type, task_data);
                result.progress = 100;
                return Promise.resolve(
                    new ag_cli.HttpResponse({
                        status: 200,
                        data: result,
                        headers: {}
                    })
                );
            }
        );

        get_tasks_stub_resolves([]);
        wrapper = managed_mount(DownloadGrades, {propsData: {project: project}});
        expect(await wait_for_load(wrapper)).toBe(true);
    });

    test('Grades for final graded submissions', async () => {
        // Grades for final graded submission without staff should be the default
        await wrapper.find('.download-button').trigger('click');
        expect(await wait_until(wrapper, w => !w.vm.d_creating_download_task)).toBe(true);
        await wrapper.vm.$nextTick();

        let row = wrapper.findAll('.download-row').at(0);
        expect(row.find('.file-name').text()).toEqual(
            project.name + '_final_graded_submission_scores.csv');

        expect(http_post_stub.calledOnceWith(
            `/projects/${project.pk}/final_graded_submission_scores/`));
    });

    test('Grades for all submissions', async () => {
        wrapper.find('#all-choice').setChecked();
        await wrapper.find('.download-button').trigger('click');
        expect(await wait_until(wrapper, w => !w.vm.d_creating_download_task)).toBe(true);
        await wrapper.vm.$nextTick();

        let row = wrapper.findAll('.download-row').at(0);
        expect(row.find('.file-name').text()).toEqual(project.name + '_all_scores.csv');

        expect(http_post_stub.calledOnceWith(`/projects/${project.pk}/all_scores/`));
    });

    test('Files for final graded submissions', async () => {
        wrapper.find('#files-choice').setChecked();
        await wrapper.find('.download-button').trigger('click');
        expect(await wait_until(wrapper, w => !w.vm.d_creating_download_task)).toBe(true);
        await wrapper.vm.$nextTick();

        let row = wrapper.findAll('.download-row').at(0);
        expect(row.find('.file-name').text()).toEqual(
            project.name + '_final_graded_submission_files.zip');

        expect(http_post_stub.calledOnceWith(
            `/projects/${project.pk}/final_graded_submission_files/`));
    });

    test('Files for all submissions', async () => {
        wrapper.find('#files-choice').setChecked();
        wrapper.find('#all-choice').setChecked();
        await wrapper.find('.download-button').trigger('click');
        expect(await wait_until(wrapper, w => !w.vm.d_creating_download_task)).toBe(true);
        await wrapper.vm.$nextTick();

        let row = wrapper.findAll('.download-row').at(0);
        expect(row.find('.file-name').text()).toEqual(
            project.name + '_all_submission_files.zip');

        expect(http_post_stub.calledOnceWith(`/projects/${project.pk}/all_submission_files/`));
    });

    test('With staff', async () => {
        wrapper.find('#include-staff').setChecked();
        await wrapper.find('.download-button').trigger('click');
        expect(await wait_until(wrapper, w => !w.vm.d_creating_download_task)).toBe(true);
        await wrapper.vm.$nextTick();

        let row = wrapper.findAll('.download-row').at(0);
        expect(row.find('.file-name').text()).toEqual(
            project.name + '_final_graded_submission_scores.csv');

        expect(http_post_stub.calledOnce).toBe(true);
        let args = http_post_stub.getCall(0).args;
        expect(args[0]).toEqual(
            `/projects/${project.pk}/ultimate_submission_scores/?include_staff=true`
        );
    });

    test('With pending extensions', async () => {
        wrapper.find('#include-pending-extensions').setChecked();
        await wrapper.find('.download-button').trigger('click');
        expect(await wait_until(wrapper, w => !w.vm.d_creating_download_task)).toBe(true);
        await wrapper.vm.$nextTick();

        let row = wrapper.findAll('.download-row').at(0);
        expect(row.find('.file-name').text()).toEqual(
            project.name + '_final_graded_submission_scores.csv');

        expect(http_post_stub.calledOnce).toBe(true);
        let args = http_post_stub.getCall(0).args;
        expect(args[0]).toEqual(
            `/projects/${project.pk}/ultimate_submission_scores/?include_pending_extensions=true`
        );
    });

    test('With staff and pending extensions', async () => {
        wrapper.find('#include-staff').setChecked();
        wrapper.find('#include-pending-extensions').setChecked();
        await wrapper.find('.download-button').trigger('click');
        expect(await wait_until(wrapper, w => !w.vm.d_creating_download_task)).toBe(true);
        await wrapper.vm.$nextTick();

        let row = wrapper.findAll('.download-row').at(0);
        expect(row.find('.file-name').text()).toEqual(
            project.name + '_final_graded_submission_scores.csv');

        expect(http_post_stub.calledOnce).toBe(true);
        let args = http_post_stub.getCall(0).args;
        expect(args[0]).toEqual(
            `/projects/${project.pk}/ultimate_submission_scores/`
            + `?include_staff=true&include_pending_extensions=true`
        );
    });

    test('Include pending extensions hidden when not relevant', async () => {
        expect(wrapper.find('#include-pending-extensions').exists()).toBe(true);
        await wrapper.find('#all-choice').setChecked();
        expect(wrapper.find('#include-pending-extensions').exists()).toBe(false);

        await wrapper.find('#final-graded-choice').setChecked();
        expect(wrapper.find('#include-pending-extensions').exists()).toBe(true);

        await wrapper.find('#files-choice').setChecked();
        expect(wrapper.find('#include-pending-extensions').exists()).toBe(false);
    });

    test('API errors handled', async () => {
        http_post_stub.rejects(new ag_cli.HttpError(403, "forbid"));
        await wrapper.find('.download-button').trigger('click');
        expect(await wait_until(wrapper, w => !w.vm.d_creating_download_task)).toBe(true);
        await wrapper.vm.$nextTick();

        let errors = <APIErrors> wrapper.findComponent({ref: 'api_errors'}).vm;
        expect(errors.d_api_errors.length).toEqual(1);
    });
});

test('Download task result', async () => {
    let task = make_download_task(project.pk, DownloadType.all_scores, {progress: 100});
    get_tasks_stub_resolves([task]);
    http_get_file_stub.withArgs(`/download_tasks/${task.pk}/result/`).callsFake((url, args) => {
        // tslint:disable-next-line: no-object-literal-type-assertion
        args.on_download_progress!(<ProgressEvent> {lengthComputable: true, loaded: 4, total: 15});
        return Promise.resolve(new Blob(['this is some csv data']));
    });

    let wrapper = managed_mount(DownloadGrades, {propsData: {project: project}});
    expect(await wait_for_load(wrapper)).toBe(true);
    await wrapper.findAll('.download-row').at(0).find('.file-name').trigger('click');
    expect(await wait_until(wrapper, w => !w.vm.d_creating_download_task)).toBe(true);
    await wrapper.vm.$nextTick();
    // tslint:disable-next-line:deprecation
    expect(save_as_stub.called).toBe(true);
});
