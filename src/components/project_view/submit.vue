<template>
  <div id="submit-component">
    <div id="deadline-container">
      <div id="deadline-text" v-if="project.soft_closing_time !== null">
        Due at
        <span id="deadline" class="date">{{format_datetime(project.soft_closing_time)}}</span>
      </div>
      <div id="extension-text" v-if="group.extended_due_date !== null">
        Extension:
        <span id="extension" class="date">{{format_datetime(group.extended_due_date)}}</span>
      </div>
    </div>

    <div id="group-members-container" v-if="group.member_names.length > 1">
      <div id="group-members-title">Group members</div>
      <div v-for="(member, index) of group.member_names">
        <div :class="['group-member',
                      {'odd-row': index % 2 !== 0}]">
          {{member}}
        </div>
      </div>
    </div>

    <file-upload ref="instructor_files_upload" @upload_files="submit">
      <template v-slot:upload_button_text>
        Submit
      </template>
    </file-upload>

    <modal ref="confirm_submit_modal"
           size="large"
           include_closing_x>
      <div class="modal-header">
        Submit
      </div>
      <hr>
      <div class="modal-body">
        <div class="file-list-header">Files to submit</div>
        <ul class="file-list">
          <li v-for="filename of submitted_filenames" class="list-item">{{filename}}</li>
        </ul>

        <div class="file-list-header">
          <i class="fas fa-exclamation-triangle"></i>
          Missing files detected
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <ul class="file-list">
          <li v-for="filename of missing_files" class="list-item">
            <div class="filename">{{filename}}</div>
          </li>
          <li v-for="mismatch of patterns_with_too_few_matches" class="list-item">
            Expected at least
            <span class="num-files">{{mismatch.num_expected}}</span>
            file(s) matching the pattern
            <span class="filename">{{mismatch.pattern}}</span> but got
            <span class="num-files">{{mismatch.actual_num}}</span>
          </li>
        </ul>

        <div class="file-list-header">
          <i class="fas fa-exclamation-triangle"></i>
          Extra files detected (these will be discarded arbitrarily)
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <ul class="file-list">
          <li v-for="filename of unexpected_files" class="list-item filename">{{filename}}</li>
          <li v-for="mismatch of patterns_with_too_many_matches" class="list-item">
            Expected no more than
            <span class="num-files">{{mismatch.num_expected}}</span>
            file(s) matching the pattern
            <span class="filename">{{mismatch.pattern}}</span> but got
            <span class="num-files">{{mismatch.actual_num}}</span>
          </li>
        </ul>
      </div>
      <div class="modal-footer">
      </div>
    </modal>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import { Group, Project, ExpectedStudentFile } from 'ag-client-typescript';
import * as minimatch from 'minimatch';

import Modal from '@/components/modal.vue';
import FileUpload from '@/components/file_upload.vue';
import { format_datetime } from '@/utils';

interface ExpectedFilePatternMismatch {
  pattern: string;
  num_expected: number;
  actual_num: number;
}

@Component({
  components: {
    FileUpload,
    Modal,
  }
})
export default class Submit extends Vue {
  @Prop({required: true, type: Project})
  project!: Project;

  @Prop({required: true, type: Group})
  group!: Group;

  readonly format_datetime = format_datetime;

  d_submitting = false;
  d_submit_progress = 0;

  submitted_filenames: string[] = [];
  unexpected_files: string[] = [];
  missing_files: string[] = [];
  patterns_with_too_few_matches: ExpectedFilePatternMismatch[] = [];
  patterns_with_too_many_matches: ExpectedFilePatternMismatch[] = [];

  get file_mismatches_present() {
    return this.unexpected_files.length !== 0
           || this.missing_files.length !== 0
           || this.patterns_with_too_few_matches.length !== 0
           || this.patterns_with_too_many_matches.length !== 0;
  }

  submit(files: File[]) {
    console.log('submit');
    console.log(files);
    this.submitted_filenames = files.map((file) => file.name);
    this.validate_files(files);
    (<Modal> this.$refs.confirm_submit_modal).open();
  }

  private validate_files(files: File[]) {
    this.unexpected_files = [];
    this.missing_files = [];
    this.patterns_with_too_few_matches = [];
    this.patterns_with_too_many_matches = [];

    this.check_for_unexpected_files(files);
    this.check_expected_file_counts(files);
  }

  private check_for_unexpected_files(files: File[]) {
    let filtered: File[] = [];
    for (let file of files) {
      if (!this.file_matches_any_patterns(file)) {
        this.unexpected_files.push(file.name);
      }
      else {
        filtered.push(file);
      }
    }
  }

  private file_matches_any_patterns(file: File): boolean {
    for (let expected_file of this.project.expected_student_files) {
      if (matches(file.name, expected_file.pattern)) {
        return true;
      }
    }

    return false;
  }

  private check_expected_file_counts(files: File[]) {
    let filenames = files.map((file) => file.name);
    for (let expected_file of this.project.expected_student_files) {
      let count = num_matches(filenames, expected_file.pattern);

      if (this.expected_file_is_missing(expected_file, count)) {
        this.missing_files.push(expected_file.pattern)
      }
      else if (count < expected_file.min_num_matches) {
        this.patterns_with_too_few_matches.push({
          pattern: expected_file.pattern,
          num_expected: expected_file.min_num_matches,
          actual_num: count,
        });
      }
      else if (count > expected_file.max_num_matches) {
        this.patterns_with_too_many_matches.push({
          pattern: expected_file.pattern,
          num_expected: expected_file.max_num_matches,
          actual_num: count,
        })
      }
    }
  }

  private expected_file_is_missing(expected_file: ExpectedStudentFile, num_matches: number) {
    return num_matches === 0
           && expected_file.min_num_matches === 1
           && expected_file.max_num_matches === 1;
  }
}

const MINIMATCH_ARGS = {
  nobrace: true,
  noglobstar: true,
  noext: true,
  nocomment: true,
  nonegate: true
}

function matches(name: string, pattern: string): boolean {
  return minimatch.match([name], pattern).length !== 0;
}

function num_matches(names: string[], pattern: string): number {
  return minimatch.match(names, pattern).length;
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

#submit-component {
  padding: 5px;
}

#deadline-container {
  margin: 20px 0;

  #deadline-text {
    font-size: 22px;
    margin-bottom: 7px;
  }

  #deadline {
    color: $navy-blue;
  }

  #extension {
    color: $ocean-blue;
  }

  #extension-text {
    font-size: 18px;
  }

  .date {
    font-weight: bold;
  }
}

#group-members-container {
  margin-bottom: 20px;
  border: 2px solid $pebble-medium;
  border-radius: 3px;
  max-width: 500px;
}

#group-members-title {
  padding: 14px 15px 14px 15px;
  font-weight: bold;
  background-color: $white-gray;
}

.group-member {
  font-size: 16px;
  padding: 12px 15px 12px 15px;
}

#group-members-container .odd-row {
  background-color: $white-gray;
}

.file-list-header {
  margin-top: 20px;
  margin-bottom: 5px;
  font-weight: bold;

  .fa-exclamation-triangle {
    color: $orange;
  }
}

.file-list {
  margin-left: 15px;

  .list-item {
    margin: 5px 15px;
  }

  .filename {
    color: $ocean-blue;
  }

  .num-files {
    color: $cherry;
    font-weight: bold;
  }
}

</style>
