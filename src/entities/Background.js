import { INFO_LEVEL } from "../Game";

//Start Background class
export class Background { 

    constructor(GameObj) {
        this.GameObj = GameObj;
        this.globals = GameObj.globals;
        this.loadAssets();
    }


    init() {
        this.floorX = 0;
        this.ceilingX = 0;
        this.bgX = 0;
    }

    loadAssets() {
        this.floorSprite = new Image();
        this.ceilingSprite = new Image();
        this.backgroundSprite = new Image();
        var bg = this;
        this.loadcount = 0;

        var onLoaded = function() {
            bg.loadcount++;

            if(bg.loadcount === 3) {
                bg.renderReady = true;

                bg.GameObj.fatty_log(INFO_LEVEL, "Successfully loaded all background assets");

                //Calculate ratios
                var floor_ratio = bg.floorSprite.width / (bg.floorSprite.height * 0.8);
                var ceiling_ratio = bg.floorSprite.width / bg.floorSprite.height;
                var bg_ratio = bg.floorSprite.width / bg.floorSprite.height;

                //Calculate real widths and heights
                bg.ceiling_height = fatty_canvas.height * 0.05;
                bg.ceiling_width = bg.ceiling_height * ceiling_ratio;

                bg.floor_height = bg.globals.fatty_canvas.height * 0.2;
                bg.floor_width = bg.floor_height * floor_ratio;
                bg.floorLevel = bg.globals.fatty_canvas.height - (bg.floor_height); //Added some padding, do we need it?

                //Calculate background posistion
                bg.bgY = (bg.floorLevel - bg.backgroundSprite.height);

                //Calculate stride
                bg.FLOOR_STRIDE = Math.ceil(((bg.globals.fatty_canvas.width * 2) + bg.floor_width) / bg.floor_width);
                bg.CEILING_STRIDE = Math.ceil(((bg.globals.fatty_canvas.width * 2) + bg.ceiling_width) / bg.ceiling_width);
                bg.BG_STRIDE = Math.ceil(((bg.globals.fatty_canvas.width * 2) + bg.backgroundSprite.width) / bg.backgroundSprite.width);

                //Draw everything on a offset canvas instead
                //Create the upwards pattern
                bg.backgroundPattern = document.createElement("canvas");
                var tCtx = bg.backgroundPattern.getContext("2d");
                bg.backgroundPattern.height = bg.globals.fatty_canvas.height;
                bg.backgroundPattern.width = bg.globals.fatty_canvas.width * 2;
                tCtx.fillStyle = "#4ec0ca";
                tCtx.fillRect(0, 0, bg.globals.fatty_canvas.width * 2, bg.globals.fatty_canvas.height); 
                var i;
                //Render floor
                for(i = 0; i < bg.FLOOR_STRIDE; i++) {
                    tCtx.drawImage(bg.floorSprite, (bg.floor_width * i), bg.floorLevel, bg.floor_width, bg.floor_height);
                }
                //Render ceiling
                for(i = 0; i < bg.CEILING_STRIDE; i++) {
                    tCtx.drawImage(bg.ceilingSprite, (bg.ceiling_width * i), 0, bg.ceiling_width, bg.ceiling_height);
                }
                //Render background
                for(i = 0; i < bg.BG_STRIDE; i++) {
                    tCtx.drawImage(bg.backgroundSprite, (bg.backgroundSprite.width * i), bg.bgY);
                }

                console.log("Drawn background to off canvas", bg.FLOOR_STRIDE, bg.CEILING_STRIDE, bg.BG_STRIDE);

                bg.init();
            }
        }
        this.floorSprite.onload = onLoaded;
        this.ceilingSprite.onload = onLoaded;
        this.backgroundSprite.onload = onLoaded;

        // this.floorSprite.src = this.globals.assetPath + '/assets/land.png';
        // this.ceilingSprite.src = this.globals.assetPath + '/assets/ceiling.png';
        // this.backgroundSprite.src = this.globals.assetPath + '/assets/sky.png';
        this.floorSprite.src = this.globals.assetStruct.floorSprite;
        this.ceilingSprite.src = this.globals.assetStruct.ceilingSprite;
        this.backgroundSprite.src = this.globals.assetStruct.backgroundSprite;
    }

    update(deltaMS) {
        this.floorX -= this.globals.background_velocity * (deltaMS / 1000);

        if(this.floorX < -this.globals.fatty_canvas.width * 2) {
           this.floorX += this.floorX * -1;
        }
    }

    draw(deltaMS) {
        if(this.renderReady) {
            this.globals.fatty_context.drawImage(this.backgroundPattern, this.floorX, 0);
            this.globals.fatty_context.drawImage(this.backgroundPattern, this.floorX + (this.globals.fatty_canvas.width * 2), 0);
        }
    }
}