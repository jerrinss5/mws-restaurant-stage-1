const gulp = require('gulp');
const browserify = require("browserify");
const babelify = require("babelify")
const babel = require("gulp-babel");
const concat = require("gulp-concat");
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const source = require("vinyl-source-stream");
let dev = true;

// concating all the js files into one
gulp.task("scripts", () => {
  const b = browserify({
    debug: true
  });
  return b
    .transform(babelify.configure({
      presets: ["es2015"]
    }))
    .require(["js/**/*.js", "!js/**/dbhelper.js"], {entry: true})
    .bundle()
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist/js'));
});

// browserify and babelify the service worker file to include the dependencies
gulp.task("sw", () => {
  const b = browserify({
    debug: true
  });
  return b
    .transform(babelify.configure({
      presets: ["es2015"]
    }))
    .require("sw.js", { entry: true })
    .bundle()
    .pipe(source("sw.js"))
    .pipe(gulp.dest("dist/"));
});

// same for the db helper file to handle the ES 6 class styling
gulp.task("dbhelper", () => {
  const b = browserify({
    debug: true
  });

  return b
    .transform(babelify.configure({
      presets: ["es2015"]
    }))
    .require("js/dbhelper.js", { entry: true })
    .bundle()
    .pipe(source("dbhelper.js"))
    .pipe(gulp.dest("dist/js/"));
});