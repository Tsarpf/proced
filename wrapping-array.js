var PROCED = PROCED || {};
PROCED.wrappingArray = function(size) {
	var zonesX = [],
		zonesY = [],
		zonesZ = [];
	var centerIdx = ~~(size / 2),
		maxIdx =  size - 1,
		zoneFunctions = [];
	function constructor() {
		if(size % 2 === 0) {
			throw new Error('size should not be dividable by two');
		}
		var count = 0;
		for(var i = centerIdx; i < size; i++) {
			zonesX[count] = {
				max: centerIdx + count,
				min: centerIdx - count,
				worldMax: centerIdx + count,
				worldMin: centerIdx - count
			};
			zonesY[count] = {
				max: centerIdx + count,
				min: centerIdx - count,
				worldMax: centerIdx + count,
				worldMin: centerIdx - count
			};
			zonesZ[count] = {
				max: centerIdx + count,
				min: centerIdx - count,
				worldMax: centerIdx + count,
				worldMin: centerIdx - count
			};
			count++;
		}
	}
	function getNextWrap(num) {
		if(num === maxIdx) {
			return 0;
		}
		else {
			return num + 1;	
		}
	}
	/*
	function getPrevWrap(num) {
		if(num === 0) {
			return maxIdx;
		}
		else {
			return num - 1;	
		}
	}
	*/
	constructor();
	var pub = {};
	pub.setZoneFunction = function(zone, fnForward, fnBackward) {
		zoneFunctions[zone] = {
			forward: fnForward,
			backward: fnBackward
		};
	};
	pub.dirXPlus = function() {
		for(var i = 0; i < zonesX.length; i++) {
			zonesX[i].max = getNextWrap(zonesX[i].max);
			zonesX[i].min = getNextWrap(zonesX[i].min);
			zonesX[i].worldMax++;
			zonesX[i].worldMin++;

			var x = zonesX[i].max,
				y, z, wrappedIdx;
			for(y = zonesY[i].min; y != zonesY[i].max; y = getNextWrap(y)) {
				for(z = zonesZ[i].min; z != zonesZ[i].max; z = getNextWrap(z)) {
					wrappedIdx = getIdx(x,y,z);
					zoneFunctions[i].forward(
					wrappedIdx, {
						x: zonesX[i].worldMax,
						y: y,
						z: z
					});
				}
			}

			x = zonesX[i].min;
			for(y = zonesY[i].min; y != zonesY[i].max; y = getNextWrap(y)) {
				for(z = zonesZ[i].min; z != zonesZ[i].max; z = getNextWrap(z)) {
					wrappedIdx = getIdx(x,y,z);
					zoneFunctions[i].backward(wrappedIdx, {
						x: zonesX[i].worldMin,
						y: y,
						z: z
					});
				}
			}
		}
	};

	pub.size = size;

	function getIdx(x, y, z) {
		return x + size * (y + size * z);
	}
	return pub;
};
