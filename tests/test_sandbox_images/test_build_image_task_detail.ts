import { Wrapper } from '@vue/test-utils';

import * as ag_cli from 'ag-client-typescript';
import * as sinon from 'sinon';

import BuildImageTaskDetail from '@/components/sandbox_images/build_image_task_detail.vue';
import ViewFile from '@/components/view_file.vue';
import { assert_not_null, deep_copy } from '@/utils';

import * as data_ut from '@/tests/data_utils';
import { managed_mount } from '@/tests/setup';
import { compress_whitespace, set_props, wait_until } from '@/tests/utils';

jest.mock('file-saver');

let build_task: ag_cli.BuildSandboxDockerImageTask;
let load_output_stub: sinon.SinonStub;
let output: string;

beforeEach(() => {
    output = 'noreistanoraftoinurtr';
    build_task = data_ut.make_build_sanbdox_docker_image_task(null, null);
    load_output_stub = sinon.stub(build_task, 'get_output').callsFake(callback => {
        assert_not_null(callback);
        // tslint:disable-next-line: no-object-literal-type-assertion
        callback(<ProgressEvent> {lengthComputable: true, loaded: 5, total: 30});
        return Promise.resolve(new Blob([output]));
    });
});

test('Queued status', async () => {
    let wrapper = managed_mount(BuildImageTaskDetail, {propsData: {build_task: build_task}});
    await wrapper.vm.$nextTick();
    expect(wrapper.findComponent({ref: 'output'}).exists()).toBe(false);
    expect(compress_whitespace(wrapper.find('.status-info').text())).toEqual('Q In Queue');
});

test('In progress status', async () => {
    build_task.status = ag_cli.BuildImageStatus.in_progress;
    let wrapper = managed_mount(BuildImageTaskDetail, {propsData: {build_task: build_task}});
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.status-info').text().trim()).toEqual('In Progress');

    let view_file = <Wrapper<ViewFile>> wrapper.findComponent({ref: 'output'});
    expect(view_file.exists()).toBe(true);
    expect(await view_file.vm.file_contents).toEqual(output);
});

test('Done status', async () => {
    build_task.status = ag_cli.BuildImageStatus.done;
    let wrapper = managed_mount(BuildImageTaskDetail, {propsData: {build_task: build_task}});
    await wrapper.vm.$nextTick();
    expect(wrapper.findComponent({ref: 'output'}).exists()).toBe(true);
    expect(wrapper.find('.status-info').text().trim()).toEqual('Success!');
});

test('Failed status', async () => {
    build_task.status = ag_cli.BuildImageStatus.failed;
    let wrapper = managed_mount(BuildImageTaskDetail, {propsData: {build_task: build_task}});
    await wrapper.vm.$nextTick();
    expect(wrapper.findComponent({ref: 'output'}).exists()).toBe(true);
    expect(wrapper.find('.status-info').text().trim()).toEqual('Build Failed');
});

test('Invalid image status', async () => {
    let validation_msg = 'noefiavoniultonixevnoiersatn';
    build_task.status = ag_cli.BuildImageStatus.image_invalid;
    build_task.validation_error_msg = validation_msg;
    let wrapper = managed_mount(BuildImageTaskDetail, {propsData: {build_task: build_task}});
    await wrapper.vm.$nextTick();

    expect(wrapper.findComponent({ref: 'output'}).exists()).toBe(true);
    expect(wrapper.find('.status-info').text().trim()).toContain('Invalid Image');
    expect(wrapper.find('.explanation').text().trim()).toContain(validation_msg);
});

test('Internal error status non-superuser', async () => {
    build_task.status = ag_cli.BuildImageStatus.internal_error;
    let wrapper = managed_mount(BuildImageTaskDetail, {propsData: {build_task: build_task}});
    await wrapper.vm.$nextTick();
    expect(wrapper.findComponent({ref: 'output'}).exists()).toBe(true);

    let status_text = wrapper.find('.status-info').text().trim();
    expect(status_text).toContain('unexpected error');
    expect(status_text).toContain(build_task.pk);
    expect(wrapper.find('.internal-error-msg').exists()).toBe(false);
});

test('Internal error status superuser', async () => {
    data_ut.set_global_current_user(data_ut.make_user({is_superuser: true}));
    let internal_error_msg = 'aw peas nrosteanorsetan';
    build_task.status = ag_cli.BuildImageStatus.internal_error;
    build_task.internal_error_msg = internal_error_msg;
    let wrapper = managed_mount(BuildImageTaskDetail, {propsData: {build_task: build_task}});
    await wrapper.vm.$nextTick();

    let status_text = wrapper.find('.status-info').text().trim();
    expect(status_text).toContain('unexpected error');
    expect(status_text).toContain(build_task.pk);
    expect(wrapper.find('.internal-error-msg').text().trim()).toEqual(internal_error_msg);
});

test('Status change output loaded', async () => {
    let queued_task = deep_copy(build_task, ag_cli.BuildSandboxDockerImageTask);
    let wrapper = managed_mount(BuildImageTaskDetail, {propsData: {build_task: queued_task}});
    await wrapper.vm.$nextTick();
    expect(wrapper.findComponent({ref: 'output'}).exists()).toBe(false);
    expect(compress_whitespace(wrapper.find('.status-info').text())).toEqual('Q In Queue');

    build_task.status = ag_cli.BuildImageStatus.in_progress;
    await set_props(wrapper, {build_task: build_task});
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.status-info').text().trim()).toEqual('In Progress');

    let view_file = <Wrapper<ViewFile>> wrapper.findComponent({ref: 'output'});
    expect(view_file.exists()).toBe(true);
    expect(await view_file.vm.file_contents).toEqual(output);
});

test('Refresh button', async () => {
    let wrapper = managed_mount(BuildImageTaskDetail, {propsData: {build_task: build_task}});
    await wrapper.vm.$nextTick();

    await wrapper.find('[data-testid=refresh_button]').trigger('click');
    expect(wrapper.emitted('refresh_selected_build_task')?.length).toEqual(1);
});

test('Download files', async () => {
    let filenames = ['Dockerfile', 'file1', 'another_file'];
    build_task.filenames = filenames;

    let get_files_stub = sinon.stub(build_task, 'get_files').callsFake(callback => {
        assert_not_null(callback);
        // tslint:disable-next-line: no-object-literal-type-assertion
        callback(<ProgressEvent> {lengthComputable: true, loaded: 5, total: 6});
        return Promise.resolve(new Blob(['nst']));
    });
    let wrapper = managed_mount(BuildImageTaskDetail, {propsData: {build_task: build_task}});

    let filename_list_items = wrapper.findAll('.filename');
    expect(filename_list_items.length).toEqual(filenames.length);
    expect(filename_list_items.wrappers.map(w => w.text().trim())).toEqual(filenames);

    await wrapper.find('[data-testid=download_files_icon]').trigger('click');
    expect(await wait_until(wrapper, w => !w.vm.d_downloading_files)).toBe(true);
    expect(get_files_stub.calledOnce).toBe(true);
});
