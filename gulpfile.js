'use strict';
    var gulp = require('gulp');
    var nodemon = require("gulp-nodemon");

    //nodemon : server 시작 및 소스 파일 변경시 자동 재시작
    gulp.task('server-dev', function () {
      nodemon({
        script: 'index.js',
        watch: ['index.js', './server/']
      , ext: 'js html'
      , env: { 'NODE_ENV': 'development' }
      })
    });

    gulp.task('default', ['server-dev']);
