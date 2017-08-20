module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        // Watch task
        watch: {
            scripts: {
                files: 'public/styl/*.styl',
                tasks: ['stylus'],
            },
        },

        // Stylus Task
        stylus: {
            compile: {
                options: {
                },
                files: {
                    'public/css/style.css': 'public/styl/style.styl', // 1:1 compile \
                }
            }
        }

    });

    // Load tasks
    grunt.loadNpmTasks('grunt-contrib-stylus');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Default task(s).
    grunt.registerTask('default', ['stylus','watch']);

};
