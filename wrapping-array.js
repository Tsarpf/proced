var PROCED = PROCED || {};
PROCED.wrappingArray = function(size) {
	var zonesX = [],
		zonesY = [],
		zonesZ = [];
	var centerIdx = ~~(size / 2),
		zoneCount = centerIdx + 1,
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
		//TODO: increment something

		for(var i = 0; i < zonesX.length; i++) {
			zonesX[i].max = getNextWrap(zonesX[i].max);
			zonesX[i].min = getNextWrap(zonesX[i].min);
		}

		var x = zonesX[i].max; 
		for(var y = zonesY[i].min; y != zonesY[i].max; y = getNextWrap(y)) {
			for(var z = zonesZ[i].min; z != zonesZ[i].max; z = getNextWrap(z)) {
				var wrappedIdx = getIdx(x,y,z);
				zoneFunctions[i].forward(wrappedIdx, worldCoords);
				//keep track of world coordinates 
			}

		}
		//Go through all style thing
		//Could be used for handling all job queuing before any computation
		/*
		for(var x = 0; x < size; x++) {
			for(var y = 0; y < size; y++) {
				for(var z = 0; z < size; z++) {
					var count = 0;
					while(count < zoneCount) {
						//Go from smallest zone to biggest
						//See if inside the zone 
						
						//(Note that it's not a trivial min < x < max
						//check because of the array wrapping!!!)


					}
				}
			}
		}
		*/

		//go through zones one by one starting from the center
		/*
		var zone = 0;
		while(zone < zoneCount) {
			for(var x = zonesX[1].min; x != zonesX[1].max; x++) {
				for(var y = zonesY[1].min; y != zonesY[1].max; y++) {
					for(var z = zonesZ[1].min; z != zonesY[1].max; z++) {
								
					}
				}
			}
			zone++;
		}
		*/

		//[ ][x][x][x][ ]
		//[ ][x][x][x][ ]
		//[ ][x][x][x][ ]
		//[ ][ ][ ][ ][ ]
		//[ ][ ][ ][ ][ ]
		

		//[ ][ ][x][x][x]
		//[ ][ ][x][x][x]
		//[ ][ ][x][x][x]
		//[ ][ ][ ][ ][ ]
		//[ ][ ][ ][ ][ ]

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
