pc.script.create('ui', function () {
	var UI = function (entity) {
		this.entity = entity;
	};

	UI.prototype = {
		initialize: function () {
			// Create a div centred inside the main canvas
			var div = document.createElement('marquee');
			div.style.position = 'absolute';
			div.style.width = '500px';
			div.style.top = '50%';
			div.style.left = '50%';
			div.style.marginLeft = '-250px';            
			div.style.textAlign = 'center';
			div.style.color = 'white';
			div.style.fontSize = 'xx-large';
			div.style.visibility = 'hidden';

			// Add the div to the DOM as a child of the document's body element
			document.body.appendChild(div);

			this.div = div;

			// Set some default state on the UI element
			this.setText('Marching cubes is an awesome algorithm! yay! this is a lot of text which I intend to show and people should read asdaasd very much yes indeed!');
			this.setVisibility(true);
		},

		// Some utility functions that can be called from other game scripts
		setVisibility: function (visible) {
			this.div.style.visibility = visible ? 'visible' : 'hidden';
		},

		setText: function (message) {
			this.div.innerHTML = message;
		}
	};

	return UI;
});
