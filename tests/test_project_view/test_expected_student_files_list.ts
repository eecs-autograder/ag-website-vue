import { Wrapper } from '@vue/test-utils';

import * as ag_cli from 'ag-client-typescript';

import ExpectedStudentFilesList from '@/components/project_view/expected_student_files_list.vue';

import * as data_ut from '@/tests/data_utils';
import { managed_mount } from '@/tests/setup';

let wrapper: Wrapper<ExpectedStudentFilesList>;
let project: ag_cli.Project;
let expected_files: ag_cli.ExpectedStudentFile[];

beforeEach(() => {
    project = data_ut.make_project(data_ut.make_course().pk);
    expected_files = [
        data_ut.make_expected_student_file(project.pk, 'file1.txt'),
        data_ut.make_expected_student_file(project.pk, 'file2*.txt', {
            min_num_matches: 0, max_num_matches: 1
        }),
        data_ut.make_expected_student_file(project.pk, 'file3.txt'),
        data_ut.make_expected_student_file(project.pk, 'file4*.txt', {
            min_num_matches: 1, max_num_matches: 5
        }),
    ];

    wrapper = managed_mount(ExpectedStudentFilesList, {
        propsData: {
            expected_student_files: expected_files
        }
    });
});

test('Show and hide file list', async () => {
    expect(wrapper.find('.file-list').exists()).toBe(false);
    expect(wrapper.findAll('.file-list-item').length).toEqual(0);

    await wrapper.find('.show-all').trigger('click');
    expect(wrapper.find('.file-list').exists()).toBe(true);
    expect(wrapper.findAll('.file-list-item').length).toEqual(4);

    await wrapper.find('.show-all').trigger('click');
    expect(wrapper.find('.file-list').exists()).toBe(false);
    expect(wrapper.findAll('.file-list-item').length).toEqual(0);
});

test('Filenames and num matches displayed appropriately', async () => {
    await wrapper.find('.show-all').trigger('click');

    let list_items = wrapper.findAll('.file-list-item');
    expect(list_items.at(0).find('.filename').text().trim()).toEqual(expected_files[0].pattern);
    expect(list_items.at(0).text()).not.toContain('matches');

    expect(list_items.at(1).text()).toContain(expected_files[1].pattern);
    expect(list_items.at(1).text()).toContain(`0-1 matches`);

    expect(list_items.at(2).find('.filename').text().trim()).toEqual(expected_files[2].pattern);
    expect(list_items.at(2).text()).not.toContain('matches');

    expect(list_items.at(3).text()).toContain(expected_files[3].pattern);
    expect(list_items.at(3).text()).toContain(`1-5 matches`);
});
