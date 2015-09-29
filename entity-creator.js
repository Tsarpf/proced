var XPOS = 0,
	YPOS = 1,
	ZPOS = 2;

pc.script.create('objcreator', function (app) { //context / app can be taken as argument
	var CreatorObject = function (entity) {
		this.entity = entity;
	};

	CreatorObject.prototype = {
		initialize: function () {
			this.addNewEntity([0,0,0]);
			this.addNewEntity([-32,0,0]);
			this.addNewEntity([32,0,0]);
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
					}],
					name: 'procComponent'
				}]
			});
			//console.log(entity.script.chunkPosition);
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
