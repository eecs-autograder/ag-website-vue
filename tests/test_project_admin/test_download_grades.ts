import { mount, Wrapper } from '@vue/test-utils';

import * as ag_cli from 'ag-client-typescript';
import * as sinon from 'sinon';

import DownloadGrades from '@/components/project_admin/download_grades.vue';

import * as data_ut from '@/tests/data_utils';
import {managed_mount} from '@/tests/setup';

export enum DownloadType {
    all_scores = 'all_scores',
    final_graded_submission_scores = 'final_graded_submission_scores',
    all_submission_files = 'all_submission_files',
    final_graded_submission_files = 'final_graded_submission_files'
}

interface DownloadTask {
    pk: number;
    project: number;
    download_type: DownloadType;
    result_filename: string;
    progress: number;
    error_msg: string;
    created_at: string;
}

describe('DownloadGrades tests', () => {
    let wrapper: Wrapper<DownloadGrades>;
    let course: ag_cli.Course;
    let project: ag_cli.Project;
    // let downloads: DownLoadTask[];

    beforeEach(() => {
        course = data_ut.make_course();
        project = data_ut.make_project(course.pk);

        wrapper = managed_mount(DownloadGrades, {
            propsData: {
                project: project
            }
        });
    });

    test('d_downloads fetched, sorted, and displayed', () => {
        expect(wrapper.vm.project).toEqual(project);
        fail();
    });

    test('d_download_grades binding', async () => {
        let download_grades_toggle = wrapper.find({ref: 'download_grades'});

        wrapper.vm.d_download_grades = true;
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_download_grades).toEqual(true);

        download_grades_toggle.find('.off-border').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_download_grades).toEqual(false);

        download_grades_toggle.find('.on-border').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_download_grades).toEqual(true);
    });

    test('d_include_staff binding', async () => {
        let include_staff_toggle = wrapper.find({ref: 'include_staff'});

        wrapper.vm.d_include_staff = true;
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_include_staff).toEqual(true);

        include_staff_toggle.find('.off-border').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_include_staff).toEqual(false);

        include_staff_toggle.find('.on-border').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_include_staff).toEqual(true);
    });

    test('d_final_graded_submissions_only binding', async () => {
        let final_graded_submissions_only_toggle = wrapper.find(
            {ref: 'final_graded_submissions_only'}
        );

        wrapper.vm.d_final_graded_submissions_only = true;
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_final_graded_submissions_only).toEqual(true);

        final_graded_submissions_only_toggle.find('.off-border').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_final_graded_submissions_only).toEqual(false);

        final_graded_submissions_only_toggle.find('.on-border').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_final_graded_submissions_only).toEqual(true);
    });

    test('get_filename - download_type === all_scores', () => {
        let download_task_instance = {
            pk: 1,
            project: project.pk,
            download_type: DownloadType.all_scores,
            result_filename: "filename",
            progress: 100,
            error_msg: "",
            created_at: "2019-02-15T20:41:30.534985Z"
        };

        let expected_filename = project.name + "_all_scores.csv";
        expect(wrapper.vm.get_filename(download_task_instance)).toEqual(expected_filename);
    });

    test('get_filename - download_type === final_graded_submission_scores', () => {
        let download_task_instance = {
            pk: 1,
            project: project.pk,
            download_type: DownloadType.final_graded_submission_scores,
            result_filename: "filename",
            progress: 100,
            error_msg: "",
            created_at: "2019-02-15T20:41:30.534985Z"
        };

        let expected_filename = project.name + "_final_graded_submission_scores.csv";
        expect(wrapper.vm.get_filename(download_task_instance)).toEqual(expected_filename);
    });

    test('get_filename - download_type === all_submission_files', () => {
        let download_task_instance = {
            pk: 1,
            project: project.pk,
            download_type: DownloadType.all_submission_files,
            result_filename: "filename",
            progress: 100,
            error_msg: "",
            created_at: "2019-02-15T20:41:30.534985Z"
        };

        let expected_filename = project.name + "_all_submission_files.zip";
        expect(wrapper.vm.get_filename(download_task_instance)).toEqual(expected_filename);
    });

    test('get_filename - download_type === final_graded_submission_files', () => {
        let download_task_instance = {
            pk: 1,
            project: project.pk,
            download_type: DownloadType.final_graded_submission_files,
            result_filename: "filename",
            progress: 100,
            error_msg: "",
            created_at: "2019-02-15T20:41:30.534985Z"
        };

        let expected_filename = project.name + "_final_graded_submission_files.zip";
        expect(wrapper.vm.get_filename(download_task_instance)).toEqual(expected_filename);
    });

    test('get_download_url - d_include_staff === true', () => {
        wrapper.vm.d_include_staff = true;

        let base_url = "/api/projects/2/all_submission_scores/";
        let expected_download_url = base_url + '?include_staff=true';

        expect(wrapper.vm.get_download_url(base_url)).toEqual(expected_download_url);
    });

    test('get_download_url - d_include_staff === false', () => {
        wrapper.vm.d_include_staff = false;

        let base_url = "/api/projects/2/all_submission_scores/";
        let expected_download_url = base_url;

        expect(wrapper.vm.get_download_url(base_url)).toEqual(expected_download_url);
    });

    test.skip('Download task result', async () => {
        // sinon for getting file content? csv and zip?
    });
});

// describe.skip('Polling tests', () => {

//     test('Download submission files', async () => {

//     });

//     test('Download submission scores', async () => {

//     });

//     test('Downloads unchanged when refreshed', async () => {

//     });

//     test('Downloads changed when refreshed', async () => {

//     });

// });
