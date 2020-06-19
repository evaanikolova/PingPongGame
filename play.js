'use strict';

// GAME

function Game() {
    var canvas = document.getElementById("game");
    this.width = canvas.width;
    this.height = canvas.height;
    this.context = canvas.getContext("2d");
    this.context.fillStyle = "white";
    // this.keys = new KeyListener();

    // Add the players' coordinates
    this.p1 = new Paddle(5, 0);
    this.p1.y = this.height / 2 - this.p1.height / 2;

    this.touchesP1 = new TouchListener(this.p1);

    // Display the score for player1
    this.display1 = new Display(this.width / 4, 25);

    this.p2 = new Paddle(this.width - 5 - 2, 0);
    this.p2.y = this.height / 2 - this.p2.height / 2;

    this.touchesP2 = new TouchListener(this.p2);

    // Display the score for player2
    this.display2 = new Display(this.width * 3 / 4, 25);

    // Add the ball's coordinates
    this.ball = new Ball();
    this.ball.x = this.width / 2;
    this.ball.y = this.height / 2;
    this.ball.vy = Math.floor(Math.random() * 12 - 6);
    this.ball.vx = 7 - Math.abs(this.ball.vy);
}

Game.prototype.draw = function () {
    this.context.clearRect(0, 0, this.width, this.height);
    // The white rectangle in the middle
    this.context.fillRect(this.width / 2, 0, 2, this.height);

    // Draw the players
    this.context.clearRect(0, 0, this.width, this.height);
    this.context.fillRect(this.width / 2, 0, 2, this.height);

    this.p1.draw(this.context);
    this.p2.draw(this.context);

    // Draw the ball
    this.ball.draw(this.context);

    // Drow the score display
    this.display1.draw(this.context);
    this.display2.draw(this.context);
};

Game.prototype.update = function () {
    if (this.paused)
        return;

    // // We handle the key listeners
    // // To which Y direction the paddle is moving (up / down)
    // if (this.keys.isPressed(83)) { // DOWN (S)
    //     this.p1.y = Math.min(this.height - this.p1.height, this.p1.y + 5);
    // } else if (this.keys.isPressed(87)) { // UP (W)
    //     this.p1.y = Math.max(0, this.p1.y - 5);
    // }

    // if (this.keys.isPressed(40)) { // DOWN (arrow down)
    //     this.p2.y = Math.min(this.height - this.p2.height, this.p2.y + 5);
    // } else if (this.keys.isPressed(38)) { // UP (arrow up)
    //     this.p2.y = Math.max(0, this.p2.y - 5);
    // }

    // We handle the ball
    this.ball.update();

    // We update the score
    this.display1.value = this.p1.score;
    this.display2.value = this.p2.score;

    // When the ball hits a paddle, it changes to the opposite X direction but keeps the Y velocity. When the ball hits the top or bottom of the screen, it moves in the opposite Y direction while the X velocity remains the same. If it crosses the left or right side of the screen, the player of the opposite side scores. 
    if (this.ball.vx > 0) {
        if (this.p2.x <= this.ball.x + this.ball.width &&
            this.p2.x > this.ball.x - this.ball.vx + this.ball.width) {
            var collisionDiff = this.ball.x + this.ball.width - this.p2.x;
            var k = collisionDiff / this.ball.vx;
            var y = this.ball.vy * k + (this.ball.y - this.ball.vy);
            if (y >= this.p2.y && y + this.ball.height <= this.p2.y + this.p2.height) {
                // collides with right paddle
                this.ball.x = this.p2.x - this.ball.width;
                this.ball.y = Math.floor(this.ball.y - this.ball.vy + this.ball.vy * k);
                this.ball.vx = -this.ball.vx;
            }
        }
    } else {
        if (this.p1.x + this.p1.width >= this.ball.x) {
            var collisionDiff = this.p1.x + this.p1.width - this.ball.x;
            var k = collisionDiff / -this.ball.vx;
            var y = this.ball.vy * k + (this.ball.y - this.ball.vy);
            if (y >= this.p1.y && y + this.ball.height <= this.p1.y + this.p1.height) {
                // collides with the left paddle
                this.ball.x = this.p1.x + this.p1.width;
                this.ball.y = Math.floor(this.ball.y - this.ball.vy + this.ball.vy * k);
                this.ball.vx = -this.ball.vx;
            }
        }
    }

    // Top and bottom collision
    if ((this.ball.vy < 0 && this.ball.y < 0) ||
        (this.ball.vy > 0 && this.ball.y + this.ball.height > this.height)) {
        this.ball.vy = -this.ball.vy;
    }

    // We count the score
    if (this.ball.x >= this.width)
        this.score(this.p1);
    else if (this.ball.x + this.ball.width <= 0)
        this.score(this.p2);
};

Game.prototype.score = function (p) {
    // player scores
    p.score++;
    var player = p == this.p1 ? 0 : 1;

    // set ball position
    this.ball.x = this.width / 2;
    this.ball.y = p.y + p.height / 2;

    // set ball velocity
    this.ball.vy = Math.floor(Math.random() * 12 - 6);
    this.ball.vx = 7 - Math.abs(this.ball.vy);
    if (player == 1)
        this.ball.vx *= -1;
};

// PADDLES

// Paddle represents a player in the game
function Paddle(x, y) {
    this.x = x;
    this.y = y;
    this.width = 2;
    this.height = 50;
    this.score = 0;
}

// Implement a separate draw() for a player, so the Game doesn't worrty about the drawing of the players
Paddle.prototype.draw = function (p) {
    p.fillRect(this.x, this.y, this.width, this.height);
};

// BALL

function Ball() {
    this.x = 0;
    this.y = 0;
    // v stands for velocity (speed)
    this.vx = 0;
    this.vy = 0;
    this.width = 4;
    this.height = 4;
}

Ball.prototype.update = function () {
    this.x += this.vx;
    this.y += this.vy;
};

Ball.prototype.draw = function (p) {
    p.fillRect(this.x, this.y, this.width, this.height);
};

// DISPLAY THE SCORE

function Display(x, y) {
    this.x = x;
    this.y = y;
    this.value = 0;
}

Display.prototype.draw = function (p) {
    p.fillText(this.value, this.x, this.y);
};

// KEY LISTENER

// function KeyListener() {
//     this.pressedKeys = [];

//     this.keydown = function (e) {
//         this.pressedKeys[e.keyCode] = true;
//     };

//     this.keyup = function (e) {
//         this.pressedKeys[e.keyCode] = false;
//     };

//     document.addEventListener("keydown", this.keydown.bind(this));
//     document.addEventListener("keyup", this.keyup.bind(this));
// }

// KeyListener.prototype.isPressed = function (key) {
//     return this.pressedKeys[key] ? true : false;
// };

// KeyListener.prototype.addKeyPressListener = function (keyCode, callback) {
//     document.addEventListener("keypress", function (e) {
//         if (e.keyCode == keyCode)
//             callback(e);
//     });
// };

// TOUCH LISTENERS

function TouchListener(element) {
    this.touches = [];
    this.touchMoveListener = function (touch) { };

    element.addEventListener("touchstart", (function (e) {
        e.preventDefault();
        for (var i = 0; i < e.changedTouches.length; i++) {
            var touch = e.changedTouches[i];
            this.touches[touch.identifier] = { x: touch.clientX, y: touch.clientY };
        }
    }).bind(this));

    element.addEventListener("touchmove", (function (e) {
        e.preventDefault();
        for (var i = 0; i < e.changedTouches.length; i++) {
            var touch = e.changedTouches[i];
            var previousTouch = this.touches[touch.identifier];
            this.touches[touch.identifier] = { x: touch.clientX, y: touch.clientY };

            var offset = { x: touch.clientX - previousTouch.x, y: touch.clientY - previousTouch.y }
            this.touchMoveListener({ x: touch.clientX, y: touch.clientY, offset: offset });
        }
    }).bind(this));

    element.addEventListener("touchend", (function (e) {
        e.preventDefault();
        for (var i = 0; i < e.changedTouches.length; i++) {
            delete this.touches[e.changedTouches[i].identifier];
        }
    }).bind(this));
}

// MAIN

// Initialize our game instance
var game = new Game();

function MainLoop() {
    game.update();
    game.draw();
    // Call the main loop again at a frame rate of 30fps
    setTimeout(MainLoop, 33.3333);
}

// Start the game execution
MainLoop();