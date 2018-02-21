import { INFO_LEVEL } from "../Game";

//Player class
export class Player {

    constructor(GameObj, backgroundObject) {
        this.GameObj = GameObj;
        this.globals = GameObj.globals;
        this.loadAssets();
        //This means it will take 0.1 second to complete an entire animation cycle
        this.ANIMATION_CYCLE_SPEED = 100 / 4; 
        this.anim_timer = this.ANIMATION_CYCLE_SPEED;
        this.backgroundObject = backgroundObject;
        this.rotationFactor = this.globals.upwards_force * -2.2;
    }

    init() {
        this.velocity = 0;
        this.rotation = 0;
        this.x =  this.globals.fatty_canvas.width * 0.1;
        this.y = (this.globals.fatty_canvas.height * 0.5) - this.height * 0.5;
    }

    //Load all graphical assets
    loadAssets() {
        this.sprite = new Image();
        this.SPRITE_STRIDE = 24; //The height of each model in the sprite
        this.totalStride = 0;
        var player = this;
        this.sprite.onload = function() {
            player.renderReady = true;
            player.GameObj.fatty_log(INFO_LEVEL, "Loaded player asset");

            //Calculate the size of the player
            var ratio = player.sprite.width / player.SPRITE_STRIDE;

            player.height = player.globals.fatty_canvas.height * 0.05;
            player.width = player.height * ratio;

            player.GameObj.fatty_log(INFO_LEVEL, "Player resized to " + player.width + "x" + player.height);

            player.init();
        }
        this.sprite.src = this.globals.assetStruct.birdSprite;
    }

    fly() {
        //Apply force upwards
        this.velocity = this.globals.upwards_force;
    }

    //Update function
    update(deltaMS) {
        this.velocity += this.globals.gravity * (deltaMS / 1000);
        this.y += this.velocity * (deltaMS / 1000);

        this.rotation = Math.min((this.velocity / this.rotationFactor) * 90, 90) / 180;

        //Correct my height to collide with the ceiling
        if(this.y <= this.backgroundObject.ceiling_height + (this.height / 2)) {
            this.y = this.backgroundObject.ceiling_height + (this.height / 2);
        }

        if(this.y >= this.backgroundObject.floorLevel - (this.height / 2)) {
            this.y = this.backgroundObject.floorLevel - (this.height / 2);
        }
    }

    //Returns a bounding box of the player
    //TODO: This bounding box doesnt accout for rotations, fix
    getBoundingBox() {
        return { topLeft: { x: this.x - this.width/2, y: this.y - this.height/2 }, width: this.width, height: this.height };
    }

    //Draw function
    draw(deltaMS) {
        if(this.renderReady) {  
            if(this.anim_timer <= 0) {
                if(this.totalStride + this.SPRITE_STRIDE < this.sprite.height) {
                    this.totalStride += this.SPRITE_STRIDE;
                } else {
                    this.totalStride = 0;
                }
                this.anim_timer = this.ANIMATION_CYCLE_SPEED;
            } else {
                this.anim_timer -= deltaMS;
            }
            this.globals.fatty_context.save();
            this.globals.fatty_context.translate(this.x , this.y);
            this.globals.fatty_context.rotate(this.rotation * Math.PI);
            this.globals.fatty_context.drawImage(this.sprite, 0, this.totalStride, 34, this.SPRITE_STRIDE, -this.width / 2, -this.height/2, this.width, this.height);
            this.globals.fatty_context.restore();                
        }
    }
}