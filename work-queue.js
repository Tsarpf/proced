/*global PROCED:false, async:false*/
pc.script.create('workQueue', function (app) { //context / app can be taken as argument
	//var maxFrameComputingTime = 10;
	//var size = 5;
	var size = 13;
	var zoneCount = Math.ceil(size / 2);
	//var size = 7;

	var workerCount = 1;

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
			this.loadWorld();
			this.startWorld();
			var t1 = performance.now();
			console.log('initialized in %d milliseconds', t1 - t0);

		},
		loadWorld: function() {
			this.sampler = 'perlin';

			this.middlePosition = [
				size / 2 * objCreator.chunkSizeX * objCreator.scaleFactor,
				size / 2 * objCreator.chunkSizeY * objCreator.scaleFactor,
				size / 2 * objCreator.chunkSizeZ * objCreator.scaleFactor
			];


			var that = this;
			for(var x = 0; x < size; x++) {
				for(var y = 0; y < size; y++) {
					for(var z = 0; z < size; z++) {
						/*
						var closure = function(x,y,z) {
							return function() {
							*/
								chunkArray[getIdx(x,y,z)] = objCreator.addNewEntity([x,y,z], true, that.sampler);
								/*
							};
						};
						closure(x,y,z)();
						*/
						//requestAnimationFrame(closure(x,y,z), 0);
					}
				}
			}
		},
		middlePosition: null,
		sampler: 'sin',
		updateEnabled: false,
		startWorld: function() {
			camera.script.first_person_camera.setPosition(this.middlePosition);
			camera.script.first_person_camera.mouseLook = true;
			camera.script.first_person_camera.moveForwardLock = false;

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
		update: function() {
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
				console.log('x plus');
				wrappingArray.dirXPlus();
			}
			else if(xChunkPos < oldPosX) {
				oldPosX = xChunkPos;
				console.log('x minus');
				wrappingArray.dirXMinus();
			}

			if(yChunkPos > oldPosY) {
				oldPosY = yChunkPos;
				console.log('y plus');
				wrappingArray.dirYPlus();
			}
			else if(yChunkPos < oldPosY) {
				console.log(yChunkPos + ' ' + oldPosY);
				oldPosY = yChunkPos;
				console.log('y minus');
				wrappingArray.dirYMinus();
			}

			if(zChunkPos > oldPosZ) {
				oldPosZ = zChunkPos;
				console.log('z plus');
				wrappingArray.dirZPlus();
			}
			else if(zChunkPos < oldPosZ) {
				oldPosZ = zChunkPos;
				console.log('z minus');
				wrappingArray.dirZMinus();
			}
		},
		initializeZones: function() {
			wrappingArray.setZoneFunction(zoneCount - 2, function (arrayCell, worldCoords) {
				queue.push({
					type: 'draw',
					arrayCell: arrayCell,
					worldCoords: worldCoords
				}, 1);
			}, function() {});
		},
		initializeQueue: function() {
			queue = async.priorityQueue(function(task, callback) {
				switch(task.type) {
				case 'draw':
					requestAnimationFrame(function() {
						that.handleDraw(task, callback);
					}, 0);
					break;
				case 'load':
					requestAnimationFrame(function() {
						that.handleLoad(task, callback);
					}, 0);
					break;
				case 'destroy':
					requestAnimationFrame(function() {
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
			//console.log('handle draw');
			var wrappedIdx = getIdx(obj.arrayCell[0], obj.arrayCell[1], obj.arrayCell[2]);
			if(chunkArray[wrappedIdx] && chunkArray[wrappedIdx].script && chunkArray[wrappedIdx].script.procedural && that.vecEqual(chunkArray[wrappedIdx].script.procedural.chunkPos, obj.worldCoords)) {
				//console.log('already loaded');
				if(chunkArray[wrappedIdx].script.procedural.state === 'loaded') {
					chunkArray[wrappedIdx].script.procedural.addComponents();
				}
				else {
					//If f.ex drawn, this will do nothing
					//If in the process of loading, it will continue to draw it afterwards
					//a bit non-robust
					chunkArray[wrappedIdx].script.procedural.visible = true;
				}
			}
			else {
				//console.log('draw new');
				var entity = chunkArray[wrappedIdx];
				if(entity) {
					queue.push({
						type: 'destroy',
						entity: entity
					}, 2);
				}

				chunkArray[wrappedIdx] = that.entity.script.objcreator.addNewEntity([obj.worldCoords.x, obj.worldCoords.y, obj.worldCoords.z], true, this.sampler);
			}

			callback();
		},
		handleLoad: function(obj, callback) {
			//console.log('handle load');
			var wrappedIdx = getIdx(obj.arrayCell[0], obj.arrayCell[1], obj.arrayCell[2]);
			if(chunkArray[wrappedIdx] && chunkArray[wrappedIdx].script  && chunkArray[wrappedIdx].script.procedural && that.vecEqual(chunkArray[wrappedIdx].script.procedural.chunkPos, obj.worldCoords)) {
				//Nothing to do, already loaded / loading
				return callback();
			}
			else {
				requestAnimationFrame(function() {
					chunkArray[wrappedIdx] = that.entity.script.objcreator.addNewEntity([obj.worldCoords.x, obj.worldCoords.y, obj.worldCoords.z], false, this.sampler);
					callback();
				});
			}
		}
	};

	function getIdx(x, y, z) {
		return x + size * (y + size * z);
	}

	return WorkQueue;
});
