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
 * A registry `noCopy` flag appends the `no-copy` class after the
 * override merge (so a caller's own `class` cannot drop it).
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
  const { noCopy, ...identity } = entry.pictureProps;
  const base: FeatureAwarePictureProps = {
    ...identity,
    pictureId: entry.id,
    alt: identity.alt ?? t(`text-${entry.id}-alt`),
    title: identity.title || t(`text-${entry.id}-title`),
    message: identity.message || t(`text-${entry.id}-message`),
  };

  let resolved = base;
  if (overrides) {
    const { relatedLink: linkOverride, ...rest } = overrides;
    resolved = { ...base, ...rest };
    if (linkOverride) {
      // Shallow merge — the registry link keeps href / type / icon, the
      // caller adds or replaces single flags (e.g. `noQRCode`).
      resolved.relatedLink = {
        ...(base.relatedLink ?? {}),
        ...linkOverride,
      } as TypeAwareLinkProps;
    }
  }

  // Applied last — a consumer's `class` override cannot drop it.
  if (noCopy) resolved.class = ensureNoCopy(resolved.class);
  return resolved;
}

/**
 * Append `no-copy` to a class string unless it is already present.
 *
 * @param value - Consumer class string (bare or with other classes).
 * @returns The class string with `no-copy` appearing exactly once.
 */
function ensureNoCopy(value?: string): string {
  const classes = value?.split(/\s+/).filter(Boolean) ?? [];
  if (!classes.includes("no-copy")) classes.push("no-copy");
  return classes.join(" ");
}
