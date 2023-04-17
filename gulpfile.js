'use strict';

// Modules
const gulp = require('gulp');
const { src, dest } = require('gulp');
const pug = require('gulp-pug');
const sass = require('gulp-sass')(require('sass'));
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();


// Tasks
async function optimizeImages() {
  const imagemin = await import('gulp-imagemin').then((module) => module.default);

  return gulp.src('images/*')
    .pipe(imagemin())
    .pipe(gulp.dest('images'))
}

function compileHTML() {
  return gulp.src(
    [
      './pug/**/*.pug',
      '!./pug/layout/*.pug', 
      '!./pug/components/*.pug'
    ]
  )
    .pipe(pug({ doctype: 'html', pretty: true }).on('error', error => { console.log('Error en pug: ' + error); }))
    .pipe(dest('html'))
    .pipe(browserSync.reload({ stream: true }));
}

function compileSass() {
  return gulp.src('sass/**/*.sass')
    .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError))
    .pipe(autoprefixer({
      grid: "autoplace",
    }))
    .pipe(sourcemaps.write('./maps'))
    .pipe(gulp.dest('css'))
    .pipe(browserSync.stream());
}

// Browser sync
function browserSyncDev(done) {
  browserSync.init({
    injectChanges: true,
    server: {
      baseDir: "./",
      serveStaticOptions: {
        extensions: ['html']
      },
      directory: true
    },
    port: 3000
  });


  let watcherHtml = gulp.watch('pug/**/*.pug');
	watcherHtml.on('change', function (path) { compileHTML(path) });

  gulp.watch('sass/**/*.sass', compileSass);
  gulp.watch('pug/**/*.pug').on('change', browserSync.reload);

  done();
}

exports.default = gulp.series(optimizeImages, browserSyncDev);