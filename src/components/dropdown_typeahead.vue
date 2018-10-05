<template>
  <div class="dropdown-typeahead-container">
    <Dropdown ref="dropdown_component"
              :incoming_items="filtered_choices"
              @update_item_selected="choose_item($event)">
      <template slot="header">
        <input id="search-field"
               type=text
               :placeholder="placeholder_text"
               name="some_word_stuff"
               v-model="filter_text"
               @keydown="resume_search()">
      </template>
      <template slot-scope="{item}">
        <slot v-bind:item="item">
          {{item}}
        </slot>
      </template>

    </Dropdown>
  </div>
</template>

<script lang="ts">

  import Dropdown from '@/components/dropdown.vue';

  import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
  @Component({
    components: { Dropdown }
  })
  export default class DropdownTypeahead extends Vue {

    @Prop({required: true, type: Array})
    incoming_choices!: object[];

    @Prop({required: true, type: String})
    incoming_placeholder_text!: string;

    @Prop({ required: true, type: Function })
    incoming_filter_fn!: (item: object, filter: string) => boolean;

    filter_text: string = "";
    placeholder_text = "";
    choices: object[] = [];
    filter_fn = function(item: object, filter: string) {
      return true;
    };
    private _filtered_choices: object[] = [];

    @Watch('filter_text')
    on_filter_text_changed(new_val: string, old_val: string) {
      console.log(`Old ${old_val}`);
      console.log(`New ${new_val}`);
      this._filtered_choices = [];
    }

    created() {
      this.placeholder_text = this.incoming_placeholder_text;
      this.choices = this.incoming_choices;
      this.filter_fn = this.incoming_filter_fn;
    }

    choose_item(chosen_item: object) {
      this.$emit("update_item_chosen", chosen_item);
    }

    resume_search() {
      let dropdown = <Dropdown> this.$refs.dropdown_component;
      dropdown.show_the_dropdown_menu();
    }

    get filtered_choices() {
      if (this.filter_text === "") {
        return this.choices;
      }
      this._filtered_choices = this.choices.filter(
        (item) => this.filter_fn(item, this.filter_text));
      return this._filtered_choices;
    }

  }
</script>

<style scoped lang="scss">
@import '@/styles/colors.scss';

#search-field {
  border-radius: 5px;
  min-width: 160px;
  background-color: hsl(210, 13%, 95%);
  border: 2px solid hsl(210, 13%, 95%);
  box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2);
  color: black;
  font-family: "Helvetica Neue", Helvetica, sans-serif;
  font-size: 16px;
  height: 24px;
  margin: 0;
  padding: 6px 10px;
  width: 400px;
}

#search-field:hover {
  background-color: hsl(210, 12%, 93%);
  border-color: hsl(210, 12%, 93%);
  color: black;
}

</style>
