<template>
  <div id="download-grades-component">
    <div id="download-options">
      <div id="download-grades-section">
        <div class="download-section-label"> Download Options </div>

        <div class="toggle-container">
          <Toggle v-model="d_download_grades"
                  :active_background_color="d_active_toggle_color">
            <div slot="on">
              <p class="toggle-option"> Download Scores </p>
            </div>
            <div slot="off">
              <p class="toggle-option"> Download Files </p>
            </div>
          </Toggle>
        </div>

        <div class="toggle-container">
          <Toggle v-model="d_include_staff"
                  :active_background_color="d_active_toggle_color">
            <div slot="on">
              <p class="toggle-option"> Include Staff </p>
            </div>
            <div slot="off">
              <p class="toggle-option"> Exclude Staff </p>
            </div>
          </Toggle>
        </div>

        <div class="toggle-container">
          <Toggle v-model="d_final_graded_submissions_only"
                  :active_background_color="d_active_toggle_color">
            <div slot="on">
              <p class="toggle-option"> Final Graded Submissions Only </p>
            </div>
            <div slot="off">
              <p class="toggle-option"> All Submissions </p>
            </div>
          </Toggle>
        </div>

        <button class="download-button"
                type="button"
                :disabled="d_downloading"
                @click="d_download_grades
                        ? download_submission_scores() : download_submission_files()">
          Start Download
        </button>
      </div>
    </div>

    <div id="download-results">
      <div id="download-results-label"> Downloads </div>
      <table id="downloads-table">
        <tr>
          <th class="started-at-header"> Started at </th>
          <th class="file-header"> File </th>
          <th class="progress-header"> Progress </th>
        </tr>

        <tr v-for="download of d_downloads"
            class="download-row">
          <td class="started-at">{{format_datetime(download.created_at)}}</td>
          <td class="file">
            <a v-if="download.progress === 100 && !download.error_msg"
               @click="download_task_result(download)"
               class="file-name">{{get_filename(download)}}
            </a>
          </td>
          <td class="progress"> Carousel of Progress </td>
        </tr>
      </table>
    </div>

  </div>
</template>

<script lang="ts">
import { Component, Inject, Prop, Vue } from 'vue-property-decorator';

import { Project } from 'ag-client-typescript';
import * as FileSaver from 'file-saver';

import { GlobalData } from '@/app.vue';
import Toggle from "@/components/toggle.vue";
import { format_datetime } from '@/utils';

export enum DownloadType {
    all_scores = 'all_scores',
    final_graded_submission_scores = 'final_graded_submission_scores',
    all_submission_files = 'all_submission_files',
    final_graded_submission_files = 'final_graded_submission_files'
}

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
    Toggle
  }
})
export default class DownloadGrades extends Vue {
  @Inject({from: 'globals'})
  globals!: GlobalData;
  d_globals = this.globals;

  @Prop({required: true, type: Project})
  project!: Project;

  d_active_toggle_color = 'hsl(212, 50%, 37%)';
  d_downloads: DownloadTask[] = [];

  d_download_grades = true;
  d_include_staff = false;
  d_final_graded_submissions_only = false;
  d_downloading = false;

  readonly format_datetime = format_datetime;

  async created() {
    let first_download: DownloadTask = {
      pk: 1,
      project: this.project.pk,
      download_type: DownloadType.all_scores,
      result_filename: "filename_1",
      progress: 0,
      error_msg: "",
      created_at: "2019-02-15T20:44:30.534985Z"
    };

    let second_download: DownloadTask = {
      pk: 2,
      project: this.project.pk,
      download_type: DownloadType.final_graded_submission_files,
      result_filename: "filename_2",
      progress: 100,
      error_msg: "",
      created_at: "2019-02-15T20:41:30.534985Z"
    };
    this.d_downloads = [first_download, second_download];
  }

  async download_submission_files() {
      this.d_downloading = true;
      console.log("Downloading submission files");

      let base_url = `/api/projects/${this.project.pk}/`;
      base_url += this.d_final_graded_submissions_only
                  ? 'ultimate_submission_files/' : 'all_submission_files/';
      let download_url = this.get_download_url(base_url);
      // let new_task = await this.http.post<DownloadTask>(download_url, {}).toPromise();
      // this.downloads.unshift(new_task);
      // this.subscribe_to(this.poll_for_task_updates(new_task));

      this.d_downloading = false;
  }

  async download_submission_scores() {
      this.d_downloading = true;
      console.log("Downloading submission scores");

      let base_url = `/api/projects/${this.project.pk}/`;
      base_url += this.d_final_graded_submissions_only
                  ? 'ultimate_submission_scores/' : 'all_submission_scores/';
      let download_url = this.get_download_url(base_url);
      // let new_task = await this.http.post<DownloadTask>(download_url, {}).toPromise();
      // this.downloads.unshift(new_task);
      // this.subscribe_to(this.poll_for_task_updates(new_task));

      this.d_downloading = false;
  }

  poll_for_task_updates(download_task: DownloadTask) {}

  make_task_poller() {}

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

  get_download_url(url_base: string) {
    if (this.d_include_staff) {
      url_base += '?include_staff=true';
    }
    return url_base;
  }

  async download_task_result(download_task: DownloadTask) {
    console.log("Download file");
    let url = `/api/download_tasks/${download_task.pk}/result/`;
    // await download_file(this.http, url, this.get_filename(download_task));
  }

}

</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';
@import '@/styles/button_styles.scss';

#download-grades-component {
  padding: 15px 25px;
}

#download-options {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
}

#download-grades-section {
  padding: 10px 0 30px 0;
  min-width: 500px;
  width: 50%;
}

#download-files-section {
  padding: 10px 0 10px 0;
  min-width: 500px;
  width: 50%;
}

.download-section-label {
  font-weight: bold;
  font-size: 20px;
  margin-bottom: 10px;
}

.download-button {
  @extend .light-gray-button;
  margin: 15px 0 10px 0;
}

.toggle-container {
  padding: 10px 0;
}

#download-results {
  margin: 40px 0 20px 0;
}

#download-results-label {
  font-weight: bold;
  font-size: 20px;
  padding: 10px 10px 10px 0;
}

#downloads-table {
  width: 100%;
  border-collapse: collapse;
}

.started-at {
  padding: 10px 10px 10px 0;
}

.progress {
  padding: 10px;
}

.started-at-header {
  padding: 10px 10px 5px 0;
  border-bottom: 2px solid $white-gray;
}

.file-header, .progress-header {
  padding: 10px 10px 5px 10px;
  border-bottom: 2px solid $white-gray;
}

.file-name {
  color: $ocean-blue;
  padding: 10px;
}

.file-name:hover {
  text-decoration: underline;
  cursor: pointer;
}

</style>
