import { PreState } from "./PreState";

export class GameOverState{

    constructor(GameObj) {
        this.GameObj = GameObj;
        this.globals = GameObj.globals;
    }

    onStart() {
        //stopGameLoop();    
    }

    //This is a bit of clever haxxor. This will get called once, enuff to draw the entire screen once more  and lock it
    onUpdate(deltaMS) {   
        this.globals.current_player.update(deltaMS); 
        //draw
        this.globals.current_background.draw(0);
        this.globals.current_pipes.forEach(pipe => {
            pipe.draw(0);
        });    
        this.globals.current_player.draw(0);
    }

    onKeyDown() {
        this.GameObj.switchState(new PreState(this.GameObj));
    }

    onEnd() {
        this.GameObj.stopGameLoop();
    }
}