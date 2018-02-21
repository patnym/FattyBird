import { GameOverState } from "./GameOverState";

export class RunningState {

    constructor(GameObj) {
        this.GameObj = GameObj;
        this.globals = GameObj.globals;
        this.i = 0;
        this.pbb = {};
    }

    onStart() {
        this.globals.gameRunning = true;
    }

    onUpdate(deltaMS) {
        //This might be a bit taboo, but there is no way better to check for collision since any collision will finish the game
        if(this.isPlayerCollided(this.globals.current_player, this.globals.current_background)) {
            //Exit game
            this.GameObj.switchState(new GameOverState(this.GameObj));
        } else {
            //update
            this.globals.current_background.update(deltaMS);
            this.globals.current_player.update(deltaMS);  
            this.globals.current_pipe_manager.update(deltaMS);
            for(this.i = 0; this.i < this.globals.current_pipes.length; this.i++) {
                this.globals.current_pipes[this.i].update(deltaMS);
            }

            //draw
            this.globals.current_background.draw(deltaMS);    
            for(this.i = 0; this.i < this.globals.current_pipes.length; this.i++) {
                this.globals.current_pipes[this.i].draw(deltaMS);
            }
            this.globals.current_player.draw(deltaMS);
        }
    }

    isPlayerCollided(playerObject, backgroundObjects, pipeObjectsList) {
        //Check if we have collided with the world
        //Check floor
        this.pbb = playerObject.getBoundingBox();
        if( (this.pbb.topLeft.y + this.pbb.height) >= backgroundObjects.floorLevel ) {
            return true;
        }
        return false;
    }

    onKeyDown() {
        this.globals.current_player.fly();
    }

    onEnd() {
        this.globals.gameRunning = false;
    }
}