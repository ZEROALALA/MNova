---
name: Chaos Gaming
colors:
  surface: '#19101c'
  surface-dim: '#19101c'
  surface-bright: '#403643'
  surface-container-lowest: '#130b16'
  surface-container-low: '#211824'
  surface-container: '#261c28'
  surface-container-high: '#302733'
  surface-container-highest: '#3c313e'
  on-surface: '#eeddee'
  on-surface-variant: '#d4c0d7'
  inverse-surface: '#eeddee'
  inverse-on-surface: '#372d3a'
  outline: '#9d8ba0'
  outline-variant: '#514255'
  surface-tint: '#ecb2ff'
  primary: '#ecb2ff'
  on-primary: '#520071'
  primary-container: '#bd00ff'
  on-primary-container: '#ffffff'
  inverse-primary: '#9900cf'
  secondary: '#d3fbff'
  on-secondary: '#00363a'
  secondary-container: '#00eefc'
  on-secondary-container: '#00686f'
  tertiary: '#94db00'
  on-tertiary: '#223600'
  tertiary-container: '#568200'
  on-tertiary-container: '#fffeff'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#f8d8ff'
  primary-fixed-dim: '#ecb2ff'
  on-primary-fixed: '#320047'
  on-primary-fixed-variant: '#74009f'
  secondary-fixed: '#7df4ff'
  secondary-fixed-dim: '#00dbe9'
  on-secondary-fixed: '#002022'
  on-secondary-fixed-variant: '#004f54'
  tertiary-fixed: '#a9f900'
  tertiary-fixed-dim: '#94db00'
  on-tertiary-fixed: '#121f00'
  on-tertiary-fixed-variant: '#334f00'
  background: '#19101c'
  on-background: '#eeddee'
  surface-variant: '#3c313e'
typography:
  display-lg:
    fontFamily: Sora
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Sora
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Sora
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1.2'
  title-md:
    fontFamily: Sora
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.1em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 16px
  margin-edge: 24px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style
The design system is a high-octane, immersive interface designed for the next generation of mobile gaming. It draws heavy inspiration from contemporary console environments, blending the sleek, architectural depth of the PS5 with the aggressive, performance-oriented utility of the Xbox Series X. 

The aesthetic is **Futuristic Glassmorphism**. The UI should feel like a holographic projection floating in deep space. Key characteristics include:
- **Depth & Layering:** Multi-layered translucent surfaces that react to gyroscope movement.
- **Dynamic Energy:** Use of vibrant neon glows that pulse or "flicker" slightly to simulate a living system.
- **Geometric Precision:** Incorporation of the iconic gaming shapes—Triangle, Circle, Square, and Cross—as functional anchors and decorative motifs.
- **High Contrast:** Pure obsidian backgrounds allow neon accents and glass layers to pop with maximum intensity.

## Colors
The palette is centered on "Obsidian" (#050505) to ensure deep blacks on OLED mobile screens. "Nebula Purple" serves as the primary brand color, used for core branding and primary action states.

- **Primary (Nebula Purple):** #BD00FF. Used for high-level focus states and "Level Up" moments.
- **Secondary (Electric Blue):** #00F0FF. Used for technical information, HUD elements, and progress bars.
- **Tertiary (Acid Green):** #ADFF00. Reserved for "Success" states, online status, and confirmed actions.
- **Accent (Hot Pink):** #FF007A. Used for "X" (Cancel) actions and high-priority alerts.
- **Surface:** Surfaces use a semi-transparent purple tint with a heavy backdrop-blur (20px+) to create the glass effect.

## Typography
The typography is tech-forward and wide. **Sora** provides the geometric, wide-stanced "gaming" feel for headings, while **Hanken Grotesk** maintains high legibility for long-form game descriptions and settings. **JetBrains Mono** is utilized for metadata (FPS, Ping, Stats) to evoke a developer/technical "HUD" aesthetic.

- Use uppercase for all labels and button text to maintain a high-energy, authoritative tone.
- Apply a slight "text-shadow" glow to headings in the Primary or Secondary color to simulate neon lighting.

## Layout & Spacing
This design system utilizes a **Fluid Grid** with heavy emphasis on safe-area margins to accommodate modern mobile notches and edge-to-edge displays.

- **Base Unit:** 4px incremental scale.
- **Horizontal Flow:** Content should be grouped in horizontally scrolling carousels (Card-stacks) to mimic the console "Dashboard" experience.
- **Margins:** 24px side margins ensure touch targets are well away from the screen edges.
- **Safe Zones:** Always respect the bottom "home bar" area on iOS/Android, using it for floating navigation "Pills" rather than fixed bars.

## Elevation & Depth
Elevation is not conveyed through traditional drop shadows, but through **Tonal Layering and Glows**.

- **Level 1 (Deepest):** Obsidian black background.
- **Level 2 (Containers):** Nebula glass surfaces (rgba 25, 10, 40, 0.6) with 20px backdrop-blur.
- **Level 3 (Interactive):** Elements with 1px semi-transparent borders (inner glow).
- **Level 4 (Active):** High-intensity neon outer glows (drop-shadow: 0 0 15px [color]).

Use "Z-axis" motion during transitions; when a user selects a game card, it should scale up while background layers blur further and recede.

## Shapes
The shape language is "Squircle-based" with sharp geometric accents. While containers use a 0.5rem (Rounded) radius to feel modern and premium, interactive icons (the Triangle, Circle, Square, Cross) should maintain their rigid geometric purity.

- **Interactive Cards:** 1rem (rounded-lg) for the main body.
- **Status Pills:** Fully rounded (Pill-shaped) for a soft, distinct contrast against the sharp UI.
- **Cut Corners:** Use 45-degree "clipped" corners on buttons to reinforce the futuristic, military-tech aesthetic.

## Components
- **Buttons:** Primary buttons use a "Nebula" gradient background with a 1px "Acid Green" border. On press, the button should "flash" white briefly.
- **Game Cards:** Large-format glass containers. The background of the card should be the game's key art with a 60% opacity black overlay. On hover/focus, the overlay disappears and a neon border pulses.
- **The "Shape" HUD:** A persistent bottom or side navigation using the Triangle (Play), Square (Library), Circle (Social), and Cross (Close/Menu) icons. These should be rendered as thin-stroke neon lines.
- **Input Fields:** Bottom-aligned strokes only. When focused, the stroke turns into a vibrant neon blue with a subtle gradient scanline effect moving across it.
- **Progress Bars:** Dual-layered. A dark track with a glowing, "pixel-dithered" progress fill that moves with a jittery, high-energy animation.
- **Toasts/Alerts:** Floating glass pods that slide in from the top, featuring a heavy blur and a left-side accent stripe in the "Hot Pink" or "Acid Green" palette.