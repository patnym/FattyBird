import { GameOverState } from "./GameOverState";

export class RunningState {

    constructor(GameObj) {
        this.GameObj = GameObj;
        this.globals = GameObj.globals;
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
            this.globals.current_pipes.forEach(pipe => {
                pipe.update(deltaMS);
            });

            //draw
            this.globals.current_background.draw(deltaMS);    
            this.globals.current_pipes.forEach(pipe => {
                pipe.draw(deltaMS);
            });
            this.globals.current_player.draw(deltaMS);
        }
    }

    isPlayerCollided(playerObject, backgroundObjects, pipeObjectsList) {
        //Check if we have collided with the world
        //Check floor
        var pbb = playerObject.getBoundingBox();
        if( (pbb.topLeft.y + pbb.height) >= backgroundObjects.floorLevel ) {
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