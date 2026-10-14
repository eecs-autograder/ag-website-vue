import { computed, ref, shallowRef } from "vue";
import { useRoute, useRouter } from "vue-router/composables";

import { get_query_param } from "@/utils";

/**
 * Tracks the selected tab, keeping it in sync with the "current_tab" query
 * param, and which tabs have been visited so their content can be lazily loaded.
 */
export function use_current_tab() {
  const route = useRoute();
  const router = useRouter();

  const d_current_tab = ref<string | null>(null);

  // The identifiers for tabs that have been clicked on and therefore
  // have had there content loaded.
  const d_loaded_tabs = shallowRef(new Set<string>());

  const current_tab = computed(() => d_current_tab.value);

  const loaded_tabs = computed(() => new Set(d_loaded_tabs.value));

  function initialize_current_tab(default_val: string) {
    const requested_tab = get_query_param(route.query, "current_tab");
    if (requested_tab !== null) {
      set_current_tab(requested_tab);
    } else {
      d_current_tab.value = default_val;
      mark_tab_as_loaded(d_current_tab.value);
    }
  }

  function set_current_tab(tab_id: string) {
    d_current_tab.value = tab_id;
    router
      .replace({ query: { ...route.query, current_tab: tab_id } })
      .catch(() => {}); // Ignore "NavigationDuplicated"
    mark_tab_as_loaded(tab_id);
  }

  function mark_tab_as_loaded(tab_id: string) {
    if (!d_loaded_tabs.value.has(tab_id)) {
      const new_loaded_tabs = new Set(d_loaded_tabs.value);
      new_loaded_tabs.add(tab_id);
      d_loaded_tabs.value = new_loaded_tabs;
    }
  }

  return {
    d_current_tab,
    d_loaded_tabs,
    current_tab,
    loaded_tabs,
    initialize_current_tab,
    set_current_tab,
    mark_tab_as_loaded,
  };
}
