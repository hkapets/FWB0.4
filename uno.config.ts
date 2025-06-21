import {
  defineConfig,
  presetUno,
  presetTypography,
  transformerDirectives,
  transformerVariantGroup,
} from "unocss";

export default defineConfig({
  content: {
    pipeline: {
      include: [
        // the default
        /\\.(vue|svelte|[jt]sx|mdx?|astro|elm|php|phtml|html)($|\\?)/,
        // include js/ts files
        "client/src/**/*.{js,ts}",
      ],
    },
  },
  theme: {
    fontFamily: {
      sans: `"Inter", "ui-sans-serif", "system-ui"`,
      fantasy: `"Cinzel", "serif"`,
    },
    colors: {
      background: "var(--background)",
      foreground: "var(--foreground)",
      border: "var(--border)",
      input: "var(--input)",
      ring: "var(--ring)",
      primary: "var(--primary)",
      primaryForeground: "var(--primary-foreground)",
      secondary: "var(--secondary)",
      secondaryForeground: "var(--secondary-foreground)",
      muted: "var(--muted)",
      mutedForeground: "var(--muted-foreground)",
      accent: "var(--accent)",
      accentForeground: "var(--accent-foreground)",
      destructive: "var(--destructive)",
      destructiveForeground: "var(--destructive-foreground)",
      card: "var(--card)",
      cardForeground: "var(--card-foreground)",
      popover: "var(--popover)",
      popoverForeground: "var(--popover-foreground)",
    },
    animation: {
      keyframes: {
        "accordion-down":
          "{from{height:0}to{height:var(--radix-accordion-content-height)}}",
        "accordion-up":
          "{from{height:var(--radix-accordion-content-height)}to{height:0}}",
        reorder:
          "{0%{transform:scale(1.03);box-shadow:0 0 0 0 #eab30833}100%{transform:scale(1);box-shadow:0 0 0 0 transparent}}",
        fadein:
          "{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}",
      },
      durations: {
        "accordion-down": "0.2s",
        "accordion-up": "0.2s",
        reorder: "0.3s",
        fadein: "0.5s",
      },
      timingFns: {
        "accordion-down": "ease-out",
        "accordion-up": "ease-out",
      },
    },
  },
  presets: [presetUno(), presetTypography()],
  transformers: [transformerDirectives(), transformerVariantGroup()],
});
