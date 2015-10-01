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
	pub.dirXMinus = function() {
		pub.dirXPlus(true);
	};
	pub.dirXPlus = function(minus) {
		for(var i = 0; i < zonesX.length; i++) {
			if(minus) {
				zonesX[i].max = getPrevWrap(zonesX[i].max);
				zonesX[i].min = getPrevWrap(zonesX[i].min);
				zonesX[i].worldMax--;
				zonesX[i].worldMin--;
			}
			else {
				zonesX[i].max = getNextWrap(zonesX[i].max);
				zonesX[i].min = getNextWrap(zonesX[i].min);
				zonesX[i].worldMax++;
				zonesX[i].worldMin++;
			}

			var x = zonesX[i].max,
				xp = minus ? zonesX[i].worldMin : zonesX[i].worldMax,
				y, z, yWorld, zWorld;
			for(y = zonesY[i].min, yWorld = zonesY[i].worldMin; y != zonesY[i].max; y = getNextWrap(y), yWorld++) {
				for(z = zonesZ[i].min, zWorld = zonesZ[i].worldMin; z != zonesZ[i].max; z = getNextWrap(z), zWorld++) {
					zoneFunctions[i].forward(
						[x,y,z], {
							x: xp,
							y: yWorld,
							z: zWorld
						}
					);
				}
			}

			x = zonesX[i].min;
			xp = minus ? zonesX[i].worldMax : zonesX[i].worldMin;
			for(y = zonesY[i].min, yWorld = zonesY[i].worldMin; y != zonesY[i].max; y = getNextWrap(y), yWorld++) {
				for(z = zonesZ[i].min, zWorld = zonesZ[i].worldMin; z != zonesZ[i].max; z = getNextWrap(z), zWorld++) {
					zoneFunctions[i].backward(
						[x,y,z], {
							x: xp,
							y: yWorld,
							z: zWorld
						}
					);
				}
			}
		}
	};
	pub.dirYMinus = function() {
		pub.dirYPlus(true);
	};
	pub.dirYPlus = function(minus) {
		for(var i = 0; i < zonesY.length; i++) {
			if(minus) {
				zonesY[i].max = getPrevWrap(zonesY[i].max);
				zonesY[i].min = getPrevWrap(zonesY[i].min);
				zonesY[i].worldMax--;
				zonesY[i].worldMin--;
			}
			else {
				zonesY[i].max = getNextWrap(zonesY[i].max);
				zonesY[i].min = getNextWrap(zonesY[i].min);
				zonesY[i].worldMax++;
				zonesY[i].worldMin++;
			}

			var y = zonesY[i].max,
				yp = minus ? zonesY[i].worldMin : zonesY[i].worldMax,
				x, z, xWorld, zWorld;
			for(x = zonesX[i].min, xWorld = zonesX[i].worldMin; x != zonesX[i].max; x = getNextWrap(x), xWorld++) {
				for(z = zonesZ[i].min, zWorld = zonesZ[i].worldMin; z != zonesZ[i].max; z = getNextWrap(z), zWorld++) {
					zoneFunctions[i].forward(
						[x,y,z], {
							x: xWorld,
							y: yp, 
							z: zWorld
						}
					);
				}
			}

			y = zonesY[i].min;
			yp = minus ? zonesY[i].worldMax : zonesY[i].worldMin;
			for(x = zonesX[i].min, xWorld = zonesX[i].worldMin; x != zonesX[i].max; x = getNextWrap(x), xWorld++) {
				for(z = zonesZ[i].min, zWorld = zonesZ[i].worldMin; z != zonesZ[i].max; z = getNextWrap(z), zWorld++) {
					zoneFunctions[i].backward(
						[x,y,z], {
							x: xWorld,
							y: yp,
							z: zWorld
						}
					);
				}
			}
		}
	};
	pub.dirZMinus = function() {
		pub.dirZPlus(true);
	};
	pub.dirZPlus = function(minus) {
		for(var i = 0; i < zonesZ.length; i++) {
			if(minus) {
				zonesZ[i].max = getPrevWrap(zonesZ[i].max);
				zonesZ[i].min = getPrevWrap(zonesZ[i].min);
				zonesZ[i].worldMax--;
				zonesZ[i].worldMin--;
			}
			else {
				zonesZ[i].max = getNextWrap(zonesZ[i].max);
				zonesZ[i].min = getNextWrap(zonesZ[i].min);
				zonesZ[i].worldMax++;
				zonesZ[i].worldMin++;
			}

			var z = zonesZ[i].max,
				zp = minus ? zonesZ[i].worldMin : zonesZ[i].worldMax,
				x, y, xWorld, yWorld;
			for(x = zonesX[i].min, xWorld = zonesX[i].worldMin; x != zonesX[i].max; x = getNextWrap(x), xWorld++) {
				for(y = zonesY[i].min, yWorld = zonesY[i].worldMin; y != zonesY[i].max; y = getNextWrap(y), yWorld++) {
					zoneFunctions[i].forward(
						[x,y,z], {
							x: xWorld,
							y: yWorld,
							z: zp
						}
					);
				}
			}

			z = zonesZ[i].min;
			zp = minus ? zonesZ[i].worldMax : zonesZ[i].worldMin;
			for(x = zonesX[i].min, xWorld = zonesX[i].worldMin; x != zonesX[i].max; x = getNextWrap(x), xWorld++) {
				for(y = zonesY[i].min, yWorld = zonesY[i].worldMin; y != zonesY[i].max; y = getNextWrap(y), yWorld++) {
					zoneFunctions[i].backward(
						[x,y,z], {
							x: xWorld,
							y: yWorld,
							z: zp
						}
					);
				}
			}
		}
	};
	pub.size = size;
	return pub;
};

if(typeof module !== 'undefined') {
	/*eslint-env node, mocha */
	module.exports = PROCED.wrappingArray;
}
