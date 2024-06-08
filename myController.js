myApp.controller('myController', function($scope) {
	$scope.myVar = 'test';

	$scope.cities = {
		0:'-- select city --',
		1:'New York',
		2:'Tokyo',
		3:'Real Madrid',
	};

	$scope.city = '0';

	$scope.open = function($event) {
		$event.preventDefault();
		$event.stopPropagation();

		$scope.opened = true;
	};

	$scope.onSubmit = function(validaForm){

		if (validaForm){
			console.log('Hurray! Now you can do whatever you like.')
		}
		console.log('Controller - Valid form :: ' + validaForm);
	}


});