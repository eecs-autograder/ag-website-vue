<template>
  <div class="button-demo">

    <button class="light-gray-button"
            @click="buttons_disabled = !buttons_disabled"> Toggle Button State</button>
    <br>
    <br>
    <button class="blue-button"
            :disabled="buttons_disabled"> Submit </button>
    <br>
    <br>

    <button class="teal-button"
            :disabled="buttons_disabled"> Create Group </button>
    <br>
    <br>


    <button class="green-button"
            :disabled="buttons_disabled"> Save Files </button>
    <br>
    <br>
    <button class="red-button"
            :disabled="buttons_disabled"> Delete
      <p class="trash-can fas fa-trash"></p>
    </button>
    <br>
    <br>
    <button class="gray-button"
            :disabled="buttons_disabled"> Choose Files </button>
    <br>
    <br>
    <button class="orange-button"
            :disabled="buttons_disabled"> Cancel </button>
    <br>
    <br>
    <button class="purple-button"
            :disabled="buttons_disabled"> Go! </button>
    <br>
    <br>
    <button class="light-gray-button"
            :disabled="buttons_disabled"> Remove </button>
    <br>
    <br>
    <button class="white-button"
            :disabled="buttons_disabled"> Find File </button>

  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
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

.button-demo {
  padding: 20px;
}

</style>
