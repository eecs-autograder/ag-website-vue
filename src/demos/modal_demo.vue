<template>
  <div id="modal-demo">

    <button @click="show_modal_1 = true"
            class="open-modal-button">Open Default Modal</button>
    <modal v-if="show_modal_1"
           @close="show_modal_1 = false"
           ref="modal1"
           click_outside_to_close>
      <h2>Title Example (Default)</h2>
      <hr>
      <p>The cool thing about this is that its totally reusable!</p>
      <small>You can even close it using the little x at the top :D</small>
    </modal>

    <button @click="show_modal_2 = true"
            class="open-modal-button">Open Small Modal</button>
    <modal v-if="show_modal_2"
           @close="show_modal_2 = false"
           ref="modal2"
           :size="'small'">
      <h2>Title Example (Small)</h2>
      <hr>
      <p>The cool thing about this is that its totally reusable!</p>
      <small>You can even close it using the little x at the top :D</small>
    </modal>

    <button @click="show_modal_3 = true"
            class="open-modal-button">Open Medium Modal</button>
    <modal v-if="show_modal_3"
           @close="show_modal_3 = false"
           ref="modal3"
           :size="'medium'">
      <h2>Title Example (Medium)</h2>
      <hr>
      <p>The cool thing about this is that its totally reusable!</p>
      <small>You can even close it using the little x at the top :D</small>
    </modal>

    <button @click="show_modal_4 = true"
            class="open-modal-button">Open Large Modal</button>
    <modal v-if="show_modal_4"
           @close="show_modal_4 = false"
           ref="modal4"
           :size="'large'">
      <h2>Title Example (Large)</h2>
      <hr>
      <p>The cool thing about this is that its totally reusable!</p>
      <small>You can even close it using the little x at the top :D</small>
    </modal>

    <button @click="show_modal_5 = true"
            class="open-modal-button">Open Custom Size Modal</button>
    <modal v-if="show_modal_5"
           @close="show_modal_5 = false"
           ref="modal5"
           :custom_width="'900px'">
      <h2>Title Example (900px)</h2>
      <hr>
      <p>The cool thing about this is that its totally reusable!</p>
      <small>You can even close it using the little x at the top :D</small>
    </modal>

    <button @click="show_modal_6 = true"
            class="open-modal-button">Click outside of modal to close</button>
    <modal v-if="show_modal_6"
           @close="show_modal_6 = false"
           ref="modal6"
           click_outside_to_close>
      <h2>Title Example</h2>
      <hr>
      <p>Clicking outside of the modal will close it!</p>
      <small>This is very useful for notifications and non-essential notices to the user</small>
    </modal>

    <button @click="show_modal_7 = true"
            class="open-modal-button">No x at the top</button>
    <modal v-if="show_modal_7"
           @close="show_modal_7 = false"
           ref="modal7"
           :include_closing_x="false">
      <h2>Title Example</h2>
      <hr>
      <p>The cool thing about this is that its totally reusable!</p>
      <small>Oh, except this one doesn't have the x at the top</small>
      <button @click="show_modal_7 = false">Close</button>
    </modal>

  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import Modal from '@/components/modal.vue';

@Component({
  components: { Modal }
})
export default class ModalDemo extends Vue {
    show_modal_1 = false;
    show_modal_2 = false;
    show_modal_3 = false;
    show_modal_4 = false;
    show_modal_5 = false;
    show_modal_6 = false;
    show_modal_7 = false;
}
</script>

<style scoped lang="scss">
@import '@/styles/button_styles.scss';

.open-modal-button {
  @extend .white-button;
  display: block;
  margin: 20px;
  padding: 10px;
}

</style>
