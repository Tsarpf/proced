/*global PROCED:false*/
pc.script.create('workQueue', function (app) { //context / app can be taken as argument
	var size = 5;
	var wrappingArray = PROCED.wrappingArray(size);
	var array = [];
	var camera;
	var objCreator;
	var oldPosX, oldPosY, oldPosZ;
	var first = true;
	var WorkQueue = function (entity) {
		this.entity = entity;
	};
	WorkQueue.prototype = {
		initialize: function() {
			objCreator = this.entity.script.objcreator;
			camera = app.root.findByName('Camera');

			//Initialize world
			for(var x = 1; x < 4; x++) {
				for(var y = 1; y < 4; y++) {
					for(var z = 1; z < 4; z++) {
						array[getIdx(x,y,z)] = objCreator.addNewEntity([x,y,z], true);
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
				console.log('start %d %d %d', xChunkPos, yChunkPos, zChunkPos);
				return;
			}

			if(xChunkPos > oldPosX) {
				oldPosX = xChunkPos;
				console.log('went +x to %d %d %d', xChunkPos, yChunkPos, zChunkPos);
				wrappingArray.dirXPlus();
			}
			else if(xChunkPos < oldPosX) {
				oldPosX = xChunkPos;
				console.log('dir -x to %d %d %d', xChunkPos, yChunkPos, zChunkPos);
				wrappingArray.dirXMinus();
			}
			if(yChunkPos > oldPosY) {
				oldPosY = yChunkPos;
				console.log('went +y to %d %d %d', xChunkPos, yChunkPos, zChunkPos);
				wrappingArray.dirYPlus();
			}
			else if(yChunkPos < oldPosY) {
				oldPosY = yChunkPos;
				console.log('dir -y to %d %d %d', xChunkPos, yChunkPos, zChunkPos);
				wrappingArray.dirYMinus();
			}
			if(zChunkPos > oldPosZ) {
				oldPosZ = zChunkPos;
				console.log('went +z to %d %d %d', xChunkPos, yChunkPos, zChunkPos);
				wrappingArray.dirZPlus();
			}
			else if(zChunkPos < oldPosZ) {
				oldPosZ = zChunkPos;
				console.log('dir -z to %d %d %d', xChunkPos, yChunkPos, zChunkPos);
				wrappingArray.dirZMinus();
			}
		},
		initializeZones: function() {
			function emptyFn() {}
			wrappingArray.setZoneFunction(0, emptyFn, emptyFn);
			var that = this;
			wrappingArray.setZoneFunction(1, function (wrappedIdx, worldCoords) {
				array[wrappedIdx] = that.entity.script.objcreator.addNewEntity([worldCoords.x,worldCoords.y,worldCoords.z], true);
			}, function () {
			});

			wrappingArray.setZoneFunction(2, function () {
			}, function () {
			});
		}
	};

	function getIdx(x, y, z) {
		return x + size * (y + size * z);
	}

	//Do nothing specific for the tile the player is in
	return WorkQueue;
});
