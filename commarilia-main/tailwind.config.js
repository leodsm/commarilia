export default {
    content: [
        "./index.html",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./hooks/**/*.{js,ts,jsx,tsx}",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./*.{js,ts,jsx,tsx}"
    ],
    theme: {
        extend: {
            fontFamily: {
                poppins: ['Poppins', 'sans-serif'],
                gotham: ['Gotham', 'sans-serif'],
            },
            typography: (theme) => ({
                DEFAULT: {
                    css: {
                        h1: {
                            fontSize: '22px',
                            fontWeight: '700',
                            fontFamily: theme('fontFamily.poppins')[0],
                        },
                        h2: {
                            fontSize: '20px',
                            fontWeight: '700',
                            fontFamily: theme('fontFamily.poppins')[0],
                        },
                        h3: {
                            fontSize: '18px',
                            fontWeight: '700',
                            fontFamily: theme('fontFamily.poppins')[0],
                        },
                        h4: {
                            fontSize: '14px',
                            fontWeight: '700',
                            fontFamily: theme('fontFamily.poppins')[0],
                        },
                    },
                },
            }),
            colors: {
                primary: '#fd572b',
            }
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
};
