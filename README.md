# TODO's
* Load assets only once, check on setup (AKA. Sprite dictionary)
* Cleanup function (Cleanup game if you wanna remove it)
* Debug drawing

# ISSUES

* Player sprite scaling issues

# REACT PORT

## Quick ported the game to react

### How to build

1. npm run build
2. Files in /lib are now ready to be linked via npm or published as a package
3. Create or download assets from github repo. Names must match 
4. Add Game to your react app, ex. `<Game width={800} height={600} assetPath={"."} />`

### React notes

It is also possible to just copy the entire src lib and incorporate into your own solution


Below is a example component utilizing the Game component from the lib
It creates a controller that recieves callbacks when the game is over or when the player gets score

** Note - After the first call to startGame you must call resetGame before calling startGame. **

```
import React, { Component } from "react";
import { Game } from "FattyBird";
import floor from "./assets/land.png";
import background from "./assets/sky.png";
import ceiling from "./assets/ceiling.png";
import pipeup from "./assets/pipe-up.png";
import pipedown from "./assets/pipe-down.png";
import pipe from "./assets/pipe.png";
import bird from "./assets/bird.png";

export default class Test extends Component {

    constructor() {
        super();

        this.assetStruct = {
            floorSprite: floor,
            backgroundSprite: background,
            ceilingSprite: ceiling,
            upwardsSprite: pipeup,
            downwardsSprite: pipedown,
            pipePatternSprite: pipe,
            birdSprite: bird
        }
        const self = this;
        this.controller = {
            cbAddHighscore: (totalScore) => {
                self.addHighScore(totalScore); 
            },
            cbGameOver: (totalScore) => {
                self.gameOver(totalScore);
            }   
        }

        this.startGame = this.startGame.bind(this);
        this.resetGame = this.resetGame.bind(this);
        this.gameOver = this.gameOver.bind(this);
        this.addHighScore = this.addHighScore.bind(this);

        this.score = 0;
    }

    render() {
        return ( 
            <div>
                <button onClick={ this.startGame } >Start Game</button>
                <button onClick={ this.resetGame } >Rest Game</button>
                <Game width={800} height={600}
                        assetStruct={ this.assetStruct }
                        controller = { this.controller }
                        ref= { instance => { this.game = instance }}
                />
            </div>
        );
    }

    resetGame() {
        //This will start the game right away. 
        this.game.resetGame(false);
    }

    startGame() {
        this.game.startGame();
    }

    addHighScore(totalScore) {
        this.score = totalScore;

        console.log(this.score);
    }

    gameOver(totalScore) {
        //Handle game over
    }


}
```