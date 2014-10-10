var gulp = require("gulp");
var gulpif = require("gulp-if");
var gulpFilter = require("gulp-filter");
var es6transpiler = require("gulp-es6-transpiler");
var concat = require("gulp-concat");
var jshint = require("gulp-jshint");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer-core");
var csswring = require("csswring");
var url = require("postcss-url");
var replace = require("gulp-replace");

autoprefixer = autoprefixer({browsers: ["last 2 versions", "android 2.3", "IE >= 8"]});
url = url({url: "inline"});

var karma = require("karma").server;
var karmaConfig = require.resolve("./test/karma.conf");

gulp.task("lint", function() {
    return gulp.src(["src/*.js", "test/**/*.js", "*.js"])
        .pipe(jshint(".jshintrc"))
        .pipe(jshint.reporter("jshint-stylish"))
        .pipe(gulpif(process.env.TRAVIS_JOB_NUMBER, jshint.reporter("fail")));
});

gulp.task("compile", ["lint"], function() {
    var jsFilter = gulpFilter("*.js");
    var cssFilter = gulpFilter("*.css");

    return gulp.src(["src/*.js", "src/*.css"])
        .pipe(cssFilter)
        .pipe(postcss([ autoprefixer, csswring, url ]))
        .pipe(replace("\"", "'")) // handle quotes
        .pipe(replace("\\", "\\\\")) // handle escapes
        .pipe(replace(/([^{]+)\{([^}]+)\}/g, "\n    \"$1\": \"$2\","))
        .pipe(replace(/([\s\S]+),/, "DOM.importStyles({$1\n});\n"))
        .pipe(cssFilter.restore())
        .pipe(jsFilter)
        .pipe(es6transpiler())
        .pipe(jsFilter.restore())
        .pipe(concat("better-form-validation.js"))
        .pipe(gulp.dest("build/"));
});

gulp.task("test", ["compile"], function(done) {
    var config = { configFile: karmaConfig };

    if (process.env.TRAVIS_JOB_NUMBER) {
        config = {
            configFile: karmaConfig,
            preprocessors: { "build/*.js": "coverage" },
            reporters: ["coverage", "dots", "coveralls"],
            coverageReporter: {
                type: "lcovonly",
                dir: "coverage/"
            }
        };
    }

    karma.start(config, done);
});

gulp.task("dev", ["compile"], function() {
    gulp.watch("src/**", ["compile"]);

    karma.start({
        configFile: karmaConfig,
        preprocessors: { "build/*.js": "coverage" },
        reporters: ["coverage", "progress"],
        background: true,
        singleRun: false
    });
});
