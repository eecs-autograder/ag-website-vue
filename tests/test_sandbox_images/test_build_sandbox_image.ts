import * as ag_cli from 'ag-client-typescript';
import * as sinon from 'sinon';

import APIErrors from '@/components/api_errors.vue';
import BuildSandboxImage from '@/components/sandbox_images/build_sandbox_image.vue';
import { assert_not_null } from '@/utils';

import * as data_ut from '@/tests/data_utils';
import { managed_mount } from '@/tests/setup';
import { emitted, wait_until } from '@/tests/utils';

let files = [
    new File(['spam'], 'Dockerfile'),
    new File(['nosetans'], 'file1'),
    new File(['oyufntof'], 'file2'),
];

test('Start new image build task course null', async () => {
    let new_build_task = data_ut.make_build_sanbdox_docker_image_task(null, null);

    sinon.stub(
        ag_cli.SandboxDockerImage, 'create_image'
    ).withArgs(files, null).callsFake((files_, course_pk, callback) => {
        assert_not_null(callback);
        // tslint:disable-next-line: no-object-literal-type-assertion
        callback(<ProgressEvent> {lengthComputable: true, loaded: 8, total: 23});
        return Promise.resolve(new_build_task);
    });
    let wrapper = managed_mount(BuildSandboxImage, {
        propsData: {
            course: null,
            sandbox_image: null,
        }
    });

    wrapper.findComponent({ref: 'file_upload'}).vm.$emit('upload_files', files);
    await wrapper.vm.$nextTick();
    expect(await wait_until(wrapper, w => !w.vm.d_starting_build)).toBe(true);

    expect(emitted(wrapper, 'new_build_task')[0][0]).toEqual(new_build_task);
});

test('Start new image build task course not null', async () => {
    let course = data_ut.make_course();
    let new_build_task = data_ut.make_build_sanbdox_docker_image_task(course.pk, null);

    sinon.stub(
        ag_cli.SandboxDockerImage, 'create_image'
    ).withArgs(files, course.pk).callsFake((files_, course_pk, callback) => {
        assert_not_null(callback);
        // tslint:disable-next-line: no-object-literal-type-assertion
        callback(<ProgressEvent> {lengthComputable: true, loaded: 8, total: 23});
        return Promise.resolve(new_build_task);
    });

    let wrapper = managed_mount(BuildSandboxImage, {
        propsData: {
            course: course,
            sandbox_image: null,
        }
    });

    wrapper.findComponent({ref: 'file_upload'}).vm.$emit('upload_files', files);
    await wrapper.vm.$nextTick();
    expect(await wait_until(wrapper, w => !w.vm.d_starting_build)).toBe(true);

    expect(emitted(wrapper, 'new_build_task')[0][0]).toEqual(new_build_task);
});

test('Start rebuild image task', async () => {
    let image = data_ut.make_sandbox_docker_image(null);
    let new_build_task = data_ut.make_build_sanbdox_docker_image_task(null, image);

    sinon.stub(
        ag_cli.SandboxDockerImage.prototype, 'rebuild'
    ).withArgs(files).callsFake((files_, callback) => {
        assert_not_null(callback);
        // tslint:disable-next-line: no-object-literal-type-assertion
        callback(<ProgressEvent> {lengthComputable: true, loaded: 7, total: 19});
        return Promise.resolve(new_build_task);
    });
    let wrapper = managed_mount(BuildSandboxImage, {
        propsData: {
            course: null,
            sandbox_image: image,
        }
    });

    wrapper.findComponent({ref: 'file_upload'}).vm.$emit('upload_files', files);
    await wrapper.vm.$nextTick();
    expect(await wait_until(wrapper, w => !w.vm.d_starting_build)).toBe(true);

    expect(emitted(wrapper, 'new_build_task')[0][0]).toEqual(new_build_task);
});

test('API errors handled', async () => {
    let new_build_task = data_ut.make_build_sanbdox_docker_image_task(null, null);

    sinon.stub(
        ag_cli.SandboxDockerImage, 'create_image'
    ).rejects(new ag_cli.HttpError(400, 'bad'));

    let wrapper = managed_mount(BuildSandboxImage, {
        propsData: {
            course: null,
            sandbox_image: null,
        }
    });

    wrapper.findComponent({ref: 'file_upload'}).vm.$emit('upload_files', files);
    await wrapper.vm.$nextTick();
    expect(await wait_until(wrapper, w => !w.vm.d_starting_build)).toBe(true);

    let api_errors = <APIErrors> wrapper.findComponent({ref: 'api_errors'}).vm;
    expect(api_errors.d_api_errors.length).toBe(1);
    expect(wrapper.emitted('new_build_task')).toBeUndefined();
});
