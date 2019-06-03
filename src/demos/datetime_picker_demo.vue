<template>
  <div id="datetime-picker-demo">

    <fieldset>
      <legend> DatePicker </legend>
      <div class="example">
        <div class="explanation"> Date string with bound input </div>
        <div class="modeling"
             @click="$refs.datetime_picker_1.toggle_visibility()">
          {{(new Date(date_1)).toLocaleString('en-US', date_display_format)}}
          <i class="far fa-calendar-alt calender-icon"></i>
        </div>
        <datetime-picker v-model="date_1"
                         ref="datetime_picker_1">
        </datetime-picker>
      </div>

      <div class="example">
        <div class="explanation"> Date string without bound input (null) </div>
        <div class="modeling"
             @click="$refs.datetime_picker_2.toggle_visibility()">
          {{date_2 !== null
          ? new Date(date_2).toLocaleString('en-US', date_display_format)
          : '--- --, ----, --:-- --'}}
          <i class="far fa-calendar-alt calender-icon"></i>
        </div>
        <datetime-picker v-model="date_2"
                         ref="datetime_picker_2">
        </datetime-picker>
      </div>

    </fieldset>

    <fieldset>
      <legend>TimePicker</legend>
      <div class="example">
        <div class="explanation">TimePicker with no bound input</div>
        <time-picker></time-picker>
      </div>

      <div class="example">
        <div class="explanation">TimePicker with bound input</div>
        <time-picker v-model="time"></time-picker>
      </div>
    </fieldset>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import DatetimePicker from '@/components/datetime/datetime_picker.vue';
import TimePicker from "@/components/datetime/time_picker.vue";

@Component({
  components: {
    DatetimePicker,
    TimePicker
  }
})
export default class DatetimePickerDemo extends Vue {
  date_1 = "2019-12-25T15:36:37.746189Z";
  date_display_format = { year: 'numeric', month: 'long', day: 'numeric',
                          hour: 'numeric', minute: 'numeric'};
  date_2 = null;

  time = '14:00';
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';

#datetime-picker-demo {
  display: inline-block;
}

.example {
  padding: 10px;
}

.explanation {
  padding: 10px 0 0 10px;
}

.modeling {
  margin: 10px 0 10px 0;
  background-color: $white-gray;
  border: 1px solid darken($white-gray, 2);
  border-radius: 4px;
  padding: 10px;
  display: inline-block;
}

legend {
  color: $ocean-blue;
  font-size: 18px;
}

fieldset {
  border-bottom: none;
  border-left: none;
  border-right: none;
  border-color: rgba(255, 255, 255, 0.3);
  border-width: 2px;
}

.calender-icon {
  padding-left: 15px;
  color: $dark-blue;
  cursor: pointer;
}
</style>
