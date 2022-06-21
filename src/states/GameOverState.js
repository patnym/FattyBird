import { PreState } from "./PreState";

export class GameOverState{

    constructor(GameObj) {
        this.GameObj = GameObj;
        this.globals = GameObj.globals;
        this.i = 0;
    }

    onStart() {
        //stopGameLoop();
        this.GameObj.gameOver();    
    }

    //This is a bit of clever haxxor. This will get called once, enuff to draw the entire screen once more  and lock it
    onUpdate(deltaMS) {   
        this.globals.current_player.update(deltaMS); 
        //draw
        this.globals.current_background.draw(0);
        for(this.i = 0; this.i < this.globals.current_pipes.length; this.i++) {
            this.globals.current_pipes[this.i].draw(0);
        }
        this.globals.current_player.draw(0);
    }

    onKeyDown() {
        //no-op
    }

    onEnd() {
    }
}