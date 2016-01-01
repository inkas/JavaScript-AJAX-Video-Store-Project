$.support.cors = true;
var serviceRootUrl = "http://js-video-stores.apphb.com/api/stores/";
var pageNum = 0;
var videoLibrariesPerPageInput = 10;
var mathAnswer;
var rentOrReturn;

function onDocumentReady() {
	$('#home-btn').on('click', homeContent);
	$('#home-btn').click();
	$('#video-nav-btn').on('click', onVideoLibraryClick);
	$('#categories-nav-btn').on('click', onCategoryClick);
	$('#actors-nav-btn').on('click', onActorsClick);
	$('#register-nav-btn').on('click', onRegisterFormClick);
	$('#about').on('click', onAboutClick);
	//check if cookies exist
	if (($.cookie('uName') !== null) && ($.cookie('uPass') !== null)) {
		refreshCookie();
		checkActivity();
		loggedUserPanel();
	}
	scrollToTop();
}

function scrollToTop() {
	$('.scroll-top').on('click', function(e) {
		$('html,body').animate({scrollTop:0}, 300, 'swing');
		return false;
	});
}

/* Pagination and Home Content */
function homeContent() {
	$('#main-nav li').removeClass('current');
	$('#home-btn').parent().addClass('current');
	performGetRequest(serviceRootUrl + 'page' + pageNO() + videoLibraryCount(), onVideoLibrariesPerPageLoadSuccess, videoLibrariesErrorMessage);
}

function pageNO() {
	var pageNo = '?page=';
	pageNo += pageNum;
	return pageNo;
}

function videoLibraryCount() {
	var count = '&count=';
	var videoLibrariesInputText = document.getElementsByName('librariesPerPageInput')[0];
	//check if input exists
	if ((typeof(videoLibrariesInputText) != 'undefined') && (videoLibrariesInputText != null)) {
		if (!isNaN(videoLibrariesInputText.value)) {
			videoLibrariesPerPageInput = videoLibrariesInputText.value;
			count += parseInt(videoLibrariesPerPageInput, 10);			
		}
	}
	else {
		count += videoLibrariesPerPageInput;
	}
	return count;
}

function onVideoLibrariesPerPageLoadSuccess(videoLibraries) {
	var videoLibrariesPerPageHTML = '';
	
	for (var i=0; i<videoLibraries.length; i++) {
		videoLibrariesPerPageHTML +=
			'<h2>' +
				'<a href="#" title="' + videoLibraries[i].title + '" data-id="' + videoLibraries[i].id + '">' +
					videoLibraries[i].title +
				'</a>' +
			'</h2>';
	}
	
	//Pagination
	videoLibrariesPerPageHTML +=
		'<div class="pagination">' +
			'<form method="get" action="#" >' +
				'<span>Video Libraries per page:</span>' +
				'<input value="' + videoLibrariesPerPageInput + '" type="number" name="librariesPerPageInput" />' +
				'<button>GO</button>' +
			'</form>' +
		'</div>';
	
	document.getElementById('container').innerHTML = videoLibrariesPerPageHTML;
	//append pagination
	getPagesCount();

	$('.pagination button').on('click', function(e) {
		e.preventDefault();
		homeContent();
	});
	$('#container h2 a').on('click', onVideoLibraryTitleClick);
}
/* End of Pagination and Home Content */

/* Video Libraries Count Per Page */
function getPagesCount(e) {
	performGetRequest(serviceRootUrl + 'pages-count?size=' + videoLibrariesPerPageInput,
	onGetPagesCountSuccess, errorMessage);
}

function onGetPagesCountSuccess(pagesCount) {
	var generatePaginationButtons =
		'<ul class="pagination-numbers-list clear">' +
			'<li>' +
				'<a href="#" title="">' +
					'&#171;' +
				'</a>' +
			'</li>';
	for (var i=1; i<=pagesCount.pages; i++) {
		generatePaginationButtons +=
			'<li>' +
				'<a href="#" title="">' +
					i +
				'</a>' +
			'</li>';
	}
	generatePaginationButtons +=
		'<li>' +
			'<a href="#" title="">' +
				'&#187;' +
			'</a>' +
		'</li>' +				
	'</ul>';
	$('.pagination').prepend(generatePaginationButtons);

	//Add class "currentpage" to active page
	var totalLengthOfPagination = $('.pagination-numbers-list li').length;
	if (totalLengthOfPagination > 2) {
		$('.pagination-numbers-list li:eq(' + (pageNum+1) + ') a').addClass('currentpage');
		
		$('.pagination-numbers-list li a').on('click', function (e) {
			if ($(this).parent().is(':first-child')) {
				pageNum = 0;
			}
			else if ($(this).parent().is(':last-child')) {
				pageNum = ($(this).parent().index())-2;
			}
			else {
				pageNum = $(this).text()-1;
			}
			homeContent();
			return false;
		});
	}
}
/* End of Video Libraries Count Per Page */

/* All Video Libraries */
function onVideoLibraryClick(e) {
	$('#main-nav li').removeClass('current');
	$('#video-nav-btn').parent().addClass('current');
	document.getElementById('container').innerHTML = '<div class="loading"></div>';
	performGetRequest(serviceRootUrl + 'all', onVideoLibraryLoadSuccess, errorMessage);
}

function onVideoLibraryLoadSuccess(library) {
	var videoLibraryListHTML = "";
	document.getElementById('container').innerHTML = "";
	function videoLibraryListHTMLLoop(i) {
		var listing_html =
			'<h2>' +
				'<a href="#" title="' + library[i].title + '" data-id="' + library[i].id + '">' +
					library[i].title +
				'</a>' +
			'</h2>';
		return listing_html;
	}
	var place_to_append = document.getElementById('container');
	infinityScroll(library, place_to_append, videoLibraryListHTMLLoop);
	$('#container').on('click', 'h2 a', onVideoLibraryTitleClick);
}
/* End of All Video Libraries */

/* Detailed Information About Video Library */
function onVideoLibraryTitleClick(e) {
	$('#main-nav li').removeClass('current');
	$('#video-nav-btn').parent().addClass('current');
	document.getElementById('container').innerHTML = '<div class="loading"></div>';
	performGetRequest(serviceRootUrl + 'info/' + $(this).data("id"), onVideoLibraryTitleSuccess, errorMessage);
}

function onVideoLibraryTitleSuccess(video) {
	var videoLibraryInfoHTML = '<h2 data-id="' + video.id + '">' + video.title + '</h2><ul></ul>';
	document.getElementById('container').innerHTML = videoLibraryInfoHTML;

	var videoLibraryMovies = video.movies;
	function videoLibraryInfoHTMLLoop(i) {
		var listing_html =
			'<li>' +
				'<h3 class="clear"><span class="icons video-library video-icon"></span>' +
					'<a href="#" title="' + videoLibraryMovies[i].title + '" data-id="' + videoLibraryMovies[i].id + '">' +
						videoLibraryMovies[i].title +
					'</a>' +
				'</h3>' +
				'<h4 class="clear"><span class="icons publish-date"></span>' +
					videoLibraryMovies[i].publishDate +
				'</h4>' +
				'<p>' +
					videoLibraryMovies[i].description +
				'</p>' +
			'</li>';
		return listing_html;
	}
	var place_to_append = document.getElementById('container').getElementsByTagName('ul')[0];
	infinityScroll(videoLibraryMovies, place_to_append, videoLibraryInfoHTMLLoop);
	$('#container').on('click', 'li h3 a', onMovieClick);
}
/* End Detailed Information About Video Library */

/* Detailed Information About Movie */
function onMovieClick(e) {
	$('#main-nav li').removeClass('current');
	$('#video-nav-btn').parent().addClass('current');
	document.getElementById('container').innerHTML = '<div class="loading"></div>';
	performGetRequest(serviceRootUrl + 'movie-info/' + $(this).data("id"), onMovieLoadSuccess, errorMessage);
}

function onMovieLoadSuccess(movie) {
	var movieHTML = 
		'<h2 data-id="' + movie.id + '">' + movie.title + '</h2>' +
			'<h4 class="clear"><span class="icons publish-date"></span>' +
				movie.publishDate +
			'</h4>' +
			'<p>' +
				movie.description +
			'</p>' +
			'<div id="rentPanel" class="clear">' +
				'<a href="#" title="Rent ' + movie.title + '" class="rent-a-movie">' +
					'<span class="icons rent"></span>' +
					'Rent' +
				'</a>' +
				'<a href="#" title="Return ' + movie.title + '" class="return-a-movie">' +
					'<span class="icons return"></span>' +
					'Return' +
				'</a>' +
			'</div>';

			if (($.cookie('uName') === null) && ($.cookie('uPass') === null)) {
				movieHTML +=
				'<aside class="login-holder clear">' +
					'<form id="loginForm" class="forms" method="post" action="#">' +
						'<ul class="clear">' +
							'<li class="clear">' +
								'<label for="username">Username</label>' +
								'<input id="username" type="text" name="username" placeholder="username" />' +
							'</li>' +
							'<li class="clear">' +
								'<label for="password">Password</label>' +
								'<input id="password" type="password" name="password" placeholder="password" />' +
							'</li>' +
							'<li class="clear">' +
								'<button>' +
									'<span class="icons login-btn"></span>' +
									'Login' +
								'</button>' +
								'<p>' +
									'Not a member?' +
									'<a class="register">Click here</a>' +
								'</p>' +
							'</li>' +
						'</ul>' +
					'</form>' +
					'<span class="icons close-btn"></span>' +
				'</aside>';
			}
			
			movieHTML += 
				'<hr/>' +
				'<section id="actors">' +
					'<span class="icons actors"></span>' +
					'<strong>Actors</strong>' +
					'<br/>';

	var actor, store, category;
	var movieActorsListHTML='';
	var movieStoresListHTML='';
	var movieCategoriesListHTML='<ul class="categories-actors-list">';
	
	for (var i=0; i<movie.actors.length; i++) {
		actor = movie.actors[i];
		movieActorsListHTML +=
			'<a href="#" title="' + actor.firstName + ' ' + actor.lastName + '" data-id="' + actor.id + '">' +
				actor.firstName + ' ' + actor.lastName +
			'</a>';
		(i < movie.actors.length-1) ? movieActorsListHTML += ", " : "";
	}

	for (var j=0; j<movie.stores.length; j++) {
		store = movie.stores[j];
		movieStoresListHTML +=
			'<a href="#" title="' + store.title + '" data-id="' + store.id + '">' +
				store.title +
			'</a>';
		(j < movie.stores.length-1) ? movieStoresListHTML += ", " : "";
	}

	for (var k=0; k<movie.categories.length; k++) {
		category = movie.categories[k];
		movieCategoriesListHTML +=
			'<li>' +
				'<div class="listing-dashed-border clear">' +
					'<a href="#" title="' + category.name + '" data-id="' + category.id + '">' +
						category.name +
					'</a>' +
				'</div>' +
			'</li>';
	}

	movieHTML += 
			movieActorsListHTML +
		'</section>' +
		'<section id="stores">' +
			'<span class="icons video-library"></span>' +
			'<strong>Stores</strong>' +
			'<br/>' +
			movieStoresListHTML +
		'</section>' +
		'<section id="categories">' +
			'<span class="icons categories">' +
			'</span><strong>Categories</strong>' +
			'<br/>' +
			movieCategoriesListHTML + 
			'</ul>' +
		'</section>';
				
	document.getElementById('container').innerHTML = movieHTML;
	$('#stores a').on('click', onVideoLibraryTitleClick);
	$('#actors a').on('click', onActorInfoClick);
	$('#categories a').on('click', onSpecificCategoryClick);
	
	//Rent or return movie
	//rent button is true, return button is false
	$('.rent-a-movie, .return-a-movie').click(function(e) {
		$('#successfulRentReturnArea').slideUp(500, function() {
			$(this).remove();
		});
		if (($.cookie('uName') === null) && ($.cookie('uPass') === null)) {
			$('.login-holder').slideUp(500);
			$('.login-holder').slideDown(500);
			$('#loginForm input:first').focus();
			if ($(this).is('.rent-a-movie')) {
				rentOrReturn = true;
			}
			else {
				rentOrReturn = false;
			}
		}
		else {
			var username_cookie = $.cookie('uName');
			var pass_cookie = $.cookie('uPass');
			var movieId = $('#container h2').data('id');

			var userDataAndMovie = new collectUserDataAndMovieIdWithCookie(username_cookie, pass_cookie, movieId);
			var userDataAndMovieId = userDataAndMovie.collectData();

			if ($(this).is('.rent-a-movie')) {
				rentMovieRequestWithCookies(userDataAndMovieId);
			}
			else {
				returnMovieRequestWithCookies(userDataAndMovieId);
			}
		}
		return false;
	});
	
	$('.close-btn').on('click',function() {
		rentOrReturn = false;
		$('.login-holder').slideUp(500);
	});
	
	$('.register').on('click', onRegisterFormClick);
	$('#loginForm button').on('click', onLoginButtonClick);
}
/* End of Detailed Information About Movie */

/* All Categories */
function onCategoryClick(e) {
	$('#main-nav li').removeClass('current');
	$('#categories-nav-btn').parent().addClass('current');
	document.getElementById('container').innerHTML = '<div class="loading"></div>';
	performGetRequest(serviceRootUrl + 'categories', onCategorySuccess, errorMessage);
}

function onCategorySuccess(categories) {
	var categoryListHTML = 
		'<h2>Categories</h2>' +
		'<ul class="categories-actors-list"></ul>';
	document.getElementById('container').innerHTML = categoryListHTML;
	function categoryListHTMLLoop(i) {
		var listing_html =
			'<li>' +
				'<div class="listing-dashed-border clear">' +
					'<span class="icons categories"></span>' +
					'<a href="#" title="' + categories[i].name + '" data-id="' + categories[i].id + '">' +
						categories[i].name +
					'</a>' +
				'</div>' +
			'</li>';
		return listing_html;
	}
	var place_to_append = document.getElementById('container').getElementsByTagName('ul')[0];
	infinityScroll(categories, place_to_append, categoryListHTMLLoop);
	hoverEffects();
	$('.categories-actors-list').on('click', 'li a', onSpecificCategoryClick);
}
/* End of All Categories */

/* Detailed Information About Category */
function onSpecificCategoryClick(e) {
	$('#main-nav li').removeClass('current');
	$('#categories-nav-btn').parent().addClass('current');
	document.getElementById('container').innerHTML = '<div class="loading"></div>';
	performGetRequest(serviceRootUrl + 'category-info/' + $(this).data("id"), onSpecificCategoryLoadSuccess, errorMessage);
}

function onSpecificCategoryLoadSuccess(category) {
	var categoryInfo = 
		'<h2 data-id="' + category.id + '">' +
			category.name +
		'</h2>' +
		'<ul></ul>';
	document.getElementById('container').innerHTML = categoryInfo;
	
	var categoryMovies = category.movies;
	function categoryInfoHTMLLoop(i) {
		var listing_html =
			'<li>' +
				'<h3 class="clear">' +
					'<span class="icons video-library video-icon"></span>' +
					'<a href="#" data-id="' + categoryMovies[i].id + '" title="' + categoryMovies[i].title + '">' +
						categoryMovies[i].title +
					'</a>' +
				'</h3>' +
				'<h4 class="clear">' +
					'<span class="icons publish-date"></span>' +
					categoryMovies[i].publishDate +
				'</h4>' +
				'<p>' +
					categoryMovies[i].description +
				'</p>' +
			'</li>';
		return listing_html;
	}
	var place_to_append = document.getElementById('container').getElementsByTagName('ul')[0];
	infinityScroll(categoryMovies, place_to_append, categoryInfoHTMLLoop);
	$('#container').on('click', 'li h3 a', onMovieClick);
}
/* End of Detailed Information About Category */

/* All Actors */
function onActorsClick(e) {
	$('#main-nav li').removeClass('current');
	$('#actors-nav-btn').parent().addClass('current');
	document.getElementById('container').innerHTML = '<div class="loading"></div>';
	performGetRequest(serviceRootUrl + 'actors', onActorsLoadSuccess, errorMessage);
}

function onActorsLoadSuccess(actors) {
	var actorsListHTML = '<h2>Actors</h2><ul class="categories-actors-list"></ul>';
	document.getElementById('container').innerHTML = actorsListHTML;
	function actorsListHTMLLoop(i) {
		var listing_html =
			'<li>' +
				'<div class="listing-dashed-border clear">' +
					'<span class="icons actors"></span>' +
					'<a href="#" title="' + actors[i].firstName + ' ' + actors[i].lastName + '" data-id="' +  actors[i].id + '">' +
						 actors[i].firstName + ' ' +  actors[i].lastName +
					'</a>' +
				'</div>' +
			'</li>';
		return listing_html;
	}
	
	var place_to_append = document.getElementById('container').getElementsByTagName('ul')[0];
	infinityScroll(actors, place_to_append, actorsListHTMLLoop);
	hoverEffects();
	$('.categories-actors-list').on('click', 'a', onActorInfoClick);
}
/* End of All Actors */

/* Detailed Information About Actor */
function onActorInfoClick(e) {
	$('#main-nav li').removeClass('current');
	$('#actors-nav-btn').parent().addClass('current');
	document.getElementById('container').innerHTML = '<div class="loading"></div>';
	performGetRequest(serviceRootUrl + 'actor-info/' + $(this).data("id"), onActorInfoClickLoadSuccess, errorMessage);
}

function onActorInfoClickLoadSuccess(actor) {
	var receivedMovieList = actor.movies;
	var actorInfoHTML =
		'<h2 data-id="' + actor.id + '">' +
			actor.firstName + ' ' + actor.lastName +
		'</h2>' +
		'<ul></ul>';
	document.getElementById('container').innerHTML = actorInfoHTML;

	function specificActorMainLoop(i) {
		var listing_html =
			'<li>' +
				'<h3 class="clear">' +
					'<span class="icons video-library video-icon"></span>' +
					'<a href="#" title="' + receivedMovieList[i].title + '" data-id="' + receivedMovieList[i].id + '">' +
						receivedMovieList[i].title +
					'</a>' +
				'</h3>' +
				'<h4 class="clear">' +
					'<span class="icons publish-date"></span>' +
					receivedMovieList[i].publishDate +
				'</h4>' +
				'<p>' +
					receivedMovieList[i].description +
				'</p>' +
			'</li>';
		return listing_html;
	}

	var place_to_append = document.getElementById('container').getElementsByTagName('ul')[0];
	infinityScroll(receivedMovieList, place_to_append, specificActorMainLoop);
	$('#container').on('click', 'li h3 a', onMovieClick);
}
/* End of Detailed Information About Actor */

//Hover effects on categories and actor names
function hoverEffects() {
	//Save current "<a>" tag colour of unordered list with class="categories-actors-list"
	var originalActorNameColor = $(".categories-actors-list li div > a").css("color");
	$(".categories-actors-list").on('mouseover', 'li div > a', function() {
		$(this).animate({paddingLeft: "15px", color: "#06aacd"}, 80);
	}).on('mouseout', 'li div > a', function() {
		$(this).animate({paddingLeft: "-=15px", color: originalActorNameColor});
	});
}

/* Login and rent/return */
function onLoginButtonClick(e) {
	e.preventDefault();
	var form = document.getElementById('loginForm');
	var username = form.username.value;
	var pass = form.password.value;
	var movieId = $('#container h2').data('id');

	if (validateLoginForm(form)) {
		var getUserData = new collectUserData(username, pass);
		var userData = getUserData.collect();
		var getUserDataAndMovieId = new collectUserDataAndMovieId(username, pass, movieId);
		var userDataAndMovieId = getUserDataAndMovieId.collectDataAndMovieId();
		if (rentOrReturn) {
			rentMovieRequest(userDataAndMovieId, userData);
		}
		else {
			returnMovieRequest(userDataAndMovieId, userData);
		}
	}
}

function rentMovieRequest(userDataAndMovieId, userData) {
	performPostRequest(serviceRootUrl + 'rent-movie', userDataAndMovieId, function (){
		onMovieRentSuccess(userData);
	}, errorMessage);
}

function returnMovieRequest(userDataAndMovieId, userData) {
	performPostRequest(serviceRootUrl + 'return-movie', userDataAndMovieId, function (){
		onMovieReturnSuccess(userData);
	}, errorMessage);
}
//movie requests usin cookies
function rentMovieRequestWithCookies(userDataAndMovieId) {
	performPostRequest(serviceRootUrl + 'rent-movie', userDataAndMovieId, onMovieRentWithCookiesSuccess, errorMessage);
}
function returnMovieRequestWithCookies(userDataAndMovieId) {
	performPostRequest(serviceRootUrl + 'return-movie', userDataAndMovieId, onMovieReturnWithCookiesSuccess, errorMessage);
}
//renting messages
function onMovieRentWithCookiesSuccess() {
	var stat = 'rented';
	var successMsg = new rentOrReturnSuccessMsg(stat);
	successMsg.rentOrReturnMsg();
}
function onMovieReturnWithCookiesSuccess() {
	var stat = 'returned';
	var successMsg = new rentOrReturnSuccessMsg(stat);
	successMsg.rentOrReturnMsg();
}

function onMovieRentSuccess(userData) {
	$('.login-holder').slideUp(500);
	setCookie(userData);
	var stat = 'rented';
	var successMsg = new rentOrReturnSuccessMsg(stat);
	successMsg.rentOrReturnMsg();
}

function onMovieReturnSuccess(userData) {
	$('.login-holder').slideUp(500);
	setCookie(userData);
	var stat = 'returned';
	var successMsg = new rentOrReturnSuccessMsg(stat);
	successMsg.rentOrReturnMsg();
}

function rentOrReturnSuccessMsg(status) {
	var that = this;
	this.movieTitle = document.getElementsByTagName('h2')[0].innerHTML;
	this.status = status;
	this.rentOrReturnMsg = function() {
		var msg =
			'<aside id="successfulRentReturnArea">' +
				'<span class="icons close-btn"></span>' +
				'<span class="icons accepted success-reg"></span>' +
				'The movie <strong>' + that.movieTitle + '</strong> was successfully ' + that.status + '.' +
			'</aside>';
		$('#rentPanel').after(msg);
		showRentReturnInfo();
	}
}

function showRentReturnInfo() {
	$('#successfulRentReturnArea').hide().slideDown(500);
	$('#successfulRentReturnArea .close-btn').on('click', function() {
		var parent = $(this).parent();
		parent.slideUp(500, function() {
			parent.remove();
		});
	});
}
/* End of Login and rent/return */

//Check user activity
function checkActivity() {
	var time = new Date().getTime();
	$(document.body).on('mousemove keypress', function(e) {
		time = new Date().getTime();
	});
	var timeout;
	//Minutes to check if the user was active
	var mins = 30;
	var activeTime = mins*60*1000;
	
	function checkUserActivity() {
		//check if user was active last 30 minutes
		if(new Date().getTime() - time >= activeTime) {
			deleteCookie();
			var loggedUserPanel = document.getElementById('userPanel');
			loggedUserPanel.parentNode.removeChild(loggedUserPanel);
			clearTimeout(timeout);
			window.location.reload(true);
		}
		else {
			refreshCookie();
			timeout = setTimeout(checkUserActivity, 1000);
		}
	}
	timeout = setTimeout(checkUserActivity, 1000);
}

//Set cookie
function setCookie(userData) {
	var expDate = new Date();
	var minutes = 30;
	expDate.setTime(expDate.getTime() + (minutes*60*1000));
	$.cookie('uName', userData.username, {expires: expDate, path: '/'});
	$.cookie('uPass', userData.authCode, {expires: expDate, path: '/'});
	loggedUserPanel();
	checkActivity();
}

//Refresh cookie
function refreshCookie() {
	var current_cookie_username = $.cookie('uName');
	var current_cookie_password = $.cookie('uPass');
	deleteCookie();
	var expDate = new Date();
	var minutes = 30;
	expDate.setTime(expDate.getTime() + (minutes*60*1000));
	$.cookie('uName', current_cookie_username, {expires: expDate, path: '/'});
	$.cookie('uPass', current_cookie_password, {expires: expDate, path: '/'});
}

//Delete cookie
function deleteCookie() {
	$.cookie('uName', null, {path:'/'});
	$.cookie('uPass', null, {path:'/'});
}

/* User Registration */
function onRegisterFormClick() {
	$('#main-nav li').removeClass('current');
	$('#register-nav-btn').parent().addClass('current');
	
	var registrationForm = 
		'<form id="regForm" class="forms" method="#" action="#">' +
			'<ul class="clear">' +
				'<li class="clear">' +
					'<label for="regUsername">Username</label>' +
					'<input id="regUsername" type="text" name="regUsername" placeholder="username" />' +
					'<span class="required-field">&#42;</span>' +
				'</li>' +
				'<li class="clear">' +
					'<label for="regPassword">Password</label>' +
					'<input id="regPassword" type="password" name="regPassword" placeholder="password" />' +
					'<span class="required-field">&#42;</span>' +
				'</li>' +
				'<li class="clear">' +
					'<label for="repeatedPassword">Repeat password</label>' +
					'<input id="repeatedPassword" type="password" name="repeatedPassword" placeholder="password" />' +
					'<span class="required-field">&#42;</span>' +
				'</li>' +
				'<li class="clear">' +
					'<label id="calc" for="calcQuestion">' +
						'<span class="icons calc-icon"></span>' +
					'</label>' +
					'<input id="calcQuestion" type="text" name="calcQuestion" />' +
					'<span class="required-field">&#42;</span>' +
				'</li>' +
				'<li class="clear">' +
					'<button>Register</button>' +
				'</li>' +
			'</ul>' +
		'</form>';

	document.getElementById('container').innerHTML = registrationForm;
	var x = parseInt(10*Math.random()),
	y = parseInt(10*Math.random()),
	question = '(' + x + ' + ' + y + ') = ?';
	mathAnswer = x+y;
	$('label[for="calcQuestion"]').append(question);
	$('#regForm input:first').focus();
	
	var username = $('#regUsername');
	var pass = $('#regPassword');
	var repeatPass = $('#repeatedPassword');
	showInvalidInputs(username, pass, repeatPass);
	$('#regForm button').on('click', onRegisterButtonClick);
}

function onRegisterButtonClick(e) {
	e.preventDefault();
	$('#main-nav li').removeClass('current');
	$('#register-nav-btn').parent().addClass('current');
	var form = document.getElementById('regForm');
	var username = form.regUsername.value;
	var pass = form.regPassword.value;

	if (validateForm(form, mathAnswer)) {
		var userData = new collectUserData(username, pass);
		var user = userData.collect();
		var registeredUser = user.username;
		document.getElementById('container').innerHTML = '<div class="loading"></div>';
		performPostRequest(serviceRootUrl + 'register-user', user, function() {
			onRegisterSuccess(registeredUser);
		}, errorMessage);
	}
}

function onRegisterSuccess(registeredUser) {
	var congratsMsg =
		'<div class="successfulRegistration">' +
			'<span class="icons accepted success-reg"></span>' +
			'Congratulations! The username <strong>' + registeredUser + '</strong> was registered successfully.' +
			'<br/>' +
			'You will be redirected in <span id="redirectTimeout"></span> seconds.' +
		'</div>';
	
	document.getElementById('container').innerHTML = congratsMsg;

	//Counter for redirecting user after registration
	var count = 8;
	var counter = setInterval(timer, 1000);
	function timer() {
		count--;
		if (count <= 0) {
			clearInterval(counter);
			window.location.reload(true);
		}
		document.getElementById('redirectTimeout').innerHTML = count;
	}
}
/* End of User Registration */

/* Form Validations */
//Indicate inputs with wrong content
function showInvalidInputs(username, pass, repeatPass) {
	var acceptedInput = '<span class="icons accepted"></span>';
	var usernameWarningMsg = '<strong class="warning">The username should be 4 to 30 characters long, starting with a letter.</strong>';
	var passwordWarningMsg = '<strong class="warning">The password should be 6 to 20 characters long</strong>';
	var passwordsDontMatchMsg = "<strong class='warning'>Entered passwords don't match</strong>";
	
	//Username input
	username.blur(function() {
		if ($(this).val().length == 0) {
			$(this).css('background', '#fff');
			$(this).siblings('.accepted').remove();
			$(this).siblings('.warning').remove();
		}
		else if (isNaN($(this).val().charAt(0))) {
			if (($(this).val().length < 4) || ($(this).val().length > 30)) {
				$(this).css('background', '#ff7575');
				$(this).siblings('.accepted').remove();
				if ($(this).siblings('.warning').length == 0) {
					$(this).parent().append(usernameWarningMsg);
				}
			}
			else {
				$(this).css('background', '#fff');
				$(this).siblings('.warning').remove();
				//Check if green thick exists
				if ($(this).siblings('.accepted').length == 0) {
					$(this).parent().append(acceptedInput);
				}
			}
		}
		else {
			$(this).siblings('.accepted').remove();
			$(this).css('background', '#ff7575');
			if ($(this).siblings('.warning').length == 0) {
				$(this).parent().append(usernameWarningMsg);
			}
		}
	});
	
	//Password input
	pass.blur(function() {
		if ($(this).val().length == 0) {
			$(this).css('background', '#fff');
			$(this).siblings('.accepted').remove();
			$(this).siblings('.warning').remove();
		}
		else if (($(this).val().length < 6) || ($(this).val().length > 20)) {
			if (repeatPass.val().length > 0) {
				if ($(this).val() == repeatPass.val()) {
					repeatPass.css('background', '#fff');
					repeatPass.siblings('.warning').remove();
					if (repeatPass.siblings('.accepted').length == 0) {
						repeatPass.parent().append(acceptedInput);
					}
				}
				else {
					repeatPass.css('background', '#ff7575');
					repeatPass.siblings('.accepted').remove();
					if (repeatPass.siblings('.warning').length == 0) {
						repeatPass.parent().append(passwordsDontMatchMsg);
					}
				}
			}
			$(this).css('background', '#ff7575');
			$(this).siblings('.accepted').remove();
			if ($(this).siblings('.warning').length == 0) {
				$(this).parent().append(passwordWarningMsg);
			}
		}
		else if (($(this).val().length > 5) && ($(this).val().length < 21)) {
			if (repeatPass.val().length > 0) {
				if ($(this).val() == repeatPass.val()) {
					repeatPass.css('background', '#fff');
					repeatPass.siblings('.warning').remove();
					if (repeatPass.siblings('.accepted').length == 0) {
						repeatPass.parent().append(acceptedInput);
					}
				}
				else {
					repeatPass.css('background', '#ff7575');
					repeatPass.siblings('.accepted').remove();
					if (repeatPass.siblings('.warning').length == 0) {
						repeatPass.parent().append(passwordsDontMatchMsg);
					}
				}
			}
			$(this).css('background', '#fff');
			$(this).siblings('.warning').remove();
			if ($(this).siblings('.accepted').length == 0) {
				$(this).parent().append(acceptedInput);
			}
		}
	});

	//Repeat Password input
	repeatPass.blur(function() {
		if ($(this).val().length == 0) {
			$(this).css('background', '#fff');
			$(this).siblings('.accepted').remove();
			$(this).siblings('.warning').remove();
		}
		else if (pass.val().length > 0) {
			if ($(this).val() == pass.val()) {
				$(this).siblings('.warning').remove();
				if ($(this).siblings('.accepted').length == 0) {
					$(this).parent().append(acceptedInput);
				}
				$(this).css('background', '#fff');
			}
			else {
				$(this).siblings('.accepted').remove();
				$(this).css('background', '#ff7575');
				if ($(this).siblings('.warning').length == 0) {
					$(this).parent().append(passwordsDontMatchMsg);
				}
			}
		}
		else {
			$(this).css('background', '#ff7575');
			if ($(this).siblings('.warning').length == 0) {
				$(this).parent().append(passwordsDontMatchMsg);
			}
		}
	});
}
//Validation for Registration Form
function validateForm(form, math) {
	var username = form.regUsername;
	var pass = form.regPassword;
	var repeatPass = form.repeatedPassword;
	var mathAnswer = form.calcQuestion;

	//Username validation
	if (username.value.length == 0) {
		return false;
	}
	else if (isNaN(username.value.charAt(0))) {
		if ((username.value.length < 4) || (username.value.length > 30)) {
			return false;
		}
	}
	else {
		return false;
	}
	
	//Password validation
	if (pass.value.length == 0) {
		return false;
	}
	else if ((pass.value.length < 6) || (pass.value.length > 20)) {
		return false;
	}
	else {
		if (pass.value != repeatPass.value) {
			return false;
		}
	}
	
	//Math question validation
	if (mathAnswer.value != math) {
		return false;
	}
	return true;
}
//Validation for Login Form
function validateLoginForm(form) {
	var username = form.username;
	var pass = form.password;

	//Username validation
	if (username.value.length == 0) {
		return false;
	}
	else if (isNaN(username.value.charAt(0))) {
		if ((username.value.length < 4) || (username.value.length > 30)) {
			return false;
		}
	}
	else {
		return false;
	}
	
	//Password validation
	if (pass.value.length == 0) {
		return false;
	}
	else if ((pass.value.length < 6) || (pass.value.length > 20)) {
		return false;
	}
	return true;
}
/* End of Form Validations */

/* User Panel */
function loggedUserPanel() {
	document.getElementsByTagName('header')[0].innerHTML +=
		'<section id="userPanel">' +
			'<span class="greeting-message">Hi,</span>' +
			'<div class="userPanelMenu">' +
				'<span class="userPaneluserName">' + $.cookie('uName') + '</span>' +
				'<span class="icons down-arrow"></span>' +
				'<ul class="userMenu">' +
					'<li>' +
						'<a href="#myVideos" id="myVideos">' +
							'<span class="icons right-arrow"></span>My Videos' +
						'</a>' +
					'</li>' +
					'<li>' +
						'<a href="#logout" id="logout">' +
							'<span class="icons right-arrow"></span>Log out' +
						'</a>' +
					'</li>' +
				'</ul>' +
			'</div>' +
		'</section>';
	
	var username_cookie = $.cookie('uName');
	var pass_cookie = $.cookie('uPass');
	var userData = new collectUserDataWithCookie(username_cookie, pass_cookie);
	var user = userData.collectData();
	$('#myVideos').on('click',{userData:user}, userVideos);
	$('#logout').on('click', function(e) {
		deleteCookie();
		window.location.reload(true);
	});
	//hover effects on user panel
	$('.userPanelMenu').hover(
		function() {
			$('.userMenu').slideDown(300);
		},
		function() {
			$('.userMenu').slideUp(300);
		}
	);
	$('.userMenu li').hover(
		function() {
			$('.right-arrow', this).animate({marginLeft: "5px"}, 80);
		},
		function() {
			$('.right-arrow', this).animate({marginLeft: "-=5px"}, 300);
		}
	);
}

//Load rented videos of user
function userVideos(e) {
	$('#main-nav li').removeClass('current');
	var user = e.data.userData;
	performPostRequest(serviceRootUrl + 'rented-movies', user, onUserMoviesSuccess, errorMessage);
}

function onUserMoviesSuccess(rentedMovies) {
	var rentedMoviesHTML = '<ul class="rented-movies-list clear"></ul>';
	document.getElementById('container').innerHTML = rentedMoviesHTML;
	
	function rentedMoviesHTMLLoop(i) {
		var listing_html =
			'<li>' +
				'<h2 data-id="' + rentedMovies[i].id + '" class="clear">' + rentedMovies[i].title + '</h2>' +
				'<h4 class="clear"><span class="icons publish-date"></span>' +
					rentedMovies[i].publishDate +
				'</h4>' +
				'<p>' +
					rentedMovies[i].description +
				'</p>' +
				'<div id="rentPanel" class="clear">' +
					'<a href="#" title="Return ' + rentedMovies[i].title + '" class="return-a-movie">' +
						'<span class="icons return"></span>' +
						'Return' +
					'</a>' +
				'</div>' +
			'</li>';
		return listing_html;
	}
	
	var place_to_append = document.getElementById('container').getElementsByTagName('ul')[0];
	infinityScroll(rentedMovies, place_to_append, rentedMoviesHTMLLoop);
	$('#container').on('click', '#rentPanel a', onReturnMovieFromRentedList);
	
	//remove event listener
	$(document).on('click', 'a', function() {
		$('#container').off('click', onReturnMovieFromRentedList);
		$(document).off('click', 'a');
	});
}

//Return a movie from rented list
function onReturnMovieFromRentedList(e) {
	var current_movie = $(this);
	var username_cookie = $.cookie('uName');
	var pass_cookie = $.cookie('uPass');
	var movieId = $(this).parent().siblings('h2').data('id');
	var movieTitle = $(this).parent().siblings('h2').html();
	var userDataAndMovie = new collectUserDataAndMovieIdWithCookie(username_cookie, pass_cookie, movieId);
	var userDataAndMovieId = userDataAndMovie.collectData();
	performPostRequest(serviceRootUrl + 'return-movie', userDataAndMovieId, function (){
		onReturnMovieFromRentedListSuccess(movieTitle, current_movie);
	}, errorMessage);
	return false;
}
//message to show when returning a movie from rented movies list
function onReturnMovieFromRentedListSuccess(movieTitle, current_movie) {
	var msg =
		'<aside id="successfulRentReturnArea">' +
			'<span class="icons close-btn"></span>' +
			'<span class="icons accepted success-reg"></span>' +
			'The movie <strong>' + movieTitle + '</strong> was successfully returned.' +
		'</aside>';
	current_movie.parent().after(msg);
	current_movie.parent().parent().children(':not("#successfulRentReturnArea")').slideUp(500, function() {
		current_movie.remove();
	});
	showRentReturnInfo();
}
/* End of User Panel */

/* About */
function onAboutClick(e) {
	$('#main-nav li').removeClass('current');
	$(this).parent().addClass('current');
	var aboutContent =
		'<article>' +
			'<p>' +
				"This is a test project for the Web Design course with HTML5, CSS3 and JavaScript in Telerik Academy." +
				"The site was made with all of the modern techniques, supporting even older browsers (IE7+). It's based on " +
				"restful services with asynchronous requests (AJAX) using jQuery. Pure JavaScript was used wherever possible." +
			'</p>' +
		'</article>';
	document.getElementById('container').innerHTML = aboutContent;
}
/* End of About */

/* Error responses from the server */
function errorMessage(error) {
	var errorResponseMessage = JSON.parse(error.responseText);
	var msgInfo =
		'<div id="mask"></div>' +
		'<div id="popup-box">' +
			'<span class="icons close-dialog"></span>' +
			'<strong>Error: ' + error.status + '</strong>' +
			'<p class="response-msg">' +
				'<span class="msg">Message:</span>' +
				'<br/>' +
				errorResponseMessage.Message +
			'</p>' +
		'</div>';
	$(msgInfo).hide().appendTo('body').fadeIn(400);
	$('#mask, .close-dialog').on('click', function(e) {
		$('#mask, #popup-box').fadeOut(400, function() {
			$(this).remove();
		});
	});
}

function videoLibrariesErrorMessage(error) {
	errorMessage(error);
	pageNum = 0;
	videoLibrariesPerPageInput = 10;
	var videoLibrariesInputText = document.getElementsByName('librariesPerPageInput')[0];
	videoLibrariesInputText.value = videoLibrariesPerPageInput;
	homeContent();
}
/* End of Error responses from the server */

/* Infinity Scroll */
function infinityScroll(received_data, place_to_append, loop_HTML) {
	var i = 0;
	var length = received_data.length;
	var interval = 15;
	var max_items_to_load = i + interval;
	var timeout;
	var reached_last_item = false;
	var didScroll = false;
	
	loop();
	//looping function appending new elements on the page on scroll
	function loop() {
		var listing_html_maker = '';
		if (!reached_last_item) {
			if (max_items_to_load > length) {
				max_items_to_load = length;
				reached_last_item = true;
			}
			for(; i<max_items_to_load; i++) {
				listing_html_maker += loop_HTML(i);
			}
			max_items_to_load = i + interval;
			place_to_append.innerHTML += listing_html_maker;
			}
	}
	//check scroll position
	function scroller() {
		if ($(window).scrollTop() >= ($(document).height() - $(window).height())*0.95){
			loop();
		}
	}

	(function check_if_scrolled() {
		if (didScroll) {
			didScrtoll = false;
			scroller();
		}
		timeout = setTimeout (check_if_scrolled, 250);
	})();

	function setScroll() {
		didScroll = true;
	}
	
	$(window).on('scroll', setScroll);

	//remove scroll event listener when clicked on anchor
	$(document).not('.rented-movies-list .return-a-movie, .close-btn').on('click', 'a', function() {
		$(window).off('scroll', setScroll);
		clearTimeout(timeout);
		$(document).off('click', 'a');
	});
}
/* End of Infinity Scroll */

/* Constructors */
//Returns object of username and encrypted password
function collectUserData(username, pass) {
	var that = this;
	this.username = username;
	this.pass = pass;
	this.collect = function() {
		return {
			username: that.username,
			authCode: CryptoJS.SHA1(that.username+that.pass).toString()
		}
	}
}
//Returns object of movieId, username and encrypted password
function collectUserDataAndMovieId() {
	collectUserDataAndMovieIdWithCookie.apply(this, arguments);
	var that =  this;
	this.collectDataAndMovieId = function() {
		return {
			movieId:that.movieid,
			user:{
				username: that.username,
				authCode: CryptoJS.SHA1(that.username+that.pass).toString()
			}
		}
	}
}
collectUserDataAndMovieId.prototype = new collectUserDataAndMovieIdWithCookie;
collectUserDataAndMovieId.prototype.constructor = collectUserDataAndMovieId;
//Returns object of username and password
function collectUserDataWithCookie() {
	collectUserData.apply (this, arguments);
	var that = this;
	this.collectData = function() {
		return {
			username: that.username,
			authCode: that.pass
		}
	}
}
collectUserDataWithCookie.prototype = new collectUserData;
collectUserDataWithCookie.prototype.constructor = collectUserDataWithCookie;
//Returns object of movieId, username and password
function collectUserDataAndMovieIdWithCookie(username, pass, movieid) {
	collectUserData.apply (this, arguments);
	this.movieid = movieid;
	var that = this;
	this.collectData = function() {
		return {
			movieId:that.movieid,
			user:{
				username: that.username,
				authCode: that.pass
			}
		}
	}
}
collectUserDataAndMovieIdWithCookie.prototype = new collectUserData;
collectUserDataAndMovieIdWithCookie.prototype.constructor = collectUserDataAndMovieIdWithCookie;
/* End of Constructors */

//Get request using Ajax
function performGetRequest(serviceUrl, onSuccess, onError) {
	$.ajax({
		url: serviceUrl,
		cache: false,
		type: "GET",
		timeout: 5000,
		dataType: "json",
		success: onSuccess,
		error: onError
	});
}

//Post Request using Ajax
function performPostRequest(serviceUrl, data, onSuccess, onError) {
	$.ajax({
		url: serviceUrl,
		cache: false,
		type: "POST",
		contentType: "application/json; charset=utf-8",
		timeout: 5000,
		dataType: "json",
		data: JSON.stringify(data),
		success: onSuccess,
		error: onError
	});
}