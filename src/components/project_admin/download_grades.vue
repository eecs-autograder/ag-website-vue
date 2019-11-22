<template>
  <div v-if="d_loading" class="loading-large">
    <i class="fa fa-spinner fa-pulse"></i>
  </div>
  <div v-else id="download-grades-component">
    <div id="download-options">
      <div id="download-grades-section">

        <div class="option-container">
          <div class="download-option-label">What do you want to download?</div>
          <div class="radio-container">
            <input type="radio" name="grades_or_files_choice"
                   id="grades-choice"
                   class="radio"
                   v-model="d_download_grades"
                   :value="true">
            <label class="label" for="grades-choice">Grades</label>
          </div>
          <div class="radio-container">
            <input type="radio" name="grades_or_files_choice"
                   id="files-choice"
                   class="radio"
                   v-model="d_download_grades"
                   :value="false">
            <label class="label" for="files-choice">Submitted Files</label>
          </div>
        </div>

        <div class="option-container">
          <div class="download-option-label">Which submissions?</div>
          <div class="radio-container">
            <input type="radio" name="submissions_choice"
                   id="final-graded-choice"
                   class="radio"
                   v-model="d_final_graded_submissions_only"
                   :value="true">
            <label class="label" for="final-graded-choice">Final graded submissions</label>
          </div>
          <div class="radio-container">
            <input type="radio" name="submissions_choice"
                   id="all-choice"
                   class="radio"
                   v-model="d_final_graded_submissions_only"
                   :value="false">
            <label class="label" for="all-choice">All submissions</label>
          </div>
        </div>

        <div class="option-container">
          <div class="checkbox-input-container">
            <input id="include-staff"
                   type="checkbox"
                   class="checkbox"
                   v-model="d_include_staff"/>
            <label class="checkbox-label"
                   for="include-staff">
              Include staff
            </label>
          </div>
        </div>

        <button class="download-button"
                type="button"
                :disabled="d_creating_download_task"
                @click="create_download_task">
          Start task
        </button>
      </div>
    </div>

    <div id="download-results">
      <div id="download-results-label"> Tasks </div>
      <div id="downloads-table">

        <div id="download-table-labels">
          <div id="started-at-header"> Started at </div>
          <div id="file-header"> File </div>
          <div id="progress-header"> Progress </div>
        </div>

        <div v-for="(download, index) of d_downloads"
            :class="['download-row', {'even-row': index % 2 == 0}]">
          <div class="started-at">{{format_datetime_short(download.created_at)}}</div>
          <div class="file">
            <a v-if="download.progress === 100 && download.error_msg.length === 0"
               @click="download_task_result(download)"
               class="file-name">{{get_filename(download)}}
            </a>
            <template v-if="download.error_msg.length !== 0">ERROR</template>
          </div>
          <div class="progress">{{download.progress}}%</div>
        </div>
      </div>
    </div>

    <progress-overlay v-if="d_downloading_result"
                      :progress="d_downloading_result_progress"></progress-overlay>
  </div>
</template>

<script lang="ts">
import { Component, Inject, Prop, Vue } from 'vue-property-decorator';

import { HttpClient, Project } from 'ag-client-typescript';
import * as FileSaver from 'file-saver';

import { GlobalData } from '@/app.vue';
import ProgressOverlay from '@/components/progress_overlay.vue';
import { Created, Destroyed } from '@/lifecycle';
import { Poller } from '@/poller';
import { format_datetime_short, sleep, toggle, zip } from '@/utils';

export enum DownloadType {
  all_scores = 'all_scores',
  final_graded_submission_scores = 'final_graded_submission_scores',
  all_submission_files = 'all_submission_files',
  final_graded_submission_files = 'final_graded_submission_files'
}

// The API for DownloadTask has significant design issues, and it will likely
// be rewritten or replaced in the future.
export interface DownloadTask {
  pk: number;
  project: number;
  download_type: DownloadType;
  result_filename: string;
  progress: number;
  error_msg: string;
  created_at: string;
}

@Component({
  components: {
    ProgressOverlay,
  }
})
export default class DownloadGrades extends Vue implements Created, Destroyed {
  @Inject({from: 'globals'})
  globals!: GlobalData;
  d_globals = this.globals;

  @Prop({required: true, type: Project})
  project!: Project;

  d_loading = true;
  d_downloads: DownloadTask[] = [];

  d_download_grades = true;
  d_include_staff = false;
  d_final_graded_submissions_only = true;
  d_creating_download_task = false;

  d_downloading_result = false;
  d_downloading_result_progress: number | null = null;

  downloads_poller: Poller | null = null;

  readonly format_datetime_short = format_datetime_short;

  async created() {
    await this.load_download_tasks();
    this.d_loading = false;
    this.downloads_poller = new Poller(() => this.load_download_tasks(), 15);
    // tslint:disable-next-line no-floating-promises
    this.downloads_poller.start_after_delay();
  }

  async load_download_tasks() {
    let response = await HttpClient.get_instance().get<DownloadTask[]>(
      `/projects/${this.project.pk}/download_tasks/`);
    this.d_downloads = response.data.sort((first, second) => second.pk - first.pk);
  }

  destroyed() {
    if (this.downloads_poller !== null) {
      this.downloads_poller.stop();
    }
  }

  create_download_task() {
    return toggle(this, 'd_creating_download_task', async () => {
      let download_type: DownloadType;
      if (this.d_download_grades) {
        download_type
          = this.d_final_graded_submissions_only
            ? DownloadType.final_graded_submission_scores : DownloadType.all_scores;
      }
      else {
        download_type
          = this.d_final_graded_submissions_only
            ? DownloadType.final_graded_submission_files : DownloadType.all_submission_files;
      }

      let response = await HttpClient.get_instance().post<DownloadTask>(
        this.get_create_task_url(download_type), {download_type: download_type});

      this.d_downloads.unshift(response.data);
    });
  }

  get_create_task_url(download_type: DownloadType) {
    let base_url = `/projects/${this.project.pk}/`;
    if (download_type === DownloadType.all_scores) {
      base_url += 'all_submission_scores/';
    }
    else if (download_type === DownloadType.final_graded_submission_scores) {
      base_url += 'ultimate_submission_scores/';
    }
    else if (download_type === DownloadType.all_submission_files) {
      base_url += 'all_submission_files/';
    }
    else if (download_type === DownloadType.final_graded_submission_files) {
      base_url += 'ultimate_submission_files/';
    }

    if (this.d_include_staff) {
      base_url += '?include_staff=true';
    }
    return base_url;
  }

  get_filename(download_task: DownloadTask) {
    let file_suffix = null;
    if (download_task.download_type === DownloadType.all_scores) {
        file_suffix = '_all_scores.csv';
    }
    else if (download_task.download_type === DownloadType.final_graded_submission_scores) {
        file_suffix = '_final_graded_submission_scores.csv';
    }
    else if (download_task.download_type === DownloadType.all_submission_files) {
        file_suffix = '_all_submission_files.zip';
    }
    else if (download_task.download_type === DownloadType.final_graded_submission_files) {
        file_suffix = '_final_graded_submission_files.zip';
    }
    return this.project.name + file_suffix;
  }

  download_task_result(download_task: DownloadTask) {
    return toggle(this, 'd_downloading_result', async () => {
      let response = await HttpClient.get_instance().get<string>(
        `/download_tasks/${download_task.pk}/result/`,
        {on_download_progress:
          (event: ProgressEvent) => {
            if (event.lengthComputable) {
              this.d_downloading_result_progress = 100 * (1.0 * event.loaded / event.total);
            }
          }
        }
      );
      FileSaver.saveAs(new File([response.data], this.get_filename(download_task)));
      this.d_downloading_result_progress = null;
    });
  }
}

</script>

<style scoped lang="scss">
@import '@/styles/button_styles.scss';
@import '@/styles/colors.scss';
@import '@/styles/forms.scss';

* {
  font-size: 14px;
  box-sizing: border-box;
}

#download-grades-component {
  padding: 15px 25px;
}

#download-options {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 0 10px 10px 10px;
  width: 100%;
}

#download-grades-section {
  padding: 10px 0 0;
}

.download-section-label {
  font-weight: bold;
  font-size: 20px;
  margin-bottom: 10px;
}

.download-option-label {
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 3px;
}

.download-button {
  @extend .green-button;
  margin: 10px 0;
  font-size: 14px;
}

.option-container {
  margin: 0 0 10px;
}

.checkbox-input-container {
  padding-top: 0;
  padding-bottom: 0;
}

#download-results {
  margin: 0 0 20px 0;
}

#download-results-label {
  font-weight: bold;
  font-size: 20px;
  padding: 10px 10px 10px 10px;
}

#download-table-labels, .download-row {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-content: center;
  width: 100%;
}

.download-row:hover {
  background-color: darken($white-gray, 5);
}

$started-at-column-width: 30%;
$file-column-width: 50%;
$progress-column-width: 20%;

#started-at-header {
  padding: 10px;
  width: $started-at-column-width;
  font-weight: bold;
}

#file-header {
  padding: 10px;
  width: $file-column-width;
  font-weight: bold;
}

#progress-header {
  padding: 10px;
  width: $progress-column-width;
  font-weight: bold;
}

.started-at {
  padding: 10px;
  width: $started-at-column-width;
}

.file {
  padding: 10px;
  width: $file-column-width;
}

.progress {
  padding: 10px;
  width: $progress-column-width;
}

.file-name {
  color: $ocean-blue;
  word-break: break-word;
}

.file-name:hover {
  text-decoration: underline;
  cursor: pointer;
}

.even-row {
  background-color: $white-gray;
}

</style>
