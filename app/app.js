//Globals
var G_FATTY_CANVAS;

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
    G_FATTY_CANVAS = document.getElementById('fatty_canvas');

    if(!G_FATTY_CANVAS) {

    G_FATTY_CANVAS = document.createElement('canvas');

    G_FATTY_CANVAS.id = 'fatty_canvas';
    G_FATTY_CANVAS.width = width | containerElement.clientWidth;
    G_FATTY_CANVAS.height = height | containerElement.clientHeight;
    
    //Attach our canvas
    containerElement.appendChild(G_FATTY_CANVAS);

    }

    fatty_log(INFO_LEVEL, 'Successfully created a ' + G_FATTY_CANVAS.width + 'x' + G_FATTY_CANVAS.height + 'px canvas');
}

/**
 * Begin game loop
 */

/**
  * End game loop
  */

/**
 * Begin classes
 */

//Player class
function Player() {

    this.loadAssets();
}

//Load all graphical assets
Player.prototype.loadAssets = function() {

}

//Update function
Player.prototype.update = function() {

}

//Draw function
Player.prototype.draw = function() {

}

//End player class


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