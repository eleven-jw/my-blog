// tailwind.config.cjs
module.exports = {
  content: [
    // app router + components + src 等目录
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {},
  },
  plugins: [
    // If you plan to use forms/typography etc:
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
