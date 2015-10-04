/*global PROCED:false*/
pc.script.create('workQueue', function (app) { //context / app can be taken as argument
	//var maxFrameComputingTime = 10;
	//var size = 11;
	//var size = 7;
	var size = 7;
	var wrappingArray = PROCED.wrappingArray(size);
	var chunkArray = [];
	var camera;
	var objCreator;
	var oldPosX, oldPosY, oldPosZ;
	var first = true;

	var drawQueue = [];
	var loadQueue = [];
	var deleteQueue = [];
	var WorkQueue = function (entity) {
		this.entity = entity;
	};
	var that;
	WorkQueue.prototype = {
		initialize: function() {
			that = this;
			objCreator = this.entity.script.objcreator;
			camera = app.root.findByName('Camera');

			var t0 = performance.now();
			//Initialize world
			for(var x = 1; x < size - 1; x++) {
				for(var y = 1; y < size - 1; y++) {
					for(var z = 1; z < size - 1; z++) {
						chunkArray[getIdx(x,y,z)] = objCreator.addNewEntity([x,y,z], true);
					}
				}
			}
			//objCreator.addNewEntity([0,0,0], true);
			var t1 = performance.now();
			console.log('time spent initializing: %d', t1 - t0);

			//Place camera in the middle of the initial world
			var pos = [
				size / 2 * objCreator.chunkSizeX * objCreator.scaleFactor,
				size / 2 * objCreator.chunkSizeY * objCreator.scaleFactor,
				size / 2 * objCreator.chunkSizeZ * objCreator.scaleFactor
			];
			camera.script.first_person_camera.setPosition(pos);
			this.initializeZones();
		},
		handleDraw: function() {
			if(drawQueue.length === 0) {
				return;
			}

			var obj = drawQueue.shift();

			var wrappedIdx = getIdx(obj.arrayCell.x, obj.arrayCell.y, obj.arrayCell.z);

			/*
			if(chunkArray[wrappedIdx]) {
				console.log('fst:');
				console.log(chunkArray[wrappedIdx].script.procedural.chunkPos);
				console.log('snd:');
				console.log(obj.worldCoords);
			}
			*/
			if(chunkArray[wrappedIdx] && that.vecEqual(chunkArray[wrappedIdx].script.procedural.chunkPos, obj.worldCoords)) {
				chunkArray[wrappedIdx].script.procedural.addComponents();	
			}
			else {
				//console.log('not loaded O___o');
				chunkArray[wrappedIdx] = that.entity.script.objcreator.addNewEntity([obj.worldCoords.x, obj.worldCoords.y, obj.worldCoords.z], true);
			}

		},
		vecEqual: function(fst, snd) {
			return fst.x === snd.x && fst.y === snd.y && fst.z === snd.z;	
		},
		handleLoad: function() {
			if(loadQueue.length === 0) {
				return;
			}
			var obj = loadQueue.shift();

			var wrappedIdx = getIdx(obj.arrayCell.x, obj.arrayCell.y, obj.arrayCell.z);

			chunkArray[wrappedIdx] = that.entity.script.objcreator.addNewEntity([obj.worldCoords.x, obj.worldCoords.y, obj.worldCoords.z], false);
		},
		getAvg: function(list) {
			var sum = 0;
			var i;
			for(i = 0; i < list.length; i++) {
				sum += list[i];
			}
			return sum / i;
		},
		/*
		 * TODO: this.handleLoad and code for checking whether chunk already loaded and we can just enable drawing
		 */
		queuesNotEmpty: function() {
			return drawQueue.length !== 0 && loadQueue.length !== 0 && deleteQueue.length !== 0;
		},
		handleQueue: function() {
			if(drawQueue.length > 0) {
				requestAnimationFrame(this.handleDraw);
			}
			else if(loadQueue.length > 0) {
				/*
				setTimeout(function() {
					//console.log('load');
					that.handleLoad();
				}, 0);
				*/
			}
			/*
			var timeSpent = 0;
			var avg = 0;
			var start = performance.now();
			var times = [];
			while(queuesNotEmpty && timeSpent + avg < maxFrameComputingTime) {
				var t0 = performance.now();
				if(drawQueue.length > 0) {
					this.handleDraw();
				}
				var t1 = performance.now();
				times.push(t1-t0);
				avg = this.getAvg(times);
				var end = performance.now();
				var timeSpent = end - start;
			}
			*/
			//console.log('time spent: %d, avg: %d, max: %d', timeSpent, avg, maxFrameComputingTime);
		},
		update: function() {
			this.handleQueue();
			var cameraPos = camera.getPosition();
			var xChunkPos = Math.floor(cameraPos.x / objCreator.chunkSizeX / objCreator.scaleFactor);
			var yChunkPos = Math.floor(cameraPos.y / objCreator.chunkSizeY / objCreator.scaleFactor);
			var zChunkPos = Math.floor(cameraPos.z / objCreator.chunkSizeZ / objCreator.scaleFactor);
			if(first) {
				oldPosX = xChunkPos;
				oldPosY = yChunkPos;
				oldPosZ = zChunkPos;
				first = false;
				return;
			}

			if(xChunkPos > oldPosX) {
				oldPosX = xChunkPos;
				wrappingArray.dirXPlus();
			}
			else if(xChunkPos < oldPosX) {
				oldPosX = xChunkPos;
				wrappingArray.dirXMinus();
			}

			if(yChunkPos > oldPosY) {
				oldPosY = yChunkPos;
				wrappingArray.dirYPlus();
			}
			else if(yChunkPos < oldPosY) {
				oldPosY = yChunkPos;
				wrappingArray.dirYMinus();
			}
			
			if(zChunkPos > oldPosZ) {
				oldPosZ = zChunkPos;
				wrappingArray.dirZPlus();
			}
			else if(zChunkPos < oldPosZ) {
				oldPosZ = zChunkPos;
				wrappingArray.dirZMinus();
			}
		},
		initializeZones: function() {
			/*
			function emptyFn() {}
			wrappingArray.setZoneFunction(0, emptyFn, emptyFn);
			wrappingArray.setZoneFunction(1, function () {
			}, function () {
			});
			wrappingArray.setZoneFunction(2, emptyFn, emptyFn);
			wrappingArray.setZoneFunction(3, emptyFn, emptyFn);
			*/

			wrappingArray.setZoneFunction(2, function (arrayCell, worldCoords) {
				drawQueue.push({
					arrayCell: arrayCell,
					worldCoords: worldCoords
				});
			}, function () {
			});
			/*
			wrappingArray.setZoneFunction(3, function (arrayCell, worldCoords) {
				//console.log('loading');
				//console.log(worldCoords);
				loadQueue.push({
					arrayCell: arrayCell,
					worldCoords: worldCoords
				});
			}, function () {
			});
			*/

			/*
			wrappingArray.setZoneFunction(4, function (arrayCell, worldCoords) {
				loadQueue.push({
					arrayCell: arrayCell,
					worldCoords: worldCoords
				});
			}, function () {
			});
			*/
		}
	};

	function getIdx(x, y, z) {
		return x + size * (y + size * z);
	}

	//Do nothing specific for the tile the player is in
	return WorkQueue;
});
