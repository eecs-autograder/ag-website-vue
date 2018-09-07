<template>
  <div class="dropdown-container">
    <div class="dropdown" tabindex="1"
      @blur="hide_the_dropdown_menu()">
      <div id="dropdown-top"
         @click="toggle_dropdown_menu()">
        <p> {{chosen_item}} </p>
        <i class="fas fa-angle-down fa-lg arrow-down"> </i>
      </div>
      <div class="dropdown-content">
        <a v-for="(item, index) of items"
           @click="choose_item_from_dropdown_menu(item, index)"
           :id="index === highlighted_index ? 'highlight' : ''">
          {{item}}
        </a>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { Component, Prop, Vue } from 'vue-property-decorator';

  @Component({
    components: { }
  })

  export default class Dropdown extends Vue {

    @Prop({required: true, type: Array})
    incoming_items!: string[];

    @Prop({default: "", type: String})
    incoming_chosen_item!: string;

    dropdown_is_visible = false;
    items: string[] = [];

    chosen_item: string = "";

    highlighted_index = 0;

    created() {
      this.items = this.incoming_items;
      this.chosen_item = this.incoming_chosen_item === ""
        ? this.items[0] : this.incoming_chosen_item;
      this.highlighted_index = this.items.findIndex(this.find_chosen_item);
    }

    find_chosen_item(item: string) {
      console.log(item);
      console.log(item === this.chosen_item);
      return item === this.chosen_item;
    }

    show_the_dropdown_menu() {
      let dropdown_menu = <HTMLElement> this.$el.getElementsByClassName("dropdown-content")[0];
      dropdown_menu.style.display = "block";
      this.dropdown_is_visible = true;
    }
    hide_the_dropdown_menu() {
      let dropdown_menu = <HTMLElement> this.$el.getElementsByClassName("dropdown-content")[0];
      dropdown_menu.style.display = "none";
      this.dropdown_is_visible = false;
      console.log("Closed it");
    }

    choose_item_from_dropdown_menu(item_selected: string, index: number) {
      this.chosen_item = item_selected;
      this.highlighted_index = index;
      this.hide_the_dropdown_menu();
    }

    toggle_dropdown_menu() {
      if (this.dropdown_is_visible) {
        this.hide_the_dropdown_menu();
      }
      else {
        this.show_the_dropdown_menu();
      }
    }


  }
</script>

<style scoped lang="scss">
  @import '@/styles/colors.scss';

  .dropdown {
    display: inline-block;
    position: relative;
  }

  .dropdown:focus {
    outline:none;
  }

  .dropdown-content {
    background-color: white;
    box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2);
    display: none;
    margin-top: 1px;
    position: absolute;
    width: 100%;
    z-index: 1;
  }
  .dropdown-content a {
    border-top: 1px solid $light-gray;
    color: black;
    cursor: pointer;
    display: block;
    font-family: "Helvetica Neue", Helvetica, sans-serif;
    margin: 0;
    min-height: 13px;
    padding: 8px 10px;
    text-decoration: none;
  }
  .dropdown-content a:first-child {
    border-top: none;
  }
  .dropdown-content a:last-child {
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
  }
  .dropdown-content a:hover {
    background-color: hsl(210, 13%, 95%);
  }
  #highlight:hover {
    background-color: hsl(210, 13%, 80%);
  }
  #highlight {
    background-color: hsl(210, 13%, 80%);
  }

  #dropdown-top {
    background-color: hsl(210, 13%, 90%);
    border: 2px solid hsl(210, 13%, 90%);
    box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2);
    color: black;
    font-family: "Helvetica Neue", Helvetica, sans-serif;
    font-size: 16px;
    margin: 0;
    padding: 6px 10px;
    min-width: 200px;
  }

  #dropdown-top p {
    margin: 0;
    padding: 2px;
  }

  #dropdown-top:hover {
    background-color: hsl(210, 12%, 93%);
    border-color: hsl(210, 12%, 93%);
    color: black;
  }

  .arrow-down {
    position: absolute;
    right: 22px;
    top: 13px;
    color: hsl(210, 12%, 40%);
  }

  .arrow-down:hover {
    color: hsl(210, 12%, 30%);
  }

</style>
