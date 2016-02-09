var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');

var include = require('gulp-include');
var minifyHTML = require('gulp-htmlmin');
var minifySVG = require('gulp-svgmin');

var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
 
gulp.task('css', function () {
  return gulp.src('./assets/styles/*.scss')
    .pipe( sass({ outputStyle: 'compressed'}).on('error', sass.logError) )
    .pipe( autoprefixer('> 0.4%') )
    .pipe( gulp.dest('build/assets/styles/') );
});
 
gulp.task('css:watch', function () {
  gulp.watch('./sass/**/*.scss', ['sass']);
});

gulp.task('html', function () {
  return gulp.src('index.html')
    .pipe( include() )
    .pipe( minifyHTML({collapseWhitespace: true}) )
    .pipe( gulp.dest('build/') );
});

gulp.task('javascript', function () {
  var b = browserify({
    entries: './assets/js/script.js',
    debug: true
  });

  return b.bundle()
    .pipe( source('./assets/js/script.js') )
    .pipe( buffer() )
    .pipe( sourcemaps.init({loadMaps: true}) )
        .pipe( uglify() )
    .pipe( sourcemaps.write('./') )
    .pipe( gulp.dest('./build/') );
});

gulp.task('watch', function() {
    gulp.watch(['index.html', './assets/images/overtone-spiral.svg'], ['html']);
    gulp.watch('./assets/styles/**/*.scss', ['css']);
});

gulp.task('build', ['css', 'html']);
