import React, { Component } from "react";
import { PreState } from "./states/PreState";

//Handles 0 = Verbose, 1 = Info, 2 = Debug, 3 = Error
export var ERROR_LEVEL = 3;
export var DEBUG_LEVEL = 2;
export var INFO_LEVEL = 1;
export var VERBOSE_LEVEL = 0;

var globs;

export class Game extends Component {

    constructor() {
        super();
        //TODO: This is hella stupid aswell, but this is a first quick port
        //Create all globals here
        //Globals
        this.globals = {};
        this.globals.fatty_canvas = null;
        this.globals.fatty_context = null;
        this.globals.current_state = null; 
        this.globals.current_player = null;
        this.globals.current_background = null;
        this.globals.current_pipes = [];
        this.globals.current_pipe_manager = null;

        //This was calibrated on a 600x400 canvas - I'd recommend you calibrating on a 600x400 canvas aswell if you are not happy with the feeling
        this.globals.gravity = 700;
        this.globals.upwards_force = -200;

        this.globals.background_velocity = 100; //?

        this.globals.flyThroughHeight = -1; //Calculated during setup
        this.globals.flyThroughPadding = -1; //Calculated during setup

        this.globals.highscoreFontSize = 45; //Gets calculated via playerheight * 2 on PreState start

        this.globals.score = 0;

        this.globals.gameRunning = false;
        this.globals.rendering = false;
        this.globals.fatty_timer = -1;

        this.globals.assetPath = "";

        this.globals.current_log_level = 2;

        globs = this.globals;

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
    }

    //This will create the container element for our canvas
    render() {
        return (
            <div id="fatty_container_div"></div>
        );
    }

    componentDidMount() {
        this.fatty_bird_setup(this.props.width, this.props.height);
        this.globals.assetPath = this.props.assetPath;
    }

    //Needs get called once - If widht and heights are specified use it, otherwise use the containerid dimensions
    fatty_bird_setup(width, height) {
        var containerElement = document.getElementById("fatty_container_div");

        this.globals.current_log_level = VERBOSE_LEVEL;

        this.fatty_log(VERBOSE_LEVEL, containerElement);

        if(!containerElement) {
            this.fatty_log(ERROR_LEVEL, 'Couldnt locate container element by id: ' + containerId);
            return;
        }

        //Check if our canvas already exists
        this.globals.fatty_canvas = document.getElementById('fatty_canvas');

        if(!this.globals.fatty_canvas) {

            this.globals.fatty_canvas = document.createElement('canvas');

            this.globals.fatty_canvas.id = 'fatty_canvas';
            this.globals.fatty_canvas.width = width || containerElement.clientWidth;
            this.globals.fatty_canvas.height = height || containerElement.clientHeight;
            
            //Attach our canvas
            containerElement.appendChild(this.globals.fatty_canvas);

            this.globals.fatty_canvas.onmouseup = function(e) { 
                if(globs.current_player) {
                    globs.current_state.onKeyDown();
                }
            }
            //Key listeners
            window.onkeyup = function(e) {
                var code = e.keyCode ? e.keyCode : e.which;
                if(code === 32) {
                    globs.current_state.onKeyDown();
                }
            }

        }

        this.globals.fatty_context = this.globals.fatty_canvas.getContext('2d');

        this.fatty_log(INFO_LEVEL, 'Successfully created a ' + this.globals.fatty_canvas.width +
                     'x' + this.globals.fatty_canvas.height + 'px canvas');

        //Calibrate gravity based on height.
        this.globals.gravity *= this.globals.fatty_canvas.height / 400;
        this.globals.upwards_force *= this.globals.fatty_canvas.height / 400;
        this.globals.background_velocity *= this.globals.fatty_canvas.height / 400;

        this.globals.highscoreFontSize *= this.globals.fatty_canvas.height / 400;

        this.globals.flyThroughHeight = this.globals.fatty_canvas.height * 0.18;
        this.globals.flyThroughPadding = this.globals.fatty_canvas.height * 0.1;


        //Set the current state
        this.switchState(new PreState(this));
    }

    switchState(state) {
        if(this.globals.current_state) {
            this.globals.current_state.onEnd();
        }
        this.globals.current_state = state;
        state.onStart();    
    }

    startGameLoop() {
        this.fatty_log(INFO_LEVEL, "Starting gameloop..");
        this.globals.rendering = true;
        gameLoop();
    }

    //Sets rendering to false which will stop the gameloop
    stopGameLoop() {
        this.fatty_log(INFO_LEVEL, "Stopping gameloop..");
        this.globals.rendering = false;
    }

    addToHighscore() {
        this.globals.score++;
    
        this.fatty_log(INFO_LEVEL, "Score is: " + this.globals.score);
    }

    resetHighscore() {
        this.globals.score = 0;
    }

    /**
     * Debug functions
     */
    fatty_log(level, msg, ...optionalParams) {

        if(level < this.globals.current_log_level) 
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

}

function drawScore() {
    globs.fatty_context.save();
    globs.fatty_context.font = globs.highscoreFontSize + "px Impact";
    globs.fatty_context.fillStyle = "white";
    globs.fatty_context.textAlign = "center";
    globs.fatty_context.fillText(globs.score, globs.fatty_canvas.width/2, globs.current_background.ceiling_height + globs.highscoreFontSize); 
    globs.fatty_context.fillStyle = "black";
    globs.fatty_context.strokeText(globs.score, globs.fatty_canvas.width/2, globs.current_background.ceiling_height + globs.highscoreFontSize); 
    globs.fatty_context.restore();
}


/**
 * Begin game loop - this loop is naive and doesnt catchup very well. But will do the job for now
 */
function gameLoop() {
    //We could optimize this by only drawing the ceiling 
    globs.fatty_context.fillStyle = "#4ec0ca";
    globs.fatty_context.fillRect(0, 0, globs.fatty_canvas.width, globs.fatty_canvas.height);    

    var deltaMS = Date.now() - globs.fatty_timer;
    globs.fatty_timer = Date.now();

    //Handle any mouse events
    //handleMouseDown();

    globs.current_state.onUpdate(deltaMS);

    drawScore();
    
    if(globs.rendering) {
        requestAnimFrame( gameLoop );    
    } else {
        //Call one last update with 0 time since we wanna stop drawing. This prevents the overlay fillrect from "deleting" everything
        globs.current_state.onUpdate(0);
    }
}

/* Copied from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random */
export function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}