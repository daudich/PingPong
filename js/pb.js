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
var KEY = {UP:38, DOWN:40, Space:32};
var socket = io.connect('http://localhost:8080');
var pingpong = {scoreA:0, scoreB:0};
var id = '';
var startgame = 0;

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

// on connection to server, ask for user's name with an anonymous callback
socket.on('connect', function(socket){

		console.log("Connected to Server: All systems go!");

});

socket.on('myid', function(id){
	
	myid = id;
	console.log("my id: " + myid);
	
});

socket.on('updateBall', function(x, y){
	
	console.log("coordinates: " + x +" "+ y);
	
	moveBall(x, y);
	
});

socket.on('updateScore', function(scorea, scoreb){
	
	console.log("scores: " + scorea +" "+ scoreb);
	
	$("#scoreA").html(scorea);
	$("#scoreB").html(scoreb);
	
});

socket.on('updateAttributes', function(ballspeed, maxscore, paddlespeed){
	
	console.log("addtributes: " + ballspeed +" "+ maxscore +" "+paddlespeed);
	
	$("#ballspeed").attr("value", ballspeed);
	$("#paddlespeed").attr("value", paddlespeed);
	$("#maxscore").attr("value", maxscore);
});

socket.on('updatePaddle', function(position){
	
	console.log("moving paddle A: " + position);
	
	$("#paddleA").css("top", position);
	
});

socket.on('endgame', function(signal){
	
	console.log("Game Over!");
	
	pingpong.scoreA = "00";
	$("#scoreA").html(pingpong.scoreA);
	pingpong.scoreB = "00";
	$("#scoreB").html(pingpong.scoreB);
		
	$("#gameover").show("slow");
	
	//clear timer, show "Start/Resume game" button
	$(this).stopTime("start");
	$("#start").removeAttr("disabled");
	$("#startbutton").show("fast");
	
	startgame = 0;
	
});

socket.on('start', function(value){

	startgame++;
	
	if(startgame == 2){
	
		if($("#gameover").css("display") == "block") {
		
			$("#gameover").hide("fast")
		
		};
		
		if($("#pausegame").css("display") == "block") {
		
			$("#pausegame").hide("fast")
		
		};
	
		//set timer for game engine loop and hide button to prevent future clicks
		$(this).everyTime(40, "start", gameLoop);
		$("#startbutton").hide("slow");
		
	}
	
	console.log("Player A is ready!");
	
});

socket.on('pause', function(value){
console.log("paused");
	if ($.browser.mozilla) {
		
			alert("Player A paused the game.\n");
		
	}
	else {
			
		$("#pausegame").show("slow");
		$("#start").removeAttr("disabled");
		$("#startbutton").show("fast");
		$(this).stopTime("start");
		
	};
	
	startgame--;
	
});

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
	
		startgame++;
		
		$("#startbutton").hide("slow");
		
		if(startgame == 2){
			
			if($("#gameover").css("display") == "block") {
			
				$("#gameover").hide("fast")
			
			};
			
			if($("#pausegame").css("display") == "block") {
			
				$("#pausegame").hide("fast")
			
			};
		
			//set timer for game engine loop and hide button to prevent future clicks
			$(this).everyTime(40, "start", gameLoop);

		}
		else
			alert("Waiting for the other player to join.");
		
		socket.emit('start', myid, 1);
	
	});

});

function gameLoop() {

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
		
			socket.emit('pause', myid, 1);
			alert("The game is paused. \n Click the OK to resume the game.");
		
		}
		else {
			
			$("#pausegame").show("slow");
			$("#start").removeAttr("disabled");
			$("#startbutton").show("fast");
			socket.emit('pause', myid, 1);
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
			
			socket.emit('updatePaddle', myid, top - paddleSpeed);
	
		}
	
	};
	
	if (pingpong.pressedKeys[KEY.DOWN]) {
	
		//move the paddle B down based on "Paddle Speed" input value
		var top = parseInt($("#paddleB").css("top"));
	
		if (top <= (parseInt($("#playground").css("height")) - (parseInt($("#paddleB").css("height")))/2)) {
	
			$("#paddleB").css("top", top + paddleSpeed);
			
			socket.emit('updatePaddle', myid, top + paddleSpeed);
	
		}
	
	};
	
};

function moveBall(x, y) {
	
	//actually move the ball with speed and direction
	$("#ball").css({"left": x, "top": y});
	
};
