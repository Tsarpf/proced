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
			array.setZoneFunction(1, function(wrappedIdx, worldPos) {
				assert.equal(worldPos.z, 3 + i);
			}, emptyFunction);
			array.dirZPlus();
		}
		for(var i = 0; i < 3; i++) {
			array.setZoneFunction(1, function(wrappedIdx, worldPos) {
				assert.equal(worldPos.x, 3 + i);
			}, emptyFunction);
			array.dirXPlus();

			array.setZoneFunction(1, function(wrappedIdx, worldPos) {
				assert.equal(worldPos.y, 3 + i);
			}, emptyFunction);
			array.dirYPlus();
		}
		for(i = 0; i < 3; i++) {
			array.setZoneFunction(1, function(wrappedIdx, worldPos) {
				assert.equal(worldPos.x, 2 - i);
			}, emptyFunction);
			array.dirXMinus();

			array.setZoneFunction(1, function(wrappedIdx, worldPos) {
				assert.equal(worldPos.y, 2 - i);
			}, emptyFunction);
			array.dirYMinus();
		}
		for(i = 0; i < 3; i++) {
			array.setZoneFunction(1, function(wrappedIdx, worldPos) {
				assert.equal(worldPos.z, 2 - i);
			}, emptyFunction);
			array.dirZMinus();
		}
	});

	it('should give correct world coords when moving around both sides of zero', function() {
		var array = wrappingArray(3);
		array.setZoneFunction(0, emptyFunction, emptyFunction);
		for(var i = 0; i < 5; i++) {
			array.setZoneFunction(1, function(wrappedIdx, worldPos) {
				assert.equal(worldPos.z, -1 - i);
			}, emptyFunction);
			array.dirZMinus();
		}
		for(i = 0; i < 5; i++) {
			array.setZoneFunction(1, function(wrappedIdx, worldPos) {
				assert.equal(worldPos.y, -1 - i);
			}, emptyFunction);
			array.dirYMinus();
		}

		for(i = 0; i < 7; i++) {
			array.setZoneFunction(1, function(wrappedIdx, worldPos) {
				assert.equal(worldPos.z, -2 + i);
			}, emptyFunction);
			array.dirZPlus();
		}

		for(i = 0; i < 5; i++) {
			array.setZoneFunction(1, function(wrappedIdx, worldPos) {
				assert.equal(worldPos.x, -1 - i);
			}, emptyFunction);
			array.dirXMinus();
		}

		for(i = 0; i < 7; i++) {
			array.setZoneFunction(1, function(wrappedIdx, worldPos) {
				assert.equal(worldPos.x, -2 + i);
			}, emptyFunction);
			array.dirXPlus();
		}
		for(i = 0; i < 7; i++) {
			array.setZoneFunction(1, function(wrappedIdx, worldPos) {
				assert.equal(worldPos.y, -2 + i);
			}, emptyFunction);
			array.dirYPlus();
		}
	});

	it.only('should give correct world coordinates with array size of 5', function() {
		var array = wrappingArray(5);
		array.setZoneFunction(1, function(wrappedIdx, worldPos) {
			assert.equal(worldPos.y, 0);
		}, emptyFunction);
		/*
		array.setZoneFunction(2, function(wrappedIdx, worldPos) {
			console.log('zone 2');
			console.log(worldPos);
			//assert.equal(worldPos.z, -1 - i);
		}, emptyFunction);
		*/
		array.dirYMinus();
	});
});
