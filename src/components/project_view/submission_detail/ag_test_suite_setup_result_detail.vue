<template>
  <div id="ag-case-setup-result">
    <div
      class="fieldset"
      role="region"
      :aria-label="`${ag_test_suite_result.ag_test_suite_name} test suite setup result`"
      v-if="
        (ag_test_suite_result.setup_timed_out !== null &&
          ag_test_suite_result.setup_timed_out) ||
        ag_test_suite_result.setup_return_code !== null
      "
    >
      <div class="legend">Correctness</div>
      <div id="exit-status-section">
        <div class="feedback-row">
          <div class="feedback-label">Exit status:</div>
          <div class="feedback">
            <div class="correctness-output">
              <span
                v-if="
                  ag_test_suite_result.setup_timed_out !== null &&
                  ag_test_suite_result.setup_timed_out === true
                "
              >
                <i class="far fa-clock timed-out-icon" aria-hidden="true"></i>
                <span class="timed-out-msg"> (Timed out) </span>
              </span>
              <span v-else>
                {{ ag_test_suite_result.setup_return_code }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="
        output_size !== null &&
        (output_size.setup_stdout_size !== null ||
          output_size.setup_stderr_size !== null)
      "
      class="fieldset"
      role="region"
      :aria-label="`${ag_test_suite_result.ag_test_suite_name} test suite setup output`"
      ref="actual_output"
    >
      <div class="legend">Actual Output</div>

      <div
        v-if="output_size.setup_stdout_size !== null"
        ref="setup_stdout_section"
        class="feedback-row"
      >
        <div class="feedback-label">Output:</div>
        <div class="feedback">
          <div v-if="output_size.setup_stdout_size === 0" class="short-output">
            No output
          </div>
          <div v-else-if="setup_stdout_content !== null" class="lengthy-output">
            <view-file
              :file_contents="setup_stdout_content"
              view_file_max_height="50vh"
              :progress="setup_stdout_load_progress"
              ref="setup_stdout"
            ></view-file>
          </div>
        </div>
      </div>

      <div
        v-if="output_size.setup_stderr_size !== null"
        ref="setup_stderr_section"
        class="feedback-row"
      >
        <div class="feedback-label">Error output:</div>
        <div class="feedback">
          <div v-if="output_size.setup_stderr_size === 0" class="short-output">
            No output
          </div>
          <div v-else-if="setup_stderr_content !== null" class="lengthy-output">
            <view-file
              :file_contents="setup_stderr_content"
              view_file_max_height="50vh"
              :progress="setup_stderr_load_progress"
              ref="setup_stderr"
            ></view-file>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

import {
  AGTestSuiteResultFeedback,
  FeedbackCategory,
  ResultOutput,
  Submission,
} from "ag-client-typescript";

import ViewFile from "@/components/view_file/view_file.vue";
import { new_handle_global_errors_async } from "@/error_handling";

const props = defineProps<{
  submission: Submission;
  ag_test_suite_result: AGTestSuiteResultFeedback;
  fdbk_category: FeedbackCategory;
}>();

const setup_stdout_content = ref<Promise<string> | null>(null);
const setup_stderr_content = ref<Promise<string> | null>(null);
const setup_stdout_load_progress = ref<number | null>(null);
const setup_stderr_load_progress = ref<number | null>(null);
const output_size = ref<ResultOutput.AGTestSuiteResultOutputSize | null>(null);

const get_output = new_handle_global_errors_async(async () => {
  setup_stdout_content.value = null;
  setup_stderr_content.value = null;
  output_size.value = await ResultOutput.get_ag_test_suite_result_output_size(
    props.submission.pk,
    props.ag_test_suite_result.pk,
    props.fdbk_category,
  );
  load_setup_stdout();
  load_setup_stderr();
});

watch(
  () => props.fdbk_category,
  () => get_output(),
);

void get_output();

function load_setup_stdout() {
  if (
    output_size.value!.setup_stdout_size === null ||
    output_size.value!.setup_stdout_size === 0
  ) {
    return;
  }

  setup_stdout_load_progress.value = null;
  setup_stdout_content.value =
    ResultOutput.get_ag_test_suite_result_setup_stdout(
      props.submission.pk,
      props.ag_test_suite_result.pk,
      props.fdbk_category,
      (event: ProgressEvent) => {
        if (event.lengthComputable) {
          setup_stdout_load_progress.value =
            100 * ((1.0 * event.loaded) / event.total);
        }
      },
    );
}

function load_setup_stderr() {
  if (
    output_size.value!.setup_stderr_size === null ||
    output_size.value!.setup_stderr_size === 0
  ) {
    return;
  }

  setup_stderr_load_progress.value = null;
  setup_stderr_content.value =
    ResultOutput.get_ag_test_suite_result_setup_stderr(
      props.submission.pk,
      props.ag_test_suite_result.pk,
      props.fdbk_category,
      (event: ProgressEvent) => {
        if (event.lengthComputable) {
          setup_stderr_load_progress.value =
            100 * ((1.0 * event.loaded) / event.total);
        }
      },
    );
}
</script>

<style scoped lang="scss">
@import "@/styles/components/submission_detail.scss";

.timed-out-icon {
  padding: 0 0.125rem 0 0.375rem;
}
</style>
