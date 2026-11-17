/** @type {import('tailwindcss').Config} */

/*
 * Sistema visual de MyHomeGym: "suelo de caucho y discos de colores".
 * - Fondos y color de acción: variables CSS en src/styles/theme.css.
 * - Texto color tiza.
 * - Los colores de disco (rojo 25, azul 20, amarillo 15, verde 10) se reservan para datos:
 *   series, músculos y gráficas. Nunca para botones.
 * La escala `slate` se redefine con el mismo gris cálido para que todas las pantallas
 * compartan paleta sin tocar cada clase.
 */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: ['class'],
  theme: {
    extend: {
      colors: {
        slate: {
          50: '#F7F5F0',
          100: '#EEEBE4',
          200: '#DCD8D0',
          300: '#C2BEB6',
          400: '#9C9A95',
          500: '#6E6E6C',
          600: '#55575B',
          700: '#3E4146',
          800: '#2C2F34',
          900: '#212327',
          950: '#17181B',
        },
        gym: {
          // Acción principal y fondos: salen de variables CSS (src/styles/theme.css), así la
          // paleta se cambia en un solo sitio.
          accent: 'rgb(var(--gym-accent) / <alpha-value>)',
          'accent-light': 'rgb(var(--gym-accent-light) / <alpha-value>)',
          'accent-dim': 'rgb(var(--gym-accent-dim) / <alpha-value>)',
          'on-accent': 'rgb(var(--gym-on-accent) / <alpha-value>)',

          black: 'rgb(var(--gym-black) / <alpha-value>)',
          'bg-dark': 'rgb(var(--gym-bg) / <alpha-value>)',
          card: 'rgb(var(--gym-card) / <alpha-value>)',
          'card-2': 'rgb(var(--gym-card-2) / <alpha-value>)',
          border: 'rgb(var(--gym-border) / <alpha-value>)',
          'border-2': 'rgb(var(--gym-border-2) / <alpha-value>)',

          // Texto: tiza
          'text-muted': '#9AA0A6',
          'text-dim': '#B4B8BD',
          'text-base': '#DDD9D0',
          'text-bright': '#F4F1EA',

          // Estados
          success: '#2BA36B',
          warning: '#F2C230',
          danger: '#F2665F',
          info: '#2F6FDE',
        },
        // Colores de disco olímpico (código IWF), solo para datos
        plate: {
          red: '#E5383B',
          blue: '#2F6FDE',
          yellow: '#F2C230',
          green: '#2BA36B',
          white: '#E9E7E2',
          steel: '#8B9097',
        },
      },
      fontFamily: {
        display: ['"Big Shoulders Display"', '"Barlow Condensed"', 'Impact', 'sans-serif'],
        body: ['Barlow', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
