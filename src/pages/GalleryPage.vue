<!--
  GalleryPage.vue — Gallery page hero section + picture groups + lightbox.
  Coordinates the ?preview=<id> deep link and thumbnail clicks with the
  shared modal stack (PictureViewerModal).
-->
<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import PictureListGroups from "../components/cards/PictureListGroups.vue";
import PageChainNav from "../components/nav/PageChainNav.vue";
import HeroSection from "../components/ui/HeroSection.vue";
import { useModalStack } from "../composables/useModalStack";
import { usePictureList } from "../composables/usePictureList";
import { preserveLangParam } from "../core/utils";
import type { DisplayPictureData, DisplayPictureGroupData } from "../types/app";

// =========================================================================
// Picture groups
// =========================================================================

const { groups, pagePath } = usePictureList(ref("gallery"));

// =========================================================================
// Lightbox coordination (modal stack + ?preview= / ?picGroupId= deep links)
// =========================================================================

const route = useRoute();
const router = useRouter();
const { push, pop, stack } = useModalStack();

/** Whether the group viewer is currently in the stack (open). */
const viewerOpen = computed(() =>
  stack.value.some((item) => item.id === "picture-group-viewer"),
);

/**
 * Find a picture for a deep link.
 *
 * @param id - Picture id (`?preview=`).
 * @param groupId - Optional group id (`?picGroupId=`) to search first;
 *   a miss falls back to the legacy cross-group search.
 * @returns The owning group + picture, or null when unknown.
 */
function findPicture(
  id: string,
  groupId?: string | null,
): { group: DisplayPictureGroupData; picture: DisplayPictureData } | null {
  if (!groups.value) return null;
  const lists = groupId
    ? [groups.value.filter((g) => g.id === groupId), groups.value]
    : [groups.value];
  for (const list of lists) {
    for (const group of list) {
      const picture = group.contents.find((c) => c.id === id);
      if (picture) return { group, picture };
    }
  }
  return null;
}

/** Resolve the group addressed by `?picGroupId=` (null when unknown). */
function findGroup(groupId: string): DisplayPictureGroupData | null {
  return groups.value?.find((g) => g.id === groupId) ?? null;
}

/** Push the group viewer onto the modal stack. */
function openViewer(
  picture: DisplayPictureData,
  contents: DisplayPictureData[],
): void {
  push({
    id: "picture-group-viewer",
    props: { contents, currentId: picture.id },
  });
}

/**
 * Remove the viewer's query params (`?preview=` and `?picGroupId=`),
 * keeping `?lang=`.
 */
function stripViewerParams(): void {
  if (!route.query.preview && !route.query.picGroupId) return;
  const query = { ...route.query };
  delete query.preview;
  delete query.picGroupId;
  router.replace({ query: preserveLangParam(query) });
}

// ---- Viewer closed -> clean the deep link from the URL ----

watch(viewerOpen, (open) => {
  if (!open) stripViewerParams();
});

// ---- Route-driven open ----
// `?preview=<id>` opens the viewer at that picture (searched inside
// `?picGroupId=<group>` when present, otherwise across all groups);
// `?picGroupId=<group>` alone opens the group's FIRST picture.  Removing
// the params while it is open (Close button / Back) pops it; leaving the
// page is handled globally by App.vue.

watch(
  [() => route.query.preview, () => route.query.picGroupId, groups],
  ([preview, picGroupId, g]) => {
    const id = typeof preview === "string" ? preview : null;
    const groupId = typeof picGroupId === "string" ? picGroupId : null;
    if (viewerOpen.value) {
      if (!id && !groupId) pop();
      return;
    }
    if (!g) return;
    if (id) {
      const found = findPicture(id, groupId);
      if (found) openViewer(found.picture, found.group.contents);
      return;
    }
    if (!groupId) return;
    const group = findGroup(groupId);
    const first = group?.contents[0];
    if (group && first) openViewer(first, group.contents);
  },
  { immediate: true },
);

// ---- Thumbnail click ----

function onSelect(picture: DisplayPictureData): void {
  const found = findPicture(picture.id);
  if (!found || viewerOpen.value) return;
  // Open first, then push a history entry (so Back / the Close button can
  // return to the plain gallery page) — the route watch ignores changes
  // while the viewer is open.  Only `?preview=` is written: `?picGroupId=`
  // is entry context, not something the thumbnail flow maintains.
  openViewer(found.picture, found.group.contents);
  router.push({
    query: preserveLangParam({ ...route.query, preview: picture.id }),
  });
}
</script>

<template>
  <!-- ==== Hero section ==== -->
  <HeroSection
    :title="$t('text-gallery')"
    :description="$t('text-gallery-description')"
    :image="{
      srcMap: {
        avif: {
          light: { en: '/images/avif/covers/artworks-light.avif' },
          dark: { en: '/images/avif/covers/artworks-dark.avif' },
        },
        webp: {
          light: { en: '/images/webp/covers/artworks-light.webp' },
          dark: { en: '/images/webp/covers/artworks-dark.webp' },
        },
      },
      feature: ['follow-theme'],
      alt: $t('text-artworks-alt'),
      title: $t('text-artworks-title'),
      showAltButton: true,
      previewable: true,
      class: 'no-copy solid-bg',
    }"
  />

  <PageChainNav page-name="gallery" />

  <hr />

  <!-- ==== Picture groups ==== -->
  <div v-if="groups" class="container">
    <PictureListGroups
      :groups="groups"
      :page-path="pagePath"
      @select="onSelect"
    />
  </div>
</template>
