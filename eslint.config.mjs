import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default [
	js.configs.recommended,
	tseslint.configs.eslintRecommended,
	...tseslint.configs.recommended,

	{
		files: ['**/*.ts', '**/*.tsx'],
		ignores: ['node_modules', 'build', 'dist'],
		plugins: {
			'@typescript-eslint': tseslint.plugin,
		},
		languageOptions: {
			parser: tseslint.parser,
			parserOptions: {
				project: './tsconfig.json',
			},
		},
		rules: {
			'import/prefer-default-export': 'off',
			'no-console': 'off',
			'no-extra-boolean-cast': 'off',
			'no-nested-ternary': 'off',
			'no-control-regex': 'off',
			'no-param-reassign': 'off',
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/no-unused-vars': 'error',
			'@typescript-eslint/no-unused-expressions': 'off',
			'no-underscore-dangle': 'off',
			'prefer-const': 'warn',
		},
	},

	{
		name: 'prettier',
		...prettier,
	},
];
