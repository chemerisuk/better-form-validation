module.exports = function(grunt) {
    "use strict";

    grunt.initConfig({
        watch: {
            jasmine: {
                files: ["src/*.js", "test/*.spec.js"],
                tasks: ["jasmine"]
            }
        },
        jasmine: {
            all: {
                src: ["src/*.js"],
                options: {
                    vendor: ["components/better-dom/better-dom.js"],
                    specs: "test/*.spec.js",
                    outfile: "specs.html",
                    keepRunner: true,
                    template: require("grunt-template-jasmine-istanbul"),
                    templateOptions: {
                        coverage: "coverage/coverage.json",
                        report: "coverage"
                    }
                }
            }
        },
        jshint: {
            all: [
                "Gruntfile.js",
                "src/*.js",
                "test/*.spec.js"
            ],
            options: {
                jshintrc: ".jshintrc"
            }
        },
        plato: {
            all: {
                files: {
                    reports: ["src/*.js"]
                }
            }
        }
    });

    grunt.loadNpmTasks("grunt-contrib-jasmine");
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-plato");

    grunt.registerTask("test", ["jshint", "jasmine"]);

    grunt.registerTask("default", ["test"]);
};
