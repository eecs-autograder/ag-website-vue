<template>
  <div>
    <div class="input-group" dropdown #dropdown_menu="bs-dropdown"
         container="body">
      <input id='spam' class="form-control" type="text"
             #filter_input
             [placeholder]="placeholder_text" [(ngModel)]="filter_text"
             (click)="dropdown_menu.show()"
             (blur)="dropdown_menu.hide()"
             (keydown)="move_highlighted($event)"
             (keydown.enter)="$event.preventDefault();
                              $event.stopPropagation();
                              select_highlighted()"
             (ngModelChange)="_filtered_choices = null">
      <span class="input-group-addon"
            (click)="dropdown_arrow_clicked()">
    <i class="fa fa-chevron-down"></i>
  </span>
      <ul *dropdownMenu class="dropdown-menu" role="menu">
        <li *ngFor="let item of filtered_choices; let i=index;" role="menuitem">
          <!-- calling preventDefault() on the mousedown event
          prevents the input's blur event from closing the dropdown
          before the click event fires -->
          <a (click)="item_selected.emit(item); dropdown_menu.hide()"
             (mousedown)="$event.preventDefault()"
             class="dropdown-menu-item cursor-pointer"
             [class.item-highlighted]="i === highlighted_index">
            {{display_item_fn(item)}}
          </a>
        </li>
      </ul>
    </div>

  </div>
</template>

<script lang="ts">
  import
  import { Component, Prop, Vue } from 'vue-property-decorator';

  @Component
  export default class Toggle extends Vue {

    @Prop({default: false, type: Boolean})
    value!: boolean;

    is_on: boolean = false;
    on_side_text: string = "On";
    off_side_text: string = "Off";

    created() {
      this.is_on = this.value;
    }

    @Prop({default: "", type: String})
    placehold_text!: string;


    @Prop({default: ['hi'], type: Any})
    choices!: any[];

    // @Prop({default: type: })
    // filter_fn!: (item: any, filter_text: string) => boolean = this.default_filter_fn;

    @Prop({default: null, type: String})
    item_field_name!: string;


    @Prop({default: null, type: String})
    // display_item_fn!: (item: any) => string = this.default_display_item_fn;

    filter_text: string = "";

    highlighted_index: number = 0;

    filtered_choices: any[] = null;

    // @ViewChild('dropdown_menu')
    // dropdown_menu: BsDropdownDirective;

    // @ViewChild('filter_input')
    // filter_input: ElementRef;

    // hide_menu() {
    //   this.dropdown_menu.hide();
    // }

    // dropdown_arrow_clicked() {
    //   if (!this.dropdown_menu.isOpen) {
    //     this.filter_input.nativeElement.select();
    //   }
    //   this.dropdown_menu.toggle();
    // }

    // default_filter_fn(item: any, filter_text: string): boolean {
    //   if (this.item_field_name !== null) {
    //     item = item[this.item_field_name];
    //   }
    //   return item.indexOf(filter_text) >= 0;
    // }

    // default_display_item_fn(item: any): string {
    //   if (this.item_field_name !== null) {
    //     return item[this.item_field_name];
    //   }
    //   return item;
    // }

    // get filtered_choices() {
    //   if (!this.filter_text) {
    //     return this.choices;
    //   }
    //   if (this._filtered_choices !== null) {
    //     return this._filtered_choices;
    //   }
    //   this._filtered_choices = this.choices.filter(
    //     (item) => this.filter_fn(item, this.filter_text));
    //   if (this.highlighted_index >= this._filtered_choices.length) {
    //     this.highlighted_index = this._filtered_choices.length - 1;
    //   }
    //   return this._filtered_choices;
    // }

    // move_highlighted(event: KeyboardEvent) {
    //   if (!this.dropdown_menu.isOpen) {
    //     this.dropdown_menu.show();
    //   }
    //   if (event.code === 'ArrowDown' || event.keyCode === 40) {
    //     this.highlighted_index += 1;
    //     if (this.highlighted_index === this.filtered_choices.length) {
    //       this.highlighted_index = this.filtered_choices.length - 1;
    //     }
    //   }
    //   else if (event.code === 'ArrowUp' || event.keyCode === 38) {
    //     this.highlighted_index -= 1;
    //     if (this.highlighted_index < 0) {
    //       this.highlighted_index = 0;
    //     }
    //   }
    //   else if (event.code ===  'Escape' || event.keyCode === 27) {
    //     this.dropdown_menu.hide();
    //   }
    // }

    select_highlighted() {
       this.$emit('item-selected', this.filtered_choices[this.highlighted_index]);
       this.dropdown_menu.hide();
    }


    // @Output()
    // item_selected: EventEmitter<any> = new EventEmitter();

  }
</script>

<style scoped lang="scss">
  @import '@/styles/colors.scss';

  .item-highlighted {
    background-color: lightgray;
  }

</style>
