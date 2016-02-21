require('dotenv').load();

var gulp = require('gulp');
var gutil = require('gutil');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');

var include = require('gulp-include');
var minifyHTML = require('gulp-htmlmin');
var minifySVG = require('gulp-svgmin');
var decompress = require('gulp-decompress');

var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');

var ftp = require( 'vinyl-ftp' );

gulp.task('assets', function() {
    return gulp.src('./favicons.zip')
        .pipe( decompress() )
        .pipe( gulp.dest('build/') )
});
 
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

gulp.task('javascript:dev', function () {
  var b = browserify({
    entries: './assets/js/script.js',
    debug: true
  });

  var webfont = browserify({
    entries: './assets/js/webfont.js',
    debug: true
  });
    
  webfont.bundle()
    .pipe( source('./assets/js/webfont.js') )
    .pipe( buffer() )
    .pipe( sourcemaps.init({loadMaps: true}) )
    .pipe( sourcemaps.write('./') )
    .pipe( gulp.dest('./build/') );

  return b.bundle()
    .pipe( source('./assets/js/script.js') )
    .pipe( buffer() )
    .pipe( sourcemaps.init({loadMaps: true}) )
    .pipe( sourcemaps.write('./') )
    .pipe( gulp.dest('./build/') );
});

gulp.task('javascript', function () {
  var b = browserify({
    entries: './assets/js/script.js',
    debug: true
  });
    
  var webfont = browserify({
    entries: './assets/js/webfont.js',
    debug: true
  });
    
  webfont.bundle()
    .pipe( source('./assets/js/webfont.js') )
    .pipe( buffer() )
    .pipe( sourcemaps.init({loadMaps: true}) )
        .pipe( uglify() )
    .pipe( sourcemaps.write('./') )
    .pipe( gulp.dest('./build/') );

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
    gulp.watch(['./assets/styles/*.scss', './assets/styles/**/*.scss'], ['css']);
    gulp.watch('./assets/js/**/*.js', ['javascript:dev']);
});

gulp.task('build', ['css', 'html', 'javascript']);

gulp.task('deploy', ['build', 'ftp']);

gulp.task('ftp', function () {

    var conn = ftp.create( {
        host:     process.env.FTP_HOST,
        user:     process.env.FTP_USER,
        password: process.env.FTP_PASS,
        parallel: 10,
        log:      gutil.log
    } );

    return gulp.src( 'build/**', { buffer: false } )
        .pipe( conn.newer( '/asmi/overtones/deploy' ) ) // only upload newer files
        .pipe( conn.dest( '/asmi/overtones/deploy' ) );

});
