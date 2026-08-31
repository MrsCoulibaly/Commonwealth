import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './app.vue',
    './plugins/**/*.{js,ts}',
    './nuxt.config.{js,ts}',
  ],
  theme: {
    extend: {
      colors: {
        brandBlue: '#216EC2',
        brandOrange: '#F99B4B',
        brandGreen: '#2E8B57',
        brandPurple: '#7B4FD4',
      },
    },
  },
  plugins: [],
}

