var gulp          = require('gulp');
var sass          = require('gulp-ruby-sass');
var sourcemaps    = require('gulp-sourcemaps');
var browserSync   = require("browser-sync").create();
var $             = require('gulp-load-plugins')();
var webpackConfig = require('./webpack.config.js');
var mergeStream   = require('merge-stream');

//各种路径的数组
var globs = {
  js: 'frontend/js/**/*.js',
  sass: 'frontend/sass/**/*.scss',
  html: 'frontend/**/*.html',
  assets: [
    'frontend/fonts/**/*',
    'frontend/images/**/*'
  ]
};

// 静态服务器 + 监听 scss/html 文件
gulp.task('serve', ['sass', 'html'], function() {

    browserSync.init({
        files: "**/*.css, **/*.js, **/*.html",          // 监听所有文件
        server: "./dist"  // 监听的文件夹目录
    });

    gulp.watch(globs.html, ['html']);   // html文件变动触发html
    gulp.watch(globs.sass, ['sass']);   // scss文件变动触发sass
    gulp.watch(globs.js, ['js']);   // js文件变动触发js
    gulp.watch("frontend/*.html").on('change', browserSync.reload); // frontend/*.html变动触发browserSync.reload
});

// sass编译成css
gulp.task('sass', function () {
  return sass('frontend/sass/**/*.scss', { sourcemap: true })
    .on('error', sass.logError)
    .pipe(sourcemaps.write())	// For inline sourcemaps 
    .pipe(sourcemaps.write('maps', {	// For file sourcemaps 
      includeContent: false,
      sourceRoot: 'frontend/sass/'
    }))
    .pipe(gulp.dest('dist/css'));
});

// js相关配置
gulp.task('js', ['webpack'], function () {
    return gulp.src(globs.js)
        .pipe(gulp.dest('dist/js'));
});

// webpack相关配置
gulp.task('webpack', function () {
    webpackConfig.refreshEntry();

    return gulp.src(globs.js)
        .pipe($.webpack(webpackConfig))
        .pipe(gulp.dest('dist/js'));
});

// 图片字体等资源改名存储
gulp.task('assets', function () {
    return mergeStream.apply(null, globs.assets.map(function(glob) {
        return gulp.src(glob)
            .pipe(gulp.dest(glob.replace(/\/\*.*$/, '').replace(/^frontend/, 'dist')));
    }));
});

// 编译html文件
gulp.task('html', function(){
  return gulp.src(globs.html)
    .pipe(gulp.dest('dist'));
});

gulp.task('default', ['serve']);