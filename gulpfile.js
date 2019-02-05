'use strict';

var gulp = require('gulp'),
    watch = require('gulp-watch'),
    autoprefixer = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    less = require('gulp-less'),
    cssnano = require('gulp-cssnano'),
    rename = require('gulp-rename'),
    del = require('del'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    cache = require('gulp-cache'),
    browserSync = require('browser-sync'),
    reload = browserSync.reload;

    gulp.task('less', function(){ 
        return gulp.src('app/less/**/*.less') 
            .pipe(less()) 
            .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8'], { cascade: true }))
            .pipe(gulp.dest('app/css')) 
            .pipe(browserSync.reload({stream: true}))
    });

    gulp.task('browser-sync', function() { 
        browserSync({ 
            server: { 
                baseDir: 'app' 
            },
            notify: false 
        });
    });

    gulp.task('scripts', function() {
        return gulp.src([ 
            'app/libs/jquery/dist/jquery.min.js',
            ])
            .pipe(uglify()) 
            .pipe(gulp.dest('app/js')); 
    });

    gulp.task('css-libs', ['less'], function() {
        return gulp.src('app/css/libs.css') 
            .pipe(cssnano()) 
            .pipe(rename({suffix: '.min'})) 
            .pipe(gulp.dest('app/css')); 
    });

    gulp.task('img', function() {
        return gulp.src('app/img/**/*') 
            .pipe(cache(imagemin({ 
                interlaced: true,
                progressive: true,
                svgoPlugins: [{removeViewBox: false}],
                use: [pngquant()]
            })))
            .pipe(gulp.dest('dist/img')); 
    });

    gulp.task('watch', ['browser-sync', 'css-libs', 'scripts'], function() {
        gulp.watch('app/less/**/*.less', ['less']); 
        gulp.watch('app/*.html', browserSync.reload);
        gulp.watch('app/js/**/*.js', browserSync.reload);
    });

    gulp.task('clean', function() {
        return del.sync('dist'); 
    });

    gulp.task('clear', function () {
        return cache.clearAll();
    })

    gulp.task('build', ['clean', 'img', 'less', 'scripts'], function() {
        
        var buildCss = gulp.src([ 
            'app/css/main.css',
            'app/css/libs.min.css'
            ])
        .pipe(gulp.dest('dist/css'))
    
        var buildFonts = gulp.src('app/fonts/**/*') 
        .pipe(gulp.dest('dist/fonts'))
    
        var buildJs = gulp.src('app/js/**/*')
        .pipe(gulp.dest('dist/js'))
    
        var buildHtml = gulp.src('app/*.html') 
        .pipe(gulp.dest('dist'));
    
    });

    gulp.task('default', ['watch']);

var svgSprite = require('gulp-svg-sprites'),
	svgmin = require('gulp-svgmin'),
	cheerio = require('gulp-cheerio'),
    replace = require('gulp-replace');
    
    gulp.task('svgSpriteBuild', function () {
        return gulp.src('app/img/icon_set/*.svg')
            // minify svg
            .pipe(svgmin({
                js2svg: {
                    pretty: true
                }
            }))
            // remove all fill and style declarations in out shapes
            .pipe(cheerio({
                run: function ($) {
                    $('[fill]').removeAttr('fill');
                    $('[style]').removeAttr('style');
                },
                parserOptions: { xmlMode: true }
            }))
            // cheerio plugin create unnecessary string '>', so replace it.
            .pipe(replace('&gt;', '>'))
            // build svg sprite
            .pipe(svgSprite({
                    mode: "symbols",
                    preview: false,
                    selector: "icon-%f",
                    svg: {
                        symbols: 'symbol_sprite.html'
                    }
                }
            ))
            .pipe(gulp.dest('app/img/sprite/'));
    });

    gulp.task('svgSprite', ['svgSpriteBuild']);