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
  // Input property. The ! is to make typescript not complain about this not being initialized
  // in the ctor.
  @Prop({default: false, type: Boolean})
  value!: boolean;

  @Prop({default: "On", type: String})
  switch_is_on_text: string;

  @Prop({default: "Off", type: String})
  switch_is_off_text: string;

  // data must be public and be initialized.
  is_on: boolean = false;
  on_side_text: string;
  off_side_text: string;

  // Vue doesn't like mutable properties, so we copy the value
  // into a data member.
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

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import '@/styles/colors.scss';

#toggle-button-space {
  height: 25px;
  border-radius: 3px;
  z-index: 4;
  display: inline-block;
}

.active-option-style {
  opacity: 1;
  font-weight: normal;
  color: white;
  display: inline-block;
  height: 25px;
  z-index: 4;
  box-shadow: 0px 1px 1px $shadow-color;
  background-color: $medium-dark-blue;
  color: white;
}

.inactive-option-style {
  opacity: 0.7;
  font-weight: normal;
  color: black;
  display: inline-block;
  height: 25px;
  z-index: 3;
  box-shadow: inset 1px 1px 3px $shadow-color;
  cursor: pointer;
}

.active-option-style p, .inactive-option-style p {
  margin: 0px;
  padding-left: 10px;
  padding-right: 10px;
  font-size: 13px;
}

.on-border {
  border-radius: 3px 0 0 3px;
}

.off-border {
  border-radius: 0px 3px 3px 0;
}

button {
  color: white;
  background-color: black;
}

p {
  position: relative;
  top: 52%;
  transform: perspective(1px) translateY(-50%);
}

</style>
