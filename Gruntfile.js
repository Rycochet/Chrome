/*
 * Copyright © 2013-2015 Ryc O'Chet <rycochet@rycochet.com>, Released under the GPLv2.
 */
module.exports = function(grunt) {
	"use strict";

	var projects = [
		"Tabs to the Front",
		"FetLife+"
	];

	function append(pattern) {
		var i, arr = [];

		for (i = 0; i < projects.length; i++) {
			arr.push(projects[i] + "/" + pattern);
		}
		return arr;
	}

	function compressOptions() {
		var i, obj = {};

		for (i = 0; i < projects.length; i++) {
			obj[projects[i]] = {
				options: {
					archive: "build/" + projects[i] + ".zip"
				},
				files: [{
						expand: true,
						cwd: "build/" + projects[i] + "/",
						src: ["**"],
						dest: ""
					}]
			};
		}
		return obj;
	}

	// Reduce log spam quite considerably...
	var origLogHeader = grunt.log.header,
			origLogWriteln = grunt.log.writeln;

	grunt.log.header = function(msg) {
		if (/^Running "newer(-postrun)?:/.test(msg)) {
			grunt.verbose.header.apply(grunt.verbose, arguments);
		} else {
			origLogHeader.apply(this, arguments);
		}
		return this;
	};

	grunt.log.writeln = function(msg) {
		if (/^No newer files to process./.test(msg)) {
			grunt.verbose.writeln.apply(grunt.verbose, arguments);
		} else {
			origLogWriteln.apply(this, arguments);
		}
		return this;
	};

	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),
		uglify: {
			options: {
				compress: {
					drop_console: true
				}
			},
			build: {
				files: [{
						expand: true,
						src: append("**/*.js"),
						dest: "build/"
					}]
			}
		},
		htmlmin: {
			options: {
				removeComments: true,
				collapseWhitespace: true
			},
			build: {
				files: [{
						expand: true,
						src: append("**/*.html"),
						dest: "build/"
					}]
			}
		},
		cssmin: {
			options: {
				shorthandCompacting: false,
				roundingPrecision: -1
			},
			build: {
				files: [{
						expand: true,
						src: append("**/*.css"),
						dest: "build/"
					}]
			}
		},
		jsonmin: {
			build: {
				files: [{
						expand: true,
						src: append("**/*.json"),
						dest: "build/"
					}]
			}
		},
		copy: {
			build: {
				files: [{
						expand: true,
						src: append("**/*.png"),
						dest: "build/"
					}]
			}
		},
		watch: {
			build: {
				files: append("**"),
				tasks: ["default"],
				options: {
					spawn: false
				}
			}
		},
		compress: compressOptions()
	});

	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-contrib-htmlmin");
	grunt.loadNpmTasks("grunt-contrib-cssmin");
	grunt.loadNpmTasks("grunt-contrib-copy");
	grunt.loadNpmTasks("grunt-contrib-watch");
	grunt.loadNpmTasks("grunt-contrib-compress");
	grunt.loadNpmTasks("grunt-jsonmin");
	grunt.loadNpmTasks("grunt-newer");

	grunt.registerTask("default", [
		"newer:uglify",
		"newer:htmlmin",
		"newer:cssmin",
		"newer:jsonmin",
		"newer:copy"
	]);

	grunt.registerTask("build", [
		"default",
		"compress"
	]);
};
