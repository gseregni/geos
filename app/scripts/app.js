"use strict";

/**
 * @ngdoc overview
 * @name geosApp
 * @description
 * # geosApp
 *
 * Main module of the application.
 */

 alert("boot");
angular.module("geosApp", [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'firebase',
    'firebase.ref',
    'firebase.auth',
    'uiGmapgoogle-maps'
  ]);
