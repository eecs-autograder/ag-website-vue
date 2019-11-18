import { Wrapper } from '@vue/test-utils';

import * as ag_cli from 'ag-client-typescript';
import * as sinon from 'sinon';

import FilePanel from '@/components/handgrading/file_panel.vue';
import ViewFile from '@/components/view_file.vue';

import * as data_ut from '@/tests/data_utils';
import { managed_mount } from '@/tests/setup';
import { find_by_name, wait_until } from '@/tests/utils';

let filename: string;
let content: string;
let result: ag_cli.HandgradingResult;
let get_file_stub: sinon.SinonStub;
let wrapper: Wrapper<FilePanel>;

beforeEach(() => {
    filename = 'an_filename.txt';
    content = 'This is some file contentttt';

    let project = data_ut.make_project(data_ut.make_course().pk);
    let group = data_ut.make_group(project.pk);
    let submission = data_ut.make_submission(group);
    result = data_ut.make_handgrading_result(
        data_ut.make_handgrading_rubric(project.pk),
        group.pk,
        submission.pk
    );

    get_file_stub = sinon.stub(
        ag_cli.HandgradingResult, 'get_file_from_handgrading_result'
    ).withArgs(group.pk, filename).callsFake((group_pk, file, on_download_progress) => {
        // tslint:disable-next-line: no-object-literal-type-assertion
        on_download_progress!(<ProgressEvent> {lengthComputable: true, loaded: 5, total: 8});
        return Promise.resolve(content);
    });

    wrapper = managed_mount(FilePanel, {
        propsData: {
            handgrading_result: result,
            filename: filename,
            enable_custom_comments: false,
            readonly_handgrading_results: false,
        }
    });
});

test('File loaded on open', async () => {
    expect(wrapper.find('.body').isVisible()).toBe(false);
    wrapper.find('.panel').trigger('click');
    expect(await wait_until(wrapper, w => w.vm.d_content !== null));

    expect(wrapper.find('.body').isVisible()).toBe(true);
    expect(await wrapper.vm.d_content).toEqual(content);

    let view_file = find_by_name<ViewFile>(wrapper, 'ViewFile');
    expect(await view_file.vm.file_contents).toEqual(await wrapper.vm.d_content);
    expect(view_file.vm.filename).toEqual(filename);

    wrapper.find('.panel').trigger('click');
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.body').isVisible()).toBe(false);
    wrapper.find('.panel').trigger('click');
    await wrapper.vm.$nextTick();

    expect(get_file_stub.calledOnce).toBe(true);
});

test('Handgrading props passed through to view file', async () => {
    wrapper.find('.panel').trigger('click');
    expect(await wait_until(wrapper, w => w.vm.d_content !== null));

    let view_file = find_by_name<ViewFile>(wrapper, 'ViewFile');
    expect(view_file.vm.enable_custom_comments).toBe(false);
    expect(view_file.vm.readonly_handgrading_results).toBe(false);

    wrapper.setProps({enable_custom_comments: true});
    expect(view_file.vm.enable_custom_comments).toBe(true);

    wrapper.setProps({readonly_handgrading_results: true});
    expect(view_file.vm.readonly_handgrading_results).toBe(true);
});
