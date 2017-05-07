const gulp = require('gulp');
const plugins = require('gulp-load-plugins')();
const babel = require('rollup-plugin-babel');

gulp.task('build', () => gulp
    .src('src/index.js')
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.betterRollup({
      external: ['angular'],
      // notice there is no `entry` option as rollup integrates into gulp pipeline
      plugins: [babel({
        // presets: ['es2015'],
        exclude: 'node_modules/**',
        plugins: ['transform-function-bind'],
      })],
    }, {
      // also rollups `sourceMap` option is replaced by gulp-sourcemaps plugin
      format: 'cjs',
    }))
    // inlining the sourcemap into the exported .js file
    .pipe(plugins.sourcemaps.write())
    .pipe(gulp.dest('dist'))
);


// gulp.task('build', () => gulp
//   .src('src/*.js')
//   .pipe(plugins.sourcemaps.init())
//   .pipe(plugins.babel({
//     presets: ['es2015'],
//     plugins: ['transform-function-bind'],
//   }))
//   .pipe(plugins.sourcemaps.write('.'))
//   .pipe(gulp.dest('build')));
//
// gulp.task('browserify', () => gulp
//   .src('build/index.js')
//   .pipe(plugins.browserify({
//     insertGlobals: false,
//     external: ['angular'],
//   }))
//   .pipe(gulp.dest('dist')));
//
gulp.task('watch', () => gulp.watch('src/*.js', ['build']));
//
// gulp.task('default', ['build', 'browserify']);
