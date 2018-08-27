import { CreateElement, VNode } from 'vue';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import { safe_assign } from '@/utils';


@Component({
    template: `<div>
    <slot name="header"></slot>
    <slot name="body"></slot>
</div>`
})
export class Tab extends Vue {
    @Prop({type: String, required: true})
    title!: string;
}

interface ExtractedTabData {
    ref?: string;
    listeners?: object;
    header: VNode;
    body: VNode;
}

@Component({
    components: {Tab}
})
export class Tabs extends Vue {
    @Prop({default: 0, type: Number})
    value!: number;

    @Watch('value')
    on_value_changed(new_value: number, old_value: number) {
        if (new_value !== old_value) {
            this.active_tab_index = new_value;
        }
    }

    active_tab_index: number = 0;

    created() {
        this.active_tab_index = this.value;
    }

    render(el: CreateElement) {
        let tab_data: ExtractedTabData[] = [];

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
                throw new Error('Make sure <tab> elements have "header" and "body" slots');
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

        return el(
            'div',
            [this._render_tab_headers(el, tab_data),
             this._render_tab_body(el, tab_data)]
        );
    }

    private _extract_slot(tab_children: VNode[], slot_name: 'header' | 'body') {
        let header = tab_children.find(
            (vnode: VNode) => vnode.data !== undefined && vnode.data.slot === slot_name);
        if (header === undefined) {
            throw new Error(`Missing "${slot_name}" slot in <tab>.`);
        }
        if (header.tag !== 'template') {
            throw new Error(`"${slot_name}" slot must be a <template> tag.`);
        }
        return header;
    }

    private _render_tab_headers(el: CreateElement, tab_data: ExtractedTabData[]) {
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
                    this.active_tab_index = index;
                    this.$emit('input', this.active_tab_index);
                });

                return el(
                    'div',
                    {
                        ref: ref,
                        style: {

                        },
                        on: event_listeners
                    },
                    header.children
                );
            }
        );

        return el(
            'div',
            {
                style: {

                }
            },
            header_elts);
    }

    private _render_tab_body(el: CreateElement, tab_data: ExtractedTabData[]) {
        if (this.active_tab_index >= tab_data.length) {
            this.active_tab_index = tab_data.length - 1;
        }

        return el(
            'div',
            {
                ref: 'active-tab-body',
                style: {

                }
            },
            tab_data[this.active_tab_index].body.children
        );
    }
}
