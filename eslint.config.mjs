import globals from 'globals';
import pluginJs from '@eslint/js';

export default [
    { languageOptions: { globals: globals.browser } },
    pluginJs.configs.recommended,
    {
        rules: {
            semi: ['warn', 'always'],
            quotes: ['warn', 'single'],
            curly: 'warn',
            'no-unused-vars': ['warn', { args: 'none' }],
            'no-console': 'off',
            indent: ['warn', 2],
            'brace-style': ['warn', '1tbs'],
            'comma-dangle': ['warn', 'always-multiline'],
            'no-multiple-empty-lines': ['warn', { max: 1 }],
            'space-before-blocks': ['warn', 'always'],
        },
    },
];
