import { Vue } from "vue-property-decorator";

import { Wrapper, WrapperArray } from '@vue/test-utils';

import * as ag_cli from 'ag-client-typescript';
import * as sinon from 'sinon';

import APIErrors from '@/components/api_errors.vue';
import Collapsible from '@/components/collapsible.vue';
import BuildImageStatusIcon from '@/components/sandbox_images/build_image_status_icon.vue';
import BuildImageTaskDetail from '@/components/sandbox_images/build_image_task_detail.vue';
import SandboxImages from '@/components/sandbox_images/sandbox_images.vue';
import { deep_copy } from '@/utils';

import * as data_ut from '@/tests/data_utils';
import { managed_mount } from '@/tests/setup';
import { set_validated_input_text, validated_input_is_valid, wait_for_load, wait_until } from '@/tests/utils';

test('Build tasks displayed in sidebar sections', async () => {
    let queued_task = data_ut.make_build_sanbdox_docker_image_task(
        null, null, {status: ag_cli.BuildImageStatus.queued});
    let failed_task = data_ut.make_build_sanbdox_docker_image_task(
        null, null, {status: ag_cli.BuildImageStatus.failed});

    let image = data_ut.make_sandbox_docker_image(null);
    let in_progress_rebuild_task = data_ut.make_build_sanbdox_docker_image_task(
        null, image, {status: ag_cli.BuildImageStatus.in_progress});
    let finished_rebuild_task = data_ut.make_build_sanbdox_docker_image_task(
        null, image, {status: ag_cli.BuildImageStatus.done});

    let image2 = data_ut.make_sandbox_docker_image(null);

    sinon.stub(ag_cli.SandboxDockerImage, 'get_images').withArgs(null).resolves([image2, image]);
    sinon.stub(ag_cli.BuildSandboxDockerImageTask, 'get_build_tasks').withArgs(null).resolves([
        finished_rebuild_task, in_progress_rebuild_task, failed_task, queued_task
    ]);

    let wrapper = managed_mount(SandboxImages);
    expect(await wait_for_load(wrapper)).toBe(true);

    let in_progress_panels = wrapper.findAllComponents({ref: 'in_progress_build_panel'});
    expect(in_progress_panels.length).toEqual(2);
    expect(in_progress_panels.at(0).text()).toContain(image.display_name);
    expect(panel_has_status(in_progress_panels.at(0), ag_cli.BuildImageStatus.queued));

    expect(in_progress_panels.at(1).text()).toContain('New Image');
    expect(panel_has_status(in_progress_panels.at(1), ag_cli.BuildImageStatus.in_progress));

    let image_panels = wrapper.findAllComponents({ref: 'image_panel'});
    expect(image_panels.length).toEqual(2);
    expect(image_panels.at(0).text()).toContain(image2.display_name);
    expect(image_panels.at(1).text()).toContain(image.display_name);

    await image_panels.at(1).trigger('click');
    let image_history_panels = wrapper.findAllComponents({ref: 'image_build_history_panel'});
    expect(image_history_panels.length).toEqual(2);
    expect(panel_has_status(image_history_panels.at(0), ag_cli.BuildImageStatus.done));
    expect(panel_has_status(image_history_panels.at(1), ag_cli.BuildImageStatus.in_progress));

    let full_history_panels = wrapper.findAllComponents({ref: 'full_build_history_panel'});
    expect(full_history_panels.length).toEqual(4);
    expect(full_history_panels.at(0).text()).toContain(image.display_name);
    expect(panel_has_status(full_history_panels.at(0), ag_cli.BuildImageStatus.done));
    expect(full_history_panels.at(1).text()).toContain(image.display_name);
    expect(panel_has_status(full_history_panels.at(1), ag_cli.BuildImageStatus.in_progress));
    expect(full_history_panels.at(2).text()).toContain('New Image');
    expect(panel_has_status(full_history_panels.at(2), ag_cli.BuildImageStatus.failed));
    expect(full_history_panels.at(3).text()).toContain('New Image');
    expect(panel_has_status(full_history_panels.at(3), ag_cli.BuildImageStatus.queued));
});

function panel_has_status<T extends Vue>(panel: Wrapper<T>, status: ag_cli.BuildImageStatus) {
    let status_icon = <BuildImageStatusIcon> panel.findComponent(BuildImageStatusIcon).vm;
    return status_icon.status === status;
}

test('Course not null images and build tasks loaded from course', async () => {
    let course = data_ut.make_course();
    let get_images_stub = sinon.stub(ag_cli.SandboxDockerImage, 'get_images').resolves([]);
    let get_build_tasks_stub = sinon.stub(
        ag_cli.BuildSandboxDockerImageTask, 'get_build_tasks').resolves([]);

    let wrapper = managed_mount(SandboxImages, {propsData: {course: course}});
    expect(await wait_for_load(wrapper)).toBe(true);

    expect(get_images_stub.calledOnceWith(course.pk)).toBe(true);
    expect(get_build_tasks_stub.calledOnceWith(course.pk)).toBe(true);
});

test('Select image', async () => {
    let image3 = data_ut.make_sandbox_docker_image(null);
    let image2 = data_ut.make_sandbox_docker_image(null);
    let image1 = data_ut.make_sandbox_docker_image(null);

    sinon.stub(ag_cli.SandboxDockerImage, 'get_images').resolves([image1, image2, image3]);
    sinon.stub(ag_cli.BuildSandboxDockerImageTask, 'get_build_tasks').resolves([]);

    let wrapper = managed_mount(SandboxImages);
    expect(await wait_for_load(wrapper)).toBe(true);

    let panels = <WrapperArray<Collapsible>> wrapper.findAllComponents({ref: 'image_panel'});
    for (let panel of panels.wrappers) {
        expect(panel.vm.is_active).toBe(false);
    }

    await panels.at(2).trigger('click');
    expect(panels.at(2).vm.is_active).toBe(true);
    expect(panels.filter(panel => panel.vm.is_active).length).toEqual(1);
    expect(wrapper.vm.selected_image).toEqual(image3);

    await panels.at(0).trigger('click');
    expect(panels.at(0).vm.is_active).toBe(true);
    expect(panels.filter(panel => panel.vm.is_active).length).toEqual(1);
    expect(wrapper.vm.selected_image).toEqual(image1);
});

test('Select build task', async () => {
    let task3 = data_ut.make_build_sanbdox_docker_image_task(null, null);
    let task2 = data_ut.make_build_sanbdox_docker_image_task(null, null);
    let task1 = data_ut.make_build_sanbdox_docker_image_task(null, null);

    sinon.stub(ag_cli.SandboxDockerImage, 'get_images').resolves([]);
    sinon.stub(ag_cli.BuildSandboxDockerImageTask, 'get_build_tasks').resolves([
        task1, task2, task3]);

    let wrapper = managed_mount(SandboxImages);
    expect(await wait_for_load(wrapper)).toBe(true);

    let panels
        = <WrapperArray<Collapsible>> wrapper.findAllComponents({ref: 'in_progress_build_panel'});
    for (let panel of panels.wrappers) {
        expect(panel.vm.is_active).toBe(false);
    }

    expect(wrapper.findComponent({ref: 'build_image_task_detail'}).exists()).toBe(false);

    await panels.at(1).trigger('click');
    expect(panels.at(1).vm.is_active).toBe(true);
    expect(panels.filter(panel => panel.vm.is_active).length).toEqual(1);
    expect(wrapper.vm.selected_build_task).toEqual(task2);
    let build_task_detail
        = <Wrapper<BuildImageTaskDetail>> wrapper.findComponent(BuildImageTaskDetail);
    expect(build_task_detail.vm.build_task).toBe(task2);

    await panels.at(2).trigger('click');
    expect(panels.at(2).vm.is_active).toBe(true);
    expect(panels.filter(panel => panel.vm.is_active).length).toEqual(1);
    expect(wrapper.vm.selected_build_task).toEqual(task3);
    expect(build_task_detail.vm.build_task).toBe(task3);
});

test('Selecting image or build task deselects the other', async () => {
    let image = data_ut.make_sandbox_docker_image(null);
    let build_task = data_ut.make_build_sanbdox_docker_image_task(null, image);

    sinon.stub(ag_cli.SandboxDockerImage, 'get_images').resolves([image]);
    sinon.stub(ag_cli.BuildSandboxDockerImageTask, 'get_build_tasks').resolves([build_task]);

    let wrapper = managed_mount(SandboxImages);
    expect(await wait_for_load(wrapper)).toBe(true);

    let panels = wrapper.findAllComponents(Collapsible);

    // The build task in the "In Progress" section
    await panels.at(0).trigger('click');
    expect(wrapper.vm.selected_build_task).toEqual(build_task);
    expect(wrapper.vm.selected_image).toBeNull();

    // The image
    await panels.at(1).trigger('click');
    expect(wrapper.vm.selected_image).toEqual(image);
    expect(wrapper.vm.selected_build_task).toBeNull();

    // The build task in the image history
    await panels.at(2).trigger('click');
    expect(wrapper.vm.selected_build_task).toEqual(build_task);
    expect(wrapper.vm.selected_image).toBeNull();

    await panels.at(1).trigger('click');
    expect(wrapper.vm.selected_image).toEqual(image);
    expect(wrapper.vm.selected_build_task).toBeNull();

    // The build task in the full build history
    await panels.at(3).trigger('click');
    expect(wrapper.vm.selected_build_task).toEqual(build_task);
    expect(wrapper.vm.selected_image).toBeNull();
});

test('New image button', async () => {
    let image = data_ut.make_sandbox_docker_image(null);
    let build_task = data_ut.make_build_sanbdox_docker_image_task(null, image);

    sinon.stub(ag_cli.SandboxDockerImage, 'get_images').resolves([image]);
    sinon.stub(ag_cli.BuildSandboxDockerImageTask, 'get_build_tasks').resolves([build_task]);

    let wrapper = managed_mount(SandboxImages);
    expect(await wait_for_load(wrapper)).toBe(true);

    let panels = wrapper.findAllComponents(Collapsible);

    expect(wrapper.vm.selected_image).toBeNull();
    expect(wrapper.vm.selected_build_task).toBeNull();

    let new_image_button = wrapper.find('[data-testid=new_image_button]');

    await panels.at(0).trigger('click');
    expect(wrapper.vm.selected_build_task).toEqual(build_task);
    expect(wrapper.vm.selected_image).toBeNull();

    await new_image_button.trigger('click');
    expect(wrapper.vm.selected_image).toBeNull();
    expect(wrapper.vm.selected_build_task).toBeNull();

    await panels.at(1).trigger('click');
    expect(wrapper.vm.selected_image).toEqual(image);
    expect(wrapper.vm.selected_build_task).toBeNull();

    await new_image_button.trigger('click');
    expect(wrapper.vm.selected_image).toBeNull();
    expect(wrapper.vm.selected_build_task).toBeNull();
});

test('New bulid task event handled', async () => {
    sinon.stub(ag_cli.SandboxDockerImage, 'get_images').resolves([]);
    sinon.stub(ag_cli.BuildSandboxDockerImageTask, 'get_build_tasks').resolves([]);

    let wrapper = managed_mount(SandboxImages);
    expect(await wait_for_load(wrapper)).toBe(true);
    expect(wrapper.vm.selected_build_task).toBeNull();
    expect(wrapper.findAllComponents(Collapsible).length).toEqual(0);

    let build_task = data_ut.make_build_sanbdox_docker_image_task(null, null);
    wrapper.findComponent({ref: 'build_sandbox_image'}).vm.$emit('new_build_task', build_task);
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.selected_build_task).toEqual(build_task);
    // One "In progress" panel, one full build history panel
    expect(wrapper.findAllComponents(Collapsible).length).toEqual(2);
});

test('Image and task lists refreshed', async () => {
    let original_images = [
        data_ut.make_sandbox_docker_image(null),
        data_ut.make_sandbox_docker_image(null),
    ];
    let updated_images = original_images.concat([
        data_ut.make_sandbox_docker_image(null),
        data_ut.make_sandbox_docker_image(null),
        data_ut.make_sandbox_docker_image(null),
    ]);

    let original_build_tasks = [
        data_ut.make_build_sanbdox_docker_image_task(null, null),
        data_ut.make_build_sanbdox_docker_image_task(null, null),
        data_ut.make_build_sanbdox_docker_image_task(null, null),
    ];
    let updated_build_tasks = original_build_tasks.concat([
        data_ut.make_build_sanbdox_docker_image_task(null, null),
    ]);

    original_build_tasks.reverse();
    updated_build_tasks.reverse();
    let selected_image = original_images[1];
    let selected_build_task = original_build_tasks[0];

    sinon.stub(
        ag_cli.SandboxDockerImage, 'get_images'
    ).onFirstCall().resolves(
        original_images
    ).onSecondCall().resolves(
        updated_images
    ).onThirdCall().resolves(updated_images);

    sinon.stub(
        ag_cli.BuildSandboxDockerImageTask, 'get_build_tasks'
    ).onFirstCall().resolves(
        original_build_tasks
    ).onSecondCall().resolves(
        original_build_tasks
    ).onThirdCall().resolves(
        updated_build_tasks
    );

    let wrapper = managed_mount(SandboxImages);
    expect(await wait_for_load(wrapper)).toBe(true);

    expect(wrapper.vm.d_sandbox_images).toEqual(original_images);
    expect(wrapper.vm.d_build_tasks).toEqual(original_build_tasks);

    wrapper.vm.select_image(selected_image);
    await wrapper.vm.$nextTick();

    await wrapper.vm.load_images_and_build_tasks();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.selected_image).toEqual(selected_image);
    expect(wrapper.vm.d_sandbox_images).toEqual(updated_images);
    expect(wrapper.vm.d_build_tasks).toEqual(original_build_tasks);

    wrapper.vm.select_build_task(selected_build_task);
    await wrapper.vm.$nextTick();

    await wrapper.vm.load_images_and_build_tasks();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.selected_build_task).toEqual(selected_build_task);
    expect(wrapper.vm.d_sandbox_images).toEqual(updated_images);
    expect(wrapper.vm.d_build_tasks).toEqual(updated_build_tasks);
});

test('Refresh images and tasks event handled', async () => {
    let build_task = data_ut.make_build_sanbdox_docker_image_task(null, null);

    let get_images_stub = sinon.stub(ag_cli.SandboxDockerImage, 'get_images').resolves([]);
    let get_tasks_stub = sinon.stub(
        ag_cli.BuildSandboxDockerImageTask, 'get_build_tasks'
    ).resolves([build_task]);

    let wrapper = managed_mount(SandboxImages);
    expect(await wait_for_load(wrapper)).toBe(true);
    wrapper.vm.select_build_task(build_task);
    await wrapper.vm.$nextTick();
    expect(wrapper.findAllComponents(Collapsible).length).toEqual(2);

    let updated_task = deep_copy(build_task, ag_cli.BuildSandboxDockerImageTask);
    updated_task.status = ag_cli.BuildImageStatus.image_invalid;

    let new_image = data_ut.make_sandbox_docker_image(null);
    get_images_stub.onSecondCall().resolves([new_image]);
    get_tasks_stub.onSecondCall().resolves([updated_task]);

    wrapper.findComponent(BuildImageTaskDetail).vm.$emit('refresh_images_and_build_tasks');
    await wrapper.vm.$nextTick();
    expect(await wait_until(wrapper, w => !w.vm.d_loading_images_and_tasks)).toBe(true);

    expect(wrapper.vm.selected_build_task).toEqual(updated_task);
    expect(wrapper.vm.d_sandbox_images).toEqual([new_image]);
});

describe('Edit and delete image tests', () => {
    let images: ag_cli.SandboxDockerImage[];
    let wrapper: Wrapper<SandboxImages>;

    beforeEach(async () => {
        images = [
            data_ut.make_sandbox_docker_image(null, {display_name: 'Image 1'}),
            data_ut.make_sandbox_docker_image(null, {display_name: 'Image 2'}),
        ];

        sinon.stub(ag_cli.SandboxDockerImage, 'get_images').resolves(images.slice());
        sinon.stub(ag_cli.BuildSandboxDockerImageTask, 'get_build_tasks').resolves([]);

        wrapper = managed_mount(SandboxImages);
        expect(await wait_for_load(wrapper)).toBe(true);

        wrapper.vm.select_image(images[0]);
        await wrapper.vm.$nextTick();
    });

    test('Edit name', async () => {
        let save_stub = sinon.stub(ag_cli.SandboxDockerImage.prototype, 'save');
        let new_name = 'Z Image';
        let original_name = images[0].display_name;

        let input = wrapper.findComponent({ref: 'edit_image_name'});
        await set_validated_input_text(input, new_name);
        expect(validated_input_is_valid(input)).toBe(true);
        expect(wrapper.vm.selected_image?.display_name).toEqual(original_name);

        await wrapper.findComponent({ref: 'edit_image_form'}).trigger('submit');
        expect(await wait_until(wrapper, w => !w.vm.d_saving_image_name)).toBe(true);
        expect(save_stub.calledOnce).toBe(true);
        expect(wrapper.vm.selected_image?.display_name).toEqual(new_name);

        // Images should be re-sorted
        expect(wrapper.vm.d_sandbox_images[1].pk).toEqual(images[0].pk);
        expect(wrapper.vm.d_sandbox_images[0].display_name).toEqual(images[1].display_name);
        expect(wrapper.vm.d_sandbox_images[1].display_name).toEqual(new_name);
    });

    test('Invalid name is empty', async () => {
        let input = wrapper.findComponent({ref: 'edit_image_name'});
        await set_validated_input_text(input, '');
        expect(validated_input_is_valid(input)).toBe(false);
    });

    test('API errors handled', async () => {
        sinon.stub(ag_cli.SandboxDockerImage.prototype, 'save').rejects(
            new ag_cli.HttpError(400, 'Noooope')
        );
        await wrapper.findComponent({ref: 'edit_image_form'}).trigger('submit');
        expect(await wait_until(wrapper, w => !w.vm.d_saving_image_name)).toBe(true);

        let api_errors = <APIErrors> wrapper.findComponent({ref: 'api_errors'}).vm;
        expect(api_errors.d_api_errors.length).toBe(1);
    });

    test('Delete image', async () => {
        let delete_stub = sinon.stub(images[0], 'delete');

        // When an image is deleted, it's build history should also be removed.
        let associated_build_task = data_ut.make_build_sanbdox_docker_image_task(null, images[0]);
        wrapper.vm.d_build_tasks.unshift(associated_build_task);

        await wrapper.find('[data-testid=show_delete_modal_button]').trigger('click');
        await wrapper.find('[data-testid=delete_image_button]').trigger('click');

        expect(await wait_until(wrapper, w => !w.vm.d_deleting)).toBe(true);
        expect(delete_stub.callCount).toEqual(1);

        expect(wrapper.vm.d_sandbox_images).toEqual(images.slice(1));
        expect(wrapper.findAllComponents(Collapsible).length).toEqual(images.length - 1);
        expect(wrapper.vm.d_build_tasks.length).toEqual(0);

        expect(wrapper.vm.d_show_delete_image_modal).toBe(false);
        expect(wrapper.findComponent({ref: 'delete_image_modal'}).exists()).toBe(false);
    });

    test('Delete image API errors handled', async () => {
        sinon.stub(images[0], 'delete').rejects(new ag_cli.HttpError(400, 'Noooope'));

        await wrapper.find('[data-testid=show_delete_modal_button]').trigger('click');
        await wrapper.find('[data-testid=delete_image_button]').trigger('click');

        expect(await wait_until(wrapper, w => !w.vm.d_deleting)).toBe(true);
        expect(wrapper.vm.d_sandbox_images).toEqual(images);
        expect(wrapper.findAllComponents(Collapsible).length).toEqual(images.length);

        let api_errors = <APIErrors> wrapper.findComponent({ref: 'delete_errors'}).vm;
        expect(api_errors.d_api_errors.length).toBe(1);
    });
});
