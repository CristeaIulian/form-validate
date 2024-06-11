/*
Form Validate 0.1 under Angular
Requirements
	* jQuery v3.7.1 | (c) 2005, 2015 jQuery Foundation, Inc. | jquery.org/license
	* Bootstrap v3.3.4 (http://getbootstrap.com)
(c) 2006-2015 Memobit.ro
License: MIT
*/

'use strict';

angular.module('formValidate',
	[]
)
.directive('formValidate', function(){
	return {
		restrict: 'A',

		scope: false,

		controller:function($scope){

		},

	    link: function($scope, $element, $attrs, $controller) {

			$scope.FV = {
				errors : {
					header : {},
					popup : {},
				}
			};

	    	$scope.FV.init = function(){

				if (typeof $ == 'undefined'){
					$scope.FV.hasJquery = false;
					// $scope.FV.log('You should install jquery for a better UX experience, like animations, close modal on escape keypress');
					$scope.FV.log('Dependency requirement: JQuery.');
					return false;
				} else {
					$scope.FV.hasJquery = true;
				}

	    		if ($scope.FV.hasJquery){
					$(document).keyup(function(e) {
						if (e.keyCode == 27) {
							if ($('.form-validate-popup-fader').css('display') == 'block'){
								$scope.FV.errors.popup.hide();
							}
						}
					});
	    		}

		    	$element[0].onsubmit = function(event) {

		    		$scope.FV.validate(event);

		    		return false;
		    	}

		    	for (var i=0; i < $element[0].childElementCount; i++) {

		    		if (typeof $element[0][i] != 'undefined'){

						if ($element[0][i].nodeName == 'SELECT') {
				    		var onChangeElement = function(no){
					    		$element[0][no].onchange = function(event){
					    			$scope.FV.validate(event);
					    		}
				    		}

				    		onChangeElement(i);

						} else if ($element[0][i].nodeName == 'INPUT' && $element[0][i].type == 'radio') {
				    		var onClickElement = function(no){
					    		$element[0][no].onclick = function(event){
					    			$scope.FV.validate(event);
					    		}
				    		}

				    		onClickElement(i);

						} else {

				    		var onBlurElement = function(no){
					    		$element[0][no].onblur = function(event){
					    			$scope.FV.validate(event);
					    		}
				    		}

				    		onBlurElement(i);
						}
		    		}
		    	}
	    	}

	    	$scope.FV.getValidationRules = function($event){

	    		var validationData = [];

				var formElement = $event.target;

				var _childElementCount = ($event.type == 'submit') ? formElement.childElementCount : 1;

				for (var i=0; i < _childElementCount; i++) {

					var _currentformElement = ($event.type == 'submit') ? formElement[i] : formElement;

					var _message 		= null;
					var _ngModel 		= null;
					var _val 			= null;

					if ($event.type != 'submit' || typeof formElement[i] != 'undefined'){
						// get attributes and values that we need {
						for (var j=0; j < _currentformElement.attributes.length; j++){
							if (_currentformElement.attributes[j].name == 'validate'){
								_val = _currentformElement.attributes[j].value;
							}
							if (_currentformElement.attributes[j].name == 'validate-message'){
								_message = _currentformElement.attributes[j].value;
							}
							if (_currentformElement.attributes[j].name == 'ng-model'){
								_ngModel = _currentformElement.attributes[j].value;
							}
						}
						// get attributes and values that we need }


						// if has validate attribute get rules and their values {
						if (_val != null){

							validationData[i] = {
								message:(_message != null) ? _message : _ngModel,
								ngModel:_ngModel,
								value:_currentformElement.value,
								error:null,
								validations:[],
								nodeName:_currentformElement.nodeName,
								type:_currentformElement.type,
							};

							if (_val.indexOf(',') != -1){
								_val = _val.split(',');
							} else {
								_val = [_val];
							}

							for (var j=0; j<_val.length; j++){
								
								if (_val[j].indexOf(':') != -1){
									
									var t = _val[j].split(':');

									validationData[i].validations[t[0]] = t[1];

								} else {

									validationData[i].validations[_val[j]] = null;
								}
							}
						}
						// if has validate attribute get rules and their values }
					}
				}

				return validationData;
	    	}

	    	$scope.FV.validate = function($event) {

	    		var validationData = $scope.FV.getValidationRules($event);

	    		if (validationData == undefined){
	    			return false;
	    		}

	    		var formElement 			= ($event.type == 'submit') ? $event.target : [$event.target];
	    		var formElementAtributes 	= ($event.type == 'submit') ? $event.target.attributes : $event.target.form.attributes;

				var formValidateType = '';

				for (var attr in formElementAtributes){
					if (formElementAtributes[attr].nodeName == 'form-validate'){
						formValidateType = formElementAtributes[attr].value;
					}
				}

				// validate based on rules for all objects {
				for (var el in validationData) {

					validationData[el].value = formElement[el].value;

					// reset elements {
						$(formElement[el]).parent().find('.noticeError, .noticeSuccess').each(function(){
							$(this).remove();
						});

						$(formElement[el]).parent().parent().removeClass('has-success has-error');
		
						validationData[el].error = null;
					// reset elements }

					var _err = '';

					for (var ndx in validationData[el].validations) {
						switch (ndx){
							case 'mandatory':
								switch (validationData[el].nodeName){
									case 'SELECT':

										if ($scope[validationData[el].ngModel] == 0) {

											_err = validationData[el].message + ' field is mandatory';
											$scope.FV.message(_err, formElement[el]);
											validationData[el].error = _err;
										}
									break;
									case 'INPUT':
										switch (validationData[el].type){
											case 'text':
											case 'password':

												if ($scope.FV.empty($scope[validationData[el].ngModel])) {
													_err = validationData[el].message + ' field is mandatory';
													$scope.FV.message(_err, formElement[el]);
													validationData[el].error = _err;
												}
											break;
											case 'radio':
												if ($scope.FV.empty($scope[validationData[el].ngModel])) {
													_err = validationData[el].message + ' field is mandatory';
													$scope.FV.message(_err, formElement[el], 1);
													validationData[el].error = _err;
												}
											break;
											default:
												$scope.FV.log('Unknown object subtype or unallowed object.');
											break;
										}
									break;
									case 'TEXTAREA':
										if ($scope.FV.empty($scope[validationData[el].ngModel])) {
											_err = validationData[el].message + ' field is mandatory';
											$scope.FV.message(_err, formElement[el]);
											validationData[el].error = _err;
										}
									break;
									default:
										$scope.FV.log('Unknown object type ' + validationData[el].nodeName + '.');
									break;
								}
							break;
							case 'minlength': // as number of chars
								if (!$scope.FV.empty($scope[validationData[el].ngModel]) && validationData[el].error == null) {
								
									if (validationData[el].value.length < validationData[el].validations[ndx]){
										_err = validationData[el].message + ' must have at least ' + validationData[el].validations[ndx] + ' characters';
										$scope.FV.message(_err, formElement[el]);
										validationData[el].error = _err;
									}
								}
							break;
							case 'maxlength': // as number of chars
								if (!$scope.FV.empty($scope[validationData[el].ngModel]) && validationData[el].error == null) {
									if (validationData[el].value.length > validationData[el].validations[ndx]){
										_err = validationData[el].message + ' must have at most ' + validationData[el].validations[ndx] + ' characters';
										$scope.FV.message(_err, formElement[el]);
										validationData[el].error = _err;
									}
								}
							break;
							case 'min': // as number
								if (!$scope.FV.empty($scope[validationData[el].ngModel]) && validationData[el].error == null) {
									if (parseFloat(validationData[el].value) < validationData[el].validations[ndx]){
										_err = validationData[el].message + ' must be at least ' + validationData[el].validations[ndx];
										$scope.FV.message(_err, formElement[el]);
										validationData[el].error = _err;
									}
								}
							break;
							case 'max': // as number
								if (!$scope.FV.empty($scope[validationData[el].ngModel]) && validationData[el].error == null) {
									if (parseFloat(validationData[el].value) > validationData[el].validations[ndx]){
										_err = validationData[el].message + ' must be at most ' + validationData[el].validations[ndx];
										$scope.FV.message(_err, formElement[el]);
										validationData[el].error = _err;
									}
								}
							break;
							case 'integer':
								if (!$scope.FV.empty($scope[validationData[el].ngModel]) && validationData[el].error == null) {
									if (parseInt(validationData[el].value) != validationData[el].value){
										_err = validationData[el].message + ' must be an integer number';
										$scope.FV.message(_err, formElement[el]);
										validationData[el].error = _err;
									}
								}
							break;
							case 'float':
							case 'double':
								if (!$scope.FV.empty($scope[validationData[el].ngModel]) && validationData[el].error == null) {
									if (parseFloat(validationData[el].value) != validationData[el].value){
										_err = validationData[el].message + ' must be a float (double) number';
										$scope.FV.message(_err, formElement[el]);
										validationData[el].error = _err;
									}
								}
							break;
							case 'web':
								if (!$scope.FV.empty($scope[validationData[el].ngModel]) && validationData[el].error == null) {
			    					var re = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
			    					if (!re.test(validationData[el].value)){
			    						_err = validationData[el].message + ' is not a valid web address';
			    						$scope.FV.message(_err, formElement[el]);
			    						validationData[el].error = _err;
			    					}
		    					}
							break;
							case 'email':
								if (!$scope.FV.empty($scope[validationData[el].ngModel]) && validationData[el].error == null) {
			    					var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			    					if (!re.test(validationData[el].value)){
			    						_err = validationData[el].message + ' is not a valid email address';
			    						$scope.FV.message(_err, formElement[el]);
			    						validationData[el].error = _err;
			    					}
		    					}
							break;
							case 'ip':
								if (!$scope.FV.empty($scope[validationData[el].ngModel]) && validationData[el].error == null) {
			    					var re = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
			    					if (!re.test(validationData[el].value)){
			    						_err = validationData[el].message + ' is not a valid IP address';
			    						$scope.FV.message(_err, formElement[el]);
			    						validationData[el].error = _err;
			    					}
		    					}
							break;
							case 'match': // only for submit since here we do not have enough data

								if ($event.type == 'submit'){

									if (!$scope.FV.empty($scope[validationData[el].ngModel]) && validationData[el].error == null) {

										var _matchObject = validationData[el].validations.match;

										var _matchedObjectValue = null;
										var _matchedObjectMessage = null;

										for (var pointer in validationData){

											if (validationData[pointer].ngModel == _matchObject){
												_matchedObjectValue = validationData[pointer].value;
												_matchedObjectMessage = validationData[pointer].message;
											}
										}

										if (_matchedObjectValue != validationData[el].value){

											_err = validationData[el].message + ' must match ' + _matchedObjectMessage;
											$scope.FV.message(_err, formElement[el]);
											validationData[el].error = _err;

										}
									}
								}
							break;
							case 'must_have_specials':
								if (!$scope.FV.empty($scope[validationData[el].ngModel]) && validationData[el].error == null) {

									var specialCharacters = '~`!@#$%^&*()_-+=,<.>/?';
									var specialCharacterFound = false;

									for (var pointer = 0; pointer < specialCharacters.length; pointer++){
										if (validationData[el].value.indexOf(specialCharacters.charAt(pointer)) != -1){
											specialCharacterFound = true;
										}
									}

									if (!specialCharacterFound){
										_err = validationData[el].message + ' must contain special characters';
										$scope.FV.message(_err, formElement[el]);
										validationData[el].error = _err; // WARNING - MAY BE REMOVED - STILL KEPT FOR comatibility with validationForm when mixing
									}
								}
							break;
							default:
								$scope.FV.log('Unknown rule ' + ndx);
							break;
						}
					}
				}
				// validate based on rules for all objects }


				// set OK for non error objects {
				var _errors = [];

				var _hasErrors = false;
				for (var el in validationData) {

					if (validationData[el].error == null) {

						var _focusElement = ($event.type == 'submit') ? $event.target[el] : $event.target;

						switch (validationData[el].nodeName){
							case 'SELECT':
							case 'TEXTAREA':
								$scope.FV.message(null, _focusElement);
							break;
							case 'INPUT':
								switch (validationData[el].type){
									case 'text':
									case 'password':
										$scope.FV.message(null, _focusElement);
									break;
									case 'radio':
										$scope.FV.message(null, _focusElement, 1);
									break;
									default:
										$scope.FV.log('Unknown object subtype or unallowed object.');
									break;
								}
							break;
							default:
								$scope.FV.log('Unknown object type ' + validationData[el].nodeName + '.');
							break;
						}

					} else {

						_errors.push({error:validationData[el].error});
						
						_hasErrors = true;
					}
				}
				// set OK for non error objects }



				if ($event.type == 'submit') {
					// remove duplicate errors {
					var _uniqueErrors = [];

					for (el in _errors){

						var _errorAlreadyExist = false;
						
						for (ndx in _uniqueErrors){
							if (_uniqueErrors[ndx].error == _errors[el].error){
								_errorAlreadyExist = true;
							}
						}

						if (!_errorAlreadyExist){
							_uniqueErrors.push({error:_errors[el].error});
						}
					}
					_errors = _uniqueErrors;
					// remove duplicate errors }


					// take actions on submit {
					if (formValidateType == 'header'){
						if (_errors.length > 0){
							$scope.FV.errors.header.show(formElement, _errors);
						} else {
							$scope.FV.errors.header.hide(formElement);
						}
					}
					
					if (formValidateType == 'popup'){
						if (_errors.length > 0){
							$('.form-validate-popup').slideDown();
							$scope.FV.errors.popup.show(formElement, _errors);
						} else {
							$scope.FV.errors.popup.hide(formElement);
						}
					}

					$scope.onSubmit( (_hasErrors) ? false : true );

					$scope.$apply();
					// take actions on submit }
				}

				return false; // let user decide whatever he wants to do
	    	}

	    	$scope.FV.message = function(message, $element, afterElement) {

				var formValidateType = '';

				for (var attr in $element.form){
					if ($element.form.attributes[attr] != undefined){
						if ($element.form.attributes[attr]['form-validate'] != undefined){
							formValidateType = $element.form.attributes[attr]['form-validate'];
						}
						if ($element.form.attributes[attr].nodeName != undefined && $element.form.attributes[attr].nodeName == 'form-validate'){
							formValidateType = $element.form.attributes[attr].value;
						}
					}
				}

	    		if (formValidateType == 'inline'){

		    		afterElement = (afterElement == undefined) ? 0 : afterElement;

		    		switch (afterElement){
		    			case 0:
		    				var positionLeft = $element.clientWidth + ((message == null) ? 24 : 14);
		    				var paddingTop	 = 8;
		    				var _top = 'top:0px;';
		    			break;
		    			case 1:
		    				var positionLeft = $element.clientWidth + $($element).next().width() + ((message == null) ? 25 : 26);
		    				var paddingTop	 = 4;
		    				var _top = 'top:initial;';
		    			break;
		    			default:
		    				var positionLeft = $element.clientWidth + ((message == null) ? 24 : 26);
		    				var paddingTop	 = 8;
		    				var _top = 'top:0px;';

		    				$scope.FV.log('After element ' + afterElement + ' not allowed.');
		    			break;
		    		}

		    		if (message == null){ // is OK
		    			var _noticeInfo = '<div style="left: ' + positionLeft + 'px; ' + _top + '  padding-top:' + paddingTop + 'px;" class="glyphicon glyphicon-ok noticeSuccess"></div>';
		    		} else {
						var _noticeInfo = '\
							<div class="noticeError" style="left: ' + positionLeft + 'px; ' + _top + '">\
								<span class="glyphicon glyphicon-remove"></span> \
								' + message + '.\
							</div>';
		    		}

		    		var _classToAdd = (message == null) ? 'has-success' : 'has-error';

		    		angular.element($element).parent().parent().removeClass('has-success has-error').addClass(_classToAdd);

		    		switch (afterElement){
		    			case 0:
		    				angular.element($element).after(_noticeInfo);

							if ($scope.FV.hasJquery){
								$($element).next().fadeIn();
							} else {
								angular.element($element).next().css('display', 'block');
							}
		    			break;
		    			case 1:
		    				angular.element($element).next().after(_noticeInfo);

							if ($scope.FV.hasJquery){
								$($element).next().next().fadeIn();
								$($element).next().next().css('display','inline-block');
							} else {
								angular.element($element).next().next().css('display', 'inline-block');
							}
		    			break;
		    			default:
		    				$scope.FV.log('After element ' + afterElement + ' not allowed.');
		    			break;
		    		}
				}
	    	}

			$scope.FV.empty = function(str){
				return (typeof str == 'undefined' || str == '') ? true : false;
			}

	    	$scope.FV.log = function(message){
	    		console.log('Form Validate :: ' + message);
	    	}

	    	$scope.FV.errors.header.show = function(formElement, errors){
	    		
	    		var _errors = '';

	    		for (var el in errors){
	    			_errors += '<li style="padding-left:20px;">' + errors[el].error + '</li>';
	    		}

	    		var _mustShown = false;


	    		var objHeaderErrors;

	    		$(formElement).find('.form-validate-errors').each(function(){

	    			objHeaderErrors = $(this);

	    			if ($(this).html() == ''){
	    				_mustShown = true;
	    			}
	    		})

	    		var _object = '\
					<div class="alert alert-danger form-validate-errors-block" ' + (_mustShown ? 'style="display:none;"' : '') + ' >\
						The following errors where encountered:<br /><br />\
						<ul>\
							'+_errors+'\
						</ul>\
						<br />Please verify!\
					</div>\
				';

				$(objHeaderErrors).html(_object);

				if ($(objHeaderErrors).css('display')=='none'){
					$(objHeaderErrors).slideDown();
				}

	    		var objHeaderErrorsBlock;

	    		$(formElement).find('.form-validate-errors-block').each(function(){
	    			objHeaderErrorsBlock = $(this);
	    		})

				if ($(objHeaderErrorsBlock).css('display')=='none'){
					$(objHeaderErrorsBlock).slideDown();
				}
	    	};

	    	$scope.FV.errors.header.hide = function(formElement){

	    		$(formElement).find('.form-validate-errors').each(function(){
	    			$(this).slideUp();
	    		})
	    	};

	    	$scope.FV.errors.popup.show = function(formElement, errors){

	    		var _errors = '';

	    		for (var el in errors){
	    			_errors += '<li style="padding-left:20px;">' + errors[el].error + '</li>';
	    		}

	    		var _object = '\
					<div class="alert alert-danger" ng-show="FV.errors.length > 0">\
						<div class="glyphicon glyphicon-remove form-validate-btnClose" onclick="$(this).parent().parent().slideUp();$(\'.form-validate-popup-fader\').slideUp(function(){ $(\'.form-validate-popup-fader\').remove(); });"></div>\
						The following errors where encountered:<br /><br />\
						<ul>\
							'+_errors+'\
						</ul>\
						<br />Please verify!\
					</div>\
				';

	    		$(formElement).find('.form-validate-popup').each(function(){
	    			$(this).html(_object);
	    		})

				$('body').append('<div class="form-validate-popup-fader"></div>');
				$('.form-validate-popup-fader').slideDown();
	    	};

	    	$scope.FV.errors.popup.hide = function(formElement){

				$('.form-validate-popup').slideUp();

				$('.form-validate-popup-fader').slideUp(
					function(){
						$('.form-validate-popup-fader').remove();
					}
				);
	    	};

			$scope.FV.init();
	    }
	}
});