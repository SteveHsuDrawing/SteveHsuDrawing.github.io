/**
 * Picture registry — pure resolution helpers.
 *
 * `src/configs/picture-registry.json` owns every picture's identity
 * (sources, feature flags, own metadata).  The single resolution rule
 * lives here so the runtime composable and the build-time content
 * extraction can never drift:
 *
 *   explicit registry value  ->  `text-<id>-<key>` i18n  ->  empty
 *
 * Display keys (`width`, `height`, `class`, `loading`, `fetchpriority`,
 * `showAltButton`, `previewable`) are NOT part of the registry — the
 * consumer that renders the picture supplies them as overrides.
 */

import type {
  FeatureAwarePictureProps,
  PicturePropsOverride,
  RegistryPictureEntry,
  TypeAwareLinkProps,
} from "../types/app";

/** Resolver for i18n keys (runtime `t` / build-time `textFor`). */
export type TextResolver = (key: string) => string;

/**
 * Find a registry entry by picture id.
 *
 * @param entries - The registry array.
 * @param id - Picture id.
 * @returns The entry, or `null` when the id is unknown.
 */
export function findPictureEntry(
  entries: RegistryPictureEntry[],
  id: string,
): RegistryPictureEntry | null {
  return entries.find((entry) => entry.id === id) ?? null;
}

/**
 * Resolve one registry entry into render-ready display props.
 *
 * `alt` / `title` / `message` fall back to the id-derived i18n keys.
 * Overrides are applied on top; `relatedLink` is shallow-merged so a
 * caller can add a flag (e.g. `noQRCode`) without repeating the href.
 *
 * @param entry - The registry entry.
 * @param t - i18n resolver.
 * @param overrides - Consumer overrides (display keys / refinements).
 * @returns Props ready for `FeatureAwarePicture`.
 */
export function resolvePictureProps(
  entry: RegistryPictureEntry,
  t: TextResolver,
  overrides?: PicturePropsOverride,
): FeatureAwarePictureProps {
  const identity = entry.pictureProps;
  const base: FeatureAwarePictureProps = {
    ...identity,
    pictureId: entry.id,
    alt: identity.alt ?? t(`text-${entry.id}-alt`),
    title: identity.title || t(`text-${entry.id}-title`),
    message: identity.message || t(`text-${entry.id}-message`),
  };
  if (!overrides) return base;

  const { relatedLink: linkOverride, ...rest } = overrides;
  const resolved: FeatureAwarePictureProps = { ...base, ...rest };
  if (linkOverride) {
    // Shallow merge — the registry link keeps href / type / icon, the
    // caller adds or replaces single flags (e.g. `noQRCode`).
    resolved.relatedLink = {
      ...(base.relatedLink ?? {}),
      ...linkOverride,
    } as TypeAwareLinkProps;
  }
  return resolved;
}
