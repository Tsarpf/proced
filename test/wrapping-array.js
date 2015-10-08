function emptyFunction() {
}
var wrappingArray = require('../wrapping-array');
var assert = require('assert');
describe('wrapping array basics', function() {
	it('should not crash', function() {
		wrappingArray(5);
	});
});

describe('zones', function() {
	it('should call set zone correct number of times', function(done) {
		var array = wrappingArray(3);
		array.setZoneFunction(0, emptyFunction, emptyFunction);
		var count = 0;
		array.setZoneFunction(1, function() {
			count++;
			if(count === 9) {
				done();
			}
		}, emptyFunction);
		array.dirXPlus();
	});
});

describe('zone function world coordinates', function() {
	it('should give correct world coordinates when zigzagging around positive side', function() {
		var array = wrappingArray(3);
		array.setZoneFunction(0, emptyFunction, emptyFunction);
		for(i = 0; i < 3; i++) {
			array.setZoneFunction(1, function(arrayCell, worldPos) {
				assert.equal(worldPos.z, 3 + i);
			}, function(arrayCell, worldPos) {
				console.log(arrayCell, worldPos);
				assert.equal(worldPos.z,  1 + i);
			});
			array.dirZPlus();
		}
		for(var i = 0; i < 3; i++) {
			array.setZoneFunction(1, function(arrayCell, worldPos) {
				assert.equal(worldPos.x, 3 + i);
			}, emptyFunction);
			array.dirXPlus();

			array.setZoneFunction(1, function(arrayCell, worldPos) {
				assert.equal(worldPos.y, 3 + i);
			}, emptyFunction);
			array.dirYPlus();
		}
		for(i = 0; i < 3; i++) {
			array.setZoneFunction(1, function(arrayCell, worldPos) {
				assert.equal(worldPos.x, 2 - i);
			}, emptyFunction);
			array.dirXMinus();

			array.setZoneFunction(1, function(arrayCell, worldPos) {
				assert.equal(worldPos.y, 2 - i);
			}, emptyFunction);
			array.dirYMinus();
		}
		for(i = 0; i < 3; i++) {
			array.setZoneFunction(1, function(arrayCell, worldPos) {
				assert.equal(worldPos.z, 2 - i);
			}, function(arrayCell, worldPos) {
				console.log(arrayCell, worldPos);
			});
			array.dirZMinus();
		}
	});

	it('should give correct world coords when moving around both sides of zero', function() {
		var array = wrappingArray(3);
		array.setZoneFunction(0, emptyFunction, emptyFunction);
		for(var i = 0; i < 5; i++) {
			array.setZoneFunction(1, function(arrayCell, worldPos) {
				assert.equal(worldPos.z, -1 - i);
			}, emptyFunction);
			array.dirZMinus();
		}
		for(i = 0; i < 5; i++) {
			array.setZoneFunction(1, function(arrayCell, worldPos) {
				assert.equal(worldPos.y, -1 - i);
			}, emptyFunction);
			array.dirYMinus();
		}

		for(i = 0; i < 7; i++) {
			array.setZoneFunction(1, function(arrayCell, worldPos) {
				assert.equal(worldPos.z, -2 + i);
			}, emptyFunction);
			array.dirZPlus();
		}

		for(i = 0; i < 5; i++) {
			array.setZoneFunction(1, function(arrayCell, worldPos) {
				assert.equal(worldPos.x, -1 - i);
			}, emptyFunction);
			array.dirXMinus();
		}

		for(i = 0; i < 7; i++) {
			array.setZoneFunction(1, function(arrayCell, worldPos) {
				assert.equal(worldPos.x, -2 + i);
			}, emptyFunction);
			array.dirXPlus();
		}
		for(i = 0; i < 7; i++) {
			array.setZoneFunction(1, function(arrayCell, worldPos) {
				assert.equal(worldPos.y, -2 + i);
			}, emptyFunction);
			array.dirYPlus();
		}
	});
});


describe('zone function array indices', function() {
	it('should give correct array indices when going in x plus', function() {
		var array = wrappingArray(3);
		array.setZoneFunction(1, function(arrayCell) {
			assert.equal(arrayCell[0], 0);
		}, emptyFunction);
		array.setZoneFunction(2, function(arrayCell) {
			assert.equal(arrayCell[0], 1);
		}, emptyFunction);
		array.dirXPlus();
	});

	it('should give correct array indices when going in x minus', function() {
		var array = wrappingArray(3);
		array.setZoneFunction(1, function(arrayCell) {
			assert.equal(arrayCell[0], 2);
		}, emptyFunction);
		array.setZoneFunction(2, function(arrayCell) {
			assert.equal(arrayCell[0], 1);
		}, emptyFunction);
		array.dirXMinus();
	});

	it('should give correct array indices when going in y plus', function() {
		var array = wrappingArray(3);
		array.setZoneFunction(1, function(arrayCell) {
			assert.equal(arrayCell[1], 0);
		}, emptyFunction);
		array.setZoneFunction(2, function(arrayCell) {
			assert.equal(arrayCell[1], 1);
		}, emptyFunction);
		array.dirYPlus();
	});

	it('should give correct array indices when going in y minus', function() {
		var array = wrappingArray(3);
		array.setZoneFunction(1, function(arrayCell) {
			assert.equal(arrayCell[1], 2);
		}, emptyFunction);
		array.setZoneFunction(2, function(arrayCell) {
			assert.equal(arrayCell[1], 1);
		}, emptyFunction);
		array.dirYMinus();
	});

	it('should give correct array indices when going in z plus', function() {
		var array = wrappingArray(3);
		array.setZoneFunction(1, function(arrayCell) {
			assert.equal(arrayCell[2], 0);
		}, emptyFunction);
		array.setZoneFunction(2, function(arrayCell) {
			assert.equal(arrayCell[2], 1);
		}, emptyFunction);
		array.dirZPlus();
	});

	it('should give correct array indices when going in z minus', function() {
		var array = wrappingArray(3);
		array.setZoneFunction(1, function(arrayCell) {
			assert.equal(arrayCell[2], 2);
		}, emptyFunction);
		array.setZoneFunction(2, function(arrayCell) {
			assert.equal(arrayCell[2], 1);
		}, emptyFunction);
		array.dirZMinus();
	});
});
