import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'facebook-blue': 'rgb(var(--facebook-blue))',
        'facebook-blue-hover': 'rgb(var(--facebook-blue-hover))',
      },
    },
  },
  plugins: [],
}
export default config
