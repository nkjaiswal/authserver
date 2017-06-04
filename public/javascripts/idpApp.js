var app = angular.module('idpApp', ['ngRoute']);
app.config(function($routeProvider){
	$routeProvider
		.when('/', {
			templateUrl: 'login.html',
			controller: 'loginController'
		})
});

app.controller('loginController', function($scope, $http){
	$scope.user = {username: '', password: ''};
	$scope.error_message = '';

	$scope.login = function(){
		var redirectUri = window.location.href.split("?")[1]? window.location.href.split("?")[1] : null;
		$scope.error_message = redirectUri;
		var auth = btoa($scope.user.username + ":" + $scope.user.password), 
	    headers = {"Authorization": "Basic " + auth};
		$http.get("/oauth/authenticate", {headers: headers}).then(function (response){
			$scope.error_message = 'Login successfully, redirecting you to your app.'
			var token = response.data.token;
			window.location.href = "/callback?" + redirectUri + "&token=" + token;
		},function(errer){
			$scope.error_message = 'Please check your username and password.'
		});
	};
});