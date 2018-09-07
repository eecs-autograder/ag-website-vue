<template>
  <div class="hello">

    <button @click="modal_1_open = true">Open Default Modal</button>
    <modal v-if="modal_1_open" :close="() => modal_1_open = false">
      <h2>Title Example (Default)</h2>
      <hr>
      <p>The cool thing about this is that its totally reusable!</p>
      <small>You can even close it using the little x at the top :D</small>
    </modal>

    <br/>
    <br/>

    <button @click="modal_2_open = true">Open Small Modal</button>
    <modal v-if="modal_2_open" :close="() => modal_2_open = false"
           :size="'small'">
      <h2>Title Example (Small)</h2>
      <hr>
      <p>The cool thing about this is that its totally reusable!</p>
      <small>You can even close it using the little x at the top :D</small>
    </modal>

    <br/>
    <br/>

    <button @click="modal_3_open = true">Open Medium Modal</button>
    <modal v-if="modal_3_open" :close="() => modal_3_open = false"
           :size="'medium'">
      <h2>Title Example (Medium)</h2>
      <hr>
      <p>The cool thing about this is that its totally reusable!</p>
      <small>You can even close it using the little x at the top :D</small>
    </modal>

    <br/>
    <br/>

    <button @click="modal_4_open = true">Open Large Modal</button>
    <modal v-if="modal_4_open" :close="() => modal_4_open = false"
           :size="'large'">
      <h2>Title Example (Large)</h2>
      <hr>
      <p>The cool thing about this is that its totally reusable!</p>
      <small>You can even close it using the little x at the top :D</small>
    </modal>

    <br/>
    <br/>

    <button @click="modal_5_open = true">Open Custom Size Modal</button>
    <modal v-if="modal_5_open" :close="() => modal_5_open = false"
           :custom_width="'900px'">
      <h2>Title Example (900px)</h2>
      <hr>
      <p>The cool thing about this is that its totally reusable!</p>
      <small>You can even close it using the little x at the top :D</small>
    </modal>

  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import Modal from './modal.vue';

@Component({
  components: { Modal }
})
export default class HelloWorld extends Vue {
  @Prop()
  msg!: string;

  modal_1_open: boolean = false;
  modal_2_open: boolean = false;
  modal_3_open: boolean = false;
  modal_4_open: boolean = false;
  modal_5_open: boolean = false;
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}

</style>
