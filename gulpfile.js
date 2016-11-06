var gulp = require('gulp'),
    cssmin = require('gulp-cssmin'),
    rename = require('gulp-rename'),
    sass = require('gulp-sass');

gulp.task('css', function () {
    gulp.src('resources/scss/*.scss')
        .pipe(sass())
        .pipe(cssmin())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('shoujo/public/css/'));
});

gulp.task('components', function () {
    gulp.src('resources/components/normalize-css/normalize.css')
        .pipe(cssmin())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('shoujo/public/css/'));
});

gulp.task('default', ['css', 'components'], function () {
    gulp.watch('resources/scss/*.scss', ['css']);
    gulp.watch('resources/scss/partials/*.scss', ['css']);
});