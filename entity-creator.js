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
		},
		addNewEntity: function(position) {
			var entity = new pc.Entity();	
			entity.addComponent('script', {
				scripts: [
					{ url: 'procedural-component.js' }
				]
			});
			entity.setLocalPosition(
				position[XPOS],
				position[YPOS],
				position[ZPOS]
			);

			app.root.addChild(entity);
		}
	};
});
