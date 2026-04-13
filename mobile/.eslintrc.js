module.exports = {
  root: true,
  extends: '@react-native',
  rules: {
    'no-unused-vars': 'off', // tắt rule JS mặc định
    '@typescript-eslint/no-unused-vars': 'warn', // chuyển sang warning
  },
};