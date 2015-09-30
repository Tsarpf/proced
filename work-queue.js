
var PROCED = PROCED || {};
PROCED.workQueue = function() {
	var wrappingArray = PROCED.wrappingArray(5);
	function emptyFn() {
	}
	pub.setZoneFunction(0, emptyFn, emptyFn);
	
	var pub = {};
	return pub;
};
