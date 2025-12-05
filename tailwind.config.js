module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        // BTK Cards brand colors - Green & Gold palette inspired by ITACOSPECIALTY
        teal: {
          50: '#f0f8f7',
          100: '#d9ebe8',
          200: '#a8d4cc',
          300: '#76bcb1',
          400: '#4da597',
          500: '#2a8c7d',
          600: '#1b5e4f',
          700: '#13433a',
          800: '#0a2825',
          900: '#021210'
        },
        gold: {
          50: '#fdf8f3',
          100: '#fae9d3',
          200: '#f5d9ab',
          300: '#e8c07c',
          400: '#d4a574',
          500: '#c89c60',
          600: '#b8894a',
          700: '#9a7037',
          800: '#7c5728',
          900: '#5e3f1a'
        },
        brand: {
          DEFAULT: '#1b5e4f',
          dark: '#0a2825',
          gold: '#d4a574',
          'gold-dark': '#b8894a'
        }
      },
      boxShadow: {
        'card-md': '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0,0,0,0.03)'
      },
      borderRadius: {
        'xl-lg': '12px'
      }
    }
  },
  plugins: [],
};
