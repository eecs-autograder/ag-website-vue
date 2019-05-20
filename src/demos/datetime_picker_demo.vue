<template>
  <div id="datetime-picker-demo">

    <fieldset>
      <legend> DatePicker </legend>
      <div class="example">
        <div class="explanation"> Date string initial value: NOT NULL </div>
        <div class="modeling"
             @click="$refs.datetime_picker_1.toggle_show_hide()">
          Modeling: {{(new Date(date_1)).toLocaleString('en-US', date_display_format)}}
          <i class="far fa-calendar-alt calender-icon"></i>
        </div>
        <datetime-picker v-model="date_1"
                         ref="datetime_picker_1"></datetime-picker>
      </div>

      <div class="example">
        <div class="explanation"> Date string initial value: NULL</div>
        <div class="modeling" v-if="date_2 !== null">
          Modeling: {{(new Date(date_2)).toLocaleString('en-US', date_display_format)}}
        </div>
        <datetime-picker v-model="date_2"></datetime-picker>
      </div>
    </fieldset>

    <fieldset>
      <legend> TimePicker </legend>
    </fieldset>


    <fieldset>
      <legend> DatetimePicker </legend>
    </fieldset>

  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import DatetimePicker from '@/components/datetime_picker.vue';

@Component({
  components: { DatetimePicker }
})
export default class DatetimePickerDemo extends Vue {
  date_1 = "2019-12-25T18:36:37.746189Z";
  date_display_format = { year: 'numeric', month: 'long', day: 'numeric',
                          hour: 'numeric', minute: 'numeric'};

  date_2 = null;
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
  padding: 10px 0 0 0;
}

.modeling {
  margin: 5px 0 10px 0;
  background-color: $pebble-light;
  padding: 10px;
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
