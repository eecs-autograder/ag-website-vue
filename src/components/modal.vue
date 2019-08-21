<template>
  <transition name="modal">
    <div id="modal-mask"
         @click.self="() => {click_outside_to_close ? $emit('close') : null}">
      <div class="modal-container"
           :class="size"
           :style="custom_width ? {width: custom_width} : ''">
        <slot></slot>
        <button v-if="include_closing_x"
                id="close-button"
                @click="$emit('close')">
          <strong>&#10005;</strong>
        </button>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class Modal extends Vue {
  @Prop({default: false, type: Boolean})
  click_outside_to_close!: boolean;

  @Prop({default: true, type: Boolean})
  include_closing_x!: boolean;

  @Prop({default: 'large', type: String})
  size!: string;

  @Prop({type: String})
  custom_width!: string;
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
#modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, .5);
  display: block;
  transition: opacity .3s ease;
}

.modal-container {
  /* Center in middle of screen */
  position: absolute;
  top: 50%;
  left: 50%;
  -webkit-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);

  width: 25%;
  padding: 20px 30px;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .33);
  transition: all 0.3s ease;
}

.small {
  width: 15%;
}

.medium {
  width: 35%;
}

.large {
  width: 60%;
}

#close-button {
  font-size: 0.8em;
  cursor: pointer;
  border: none;
  position: absolute;
  top: 10px;
  right: 10px;
}

/* Transition styles */
.modal-enter,
.modal-leave-active {
  opacity: 0;
}
</style>
