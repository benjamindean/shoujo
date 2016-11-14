var gulp = require('gulp'),
    cssmin = require('gulp-cssmin'),
    rename = require('gulp-rename'),
    sass = require('gulp-sass')

gulp.task('css', function () {
    gulp.src('src/scss/*.scss')
        .pipe(sass())
        .pipe(cssmin())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('shoujo/public/css/'));
});

gulp.task('components', function () {
    gulp.src('src/components/normalize-css/normalize.css')
        .pipe(cssmin())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('shoujo/public/css/'));
});

gulp.task('default', ['css', 'components'], function () {
    gulp.watch('src/scss/*.scss', ['css']);
    gulp.watch('src/scss/partials/*.scss', ['css']);
});