# Subora Design System

## 1. Vision
Subora is a premium Telegram creator app with a polished, approachable interface. The design should feel modern, calm, and trustworthy while reinforcing the product’s creator-led marketplace and membership focus.

The visual system is built around:
- a clean, content-forward layout
- crisp blue accents for action and trust
- muted supporting colors for categories and visual structure
- clear typography with strong hierarchy
- subtle depth through refined surface layering and soft borders

## 2. Brand Personality
- Friendly, but professional
- Intuitive and uncluttered
- Elegant with a tech-forward edge
- Focused on creator revenue and community value

## 3. Color System
### Core
- **Paper White** `#FFFFFF` — primary surface
- **Ink Black** `#1c1c1e` — primary text
- **Sky Blue** `#5b76fe` — main CTA and selection color
- **Deep Indigo** `#2a41b6` — pressed / active states

### Semantic
- **Success** `#00b473`
- **Warning** `#f8c948`
- **Alert** `#ff6b6b`

### Neutrals
- **Slate** `#555a6a` — secondary text
- **Soft Gray** `#e9eaef` — borders and surfaces
- **Muted Gray** `#c7cad5` — dividers / input outlines
- **Canvas Gray** `#f7f8fb` — subtle panel backgrounds

### Accent Surfaces
- **Lavender Mist** `#f4ecff`
- **Mint Whisper** `#e9fbf9`
- **Peach Glow** `#fff2e6`
- **Sunbeam** `#fff8d8`

## 4. Typography
### Font families
- **Headings**: `Inter` / sans-serif
- **Body**: `Noto Sans` / sans-serif
- **Mono / Accent**: `Geist Mono` for system labels and code-like text

### Scale
| Usage | Font | Size | Weight | Line-height |
|---|---|---|---|---|
| Page title | Inter | 48px | 700 | 1.08 |
| Section heading | Inter | 32px | 700 | 1.1 |
| Card title | Inter | 22px | 600 | 1.2 |
| Body headline | Noto Sans | 18px | 600 | 1.4 |
| Body copy | Noto Sans | 16px | 400 | 1.6 |
| Button / label | Inter | 16px | 700 | 1.25 |
| Caption | Noto Sans | 14px | 500 | 1.5 |

## 5. Layout & Spacing
- Base spacing scale: `8px`
- Small gap: `8px`
- Default gap: `16px`
- Comfortable gap: `24px`
- Large gap: `32px`
- Full bleed sections: `60px+`

### Containers
- Cards: `16px`–`20px` padding
- Forms: `20px`–`24px` padding
- Section panels: `28px`–`32px` padding

### Radius
- Buttons / chips: `12px`
- Cards: `16px`
- Modals / panels: `24px`
- Large surface blocks: `32px`

## 6. Surface & Elevation
Keep depth minimal and polished.
- Primary cards: white surface with `0px 1px 2px rgba(28, 28, 30, 0.06)`
- Raised panels: `1px solid #e9eaef` with glow `0 0 0 1px rgba(224,226,232,0.75)`
- Soft surface tints for category blocks, not heavy shadows

## 7. Interaction Patterns
### Buttons
- Primary: sky blue background, white text, `12px` radius
- Secondary: white background, slate text, `1px solid #c7cad5`
- Ghost: transparent background, slate text, subtle hover fill

### Inputs
- Background: `#ffffff`
- Border: `1px solid #c7cad5`
- Focus: `1px solid #5b76fe`, shadow ring `rgba(91,118,254,0.16)`
- Height: `48px` with `16px` horizontal padding

### Cards
- Use color-tinted headings for space categories
- Keep card interiors airy with 18px line spacing
- Prioritize one strong visual or highlight per card

## 8. Motion & Feedback
- Use gentle fades and slide-up reveals for page content
- Button hover: `scale(1.02)` and brighter blue border
- Card hover: soften surface and increase shadow contrast slightly
- Toast / notification motion should feel light and intentional

## 9. Responsive Behavior
### Breakpoints
- Small: `<= 640px`
- Medium: `641px – 1024px`
- Large: `1025px – 1440px`
- Extra large: `>= 1441px`

### Principles
- Collapse side-by-side content into stacked cards on mobile
- Preserve generous padding and readable text sizes
- Keep primary actions fixed near the bottom on mobile if inside Telegram Web App

## 10. Design Rules
### Do
- Favor a bright, high-contrast hero with clean CTAs
- Use blue for primary actions and brand recognition
- Pair white surfaces with soft pastel accents, not loud color blocks
- Keep icons simple and consistent

### Don’t
- Don’t overload screens with too many color accents
- Don’t use heavy drop shadows or crowded layout grids
- Don’t rely on small text for important actions

## 11. Implementation Notes
- Use `Noto Sans` for all paragraph and label text
- Use `Inter` for headings, buttons, and emphasis
- Use `Geist Mono` sparingly for system values, Telegram IDs, or status codes
- Keep form pages and creator dashboards feeling calm and easy to scan
- The overall brand should feel elevated without being cold
