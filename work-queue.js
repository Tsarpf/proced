/*global PROCED:false*/
pc.script.create('workQueue', function (app) { //context / app can be taken as argument
	var size = 5;
	var wrappingArray = PROCED.wrappingArray(size);
	var array = [];
	var WorkQueue = function (entity) {
		this.entity = entity;
	};
	WorkQueue.prototype = {
		initialize: function() {
			for(var x = 1; x < 4; x++) {
				for(var y = 1; y < 4; y++) {
					for(var z = 1; z < 4; z++) {
						array[getIdx(x,y,z)] = this.entity.script.objcreator.addNewEntity([x,y,z], true);
					}
				}
			}
			var camera = app.root.findByName('Camera');
			var pos = [
				//20, 20, 20
				size / 2 * this.entity.script.objcreator.chunkSizeX * this.entity.script.objcreator.scaleFactor,
				size / 2 * this.entity.script.objcreator.chunkSizeX * this.entity.script.objcreator.scaleFactor,
				size / 2 * this.entity.script.objcreator.chunkSizeX * this.entity.script.objcreator.scaleFactor
			];
			camera.script.first_person_camera.setPosition(pos);
			//set camera position
			//when camera position set and confirmed, start infinite loading thing

		}
	};

	function getIdx(x, y, z) {
		return x + size * (y + size * z);
	}

	//Do nothing specific for the tile the player is in
	function emptyFn() {}
	wrappingArray.setZoneFunction(0, emptyFn, emptyFn);

	wrappingArray.setZoneFunction(1, function (wrappedIdx, worldCoords) {
		array[wrappedIdx] = this.entity.script.objcreator.addNewEntity([worldCoords.x,worldCoords.y,worldCoords.z], true);
	}, function (wrappedIdx, worldCoords) {
	});

	wrappingArray.setZoneFunction(2, function (wrappedIdx, worldCoords) {
	}, function (wrappedIdx, worldCoords) {
	});
	return WorkQueue;
});
