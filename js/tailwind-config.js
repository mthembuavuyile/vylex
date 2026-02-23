tailwind.config = {
  theme: {
    extend: {
      fontFamily: {
        // Includes Inter from your global.css and DM Sans/Mono from your older pages
        sans: ['Inter', 'DM Sans', 'sans-serif'], 
        mono: ['DM Mono', 'monospace'],
      },
      colors: {
        brand: {
          navy:      '#051b38',
          lightNavy: '#0a2e5c',
          orange:    '#fba919',
          gray:      '#f3f4f6',
          slate:     '#e2e8f0',
          mid:       '#6b7280',
        },
      },
    },
  },
};