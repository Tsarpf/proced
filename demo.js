/* global noise:false */
pc.script.create('demo', function (app) { //context / app can be taken as argument
	var Demo = function (entity) {
		this.entity = entity;
	};

	Demo.prototype = {
		initialize: function() {
			this.camera = app.root.findByName('Camera');

			this.objCreator = this.entity.script.objcreator;
			//this.objCreator.addNewEntity([0,0,0], true);
			
			this.sceneOneSetup();
		},
		update: function() {
			this['scene' + this.currentScene + 'Update']();
		},
		sceneTwoSetup: function() {
			this.currentScene = 'Two';
		},
		sceneOneSetup: function() {
			this.currentScene = 'One';
			this.camera.script.first_person_camera.setPosition([0,0,0]);
			
			this.sceneOneAddLine();
			var that = this;
			setTimeout(function() {
				that.sceneTwoSetup();
			}, 1000 * 30); // 30 seconds
		},
		sceneOneAddLine: function() {
			var that = this;
			setTimeout(function() {
				that.sceneOneLineCount++;
				var value = noise.perlin2(0, that.sceneOneLineCount / 10 + 0.1);
				//value -= 1;
				value *= 5;
				that.sceneOneNoise.push(
					value //plus one because the noise is from -1 to 1 
				);
				if(that.currentScene === 'One') {
					that.sceneOneAddLine();
				}
			}, 100);
		},
		sceneOneLineCount: 0,
		sceneOneNoise: [],
		sceneOneUpdate: function() {
			//debugger;
			//var max = 2;
			//var bottom = 0;

			var x = 5;
			var leftEdge = -5;
			var rightEdge = 5;

			var length = rightEdge - leftEdge;
			
			var start = new pc.Vec3(15,0,-5);
			var end = new pc.Vec3(15,0,5);
			var color = new pc.Color(1,1,1);
			//app.renderLine(start, end, color);

			var segmentLength = (1 / this.sceneOneLineCount) * length;

			var left, right; 
			for(var i = 1; i < this.sceneOneLineCount; i++) {
				left = leftEdge + i * segmentLength;
				right = leftEdge + i * segmentLength + segmentLength;

				start = new pc.Vec3(x, this.sceneOneNoise[i - 1], left);
				end = new pc.Vec3(x, this.sceneOneNoise[i], right);

				app.renderLine(start, end, color);
			}

			start = new pc.Vec3(5,2,-5);
			end = new pc.Vec3(5,2,5);
			color = new pc.Color(1,1,1);
			app.renderLine(start, end, color);

			start = new pc.Vec3(5,-2,-5);
			end = new pc.Vec3(5,-2,5);
			color = new pc.Color(1,1,1);
			app.renderLine(start, end, color);

			//sceneOneFrameCount++;
		}
	};
	return Demo;
});
