<template>
  <div class="typeahead-demo">
    <dropdown-typeahead
      incoming_placeholder_text="Enter a State"
      :incoming_choices="states"
      @update_item_chosen="print_item($event)"
      item_field_name="state"
      :incoming_filter_fn="filter_fn_1">
      <template slot-scope="dropdown_item">
        <span> {{ dropdown_item.state }}</span>
      </template>
    </dropdown-typeahead>

    <div class="typeahead-1-selections">
      <h3> Chosen from Typeahead: </h3>
      <p v-for="item of chosen_items"> {{item.state}} </p>
    </div>
  </div>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator';

  import DropdownTypeahead from '@/components/dropdown_typeahead.vue';

  @Component({
    components: { DropdownTypeahead }
  })
  export default class ModalDemo extends Vue {

    states = [ {state: "Missouri"},
               {state: "Mississippi"},
               {state: "Minnesota"},
               {state: "Massachusetts"},
               {state: "Maine"},
               {state: "Montana"},
               {state: "Michigan"},
               {state: "Maryland"}];

    print_item(item: object) {
      this.chosen_items.push(item);
    }

    chosen_items: object[] = [];

    filter_fn_1(item: string, filter_text: string) {
      let field_name = "state";
      let str_at_field = item[field_name];
      return str_at_field.indexOf(filter_text) >= 0;
    };

  }
</script>

<style scoped lang="scss">

.typeahead-1-selections {
  margin-top: 100px;
  background-color: darkseagreen;
  padding: 20px;
}

</style>
