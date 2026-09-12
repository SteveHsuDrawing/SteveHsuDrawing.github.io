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
 * The picture's whole metadata travels in the props object (`alt` /
 * `title` / `message` / `relatedLink`) — there is no second parameter;
 * the viewer falls back to `t("text-image-preview")` when the picture
 * carries no title.
 *
 * @example
 * const { openPictureViewer } = usePictureViewer();
 * openPictureViewer(props);
 */

import type { FeatureAwarePictureProps } from "../types/app";
import { useModalStack } from "./useModalStack";

// =========================================================================
// Composable
// =========================================================================

/**
 * Single-image viewer controller.
 *
 * @returns `openPictureViewer(img)` — pushes the lightbox with the
 *   given display props.
 */
export function usePictureViewer(): {
  /** Push the single-image viewer with the given display props. */
  openPictureViewer: (img: FeatureAwarePictureProps) => void;
} {
  const { push } = useModalStack();

  function openPictureViewer(img: FeatureAwarePictureProps): void {
    push({ id: "picture-viewer", props: { img } });
  }

  return { openPictureViewer };
}
