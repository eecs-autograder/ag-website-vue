<script lang="ts">

import { CreateElement, VNode } from 'vue';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import Tab from '@/components/tabs/tab.vue';

import { safe_assign } from '@/utils';

export class TabsError extends Error {}

@Component({
  components: {Tab}
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
  tab_active_theme = '';
  tab_inactive_theme = '';

  created() {
    this.active_tab_index = this.value;
    this.tab_active_theme = this.tab_active_class;
    this.tab_inactive_theme = this.tab_inactive_class;
  }

  render(create_element: CreateElement) {
    let tab_data: ExtractedTabData[] = [];

    if (this.$slots.default === undefined) {
      return undefined;
    }

    for (let slot of this.$slots.default) {
      // console.log(slot);
      // Skip any tags or content that isn't a <tab>
      if (slot.componentOptions === undefined
          || slot.componentOptions.tag !== 'tab') {
        continue;
      }

      if (slot.componentOptions.children === undefined
          || !Array.isArray(slot.componentOptions.children)
          || slot.componentOptions.children.length < 2) {
        throw new TabsError('Make sure <tab> elements have "header" and "body" slots');
      }

      let tab_children = <VNode[]> slot.componentOptions.children;
      let header = this._extract_slot(tab_children, 'header');
      let body = this._extract_slot(tab_children, 'body');

      let ref;
      if (slot.data !== undefined) {
        ref = slot.data.ref;
      }
      tab_data.push({ref: ref, listeners: slot.componentOptions.listeners,
                     header: header, body: body});
    }

    return create_element(
      'div',
      [this._render_tab_headers(create_element, tab_data),
       this._render_tab_body(create_element, tab_data)]
    );
  }

  private _extract_slot(tab_children: VNode[], slot_name: 'header' | 'body') {
    let header = tab_children.find(
      (vnode: VNode) => vnode.data !== undefined && vnode.data.slot === slot_name);
    if (header === undefined) {
      throw new TabsError(`Missing "${slot_name}" slot in <tab>.`);
    }
    if (header.tag !== 'template') {
      throw new TabsError(`"${slot_name}" slot must be a <template> tag.`);
    }
    return header;
  }

  private _render_tab_headers(create_element: CreateElement, tab_data: ExtractedTabData[]) {
    let header_elts = tab_data.map(
      ({header, ref, listeners}, index) => {
        let event_listeners: { [key: string]: EventListener | EventListener[] } = {};
        safe_assign(event_listeners, listeners);

        if (event_listeners.click === undefined) {
          event_listeners.click = [];
        }
        if (!Array.isArray(event_listeners.click)) {
          event_listeners.click = [event_listeners.click];
        }
        event_listeners.click.push(() => {
          this._set_active_tab(index);
        });

        return create_element(
          'div',
          {
            ref: ref,
            class: [
              'tab-header',
              index === this.active_tab_index ? 'active-tab-header' : 'inactive-tab-header',
              index === this.active_tab_index ? this.tab_active_theme : this.tab_inactive_theme
            ],
            on: event_listeners
          },
          header.children
        );
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
  ref?: string;
  listeners?: object;
  header: VNode;
  body: VNode;
}

</script>

<style scoped lang="scss">
@import '@/styles/tab_styles.scss';

.tab-header {
  display: inline-block;
}

.active-tab-header {
  border-radius: 10px 10px 0 0;
  margin-right: 2px;
  margin-top: 4px;
  padding: 10px 15px;
}

.inactive-tab-header {
  border-radius: 10px 10px 0 0;
  margin-right: 2px;
  margin-top: 4px;
  padding: 10px 15px;
}

.inactive-tab-header:hover {
  cursor: pointer;
}

</style>
