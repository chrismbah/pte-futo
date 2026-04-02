/* eslint-disable no-undef */
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "node_modules/flowbite-react/lib/esm/**/*.js",
  ],
  theme: {
    screens: {
      'xxss': '300px',
      'xss': '358px',
      'xsss': '390px',
      'ss': '450px',
      'sss': "545px",
      'sm': '640px',
      'xsm': '750px',
      'xssm': '840px',
      'md': '890px',
      'mmd': '980px',
      'xmd': '1010px',
      'lg': '1057px',
      'xlg': '1150px',
      'xl': '1280px',
      'xll': '1350px',
      '2xl': '1536px',
      '3xl': '1700px'
    },
    fontSize: {
      sss: '0.5rem',
      xss: '0.6rem',
      ss: '0.7rem',
      sm: '0.8rem',
      xs: '0.9rem',
      base: '1rem',
      md: '1.15rem',
      lg: '1.20rem',
      xl: '1.25rem',
      xll: '1.4rem',
      '2xl': '1.563rem',
      '3xl': '1.953rem',
      '4xl': '2.441rem',
      '5xl': '3.052rem',
    },
    extend: {
      colors: {
        'green1': '#00875a',
        'green2': '#21875a',
        'green3': '#1c3f21',
        'green4': '#03875b',
        'green5': '#03ab73',
        'yellow1': '#ecd504'
      },
      fontFamily: {
        dmSans: ['Dm Sans', 'sans-serif'],
        inter: ['Inter', 'serif'],
        poppins: ['Poppins', 'serif'],
        satisfy: ['Satisfy', 'serif']
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [
    require('flowbite/plugin'),
  ],
}
