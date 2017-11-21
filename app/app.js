//Globals
var fatty_canvas;
var fatty_context;
var current_state; 
var current_player;
var current_background;

//This was calibrated on a 600x400 canvas - I'd recommend you calibrating on a 600x400 canvas aswell if you are not happy with the feeling
var gravity = 700;
var upwards_force = -200;

var background_velocity = 100; //?

var interval;
var intervalSpeed = 1000 / 30; //Update 60 times a second

var gameRunning = false;
var fatty_timer;

//Needs get called once - If widht and heights are specified use it, otherwise use the containerid dimensions
function setup(containerId, width, height) {
    var containerElement = document.getElementById(containerId);

    current_log_level = VERBOSE_LEVEL;

    fatty_log(VERBOSE_LEVEL, containerElement);

    if(!containerElement) {
        fatty_log(ERROR_LEVEL, 'Couldnt locate container element by id: ' + containerId);
        return;
    }

    //Check if our canvas already exists
    fatty_canvas = document.getElementById('fatty_canvas');

    if(!fatty_canvas) {

    fatty_canvas = document.createElement('canvas');

    fatty_canvas.id = 'fatty_canvas';
    fatty_canvas.width = width || containerElement.clientWidth;
    fatty_canvas.height = height || containerElement.clientHeight;
    
    //Attach our canvas
    containerElement.appendChild(fatty_canvas);

    fatty_canvas.onmouseup = function(e) { 
        console.log("Hej");
        if(current_player && gameRunning) {
            current_player.fly();
        }
    }

    }

    fatty_context = fatty_canvas.getContext('2d');

    fatty_log(INFO_LEVEL, 'Successfully created a ' + fatty_canvas.width + 'x' + fatty_canvas.height + 'px canvas');

    //Calibrate gravity based on height.
    gravity *= fatty_canvas.height / 400;
    upwards_force *= fatty_canvas.height / 400;
    background_velocity *= fatty_canvas.height / 400;

    //Set the current state
    switchState(new PreState());

    //Create background
    current_background = new Background();

    //Start game loop
    fatty_timer = Date.now();
    gameLoop();
    fatty_context.fillStyle = "#4ec0ca";
}

function switchState(state) {
    if(current_state) {
        current_state.onEnd();
    }
    state.onStart();
    current_state = state;
}

/**
 * Begin game loop - this loop is naive and doesnt catchup very well. But will do the job for now
 */
function gameLoop() {
    //We could optimize this by only drawing the ceiling 
    fatty_context.fillRect(0, 0, fatty_canvas.width, fatty_canvas.height);    

    var deltaMS = Date.now() - fatty_timer;
    fatty_timer = Date.now();

    //We always render the background, do it regardless of state
    current_background.update(deltaMS);
    current_background.draw(deltaMS);

    current_state.onUpdate(deltaMS);
    requestAnimFrame( gameLoop );    
}

/**
 * requestAnim shim layer by Paul Irish
 * Finds the first API that works to optimize the animation loop,
 * otherwise defaults to setTimeout().
 */
window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame   ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame    ||
			window.oRequestAnimationFrame      ||
			window.msRequestAnimationFrame     ||
			function(/* function */ callback, /* DOMElement */ element){
				window.setTimeout(callback, 1000 / 60);
			};
})();

/**
  * End game loop
  */

/**
 * Begin classes
 */

//Player class
function Player() {
    this.loadAssets();
    //This means it will take 0.1 second to complete an entire animation cycle
    this.ANIMATION_CYCLE_SPEED = 100 / 4; 
    this.anim_timer = this.ANIMATION_CYCLE_SPEED;
}

//Load all graphical assets
Player.prototype.loadAssets = function() {
    this.velocity = 0;
    this.sprite = new Image();
    this.SPRITE_STRIDE = 24;
    this.totalStride = 0;
    var player = this;
    this.sprite.onload = function() {
        player.renderReady = true;
        fatty_log(INFO_LEVEL, "Loaded player asset");

        //Calculate the size of the player
        var ratio = 34 / 24;

        player.height = fatty_canvas.height * 0.05;
        player.width = player.height * ratio;

        fatty_log(INFO_LEVEL, "Player resized to " + player.width + "x" + player.height);

        player.x =  fatty_canvas.width * 0.1;
        player.y = (fatty_canvas.height * 0.5) - player.height * 0.5;
    }
    this.rotation = 0;
    this.sprite.src = './assets/bird.png';
}

Player.prototype.fly = function() {
    //Apply force upwards
    this.velocity = upwards_force;
}

//Update function
Player.prototype.update = function(deltaMS) {
    this.velocity += gravity * (deltaMS / 1000);
    this.y += this.velocity * (deltaMS / 1000);

    this.rotation = Math.min((this.velocity / 1000) * 90, 90);
}

//Draw function
Player.prototype.draw = function(deltaMS) {
    if(this.renderReady) {  
        if(this.anim_timer <= 0) {
            if(this.totalStride + this.SPRITE_STRIDE < this.sprite.height) {
                this.totalStride += this.SPRITE_STRIDE;
            } else {
                this.totalStride = 0;
            }
            this.anim_timer = this.ANIMATION_CYCLE_SPEED;
        } else {
            this.anim_timer -= deltaMS;
        }
        fatty_context.save();
        fatty_context.translate(this.x , this.y);
        fatty_context.rotate(this.rotation * Math.PI/180);
        fatty_context.drawImage(this.sprite, 0, this.totalStride, 34, this.SPRITE_STRIDE, (-this.width / 2), -this.height/2, this.width, this.height);
        fatty_context.restore();                
    }
}

//End player class

//Start Background class
function Background() {
    this.floorLevel = 350;
    this.floorHeight = 30;
    this.backgroundHeight =  110;
    this.floorX = 0;
    this.ceilingX = 0;
    this.bgX = 0;
    
    this.loadAssets();
}

Background.prototype.loadAssets = function() {
    this.floorSprite = new Image();
    this.ceilingSprite = new Image();
    this.backgroundSprite = new Image();
    var bg = this;
    this.loadcount = 0;

    var onLoaded = function() {
        bg.loadcount++;

        if(bg.loadcount === 3) {
            bg.renderReady = true;

            fatty_log(INFO_LEVEL, "Successfully loaded all background assets");

            //Calculate ratios
            var floor_ratio = bg.floorSprite.width / (bg.floorSprite.height * 0.8);
            var ceiling_ratio = bg.floorSprite.width / bg.floorSprite.height;
            var bg_ratio = bg.floorSprite.width / bg.floorSprite.height;

            //Calculate real widths and heights
            bg.ceiling_height = fatty_canvas.height * 0.05;
            bg.ceiling_width = bg.ceiling_height * ceiling_ratio;

            bg.floor_height = fatty_canvas.height * 0.2;
            bg.floor_width = bg.floor_height * floor_ratio;
            bg.floorLevel = fatty_canvas.height - (bg.floor_height); //Added some padding, do we need it?

            //Calculate background posistion
            bg.bgY = (bg.floorLevel - bg.backgroundSprite.height);

            //Calculate stride (We could do this dynamically each run, but do we really want to?)
            bg.FLOOR_STRIDE = Math.ceil((fatty_canvas.width + bg.floor_width) / bg.floor_width);
            bg.CEILING_STRIDE = Math.ceil((fatty_canvas.width + bg.ceiling_width) / bg.ceiling_width);
            bg.BG_STRIDE = Math.ceil((fatty_canvas.width + bg.backgroundSprite.width) / bg.backgroundSprite.width);
        }
    }
    this.floorSprite.onload = onLoaded;
    this.ceilingSprite.onload = onLoaded;
    this.backgroundSprite.onload = onLoaded;

    this.floorSprite.src = './assets/land.png';
    this.ceilingSprite.src = './assets/ceiling.png';
    this.backgroundSprite.src = './assets/sky.png';
}

Background.prototype.update = function(deltaMS) {
    this.floorX -= background_velocity * (deltaMS / 1000);
    this.ceilingX -= background_velocity * (deltaMS / 1000);
    this.bgX -= background_velocity * (deltaMS / 1000);

    if(this.floorX < -this.floor_width ) {
        this.floorX += this.floor_width ;
    }
    if(this.ceilingX < -this.ceiling_width) {
        this.ceilingX += this.ceiling_width;
    }
    if(this.bgX < -this.backgroundSprite.width) {
        this.bgX += this.backgroundSprite.width;
    }
}

Background.prototype.draw = function(deltaMS) {
    if(this.renderReady) {
        var i = 0;
        //Render floor
        for(i = 0; i < this.FLOOR_STRIDE; i++) {
            fatty_context.drawImage(this.floorSprite, this.floorX + (this.floor_width * i), this.floorLevel, this.floor_width, this.floor_height);
        }
        //Render ceiling
        for(i = 0; i < this.CEILING_STRIDE; i++) {
            fatty_context.drawImage(this.ceilingSprite, this.ceilingX + (this.ceiling_width * i), 0, this.ceiling_width, this.ceiling_height);
        }
        //Render background
        for(i = 0; i < this.BG_STRIDE; i++) {
            fatty_context.drawImage(this.backgroundSprite, this.bgX + (this.backgroundSprite.width * i), this.bgY);
        }
    }
}

//End Background class

//Begin states

//This is the state we're in before we start the game
function PreState() {
}

PreState.prototype.onStart = function() {
    if(!current_player) {
        fatty_log(VERBOSE_LEVEL, "No player created yet, creating..");
        current_player = new Player();
    } else {
        fatty_log(VERBOSE_LEVEL, "Player already exists, reseting..");
        //Just reset to avoid loading assets twice
    }
}

PreState.prototype.onUpdate = function(deltaMS) {
    //update player
    current_player.update(0); //We send 0 as we dont want the physiscs so start working
    current_player.draw(deltaMS);
}

PreState.prototype.onEnd = function() {
    //Should remove start overlay and shit here
}

//Game runing state
function RunningState() {

}

RunningState.prototype.onStart = function() {
    gameRunning = true;
}

RunningState.prototype.onUpdate = function(deltaMS) {
    //update player
    current_player.update(deltaMS);
    current_player.draw(deltaMS);
}

RunningState.prototype.onEnd = function() {
    gameRunning = false;
}

//End states

//Key listeners
window.onkeyup = function(e) {
    var code = e.keyCode ? e.keyCode : e.which;

    if(code === 32) {
        if(current_player && gameRunning) {
            current_player.fly();
        }
    } else if(code === 80) {
        if(!(current_state instanceof RunningState)) {
            switchState(new RunningState());
        }
    }
}

/**
 * End classes
 */

/**
 * Debug functions
 */
//Handles 0 = Verbose, 1 = Info, 2 = Debug, 3 = Error
var ERROR_LEVEL = 3;
var DEBUG_LEVEL = 2;
var INFO_LEVEL = 1;
var VERBOSE_LEVEL = 0;
var current_log_level = 2;
function fatty_log(level, msg, ...optionalParams) {

    if(current_log_level >= level) 
        return;

    switch(level) {
        case 0: 
            console.log(msg, optionalParams);
            break;
        case 1:
            console.info(msg, optionalParams);        
            break;
        case 2:
            console.debug(msg, optionalParams);    
            break;
        case 3: 
            console.error(msg, optionalParams);        
            break;
    }
}