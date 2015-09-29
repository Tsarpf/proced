var XPOS = 0,
	YPOS = 1,
	ZPOS = 2;

pc.script.create('objcreator', function (app) { //context / app can be taken as argument
	var chunkSizeX = 32,
		chunkSizeY = 32,
		chunkSizeZ = 32;

	var CreatorObject = function (entity) {
		this.entity = entity;
	};

	CreatorObject.prototype = {
		initialize: function () {
			for(var x = 0; x < 3; x++) {
				for(var y = 0; y < 3; y++) {
					for(var z = 0; z < 3; z++) {
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
					}],
					name: 'procComponent'
				}]
			});
			entity.setLocalPosition(
				position[XPOS],
				position[YPOS],
				position[ZPOS]
			);

			app.root.addChild(entity);
		}
	};
	return CreatorObject;
});
