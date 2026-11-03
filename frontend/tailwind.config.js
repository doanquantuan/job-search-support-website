import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        // Bảng màu chuẩn từ color pattern người dùng:
        // #1B365D (Deep Navy) | #005A9C (Ocean Blue) | #60C1E5 (Sky Blue) | #A0E0EF (Ice Blue)
        brand: {
          navy: "#1B365D",
          ocean: "#005A9C",
          sky: "#60C1E5",
          ice: "#A0E0EF",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          50: "#f0f7fc",
          100: "#dceef8",
          200: "#A0E0EF", // Palette #A0E0EF
          300: "#60C1E5", // Palette #60C1E5
          400: "#248ece",
          500: "#005A9C", // Palette #005A9C (Chủ đạo)
          600: "#004d85",
          700: "#00406e",
          800: "#1B365D", // Palette #1B365D (Navy)
          900: "#122541",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        joblink: {
          "primary": "#005A9C",          // Ocean Blue (Màu chính)
          "primary-content": "#ffffff",
          "secondary": "#1B365D",        // Deep Navy (Màu phụ & Tiêu đề)
          "secondary-content": "#ffffff",
          "accent": "#60C1E5",           // Sky Blue (Màu nhấn)
          "accent-content": "#1B365D",
          "neutral": "#1B365D",
          "neutral-content": "#ffffff",
          "base-100": "#ffffff",
          "base-200": "#f4f8fb",         // Nền nhẹ thanh lịch theo tone Ice
          "base-300": "#dce9f2",         // Viền phân tách
          "base-content": "#1B365D",     // Chữ chính màu Navy đậm chuyên nghiệp
          "info": "#60C1E5",
          "info-content": "#1B365D",
          "success": "#16a34a",
          "success-content": "#ffffff",
          "warning": "#f59e0b",
          "warning-content": "#ffffff",
          "error": "#dc2626",
          "error-content": "#ffffff",
          "--rounded-box": "0.75rem",
          "--rounded-btn": "0.5rem",
          "--rounded-badge": "1rem",
          "--animation-btn": "0.2s",
          "--animation-input": "0.2s",
          "--btn-focus-scale": "0.98",
          "--border-btn": "1px",
          "--tab-border": "1px",
          "--tab-radius": "0.5rem",
        },
      },
    ],
    darkTheme: false,
    base: true,
    styled: true,
    utils: true,
  },
};
