const gulp = require('gulp');
const plugins = require('gulp-load-plugins')();
const babel = require('rollup-plugin-babel');
const runSequence = require('run-sequence');

gulp.task('build', () => gulp
  .src('src/index.js')
  .pipe(plugins.plumber())
  .pipe(plugins.sourcemaps.init())
  .pipe(plugins.sourcemaps.identityMap())
  .pipe(plugins.betterRollup({
    external: ['angular'],
    globals: ['angular'],
    plugins: [
      babel({ exclude: 'node_modules/**' }),
    ],
  }, {
    moduleName: 'ngEasyDropdown',
    format: 'umd',
    globals: {
      angular: 'angular',
    },
  }))
  .pipe(plugins.sourcemaps.write())
  .pipe(plugins.rename('ng-easy-dropdown.js'))
  .pipe(gulp.dest('dist')));

gulp.task('minify', () => gulp
  .src(['dist/*.js', '!dist/*.min.js'])
  .pipe(plugins.sourcemaps.init({ loadMaps: true }))
  .pipe(plugins.sourcemaps.identityMap())
  .pipe(plugins.uglify({
    source_map: true,
  }))
  .pipe(plugins.rename((path) => {
    // eslint-disable-next-line no-param-reassign
    path.extname = `.min${path.extname}`;
  }))
  .pipe(plugins.sourcemaps.write('.'))
  .pipe(gulp.dest('dist')));

gulp.task('dist', cb => runSequence('clean', 'build', 'minify', cb));

gulp.task('clean', () => gulp
  .src('dist')
  .pipe(plugins.clean()));

gulp.task('watch', () => gulp.watch('src/*.js', ['build']));

gulp.task('default', ['build', 'watch']);
