<script lang="ts">

import { CreateElement, VNode, VNodeChildren } from 'vue';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import Tab from '@/components/tabs/tab.vue';
import TabHeader from '@/components/tabs/tab_header.vue';


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

  @Prop({default: 'top', validator: (value: string) => value === 'top' || value === 'side'})
  tab_position!: 'top' | 'side';

  @Prop({default: '', type: String})
  tab_headers_container_class!: string;

  @Prop({default: '', type: String})
  tab_body_container_class!: string;

  @Watch('value')
  on_value_changed(new_value: number, old_value: number) {
    this.d_active_tab_index = new_value;
  }

  d_active_tab_index: number = 0;
  d_page_width = 0;
  private _resize_event_handler!: () => void;

  created() {
    this.d_active_tab_index = this.value;
  }

  mounted() {
    this._resize_event_handler = () => {
      this.d_page_width = window.outerWidth;
    };
    window.addEventListener('resize', this._resize_event_handler, true);
  }

  beforeDestroy() {
    window.removeEventListener('resize', this._resize_event_handler, true);
  }

  render(create_element: CreateElement) {
    // We need this.d_width_of_page to be used in the render function so that when
    // it changes the page is updated.
    if (this.d_page_width !== undefined) {}

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
      {class: ['tabs-container', this.tab_position === 'side' ? 'container-sidebar' : '']},
      [this._render_tab_headers(create_element, tab_data),
       this._render_tab_body(create_element, tab_data)]
    );
  }

  private _find_header(tab_children: VNode[]) {
    let header = tab_children.find(
      (vnode: VNode) =>  {
        return vnode.tag === 'tab-header'
               || (vnode.componentOptions !== undefined
                    && vnode.componentOptions.tag === 'tab-header');
      }
    );
    if (header === undefined) {
      throw new TabsError(`Missing "<tab-header>" tag in <tab>.`);
    }
    return header;
  }

  private _extract_body(tab_children: VNode[]) {
    let body = tab_children.find(
      (vnode: VNode) => vnode.data !== undefined && vnode.data.slot === 'body');
    if (body === undefined) {
      throw new TabsError('Missing "body" slot in <tab>.');
    }
    if (body.tag !== 'template') {
      throw new TabsError('"body" slot must be a <template> tag.');
    }
    return body;
  }

  private _render_tab_headers(create_element: CreateElement, tab_data: ExtractedTabData[]) {
    let window_width = window.matchMedia("(min-width: 481px)");
    let header_elts = tab_data.map(
      ({header}, index) => {
        let element_data = header.data !== undefined ? {...header.data} : {};

        if (element_data.style === undefined) {
          element_data.style = {};
        }

        if (this.tab_position === 'top') {
          let element_style = <{ width: string }> element_data.style;
          element_style.width = window_width.matches ? `${100 / tab_data.length}%` : '100%';
        }

        if (element_data.class === undefined) {
          element_data.class = [];
        }
        else if (!Array.isArray(element_data.class)) {
          element_data.class = [element_data.class];
        }

        if (this.tab_position === 'top') {
          element_data.class.push('tab-style');
        }
        element_data.class.push(
          index === this.d_active_tab_index ? this.tab_active_class : this.tab_inactive_class,
          index === this.d_active_tab_index ? 'active-tab-header' : 'inactive-tab-header',
        );

        if (element_data.nativeOn === undefined) {
          element_data.nativeOn = {click: []};
        }
        if (element_data.nativeOn.click === undefined) {
            element_data.nativeOn.click = [];
        }
        else if (!Array.isArray(element_data.nativeOn.click)) {
          element_data.nativeOn.click = [element_data.nativeOn.click];
        }

        element_data.nativeOn.click.push(() => this._set_active_tab(index));

        // If TabHeader is explicitly registered with the parent
        // component, children will be available at header.componentOptions.children.
        // Otherwise, children will be available at header.children.
        // At time of writing, this was determined by examining the
        // Vue source code at:
        //    https://github.com/vuejs/vue/blob/dev/src/core/vdom/create-element.js#L107
        //    and
        //    https://github.com/vuejs/vue/blob/dev/src/core/vdom/create-element.js#L112
        let children: VNode[] | VNodeChildren = [];
        if (header.children !== undefined) {
          children = header.children;
        }
        else if (header.componentOptions !== undefined
                 && header.componentOptions.children !== undefined) {
          children = header.componentOptions.children;
        }

        return create_element('tab-header', element_data, children);
      }
    );

    let sidebar_headers_class = this.tab_position === 'side' ? 'tab-headers-container-sidebar' : '';
    return create_element(
      'div',
      {class: [this.tab_headers_container_class, sidebar_headers_class]},
      header_elts
    );
  }

  private _render_tab_body(create_element: CreateElement, tab_data: ExtractedTabData[]) {
    if (this.d_active_tab_index >= tab_data.length) {
      this._set_active_tab(tab_data.length - 1);
    }

    let body_class = '';
    if (this.tab_position === 'side') {
      body_class = 'tab-body-container-sidebar';
    }

    return create_element(
      'div',
      {
        ref: 'active-tab-body',
        class: [body_class, this.tab_body_container_class]
      },
      tab_data[this.d_active_tab_index].body.children
    );
  }

  private _set_active_tab(new_active_tab_index: number) {
    this.d_active_tab_index = new_active_tab_index;
    this.$emit('input', this.d_active_tab_index);
  }
}

interface ExtractedTabData {
  header: VNode;
  body: VNode;
}

</script>

<style scoped lang="scss">
  // Always added to the outermost element.
  .tabs-container {
    height: 100%;
  }

  // Added to the outermost element when displaying tabs as sidebar.
  .container-sidebar {
    overflow: hidden;
    display: flex;
  }

  .tab-body-container-sidebar {
    flex-grow: 1;
  }

  .tab-headers-container-sidebar, .tab-body-container-sidebar {
    overflow: auto;
  }
</style>
