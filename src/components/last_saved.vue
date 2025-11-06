<template>
  <div class="last-saved-timestamp">
    <i v-if="saving" class="loading fa fa-spinner fa-pulse"></i>
    <template v-else>
      Last saved:
      {{
        short
          ? format_datetime_short(last_modified)
          : format_datetime(last_modified)
      }}
    </template>
  </div>
</template>

<script setup lang="ts">
import { format_datetime, format_datetime_short } from "@/utils";

// Props
type PropTypes = {
  last_modified: string;
  saving?: boolean;
  short?: boolean;
};

const props = withDefaults(defineProps<PropTypes>(), {
  saving: false,
  short: true,
});

// Make utility functions available to template
const { last_modified, saving, short } = props;
</script>

<style scoped lang="scss">
@import "@/styles/forms.scss";
@import "@/styles/loading.scss";

.last-saved-timestamp {
  @extend %last-saved-timestamp;
}
</style>
