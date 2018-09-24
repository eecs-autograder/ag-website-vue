<template>
  <div>
    <div> {{title}} </div>
    <div class="grouping">
      <div v-for="item of items">
        <!--binds the properties of an entire object to an element-->
        <slot v-bind="item"></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

  @Component
  export default class TodoList extends Vue {

    @Prop({default: "", type: String})
    title_in!: string;

    @Prop({default: () => [], type: Array})
    items_in!: object[];

    items: object[] = [];
    title = "";

    created() {
      this.items = this.items_in;
      this.title = this.title_in;
    }

  }
</script>

<style scoped lang="scss">
  @import '@/styles/colors.scss';
.grouping {
  margin: 10px;
  background-color: lightskyblue;
  padding: 10px;
}

</style>
