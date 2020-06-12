<template>
  <div v-if="d_loading" class="loading-centered loading-large">
    <i class="fa fa-spinner fa-pulse"></i>
  </div>
  <div v-else class="sandbox-images sidebar-container">
    <div class="sidebar-menu">
      <div class="sidebar-header" :class="{'sidebar-header-closed': d_sidebar_collapsed}">
        <span class="sidebar-collapse-button" @click="d_sidebar_collapsed = !d_sidebar_collapsed">
          <i class="fas fa-bars"></i>
        </span>
        <template v-if="!d_sidebar_collapsed">
          <span class="sidebar-header-text">Sandbox Images</span>
          <button type="button" class="sidebar-new-button"
                  @click="show_new_image_build">
            <i class="fas fa-plus sidebar-plus"></i> New Image
          </button>

        </template>
      </div>
      <div class="sidebar-content" v-if="!d_sidebar_collapsed">
        <div class="sidebar-section-header">In Progress</div>
        <collapsible
          v-for="build_task of in_progress_new_image_tasks" :key="`build${build_task.pk}`"
          :include_caret="false"
          :is_active="d_selected_build_task !== null && d_selected_build_task.pk === build_task.pk"
          @click="select_build_task(build_task)"
        >
          <template v-slot:header_text>
            {{build_task.image === null ? 'New Image' : build_task.image.display_name}} -
            {{format_datetime_short(build_task.created_at)}}
          </template>
          <template v-slot:header_icons>
            <build-image-status-icon :status="build_task.status" class="icon"/>
          </template>
        </collapsible>

        <div class="sidebar-section-spacing">
          <div class="sidebar-section-header">Images</div>

          <collapsible
            v-for="item of completed_tasks_by_image" :key="`image${item.image.pk}`"
            :stay_open="d_selected_image !== null && d_selected_image.pk !== item.image.pk"
            @click="select_image(item.image)"
            :is_active="d_selected_image !== null && d_selected_image.pk === item.image.pk"
            :indentation_level="1"
          >
            <template v-slot:header_text>
              {{item.image.display_name}}
            </template>
            <collapsible
              v-for="build_task of item.build_tasks" :key="`build${build_task.pk}`"
              :include_caret="false"
              :indentation_level="2"
              @click.stop="select_build_task(build_task)"
              :is_active="d_selected_build_task !== null
                          && d_selected_build_task.pk === build_task.pk"
              :always_show_icons="true"
            >
              <template v-slot:header_text>
                {{format_datetime_short(build_task.created_at)}}
              </template>
              <template v-slot:header_icons>
                <build-image-status-icon :status="build_task.status" class="icon"/>
              </template>
            </collapsible>
          </collapsible>
        </div>

        <div class="sidebar-section-spacing">
          <div class="sidebar-section-header">Full Build History</div>

          <collapsible
            v-for="build_task of full_build_history" :key="`build${build_task.pk}`"
            :include_caret="false"
            :is_active="d_selected_build_task !== null
                        && d_selected_build_task.pk === build_task.pk"
            :always_show_icons="true"
            @click="select_build_task(build_task)"
          >
            <template v-slot:header_text>
              {{build_task.image === null ? 'New Image' : build_task.image.display_name}} -
              {{format_datetime_short(build_task.created_at)}}
            </template>
            <template v-slot:header_icons>
              <build-image-status-icon :status="build_task.status" class="icon"/>
            </template>
          </collapsible>
        </div>
      </div>
    </div>
    <div class="body" :class="{'body-closed': d_sidebar_collapsed}">
      <template v-if="d_selected_image !== null">
        <div class="edit-image-header">Edit "{{d_selected_image.display_name}}"</div>
        <validated-form @submit="save_selected_image_name"
                        @form_validity_changed="d_image_name_is_valid = $event">
          <label class="label">
            Image Name
            <validated-input v-model="d_edited_image_name" :validators="[is_not_empty]"/>
          </label>

          <APIErrors ref="api_errors"/>

          <div class="button-footer">
            <button type="submit" class="save-button"
                    :disabled="!d_image_name_is_valid || d_saving_image_name">
              Save
            </button>

            <div class="last-saved-timestamp">
              <template v-if="!d_saving_image_name">
                Last saved: {{format_datetime_short(d_selected_image.last_modified)}}
              </template>
              <i v-else class="loading fa fa-spinner fa-pulse"></i>
            </div>

          </div>
        </validated-form>
      </template>

      <!-- If an image is selected or nothing is selected, we want to show
           the "build image" component. If an image is selected, it
           will rebuild the selected image. Otherwise, it will build
           a new image. -->
      <template v-if="d_selected_image !== null || d_selected_build_task === null">
        <div class="edit-image-header extra-space" v-if="d_selected_image !== null">
          Rebuild "{{d_selected_image.display_name}}"
        </div>
        <div v-else class="edit-image-header">
          Build New Image
        </div>

        <build-sandbox-image
          :course="course"
          :sandbox_image="d_selected_image"
          @new_build_task="d_build_tasks.push($event); select_build_task($event)"
          ></build-sandbox-image>
      </template>

      <build-image-task-detail
        v-if="d_selected_build_task !== null"
        :build_task="d_selected_build_task"
        @refresh_selected_build_task="refresh_selected_build_task"/>


    <div class="danger-zone-container" v-if="d_selected_image !== null">
      <div class="danger-text">
        Delete "{{d_selected_image.display_name}}"
      </div>
      <button class="delete-button"
              data-testid="show_delete_modal_button"
              type="button"
              @click="d_show_delete_image_modal = true">
        Delete
      </button>

      <modal v-if="d_show_delete_image_modal"
              @close="d_show_delete_image_modal = false"
              ref="delete_image_modal"
              size="large"
              :click_outside_to_close="!d_deleting"
              :show_closing_x="!d_deleting">
        <div class="modal-header">
          Confirm Delete
        </div>

        <div class="modal-body">
          Are you sure you want to delete the image
          <span class="item-to-delete">
            "{{d_selected_image.display_name}}"
          </span> and its build history? <br><br>
          Any test cases that rely on this image may have to be updated
          before they'll run correctly again.<br>
          THIS ACTION CANNOT BE UNDONE.

          <APIErrors ref="delete_errors"></APIErrors>
          <div class="modal-button-footer">
            <button class="delete-button"
                    :disabled="d_deleting"
                    @click="delete_selected_image"> Delete </button>

            <button class="modal-cancel-button white-button"
                    @click="d_show_delete_image_modal = false"
                    :disabled="d_deleting"> Cancel </button>
          </div>
        </div>
      </modal>
    </div>
    </div>
  </div>
</template>

<script lang="ts">
import { CreateElement } from 'vue';
import { Component, Prop, Vue } from 'vue-property-decorator';

import {
  BuildImageStatus,
  BuildSandboxDockerImageTask,
  Course,
  ID,
  SandboxDockerImage,
} from 'ag-client-typescript';

import APIErrors from '@/components/api_errors.vue';
import Collapsible from '@/components/collapsible.vue';
import FileUpload from '@/components/file_upload.vue';
import Modal from '@/components/modal.vue';
import ValidatedForm from '@/components/validated_form.vue';
import ValidatedInput from '@/components/validated_input.vue';
import { handle_api_errors_async, handle_global_errors_async, make_error_handler_func } from '@/error_handling';
import { Poller } from '@/poller';
import { SafeMap } from '@/safe_map' ;
import { assert_not_null, deep_copy, format_datetime_short, safe_assign, toggle } from '@/utils';
import { is_not_empty } from '@/validators';

import BuildImageStatusIcon from './build_image_status_icon.vue';
import BuildImageTaskDetail from './build_image_task_detail.vue';
import BuildSandboxImage from './build_sandbox_image.vue';

interface BuildTasksForImage {
  image: SandboxDockerImage;
  build_tasks: BuildSandboxDockerImageTask[];
}

@Component({
  components: {
    APIErrors,
    BuildSandboxImage,
    BuildImageStatusIcon,
    BuildImageTaskDetail,
    Collapsible,
    FileUpload,
    Modal,
    ValidatedForm,
    ValidatedInput,
  }
})
export default class SandboxImages extends Vue {
  @Prop({default: null, type: Course})
  course!: Course;

  d_loading = true;
  d_sandbox_images: SandboxDockerImage[] = [];
  d_build_tasks: BuildSandboxDockerImageTask[] = [];

  d_selected_image: SandboxDockerImage | null = null;
  d_selected_build_task: BuildSandboxDockerImageTask | null = null;

  image_poller: Poller | null = null;

  d_sidebar_collapsed = false;

  d_starting_build = false;
  d_file_upload_progress = 0;

  readonly format_datetime_short = format_datetime_short;

  d_edited_image_name = '';
  d_saving_image_name = false;
  d_image_name_is_valid = false;

  readonly is_not_empty = is_not_empty;

  d_show_delete_image_modal = false;
  d_deleting = false;

  d_refreshing_selected_build_task = false;

  async created() {
    await this.load_images_and_build_tasks();
    this.d_loading = false;

    this.image_poller = new Poller(() => this.load_images_and_build_tasks(), 30);
    // tslint:disable-next-line no-floating-promises
    // this.image_poller.start_after_delay();
  }

  beforeDestroy() {
    if (this.image_poller !== null) {
      this.image_poller.stop();
    }
  }

  @handle_global_errors_async
  async load_images_and_build_tasks() {
    [this.d_sandbox_images, this.d_build_tasks] = await Promise.all([
      await SandboxDockerImage.get_images(this.course?.pk ?? null),
      await BuildSandboxDockerImageTask.get_build_tasks(this.course?.pk ?? null)
    ]);

    if (this.d_selected_image !== null) {
      let image = this.d_sandbox_images.find(image => image.pk === this.d_selected_image?.pk);
      assert_not_null(image);
      this.d_selected_image = image;
    }

    if (this.d_selected_build_task !== null) {
      let build_task = this.d_build_tasks.find(task => task.pk === this.d_selected_build_task?.pk);
      assert_not_null(build_task);
      this.d_selected_build_task = build_task;
    }
  }

  // Returns an array of pairs. The first item in each pair is a
  // SandboxDockerImage, and the second item is an array
  // of BuildSandboxDockerImageTasks associated with that image.
  get completed_tasks_by_image(): BuildTasksForImage[] {
    assert_not_null(this.d_sandbox_images);
    assert_not_null(this.d_build_tasks);
    let tasks_by_image_pk = new SafeMap<ID, BuildSandboxDockerImageTask[]>();

    for (let task of this.d_build_tasks) {
      if (task.image === null) {
        continue;
      }
      tasks_by_image_pk.get(task.image.pk, [], true).push(task);
    }

    let result: BuildTasksForImage[] = [];
    for (let image of this.d_sandbox_images) {
      result.push({image: image, build_tasks: tasks_by_image_pk.get(image.pk, [])});
    }

    return result;
  }

  get in_progress_new_image_tasks() {
    return this.d_build_tasks.filter(task => {
      return task.image === null
        && (task.status === BuildImageStatus.queued
            || task.status === BuildImageStatus.in_progress);
    });
  }

  get full_build_history() {
    return this.d_build_tasks.sort((first, second) => second.pk - first.pk);
  }

  show_new_image_build() {
    this.d_selected_image = null;
    this.d_selected_build_task = null;
  }

  select_image(image: SandboxDockerImage) {
    this.d_selected_image = image;
    this.d_selected_build_task = null;
    this.d_edited_image_name = image.display_name;
  }

  select_build_task(build_task: BuildSandboxDockerImageTask) {
    this.d_selected_build_task = build_task;
    this.d_selected_image = null;
  }

  @handle_api_errors_async(make_error_handler_func())
  save_selected_image_name() {
    assert_not_null(this.d_selected_image);
    let to_update = deep_copy(this.d_selected_image, SandboxDockerImage);
    to_update.display_name = this.d_edited_image_name;
    return toggle(this, 'd_saving_image_name', async () => {
      await to_update.save();
      assert_not_null(this.d_selected_image);
      safe_assign(this.d_selected_image, to_update);
    });
  }

  @handle_api_errors_async(make_error_handler_func('delete_errors'))
  delete_selected_image() {
    return toggle(this, 'd_deleting', async () => {
      assert_not_null(this.d_selected_image);
      await this.d_selected_image.delete();

      this.d_sandbox_images.splice(
        this.d_sandbox_images.findIndex(image => image.pk === this.d_selected_image?.pk),
        1
      );
      this.d_build_tasks = this.d_build_tasks.filter(
        build_task => build_task.image?.pk !== this.d_selected_image?.pk
      );

      this.d_selected_image = null;
    });
  }

  @handle_global_errors_async
  refresh_selected_build_task() {
    return toggle(this, 'd_refreshing_selected_build_task', async () => {
      assert_not_null(this.d_selected_build_task);
      let refreshed = await BuildSandboxDockerImageTask.get_by_pk(this.d_selected_build_task.pk);
      safe_assign(this.d_selected_build_task, refreshed);
    });
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/button_styles.scss';
@import '@/styles/collapsible_sidebar.scss';
@import '@/styles/forms.scss';
@import '@/styles/loading.scss';
@import '@/styles/modal.scss';
@import '@/styles/section_header.scss';

$border-color: $gray-blue-1;

@include collapsible-sidebar(
  $sidebar-width: 300px,
  $sidebar-header-height: 2.5rem,
  $sidebar-header-font-size: 1rem,
  $background-color: white,
  $border-color: $border-color,
  $stretch: true
);

.sidebar-section-header {
  @include section-header(
    $line-color: $stormy-gray-dark,
    $text-color: $stormy-gray-dark,
  );
  padding-left: .125rem;
  padding-right: .125rem;

  font-size: 1rem;
}

.sidebar-section-spacing {
  margin-top: .5rem;
}

.icon {
  padding: .375rem;
}

.body {
  padding: .5rem;
}

.edit-image-header {
  @include section_header(
    $line-color: lighten($ocean-blue, 5%),
    $text-color: darken($ocean-blue, 5%),
  );
  font-size: 1.5rem;
  margin-bottom: .5rem;

}

.extra-space {
  margin-top: 1.5rem;
}

.button-footer {
  margin: .5rem 0;

  .save-button {
    padding: .25rem .625rem;
  }
}
</style>
