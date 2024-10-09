<template>

</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import moment from 'moment';

export class TimeDelta {
  readonly days: number;
  readonly hours: number;
  readonly minutes: number;

  constructor(days: number = 0, hours: number = 0, minutes: number = 0) {
    this.days = days;
    this.hours = hours;
    this.minutes = minutes;
  }

  as_duration() {
    return moment.duration({
      days: this.days,
      hours: this.hours,
      minutes: this.minutes
    });
  }

  from_duration(duration: moment.Duration): TimeDelta {
    return new TimeDelta(duration.days(), duration.hours(), duration.minutes());
  }
}

</script>
