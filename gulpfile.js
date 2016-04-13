'use strict';

var gulp = require('gulp');
require('godaddy-test-tools')(gulp, {
  es6: true,
  sourceFiles: './src/**/*.js'
});
