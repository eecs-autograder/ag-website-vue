import { Component, Vue } from 'vue-property-decorator';

import { get_query_param } from '@/utils';

@Component
export class CurrentTabMixin extends Vue {
    private d_current_tab: string | null = null;

    // The identifiers for tabs that have been clicked on and therefore
    // have had there content loaded.
    private d_loaded_tabs: Set<string> = new Set();

    get current_tab() {
        return this.d_current_tab;
    }

    get loaded_tabs() {
        return new Set(this.d_loaded_tabs);
    }

    protected initialize_current_tab(default_val: string) {
        let requested_tab = get_query_param(this.$route.query, "current_tab");
        if (requested_tab !== null) {
            this.set_current_tab(requested_tab);
        }
        else {
            this.d_current_tab = default_val;
            this.mark_tab_as_loaded(this.d_current_tab);
        }
    }

    protected set_current_tab(tab_id: string) {
        this.d_current_tab = tab_id;
        this.$router.replace({query: {...this.$route.query, current_tab: tab_id}});
        this.mark_tab_as_loaded(tab_id);
    }

    private mark_tab_as_loaded(tab_id: string) {
        if (!this.d_loaded_tabs.has(tab_id)) {
            let new_loaded_tabs = new Set(this.d_loaded_tabs);
            new_loaded_tabs.add(tab_id);
            this.d_loaded_tabs = new_loaded_tabs;
        }
    }
}
