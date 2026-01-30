/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    './global.css',
  ],
  theme: {
    extend: {
      colors: {
        danger: '#C53334',
        neutral: '#F7F7F7',
        black: '#000000',
        white: '#FFFFFF',
      },
      spacing: {
        52: '52px',
        55: '55px',
        72: '72px',
      },
      borderRadius: {
        md: '16px',
      },
      backgroundColor: {
        'black-3': 'rgba(0,0,0,0.04)',
        'black-12': 'rgba(0,0,0,0.12)',
      },
      fontSize: {
        base: ['16px', '20px'],
        lg: ['18px', '22px'],
      },
    },
  },
  presets: [require("nativewind/preset")],
};
