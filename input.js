pc.script.create('input', function (app) {
    var Input = function (entity) {
        this.entity = entity;

        this.x = new pc.Vec3();
        this.z = new pc.Vec3();
        this.heading = new pc.Vec3();

        // var element = document.body;
        this.controller = new pc.input.Controller(window);

        this.controller.registerKeys('forward', [pc.input.KEY_UP, pc.input.KEY_W]);
        this.controller.registerKeys('back', [pc.input.KEY_DOWN, pc.input.KEY_S]);
        this.controller.registerKeys('left', [pc.input.KEY_LEFT, pc.input.KEY_A, pc.input.KEY_Q]);
        this.controller.registerKeys('right', [pc.input.KEY_RIGHT, pc.input.KEY_D]);
        this.controller.registerKeys('jump', [pc.input.KEY_SPACE]);
    };


    Input.prototype = {
        initialize: function () {
            this.camera = app.root.findByName('Camera');
            this.character = this.entity;
            this.characterController = 'dynamic_character_controller';
            app.keyboard.on(pc.input.EVENT_KEYDOWN, this.onKeyDown, this);
        },
        
        //prevents default browser actions, such as scrolling when pressing cursor keys
        onKeyDown: function (event) {
            event.event.preventDefault();
        },

        update: function (dt) {
            var input = false;

            // Calculate the camera's heading in the XZ plane
            var transform = this.camera.getWorldTransform();

            transform.getZ(this.z);
            this.z.y = 0;
            this.z.normalize();            
            
            transform.getX(this.x);            
            this.x.y = 0;
            this.x.normalize();            
            
            this.heading.set(0, 0, 0);

            // Strafe left/right
            if (this.controller.isPressed('left')) {
                this.heading.sub(this.x);                
                input = true;
            } else if (this.controller.isPressed('right')) {
                this.heading.add(this.x);                
                input = true;
            }
            
            // Move forwards/backwards
            if (this.controller.isPressed('forward')) {
                this.heading.sub(this.z);                
                input = true;
            } else if (this.controller.isPressed('back')) {
                this.heading.add(this.z);
                input = true;
            }

            if (input) {
                this.heading.normalize();                
            }

            this.character.script.dynamic_character_controller.move(this.heading);

            if (this.controller.wasPressed('jump')) {
                this.character.script.dynamic_character_controller.jump();
            }

        }
    }

    return Input;
});
