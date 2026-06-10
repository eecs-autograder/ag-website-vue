<template>
  <div
    class="ag-test-command panel level-2"
    :class="{
      active:
        active_ag_test_command !== null &&
        active_ag_test_command.pk === ag_test_command.pk,
    }"
  >
    <button
      type="button"
      class="panel-toggle"
      @click="$emit('update_active_item', ag_test_command)"
    >
      <div class="text">{{ ag_test_command.name }}</div>
    </button>
    <div class="icons">
      <i class="icon handle fas fa-arrows-alt" aria-hidden="true"></i>
      <MoveButtons
        :index="index"
        :count="command_count"
        @move_up="$emit('move_up')"
        @move_down="$emit('move_down')"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

import { AGTestCommand } from "ag-client-typescript";

import MoveButtons from "@/components/MoveButtons.vue";

@Component({
  components: { MoveButtons },
})
export default class AGTestCommandPanel extends Vue {
  @Prop({ required: true, type: AGTestCommand })
  ag_test_command!: AGTestCommand;

  @Prop({ required: false, type: AGTestCommand })
  active_ag_test_command!: AGTestCommand | null;

  @Prop({ required: true, type: Number })
  index!: number;

  @Prop({ required: true, type: Number })
  command_count!: number;
}
</script>

<style scoped lang="scss">
@import "@/styles/button_styles.scss";
@import "@/styles/colors.scss";
@import "@/styles/list_panels.scss";

@import "./ag_tests.scss";

@include list-panels($indentation: $panel-indentation);

* {
  box-sizing: border-box;
}

.panel-toggle {
  background: none;
  border: none;
  padding: 0;
  flex: 1;
  min-width: 0;
  text-align: left;
  cursor: pointer;
  color: inherit;
  font-size: inherit;
  font-family: inherit;
  display: flex;
  align-items: center;
}

.handle {
  cursor: grabbing;
}
</style>
