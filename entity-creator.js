/*global noise:false*/
var XPOS = 0,
	YPOS = 1,
	ZPOS = 2;

pc.script.create('objcreator', function (app) { //context / app can be taken as argument
	var chunkSizeX = 8,
		chunkSizeY = 8,
		chunkSizeZ = 8;
/*
	var chunkSizeX = 16,
		chunkSizeY = 16,
		chunkSizeZ = 16;
*/
/*
	var chunkSizeX = 32,
		chunkSizeY = 32,
		chunkSizeZ = 32;
*/

	var scaleFactor = 16;

	var CreatorObject = function (entity) {
		this.entity = entity;
	};

	CreatorObject.prototype = {
		initialize: function () {
			noise.seed(2);
			for(var x = 0; x < 5; x++) {
				for(var y = 0; y < 5; y++) {
					for(var z = 0; z < 5; z++) {

						this.addNewEntity([
							x * (chunkSizeX - 1),
							y * (chunkSizeY - 1),
							z * (chunkSizeZ - 1)
						]);


					}
				}
			}
		},
		addNewEntity: function(position) {
			var entity = new pc.Entity();	
			entity.addComponent('script', {
				scripts: [{
					url: 'procedural-component.js',
					attributes: [{
						name: 'chunkPos',
						type: 'vector',
						value: position
					}, {
						name: 'chunkSize',
						type: 'vector',
						value: [chunkSizeX, chunkSizeY, chunkSizeZ]
					}, {
						name: 'scaleFactor',
						type: 'number',
						value: scaleFactor
					}],
					name: 'procComponent'
				}]
			});
			entity.setLocalPosition(
				position[XPOS] * scaleFactor,
				position[YPOS] * scaleFactor,
				position[ZPOS] * scaleFactor
			);

			app.root.addChild(entity);
		}
	};
	return CreatorObject;
});
