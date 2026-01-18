module.exports = {
  extends: 'next/core-web-vitals',
  rules: {
    // Permitir console.error y console.warn globalmente
    'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    // React hooks: convertir a warning en vez de error
    'react-hooks/exhaustive-deps': 'warn',
  },
  overrides: [
    {
      // Scripts: permitir todo
      files: ['scripts/**/*.ts', 'scripts/**/*.js'],
      rules: {
        'no-console': 'off',
      },
    },
    {
      // Stores (zustand): permitir console para debugging
      files: ['lib/stores/**/*.ts'],
      rules: {
        'no-console': 'off',
      },
    },
  ],
};
