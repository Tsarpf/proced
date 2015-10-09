pc.script.create('first_person_camera', function (app) {
	var SPEED = 30;

	//var camPos = new pc.Vec3();
	var FirstPersonCamera = function (entity) {
		this.entity = entity;

		// Camera euler angle rotation around x and y axes
		var eulers = this.entity.getEulerAngles();
		this.ex = eulers.x;
		this.ey = eulers.y;


		// Disabling the app menu stops the browser displaying a menu when
		// you right-click the page
		app.mouse.disableContextMenu();
		//app.mouse.on(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);
		app.mouse.on(pc.EVENT_MOUSEDOWN, this.onMouseDown, this);

	};


	FirstPersonCamera.prototype = {
		mouseLook: false,
		moveForwardLock: false,
		update: function (dt) {
			if(this.mouseLook) {
				this.entity.setEulerAngles(this.ex, this.ey, 0);
			}

			if (this.moveForwardLock) {
				this.entity.translate(SPEED*dt, 0, 0);
			}
			else if (app.keyboard.isPressed(pc.KEY_UP)) {
				this.entity.translateLocal(0, 0, -SPEED*dt);
			} else if (app.keyboard.isPressed(pc.KEY_DOWN)) {
				this.entity.translateLocal(0, 0, SPEED*dt);
			}

			if (app.keyboard.isPressed(pc.KEY_LEFT)) {
				this.entity.translateLocal(-SPEED*dt, 0, 0);
			} else if (app.keyboard.isPressed(pc.KEY_RIGHT)) {
				this.entity.translateLocal(SPEED*dt, 0, 0);
			}
		},

		onMouseMove: function (event) {
			// Update the current Euler angles, clamp the pitch.
			this.ex -= event.dy / 5;
			this.ex = pc.math.clamp(this.ex, -90, 90);
			this.ey -= event.dx / 5;
		},

		onMouseDown: function () { //event is given as arg
			// When the mouse button is clicked try and capture the pointer
			if (!pc.Mouse.isPointerLocked()) {
				app.mouse.enablePointerLock();
			}
		},

		setPosition: function(position) {
			this.entity.setPosition(position[0], position[1], position[2]);
		},

		setEulerAngles: function(x, y, z) {
			this.entity.setEulerAngles(x,y,z);
		}
	};

	return FirstPersonCamera;
});
