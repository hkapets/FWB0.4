import {
  defineConfig,
  presetUno,
  presetTypography,
  transformerDirectives,
  transformerVariantGroup,
} from "unocss";

export default defineConfig({
  content: {
    filesystem: ["client/index.html", "client/src/**/*.{js,ts,jsx,tsx}"],
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
  shortcuts: {
    "font-fantasy": "font-['Cinzel',_serif]",
    "fantasy-border": "border-2 border-transparent rounded-xl",
    "fantasy-button":
      "relative overflow-hidden transition-all duration-300 ease-in-out",
    "fantasy-input":
      "bg-[hsla(215,28%,17%,0.8)] border border-solid border-[var(--fantasy-purple-700)] backdrop-blur-md focus:border-[var(--fantasy-gold-500)] focus:shadow-[0_0_0_2px_hsla(37,91%,55%,0.2)]",
    "fantasy-card-hover":
      "hover:shadow-[0_10px_25px_-5px_hsla(267,82%,66%,0.3),_0_4px_6px_-2px_hsla(267,82%,66%,0.05)] hover:-translate-y-0.5",
    "danger-safe": "bg-[hsla(160,84%,39%,0.3)] text-[var(--fantasy-green-400)]",
    "danger-protected":
      "bg-[hsla(37,91%,55%,0.3)] text-[var(--fantasy-gold-400)]",
    "danger-dangerous": "bg-[hsla(0,84%,60%,0.3)] text-[hsl(0,84%,70%)]",
  },
  presets: [presetUno(), presetTypography()],
  transformers: [transformerDirectives(), transformerVariantGroup()],
});
