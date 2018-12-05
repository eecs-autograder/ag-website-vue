<template>

  <div>
    <p class="color-announcement"> Grays </p>

    <div class="color">
      <p class="color-name"> pebble-light </p>
      <p class="color-square pebble-light"> </p>
    </div>

    <div class="color">
      <p class="color-name"> pebble-medium </p>
      <p class="color-square pebble-medium"></p>
    </div>

    <div class="color">
      <p class="color-name"> pebble-dark </p>
      <p class="color-square pebble-dark"></p>
    </div>

    <div class="color">
      <p class="color-name"> stormy-gray-light </p>
      <p class="color-square stormy-gray-light"></p>
    </div>

    <div class="color">
      <p class="color-name"> stormy-gray-dark </p>
      <p class="color-square stormy-gray-dark"></p>
    </div>

    <div class="color">
      <p class="color-name"> baking-pan </p>
      <p class="color-square baking-pan"></p>
    </div>

    <div class="color">
      <p class="color-name"> dark-gray </p>
      <p class="color-square dark-gray"></p>
    </div>

    <div class="color-divider"></div>

    <p class="color-announcement"> Reds </p>

    <div class="color">
      <p class="color-name"> ballet-slipper </p>
      <p class="color-square ballet-slipper"></p>
    </div>

    <div class="color">
      <p class="color-name"> bubble-gum </p>
      <p class="color-square bubble-gum"></p>
    </div>

    <div class="color">
      <p class="color-name"> coral-pink </p>
      <p class="color-square coral-pink"></p>
    </div>

    <div class="color">
      <p class="color-name"> cherry </p>
      <p class="color-square cherry"> </p>
    </div>

    <div class="color">
      <p class="color-name"> burnt-red </p>
      <p class="color-square burnt-red"></p>
    </div>

    <div class="color-divider"></div>

    <p class="color-announcement"> Oranges </p>

    <div class="color">
      <p class="color-name"> orange </p>
      <p class="color-square orange"></p>
    </div>

    <div class="color-divider"></div>

    <p class="color-announcement"> Yellows </p>

    <div class="color">
      <p class="color-name"> yellow </p>
      <p class="color-square light-yellow"></p>
    </div>

    <div class="color-divider"></div>

    <p class="color-announcement"> Greens </p>

    <div class="color">
      <p class="color-name"> green </p>
      <p class="color-square green"></p>
    </div>

    <div class="color-divider"></div>

    <p class="color-announcement"> Blues </p>

    <div class="color">
      <p class="color-name"> light-blue </p>
      <p class="color-square light-blue"></p>
    </div>

    <div class="color">
      <p class="color-name"> sky-blue </p>
      <p class="color-square sky-blue"></p>
    </div>

    <div class="color">
      <p class="color-name"> ocean-blue </p>
      <p class="color-square ocean-blue"></p>
    </div>

    <div class="color-divider"></div>

    <p class="color-announcement"> Usage </p>

    <div class="color">
      <p class="color-name"> save-green </p>
      <p class="color-square green"></p>
    </div>

    <div class="color">
      <p class="color-name"> warning-red </p>
      <p class="color-square cherry"></p>
    </div>

    <div class="color">
      <p class="color-name"> toggle-blue </p>
      <p class="color-square ocean-blue"></p>
    </div>

    <div class="color-divider"></div>

  </div>

</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator';

  @Component({
    components: {}
  })
  export default class ColorPalette extends Vue {

  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import '@/styles/colors.scss';

.color-announcement {
  display: block;
}

.color {
  display: inline-block;
}

.color-name {
  margin: 0 10px;
  font-size: 12px;
  text-align: center;
}

.color-square {
  height: 100px;
  width: 100px;
  margin: 10px;
}

.color-divider {
  margin: 10px 0;
  height: 1px;
  background-color: $pebble-medium;
}

.pebble-light {
  background-color: $pebble-light;
}

.pebble-medium {
  background-color: $pebble-medium;
}

.pebble-dark {
  background-color: $pebble-dark;
}

.baking-pan {
  background-color: $baking-pan;
}

.stormy-gray-light {
  background-color: $stormy-gray-light;
}

.stormy-gray-dark {
  background-color: $stormy-gray-dark;
}

.dark-gray {
  background-color: $dark-gray;
}

.cherry {
  background-color: $cherry;
}

.burnt-red {
  background-color: $burnt-red;
}

.ballet-slipper {
  background-color: $ballet-slipper;
}

.bubble-gum {
  background-color: $bubble-gum;
}

.coral-pink {
  background-color: $coral-pink;
}

.orange {
  background-color: $orange;
}

.light-yellow {
  background-color: $light-yellow;
}

.green {
  background-color: $save-green;
}

.sky-blue {
  background-color: $sky-blue;
}

.light-blue {
  background-color: $light-blue;
}

.ocean-blue {
  background-color: $ocean-blue;
}

</style>
