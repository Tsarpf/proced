/*global noise:false*/
var XPOS = 0,
	YPOS = 1,
	ZPOS = 2;

pc.script.create('objcreator', function (app) { //context / app can be taken as argument

	var scaleFactor = 16;
	var chunkSizeX = 8,
		chunkSizeY = 8,
		chunkSizeZ = 8;

	var CreatorObject = function (entity) {
		this.entity = entity;
	};

	CreatorObject.prototype = {
		initialize: function () {
			noise.seed(2);
		},
		addNewEntity: function(position, visible) {
			position = [
				position[XPOS] * (chunkSizeX - 1),
				position[YPOS] * (chunkSizeY - 1),
				position[ZPOS] * (chunkSizeZ - 1)
			];
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
					}, {
						name: 'visible',
						type: 'boolean',
						value: visible
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

			return entity;
		}
	};
	return CreatorObject;
});
