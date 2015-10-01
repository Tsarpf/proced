/*global PROCED:false*/
pc.script.create('workQueue', function (app) { //context / app can be taken as argument
	var maxFrameComputingTime = 20;
	var size = 9;
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
	WorkQueue.prototype = {
		initialize: function() {
			objCreator = this.entity.script.objcreator;
			camera = app.root.findByName('Camera');

			//Initialize world
			for(var x = 0; x < size; x++) {
				for(var y = 0; y < size; y++) {
					for(var z = 0; z < size; z++) {
						chunkArray[getIdx(x,y,z)] = objCreator.addNewEntity([x,y,z], true);
					}
				}
			}

			//Place camera in the middle of the initial world
			var pos = [
				size / 2 * objCreator.chunkSizeX * objCreator.scaleFactor,
				size / 2 * objCreator.chunkSizeY * objCreator.scaleFactor,
				size / 2 * objCreator.chunkSizeZ * objCreator.scaleFactor
			];
			camera.script.first_person_camera.setPosition(pos);
			this.initializeZones();
		},
		handleDraw: function(obj) {
			var wrappedIdx = getIdx(obj.arrayCell.x, obj.arrayCell.y, obj.arrayCell.z);

			chunkArray[wrappedIdx] = this.entity.script.objcreator.addNewEntity([obj.worldCoords.x, obj.worldCoords.y, obj.worldCoords.z], true);
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
		handleQueue: function() {
			var times = [];
			var start = performance.now();
			while(drawQueue.length > 0) {
				var t0 = performance.now();
				var obj = drawQueue.shift();
				this.handleDraw(obj);
				var t1 = performance.now();
				times.push(t1-t0);
				var avg = this.getAvg(times);
				var end = performance.now();
				var timeSpent = end - start;
				//console.log('time spent: %d, avg: %d, max: %d', timeSpent, avg, maxFrameComputingTime);
				if(timeSpent + avg> maxFrameComputingTime) {
					return;
				}
			}
			/*
			while(loadQueue.length > 0){
			}
			*/
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
			function emptyFn() {}
			wrappingArray.setZoneFunction(0, emptyFn, emptyFn);
			wrappingArray.setZoneFunction(1, function () {
			}, function () {
			});
			wrappingArray.setZoneFunction(2, emptyFn, emptyFn);
			wrappingArray.setZoneFunction(3, emptyFn, emptyFn);
			wrappingArray.setZoneFunction(4, function (arrayCell, worldCoords) {
				drawQueue.push({
					arrayCell: arrayCell,
					worldCoords: worldCoords
				});
			}, function () {
			});
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
