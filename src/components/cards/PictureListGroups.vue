<!--
  PictureListGroups.vue — Page-level picture-list section.
  Iterates over DisplayPictureGroupData[] from the group pool and renders
  each group with <hr> separators between them.
-->
<script setup lang="ts">
import type { DisplayPictureGroupData } from "../../types/app";
import PictureGroup from "./PictureGroup.vue";

// =========================================================================
// Props / Emits
// =========================================================================

defineProps<{
  /** All picture groups for this page. */
  groups: DisplayPictureGroupData[];
  /** Page path for anchor/copy-link URL generation (e.g. "/gallery.html"). */
  pagePath: string;
}>();

const emit = defineEmits<{
  /** Fired when a picture card is activated. */
  select: [pictureId: string, groupId: string];
}>();
</script>

<template>
  <template v-for="(group, idx) in groups" :key="idx">
    <hr v-if="idx > 0" />
    <PictureGroup
      :group="group"
      :page-path="pagePath"
      @select="emit('select', $event, group.id)"
    />
  </template>
</template>
