var gulp = require('gulp'),
    htmlmin = require('gulp-htmlmin'),
    postcss = require('gulp-postcss'),
    cssnano = require('gulp-cssnano'),
    rename = require('gulp-rename');

    plugins = [
      require('postcss-import'),
      require('postcss-simple-vars'),
      require('postcss-nested'),
      require('postcss-cssnext'),
    ];

gulp.task('html', function() {
  return gulp.src('src/pages/*.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('./'));
});

gulp.task('css', function() {
  return gulp.src('src/styles/styles.css')
    .pipe(postcss(plugins))
    .pipe(rename({ suffix: '.min' }))
    .pipe(cssnano())
    .pipe(gulp.dest('css'))
});

gulp.task('watch', function() {
  gulp.watch('src/styles/**/*.css', ['css']);
  gulp.watch('src/pages/*.html', ['html']);
});

gulp.task('default', ['watch']);