# Design System Specification: Editorial Authority

## 1. Overview & Creative North Star: "The Digital Jurist"
This design system moves beyond the generic "SaaS dashboard" to create a high-end, editorial experience for the legal profession. Our Creative North Star is **"The Digital Jurist."** 

In the legal world, authority is derived from clarity, precision, and history. We interpret this by breaking the rigid, boxy constraints of traditional software. Instead of a flat grid of borders, we use **Intentional Asymmetry** and **Tonal Layering**. The UI should feel like a premium, well-organized legal folio—where white space is not "empty," but a deliberate tool to reduce cognitive load and convey a sense of calm reliability.

### Key Principles:
*   **Asymmetric Balance:** Align core content to a strict grid, but allow secondary elements (like floating action cards or metadata) to break the "inner gutters" to create a custom, high-end feel.
*   **Breathable Authority:** Use exaggerated white space (`spacing.16` and `spacing.24`) to separate major case sections, signaling that the information is important enough to have its own room.
*   **Surface over Structure:** We define boundaries through light and shadow, not lines.

---

## 2. Colors & Surface Philosophy
The palette is rooted in a deep, authoritative Blue, punctuated by a prestigious Gold.

### Color Tokens (Material Design Mapping)
*   **Primary (The Law):** `#00236f` (Primary) / `#1e3a8a` (Primary Container). Used for high-level branding and active states.
*   **Secondary (The Action):** `#0058be` (Secondary). Used for interactive elements and navigation.
*   **Tertiary (The Accent):** `#3e2400` (Tertiary) / `#f59e0b` (Accent Gold mapping). Used sparingly for "Urgent" or "Premium" highlights.
*   **Neutral Surfaces:** `#f8f9ff` (Surface) to `#ffffff` (Surface Container Lowest).

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to separate sections. Visual containment must be achieved through:
1.  **Background Shifts:** Placing a `surface-container-low` card on a `surface` background.
2.  **Shadows:** Using ambient, diffused depth.
3.  **Whitespace:** Using the `spacing` scale to create clear mental groups.

### The "Glass & Gradient" Rule
To elevate the "SaaS" feel into "Premium Software," use **Glassmorphism** for floating sidebars and modals.
*   **Token:** `surface-container-lowest` at 80% opacity + `backdrop-blur: 20px`.
*   **CTAs:** Use a subtle linear gradient from `primary` (#00236f) to `primary-container` (#1e3a8a) at 135 degrees to add a "sheen" that flat colors lack.

---

## 3. Typography: Editorial Clarity
We use **Inter** not as a system font, but as a Swiss-style editorial face. 

*   **Display Scale (`display-lg` to `display-sm`):** Reserved for high-level dashboard summaries or welcome states. These should have a slightly tighter letter-spacing (-0.02em) to feel "tight" and professional.
*   **Headline Scale (`headline-lg` to `headline-sm`):** Used for Case Names and Document Titles. These are the "anchors" of the page.
*   **Body Scale (`body-lg` to `body-md`):** High readability is paramount. Use `body-lg` (1rem) for all legal commentary and notes.
*   **Label Scale (`label-md` to `label-sm`):** Use these for metadata (e.g., "Date Filed," "Case ID"). Always pair `label-sm` with `font-weight: 600` and `text-transform: uppercase` to mimic legal stamping.

---

## 4. Elevation & Depth: Tonal Layering
Hierarchy is achieved by "stacking" sheets of color rather than drawing boxes.

### The Layering Principle
*   **Base:** `surface` (#f8f9ff)
*   **Sectioning:** `surface-container-low` (#eff4ff)
*   **Active Elements/Cards:** `surface-container-lowest` (#ffffff)
*   **Nesting:** If a card contains a sub-element (like an attachment list), that sub-element should sit on `surface-container-high` (#dce9ff) to create a "recessed" look.

### Ambient Shadows
For floating elements (Modals, Popovers), use the following:
*   **Shadow:** `0 20px 40px rgba(13, 28, 46, 0.06)`
*   **Note:** The shadow color is a 6% opacity version of `on-surface` (#0d1c2e), ensuring the shadow feels like a natural part of the UI, not a "grey smudge."

---

## 5. Components: Precision & Minimalist Form

### Buttons
*   **Primary:** Linear gradient (`primary` to `primary-container`), `rounded-md` (0.375rem). No border.
*   **Secondary:** Ghost style. No background, `outline-variant` text color, 10% opacity `outline-variant` ghost-border.
*   **Tertiary:** `on-surface` text with no background.

### Cards & Lists (The Case Card)
*   **Rule:** Forbid the use of divider lines between list items.
*   **Implementation:** Use a `spacing.4` (1.4rem) vertical gap between items. Separate logical groups by transitioning from `surface-container-lowest` to `surface-container-low`.
*   **Corner Radius:** Use `rounded-xl` (0.75rem) for main containers and `rounded-lg` (0.5rem) for internal components.

### Input Fields
*   **Visual Style:** Subtle "Recessed" look. Use `surface-container-high` background with no border. On focus, transition background to `surface-container-lowest` and add a 1px `primary` ghost-border at 30% opacity.

### Legal-Specific Components
*   **The "Status Pillar":** Instead of a standard chip, use a thin vertical bar (4px width) of `tertiary` (Gold) on the left edge of a card to indicate "Priority" or "Unread" status.
*   **The Document Preview:** A glassmorphic overlay that appears over legal text, using `backdrop-blur` to keep the focus on the modal content while maintaining the context of the underlying case.

---

## 6. Do's and Don'ts

### Do
*   **Do** use the `spacing.20` and `spacing.24` tokens for page margins to convey "Premium" scale.
*   **Do** use `inter` bold for headlines, but keep body text at regular weight for a clean "Typewritten" feel.
*   **Do** use `surface-tint` sparingly to highlight the active path in a navigation tree.

### Don't
*   **Don't** use 100% black (#000000) for text. Use `on-surface` (#0d1c2e) to maintain a soft, professional contrast.
*   **Don't** use standard "Drop Shadows" from a UI kit. Stick to the ambient, low-opacity shadows defined in the Elevation section.
*   **Don't** use cards-within-cards-within-cards. If you need a third level of nesting, use a background color shift or a vertical "Status Pillar."
*   **Don't** use dividers. If you feel the need to "separate," you likely need more white space from the Spacing Scale.