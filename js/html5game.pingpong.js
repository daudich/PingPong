//tooltip function workaround for IE older browsers
$(function() {
	
	if ($.browser.msie && $.browser.version.substr(0,1)<7){
		
		$(".tooltip").mouseover(function(){
		
			$(this).children("span.tool").show();
		
		}).mouseout(function(){
			
			$(this).children("span.tool").hide();
			
			})

	}

});

//Target Firefox to modify button appearance
if ($.browser.mozilla) {

	$("#start").html("Start game")

}

//initializing values for game engine
var KEY = {UP:38, DOWN:40, W:87, S:83, Space:32};
var pingpong = {scoreA:0, scoreB:0};

pingpong.pressedKeys = [];

//when "Save" button is clicked perform some checks for input values
$('#save').click(function(){
		
		var ballSpeed = $("#ballspeed").val();
		var maxScore = $("#maxscore").val();
		var paddleSpeed = $("#paddlespeed").val();
		var regex = /[1-9]/;
		var regex1 = /\d{2}/;
		
		if (ballSpeed.match(regex)){
			
			$("#ballspeed").attr("value", ballSpeed);
		
		}
		else {
			
			alert("For Ball Speed value please insert only digits, range 1-9.")
		
		}
		
		if (paddleSpeed.match(regex)){
				
			$("#paddlespeed").attr("value", paddleSpeed);
		
		}
		else {
			
			alert("For Paddle Speed value please insert only digits, range 1-9.")
		}
		
		if (maxScore.match(regex1) && maxScore != "00"){
			
			$("#maxscore").attr("value", maxScore);
		
		}
		else {
		
			alert("For Max Score please insert only digits, range 00-99. The number must have a length of two digits and should be diffrent from 00.")
		
		}

});
	
//initialize values for ball: speed, position and direction on X and Y axes
pingpong.ball = {speed:6, x:290, y:140, directionX:1, directionY:1};

$(function() {

	//mark down in array which key is pressed
	$(document).keydown(function(e){

		pingpong.pressedKeys[e.which] = true;

	});

	$(document).keyup(function(e){

		pingpong.pressedKeys[e.which] = false;

	}); 
	   
	//"click" event for "Start/Resume game" button
	$("#start").click(function() {
	
		if($("#gameover").css("display") == "block") {
		
			$("#gameover").hide("fast")
		
		};
		
		if($("#pausegame").css("display") == "block") {
		
			$("#pausegame").hide("fast")
		
		};
	
		//set timer for game engine loop and hide button to prevent future clicks
		$(this).everyTime(40, "start", gameLoop);
		$("#startbutton").hide("slow");

	});

});

function gameLoop() {
	
	moveBall();
	movePaddles();
	
	//get the values of "maxscore" input element
	var maxScore = $("#maxscore").val();
	
	//check the length and based of some criteria update the maxscore input value
	if (maxScore.length == 1){ 
				
		if (isNaN(maxScore) === true){
					
			maxScore = 5;
				
		}
		else {
				
			maxScore = "" + 0 + maxScore;

		}
	
	}
	else {
	
		if (isNaN(maxScore) === true){
			
			maxScore = 5;
			
		}
		else {
			
			maxScore = maxScore;
		}
	
	};
	
	//Pause the game (clear timer) if Space bar is pressed and display message how to resume game and "Start/Resume game" button		
	if (pingpong.pressedKeys[KEY.Space]) {
		
		if ($.browser.mozilla) {
		
			alert("The game is paused. \n Click the OK to resume the game.");
		
		}
		else {
			
			$("#pausegame").show("slow");
			$("#start").removeAttr("disabled");
			$("#startbutton").show("fast");
			$(this).stopTime("start");
		
		};
		
	};
	
	//perform checks for "maxscore" value and perform actions based on returned boolean value for "Game over!" situation
	if ((pingpong.scoreA == maxScore && pingpong.scoreA != 0) || (pingpong.scoreB == maxScore && pingpong.scoreB != 0)) {
	
		//print message for game over, reset score and stop the game loop
		$("#gameover").show("slow");
		pingpong.scoreA = "00";
	
		$("#scoreA").html(pingpong.scoreA);
		pingpong.scoreB = "00";
	
		$("#scoreB").html(pingpong.scoreB);
	
		//clear timer, show "Start/Resume game" button
		$(this).stopTime("start");
		$("#start").removeAttr("disabled");
		$("#startbutton").show("fast");
	
	};

};

//how to move the right and left paddles
function movePaddles() {

	var paddleSpeed = parseInt($("#paddlespeed").val());

	//use our custom timer to continously check if a key is pressed
	if (pingpong.pressedKeys[KEY.UP]) {

		//move the paddle B up based on "Paddle Speed" input value
		var top = parseInt($("#paddleB").css("top"));
		if (top >= -parseInt($("#paddleB").css("height"))/2) {
	
			$("#paddleB").css("top", top - paddleSpeed);
	
		}
	
	};
	
	if (pingpong.pressedKeys[KEY.DOWN]) {
	
		//move the paddle B down based on "Paddle Speed" input value
		var top = parseInt($("#paddleB").css("top"));
	
		if (top <= (parseInt($("#playground").css("height")) - (parseInt($("#paddleB").css("height")))/2)) {
	
			$("#paddleB").css("top", top + paddleSpeed);
	
		}
	
	};
	
	if (pingpong.pressedKeys[KEY.W]) {
	
		//move the paddle A up based on "Paddle Speed" input value
		var top = parseInt($("#paddleA").css("top"));
	
		if (top >= -parseInt($("#paddleA").css("height"))/2) {
	
			$("#paddleA").css("top", top - paddleSpeed);
	
		}
	
	};
	
	if (pingpong.pressedKeys[KEY.S]) {
	
		//move the paddle B down based on "Paddle Speed" input value
		var top = parseInt($("#paddleA").css("top"));
	
		if (top <= (parseInt($("#playground").css("height")) - (parseInt($("#paddleA").css("height")))/2)) {
	
			$("#paddleA").css("top", top + paddleSpeed);
	
		}
	
	};

};

function moveBall() {
	
	//reference useful variables
	var playgroundWidth = parseInt($("#playground").width());
	var playgroundHeight = parseInt($("#playground").height());
	var ballSpeed = $("#ballspeed").val();
	var ball = pingpong.ball;
	
	//re-initialize ball speed value
	ball.speed = ballSpeed;
	
	//check, when ball is moving up, if ball position exceeds playground height, and then change the moving orientation on Y axis
	if (ball.y + ball.speed*ball.directionY > (playgroundHeight - parseInt($("#ball").height()))) {
	
		ball.directionY = -1
	
	};
	
	//check top edge
	if (ball.y + ball.speed*ball.directionY < 0) {
	
		ball.directionY = 1
	
	};
	
	//check right edge
	if (ball.x + ball.speed*ball.directionX > playgroundWidth ){
		
		//if player B scores, re-initialize ball position, moving orientation on X axis, increment score by 1 and update it on score board
		ball.x = 290;
		ball.y = 140;
		
		$("#ball").css({"left": ball.x, "top": ball.y});
		ball.directionX = -1;
		pingpong.scoreA++;
		
		if (parseInt(pingpong.scoreA) < 10) {
		
			pingpong.scoreA = "" + 0 + pingpong.scoreA;
			$("#scoreA").html(pingpong.scoreA);
		}
		else {
		
			$("#scoreA").html(pingpong.scoreA);
		
		}
		
	};
	
	//check left edge
	if (ball.x + ball.speed*ball.directionX < 0){
		
		//if player A scores, re-initialize ball position and moving orientation on X axis, increment score by 1 and update it on score board
		ball.x = 290;
		ball.y = 140;
		
		$("#ball").css({"left": ball.x, "top": ball.y});
		ball.directionX = 1;
		pingpong.scoreB++;
		
		if (parseInt(pingpong.scoreB) < 10) {
		
			pingpong.scoreB = "" + 0 + pingpong.scoreB;
		
			$("#scoreB").html(pingpong.scoreB);
		}
		else {
		
			$("#scoreB").html(pingpong.scoreB);
		
		}
	
	};
	
	//increment ball position on X and Y axes based on ball speed and orientation
	ball.x += ball.speed*ball.directionX;
	ball.y += ball.speed*ball.directionY;
	
	//check left paddle
	//position on X axis
	var paddleAX = parseInt($("#paddleA").css("left")) + parseInt($("#paddleA").css("width"));
	
	//need to correct the paddle position against ball position on Y axis
	var ballCorrection = parseInt($("#paddleA").css("left")) - parseInt($("#ball").css("left"));
	
	if (ballCorrection > 0) {
	
		var ballCorrection = ballCorrection;
		var paddleAYBottom = parseInt($("#paddleA").css("top")) + parseInt($("#paddleA").css("height")) - Math.round(parseInt($("ballspeed").val())*ballCorrection/parseInt($("paddlespeed").val()));
		var paddleAYTop = parseInt($("#paddleA").css("top")) - Math.round(parseInt($("ballspeed").val())*ballCorrection/parseInt($("paddlespeed").val()));
	
	}
	else {
	
		var paddleAYBottom = parseInt($("#paddleA").css("top")) + parseInt($("#paddleA").css("height"));
		var paddleAYTop = parseInt($("#paddleA").css("top"));
	
	}
	
	if (ball.x + ball.speed*ball.directionX < paddleAX){
		
		if ((ball.y + ball.speed*ball.directionY <= paddleAYBottom) && (ball.y + ball.speed*ball.directionY >=paddleAYTop)){
			
			ball.directionX = 1
		}
		
	};
	
	//check right paddle
	var paddleBX = parseInt($("#paddleB").css("left")) - parseInt($("#paddleB").css("width"));
	var ballCorrection = parseInt($("#ball").css("left")) -  parseInt($("#paddleB").css("left"));
	
	if (ballCorrection > 0) {
	
		var ballCorrection = ballCorrection;
		var paddleBYBottom = parseInt($("#paddleB").css("top")) + parseInt($("#paddleB").css("height")) - Math.round(parseInt($("ballspeed").val())*ballCorrection/parseInt($("paddlespeed").val()));
		var paddleBYTop = parseInt($("#paddleB").css("top")) - Math.round(parseInt($("ballspeed").val())*ballCorrection/parseInt($("paddlespeed").val()));
	
	}
	else {
		
		var paddleBYBottom = parseInt($("#paddleB").css("top")) + parseInt($("#paddleB").css("height"));
		var paddleBYTop = parseInt($("#paddleB").css("top"));
		
	};
			
	if (ball.x + ball.speed*ball.directionX >=paddleBX){
		
		if ((ball.y + ball.speed*ball.directionY <= paddleBYBottom) && (ball.y + ball.speed*ball.directionY >=paddleBYTop)){
			
			ball.directionX = -1
		
		}
	
	};
	
	//actually move the ball with speed and direction
	$("#ball").css({"left": ball.x, "top": ball.y});
	
};
