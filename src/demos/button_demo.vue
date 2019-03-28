<template>
  <div>

    <button class="blue-button"> Click On Me </button>
    <br>
    <br>
    <button class="green-button"> Save </button>
    <br>
    <br>
    <button class="red-button"> Delete
      <p class="trash-can fas fa-trash"></p>
    </button>
    <br>
    <br>
    <button class="gray-button"> Cancel </button>
    <br>
    <br>
    <button class="orange-button"> Happy Halloween </button>
    <br>
    <br>
    <button class="purple-button"> Enter Contest </button>
    <br>
    <br>

    <div class="button custom-button"> Hello </div>

  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class ButtonDemo extends Vue {
}
</script>
<style scoped lang="scss">
@import '@/styles/colors.scss';
@import '@/styles/button_styles.scss';

.custom-button {
  background-color: hsl(330, 100%, 65%);
  border: 1px solid hsl(330, 100%, 81%);
}

.custom-button:hover {
  background-color: hsl(330, 100%, 60%);
}

.custom-button:focus {
  outline-color: hsl(330, 100%, 90%);
}

.trash-can {
  margin: 0 0 0 5px;
}

</style>
