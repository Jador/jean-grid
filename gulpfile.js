var gulp = require('gulp');
var uglify = require('gulp-uglify');
var css = require('gulp-minify-css');

var del = require('del');

gulp.task('default', ['build']);

gulp.task('build', [
  'scripts',
  'styles'
]);

gulp.task('clean', function(cb) {
  console.log(cb);
  del(['dist'], cb);
})


gulp.task('scripts', ['clean'], function() {
  gulp.src(['!gulpfile.js','*.js'])
    .pipe(uglify())
    .pipe(gulp.dest('dist'));
});

gulp.task('styles', ['clean'], function() {
  gulp.src('*.css')
    .pipe(css())
    .pipe(gulp.dest('dist'));
})
