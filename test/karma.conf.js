module.exports = function(config) {
    "use strict";

    config.set({
        basePath: "..",
        singleRun: true,
        frameworks: ["jasmine"],
        browsers: ["PhantomJS"],
        preprocessors: { "src/better-form-validation.js": "coverage" },
        coverageReporter: {
            type: "html",
            dir: "coverage/"
        },
        files: [
            "bower_components/es5-shim/es5-shim.js",
            "bower_components/better-dom/dist/better-dom.js",
            "bower_components/better-i18n/dist/better-i18n.js",
            "bower_components/better-popover/dist/better-popover.js",
            "src/*.js",
            "test/spec/*.spec.js"
        ]
    });
};
