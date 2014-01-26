module.exports = function(config){
  config.set({
    basePath : '../',

    files : [
      'app/components/angular/angular.js',
      'app/components/angular-*/angular-*.js',
      'test/lib/angular/angular-mocks.js',
      'app/scripts/controllers.js',
      'app/scripts/**/*.js',
      'test/unit/**/*.js'
    ],

    exclude : [
      'app/components/angular/angular-loader.js',
      'app/components/angular/*.min.js',
      'app/components/angular/angular-scenario.js'
    ],

    autoWatch : true,

    frameworks: ['jasmine'],

    browsers : ['Chrome'],

    plugins : [
      'karma-junit-reporter',
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-jasmine'
    ],

    junitReporter : {
      outputFile: 'test_out/unit.xml',
      suite: 'unit'
    }

  })}