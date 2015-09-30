
var PROCED = PROCED || {};
PROCED.workQueue = function() {
	var wrappingArray = PROCED.wrappingArray(5);
	var array = [];
	
	function emptyFn() {
	}
	pub.setZoneFunction(0, emptyFn, emptyFn);

	function forward1(wrappedIdx, worldCoords) {
	}
	function backward1(wrappedIdx, worldCoords) {
	}
	pub.setZoneFunction(1, forward1, backward1);


	function forward2(wrappedIdx, worldCoords) {
	}
	function backward2(wrappedIdx, worldCoords) {
	}

	pub.setZoneFunction(2, forward2, backward2);

	
	var pub = {};
	return pub;
};
