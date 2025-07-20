import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Premium "Organic Luxury" Palette
        primary: {
          50: '#f0fdf4',   // Almost white with fresh green tint
          100: '#dcfce7',  // Very light fresh green
          200: '#bbf7d0',  // Light fresh green
          300: '#86efac',  // Soft fresh green
          400: '#4ade80',  // Bright fresh green
          500: '#22c55e',  // Vibrant fresh green
          600: '#16a34a',  // Modern fresh green
          700: '#15803d',  // Primary: Contemporary green
          800: '#166534',  // Deeper green
          900: '#14532d',  // Deep forest (for contrast)
        },
        secondary: {
          50: '#fefefe',   // Pure white
          100: '#fdfdfc',  // Almost white
          200: '#faf9f7',  // Very light stone
          300: '#F7F5F3',  // Secondary: Warm Stone
          400: '#f0ede8',  // Soft stone
          500: '#e5dfd7',  // Medium stone
          600: '#d1c7bb',  // Deeper stone
          700: '#b8a898',  // Warm taupe
          800: '#9a8775',  // Rich taupe
          900: '#7d6b5a',  // Deep taupe
        },
        accent: {
          50: '#fff7ed',   // Very light peach
          100: '#ffedd5',  // Light peach
          200: '#fed7aa',  // Soft peach
          300: '#fdba74',  // Medium peach
          400: '#fb923c',  // Warm orange
          500: '#f97316',  // Vibrant orange
          600: '#ea580c',  // Rich orange
          700: '#c2410c',  // Deep orange
          800: '#9a3412',  // Deeper orange
          900: '#7c2d12',  // Darkest orange
        },
        neutral: {
          50: '#fafafa',   // Almost white
          100: '#f4f4f5',  // Very light gray
          200: '#e4e4e7',  // Light gray
          300: '#d4d4d8',  // Medium light gray
          400: '#a1a1aa',  // Medium gray
          500: '#71717a',  // Balanced gray
          600: '#52525b',  // Medium dark gray
          700: '#3f3f46',  // Dark gray
          800: '#2D2D2D',  // Rich Charcoal
          900: '#18181b',  // Almost black
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Mathematical scale with perfect hierarchy
        'xs': ['0.75rem', { lineHeight: '1rem' }],     // 12px
        'sm': ['0.875rem', { lineHeight: '1.25rem' }], // 14px
        'base': ['1rem', { lineHeight: '1.5rem' }],    // 16px
        'lg': ['1.125rem', { lineHeight: '1.75rem' }], // 18px
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],  // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }],     // 24px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],  // 36px
        '5xl': ['3rem', { lineHeight: '1' }],          // 48px
        '6xl': ['3.75rem', { lineHeight: '1' }],       // 60px
      },
      spacing: {
        // 8px base unit mathematical harmony
        '18': '4.5rem',  // 72px
        '22': '5.5rem',  // 88px
        '26': '6.5rem',  // 104px
        '30': '7.5rem',  // 120px
        '34': '8.5rem',  // 136px
        '38': '9.5rem',  // 152px
        '42': '10.5rem', // 168px
        '46': '11.5rem', // 184px
      },
      boxShadow: {
        // Subtle, sophisticated shadows
        'card': '0 1px 3px 0 rgba(27, 67, 50, 0.06), 0 1px 2px 0 rgba(27, 67, 50, 0.04)',
        'card-hover': '0 4px 6px -1px rgba(27, 67, 50, 0.08), 0 2px 4px -1px rgba(27, 67, 50, 0.04)',
        'elevated': '0 10px 15px -3px rgba(27, 67, 50, 0.08), 0 4px 6px -2px rgba(27, 67, 50, 0.04)',
        'premium': '0 20px 25px -5px rgba(27, 67, 50, 0.08), 0 10px 10px -5px rgba(27, 67, 50, 0.04)',
      },
      borderRadius: {
        'card': '0.75rem',     // 12px - Standard card radius
        'button': '0.5rem',    // 8px - Button radius
        'input': '0.5rem',     // 8px - Input radius
      },
      fontFeatureSettings: {
        'tnum': '"tnum"',      // Tabular numerals for prices
      },
    },
  },
  plugins: [],
};

export default config;
