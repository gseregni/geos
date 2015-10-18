angular.module('firebase.config', [])
  .constant('FBURL', 'https://skeleton-firebase.firebaseio.com')
  .constant('SIMPLE_LOGIN_PROVIDERS', ['anonymous'])

  .constant('loginRedirectPath', '/login');
