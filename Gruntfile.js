module.exports = function(grunt) {

    grunt.initConfig({
      responsive_images: {
        dev: {
          options: {
            engine: 'im',
            sizes: [
                {
                    name: '',
                    width: '320',
                    suffix: '-small',
                    quality: 20
                },
                {
                    name: '',
                    width: '640',
                    suffix: '-med',
                    quality: 20
                },
                {
                    name: '',
                    width: '1024',
                    suffix: '-1x',
                    quality: 20
                },
                {
                    name: '',
                    width: 1600,
                    suffix: '-2x',
                    quality: 30
                }
            ]
          },
          files: [{
            expand: true,
            src: ['*.{gif,jpg,png}'],
            cwd: 'img/',
            dest: 'img/'
          }]
        }
      },
    });
  
    grunt.loadNpmTasks('grunt-responsive-images');
    grunt.registerTask('default', ['responsive_images']);
  
  };
  // ref: https://addyosmani.com/blog/generate-multi-resolution-images-for-srcset-with-grunt/