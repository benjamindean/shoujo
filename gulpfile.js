var gulp = require('gulp'),
    cssmin = require('gulp-cssmin'),
    rename = require('gulp-rename'),
    sass = require('gulp-sass');

gulp.task('css', function () {
    gulp.src('shoujo/assets/css/*.scss')
        .pipe(sass())
        .pipe(cssmin())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('shoujo/assets/css/'));
});

gulp.task('default', ['css'], function () {
    gulp.watch('shoujo/assets/css/*.scss', ['css']);
});