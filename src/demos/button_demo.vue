<template>
  <div id="button-demo">

    <div class="button-box">
      <Toggle v-model="buttons_disabled">
        <div slot="on">
          <p> Disable Buttons </p>
        </div>
        <div slot="off">
          <p> Enable Buttons </p>
        </div>
      </Toggle>
    </div>

    <div class="button-box">
      <button class="blue-button" :disabled="buttons_disabled"> Submit </button>
    </div>

    <div class="button-box">
      <button class="teal-button" :disabled="buttons_disabled"> Create Group </button>
    </div>

    <div class="button-box">
      <button class="green-button" :disabled="buttons_disabled"> Save Files </button>
    </div>

    <div class="button-box">
      <button class="red-button" :disabled="buttons_disabled"> Delete
        <span class="trash-can fas fa-trash"></span>
      </button>
    </div>

    <div class="button-box">
      <button class="gray-button" :disabled="buttons_disabled"> Choose Files </button>
    </div>

    <div class="button-box">
      <button class="orange-button" :disabled="buttons_disabled"> Cancel </button>
    </div>

    <div class="button-box">
      <button class="purple-button" :disabled="buttons_disabled"> Go! </button>
    </div>

    <div class="button-box">
      <button class="periwinkle-button" :disabled="buttons_disabled"> Update </button>
    </div>

    <div class="button-box">
      <button class="light-gray-button" :disabled="buttons_disabled"> Remove </button>
    </div>

    <div class="button-box">
      <button class="white-button" :disabled="buttons_disabled"> Find File </button>
    </div>

  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import Toggle from '@/components/toggle.vue';

@Component({
  components: {
    Toggle
  }
})
export default class ButtonDemo extends Vue {
  buttons_disabled = false;
}
</script>
<style scoped lang="scss">
@import '@/styles/colors.scss';
@import '@/styles/button_styles.scss';

.trash-can {
  margin: 0 0 0 5px;
}

#button-demo {
  padding: 0 20px;
}

.button-box {
  margin: 25px 0;
}

</style>
