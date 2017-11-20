//Globals
var G_FATTY_CANVAS;

//Needs get called once - If widht and heights are specified use it, otherwise use the containerid dimensions
function setup(containerId, width, height) {
    var containerElement = document.getElementById(containerId);

    console.log(containerElement);

    if(!containerElement) {
        console.error('Couldnt locate container element by id: ' + containerId);
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

    console.log('Successfully created a ' + G_FATTY_CANVAS.width + 'x' + G_FATTY_CANVAS.height + 'px canvas');
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