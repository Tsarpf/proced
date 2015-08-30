pc.script.attribute('maxElevation', 'number', 70, {
    displayName: "Max Elevation"
});

pc.script.create("camera", function (context) {
     
    var Camera = function (entity) {
        this.entity = entity;

        this.viewPos = new pc.Vec3();
        this.targetViewPos = new pc.Vec3();
        this.tempVec = new pc.Vec3();

        this.distance = 3;
        this.targetDistance = 3;

        this.rotX = -180;
        this.rotY = 0;
        this.targetRotX = -40;
        this.targetRotY = 30;
        this.quatX = new pc.Quat();
        this.quatY = new pc.Quat();

        this.transformStarted = false;

        // Disabling the context menu stops the browser disabling a menu when 
        // you right-click the page
        context.mouse.disableContextMenu();
    };

    Camera.prototype = {
        initialize: function () {
            this.setBestCameraPositionForModel();

            ////////////////////
            // Touch controls //
            ////////////////////
            var options = {
                prevent_default: true,
                drag_max_touches: 2,
                transform_min_scale: 0.08,
                transform_min_rotation: 180,
                transform_always_block: true,
                hold: false,
                release: false,
                swipe: false,
                tap: false
            };
            this.hammer = Hammer(context.graphicsDevice.canvas, options);

            // Pinch zoom
            var cachedTargetDistance;
            this.hammer.on("transformstart", function (event) {
                this.transformStarted = true;
                cachedTargetDistance = this.targetDistance;

                event.preventDefault();
                this.hammer.options.drag = false;
            }.bind(this));
            this.hammer.on("transformend", function (event) {
                this.transformStarted = false;
                this.hammer.options.drag = true;
            }.bind(this));
            this.hammer.on("transform", function (event) {
                if (this.transformStarted) {
                    var gesture = event.gesture;
                    var scale = gesture.scale;
                    this.targetDistance = cachedTargetDistance / scale;
                }
            }.bind(this));

            // Orbit (1 finger) and pan (2 fingers)
            var cachedX, cachedY;
            this.hammer.on("dragstart", function (event) {
                if (!this.transformStarted) {
                    var gesture = event.gesture;
                    var numTouches = (gesture.touches !== undefined) ? gesture.touches.length : 1;
                    this.panning = (numTouches === 2);
                    this.dragStarted = true;

                    cachedX = gesture.center.pageX;
                    cachedY = gesture.center.pageY;
                }
            }.bind(this));
            this.hammer.on("dragend", function (event) {
                if (this.dragStarted) {
                    this.dragStarted = false;
                    this.panning = false;
                }
            }.bind(this));
            this.hammer.on("drag", function (event) {
                var gesture = event.gesture;
                var dx = gesture.center.pageX - cachedX;
                var dy = gesture.center.pageY - cachedY;
                if (this.panning) {
                    this.pan(dx * -0.025, dy * 0.025);
                } else {
                    this.orbit(dx * 0.5, dy * 0.5);
                }
                cachedX = gesture.center.pageX;
                cachedY = gesture.center.pageY;
            }.bind(this));

            context.mouse.on(pc.input.EVENT_MOUSEMOVE, this.onMouseMove, this);
            context.mouse.on(pc.input.EVENT_MOUSEWHEEL, this.onMouseWheel, this);
        },

        setBestCameraPositionForModel: function() {
            var i, j;

            // Position the camera somewhere sensible
            var models = context.scene.getModels();
            
            var isUnderCamera = function (mi) {
                var parent = mi.node.getParent();
                
                while (parent) {
                    if (parent.camera) {
                        return true;
                    }
                    parent = parent.getParent();
                }
                
                return false;
            };
            
            var meshInstances = [];
            for (i = 0; i < models.length; i++) {
                var mi = models[i].meshInstances;
                for (j = 0; j < mi.length; j++) {
                    if (!isUnderCamera(mi[j])) {
                        meshInstances.push(mi[j]);
                    }
                }
            }

            if (meshInstances.length > 0) {
                var aabb = new pc.shape.Aabb();
                aabb.copy(meshInstances[0].aabb);
                for (i = 0; i < meshInstances.length; i++) {
                    aabb.add(meshInstances[i].aabb);
                }

                var focus = aabb.center;
                var halfHeight = aabb.halfExtents.y;
                var halfDepth = aabb.halfExtents.z;
                var offset = 1.5 * halfHeight / Math.tan(0.5 * this.entity.camera.fov * Math.PI / 180.0);
                this.reset(focus, offset + halfDepth);
            } else {
                this.reset(pc.Vec3.ZERO, 3);
            }
        },
        
        reset: function(target, distance) {
            this.viewPos.copy(target);
            this.targetViewPos.copy(target);

            this.distance = distance;
            this.targetDistance = distance;

            this.rotX = -180;
            this.rotY = 0;
            this.targetRotX = -40;
            this.targetRotY = 30;
        },

        pan: function(movex, movey) {
            // Pan around in the camera's local XY plane
            this.tempVec.copy(this.entity.right).scale(movex);
            this.targetViewPos.add(this.tempVec);
            this.tempVec.copy(this.entity.up).scale(movey);
            this.targetViewPos.add(this.tempVec);
        },

        dolly: function (movez) {
            // Dolly along the Z axis of the camera's local transform
            this.targetDistance += movez;
            if (this.targetDistance < 0) {
                this.targetDistance = 0;
            }
        },

        orbit: function (movex, movey) {
            this.targetRotX += movex;
            this.targetRotY += movey;
            this.targetRotY = pc.math.clamp(this.targetRotY, -this.maxElevation, this.maxElevation);
        },

        onMouseWheel: function (event) {
            event.event.preventDefault();
            this.dolly(event.wheel * -0.25);
        },

        onMouseMove: function (event) {
            if (event.buttons[pc.input.MOUSEBUTTON_LEFT]) {
                this.orbit(event.dx * 0.2, event.dy * 0.2);
            } else if (event.buttons[pc.input.MOUSEBUTTON_RIGHT]) {
                var factor = this.distance / 700;
                this.pan(event.dx * -factor, event.dy * factor);
            }
        },
        
        update: function (dt) {
            if (context.keyboard.wasPressed(pc.input.KEY_SPACE)) {
                this.setBestCameraPositionForModel();
            }

            // Implement a delay in camera controls by lerping towards a target
            this.viewPos.lerp(this.viewPos, this.targetViewPos, dt / 0.1);
            this.distance = pc.math.lerp(this.distance, this.targetDistance, dt / 0.2);
            this.rotX = pc.math.lerp(this.rotX, this.targetRotX, dt / 0.2);
            this.rotY = pc.math.lerp(this.rotY, this.targetRotY, dt / 0.2);

            // Calculate the camera's rotation
            this.quatX.setFromAxisAngle(pc.Vec3.RIGHT, -this.rotY);
            this.quatY.setFromAxisAngle(pc.Vec3.UP, -this.rotX);
            this.quatY.mul(this.quatX);

            // Set the camera's current position and orientation
            this.entity.setPosition(this.viewPos);
            this.entity.setRotation(this.quatY);
            this.entity.translateLocal(0, 0, this.distance);
        }
    };
    
    return Camera;
});