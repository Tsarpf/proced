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
				min: centerIdx - count
			};
			zonesY[count] = {
				max: centerIdx + count,
				min: centerIdx - count
			};
			zonesZ[count] = {
				max: centerIdx + count,
				min: centerIdx - count
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
	function getPrevWrap(num) {
		if(num === 0) {
			return maxIdx;
		}
		else {
			return num - 1;	
		}
	}
	constructor();
	var pub = {};
	pub.setZoneFunction = function(zone, fnForward, fnBackward) {
		zoneFunctions[zone] = {
			forward: fnForward,
			backward: fnBackward
		};
	};
	pub.moveXPlus = function(worldCoords) {
		for(var i = 0; i < zonesX.length; i++) {
			zonesX[i].max = getNextWrap(zonesX[i].max);
			zonesX[i].min = getNextWrap(zonesX[i].min);

			var x = zonesX[i].max,
				y, z, wrappedIdx;
			for(y = zonesY[i].min; y != zonesY[i].max; y = getNextWrap(y)) {
				for(z = zonesZ[i].min; z != zonesZ[i].max; z = getNextWrap(z)) {
					wrappedIdx = getIdx(x,y,z);
					zoneFunctions[i].forward(wrappedIdx, worldCoords);
					//keep track of world coordinates somewhere else
					//example zone function:
					//zoneFnForDrawing(wrappedIdx, worldCoords) {
					//	array[wrappedIdx] = loadIfNotLoaded(worldCoords);
					//	array[wrappedIdx].draw()
					//}
				}
			}

			x = zonesX[i].min;
			for(y = zonesY[i].min; y != zonesY[i].max; y = getNextWrap(y)) {
				for(z = zonesZ[i].min; z != zonesZ[i].max; z = getNextWrap(z)) {
					wrappedIdx = getIdx(x,y,z);
					zoneFunctions[i].backward(wrappedIdx, worldCoords);
				}
			}

		}

	};

	pub.size = size;

	function getIdx(x, y, z) {
		return x + size * (y + size * z);
	}

	//var privateValue = 'ses';
	return pub;
};


//zone 3 hide but don't destroy
//zone 2 load
//zone 1 draw
