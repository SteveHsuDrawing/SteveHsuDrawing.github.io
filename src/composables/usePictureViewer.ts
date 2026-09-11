/**
 * usePictureViewer — single-image lightbox controller.
 *
 * Pushes the single-image viewer (`PictureViewerModal`, stack id
 * `picture-viewer`) onto the shared modal stack with a set of
 * `FeatureAwarePictureProps`.  The viewer is fully independent of
 * `GalleryPage` and never reads or writes query parameters — query
 * parameters are a means to activate the GROUP viewer
 * (`?preview=` / `?picGroupId=`), never a consequence of opening this
 * one.
 *
 * @example
 * const { openPictureViewer } = usePictureViewer();
 * openPictureViewer(props);                       // default title
 * openPictureViewer(props, { title: "Cover" });   // explicit title
 */

import type {
  FeatureAwarePictureProps,
  PictureViewerOptions,
} from "../types/app";
import { useI18n } from "./useI18n";
import { useModalStack } from "./useModalStack";

// =========================================================================
// Composable
// =========================================================================

/**
 * Single-image viewer controller.
 *
 * @returns `openPictureViewer(img, options?)` — pushes the lightbox
 *   with the given display props; the header title defaults to the
 *   localized `text-image-preview` string.
 */
export function usePictureViewer(): {
  /** Push the single-image viewer with the given display props. */
  openPictureViewer: (
    img: FeatureAwarePictureProps,
    options?: PictureViewerOptions,
  ) => void;
} {
  const { push } = useModalStack();
  const { t } = useI18n();

  function openPictureViewer(
    img: FeatureAwarePictureProps,
    options?: PictureViewerOptions,
  ): void {
    push({
      id: "picture-viewer",
      props: {
        img,
        title: options?.title ?? t("text-image-preview"),
      },
    });
  }

  return { openPictureViewer };
}
