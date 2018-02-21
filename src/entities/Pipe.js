export class Pipe {
    constructor(GameObj, backgroundObject, playerObject, assets, boxTop) {
        this.GameObj = GameObj;
        this.globals = GameObj.globals;
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

        this.boxTop = boxTop;
        
        this.loadAssets();
    }

    loadAssets() {
        this.x = fatty_canvas.width;
        this.boxBottom = this.boxTop + this.globals.flyThroughHeight; //The space is 15% of the view height

        this.downwardsStride = ((this.boxTop - this.pipeHeight) - this.backgroundObject.ceiling_height) / this.patternHeight;
        this.upwardsStride =  (this.backgroundObject.floorLevel - (this.boxBottom + this.pipeHeight)) / this.patternHeight;
        
        //Create the downwardspattern
        this.downwardsPattern = document.createElement("canvas");
        var tCtx = this.downwardsPattern.getContext("2d");
        var pipeLength = this.boxTop - this.pipeHeight;
        this.downwardsPattern.height = pipeLength;
        this.downwardsPattern.width = this.pipeWidth;
        for(var i = 0; i < this.downwardsStride; i++) {
            tCtx.drawImage(this.pipePatternSprite, 0, i, this.pipeWidth, 1);
        }

        //Create the upwards pattern
        this.upwardsPattern = document.createElement("canvas");
        tCtx = this.upwardsPattern.getContext("2d");
        pipeLength = this.backgroundObject.floorLevel - (this.boxBottom + this.pipeHeight);
        this.upwardsPattern.height = pipeLength;
        this.upwardsPattern.width = this.pipeWidth;
        for(var i = 0; i < this.upwardsStride; i++) {
            tCtx.drawImage(this.pipePatternSprite, 0, i, this.pipeWidth, 1);
        }
    }

    update(deltaMS) {
        this.x -=  this.globals.background_velocity * (deltaMS / 1000);
    }

    draw(deltaMS) {
        //Draw top pipe
        //Draw top part then repeat until we reach ceiling level
        this.globals.fatty_context.drawImage(this.downwardsSprite, Math.floor(this.x), Math.floor(this.boxTop - this.pipeHeight), Math.floor(this.pipeWidth), Math.floor(this.pipeHeight));
        this.globals.fatty_context.drawImage(this.downwardsPattern, Math.floor(this.x) , Math.floor(this.backgroundObject.ceiling_height));

        //Draw bottom pipe
        this.globals.fatty_context.drawImage(this.upwardsSprite, Math.floor(this.x), Math.floor(this.boxBottom), Math.floor(this.pipeWidth), Math.floor(this.pipeHeight));
        this.globals.fatty_context.drawImage(this.upwardsPattern, Math.floor(this.x) , Math.floor(this.boxBottom + this.pipeHeight));
    }

    isPlayerColliding(playerObject) {
        //Check if player has entered
        if((playerObject.x + (playerObject.width / 2)) < this.x) {
            return false;
        } else if((playerObject.x - (playerObject.width / 2)) > (this.x + this.pipeWidth) && this.playerEntered) {
            this.playerEntered = false;
            this.GameObj.addToHighscore();
            return false;
        } else if(((playerObject.x + (playerObject.width / 2)) > this.x && (playerObject.x + (playerObject.width / 2)) < this.x + this.pipeWidth) ||
                    ((playerObject.x  - (playerObject.width / 2)) > this.x && (playerObject.x - (playerObject.width / 2)) < this.x + this.pipeWidth))  {
            this.playerEntered = true;      
            //Check vertical collision
            if((playerObject.y - (playerObject.height / 2) < this.boxTop) || (playerObject.y + (playerObject.height / 2) > this.boxBottom)) {
                return true;
            }
        }
    }
}