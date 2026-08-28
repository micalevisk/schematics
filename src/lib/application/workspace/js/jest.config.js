/** @type {import('jest').Config} */
const config = {
  moduleFileExtensions: ['js', 'json'],
  rootDir: '.',
  roots: ['<rootDir>/apps/'],
  testRegex: '.<%= specFileSuffix %>.js$',
  coverageDirectory: './coverage',
};

module.exports = config;
