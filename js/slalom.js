const substeps = 10;
const chainLength = 15;
const netDimensions = [6, 5];
const ballRadius = 30;
const friction = 0.01;
const gameTime = 60;
const margin = 10;
const prop = 30;

let tick = 0;
let startTime = null;
let timeElapsed = 0;
let score = 0;
let lastScore = 0;

let gravity = null;
let rise = null;

let joints = [];
let ball = {};
let scoreball = {};

let alreadyPlayed = false;
let stopped = true;
let timeInterval = 0;

function setup() {
  try {
    //Create the game canvas.
    createCanvas(600, 800);
  }
  catch(err) {
      //There's been an issue, show the error.
      alert("Error: " + err.message);
  }
}

function initialize() {
  //Set initial positions and values for the game
  gravity = createVector(0, 0.1);
  rise = createVector(0, -0.03);
  ball = {
    pos: {x: width/2 - 40, y: height/2 - 100},
    mass: 3
  };

  scoreball = {
    pos: {x: width/2 - 40, y: height - margin - ballRadius},
    mass: 3
  };
  
  joints = [];
  connections = [];

  ball.oldPos = {x: ball.pos.x, y: ball.pos.y};

  scoreball.oldPos = {x: scoreball.pos.x, y: scoreball.pos.y};
  
  timeInterval = setInterval(() => {
    timeElapsed++;
  }, 1000);
}

function newGame() {
    //Stop the timer and setup values for a new game.
    clearInterval(timeInterval);
    startGame();
}

function mousePressed() {
  try {
    if (!stopped) {
      return;
    }
    //Setup values for a new game.
    startGame();
  }
  catch(err) {
      //There's been an issue, show the error.
      alert("Error: " + err.message);
  }
}

function startGame() {
    //Setup initial values for a new game.
    noLoop();
    stopped = false;
    alreadyPlayed = true;
    tick = 0;
    startTime = new Date().getTime();
    timeElapsed = 0;
    score = 0;
    lastScore = null;
    initialize();
    loop();
}

function draw() {
  try {
    if (stopped) {
      background(52, 235, 232, 245);
      textAlign(CENTER);
      textSize(60);
  
      //Check to see if we are at the end of game, about to start a game or in the middle of a game.
      if (alreadyPlayed) {
        text('Game over', width/2, height/2 - 30);
        textSize(40);
        text(`Final score: ${score}`, width/2, height/2 + 30);
      } else {
        text('Tap to play', width/2, height/2);
      }
      noLoop();
      return;
    }
  
    //draw the relevant pieces for the game
    background(52, 235, 232, 245);
    
    drawScene();
    applyVerlet();
    applyConstraints();

    //If the canow is throug the gate then update the score and set the position of the new gate
    if (scoreball.pos.x - ballRadius < ball.pos.x && ball.pos.x < scoreball.pos.x + ballRadius) {
      if (scoreball.pos.y < ball.pos.y && ball.pos.y < scoreball.pos.y + ballRadius) {
        if (ball.oldPos.y < ball.pos.y){
          score++;
          lastScore = tick
          scoreball.pos.x = Math.floor(Math.random() * (width - (2 * margin + 2 * ballRadius + 50)) + (margin + ballRadius));
          scoreball.pos.y = height - margin - ballRadius - 1;
        }
      }
    }
    
    tick++;
    if (timeElapsed > gameTime) {
      stopped = true;
      clearInterval(timeInterval);
    }
  }
  catch(err) {
      //There's been an issue, show the error.
      alert("Error: " + err.message);
  }
}

function keyPressed() {
  //Check which key has been pressed and update the canoes position
  if (keyCode === UP_ARROW) {
    ball.pos.y -= 3;
  }
  else if (keyCode === DOWN_ARROW) {
    ball.pos.y += 3;
  }
  else if (keyCode === LEFT_ARROW) {
    ball.pos.x -= 2;
  }
  else if (keyCode === RIGHT_ARROW) {
    ball.pos.x += 2;
  }
}


function drawScene() {
  //Draw the pieces for the game.
  noStroke();
  fill(180);
  
  if (lastScore && tick - lastScore < 40) {
    fill(lerpColor(color(173, 235, 177), color(100), (tick - lastScore)/40));
  }
  
  //Draw the canoe
  strokeWeight(3);
  stroke(0);
  fill('grey');
  circle(ball.pos.x,ball.pos.y - prop,prop)
  circle(ball.pos.x,ball.pos.y + prop,prop)
  rect(ball.pos.x - 1/2 * prop, ball.pos.y - prop, prop, 2 * prop)
  fill(255, 165, 0);
  stroke(40)
  circle(ball.pos.x, ball.pos.y, 1/2 * prop);

  //Draw the flags
  stroke('black');
  line(scoreball.pos.x + ballRadius,scoreball.pos.y,scoreball.pos.x + ballRadius,scoreball.pos.y + 1.25 * prop)
  line(scoreball.pos.x - ballRadius,scoreball.pos.y,scoreball.pos.x - ballRadius,scoreball.pos.y + 1.25 * prop)

  fill('red');
  strokeWeight(3);
  triangle(scoreball.pos.x - ballRadius, scoreball.pos.y, scoreball.pos.x - ballRadius, scoreball.pos.y - 0.75 * prop, scoreball.pos.x - ballRadius + 0.75 * prop, scoreball.pos.y - 0.375 * prop)
  triangle(scoreball.pos.x + ballRadius, scoreball.pos.y, scoreball.pos.x + ballRadius, scoreball.pos.y - 0.75 * prop, scoreball.pos.x + ballRadius + 0.75 * prop, scoreball.pos.y - 0.375 * prop)

  var fixedConnections = [];
  
  noStroke();
  fill(255);
  textAlign(LEFT);
  textSize(32);
  text(score, 20, 40);
  
  textAlign(RIGHT);
  text(`${max(gameTime - timeElapsed, 0)}s`, width - 20, 40);
}

function applyVerlet() {
  oldPos = ball.oldPos;
  ball.oldPos = JSON.parse(JSON.stringify(ball.pos));
  ball.pos.x += (ball.pos.x - oldPos.x)*(1 - friction) + gravity.x;
  ball.pos.y += (ball.pos.y - oldPos.y)*(1 - friction) + gravity.y;
  
  scoreoldPos = scoreball.oldPos;
  scoreball.oldPos = JSON.parse(JSON.stringify(scoreball.pos));
  scoreball.pos.y += (scoreball.pos.y - scoreoldPos.y)*(1 - friction) + rise.y;
}

function applyConstraints() {
  for (var i = 0; i < substeps; i++) {
    constrainAll();
  }
}

function constrainAll() {
  //Make sure the game pieces don't go beyond the boundires of the game.
  if (ball.pos.y > height - margin - ballRadius) {
    ball.pos.y = height - margin - ballRadius;
  }
  if (ball.pos.y < margin + ballRadius) {
    ball.pos.y = margin + ballRadius;
  }
  if (ball.pos.x > width - margin - ballRadius) {
    ball.pos.x = width - margin - ballRadius;
  }
  if (ball.pos.x < margin + ballRadius) {
    ball.pos.x = margin + ballRadius;
  };
  if (scoreball.pos.y < margin + ballRadius) {
    scoreball.pos.y += height - 1;
  }
  if (scoreball.pos.y > height - margin - ballRadius) {
    scoreball.pos.x = Math.floor(Math.random() * (width - (2 * margin + 2 * ballRadius + 50)) + (margin + ballRadius));
    scoreball.pos.y = height - margin - ballRadius - 1;
  }

}