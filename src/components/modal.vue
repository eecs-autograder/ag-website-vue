<template>
  <transition name="modal">
    <div class="modal-mask"
         @click.self="() => {click_outside_to_close ? $emit('close') : null}">
      <div class="modal-container"
           :class="size"
           :style="custom_width ? {width: custom_width} : ''">
        <slot></slot>
        <div v-if="include_closing_x"
                class="close-button"
                @click="$emit('close')">
          &#10005;
        </div>
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
@import '@/styles/colors.scss';

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

.modal-mask {
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

  padding: 1rem;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .33);
  transition: all 0.3s ease;

  max-height: 80%;
  overflow: auto;
}

.small {
  width: 35%;

  @media only screen and (min-width: 700px) {
    width: 25%;
  }

  @media only screen and (min-width: 900px) {
    width: 15%;
  }
}

.medium {
  width: 55%;

  @media only screen and (min-width: 700px) {
    width: 45%;
  }

  @media only screen and (min-width: 900px) {
    width: 35%;
  }
}

.large {
  width: 90%;

  @media only screen and (min-width: 700px) {
    width: 70%;
  }

  @media only screen and (min-width: 900px) {
    width: 60%;
    max-width: 700px;
  }
}

.close-button {
  cursor: pointer;

  position: absolute;
  top: 4px;
  right: 4px;

  font-size: 1.25rem;
  line-height: 1;

  &:hover {
    color: darken($stormy-gray-dark, 15%);
  }
}

/* Transition styles */
.modal-enter,
.modal-leave-active {
  opacity: 0;
}
</style>
