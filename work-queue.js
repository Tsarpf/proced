/*global PROCED:false*/
pc.script.create('workQueue', function () { //context / app can be taken as argument
	var size = 5;
	var wrappingArray = PROCED.wrappingArray(size);
	var array = [];
	var WorkQueue = function (entity) {
		this.entity = entity;
	};
	WorkQueue.prototype = {
		initialize: function() {
			console.log('ses');
			for(var x = 1; x < 4; x++) {
				for(var y = 1; y < 4; y++) {
					for(var z = 1; z < 4; z++) {
						array[getIdx(x,y,z)] = this.entity.script.objcreator.addNewEntity([x,y,z], true);
					}
				}
			}
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
