<template>
  <div id="group-lookup-component">
    <div class="group-lookup-search-bar">
      <dropdown-typeahead
        ref="group_typeahead"
        placeholder_text="Enter a username"
        :aria_label="aria_label"
        :choices="groups"
        @item_selected="on_group_selected"
        :filter_fn="group_filter_fn"
      >
        <template v-slot="{ item }">
          <span v-for="(member, index) of item.member_names" :key="index">
            <span class="typeahead-row">
              {{ member
              }}{{ index === item.member_names.length - 1 ? "" : ", " }}
            </span>
          </span>
        </template>
      </dropdown-typeahead>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router/composables";

import { Group } from "ag-client-typescript";

import DropdownTypeahead from "@/components/dropdown_typeahead.vue";
import { get_query_param } from "@/utils";

const props = withDefaults(
  defineProps<{
    groups: Group[];
    aria_label?: string;
    /**
     * When true, emits an update_group_selected event containing
     * the group specified by the "current_student_lookup" query param.
     */
    initialize_from_url?: boolean;
  }>(),
  {
    aria_label: "Search for group by username",
    initialize_from_url: false,
  },
);

const emit = defineEmits<{
  update_group_selected: [group: Group];
}>();

const router = useRouter();

if (props.initialize_from_url) {
  let requested_group_pk = get_query_param(
    router.currentRoute.query,
    "current_student_lookup",
  );
  if (requested_group_pk !== null) {
    on_group_selected(
      props.groups.find((group) => group.pk === Number(requested_group_pk))!,
    );
  }
}

function group_filter_fn(group: Group, filter_text: string) {
  for (let member_name of group.member_names) {
    if (member_name.toLowerCase().indexOf(filter_text.toLowerCase()) >= 0) {
      return true;
    }
  }
  return false;
}

function on_group_selected(group: Group) {
  emit("update_group_selected", group);
  router
    .replace({
      query: {
        ...router.currentRoute.query,
        current_student_lookup: group.pk.toString(),
      },
    })
    .catch((err) => {}); // Ignore "NavigationDuplicated"
}
</script>

<style scoped lang="scss">
@import "@/styles/colors.scss";

.typeahead-row {
  font-size: 0.875rem;
  padding-right: 0.25rem;
}
</style>
