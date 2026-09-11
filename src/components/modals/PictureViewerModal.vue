<!--
  PictureViewerModal.vue — single-image lightbox (stack id `picture-viewer`).

  Opened through openPictureViewer() (composables/usePictureViewer.ts) by
  the FeatureAwarePicture overlay preview button — or by any other caller
  that wants to show one picture enlarged.

  Deliberately independent of GalleryPage, of the Swiper stage and of the
  URL: no query parameters are read or written and no history entry is
  created (`?preview=` / `?picGroupId=` belong to the GROUP viewer,
  PictureGroupViewerModal.vue).  Leaving the page closes it (App.vue).

  Chrome: the standard BModal shell with a title and a single Close button
  — no share, no related link and no Back button (Back would be synonymous
  with Close here).  The image keeps the ALT button (description popover)
  but never a preview button (no recursion).  Preview-only: `.no-copy`.
-->
<script setup lang="ts">
import { computed, onBeforeUnmount } from "vue";
import { setSwipeTrackingEnabled } from "../../composables/useGesture";
import { useI18n } from "../../composables/useI18n";
import { useModalStack, useStackModal } from "../../composables/useModalStack";
import type { FeatureAwarePictureProps } from "../../types/app";
import FeatureAwarePicture from "../images/FeatureAwarePicture.vue";

// =========================================================================
// State
// =========================================================================

const { visible, props: stackProps } = useStackModal("picture-viewer");
const { pop } = useModalStack();
const { t } = useI18n();

/** Header title — the caller's title, or the localized default. */
const title = computed(
  () => stackProps.value?.title ?? t("text-image-preview"),
);

/**
 * Stage display props: the caller's image props with the stage-owned keys
 * stripped (`class` is replaced, `aspectRatio` / `width` / `height` may
 * not compete with the stage sizing), the ALT button forced on when an
 * alt text exists and the preview button forced off.
 */
const imageProps = computed<FeatureAwarePictureProps | null>(() => {
  const img = stackProps.value?.img;
  if (!img) return null;
  const {
    class: _class,
    aspectRatio: _aspectRatio,
    width: _width,
    height: _height,
    ...rest
  } = img;
  return {
    ...rest,
    class: "picture-single-img no-copy",
    showAltButton: !!img.alt,
    previewable: false,
  };
});

// =========================================================================
// Actions
// =========================================================================

/** Close the lightbox — stay on the current page, keep the history intact. */
function close(): void {
  pop();
}

function onShown(): void {
  // Fullscreen lightbox: suppress offcanvas edge-swipes while open.
  setSwipeTrackingEnabled(false);
}

function onHidden(): void {
  setSwipeTrackingEnabled(true);
}

onBeforeUnmount(() => {
  setSwipeTrackingEnabled(true);
});
</script>

<template>
  <BModal
    v-model="visible"
    :title="title"
    header-class="h5 modal-title"
    title-tag="span"
    size="xl"
    no-header-close
    centered
    @shown="onShown"
    @hidden="onHidden"
  >
    <!-- ==== Single-image stage ==== -->
    <div class="picture-single-stage">
      <FeatureAwarePicture v-if="imageProps" v-bind="imageProps" />
    </div>

    <template #footer>
      <div class="w-100 d-flex">
        <button
          type="button"
          class="btn btn-outline-primary btn-no-border ms-auto"
          @click="close()"
        >
          {{ $t("text-close") }}
        </button>
      </div>
    </template>
  </BModal>
</template>

<style scoped>
/* --- Single-image stage --- */
.picture-single-stage {
  position: relative;
  min-height: 50vh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* The wrapper (`.feature-aware-picture` — the component root while the
   ALT button is on) never exceeds the stage. */
.picture-single-stage :deep(.picture-single-img),
.picture-single-stage :deep(.picture-single-img picture) {
  max-width: 100%;
}

/* The img fits the stage: capped by the width and by the
   viewport-aware height; `contain` keeps every aspect ratio intact. */
.picture-single-stage :deep(.picture-single-img img) {
  max-width: 100%;
  max-height: min(70vh, calc(100dvh - 10rem));
  object-fit: contain;
}
</style>
