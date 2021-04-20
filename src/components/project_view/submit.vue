<template>
  <div id="submit-component">
    <div id="deadline-container">
      <div id="deadline-text" v-if="project.soft_closing_time !== null">
        Due on
        <span id="deadline" class="date">
          {{format_datetime(project.soft_closing_time)}}
        </span>
        <span id="deadline-countdown">{{time_until_soft_closing_time}}</span>
      </div>
      <div id="extension-text" v-if="group.extended_due_date !== null">
        Extension:
        <span id="extension" class="date">
          {{format_datetime(group.extended_due_date)}}
        </span>
        <span id="extension-countdown">{{time_until_extension}}</span>
      </div>
      <div id="late-days-used"
            class="limit-container"
            v-if="d_globals.current_user.username in group.late_days_used">
        <span class="allotment">{{group.late_days_used[d_globals.current_user.username]}}</span>
        late
        day<template
              v-if="group.late_days_used[d_globals.current_user.username] !== 1"
           >s</template>
        used on this project.
      </div>
    </div>

    <group-members :group="group"></group-members>

    <div id="all-limits-container">
      <div id="submissions-used"
           class="limit-container" v-if="project.submission_limit_per_day !== null">
        <span class="allotment">
          {{group.num_submits_towards_limit}}/{{num_submissions_per_day}}
        </span>
        submissions used today.
      </div>
      <div id="submissions-used-towards-limit"
           class="limit-container"
           v-if="project.total_submission_limit !== null">
        <span class="allotment">
          {{group.num_submits_towards_limit}}/{{project.total_submission_limit}}
        </span>
        total submissions used <b>(forever!)</b>.
      </div>
      <div id="bonus-submissions-remaining"
           class="limit-container"
           v-if="project.num_bonus_submissions !== 0 || group.bonus_submissions_remaining !== 0">
        <span class="allotment">
          {{group.bonus_submissions_remaining}}
        </span>
        bonus submission<template v-if="group.bonus_submissions_remaining !== 1">s</template>
        remaining.
      </div>
      <div id="late-days-remaining" class="limit-container" v-if="show_late_day_count">
        <i v-if="late_days_remaining === null"
            class="loading fa fa-spinner fa-pulse"></i>
        <span class="allotment">
          {{late_days_remaining}}
        </span>
        late day token<template v-if="late_days_remaining !== 1">s</template> remaining.
      </div>
    </div>

    <expected-student-files-list
      v-if="project.expected_student_files.length !== 0"
      :expected_student_files="project.expected_student_files"
    />

    <file-upload ref="submit_file_upload" @upload_files="process_files"
                 :disable_upload_button="!honor_pledged_signed">
      <template v-slot:before_upload_button v-if="project.use_honor_pledge">
        <div class="honor-pledge-text">
          <div class="honor-pledge-header">
            You must agree to the honor pledge before submitting:
          </div>
          {{project.honor_pledge_text}}
        </div>

        <div class="confirm-pledge">
          <label class="label">
            Sign your username "{{expected_honor_pledge_signature}}" to confirm: <br>
            <input type="text" class="input" v-model="d_honor_pledge_signature">
          </label>
        </div>
      </template>
      <template v-slot:upload_button_text>
        Submit <template v-if="submission_might_use_late_day">(Use late day)</template>
      </template>
    </file-upload>

    <modal ref="confirm_submit_modal"
           v-if="d_show_confirm_submit_modal"
           @close="d_show_confirm_submit_modal = false"
           size="large"
           :include_closing_x="false">
      <div class="modal-header">Submit</div>
      <div class="file-list-header">Files to submit</div>
      <ul class="file-list">
        <li v-for="filename of submitted_filenames" class="list-item">{{filename}}</li>
      </ul>

      <template v-if="missing_files.length !== 0 || patterns_with_too_few_matches.length !== 0">
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
      </template>

      <template v-if="unexpected_files.length !== 0
                      || patterns_with_too_many_matches.length !== 0">
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
      </template>
      <div class="modal-button-footer">
        <button type="button"
                data-testid="submit_button"
                :class="file_mismatches_present ? 'orange-button' : 'green-button'"
                @click="submit"
                :disabled="d_submitting">
          Submit <template v-if="file_mismatches_present">Anyway</template>
        </button>
        <button type="button"
                class="white-button"
                data-testid="cancel_submit_button"
                @click="d_show_confirm_submit_modal = false"
                :disabled="d_submitting">Cancel</button>
      </div>
      <div id="submit-progress">
        <progress-bar v-if="d_submitting" :progress="d_submit_progress"></progress-bar>
      </div>
      <APIErrors ref="api_errors"></APIErrors>
    </modal>
  </div>
</template>

<script lang="ts">
import { Component, Inject, Prop, Vue } from 'vue-property-decorator';

import { Course, ExpectedStudentFile, Group, Project, Submission, User } from 'ag-client-typescript';
import * as minimatch from 'minimatch';
// @ts-ignore
import moment from "moment";

import { GlobalData } from '@/app.vue';
import APIErrors from "@/components/api_errors.vue";
import FileUpload from '@/components/file_upload.vue';
import Modal from '@/components/modal.vue';
import ProgressBar from '@/components/progress_bar.vue';
import GroupMembers from '@/components/project_view/group_members.vue';
import Tooltip from '@/components/tooltip.vue';
import { handle_api_errors_async, handle_global_errors_async } from '@/error_handling';
import { assert_not_null, format_datetime, toggle } from '@/utils';

import ExpectedStudentFilesList from './expected_student_files_list.vue';

interface ExpectedFilePatternMismatch {
  pattern: string;
  num_expected: number;
  actual_num: number;
}

@Component({
  components: {
    APIErrors,
    ExpectedStudentFilesList,
    FileUpload,
    GroupMembers,
    Modal,
    ProgressBar,
    Tooltip,
  }
})
export default class Submit extends Vue {
  @Inject({from: 'globals'})
  globals!: GlobalData;
  d_globals = this.globals;

  @Prop({required: true, type: Course})
  course!: Course;

  @Prop({required: true, type: Project})
  project!: Project;

  @Prop({required: true, type: Group})
  group!: Group;

  readonly format_datetime = format_datetime;

  d_honor_pledge_signature = '';

  d_submitting = false;
  d_submit_progress = 0;
  private d_show_confirm_submit_modal = false;

  submitted_files: File[] = [];
  submitted_filenames: string[] = [];
  unexpected_files: string[] = [];
  missing_files: string[] = [];
  patterns_with_too_few_matches: ExpectedFilePatternMismatch[] = [];
  patterns_with_too_many_matches: ExpectedFilePatternMismatch[] = [];

  late_days_remaining: number | null = null;

  // This will get updated once per minute
  d_now: moment.Moment = moment();
  d_now_timer_id: ReturnType<typeof setInterval> | null = null;

  @handle_global_errors_async
  async created() {
    this.d_now_timer_id = setInterval(
      () => {
        // istanbul ignore next
        this.d_now = moment();
      },
      30 * 1000
    );

    if (this.project.allow_late_days) {
      let late_days = await User.get_num_late_days(this.course.pk, this.d_globals.current_user!.pk);
      this.late_days_remaining = late_days.late_days_remaining;
    }
  }

  destroyed() {
    if (this.d_now_timer_id !== null) {
      clearInterval(this.d_now_timer_id);
    }
  }

  get time_until_soft_closing_time() {
    if (this.group.extended_due_date !== null) {
      return '';
    }

    assert_not_null(this.project.soft_closing_time);
    let deadline = moment(this.project.soft_closing_time);
    if (this.d_now.isAfter(deadline)) {
      return '';
    }

    return this._format_time_diff(deadline, this.d_now);
  }

  get time_until_extension() {
    assert_not_null(this.group.extended_due_date);
    let extension = moment(this.group.extended_due_date);
    if (this.d_now.isAfter(extension)) {
      return '';
    }

    return this._format_time_diff(extension, this.d_now);
  }

  _format_time_diff(first: moment.Moment, second: moment.Moment): string {
    let diff = moment.duration(first.diff(second));

    let days = diff.days();
    let hours = diff.hours();
    let hours_str = `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
    if (days >= 1) {
      return `(${days} ${days === 1 ? 'day' : 'days'} ${hours_str})`;
    }

    let minutes = diff.minutes();
    let minutes_str = `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
    if (hours >= 1) {
      return `(${hours_str} ${minutes_str})`;
    }

    if (diff.asMinutes() < 1) {
      return '(< 1 minute)';
    }
    return `(${minutes_str})`;
  }

  get num_submissions_per_day() {
    if (this.project.groups_combine_daily_submissions
        && this.project.submission_limit_per_day !== null) {
      return this.project.submission_limit_per_day * this.group.member_names.length;
    }
    return this.project.submission_limit_per_day;
  }

  get show_late_day_count(): boolean {
    if (!this.project.allow_late_days) {
      return false;
    }
    if (this.course.num_late_days !== 0) {
      return true;
    }
    return this.late_days_remaining !== null && this.late_days_remaining !== 0;
  }

  get submission_might_use_late_day() {
    if (!this.project.allow_late_days) {
      return false;
    }
    if (this.late_days_remaining === null || this.late_days_remaining === 0) {
      return false;
    }
    if (this.project.soft_closing_time === null) {
      return false;
    }
    let deadline = moment(this.project.soft_closing_time);
    if (this.group.extended_due_date !== null) {
      deadline = moment(this.group.extended_due_date);
    }

    let late_days_used = this.group.late_days_used[this.d_globals.current_user!.username];
    if (late_days_used !== undefined) {
      deadline = deadline.add(late_days_used, 'd');
    }

    return this.d_now.isAfter(deadline);
  }

  get file_mismatches_present() {
    return this.unexpected_files.length !== 0
           || this.missing_files.length !== 0
           || this.patterns_with_too_few_matches.length !== 0
           || this.patterns_with_too_many_matches.length !== 0;
  }

  process_files(files: File[]) {
    this.d_submit_progress = 0;
    this.submitted_files = files;
    this.submitted_filenames = files.map((file) => file.name);
    this.validate_files(files);
    this.d_show_confirm_submit_modal = true;
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
      let count = num_glob_matches(filenames, expected_file.pattern);

      if (this.expected_file_is_missing(expected_file, count)) {
        this.missing_files.push(expected_file.pattern);
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
        });
      }
    }
  }

  private expected_file_is_missing(expected_file: ExpectedStudentFile, num_matches: number) {
    return num_matches === 0
           && expected_file.min_num_matches === 1
           && expected_file.max_num_matches === 1;
  }

  @handle_api_errors_async(handle_submit_error)
  submit() {
    (<APIErrors> this.$refs.api_errors).clear();
    this.d_submit_progress = 0;

    return toggle(this, 'd_submitting', async () => {
      await Submission.create(
        this.group.pk, this.submitted_files,
        (event: ProgressEvent) => {
          if (event.lengthComputable) {
            this.d_submit_progress = 100 * (1.0 * event.loaded / event.total);
          }
        }
      );

      (<FileUpload> this.$refs.submit_file_upload).clear_files();
      this.d_show_confirm_submit_modal = false;
      this.d_honor_pledge_signature = '';
      this.$emit('submitted');
    });
  }

  get honor_pledged_signed() {
    if (!this.project.use_honor_pledge || this.d_globals.user_roles.is_staff) {
      return true;
    }

    assert_not_null(this.d_globals.current_user);
    let signature = this.d_honor_pledge_signature.trim().toLowerCase();

    // Accept any substring of the current user's username that starts
    // with at least the part of the username before the "@" sign.
    // For example:
    // - YES: jameslp, jameslp@umich.edu, jameslp@umi
    // - NO: ameslp, jameslp@umich.eduuuuuu
    return signature === this.expected_honor_pledge_signature
      || (signature.startsWith(this.expected_honor_pledge_signature)
          && this.d_globals.current_user.username.startsWith(signature));
  }

  get expected_honor_pledge_signature() {
    assert_not_null(this.d_globals.current_user);
    return this.d_globals.current_user.username.split('@')[0];
  }
}

function handle_submit_error(component: Submit, error: unknown) {
  (<APIErrors> component.$refs.api_errors).show_errors_from_response(error);
}

const MINIMATCH_ARGS = {
  nobrace: true,
  noglobstar: true,
  noext: true,
  nocomment: true,
  nonegate: true
};

function matches(name: string, pattern: string): boolean {
  return minimatch.match([name], pattern).length !== 0;
}

function num_glob_matches(names: string[], pattern: string): number {
  return minimatch.match(names, pattern).length;
}
</script>

<style scoped lang="scss">
@import '@/styles/button_styles.scss';
@import '@/styles/colors.scss';
@import '@/styles/forms.scss';
@import '@/styles/loading.scss';
@import '@/styles/modal.scss';

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

#submit-component {
  padding: .875rem;
}

#deadline-container {
  margin-bottom: .875rem;

  #deadline-text {
    font-size: 1.375rem;
    margin-bottom: .375rem;
  }

  #deadline {
    color: $navy-blue;
  }

  #extension {
    color: $ocean-blue;
  }

  #extension-text {
    font-size: 1.1rem;
  }

  .date {
    font-weight: bold;
  }
}

#all-limits-container {
  margin: .875rem 0;
  font-size: 1.2rem;
}

.limit-container {
  margin: .25rem 0;
}

.allotment {
  color: darken($green, 5%);
  font-weight: bold;
}

.file-list-header {
  margin-top: .875rem;
  margin-bottom: .25rem;
  font-weight: bold;

  .fa-exclamation-triangle {
    color: $orange;
  }
}

.file-list {
  margin-left: .875rem;

  .list-item {
    margin: .25rem .875rem;
  }

  .filename {
    color: $ocean-blue;
  }

  .num-files {
    color: $cherry;
    font-weight: bold;
  }
}

.honor-pledge-text {
  margin: 1rem 0;
}

.honor-pledge-header {
  margin-bottom: .5rem;
  font-weight: bold;
}

.confirm-pledge {
  margin: 1rem 0;
}

.modal-header {
  font-size: 1.4rem;
}


#submit-progress {
  margin-top: .625rem;
}

</style>
