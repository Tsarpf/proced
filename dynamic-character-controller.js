pc.script.create('dynamic_character_controller', function (context) {
    var SPEED = 5;
    var JUMP_IMPULSE = 400;
    
    var origin = new pc.Vec3();
    var groundCheckRay = new pc.Vec3(0, -0.51, 0);
    var rayEnd = new pc.Vec3();
    
    var DynamicCharacterController = function (entity) {
        this.entity = entity;
        
        this.speed = SPEED;
        this.jumpImpulse = new pc.Vec3(0, JUMP_IMPULSE, 0);
            
        this.onGround = true;
    };

    DynamicCharacterController.prototype = {
        initialize: function () {
        },
        
        update: function (dt) {
            this._checkGround();    
        },
            
        /**
        * Move the character in the direction supplied
        */
        move: function (direction) {
            if (this.onGround) {
                this.entity.rigidbody.activate();
                direction.scale(this.speed);                
                this.entity.rigidbody.linearVelocity = direction;
            }
        },
        
        /**
        * Make the character jump
        */
        jump: function () {
            if (this.onGround) {
                this.entity.rigidbody.activate();
                this.entity.rigidbody.applyImpulse(this.jumpImpulse, origin);
                this.onGround = false;                
            }
        },
        
        /**
        * Check to see if the character is standing on something
        */
        _checkGround: function () {
            var self = this;
            var pos = this.entity.getPosition();
            rayEnd.add2(pos, groundCheckRay);            
            self.onGround = false;

            // Fire a ray straight down to just below the bottom of the rigid body, 
            // if it hits something then the character is standing on something.
            context.systems.rigidbody.raycastFirst(pos, rayEnd, function (result) {
                self.onGround = true;
            });
        }
    };

   return DynamicCharacterController;
});
