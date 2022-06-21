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
        this.fullPattern = assets.fullPattern;

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

        this.downPipeLength = ((this.boxTop - this.pipeHeight) - this.backgroundObject.ceiling_height);
        this.upPipeLength = (this.backgroundObject.floorLevel - (this.boxBottom + this.pipeHeight));

        this.upPipeY = this.boxBottom + this.pipeHeight;
    }

    update(deltaMS) {
        this.x -=  this.globals.background_velocity * (deltaMS / 1000);
    }

    draw(deltaMS) {
        //Draw top pipe
        //Draw top part then repeat until we reach ceiling level
        this.globals.fatty_context.drawImage(this.downwardsSprite, this.x, this.boxTop - this.pipeHeight, this.pipeWidth, this.pipeHeight);
        this.globals.fatty_context.drawImage(this.fullPattern, 0, 0, this.fullPattern.width, this.downPipeLength, this.x , this.backgroundObject.ceiling_height, this.fullPattern.width, this.downPipeLength);

        //Draw bottom pipe
        this.globals.fatty_context.drawImage(this.upwardsSprite, this.x, this.boxBottom, this.pipeWidth, this.pipeHeight);
        this.globals.fatty_context.drawImage(this.fullPattern, 0, 0, this.fullPattern.width, this.upPipeLength, this.x , this.upPipeY, this.fullPattern.width, this.upPipeLength);
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