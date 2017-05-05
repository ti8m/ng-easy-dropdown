const gulp = require('gulp');
const plugins = require('gulp-load-plugins')();

gulp.task('build', () => {
    return gulp.src('src/*.js')
        .pipe(plugins.babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest('dist'));
});

gulp.task('watch', () => gulp.watch('src/*.js', ['build']));

gulp.task('default', ['build']);
