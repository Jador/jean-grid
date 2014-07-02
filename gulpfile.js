var gulp = require('gulp');
var uglify = require('gulp-uglify');
var css = require('gulp-minify-css');
var rename = require('gulp-rename');
var del = require('del');
var concat = require('gulp-concat');

gulp.task('default', ['concat', 'build']);

gulp.task('concat', function() {
  gulp.src(['src/module.js', 'src/templates.js', 'src/common.js', 'src/*.js'])
    .pipe(concat('jean.js'))
    .pipe(gulp.dest('.'));
});

gulp.task('build', [
  'scripts',
  'styles'
]);

gulp.task('clean', function(cb) {
  del(['build'], cb);
});

gulp.task('scripts', ['clean'], function() {
  gulp.src(['!gulpfile.js','*.js'])
    .pipe(uglify())
    .pipe(rename(min))
    .pipe(gulp.dest('build'));
});

gulp.task('styles', ['clean'], function() {
  gulp.src('*.css')
    .pipe(css())
    .pipe(rename(min))
    .pipe(gulp.dest('build'));
});

function min(path) {
  path.basename += '.min';
}
