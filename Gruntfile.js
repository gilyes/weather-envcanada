'use strict';

module.exports = function(grunt) {
    require('jit-grunt')(grunt, {});

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        mochaTest: {
            options: {
                reporter: 'spec',
                timeout: 10000
            },
            src: ['test/**/*.test.js']
        },

        watch: {
            js: {
                options: {
                    spawn: true,
                    interrupt: true,
                    debounceDelay: 250
                },
                files: ['Gruntfile.js', 'lib/**/*.js', 'test/**/*.test.js'],
                tasks: ['mochaTest']
            }
        }
    });

    grunt.registerTask('test', function(target) {
        return grunt.task.run(['mochaTest']);
    });

    grunt.registerTask('default', [
        'test',
        'watch'
    ]);
};