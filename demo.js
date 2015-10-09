/* global noise:false*/
pc.script.create('demo', function (app) { //context / app can be taken as argument
	var Demo = function (entity) {
		this.entity = entity;
	};

	var sceneOneTime = 1000 * 1;
	var sceneTwoTime = 1000 * 5;
	var sceneThreeTime = 1000 * 5;
	var sceneFourTime = 1000 * 10;
	var sceneFiveTime = 1000 * 20;
	var sceneSixTime = 1000 * 10;
	var sceneTwoLerpTime = 5000;
	//var sceneThreeTime = 1000 * 5;
	Demo.prototype = {
		initialize: function() {
			this.camera = app.root.findByName('Camera');

			this.text = this.entity.script.ui;	
			this.objCreator = this.entity.script.objcreator;
			this.workQueue = this.entity.script.workQueue;
			//this.objCreator.addNewEntity([0,0,0], true);
			//
			var texts = [
				{
					text: 'Random noise function given two inputs <br><br> - Little change between input values -> difference between the output values is random <br><br> - Big change between input values -> difference still random',
					time: sceneOneTime 
				},
				{
					text: 'Coherent noise function with two inputs <br><br> - Little change between input values -> little change between results <br><br> - Big change in input to function -> difference random',
					time: sceneTwoTime 
				}
			];

			this.objCreator.chunkSizeX = 8,
			this.objCreator.chunkSizeY = 8,
			this.objCreator.chunkSizeZ = 8,
			this.objCreator.scaleFactor = 16;

			this.workQueue.loadWorld('sin');

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
			}, sceneOneTime); 
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
			//var max = 2;
			//var bottom = 0;

			var z = -5;
			var leftEdge = -7;
			var rightEdge = 7;

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

				start = new pc.Vec3(left, this.sceneOneNoise[i - 1], z);
				end = new pc.Vec3(right, this.sceneOneNoise[i], z);

				app.renderLine(start, end, color);
			}
		},
		sceneTwoSetup: function() {
			this.currentScene = 'Two';
			this.camera.script.first_person_camera.setPosition([0,0,0]);
			
			this.sceneTwoAddLine();
			var that = this;
			setTimeout(function() {
				that.sceneThreeSetup();
				that.camera.script.first_person_camera.moveForwardLock = true;
			}, sceneTwoTime); 
			setTimeout(function() {
				that.sceneThreePreSetup();
			}, sceneTwoTime - sceneTwoLerpTime);
		},
		sceneTwoAddLine: function() {
			var that = this;
			setTimeout(function() {
				that.sceneTwoLineCount++;
				var value = noise.perlin2(that.sceneTwoLineCount / 10 + 0.2, that.sceneTwoLineCount / 10 + 0.5);
				value *= 4;
				that.sceneTwoNoise.push(
					value 
				);
				if(that.currentScene === 'Two') {
					that.sceneTwoAddLine();
				}
			}, 50);
		},
		sceneTwoLineCount: 0,
		sceneTwoNoise: [],
		sceneTwoLerpAlpha: 0,
		sceneTwoLerping: false,
		sceneTwoLerpStartTime: -1,
		sceneTwoLerpEndTime: -1,
		sceneTwoLerpStartVal: 0,
		sceneTwoLerpEndVal: 90,

		sceneTwoLerpStartPosition: new pc.Vec3(0,0,0),
		sceneTwoLerpEndPosition: null,
		sceneTwoUpdate: function() {
			//var max = 2;
			//var bottom = 0;

			var z = -5;
			var leftEdge = -7;
			var rightEdge = 7;

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

				start = new pc.Vec3(left, this.sceneTwoNoise[i - 1], z);
				end = new pc.Vec3(right, this.sceneTwoNoise[i], z);

				app.renderLine(start, end, color);
			}

			if(this.sceneTwoLerping) {
				var now = performance.now();
				var lerpX = (now - this.sceneTwoLerpStartTime) / sceneTwoLerpTime;
				//var val = pc.math.smootherstep(this.sceneTwoLerpStartVal, this.sceneTwoLerpEndVal, this.
				var val = pc.math.lerp(this.sceneTwoLerpStartVal, this.sceneTwoLerpEndVal, lerpX);
				var lerpVec = new pc.Vec3();
				lerpVec.lerp(this.sceneTwoLerpStartPosition, this.sceneTwoLerpEndPosition, lerpX);
				this.camera.script.first_person_camera.setEulerAngles(-val / 4, -val, 0);
				this.camera.script.first_person_camera.setPosition([lerpVec.x, lerpVec.y, lerpVec.z]);
				if(now > this.sceneTwoLerpEndTime) {
					this.sceneTwoLerping = false;
				}
			}
		},
		sceneThreeSetup: function() {
			console.log('syys');
			this.currentScene = 'Three';
			this.workQueue.startWorld();
			var texts = [
				{
					text: 'Infinite loading (and deleting)',
					time: sceneThreeTime 
				}
			];
			this.text.queueMultipleText(texts);

			var that = this;
			setTimeout(function() {
				that.sceneFourSetup();
			}, sceneThreeTime);
		},
		sceneThreePreSetup: function() {
			this.sceneTwoLerping = true;
			this.sceneTwoLerpStartTime = performance.now();
			this.sceneTwoLerpEndTime = this.sceneTwoLerpStartTime + sceneTwoLerpTime;
			var mp = this.workQueue.middlePosition;
			var scale = this.objCreator.scaleFactor;
			this.sceneTwoLerpEndPosition = new pc.Vec3(-8 * scale, 35 * scale, mp[2]);
		},
		sceneThreeUpdate: function() {
		},
		sceneFourSetup: function() {
			this.currentScene = 'Four';
			this.workQueue.sampler = 'sin-noise-displace';
			var texts = [
				{
					text: 'Noise displaced sin wave',
					time: sceneFourTime 
				}
			];
			this.text.queueMultipleText(texts);

			var that = this;
			setTimeout(function() {
				that.sceneFiveSetup();
			}, sceneFourTime);
		},
		sceneFourUpdate: function() {
		},
		sceneFiveSetup: function() {
			this.currentScene = 'Five';
			this.workQueue.sampler = 'alien';
			var texts = [
				{
					text: 'Simplex noise',
					time: sceneFiveTime 
				}
			];
			this.text.queueMultipleText(texts);

			var that = this;
			setTimeout(function() {
				that.sceneSixSetup();
			}, sceneFiveTime);
		},
		sceneFiveUpdate: function() {
		},
		sceneSixSetup: function() {
			this.currentScene = 'Six';
			this.workQueue.sampler = 'perlin';
			var texts = [
				{
					text: 'Perlin noise',
					time: sceneSixTime 
				}
			];
			this.text.queueMultipleText(texts);

			var that = this;
			setTimeout(function() {
				that.camera.script.first_person_camera.moveForwardLock = false;
				that.camera.script.first_person_camera.mouseLook = true;
			}, sceneSixTime);
		},
		sceneSixUpdate: function() {
		}
	};
	return Demo;
});
