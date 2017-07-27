require('dotenv').load();

var gulp = require('gulp');
var gutil = require('gutil');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var CacheBuster = require('gulp-cachebust');
 
var cachebust = new CacheBuster();

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
gulp.task('default', function () {
	return gulp.src('logo.svg')
		.pipe(svgmin())
		.pipe(gulp.dest('./out'));
});
 
gulp.task('css', function () {
	return gulp.src('./assets/styles/*.scss')
	.pipe( sass({ outputStyle: 'compressed'}).on('error', sass.logError) )
	.pipe( autoprefixer('> 0.4%') )
	.pipe( cachebust.resources() )
	.pipe( gulp.dest('build/assets/styles/') );
});

gulp.task('css:dev', function () {
	return gulp.src('./assets/styles/*.scss')
	.pipe( sass().on('error', sass.logError) )
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
	})
	.transform("babelify", { presets: ["es2015"] });

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
		entries: './assets/js/script.js'
	})
	.transform("babelify", { presets: ["es2015"] });

	var webfont = browserify({
		entries: './assets/js/webfont.js',
	});

	webfont.bundle()
	.pipe( source('./assets/js/webfont.js') )
	.pipe( buffer() )
	.pipe( uglify() )
	.pipe( cachebust.resources() )
	.pipe( gulp.dest('./build/') );

	return b.bundle()
	.pipe( source('./assets/js/script.js') )
	.pipe( buffer() )
	.pipe( uglify() )
	.pipe( cachebust.resources() )
	.pipe( gulp.dest('./build/') );
});

gulp.task('watch', function() {
	gulp.watch(['index.html', './assets/images/overtone-spiral.svg'], ['html']);
	gulp.watch(['./assets/styles/*.scss', './assets/styles/**/*.scss'], ['css:dev']);
	gulp.watch(['./assets/js/**/*.js', './assets/js/**/*.json'], ['javascript:dev']);
});

gulp.task('build', ['css', 'javascript'], function(){
	return gulp.src('index.html')
	.pipe( include() )
	.pipe( minifyHTML({collapseWhitespace: true}) )
	.pipe( cachebust.references() )
	.pipe( gulp.dest('build/') );
});

gulp.task('deploy', ['build', 'clean'], function(){
	var conn = ftp.create( {
		host:     process.env.FTP_HOST,
		user:     process.env.FTP_USER,
		password: process.env.FTP_PASS,
		parallel: 10,
		log:      gutil.log
	} );
	
	return gulp.src( 'build/**', { buffer: false } )
	       .pipe( conn.dest( '/asmi/overtones/.' ) );
});

gulp.task('clean', function(cb) {
	var conn = ftp.create( {
		host:     process.env.FTP_HOST,
		user:     process.env.FTP_USER,
		password: process.env.FTP_PASS,
		parallel: 10,
		log:      gutil.log
	} );
	
	conn.rmdir('/asmi/overtones/', cb)
});
