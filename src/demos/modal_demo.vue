<template>
  <div class="hello">

    <button @click="$refs.modal1.open()">Open Default Modal</button>
    <modal ref="modal1">
      <h2>Title Example (Default)</h2>
      <hr>
      <p>The cool thing about this is that its totally reusable!</p>
      <small>You can even close it using the little x at the top :D</small>
    </modal>

    <br/>
    <br/>

    <button @click="$refs.modal2.open()">Open Small Modal</button>
    <modal ref="modal2" :size="'small'">
      <h2>Title Example (Small)</h2>
      <hr>
      <p>The cool thing about this is that its totally reusable!</p>
      <small>You can even close it using the little x at the top :D</small>
    </modal>

    <br/>
    <br/>

    <button @click="$refs.modal3.open()">Open Medium Modal</button>
    <modal ref="modal3" :size="'medium'">
      <h2>Title Example (Medium)</h2>
      <hr>
      <p>The cool thing about this is that its totally reusable!</p>
      <small>You can even close it using the little x at the top :D</small>
    </modal>

    <br/>
    <br/>

    <button @click="$refs.modal4.open()">Open Large Modal</button>
    <modal ref="modal4" :size="'large'">
      <h2>Title Example (Large)</h2>
      <hr>
      <p>The cool thing about this is that its totally reusable!</p>
      <small>You can even close it using the little x at the top :D</small>
    </modal>

    <br/>
    <br/>

    <button @click="$refs.modal5.open()">Open Custom Size Modal</button>
    <modal ref="modal5" :custom_width="'900px'">
      <h2>Title Example (900px)</h2>
      <hr>
      <p>The cool thing about this is that its totally reusable!</p>
      <small>You can even close it using the little x at the top :D</small>
    </modal>

    <br/>
    <br/>

    <button @click="$refs.modal6.open()">Click outside of modal to close</button>
    <modal ref="modal6" click_to_close>
      <h2>Title Example</h2>
      <hr>
      <p>Clicking outside of the modal will close it!</p>
      <small>This is very useful for notifications and non-essential notices to the user</small>
    </modal>

    <br/>
    <br/>

    <button @click="$refs.modal7.open()">No x at the top</button>
    <modal ref="modal7" remove_x>
      <h2>Title Example</h2>
      <hr>
      <p>The cool thing about this is that its totally reusable!</p>
      <small>Oh, except this one doesn't have the x at the top</small>
      <button @click="$refs.modal7.close()">Close</button>
    </modal>

  </div>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator';

  import Modal from '@/components/modal.vue';

  @Component({
    components: { Modal }
  })
  export default class ModalDemo extends Vue {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<!--<style scoped lang="scss">-->
<!--</style>-->
