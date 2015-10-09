/* global noise:false*/
pc.script.create('demo', function (app) { //context / app can be taken as argument
	var Demo = function (entity) {
		this.entity = entity;
	};

	//* FINAL TIMES !?
	var sceneOneTime = 1000 * 30;
	var sceneTwoTime = 1000 * 30;
	var sceneThreeTime = 1000 * 30;
	var sceneFourTime = 1000 * 30;
	var sceneFiveTime = 1000 * 30;
	var sceneSixTime = 1000 * 60;
	var sceneTwoLerpTime = 5000;
	/*
	 * TEST TIMES
	var sceneOneTime = 1000 * 1;
	var sceneTwoTime = 1000 * 6;
	var sceneThreeTime = 1000 * 10;
	var sceneFourTime = 1000 * 20;
	var sceneFiveTime = 1000 * 20;
	var sceneSixTime = 1000 * 60;
	var sceneTwoLerpTime = 5000;
	*/
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
					text: 'A random (noise) function <br><br> - In: two values near each other <br> Out: two random values <br><br> - In: two values far from each other <br> Out: two random values <br> <br>',
					time: sceneOneTime 
				},
				{
					text: 'Coherent noise function<br><br> - In: two values near each other <br> Out: two values near each other<br><br> - In: two values far away from each other <br> Out: two random values',
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
			var leftEdge = -4;
			var rightEdge = 4;

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
				var value = noise.perlin2(
					that.sceneTwoLineCount / 12 + 0.2,
					that.sceneTwoLineCount / 12 + 0.5
				);
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
			var leftEdge = -4;
			var rightEdge = 4;

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
					text: 'Infinite sized map won\'t fit into memory at once (duh!), load it dynamically',
					time: sceneThreeTime / 4
				},
				{
					text: 'the Marching Cubes algorithm <br> <br> - Creates renderable surfaces out of volumetric data <br> <br> - The data can be anything from MRI scan results to a sine wave like here. <br> <br> ',
					time: sceneThreeTime * (3/4)
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
			this.sceneTwoLerpEndPosition = new pc.Vec3(-8 * scale, 25 * scale, mp[2]);
		},
		sceneThreeUpdate: function() {
		},
		sceneFourSetup: function() {
			this.currentScene = 'Four';
			this.workQueue.sampler = 'sin-noise-displace';
			var texts = [
				{
					text: 'Sine wave displaced with noise <br> <br> - Follows the general direction of the sine wave, but has more interesting features  <br> <br> - Think displacing a sphere with noise. Rocks? Planets? You name it',
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
			this.workQueue.sampler = 'perlin';
			var texts = [
				{
					text: 'Perlin noise <br><br> - One algorithm for generating coherent noise in 3 dimensions <br> <br> - Often used for procedural textures in games and animated movies (was originally used in Disney\'s Tron from 1982) <br> <br> ',
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
			this.camera.script.first_person_camera.moveForwardLock = false;
			this.camera.script.first_person_camera.mouseLook = true;
			this.currentScene = 'Six';
			this.workQueue.sampler = 'perlin';
			var texts = [
				{
					text: 'By combining displacement and 3d noise we already have clouds or whatever plus a ground level with tunnels in it <br> <br> I have a bit better looking version with bigger draw distances etc. where you can fly around freely, come ask for a link if you want to try it out yourself <br> <br> P.S. all this runs in the browser!',
					time: sceneSixTime 
				}
			];
			this.text.queueMultipleText(texts);

			//var that = this;
			setTimeout(function() {
			}, sceneSixTime);
		},
		sceneSixUpdate: function() {
		}
	};
	return Demo;
});
