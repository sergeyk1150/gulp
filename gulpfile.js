import gulp from "gulp";
import dartSass from "sass";
import gulpSass from "gulp-sass";
const sass = gulpSass(dartSass);
import autoprefixer from "gulp-autoprefixer";
import cleanCSS from "gulp-clean-css";
import rename from "gulp-rename";
import { deleteAsync } from "del";
import webpackStream from "webpack-stream";
import browserSync from "browser-sync";
import htmlmin from "gulp-htmlmin";

function server() {
  browserSync.init({
    server: {
      baseDir: "dist",
    },
  });
}

function watch() {
  gulp.watch(["src/style.scss", "src/styles/*"], styles);
  gulp.watch(["src/app.js"], scripts);
  gulp.watch(["src/fonts/*", "src/images/*"], copy);
}

function html() {
  return gulp
    .src("src/*.html")
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest("dist"));
}
function styles() {
  return gulp
    .src("src/style.scss")
    .pipe(sass().on("error", sass.logError))
    .pipe(autoprefixer(["last 15 version"]))
    .pipe(cleanCSS())
    .pipe(rename({ suffix: ".min" }))
    .pipe(gulp.dest("dist"))
    .pipe(browserSync.stream());
}

function scripts() {
  return gulp
    .src("src/app.js")
    .pipe(
      webpackStream({
        mode: "production",
        module: {
          rules: [
            {
              test: /\.m?js$/,
              exclude: /(node_modules|bower_components)/,
              use: {
                loader: "babel-loader",
                options: {
                  presets: ["@babel/preset-env"],
                },
              },
            },
          ],
        },
      })
    )
    .pipe(rename("app.min.js"))
    .pipe(gulp.dest("dist"))
    .pipe(browserSync.stream());
}

function copy() {
  return gulp
    .src(["src/index.html", "src/fonts/*", "src/images/*"], {
      base: "src",
      encoding: false,
    })
    .pipe(gulp.dest("dist"))
    .pipe(browserSync.stream({ once: true }));
}

function clean() {
  return deleteAsync(["dist/**"]);
}

export { styles, clean, copy, scripts, server, watch };

export default gulp.series(
  clean,
  gulp.parallel(copy, html, styles, scripts),
  gulp.parallel(server, watch)
);

export let build = gulp.series(clean, copy, html, styles, scripts);
