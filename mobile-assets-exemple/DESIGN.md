# Design System Specification: The Cinematic Curator

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Cinematic Curator."** 

In the saturated world of IPTV, we must move beyond the "grid of posters" look. This system treats digital media with the same reverence as a high-end fashion editorial. We break the "template" look through intentional asymmetry—where hero content breathes across the screen—and sophisticated tonal depth that suggests a world behind the glass. This is not just a player; it is an immersive environment where deep violets and blacks recede to let vibrant, neon highlights guide the user's journey through infinite content.

## 2. Colors: Tonal Depth & Kinetic Accents
The palette is built on a foundation of obsidian purples, designed to disappear in low-light viewing environments.

### The Foundation
*   **Background:** `#120b1b` (The "True Canvas")
*   **Surface:** `#120b1b` (Neutral layer)
*   **Surface Tiers:** Use `surface_container_low` (`#181022`) for secondary sections and `surface_container_highest` (`#2c2139`) for high-interaction areas.

### The Accents (Kinetic Highlights)
*   **Primary (Electric):** `#b89fff` (Soft Lavender) to `#834fff` (Vibrant Purple).
*   **Secondary (Neon Blue):** `#00e3fd` (For active states and live indicators).
*   **Tertiary (Neon Green):** `#8eff71` (For EPG progress and success states).

### The "No-Line" Rule & Glassmorphism
*   **Prohibition of Borders:** 1px solid borders for sectioning are strictly prohibited. Boundaries must be defined through background shifts. For example, a Live TV card (`surface_container_high`) sits directly on the background (`surface`) without a stroke.
*   **The Glass Rule:** Floating elements (like the Player Controls or Navigation Bar) must utilize Glassmorphism. Use `surface_variant` at 60% opacity with a `24px` backdrop-blur. 
*   **Signature Textures:** Apply a linear gradient from `primary` to `primary_container` at a 135-degree angle for CTA buttons to provide a "lit from within" feel.

## 3. Typography: The Editorial Scale
We use a dual-font approach to balance "Tech-Modern" aesthetics with extreme functional readability for EPG (Electronic Program Guide) data.

### Display & Headline: Space Grotesk
Used for "Personality" moments—movie titles, category headers, and featured stats.
*   **Display LG (3.5rem):** For hero titles. Use -2% letter spacing to feel "tight" and premium.
*   **Headline SM (1.5rem):** For category titles (Live TV, Movies).

### Title & Body: Manrope
Chosen for its high x-height and legibility on mobile screens during fast scrolling.
*   **Title MD (1.125rem):** For channel names in the EPG.
*   **Body SM (0.75rem):** For metadata (Duration, Genre, Resolution).
*   **Label SM (0.6875rem):** For timestamps and EPG progress markers.

## 4. Elevation & Depth: Tonal Layering
Depth is achieved through "stacking" light, not casting harsh shadows.

*   **The Layering Principle:** Place a `surface_container_lowest` (`#000000`) element behind a `surface_container` (`#1e1629`) element to create a sense of an "inset" tray.
*   **Ambient Shadows:** For floating modals, use a shadow with a 40px blur, 0px offset, and 8% opacity. The shadow color should be `on_surface` (a tinted violet) rather than black.
*   **The Ghost Border Fallback:** If a container requires definition against a similar tone (e.g., a card over a hero image), use a "Ghost Border": `outline_variant` at 15% opacity. It should be felt, not seen.

## 5. Components

### Media Cards (Live, VOD, Series)
*   **Visual Style:** Use the `xl` (1.5rem) corner radius for movie posters to feel modern and friendly.
*   **No Dividers:** Never use lines to separate cards. Use `16px` of vertical white space or a shift from `surface_container_low` to `surface_container_high`.
*   **Live Indicator:** A secondary (`#00e3fd`) glow effect on the bottom edge of the card to indicate "Live" status.

### The EPG Grid (Program Guide)
*   **Structure:** Time slots should use `surface_container_low`. The "Current Program" card should be `primary_container` to pop against the dark background.
*   **Typography:** Use `label-md` for the program description to maximize the amount of text visible in small grid blocks.

### Interactive Elements
*   **Buttons:** 
    *   **Primary:** `primary` background with `on_primary` text. `full` (pill) roundedness.
    *   **Secondary:** Glass-style (semi-transparent `surface_variant`) with `secondary` text.
*   **Navigation Bar:** Positioned at the bottom. Use a backdrop-blur of `20px` and a "Ghost Border" on the top edge only. Icons should use `secondary` for the active state to provide a "neon glow" against the deep purple.

### Progress Bars
*   **Style:** Height of `4px`. Background: `surface_container_highest`. Fill: A gradient from `secondary_dim` to `secondary`.

## 6. Do's and Don'ts

### Do
*   **DO** use varying shades of purple to create "depth zones" for different content types (Live vs. On-Demand).
*   **DO** leave generous breathing room (padding) around text; high-end design is defined by what you *don't* fill.
*   **DO** use the `tertiary` (Neon Green) sparingly—only for "New Content" badges or "Recording" status.

### Don't
*   **DON'T** use pure white (`#FFFFFF`) for body text. Use `on_surface_variant` (`#b3a7bd`) to reduce eye strain in dark environments.
*   **DON'T** use sharp corners. The smallest radius allowed is `sm` (0.25rem) for tiny badges; everything else should be `md` or higher.
*   **DON'T** use standard system transitions. Elements should "slide and fade" with a subtle spring (damping: 0.8) to feel organic.