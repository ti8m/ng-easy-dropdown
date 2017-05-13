module.exports = function (config) {
  config.set({
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '.',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],

    plugins: [
      'karma-jasmine',
      'karma-coverage',
      'karma-phantomjs-launcher',
      'karma-chrome-launcher',
      'karma-babel-preprocessor',
    ],

    // list of files / patterns to load in the browser
    files: [
      // we need to load polyfill when running the tests
      './node_modules/angular/angular.js',
      './node_modules/angular-mocks/angular-mocks.js',
      './dist/ng-easy-dropdown.js',
      'src/*-spec.js',
    ],

    preprocessors: {
      'dist/*.js': ['coverage'],
      'src/*-spec.js': ['babel'],
    },

    coverageReporter: {
      type: 'html',
      dir: './test-coverage',
    },

    babelPreprocessor: {
      options: {
        presets: ['es2015'],
        sourceMap: 'inline',
      },
      filename: function (file) {
        return file.originalPath.replace(/\.js$/, '.es5.js');
      },
      sourceFileName: function (file) {
        return file.originalPath;
      },
    },

    // list of files to exclude
    exclude: [],

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // coverage reporter generates the coverage
    reporters: ['progress', 'coverage'],

    // level of logging
    // possible values:
    // LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_DEBUG,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS'],
  });
};
