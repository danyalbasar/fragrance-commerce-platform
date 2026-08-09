export const appTheme = {
  // Spacing System (4px grid)
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "24px",
    xxl: "32px",
    xxxl: "48px",
    xxxxl: "64px",
  },

  // Typography Hierarchy
  typography: {
    // Display
    display1: "56px/1.1 font-normal [font-family:var(--font-serif)]",
    display2: "44px/1.15 font-normal [font-family:var(--font-serif)]",
    display3: "36px/1.2 font-normal [font-family:var(--font-serif)]",

    // Heading
    h1: "32px/1.25 font-normal [font-family:var(--font-serif)]",
    h2: "28px/1.3 font-normal [font-family:var(--font-serif)]",
    h3: "24px/1.35 font-normal [font-family:var(--font-serif)]",
    h4: "20px/1.4 font-semibold",
    h5: "18px/1.45 font-semibold",
    h6: "16px/1.5 font-semibold",

    // Body
    bodyLarge: "16px/1.6 font-normal",
    body: "14px/1.6 font-normal",
    bodySmall: "12px/1.5 font-normal",
    bodyCaption: "11px/1.5 font-normal",

    // UI Elements
    label: "12px/1.5 font-semibold uppercase tracking-[0.08em]",
    button: "14px/1.4 font-semibold uppercase tracking-[0.12em]",
    overline: "11px/1.5 font-semibold uppercase tracking-[0.16em] text-[var(--luxury-gold)]",
  },

  // Border Radius System (Apple-inspired)
  radius: {
    none: "0",
    sm: "4px",
    md: "8px",
    lg: "12px",
    xl: "16px",
    "2xl": "24px",
    full: "9999px",
  },

  // Shadows (Luxurious depth)
  shadows: {
    none: "none",
    sm: "0 2px 8px rgba(22, 18, 13, 0.06)",
    md: "0 8px 30px rgba(22, 18, 13, 0.12)",
    lg: "0 20px 60px rgba(22, 18, 13, 0.18)",
    xl: "0 30px 80px rgba(22, 18, 13, 0.24)",
    inner: "inset 0 2px 4px rgba(22, 18, 13, 0.06)",
  },

  // Transitions (Smooth and purposeful)
  transitions: {
    fast: "all 220ms cubic-bezier(0.22, 1, 0.36, 1)",
    normal: "all 280ms cubic-bezier(0.22, 1, 0.36, 1)",
    slow: "all 380ms cubic-bezier(0.22, 1, 0.36, 1)",
    bounce: "all 300ms cubic-bezier(0.34, 1.56, 0.64, 1)",
  },

  // Colors (Refined luxury palette)
  colors: {
    primary: "var(--luxury-gold)",
    secondary: "var(--luxury-moss)",
    background: "var(--luxury-ivory)",
    surface: "var(--luxury-paper)",
    border: "var(--luxury-line)",
    text: {
      primary: "var(--luxury-ink)",
      secondary: "var(--luxury-muted)",
      tertiary: "rgba(22, 18, 13, 0.5)",
    },
    state: {
      hover: "var(--luxury-gold)",
      active: "var(--luxury-moss)",
      disabled: "var(--luxury-muted)",
    },
  },
};