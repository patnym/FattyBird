import { VERBOSE_LEVEL } from "../Game";
import { Background } from "../entities/Background";
import { Player } from "../entities/Player";
import { PipeManager } from "../entities/PipeManager";
import { RunningState } from "./RunningState";

//This is the state we're in before we start the game
export class PreState {

    //All objects must hold a reference to the game obj to reach globals
    constructor(GameObj) {
        this.GameObj = GameObj;
        this.globals = GameObj.globals;
    }

    onStart() {
        //Create background
        this.loading = false;
        if(!this.globals.current_background) {
            this.GameObj.fatty_log(VERBOSE_LEVEL, "No background created, creating..");
            this.globals.current_background = new Background(this.GameObj);
            this.loading = true;
        } else {
            this.GameObj.fatty_log(VERBOSE_LEVEL, "Background already exists, reseting..");        
            this.globals.current_background.init();
        }

        if(!this.globals.current_player) {
            this.GameObj.fatty_log(VERBOSE_LEVEL, "No player created yet, creating..");
            this.globals.current_player = new Player(this.GameObj, this.globals.current_background);
            this.loading = true;
        } else {
            this.GameObj.fatty_log(VERBOSE_LEVEL, "Player already exists, reseting..");
            this.globals.current_player.init();
        }

        if(!this.globals.current_pipe_manager) {
            this.GameObj.fatty_log(VERBOSE_LEVEL, "No pipe manager created yet, creating..");
            this.globals.current_pipe_manager = new PipeManager(this.GameObj, this.globals.current_player, this.globals.current_background);
            this.loading = true;
        } else {
            this.GameObj.fatty_log(VERBOSE_LEVEL, "Pipe manager exists, reseting..");
            this.globals.current_pipe_manager.init();
        }
        
        this.globals.fatty_timer = Date.now();
        this.globals.fatty_context.fillStyle = "#4ec0ca";

        this.GameObj.resetHighscore();
        
        if(this.loading) {
            setTimeout(() => { this.GameObj.startGameLoop() }, 500); //Give it 500 ms to load if its first time
        } else {
            this.GameObj.startGameLoop();
        }
    }

    onUpdate(deltaMS) {
        //update
        this.globals.current_background.update(deltaMS);

        //draw
        this.globals.current_background.draw(deltaMS);    
        this.globals.current_player.draw(deltaMS);
    }

    onKeyDown() {
        this.GameObj.switchState(new RunningState(this.GameObj));
        this.globals.current_state.onKeyDown();
    }

    onEnd() {
        //Should remove start overlay and shit here
    }
}