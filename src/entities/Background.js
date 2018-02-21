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

                //Calculate stride (We could do this dynamically each run, but do we really want to?)
                bg.FLOOR_STRIDE = Math.ceil((bg.globals.fatty_canvas.width + bg.floor_width) / bg.floor_width);
                bg.CEILING_STRIDE = Math.ceil((bg.globals.fatty_canvas.width + bg.ceiling_width) / bg.ceiling_width);
                bg.BG_STRIDE = Math.ceil((bg.globals.fatty_canvas.width + bg.backgroundSprite.width) / bg.backgroundSprite.width);

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
        this.ceilingX -= this.globals.background_velocity * (deltaMS / 1000);
        this.bgX -= this.globals.background_velocity * (deltaMS / 1000);

        if(this.floorX < -this.floor_width ) {
            this.floorX += this.floor_width ;
        }
        if(this.ceilingX < -this.ceiling_width) {
            this.ceilingX += this.ceiling_width;
        }
        if(this.bgX < -this.backgroundSprite.width) {
            this.bgX += this.backgroundSprite.width;
        }
    }

    draw(deltaMS) {
        if(this.renderReady) {
            var i = 0;
            //Render floor
            for(i = 0; i < this.FLOOR_STRIDE; i++) {
                this.globals.fatty_context.drawImage(this.floorSprite, this.floorX + (this.floor_width * i), this.floorLevel, this.floor_width, this.floor_height);
            }
            //Render ceiling
            for(i = 0; i < this.CEILING_STRIDE; i++) {
                this.globals.fatty_context.drawImage(this.ceilingSprite, this.ceilingX + (this.ceiling_width * i), 0, this.ceiling_width, this.ceiling_height);
            }
            //Render background
            for(i = 0; i < this.BG_STRIDE; i++) {
                this.globals.fatty_context.drawImage(this.backgroundSprite, this.bgX + (this.backgroundSprite.width * i), this.bgY);
            }
        }
    }
}