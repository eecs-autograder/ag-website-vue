import { mount, Wrapper } from '@vue/test-utils';

import * as ag_cli from 'ag-client-typescript';
import * as sinon from 'sinon';

import DownloadGrades from '@/components/project_admin/download_grades.vue';

import * as data_ut from '@/tests/data_utils';

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

        wrapper = mount(DownloadGrades, {
            propsData: {
                project: project
            }
        });
    });

    afterEach(() => {
        sinon.restore();
    });

    test('props', () => {
        expect(wrapper.vm.project).toEqual(project);
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
});
