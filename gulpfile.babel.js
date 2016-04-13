import gulp from 'gulp';
import testTools from 'godaddy-test-tools';

testTools(gulp, {
  es6: true,
  sourceFiles: './src/**/*.js'
});
