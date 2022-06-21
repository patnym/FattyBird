import { VERBOSE_LEVEL, getRandomInt } from "../Game";
import { Pipe } from "./Pipe";
import { GameOverState } from "../states/GameOverState";

export class PipeManager {

    constructor(GameObj, playerObject, backgroundObject) {
        this.GameObj = GameObj;
        this.globals = GameObj.globals;
        this.playerObject = playerObject;
        this.backgroundObject = backgroundObject;
        this.assets = {};
        this.loadAssets();
        this.pipeSpacing = this.globals.background_velocity * 1.5;
        this.velocity = this.globals.background_velocity / 1000;
    }

    init() {
        this.currentSpacing = this.pipeSpacing;
        this.globals.current_pipes = [];
    }

    loadAssets() {
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

                me.assets.fullPattern = document.createElement("canvas");
                var tCtx = me.assets.fullPattern.getContext("2d");
                me.assets.fullPattern.height = me.globals.fatty_canvas.height;
                me.assets.fullPattern.width = me.assets.pipeWidth;
                var PATTERN_STRIDE = me.assets.fullPattern.height / me.assets.patternHeight;
                for(var i = 0; i < PATTERN_STRIDE; i++) {
                    tCtx.drawImage(me.assets.pipePatternSprite, 0, i, me.assets.pipeWidth, 1);
                }

                me.readyUpdate = true;            
                me.GameObj.fatty_log(VERBOSE_LEVEL, "Successfully loaded pipe assets..");

                me.init();
            }
        }

        // this.assets.upwardsSprite.src = this.globals.assetPath + '/assets/pipe-up.png';
        // this.assets.downwardsSprite.src = this.globals.assetPath + '/assets/pipe-down.png';
        // this.assets.pipePatternSprite.src = this.globals.assetPath + '/assets/pipe.png';
        console.log("Loading", this.globals.assetStruct);
        this.assets.upwardsSprite.src = this.globals.assetStruct.upwardsSprite;
        this.assets.downwardsSprite.src = this.globals.assetStruct.downwardsSprite;
        this.assets.pipePatternSprite.src = this.globals.assetStruct.pipePatternSprite;

        this.assets.upwardsSprite.onload = onloaded;
        this.assets.downwardsSprite.onload = onloaded;
        this.assets.pipePatternSprite.onload = onloaded;
    }

    update(deltaMS) {
        if(!this.readyUpdate) {
            return;
        }

        //Delete pipes
        // for(this.i = this.globals.current_pipes.length - 1; this.i >= 0; this.i--) {
        //     if(this.globals.current_pipes[this.i].x < -this.assets.pipeWidth) {
        //         this.globals.current_pipes.splice(this.i, 1);
        //     }
        // }

        //Create new if needed
        this.currentSpacing -= this.velocity * deltaMS;
        if(this.currentSpacing < 0) {
            this.createNewPipe();
            this.currentSpacing = this.pipeSpacing;
        }

        //Check pipe collisions here maybe
        for(this.i = 0; this.i < this.globals.current_pipes.length; this.i++) {
            if(this.globals.current_pipes[this.i].isPlayerColliding(this.playerObject)) {
                this.GameObj.switchState(new GameOverState(this.GameObj));
            }
        }
    }

    createNewPipe() {
        var rPos = getRandomInt(this.backgroundObject.ceiling_height + this.globals.flyThroughPadding, this.backgroundObject.floorLevel - this.globals.flyThroughPadding - this.globals.flyThroughHeight);
        this.globals.current_pipes.push(new Pipe(this.GameObj, this.backgroundObject, this.playerObject, this.assets, rPos));
    }
}