<template>
  <div class="datetime-picker">
    <input type="datetime-local" v-model="d_datetime_string"></input>
    <select v-model="d_timezone">
      <option v-for="timezone of timezones()" :value="timezone" :key="timezone">
        {{timezone}}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
  import moment from "moment";
  import { computed, ref, watch } from "vue";

  type PropTypes = {
    value?: string | null
  };
  const props = defineProps<PropTypes>();

  type EmitTypes = {
    (e: "input", value: string): void
  };
  const emit = defineEmits<EmitTypes>();

  const d_datetime = ref(
    props.value ?
      moment(props.value).tz(moment.tz.guess(), true)
      : null
  );
  const d_timezone = ref(moment.tz.guess())

  const timezones = computed(() => moment.tz.names);

  const d_datetime_string = computed({
    get() {
      return d_datetime.value ? d_datetime.value.format("YYYY-MM-DDTHH:MM")
        : null;
    },
    set(new_value) {
      d_datetime.value = moment(new_value).tz(d_timezone.value, false);
      emit("input", d_datetime.value.format());
    }
  });

  watch(d_timezone, () => {
    if (d_datetime.value) {
      d_datetime.value = d_datetime.value.tz(d_timezone.value, false);
      emit("input", d_datetime.value.format());
    }
  })
</script>
