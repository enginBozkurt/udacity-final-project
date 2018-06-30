// npm install --save gulp
// npm install --save-dev gulp-clean-css
// npm install --save-dev gulp-minify
// npm install --save sharp
// npm install --save-dev gulp-responsive
// npm install --save-dev gulp-watch
// npm install --save-dev del
// npm init -y

var gulp = require('gulp');
var cleanCSS = require('gulp-clean-css');
var minify = require('gulp-minify');
var responsive = require('gulp-responsive');
var del = require('del');
var watch = require('gulp-watch');


function clean() {
  var currentdate = new Date();
  var datetime = currentdate.getFullYear() + "/"
                + (currentdate.getMonth()+1)  + "/"
                + currentdate.getDate() + " @ "
                + currentdate.getHours() + ":"
                + currentdate.getMinutes() + ":"
                + currentdate.getSeconds();
  console.log("\n--------------" + datetime + "--------------");
  console.log('Cleaning dist directory.');
  return del([
    'dist/*.css',
    'dist/*.js',
    'dist/*.jpg',
  ]);
}

function minifyCss() {
  console.log('Minifing CSS styles.');
  return gulp.src('css/*.css')
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(gulp.dest('dist'));
}

function compressJs() {
  console.log('Compressing JavaScript scripts.');
  gulp.src('js/*.js')
    .pipe(minify({
        ext:{
            src:'-debug.js',
            min:'.js'
        },
        exclude: ['tasks'],
        ignoreFiles: ['.combo.js', '-min.js']
    }))
    .pipe(gulp.dest('dist'))
}

function responsiveLogo() {
  console.log('Making responsive logo.');
  return gulp.src('img/logo.png')
    .pipe(responsive({
      'logo.png': [
        {
          width: 512,
          rename: { suffix: '-512px'},
        },{
          width: 192,
          rename: { suffix: '-192px'},
        }
      ]
    }, {
      progressive: true,
      withMetadata: false,
    }))
    .pipe(gulp.dest('dist'));
}

function img() {
  gulp.src('C:/Udacity-Project/mws-restaurant-stage-1-master/img/**/*')
    .pipe(imagemin({
      progressive: true,
    }))
    .pipe(webp())
    .pipe(gulp.dest('C:/Udacity-Project/mws-restaurant-stage-1-master/dist'));
}

gulp.task('minifyCss', minifyCss);
gulp.task('compressJs', compressJs);
gulp.task('clean', clean);
gulp.task('responsiveLogo', responsiveLogo);


gulp.task('default', ['clean', 'minifyCss', 'compressJs', 'responsiveLogo']);

gulp.task('watch', function () {
    watch(['js/*.js', 'css/*.css', 'service-worker.js'], function() {
      clean();
      minifyCss();
      compressJs();
      responsiveLogo();
    });
});
