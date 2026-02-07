/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'brand-brown': '#5D4037',
                'brand-gold': '#FFD700',
            }
        },
    },
    plugins: [],
}
