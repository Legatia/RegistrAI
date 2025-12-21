/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                protex: {
                    bg: '#050505',
                    surface: '#0a0a0a',
                    primary: '#2563eb',
                    accent: '#00f0ff',
                    muted: '#9ca3af'
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            animation: {
                'scan': 'scanline 4s linear infinite',
            },
            keyframes: {
                scanline: {
                    '0%': { transform: 'translateY(-100%)' },
                    '100%': { transform: 'translateY(100vh)' },
                }
            }
        },
    },
    plugins: [],
}
