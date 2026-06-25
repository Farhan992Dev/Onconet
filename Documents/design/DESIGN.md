---
name: Onconet Vital System
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#43474f'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#737780'
  outline-variant: '#c3c6d0'
  surface-tint: '#3e5f90'
  primary: '#001836'
  on-primary: '#ffffff'
  primary-container: '#002d5b'
  on-primary-container: '#7696ca'
  inverse-primary: '#a7c8ff'
  secondary: '#006971'
  on-secondary: '#ffffff'
  secondary-container: '#75f2fe'
  on-secondary-container: '#006d76'
  tertiary: '#001b28'
  on-tertiary: '#ffffff'
  tertiary-container: '#003145'
  on-tertiary-container: '#009fd6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d5e3ff'
  primary-fixed-dim: '#a7c8ff'
  on-primary-fixed: '#001b3c'
  on-primary-fixed-variant: '#254776'
  secondary-fixed: '#83f3ff'
  secondary-fixed-dim: '#58d8e4'
  on-secondary-fixed: '#002022'
  on-secondary-fixed-variant: '#004f55'
  tertiary-fixed: '#c4e7ff'
  tertiary-fixed-dim: '#7bd0ff'
  on-tertiary-fixed: '#001e2c'
  on-tertiary-fixed-variant: '#004c69'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
  navy-deep: '#002D5B'
  teal-vibrant: '#00A9B5'
  cyan-bright: '#38BDF8'
  slate-text: '#1E293B'
  border-soft-teal: rgba(0, 169, 181, 0.15)
  surface-white: '#FFFFFF'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
  stack-sm: 8px
  stack-md: 24px
  stack-lg: 48px
---

## Brand & Style

The design system is engineered for the **Onconet Digital Cancer Ecosystem**, focusing on clinical precision, patient empowerment, and data-driven reliability. The brand personality is professional, authoritative, and compassionate, bridging the gap between complex medical data and human-centric care.

The visual style is **Corporate / Modern** with a focus on **Precision Minimalism**. It utilizes heavy whitespace to reduce cognitive load—crucial in medical contexts—and high-quality typography to ensure legibility. Elements are grounded by a deep navy foundation, representing stability, while vibrant teal-to-cyan gradients introduce a sense of innovation and technological vitality. The interface feels "airy" yet structured, using soft teal accents to guide attention without overwhelming the user.

## Colors

The palette is derived directly from the institutional heritage of the brand.
- **Primary (Navy):** Used for navigation, footers, and primary headings to establish trust and authority.
- **Secondary/Tertiary (Teal/Cyan):** These colors form a dynamic gradient used for calls to action, active states, and data visualizations, representing progress and clinical innovation.
- **Neutral:** A crisp white background (`#FFFFFF`) is paired with a very light slate (`#F8FAFC`) for sectioning. 
- **Functional Colors:** Text is rendered in a deep slate rather than pure black to reduce eye strain while maintaining high contrast. Soft teal borders are utilized for cards to differentiate content zones without the weight of traditional grey borders.

## Typography

This design system uses a dual-sans-serif approach to balance impact with utility.
- **Hanken Grotesk** is chosen for headlines. Its sharp, contemporary geometry feels modern and engineered, perfect for a high-tech medical ecosystem.
- **Inter** is used for all body copy, labels, and data points. It is specifically designed for high legibility on digital screens, ensuring that critical patient information is never misread.

**Hierarchy Rules:**
- Use **Display LG** for landing page heroes.
- Use **Headline LG** (Navy) for main section titles.
- Use **Body MD** for the majority of text content to maintain a clean, airy feel.
- Mobile scaling reduces large headlines by approximately 25% to maintain readable line lengths.


## Elevation & Depth

This design system prioritizes **Tonal Layers** and **Soft Teal Outlines** over heavy shadows to maintain a "scientific" and clean aesthetic.

- **Level 0 (Background):** Pure white or `#F8FAFC` for page sections.
- **Level 1 (Cards):** Surface white with a 1px solid border in `border-soft-teal`. No shadow is used here to keep the UI flat and clinical.
- **Level 2 (Interactive):** When hovered, cards or elements gain a very subtle, diffused cyan-tinted shadow (0px 8px 24px rgba(0, 169, 181, 0.08)) to indicate interactivity.
- **Level 3 (Modals/Overlays):** Significant depth is created with a backdrop blur and a medium-density navy-tinted shadow to pull focus to critical inputs.

## Shapes

The shape language is **Rounded**, utilizing an 8px (0.5rem) base radius. This softens the technical nature of the navy and teal palette, making the ecosystem feel approachable and modern rather than rigid or institutional.

- **Standard Elements (Inputs, Cards):** 8px (rounded-md)
- **Large Containers (Sections, Hero Cards):** 16px (rounded-lg)
- **Special Elements (Buttons, Tags):** 24px+ (rounded-xl) for a "pill" appearance that invites interaction.

## Components

### Buttons
- **Primary:** Rounded-rectangle (pill-style) featuring a linear gradient from `teal-vibrant` to `cyan-bright`. Text is white, bold, and centered.
- **Secondary:** Transparent background with a `teal-vibrant` 1.5px border and teal text.
- **Tertiary:** Navy text only, used for low-priority actions.

### Cards
- Cards must use a white background and the defined `border-soft-teal` outline.
- Padding inside cards is consistently 24px (stack-md).
- Headers within cards should use the Navy-deep color for the title to establish clear internal hierarchy.

### Input Fields
- Subtle 1px borders in a neutral grey, turning `teal-vibrant` on focus.
- Labels are always positioned above the field in `label-md` Inter, using the slate-text color.

### Footer
- The footer is a full-width, high-contrast block using `navy-deep` (#002D5B).
- All text in the footer should be white or a 60% opacity white for secondary links.
- Social icons and logo mark should be rendered in the teal gradient for a premium finish.

### Data Visualization
- Graphs should utilize the Teal and Cyan spectrum for primary data series. 
- Avoid red unless specifically indicating a clinical "Alert" or "Critical" state.