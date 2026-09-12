<!--
  StickerSection.vue — Reusable footer sticker section.
  Renders a 150×150 follow-theme sticker image with an optional
  caption and a default slot for custom content below.

  Sticker image paths are derived from the `stickerId` via
  `createStickerSrcMap()` (shared with StickerModal):
    AVIF: /images/avif/stickers/{light|dark}/{stickerId}.avif
    WebP: /images/webp/stickers/{light|dark}/{stickerId}.webp
  Alt / title text uses the i18n keys `text-sticker-{stickerId}-alt` and
  `text-sticker-{stickerId}-title` (the latter becomes the ALT popover
  header).
-->
<script setup lang="ts">
import { computed } from "vue";
import { createStickerSrcMap } from "../../core/utils";
import type { StickerProps } from "../../types/app";
import FeatureAwarePicture from "../images/FeatureAwarePicture.vue";

// =========================================================================
// Props
// =========================================================================

const props = defineProps<StickerProps>();

// =========================================================================
// State
// =========================================================================

const stickerSrcMap = computed(() => createStickerSrcMap(props.stickerId));

const i18nKey = computed(() => `text-sticker-${props.stickerId}-alt`);

/** ALT popover header key — the sticker's title. */
const titleKey = computed(() => `text-sticker-${props.stickerId}-title`);
</script>

<template>
  <div class="container">
    <div class="py-4 d-flex flex-column align-items-center">
      <FeatureAwarePicture
        :src-map="stickerSrcMap"
        :feature="['follow-theme']"
        :alt="$t(i18nKey)"
        :title="$t(titleKey)"
        :width="150"
        :height="150"
        show-alt-button
        class="no-copy solid-bg"
      />
      <p v-if="caption" class="opacity-75 mt-3">
        <span>{{ caption }}</span>
      </p>
      <slot />
    </div>
  </div>
</template>
