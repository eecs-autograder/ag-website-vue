<template>
  <div id="mutation-suite-result">

    <fieldset v-if="show_setup_fieldset"
              class="fieldset">
      <legend class="legend"
              id="setup-command-name">{{mutation_test_suite_result.setup_command_name !== null
        ? mutation_test_suite_result.setup_command_name : 'Setup'}}</legend>
      <div id="setup-section">

        <div v-if="mutation_test_suite_result.setup_return_code !== null
                   || (mutation_test_suite_result.setup_timed_out !== null
                   && mutation_test_suite_result.setup_timed_out)"
             id="setup-return-code"
             class="feedback-row">
          <div class="feedback-label"> Exit status: </div>
          <div class="feedback">
            <div class="correctness-output">
              <span v-if="mutation_test_suite_result.setup_timed_out !== null
                               && mutation_test_suite_result.setup_timed_out">
                <i class="far fa-clock timed-out-icon setup-timed-out-icon"></i>
                <span> (Timed Out) </span>
              </span>
              <span v-else>
                {{mutation_test_suite_result.setup_return_code}}

                <span v-if="mutation_test_suite_result.setup_return_code === 0">
                  <i class="fas fa-check correct-icon"></i>
                </span>
                <span v-else-if="mutation_test_suite_result.setup_return_code !== 0">
                  <i class="fas fa-times incorrect-icon"></i>
                </span>
              </span>
            </div>
          </div>
        </div>

        <div v-if="mutation_test_suite_result.fdbk_settings.show_setup_stdout"
             id="setup-stdout-section"
             class="feedback-row">
          <div class="feedback-label"> Output: </div>
          <div class="feedback">
            <template v-if="!d_setup_stdout_loaded">
              <div class="loading-output">
                <i class="fa fa-spinner fa-pulse fa-fw"></i>
              </div>
            </template>
            <template v-else>
              <div v-if="!d_setup_stdout_content" class="short-output"> No output </div>
              <div v-else
                   class="lengthy-output">
                <view-file :file_contents="d_setup_stdout_content"
                           view_file_max_height="50vh"></view-file>
              </div>
            </template>
          </div>
        </div>

        <div v-if="mutation_test_suite_result.fdbk_settings.show_setup_stderr"
             id="setup-stderr-section"
             class="feedback-row">
          <div class="feedback-label"> Error output: </div>
          <div class="feedback">
            <template v-if="!d_setup_stderr_loaded">
              <div class="loading-output">
                <i class="fa fa-spinner fa-pulse fa-fw"></i>
              </div>
            </template>
            <template v-else>
              <div v-if="!d_setup_stderr_content" class="short-output">No output</div>
              <div v-else
                   class="lengthy-output">
                <view-file :file_contents="d_setup_stderr_content"
                           view_file_max_height="50vh"></view-file>
              </div>
            </template>
          </div>
        </div>

      </div>
    </fieldset>

    <fieldset class="fieldset">
      <legend class="legend"> Student Tests </legend>
      <div id="student-tests-section">

        <div v-if="mutation_test_suite_result.student_tests.length === 0"
             class="feedback-row"
             id="no-tests-submitted-message">
          <div> No test cases were submitted. </div>
        </div>

        <div v-if="mutation_test_suite_result.discarded_tests.length"
             id="discarded-tests-section"
             class="feedback-row">
          <div class="feedback-explanation">
            This suite accepts up to
            <span id="num-tests-accepted">
              {{mutation_test_suite_result.student_tests.length}}</span>
            tests, but you submitted
            <span id="total-tests-submitted">
              {{mutation_test_suite_result.student_tests.length
                + mutation_test_suite_result.discarded_tests.length}}</span>.
          </div>

          <div class="feedback-label test-names-feedback-label"> Discarded test cases: </div>
          <div class="feedback test-names-feedback">
            <div id="list-of-discarded-tests">
              <div v-for="discarded_test_name of mutation_test_suite_result.discarded_tests"
                   class="single-discarded-test">
                <span class="list-icon"><i class="far fa-trash-alt discarded-test-icon"></i></span>
                <span class="test-name">{{discarded_test_name}}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="mutation_test_suite_result.invalid_tests !== null &&
                   mutation_test_suite_result.invalid_tests.length"
             id="false-positive-tests-section"
             class="feedback-row">

          <div class="feedback-explanation">
            Tests with false positives incorrectly reported a bug when run against a correct
            implementation.
          </div>
          <div class="feedback-label test-names-feedback-label">Tests with false positives:</div>
          <div class="feedback test-names-feedback">
            <div id="list-of-false-positive-tests">
              <div v-for="false_positive_test of mutation_test_suite_result.invalid_tests"
                   class="single-false-positive-test">
                <span v-if="test_timed_out(false_positive_test)"
                      class="list-icon">
                  <i class="far fa-clock timed-out-icon"></i>
                </span>
                <span v-else
                     class="list-icon">
                  <i class="fas fa-exclamation-triangle false-positive-test-icon"></i>
                </span>
                <span class="test-name">{{false_positive_test}}
                  <span v-if="test_timed_out(false_positive_test)"
                        class="test-timed-out">
                    (Timed out)
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="get_valid_tests().length"
             class="feedback-row"
             id="valid-tests-section">
          <div class="feedback-label test-names-feedback-label"> Valid test cases: </div>
          <div class="feedback test-names-feedback">
            <div id="list-of-valid-tests">
              <div v-for="valid_test of get_valid_tests()"
                   class="single-valid-test">
                <span class="list-icon"><i class="far fa-check-circle valid-test-icon"></i></span>
                <span class="test-name">{{valid_test}}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="(mutation_test_suite_result.fdbk_settings.show_get_test_names_stdout
                       || mutation_test_suite_result.fdbk_settings.show_get_test_names_stderr)
                    && mutation_test_suite_result.student_tests.length"
             class="feedback-row">

          <div class="feedback-label show-output-button-label">Test names output:</div>
          <div class="feedback">
            <button class="show-output-button"
                    id="show-test-names-output-button"
                    @click="toggle_d_show_student_test_names_output">
              {{d_show_student_test_names_output ? 'Hide' : 'Show'}} Output
            </button>
          </div>
        </div>

        <div v-if="mutation_test_suite_result.fdbk_settings.show_get_test_names_stdout
                   && d_show_student_test_names_output"
             class="feedback-row"
             id="test-names-stdout-section">
          <div class="feedback-label test-names-feedback-label"> Output: </div>
          <div class="feedback test-names-feedback">
            <template v-if="!d_student_test_names_stdout_loaded">
              <div class="loading-output">
                <i class="fa fa-spinner fa-pulse fa-fw"></i>
              </div>
            </template>
            <template v-else>
              <div v-if="!d_student_test_names_stdout_content" class="short-output">No output</div>
              <div v-else
                   class="lengthy-output">
                <view-file :file_contents="d_student_test_names_stdout_content"
                           view_file_max_height="50vh"></view-file>
              </div>
            </template>
          </div>
        </div>

        <div v-if="mutation_test_suite_result.fdbk_settings.show_get_test_names_stderr
                   && d_show_student_test_names_output"
             class="feedback-row"
             id="test-names-stderr-section">
          <div class="feedback-label test-names-feedback-label"> Error output: </div>
          <div class="feedback test-names-feedback">
            <template v-if="!d_student_test_names_stderr_loaded">
              <div class="loading-output">
                <i class="fa fa-spinner fa-pulse fa-fw"></i>
              </div>
            </template>
            <template v-else>
              <div v-if="!d_student_test_names_stderr_content" class="short-output">No output</div>
              <div v-else
                   class="lengthy-output">
                <view-file :file_contents="d_student_test_names_stderr_content"
                           view_file_max_height="50vh"></view-file>
              </div>
            </template>
          </div>
        </div>

        <div v-if="(mutation_test_suite_result.fdbk_settings.show_validity_check_stdout
                   || mutation_test_suite_result.fdbk_settings.show_validity_check_stderr)
                   && mutation_test_suite_result.student_tests.length"
             class="feedback-row">

          <div class="feedback-label show-output-button-label">Validity output:</div>
          <div class="feedback">
            <button class="show-output-button"
                    id="show-validity-check-output-button"
                    @click="toggle_d_show_validity_check_output">
              {{d_show_validity_check_output ? 'Hide' : 'Show'}} Output
            </button>
          </div>
        </div>

        <div v-if="mutation_test_suite_result.fdbk_settings.show_validity_check_stdout
                   && d_show_validity_check_output"
             class="feedback-row"
             id="validity-check-stdout-section">
          <div class="feedback-label"> Output: </div>
          <div class="feedback">
            <template v-if="!d_validity_check_stdout_loaded">
              <div class="loading-output">
                <i class="fa fa-spinner fa-pulse fa-fw"></i>
              </div>
            </template>
            <template v-else>
              <div v-if="!d_validity_check_stdout_content" class="short-output">No output</div>
              <div v-else
                   class="lengthy-output">
                <view-file :file_contents="d_validity_check_stdout_content"
                           view_file_max_height="50vh"></view-file>
              </div>
            </template>
          </div>
        </div>

        <div v-if="mutation_test_suite_result.fdbk_settings.show_validity_check_stderr
                   && d_show_validity_check_output"
             class="feedback-row"
             id="validity-check-stderr-section">
          <div class="feedback-label"> Error output: </div>
          <div class="feedback">
            <template v-if="!d_validity_check_stderr_loaded">
              <div class="loading-output">
                <i class="fa fa-spinner fa-pulse fa-fw"></i>
              </div>
            </template>
            <template v-else>
              <div v-if="!d_validity_check_stderr_content" class="short-output">No output</div>
              <div v-else
                   class="lengthy-output">
                <view-file :file_contents="d_validity_check_stderr_content"
                           view_file_max_height="50vh"></view-file>
              </div>
            </template>
          </div>
        </div>
      </div>
    </fieldset>

    <fieldset v-if="show_buggy_implementations_fieldset"
              class="fieldset">
      <legend class="legend"> Buggy Implementations </legend>
      <div id="buggy-implementations-section">

        <div v-if="mutation_test_suite_result.num_bugs_exposed !== null"
             id="num-bugs-exposed-section"
             class="feedback-row">
          <div class="feedback-label buggy-impl-feedback-label"> # of exposed bugs: </div>
          <div class="feedback buggy-impl-feedback">
            <div class="short-output">{{mutation_test_suite_result.num_bugs_exposed}}</div>
          </div>
        </div>

        <div v-if="mutation_test_suite_result.fdbk_settings.bugs_exposed_fdbk_level
                     === BugsExposedFeedbackLevel.exposed_bug_names
                     && mutation_test_suite_result.num_bugs_exposed > 1"
             class="feedback-row">
          <div class="feedback-label buggy-impl-feedback-label"> Bugs exposed: </div>
          <div class="feedback buggy-impl-feedback">
            <div id="list-of-bugs">
              <div v-for="bug_name of mutation_test_suite_result.bugs_exposed"
                   class="single-bug">
                  <span class="list-icon"><i class="fas fa-bug bug-icon"></i></span>
                  <span>{{bug_name}}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="mutation_test_suite_result.fdbk_settings.show_grade_buggy_impls_stdout
                   || mutation_test_suite_result.fdbk_settings.show_grade_buggy_impls_stderr"
             class="feedback-row">
          <div class="feedback-label show-output-button-label">Bug output:</div>
          <div class="feedback">
            <button class="show-output-button"
                    id="show-buggy-output-button"
                    @click="toggle_d_show_buggy_implementations_output">
              {{d_show_buggy_implementations_output ? 'Hide' : 'Show'}} Output
            </button>
          </div>
        </div>
        <div v-if="mutation_test_suite_result.fdbk_settings.show_grade_buggy_impls_stdout
                     && d_show_buggy_implementations_output"
               id="buggy-stdout-section"
               class="feedback-row">
          <div class="feedback-label buggy-impl-feedback-label"> Output: </div>
          <div class="feedback buggy-impl-feedback">
            <template v-if="!d_grade_buggy_stdout_loaded">
              <div class="loading-output">
                <i class="fa fa-spinner fa-pulse fa-fw"></i>
              </div>
            </template>
            <template v-else>
              <div v-if="!d_grade_buggy_stdout_content" class="short-output">No output</div>
              <div v-else
                   class="lengthy-output">
                <view-file :file_contents="d_grade_buggy_stdout_content"
                           view_file_max_height="50vh"></view-file>
              </div>
            </template>
          </div>
        </div>

        <div v-if="mutation_test_suite_result.fdbk_settings.show_grade_buggy_impls_stderr
                   && d_show_buggy_implementations_output"
             class="feedback-row"
             id="buggy-stderr-section">
          <div class="feedback-label buggy-impl-feedback-label"> Error output: </div>
          <div class="feedback buggy-impl-feedback">
            <template v-if="!d_grade_buggy_stderr_loaded">
              <div class="loading-output">
                <i class="fa fa-spinner fa-pulse fa-fw"></i>
              </div>
            </template>
            <template v-else>
              <div v-if="!d_grade_buggy_stderr_content" class="short-output">No output</div>
              <div v-else
                   class="lengthy-output">
                <view-file :file_contents="d_grade_buggy_stderr_content"
                           view_file_max_height="50vh"></view-file>
              </div>
            </template>
          </div>
        </div>

      </div>
    </fieldset>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import {
    BugsExposedFeedbackLevel,
    FeedbackCategory,
    MutationTestSuiteResultFeedback,
    ResultOutput,
    Submission
} from 'ag-client-typescript';

import { CorrectnessLevel } from '@/components/project_view/submission_detail/correctness';
import CorrectnessIcon from "@/components/project_view/submission_detail/correctness_icon.vue";
import ViewFile from "@/components/view_file.vue";
import { handle_global_errors_async } from '@/error_handling';

@Component({
  components: {
    CorrectnessIcon,
    ViewFile
  }
})
export default class MutationSuiteResult extends Vue {
  @Prop({required: true, type: Object})
  mutation_test_suite_result!: MutationTestSuiteResultFeedback;

  @Prop({required: true, type: Submission})
  submission!: Submission;

  @Prop({required: true, type: String})
  fdbk_category!: FeedbackCategory;

  @Watch('mutation_test_suite_result')
  on_mutation_test_suite_results_change(new_value: MutationTestSuiteResultFeedback,
                                        old_value: MutationTestSuiteResultFeedback) {
    return this.get_output();
  }

  readonly CorrectnessLevel = CorrectnessLevel;
  readonly BugsExposedFeedbackLevel = BugsExposedFeedbackLevel;

  d_setup_stdout_content: Promise<string> | null = null;
  d_setup_stderr_content: Promise<string> | null = null;
  d_student_test_names_stdout_content: Promise<string> | null = null;
  d_student_test_names_stderr_content: Promise<string> | null = null;
  d_validity_check_stdout_content: Promise<string> | null = null;
  d_validity_check_stderr_content: Promise<string> | null = null;
  d_grade_buggy_stdout_content: Promise<string> | null = null;
  d_grade_buggy_stderr_content: Promise<string> | null = null;

  d_show_buggy_implementations_output = false;
  d_show_student_test_names_output = false;
  d_show_validity_check_output = false;

  d_load_grade_buggy_output = false;
  d_load_student_test_names_output = false;
  d_load_validity_check_output = false;

  d_setup_stdout_loaded = false;
  d_setup_stderr_loaded = false;
  d_student_test_names_stdout_loaded = false;
  d_student_test_names_stderr_loaded = false;
  d_validity_check_stdout_loaded = false;
  d_validity_check_stderr_loaded = false;
  d_grade_buggy_stdout_loaded = false;
  d_grade_buggy_stderr_loaded = false;
  d_output_size: ResultOutput.MutationTestSuiteResultOutputSize | null = null;

  async created() {
    await this.get_output();
  }

  get show_setup_fieldset(): boolean {
    return this.mutation_test_suite_result!.fdbk_settings.show_setup_stdout
           || this.mutation_test_suite_result!.fdbk_settings.show_setup_stderr
           || this.mutation_test_suite_result!.setup_return_code !== null
           || (this.mutation_test_suite_result!.setup_timed_out !== null
               && this.mutation_test_suite_result!.setup_timed_out!);
  }

  get show_buggy_implementations_fieldset(): boolean {
    return this.mutation_test_suite_result!.fdbk_settings.show_grade_buggy_impls_stdout
           || this.mutation_test_suite_result!.fdbk_settings.show_grade_buggy_impls_stderr
           || this.mutation_test_suite_result!.num_bugs_exposed !== null;
  }

  toggle_d_show_buggy_implementations_output() {
    this.d_show_buggy_implementations_output = !this.d_show_buggy_implementations_output;
    if (this.d_show_buggy_implementations_output && !this.d_load_grade_buggy_output) {
      this.d_load_grade_buggy_output = true;
      this.d_grade_buggy_stdout_loaded = false;
      this.d_grade_buggy_stderr_loaded = false;
      this.load_grade_buggy_stdout_content();
      this.load_grade_buggy_stderr_content();
    }
  }

  toggle_d_show_student_test_names_output() {
    this.d_show_student_test_names_output = !this.d_show_student_test_names_output;
    if (this.d_show_student_test_names_output && !this.d_load_student_test_names_output) {
      this.d_load_student_test_names_output = true;
      this.d_student_test_names_stdout_loaded = false;
      this.d_student_test_names_stderr_loaded = false;
      this.load_student_test_names_stdout_content();
      this.load_student_test_names_stderr_content();
    }
  }

  toggle_d_show_validity_check_output() {
    this.d_show_validity_check_output = !this.d_show_validity_check_output;
    if (this.d_show_validity_check_output && !this.d_load_validity_check_output) {
      this.d_load_validity_check_output = true;
      this.d_validity_check_stdout_loaded = false;
      this.d_validity_check_stderr_loaded = false;
      this.load_validity_check_stdout_content();
      this.load_validity_check_stderr_content();
    }
  }

  @handle_global_errors_async
  async get_output() {
    this.d_output_size = await ResultOutput.get_mutation_test_suite_result_output_size(
      this.submission!.pk,
      this.mutation_test_suite_result!.pk,
      this.fdbk_category
    );

    this.d_setup_stdout_loaded = false;
    this.d_setup_stderr_loaded = false;
    this.d_grade_buggy_stdout_loaded = false;
    this.d_grade_buggy_stderr_loaded = false;
    this.d_student_test_names_stdout_loaded = false;
    this.d_student_test_names_stderr_loaded = false;
    this.d_validity_check_stdout_loaded = false;
    this.d_validity_check_stderr_loaded = false;

    this.load_setup_stdout_content();
    this.load_setup_stderr_content();
    if (this.d_load_student_test_names_output) {
      this.load_student_test_names_stdout_content();
      this.load_student_test_names_stderr_content();
    }
    if (this.d_load_validity_check_output) {
      this.load_validity_check_stdout_content();
      this.load_validity_check_stderr_content();
    }
    if (this.d_load_grade_buggy_output) {
      this.load_grade_buggy_stdout_content();
      this.load_grade_buggy_stderr_content();
    }
  }

  load_setup_stdout_content() {
    if (this.d_output_size!.setup_stdout_size === null
        || this.d_output_size!.setup_stdout_size === 0) {
      this.d_setup_stdout_content = null;
    }
    else {
      this.d_setup_stdout_content = ResultOutput.get_mutation_test_suite_result_setup_stdout(
        this.submission.pk,
        this.mutation_test_suite_result!.pk,
        this.fdbk_category
      );
    }
    this.d_setup_stdout_loaded = true;
  }

  load_setup_stderr_content() {
    if (this.d_output_size!.setup_stderr_size === null
        || this.d_output_size!.setup_stderr_size === 0) {
      this.d_setup_stderr_content = null;
    }
    else {
      this.d_setup_stderr_content = ResultOutput.get_mutation_test_suite_result_setup_stderr(
        this.submission.pk,
        this.mutation_test_suite_result!.pk,
        this.fdbk_category
      );
    }
    this.d_setup_stderr_loaded = true;
  }

  load_student_test_names_stdout_content() {
    if (this.d_output_size!.get_student_test_names_stdout_size === null
        || this.d_output_size!.get_student_test_names_stdout_size === 0) {
      this.d_student_test_names_stdout_content = null;
    }
    else {
      this.d_student_test_names_stdout_content
          = ResultOutput.get_mutation_test_suite_result_get_student_test_names_stdout(
        this.submission.pk,
        this.mutation_test_suite_result!.pk,
        this.fdbk_category
      );
    }
    this.d_student_test_names_stdout_loaded = true;
  }

  load_student_test_names_stderr_content() {
    if (this.d_output_size!.get_student_test_names_stderr_size === null
        || this.d_output_size!.get_student_test_names_stderr_size === 0) {
      this.d_student_test_names_stderr_content = null;
    }
    else {
      this.d_student_test_names_stderr_content
          = ResultOutput.get_mutation_test_suite_result_get_student_test_names_stderr(
        this.submission.pk,
        this.mutation_test_suite_result.pk,
        this.fdbk_category
      );
    }
    this.d_student_test_names_stderr_loaded = true;
  }

  load_validity_check_stdout_content() {
    if (this.d_output_size!.validity_check_stdout_size === null
        || this.d_output_size!.validity_check_stdout_size === 0) {
      this.d_validity_check_stdout_content = null;
    }
    else {
      this.d_validity_check_stdout_content
          = ResultOutput.get_mutation_test_suite_result_validity_check_stdout(
        this.submission.pk,
        this.mutation_test_suite_result!.pk,
        this.fdbk_category
      );
    }
    this.d_validity_check_stdout_loaded = true;
  }

  load_validity_check_stderr_content() {
    if (this.d_output_size!.validity_check_stderr_size === null
        || this.d_output_size!.validity_check_stderr_size === 0) {
      this.d_validity_check_stderr_content = null;
    }
    else {
      this.d_validity_check_stderr_content
          = ResultOutput.get_mutation_test_suite_result_validity_check_stderr(
        this.submission.pk,
        this.mutation_test_suite_result!.pk,
        this.fdbk_category
      );
    }
    this.d_validity_check_stderr_loaded = true;
  }

  load_grade_buggy_stdout_content() {
    if (this.d_output_size!.grade_buggy_impls_stdout_size === null
        || this.d_output_size!.grade_buggy_impls_stdout_size === 0) {
      this.d_grade_buggy_stdout_content = null;
    }
    else {
      this.d_grade_buggy_stdout_content
          = ResultOutput.get_mutation_test_suite_result_grade_buggy_impls_stdout(
        this.submission.pk,
        this.mutation_test_suite_result!.pk,
        this.fdbk_category
      );
    }
    this.d_grade_buggy_stdout_loaded = true;
  }

  load_grade_buggy_stderr_content() {
    if (this.d_output_size!.grade_buggy_impls_stderr_size === null
        || this.d_output_size!.grade_buggy_impls_stderr_size === 0) {
      this.d_grade_buggy_stderr_content = null;
    }
    else {
      this.d_grade_buggy_stderr_content
          = ResultOutput.get_mutation_test_suite_result_grade_buggy_impls_stderr(
        this.submission.pk,
        this.mutation_test_suite_result!.pk,
        this.fdbk_category
      );
    }
    this.d_grade_buggy_stderr_loaded = true;
  }

  test_timed_out(test: string): boolean {
    if (this.mutation_test_suite_result!.timed_out_tests === null) {
        return false;
    }
    return this.mutation_test_suite_result!.timed_out_tests!.findIndex(
        (item) => item === test
    ) !== -1;
  }

  get_valid_tests(): string[] {
    if (this.mutation_test_suite_result!.invalid_tests === null) {
        return this.mutation_test_suite_result!.student_tests;
    }
    let valid_tests = this.mutation_test_suite_result!.student_tests.filter(
      (student_test) => this.mutation_test_suite_result!.invalid_tests!.findIndex(
          (invalid_test) => invalid_test === student_test)
      === -1);
    return valid_tests;
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';
@import '@/styles/forms.scss';
@import '@/styles/button_styles.scss';
@import '@/styles/components/submission_detail.scss';

$discarded-test-color: #b53389;
$false-positive-test-color: lighten($warning-red, 10);
$valid-test-color: $ocean-blue;
$bug-color: $navy-blue;

.setup-timed-out-icon {
  padding-right: 3px;
}

#no-tests-submitted-message {
  padding: 5px 2px;
}

.list-icon {
  padding-right: 10px;
}

.discarded-test-icon {
  color: $discarded-test-color;
}

#num-tests-accepted, #total-tests-submitted {
  text-decoration: underline;
  color: $discarded-test-color;
}

.false-positive-test-icon {
  color: $false-positive-test-color;
  font-size: 15px;
}

.timed-out-icon  {
  color: $false-positive-test-color;
}

.test-timed-out {
  color: $false-positive-test-color;
  padding-left: 2px;
}

.valid-test-icon {
  color: $valid-test-color;
}

.bug-icon {
  color: $bug-color;
  font-size: 14px;
}

.single-bug,
.single-valid-test,
.single-false-positive-test,
.single-discarded-test {
  padding: 0 0 5px 0;
  word-break: break-word;
}

.single-discarded-test,
.single-false-positive-test,
.single-valid-test,
.single-bug {
  display: flex;
  flex-direction: row;
}

#list-of-bugs,
#list-of-valid-tests,
#list-of-false-positive-tests,
#list-of-discarded-tests {
  padding: 5px;
}

.feedback-explanation {
  font-weight: bold;
  padding: 5px 2px;
}

.show-output-button-label {
  font-weight: bold;
}

.show-output-button {
  @extend .white-button;
  box-shadow: none;
  margin: 0 10px;
}

.show-output-button:focus {
  outline: none;
  box-shadow: none;
}

.correct-icon, .incorrect-icon {
  padding-left: 3px;
}

@media only screen and (min-width: 700px) {
  $width-of-mutation-feedback-label: 200px;

  .feedback-label {
    width: $width-of-mutation-feedback-label;
  }

  .feedback {
    width: calc(100% - #{$width-of-mutation-feedback-label});
  }

  .show-output-button {
    margin: 0;
  }
}

</style>
