
import type { Config } from "tailwindcss";

const blueScale = {
	50: '#effbff',
	100: '#def5ff',
	200: '#b8ebfb',
	300: '#84dcf2',
	400: '#45c6e6',
	500: '#13a0e0',
	600: '#0f84bc',
	700: '#0d698d',
	800: '#0a4d66',
	900: '#072f41',
	950: '#03141d',
};

const cyanScale = {
	50: '#effeff',
	100: '#d8fbff',
	200: '#aeefff',
	300: '#74e0fb',
	400: '#35caf1',
	500: '#0ea6de',
	600: '#0e87b8',
	700: '#0d6994',
	800: '#0b4f70',
	900: '#07314a',
	950: '#031723',
};

const skyScale = {
	50: '#eefbff',
	100: '#d8f5ff',
	200: '#b1ebff',
	300: '#7edcff',
	400: '#45c9ff',
	500: '#18a9ea',
	600: '#128cc4',
	700: '#0f6ea0',
	800: '#0c567a',
	900: '#08354d',
	950: '#041b2a',
};

const indigoScale = {
	50: '#eef5ff',
	100: '#dce9ff',
	200: '#bfd5ff',
	300: '#93b7ff',
	400: '#6291f7',
	500: '#366ceb',
	600: '#2052cc',
	700: '#1a41a6',
	800: '#17347c',
	900: '#10244f',
	950: '#091430',
};

const purpleScale = {
	50: '#f0f7ff',
	100: '#e0efff',
	200: '#c1dcff',
	300: '#95c0ff',
	400: '#64a0f3',
	500: '#3f7fe5',
	600: '#2b63c5',
	700: '#214ca0',
	800: '#1b3c7b',
	900: '#152a54',
	950: '#0b152c',
};

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				blue: blueScale,
				cyan: cyanScale,
				sky: skyScale,
				indigo: indigoScale,
				purple: purpleScale,
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			fontFamily: {
				sans: ['Inter var', 'sans-serif'],
				display: ['SF Pro Display', 'Inter var', 'sans-serif'],
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' },
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' },
				},
				'fade-in': {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' }
				},
				'fade-up': {
					'0%': { opacity: '0', transform: 'translateY(20px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'scale-in': {
					'0%': { opacity: '0', transform: 'scale(0.95)' },
					'100%': { opacity: '1', transform: 'scale(1)' }
				},
				'slide-in-right': {
					'0%': { transform: 'translateX(100%)', opacity: '0' },
					'100%': { transform: 'translateX(0)', opacity: '1' }
				},
				'slide-in-left': {
					'0%': { transform: 'translateX(-100%)', opacity: '0' },
					'100%': { transform: 'translateX(0)', opacity: '1' }
				},
				'pulse-soft': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.85' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.6s ease-out',
				'fade-up': 'fade-up 0.7s ease-out',
				'scale-in': 'scale-in 0.5s ease-out',
				'slide-in-right': 'slide-in-right 0.6s ease-out',
				'slide-in-left': 'slide-in-left 0.6s ease-out',
				'pulse-soft': 'pulse-soft 2s ease-in-out infinite'
			},
			backdropBlur: {
				'xs': '2px',
			},
		}
	},
	plugins: [
		require("tailwindcss-animate"),
		require("@tailwindcss/typography")
	],
} satisfies Config;
