module.exports = function(config) {
    "use strict";

    config.set({
        basePath: "..",
        plugins: ["karma-jasmine", "karma-phantomjs-launcher"],
        frameworks: ["jasmine"],
        browsers: ["PhantomJS"],
        files: [
            "bower_components/better-dom/dist/better-dom.js",
            "src/*.js",
            "test/spec/*.spec.js"
        ]
    });
};
