<!--
  WorldviewPage.vue — Internationalized worldview / character-settings page.
  Renders the per-language worldview.md (selected reactively by
  useMarkdownContent) via the reusable MarkdownArticle component.
-->
<script setup lang="ts">
import { computed } from "vue";
import PageChainNav from "../components/nav/PageChainNav.vue";
import HeroSection from "../components/ui/HeroSection.vue";
import MarkdownArticle from "../components/ui/MarkdownArticle.vue";
import { useI18n } from "../composables/useI18n";
import { useMarkdownContent } from "../composables/useMarkdownContent";
import { isBirthdayWeek } from "../core/birthday";

// =========================================================================
// Birthday-week hero cover
// =========================================================================

/** Cover index: `worldview-1` during the birthday week, else `worldview-0`. */
const coverIndex = computed(() => (isBirthdayWeek() ? "1" : "0"));

const { t } = useI18n();

/**
 * Cover title passed to the lightbox — a language-neutral literal for
 * the regular cover (the codename), i18n text for the birthday cover.
 */
const coverTitle = computed(() =>
  coverIndex.value === "1" ? t("text-worldview-1-title") : "CODENAME",
);

/** Cover message shown under the picture by the lightbox. */
const coverMessage = computed(() =>
  t(`text-worldview-${coverIndex.value}-message`),
);

// =========================================================================
// Markdown content (per-language raw import, reactive to language)
// =========================================================================

const { content } = useMarkdownContent("worldview");
</script>

<template>
  <!-- ==== Hero section ==== -->
  <HeroSection
    :title="$t('text-worldview')"
    :description="$t('text-worldview-description')"
    :image="{
      srcMap: {
        avif: {
          light: { en: `/images/avif/covers/worldview-${coverIndex}.avif` },
        },
        webp: {
          light: { en: `/images/webp/covers/worldview-${coverIndex}.webp` },
        },
      },
      alt: $t(`text-worldview-${coverIndex}-alt`),
      title: coverTitle,
      message: coverMessage,
      showAltButton: true,
      previewable: true,
      class: 'no-copy solid-bg',
    }"
  />

  <PageChainNav page-name="worldview" />

  <hr />

  <!-- ==== Markdown content with built-in scrollspy ==== -->
  <MarkdownArticle
    :content="content"
    page-path="/worldview.html"
    class="no-copy"
  />
</template>
