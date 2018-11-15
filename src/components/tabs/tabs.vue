<script lang="ts">

import { CreateElement, VNode } from 'vue';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import Tab from '@/components/tabs/tab.vue';
import TabHeader from '@/components/tabs/tab_header.vue';

import { safe_assign } from '@/utils';

export class TabsError extends Error {}

@Component({
  components: {Tab, TabHeader}
})
export default class Tabs extends Vue {

  @Prop({default: 0, type: Number})
  value!: number;

  @Prop({default: "white-theme-active", type: String})
  tab_active_class!: string;

  @Prop({default: "white-theme-inactive", type: String})
  tab_inactive_class!: string;

  @Watch('value')
  on_value_changed(new_value: number, old_value: number) {
    this.active_tab_index = new_value;
  }

  active_tab_index: number = 0;

  created() {
    this.active_tab_index = this.value;
  }

  render(create_element: CreateElement) {
    let tab_data: ExtractedTabData[] = [];

    if (this.$slots.default === undefined) {
      return undefined;
    }

    for (let tab of this.$slots.default) {
      // Skip any tags or content that isn't a <tab>
      if (tab.componentOptions === undefined
          || tab.componentOptions.tag !== 'tab') {
        continue;
      }

      if (tab.componentOptions.children === undefined
          || !Array.isArray(tab.componentOptions.children)
          || tab.componentOptions.children.length < 2) {
        throw new TabsError('Make sure <tab> elements have <tab-header> element and "body" slot');
      }

      let tab_children = <VNode[]> tab.componentOptions.children;
      let header = this._find_header(tab_children);
      let body = this._extract_body(tab_children);

      tab_data.push({header: header, body: body});
    }

    return create_element(
      'div',
      [this._render_tab_headers(create_element, tab_data),
       this._render_tab_body(create_element, tab_data)]
    );
  }

  private _find_header(tab_children: VNode[]) {
    let header = tab_children.find(
      (vnode: VNode) => {
        return vnode !== undefined
               && vnode.componentOptions !== undefined
               && vnode.componentOptions.tag === 'tab-header';
      });
    if (header === undefined) {
      throw new TabsError(`Missing "<tab-header>" tag in <tab>.`);
    }
    return header;
  }

  private _extract_body(tab_children: VNode[]) {
    let header = tab_children.find(
      (vnode: VNode) => vnode.data !== undefined && vnode.data.slot === 'body');
    if (header === undefined) {
      throw new TabsError('Missing "body" slot in <tab>.');
    }
    if (header.tag !== 'template') {
      throw new TabsError('"body" slot must be a <template> tag.');
    }
    return header;
  }

  private _render_tab_headers(create_element: CreateElement, tab_data: ExtractedTabData[]) {
    let header_elts = tab_data.map(
      ({header}, index) => {
        console.log(header);
        // console.log(header.data);

        // if (header.data === undefined) {
        //   header.data = {};
        // }

        // console.log(header.context);
        // for (let key in header) {
        //   console.log(key);
        // }
        console.log(header['elm']);
        // console.log(header.componentOptions);
        // console.log(header.data);
        // if (header.componentInstance === undefined) {
        //   return header;
        //   // throw Error('Tab header componentInstance unexpectedly undefined');
        // }

        // if (!(header.componentInstance instanceof TabHeader)) {
        //   return header;
        //   // throw Error('Tab header componentInstance not instance of TabHeader');
        // }

        // header.componentInstance.d_is_active = index === this.active_tab_index;

        // header.componentInstance.d_active_tab_class = this.tab_active_class;
        // header.componentInstance.d_inactive_tab_class = this.tab_inactive_class;
        // header.componentInstance.d_on_click_fn = () => this._set_active_tab(index);

        // if (header.data === undefined) {
        //   header.data = {};
        // }
        // if (header.data.on === undefined) {
        //   header.data.on = {click: []};
        // }
        // if (header.data.on.click === undefined) {
        //   header.data.on.click = [];
        // }
        // if (!Array.isArray(header.data.on.click)) {
        //   header.data.on.click = [header.data.on.click];
        // }

        // header.data.on.click.push(() => {
        //   this._set_active_tab(index);
        // });

        // if (header.data.class === undefined) {
        //   header.data.class = [];
        // }
        // if (!Array.isArray(header.data.class)) {
        //   header.data.class = [header.data.class];
        // }

        // header.data.class.push('tab-header');
        // console.log(this.active_tab_index);
        // if (index !== this.active_tab_index) {
        //   header.data.class.push('inactive-tab-header');
        //   header.data.class.push(this.tab_inactive_class);
        // }
        // else {
        //   header.data.class.push(this.tab_active_class);
        // }

        return header;

        // let event_listeners: { [key: string]: EventListener | EventListener[] } = {};
        // safe_assign(event_listeners, listeners);

        // if (event_listeners.click === undefined) {
        //   event_listeners.click = [];
        // }
        // if (!Array.isArray(event_listeners.click)) {
        //   event_listeners.click = [event_listeners.click];
        // }
        // event_listeners.click.push(() => {
        //   this._set_active_tab(index);
        // });

        // console.log(header);
        // if (header !== undefined && header.children !== undefined && header.children.length === 1) {
        //   let child = header.children[0];
        //   console.log(child);
        //   console.log(child!.elm);
        // }

        // return create_element(
        //   'div',
        //   {
        //     ref: ref,
        //     class: [
        //       'tab-header',
        //       index === this.active_tab_index ? 'active-tab-header' : 'inactive-tab-header',
        //       index === this.active_tab_index ? this.tab_active_theme : this.tab_inactive_theme
        //     ],
        //     on: event_listeners
        //   },
        //   header.children
        // );
      }
    );

    return create_element('div', {}, header_elts);
  }

  private _render_tab_body(create_element: CreateElement, tab_data: ExtractedTabData[]) {
    if (this.active_tab_index >= tab_data.length) {
      this._set_active_tab(tab_data.length - 1);
    }

    return create_element(
      'div',
      {
        ref: 'active-tab-body'
      },
      tab_data[this.active_tab_index].body.children
    );
  }

  private _set_active_tab(new_active_tab_index: number) {
    this.active_tab_index = new_active_tab_index;
    this.$emit('input', this.active_tab_index);
  }
}

interface ExtractedTabData {
  header: VNode;
  body: VNode;
}

</script>

<style scoped lang="scss">

</style>
