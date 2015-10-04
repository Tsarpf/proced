pc.script.attribute('proceduralComponent', 'script');
/*global noise:false*/
var XPOS = 0,
	YPOS = 1,
	ZPOS = 2;

pc.script.create('objcreator', function (app) { //context / app can be taken as argument
	var CreatorObject = function (entity) {
		this.entity = entity;
	};

	CreatorObject.prototype = {
		initialize: function () {
			noise.seed(2);
		},
		chunkSizeX: 8,
		chunkSizeY: 8,
		chunkSizeZ: 8,
		scaleFactor: 1,
		addNewEntity: function(position, visible) {
			position = [
				position[XPOS] * (this.chunkSizeX - 1),
				position[YPOS] * (this.chunkSizeY - 1),
				position[ZPOS] * (this.chunkSizeZ - 1)
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
						value: [
							this.chunkSizeX,
							this.chunkSizeY,
							this.chunkSizeZ
						]
					}, {
						name: 'scaleFactor',
						type: 'number',
						value: this.scaleFactor
					}, {
						name: 'visible',
						type: 'boolean',
						value: visible
					}],
					name: 'procComponent'
				}]
			});
			entity.setLocalPosition(
				position[XPOS] * this.scaleFactor,
				position[YPOS] * this.scaleFactor,
				position[ZPOS] * this.scaleFactor
			);

			app.root.addChild(entity);

			return entity;
		}
	};
	return CreatorObject;
});
