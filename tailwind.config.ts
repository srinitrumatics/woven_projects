import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        'w1500': '1500px',
      },
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: "#96C2DB",
          light: "#E5EDF1",
          dark: "#6B9DB8",
        },
        brand: {
          blue: "#96C2DB",
          lightBlue: "#E5EDF1",
        },
      },
    },
  },
  plugins: [],
}
export default config