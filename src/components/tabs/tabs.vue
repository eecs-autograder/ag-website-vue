<script lang="ts">

import { CreateElement, VNode, VNodeData, VNodeChildren } from 'vue';
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
      (vnode: VNode) =>  {
        if (vnode === undefined) {
          return false;
        }
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
    let header_elts = tab_data.map(
      ({header}, index) => {
        let element_data = header.data !== undefined ? {...header.data} : {};

        if (element_data.class === undefined) {
          element_data.class = [];
        }
        else if (!Array.isArray(element_data.class)) {
          element_data.class = [element_data.class];
        }

        element_data.class.push(
          index === this.active_tab_index ? this.tab_active_class : this.tab_inactive_class,
          index === this.active_tab_index ? 'active-tab-header' : 'inactive-tab-header',
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
