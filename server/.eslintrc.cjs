module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    // Example: Allow console.log (useful for Node.js development)
    'no-console': 'off',
    // You can add other rule overrides here as needed
    // e.g., 'import/extensions': ['error', 'ignorePackages', { js: 'always' }], if you use .js extensions in imports
    'import/extensions': ['error', 'ignorePackages', { js: 'always' }],
    'no-underscore-dangle': ['error', { 'allow': ['__filename', '__dirname', '_id'] }],
    'consistent-return': 'off',
    'func-names': 'off',
    'import/prefer-default-export': 'off',
    'no-unused-vars': ['error', { 'args': 'after-used', 'argsIgnorePattern': '^_' }],
  },
};
