/* global noise:false, PROCED:false */
pc.script.create('demo', function (app) { //context / app can be taken as argument
	var Demo = function (entity) {
		this.entity = entity;
	};

	var sceneOneTime = 30000 * 1;
	var sceneTwoTime = 30000 * 1;
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
			//debugger;
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
			}, sceneTwoTime); // 30 seconds
			//setTimeout(function() {
			//that.sceneThreePreSetup();
			//}, 1000 * 15);
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
		sceneTwoUpdate: function() {
			//debugger;
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
		},
		sceneThreeSetup: function() {
			//this.workQueue.startWorld();
			//this.camera.moveForwardLock = true;

			this.objCreator.chunkSizeX = 8,
			this.objCreator.chunkSizeY = 8,
			this.objCreator.chunkSizeZ = 8,
			this.objCreator.scaleFactor = 32;

		},
		sceneThreePreSetup: function() {
			//this.workQueue.loadWorld('sin');
		},
		oldPosX: 0,
		oldPosY: 0,
		oldPosZ: 0,
		first: true,
		wrappingArray: PROCED.wrappingArray(7),
		sceneThreeUpdate: function() {
			var cameraPos = this.camera.getPosition();
			var xChunkPos = Math.floor(cameraPos.x / this.objCreator.chunkSizeX / this.objCreator.scaleFactor);
			var yChunkPos = Math.floor(cameraPos.y / this.objCreator.chunkSizeY / this.objCreator.scaleFactor);
			var zChunkPos = Math.floor(cameraPos.z / this.objCreator.chunkSizeZ / this.objCreator.scaleFactor);
			if(this.first) {
				this.oldPosX = xChunkPos;
				this.oldPosY = yChunkPos;
				this.oldPosZ = zChunkPos;
				this.first = false;
				return;
			}

			if(xChunkPos > this.oldPosX) {
				this.oldPosX = xChunkPos;
				console.log('x plus');
				this.wrappingArray.dirXPlus();
			}
		}
	};
	return Demo;
});
