//Globals
var fatty_canvas;
var fatty_context;
var current_state; 
var current_player;
var current_background;
var current_pipes = [];
var current_pipe_manager;

//This was calibrated on a 600x400 canvas - I'd recommend you calibrating on a 600x400 canvas aswell if you are not happy with the feeling
var gravity = 700;
var upwards_force = -200;

var background_velocity = 100; //?

var interval;
var intervalSpeed = 1000 / 30; //Update 30 times a second

var gameRunning = false;
var rendering = false;
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
        if(current_player && gameRunning) {
            mousedown = true;
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
}

function switchState(state) {
    if(current_state) {
        current_state.onEnd();
    }
    current_state = state;
    state.onStart();    
}

/**
 * Begin game loop - this loop is naive and doesnt catchup very well. But will do the job for now
 */
function gameLoop() {
    //We could optimize this by only drawing the ceiling 
    fatty_context.fillRect(0, 0, fatty_canvas.width, fatty_canvas.height);    

    var deltaMS = Date.now() - fatty_timer;
    fatty_timer = Date.now();

    //Handle any mouse events
    handleMouseDown();

    current_state.onUpdate(deltaMS);

    if(rendering) {
        requestAnimFrame( gameLoop );    
    } else {
        //Call one last update with 0 time since we wanna stop drawing. This prevents the overlay fillrect from "deleting" everything
        current_state.onUpdate(0);
        fatty_log(INFO_LEVEL, "Game loop stopped.");
    }
}

function startGameLoop() {
    fatty_log(INFO_LEVEL, "Starting gameloop..");
    rendering = true;
    gameLoop();
}

//Sets rendering to false which will stop the gameloop
function stopGameLoop() {
    fatty_log(INFO_LEVEL, "Stopping gameloop..");
    rendering = false;
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
function Player(backgroundObject) {
    this.loadAssets();
    //This means it will take 0.1 second to complete an entire animation cycle
    this.ANIMATION_CYCLE_SPEED = 100 / 4; 
    this.anim_timer = this.ANIMATION_CYCLE_SPEED;
    this.backgroundObject = backgroundObject;
}

//Load all graphical assets
Player.prototype.loadAssets = function() {
    this.velocity = 0;
    this.sprite = new Image();
    this.SPRITE_STRIDE = 24; //The height of each model in the sprite
    this.totalStride = 0;
    var player = this;
    this.sprite.onload = function() {
        player.renderReady = true;
        fatty_log(INFO_LEVEL, "Loaded player asset");

        //Calculate the size of the player
        var ratio = player.sprite.width / player.SPRITE_STRIDE;

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

    //Correct my height to collide with the ceiling
    if(this.y <= this.backgroundObject.ceiling_height + (this.height / 2)) {
        this.y = this.backgroundObject.ceiling_height + (this.height / 2);
    }
}

//Returns a bounding box of the player
//TODO: This bounding box doesnt accout for rotations, fix
Player.prototype.getBoundingBox = function() {
    return { topLeft: { x: this.x - this.width/2, y: this.y - this.height/2 }, width: this.width, height: this.height };
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

//Start pipe manager class

function PipeManager(playerObject, backgroundObject) {
    this.playerObject = playerObject;
    this.backgroundObject = backgroundObject;
    this.assets = {};
    this.loadAssets();
    this.count = 1;
    this.pipeSpacing = fatty_canvas.width * 0.33; //33% of the screen width between each pipe
    this.currentSpacing = this.pipeSpacing;
}

PipeManager.prototype.loadAssets = function() {
    this.assets.upwardsSprite = new Image();
    this.assets.downwardsSprite = new Image();
    this.assets.pipePatternSprite = new Image();
    this.spriteCount = 3;
    var me = this;
    var onloaded = function () {
        me.spriteCount--;

        if(me.spriteCount === 0) {

            var ratio = me.assets.downwardsSprite.height / me.assets.downwardsSprite.width;
            //Pipe heights are the same regardless of orientation
            me.assets.pipeWidth = me.playerObject.width * 1.5; //150% wider then the player
            me.assets.pipeHeight = me.assets.pipeWidth * ratio;            

            //Calculate the pattern heights and strides
            me.assets.patternHeight = me.assets.pipePatternSprite.height;

            me.readyUpdate = true;            
            fatty_log(VERBOSE_LEVEL, "Successfully loaded pipe assets..");
        }
    }

    this.assets.upwardsSprite.src = './assets/pipe-up.png';
    this.assets.downwardsSprite.src = './assets/pipe-down.png';
    this.assets.pipePatternSprite.src = './assets/pipe.png';

    this.assets.upwardsSprite.onload = onloaded;
    this.assets.downwardsSprite.onload = onloaded;
    this.assets.pipePatternSprite.onload = onloaded;
}

PipeManager.prototype.update = function(deltaMS) {
    if(!this.readyUpdate) {
        return;
    }

    //Delete pipes
    for(var i = current_pipes.length - 1; i >= 0; i--) {
        if(current_pipes[i].x < -this.assets.pipeWidth) {
            current_pipes.splice(i, 1);
        }
    }

    //Create new if needed
    this.currentSpacing -= background_velocity * (deltaMS / 1000);
    if(this.currentSpacing < 0) {
        this.createNewPipe();
        this.currentSpacing = this.pipeSpacing;
    }

    //Check pipe collisions here maybe?
}

PipeManager.prototype.createNewPipe = function() {
    current_pipes.push(new Pipe(this.backgroundObject, this.playerObject, this.assets))
}

//End pipe manager class

//Start Pipe class

function Pipe(backgroundObject, playerObject, assets) {
    this.renderReady = false;
    this.backgroundObject = backgroundObject;
    this.playerObject = playerObject;

    //Save sprites
    this.upwardsSprite = assets.upwardsSprite;
    this.downwardsSprite = assets.downwardsSprite;
    this.pipePatternSprite = assets.pipePatternSprite;

    //Precalculated scaling
    this.pipeHeight = assets.pipeHeight;
    this.pipeWidth = assets.pipeWidth;
    this.patternHeight = assets.patternHeight;

    console.log(assets);

    this.loadAssets();
}

Pipe.prototype.loadAssets = function() {
    this.x = fatty_canvas.width;
    //TEST 
    //TODO: Move this to a manager that just creates lightweight copies of this Pipe. We should never load the assets more then once
    this.boxTop = 140;
    this.boxBottom = 230;

    this.upwardsStride = ((this.boxTop - this.pipeHeight) - this.backgroundObject.ceiling_height) / this.patternHeight;
    this.downwardsStride =  (this.backgroundObject.floorLevel - (this.boxBottom + this.pipeHeight)) / this.patternHeight;
}

Pipe.prototype.update = function(deltaMS) {
    this.x -= background_velocity * (deltaMS / 1000);
}

Pipe.prototype.draw = function(deltaMS) {
    //Draw top pipe
    //Draw top part then repeat until we reach ceiling level
    fatty_context.drawImage(this.downwardsSprite, this.x, (this.boxTop - this.pipeHeight), this.pipeWidth, this.pipeHeight);
    //Draw the pattern upwards
    var i;
    // for(i = 1; i < this.upwardsStride; i++) {
    //     fatty_context.drawImage(this.pipePatternSprite, this.x, (this.boxTop - this.pipeHeight) - i, this.pipeWidth, 1);
    // }

    //Draw bottom pipe
    fatty_context.drawImage(this.upwardsSprite, this.x, this.boxBottom, this.pipeWidth, this.pipeHeight);
    // for(i = 1; i < this.downwardsStride; i++) {
    //     fatty_context.drawImage(this.pipePatternSprite, this.x, (this.boxBottom + this.pipeHeight) + i, this.pipeWidth, 1);
    // }
}

//End pipe class

//Begin states

//This is the state we're in before we start the game
function PreState() {
}

PreState.prototype.onStart = function() {
    //Create background
    if(!current_background) {
        fatty_log(VERBOSE_LEVEL, "No background created, creating..");
        current_background = new Background();
    } else {
        fatty_log(VERBOSE_LEVEL, "Background already exists, reseting..");        
        //Reset shit
    }

    if(!current_player) {
        fatty_log(VERBOSE_LEVEL, "No player created yet, creating..");
        current_player = new Player(current_background);
    } else {
        fatty_log(VERBOSE_LEVEL, "Player already exists, reseting..");
        //Just reset to avoid loading assets twice
        //TODO: Fix reset function
    }

    if(!current_pipe_manager) {
        fatty_log(VERBOSE_LEVEL, "No pipe manager created yet, creating..");
        current_pipe_manager = new PipeManager(current_player, current_background);
    } else {
        fatty_log(VERBOSE_LEVEL, "Pipe manager exists, reseting..");
    }
    
    fatty_timer = Date.now();
    fatty_context.fillStyle = "#4ec0ca";

    startGameLoop();
}

PreState.prototype.onUpdate = function(deltaMS) {
    //update
    current_background.update(deltaMS);

    //draw
    current_background.draw(deltaMS);    
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
    //This might be a bit taboo, but there is no way better to check for collision since any collision will finish the game
    if(this.isPlayerCollided(current_player, current_background)) {
        //Exit game
        switchState(new GameOverState());
    } else {
        //update
        current_background.update(deltaMS);
        current_player.update(deltaMS);  
        current_pipe_manager.update(deltaMS);      
        current_pipes.forEach(pipe => {
            pipe.update(deltaMS);
        });

        //draw
        current_background.draw(deltaMS);    
        current_pipes.forEach(pipe => {
            pipe.draw(deltaMS);
        });
        current_player.draw(deltaMS);
    }
}

RunningState.prototype.isPlayerCollided = function(playerObject, backgroundObjects, pipeObjectsList) {
    //Check if we have collided with the world
    //Check floor
    var pbb = playerObject.getBoundingBox();
    if( (pbb.topLeft.y + pbb.height) > backgroundObjects.floorLevel ) {
        return true;
    }
    //Check the pipes seperate as they can be optimized

    return false;
}

RunningState.prototype.onEnd = function() {
    gameRunning = false;
}

//GameOverState start

function GameOverState() {

}

GameOverState.prototype.onStart = function() {
    stopGameLoop();    
}

//This is a bit of clever haxxor. This will get called once, enuff to draw the entire screen once more  and lock it
GameOverState.prototype.onUpdate = function(deltaMS) {    
    //draw
    current_background.draw(deltaMS);    
    current_player.draw(deltaMS);
}

GameOverState.prototype.onEnd = function() {

}

//GameOverState end

//End states

//Test
var mousedown = false;

function handleMouseDown() {
    if(mousedown) {
        if(current_player && gameRunning) {
            current_player.fly();
        }
    }
    mousedown = false;
}

//Key listeners
window.onkeyup = function(e) {
    var code = e.keyCode ? e.keyCode : e.which;

    if(code === 32) {
        if(current_player && gameRunning) {
            mousedown = true;
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

    if(level < current_log_level) 
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