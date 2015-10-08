/* global noise:false */
pc.script.create('demo', function (app) { //context / app can be taken as argument
	var Demo = function (entity) {
		this.entity = entity;
	};

	Demo.prototype = {
		initialize: function() {
			this.camera = app.root.findByName('Camera');

			this.text = this.entity.script.ui;	
			this.objCreator = this.entity.script.objcreator;
			//this.objCreator.addNewEntity([0,0,0], true);
			//
			var texts = [
				{
					text: 'Random noise',
					time: 10000 
				},
				{
					text: 'Coherent noise',
					time: 30000 
				}
			];
			this.text.queueMultipleText(texts);
			
			this.sceneOneSetup();
		},
		update: function() {
			this['scene' + this.currentScene + 'Update']();
		},
		sceneOneSetup: function() {
			this.currentScene = 'One';
			this.sceneOneAddLine();

			var that = this;
			setTimeout(function() {
				that.sceneTwoSetup();
			}, 1000 * 10); // 30 seconds
		},
		sceneOneLineCount: 0,
		sceneOneNoise: [],
		sceneOneAddLine: function() {
			var that = this;
			setTimeout(function() {
				that.sceneOneLineCount++;
				var value = Math.random() * 2 - 1; 
				value *= 2;
				that.sceneOneNoise.push(
					value 
				);
				if(that.currentScene === 'One') {
					that.sceneOneAddLine();
				}
			}, 100);
		},
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
		},
		sceneTwoSetup: function() {
			this.currentScene = 'Two';
			this.camera.script.first_person_camera.setPosition([0,0,0]);
			
			this.sceneTwoAddLine();
			var that = this;
			setTimeout(function() {
				that.sceneThreSetup();
			}, 1000 * 30); // 30 seconds
		},
		sceneTwoAddLine: function() {
			var that = this;
			setTimeout(function() {
				that.sceneTwoLineCount++;
				var value = noise.perlin2(0, that.sceneTwoLineCount / 10 + 0.1);
				value *= 4;
				that.sceneTwoNoise.push(
					value //plus one because the noise is from -1 to 1 
				);
				if(that.currentScene === 'Two') {
					that.sceneTwoAddLine();
				}
			}, 50);
		},
		sceneTwoLineCount: 0,
		sceneTwoNoise: [],
		sceneTwoUpdate: function() {
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

			var segmentLength = (1 / this.sceneTwoLineCount) * length;

			var left, right; 
			for(var i = 1; i < this.sceneTwoLineCount; i++) {
				left = leftEdge + i * segmentLength;
				right = leftEdge + i * segmentLength + segmentLength;

				start = new pc.Vec3(x, this.sceneTwoNoise[i - 1], left);
				end = new pc.Vec3(x, this.sceneTwoNoise[i], right);

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

			//sceneTwoFrameCount++;
		}
	};
	return Demo;
});
