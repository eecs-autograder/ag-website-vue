<template>
  <div id="toggle-button-space">
    <div v-if="is_on" class="active-option-style on-border">
      <p> {{on_side_text}} </p>
    </div>
    <div v-else @click="_toggle()" class="inactive-option-style on-border cursor-pointer">
      <p> {{on_side_text}} </p>
    </div>

    <div v-if="is_on" @click="_toggle()" class="inactive-option-style off-border">
      <p> {{off_side_text}} </p>
    </div>
    <div v-else class="active-option-style off-border">
      <p> {{off_side_text}} </p>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class Toggle extends Vue {

  @Prop({default: false, type: Boolean})
  value!: boolean;

  @Prop({default: "On", type: String})
  switch_is_on_text!: string;

  @Prop({default: "Off", type: String})
  switch_is_off_text!: string;

  is_on: boolean = false;
  on_side_text: string = "On";
  off_side_text: string = "Off";

  created() {
    this.is_on = this.value;
    this.on_side_text = this.switch_is_on_text;
    this.off_side_text = this.switch_is_off_text;
  }

  private _toggle() {
    this.is_on = !this.is_on;
    this.$emit('input', this.is_on);
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';

#toggle-button-space {
  border-radius: 3px;
  display: inline-block;
  height: 25px;
  z-index: 4;
}

.active-option-style {
  background-color: $medium-dark-blue;
  box-shadow: 0px 1px 1px $shadow-color;
  color: white;
  display: inline-block;
  font-weight: normal;
  height: 25px;
  opacity: 1;
  z-index: 4;
}

.inactive-option-style {
  box-shadow: inset 1px 1px 3px $shadow-color;
  color: black;
  cursor: pointer;
  display: inline-block;
  font-weight: normal;
  height: 25px;
  opacity: 0.85;
  z-index: 3;
}

.active-option-style p, .inactive-option-style p {
  font-size: 13px;
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  margin: 0px;
  padding-left: 10px;
  padding-right: 10px;
  position: relative;
  top: 52%;
  transform: perspective(1px) translateY(-50%);
}

.on-border {
  border-radius: 3px 0 0 3px;
}

.off-border {
  border-radius: 0px 3px 3px 0;
}
</style>
