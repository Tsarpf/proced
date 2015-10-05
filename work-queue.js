/*global PROCED:false, async:false*/
pc.script.create('workQueue', function (app) { //context / app can be taken as argument
	//var maxFrameComputingTime = 10;
	var size = 11;
	//var size = 7;
	//var size = 7;
	var wrappingArray = PROCED.wrappingArray(size);
	var chunkArray = [];
	var camera;
	var objCreator;
	var oldPosX, oldPosY, oldPosZ;
	var first = true;

	var queue;

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
			this.initializeQueue();
		},
		vecEqual: function(fst, snd) {
			return fst.x === snd.x && fst.y === snd.y && fst.z === snd.z;	
		},
		getAvg: function(list) {
			var sum = 0;
			var i;
			for(i = 0; i < list.length; i++) {
				sum += list[i];
			}
			return sum / i;
		},
		queuesNotEmpty: function() {
			return drawQueue.length !== 0 && loadQueue.length !== 0 && deleteQueue.length !== 0;
		},
		/*
		handleQueue: function() {
		},
		*/
		update: function() {
			//this.handleQueue();
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
			wrappingArray.setZoneFunction(4, function (arrayCell, worldCoords) {
				queue.push({
					type: 'draw',
					arrayCell: arrayCell,
					worldCoords: worldCoords
				}, 0);
			}, function () {
			});
			wrappingArray.setZoneFunction(5, function (arrayCell, worldCoords) {
				queue.push({
					type: 'load',
					arrayCell: arrayCell,
					worldCoords: worldCoords
				}, 1);
			}, function (arrayCell) {
				var wrappedIdx = getIdx(arrayCell[0], arrayCell[1], arrayCell[2]);
				var entity = chunkArray[wrappedIdx];
				queue.push({
					type: 'destroy',
					entity: entity
				});
			});
		},
		initializeQueue: function() {
			var workerCount = 2;
			queue = async.priorityQueue(function(task, callback) {
				switch(task.type) {
				case 'draw':
					setTimeout(function() {
						that.handleDraw(task, callback);
					}, 0);
					break;
				case 'load':
					setTimeout(function() {
						that.handleLoad(task, callback);
					}, 0);
					break;
				case 'destroy':
					setTimeout(function() {
						that.handleDestroy(task, callback);
					}, 0);

				}
			}, workerCount);
		},
		handleDestroy: function(obj, callback) {
			if(!obj.entity) {
				return callback();
			}
			obj.entity.destroy();
			callback();
		},
		handleDraw: function(obj, callback) {
			var wrappedIdx = getIdx(obj.arrayCell[0], obj.arrayCell[1], obj.arrayCell[2]);
			if(chunkArray[wrappedIdx] && chunkArray[wrappedIdx].script && chunkArray[wrappedIdx].script.procedural && that.vecEqual(chunkArray[wrappedIdx].script.procedural.chunkPos, obj.worldCoords)) {
				chunkArray[wrappedIdx].script.procedural.addComponents();	
			}
			else {
				chunkArray[wrappedIdx] = that.entity.script.objcreator.addNewEntity([obj.worldCoords.x, obj.worldCoords.y, obj.worldCoords.z], true);
			}

			callback();
		},
		handleLoad: function(obj, callback) {
			var wrappedIdx = getIdx(obj.arrayCell[0], obj.arrayCell[1], obj.arrayCell[2]);
			if(chunkArray[wrappedIdx] && chunkArray[wrappedIdx].script  && chunkArray[wrappedIdx].script.procedural && that.vecEqual(chunkArray[wrappedIdx].script.procedural.chunkPos, obj.worldCoords)) {
				//Nothing to do, already loaded / loading
				return callback();
			}
			else {
				chunkArray[wrappedIdx] = that.entity.script.objcreator.addNewEntity([obj.worldCoords.x, obj.worldCoords.y, obj.worldCoords.z], false);
			}

			callback();
		}
	};

	function getIdx(x, y, z) {
		return x + size * (y + size * z);
	}

	//Do nothing specific for the tile the player is in
	return WorkQueue;
});
