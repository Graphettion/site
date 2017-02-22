var gulp = require('gulp'),
    postcss = require('gulp-postcss'),
    cssnano = require('gulp-cssnano'),
    rename = require('gulp-rename');

    plugins = [
      require('postcss-import'),
      require('postcss-simple-vars'),
      require('postcss-nested'),
      require('postcss-cssnext'),
    ],

gulp.task('css', function() {
  return gulp.src('styles/styles.css')
    .pipe(postcss(plugins))
    .pipe(rename({ suffix: '.min' }))
    .pipe(cssnano())
    .pipe(gulp.dest('public/css'))
});

gulp.task('watch', function() {
  gulp.watch('styles/**/*.css', ['css']);
});

gulp.task('default', ['watch']);