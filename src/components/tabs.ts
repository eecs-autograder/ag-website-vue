import { CreateElement, VNode } from 'vue';
import { Component, Prop, Vue } from 'vue-property-decorator';


@Component({
    template: `<div>
    <slot name="header"></slot>
    <slot name="body"></slot>
</div>`
})
export class Tab extends Vue {
    // @Prop({type: String})
    // tab_id!: string;

    @Prop({type: String, required: true})
    title!: string;
}

@Component({
    components: {Tab}
})
export class Tabs extends Vue {
    @Prop({default: 0, type: Number})
    value!: number;

    active_tab_index: number = 0;

    created() {
        this.active_tab_index = this.value;
    }

    render(el: CreateElement) {
        let tab_headers: VNode[] = [];
        let tab_bodies: VNode[] = [];

        for (let slot of this.$slots.default) {
            let tab_children = this._get_tab_children(slot);
            let header = this._extract_slot(tab_children, 'header');
            let body = this._extract_slot(tab_children, 'body');

            tab_headers.push(header);
            tab_bodies.push(body);
        }

        return el(
            'div',
            [this._render_tab_headers(el, tab_headers),
             this._render_tab_body(el, tab_bodies)]
        );
    }

    private _get_tab_children(slot: VNode): VNode[] {
        if (slot.componentOptions === undefined || slot.componentOptions.tag !== 'tab') {
            throw new Error(`Non-tab tag found inside tabs component: ${slot.tag}`);
        }
        else if (slot.componentOptions.tag !== 'tab') {
            throw new Error(
                `Non-tab tag found inside tabs component: ${slot.componentOptions.tag}`);
        }

        let slot_children = slot.componentOptions.children;
        if (slot_children === undefined
                || !Array.isArray(slot_children)
                || slot_children.length !== 2) {
        throw new Error(
            'Make sure <tab> elements have exactly 2 children: '
            + 'One for the "header" slot and one for the "body" slot');
        }

        // At this point, the type system still thinks slot_children
        // could be [ScopedSlot] (a tuple containing one item), but we know
        // that it has length 2 from our checks.
        return <VNode[]> slot_children;
    }

    private _extract_slot(tab_children: VNode[], slot_name: 'header' | 'body') {
        let header = tab_children.find(
            (vnode: VNode) => vnode.data !== undefined && vnode.data.slot === slot_name);
        if (header === undefined) {
            throw new Error(`Missing "${slot_name}" slot in <tab>.`);
        }
        return header;
    }

    private _render_tab_headers(el: CreateElement, tab_headers: VNode[]) {
        let header_elts = tab_headers.map(
            (header_node, index) => {
                return el(
                    'span',
                    {
                        style: {

                        },
                        on: {
                            'click': () => {
                                this.active_tab_index = index;
                                this.$emit('input', this.active_tab_index);
                            }
                        }
                    },
                    header_node.children
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

    private _render_tab_body(el: CreateElement, tab_bodies: VNode[]) {
        if (this.active_tab_index >= tab_bodies.length) {
            this.active_tab_index = tab_bodies.length - 1;
        }

        return el(
            'div',
            {
                style: {

                }
            },
            tab_bodies[this.active_tab_index].children
        );
    }
}
