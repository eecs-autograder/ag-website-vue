<template>
  <div class="toggle-demo-container">

    <div class="divider"> </div>
    <p class="custom-label"> This toggle switch instance supplies a custom active color. </p>
    <p id="toggle-ex-1-val"> Light Switch Value:
      <span> {{toggle_ex_1_value}} </span>
    </p>
    <div id="toggle-ex-1">
      <Toggle v-model="toggle_ex_1_value"
              :active_background_color="toggle_ex_1_active_color">
        <div slot="on">
          <p class="toggle-ex-1-side"><i class="fas fa-lightbulb lightbulb-on"></i></p>
        </div>
        <div slot="off">
          <p class="toggle-ex-1-side"><i class="far fa-lightbulb lightbulb-off"></i></p>
        </div>
      </Toggle>
    </div>

    <div id="button-zone">
      <button class="on-button" @click="toggle_ex_1_value = true"> Turn the Light On </button>
      <button class="off-button" @click="toggle_ex_1_value = false"> Turn the Light Off </button>
    </div>

    <div class="divider"> </div>

    <p class="default-label"> This toggle switch instance uses the default active color. </p>
    <div id="lock-zone">
      <p v-if="toggle_ex_2_value">
        <i class="fas fa-lock lock"></i>
      </p>
      <p v-else>
        <i class="fas fa-lock-open lock"></i>
      </p>
    </div>
    <div id="toggle-ex-2">
      <Toggle v-model="toggle_ex_2_value">
        <div slot="on">
          <p class="toggle_ex_2_side"> Lock </p>
        </div>
        <div slot="off">
          <p class="toggle_ex_2_side"> Unlock </p>
        </div>
      </Toggle>
    </div>

  </div>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator';

  import Toggle from '@/components/toggle.vue';

  @Component({
    components: { Toggle }
  })
  export default class ToggleDemo extends Vue {

    toggle_ex_1_value = true;

    toggle_ex_1_active_color = 'hsl(46, 100%, 66%)';

    toggle_ex_2_value = false;

  }
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';

.lightbulb-on {
  color: black;
  font-size: 40px;
}

.lightbulb-off {
  color: black;
  font-size: 40px;
}

#button-zone, #lock-zone {
  margin: 20px;
  text-align: center;
}

button {
  background-color: black;
  border: none;
  border-radius: 5px;
  color: white;
  cursor: pointer;
  margin: 10px 20px 0 20px;
  padding: 10px;
}

#toggle-ex-1, #toggle-ex-2 {
  text-align: center;
}
  
#toggle-ex-1-val {
  padding: 10px;
  text-align: center;
}

#toggle-ex-1-val span {
  background-color: $light-blue;
}

#toggle-ex-2 {
  margin-bottom: 30px;
}

.lock {
  color: $stormy-gray-dark;
  font-size: 100px;
  margin: 10px;
}

.toggle-ex-1-side, .toggle-ex-2-side {
  padding: 10px;
}

.default-label {
  font-weight: bold;
  margin-bottom: 30px;
  text-align: center;
}

.divider {
  margin: 30px 0;
  border-top: 5px solid black;
}

.custom-label {
  font-weight: bold;
  text-align: center;
}

</style>
