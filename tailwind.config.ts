import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'cyber': ['Orbitron', 'monospace'],
        'futura': ['Futura', 'Arial', 'sans-serif'],
      },
      maxWidth: {
        '3xl': '48rem',
        '4xl': '56rem',
        '5xl': '64rem',
        '6xl': '72rem',
        '7xl': '80rem',
        '8xl': '88rem',
        '9xl': '96rem',
      },
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        accent: 'var(--accent)',
        success: 'var(--success)',
        error: 'var(--error)',
        warning: 'var(--warning)',
        // Legacy colors for compatibility
        Black: '#0a0a0a',
        White: '#F5F5F5',
        OffWhite: '#e8e8e3',
        Blue: '#144bfc',
        Purple: '#8444e4',
        Teal: '#20dbdd',
        Green: '#3FFF00',
        Red: '#FF0800',
        gradientStart: '#144bfc',
        gradientEnd: '#8444e4',
        // New futuristic colors
        'cyber-blue': '#00d4ff',
        'cyber-purple': '#8444e4',
        'cyber-teal': '#20dbdd',
        'cyber-pink': '#ff0080',
        'cyber-green': '#00ff88',
        'neon-blue': '#0066ff',
        'neon-purple': '#6600ff',
        'neon-teal': '#00ffcc',
        'dark-bg': '#0a0a0a',
        'dark-surface': '#151511',
        'glass-light': 'rgba(255, 255, 255, 0.1)',
        'glass-border': 'rgba(132, 68, 228, 0.2)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'cyber-grid': 'linear-gradient(rgba(132, 68, 228, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(132, 68, 228, 0.1) 1px, transparent 1px)',
        'holographic': 'linear-gradient(45deg, transparent 30%, rgba(132, 68, 228, 0.2) 40%, rgba(32, 219, 221, 0.2) 60%, transparent 70%)',
        'neon-gradient': 'linear-gradient(135deg, #8444e4, #20dbdd, #144bfc)',
        'cyber-gradient': 'linear-gradient(135deg, #0a0a0a 0%, #151511 100%)',
      },
      backgroundSize: {
        'grid': '20px 20px',
        'holographic': '200% 200%',
      },
      boxShadow: {
        'neon': '0 0 20px rgba(132, 68, 228, 0.5), 0 0 40px rgba(132, 68, 228, 0.3), 0 0 60px rgba(132, 68, 228, 0.1)',
        'neon-blue': '0 0 20px rgba(0, 212, 255, 0.5), 0 0 40px rgba(0, 212, 255, 0.3)',
        'neon-teal': '0 0 20px rgba(32, 219, 221, 0.5), 0 0 40px rgba(32, 219, 221, 0.3)',
        'glass': '0 8px 32px rgba(132, 68, 228, 0.2), 0 0 0 1px rgba(132, 68, 228, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        'glass-hover': '0 20px 40px rgba(132, 68, 228, 0.3), 0 0 0 1px rgba(132, 68, 228, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
        'cyber': '0 4px 20px rgba(132, 68, 228, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
        'cyber-hover': '0 8px 30px rgba(132, 68, 228, 0.4), 0 0 20px rgba(32, 219, 221, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
      },
      animation: {
        'gradient-shift': 'gradient-shift 3s ease-in-out infinite',
        'holographic-shimmer': 'holographic-shimmer 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'matrix-rain': 'matrix-rain 20s linear infinite',
        'spin-slow': 'spin 8s linear infinite',
        'bounce-slow': 'bounce 3s ease-in-out infinite',
      },
      keyframes: {
        'gradient-shift': {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
        'holographic-shimmer': {
          '0%, 100%': { 'background-position': '0% 0%' },
          '50%': { 'background-position': '100% 100%' },
        },
        'pulse-glow': {
          '0%, 100%': { 'box-shadow': '0 0 20px rgba(132, 68, 228, 0.3)' },
          '50%': { 'box-shadow': '0 0 40px rgba(132, 68, 228, 0.6)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'matrix-rain': {
          '0%': { transform: 'translateY(-100vh)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateY(100vh)', opacity: '0' },
        },
      },
      backdropBlur: {
        'xs': '2px',
        '4xl': '72px',
      },
    },
  },
  plugins: [],
}

export default config