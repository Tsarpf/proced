pc.script.create('ui', function () {
	var UI = function (entity) {
		this.entity = entity;
	};

	UI.prototype = {
		initialize: function () {
			// Create a div centred inside the main canvas
			var div = document.createElement('div');
			div.style.position = 'absolute';
			div.style.width = '500px';
			div.style.top = '50%';
			div.style.left = '50%';
			div.style.marginLeft = '-250px';            
			div.style.textAlign = 'center';
			div.style.color = 'white';
			div.style.fontSize = 'xx-large';
			div.style.visibility = 'hidden';

			//div.setAttribute('class', 'marquee');	

			// Add the div to the DOM as a child of the document's body element
			document.body.appendChild(div);

			this.div = div;

			// Set some default state on the UI element
			this.setText('Loading...');
			this.setVisibility(true);
			this.initializeProgressBar();

			var texts = [
				{
					text: 'tetsing testings',
					time: 10000
				},
				{
					text: 'asding asdfing',
					time: 500 
				},
				{
					text: 'hurr durr',
					time: 1000
				},
				{
					text: 'hurr durrr',
					time: 1000
				},
				{
					text: 'hurr durrrrr',
					time: 1000
				},
				{
					text: 'derp herp : )',
					time: 1000
				}
			];
			
			this.queueMultipleText(texts);
		},


		// Some utility functions that can be called from other game scripts
		setVisibility: function (visible) {
			this.div.style.visibility = visible ? 'visible' : 'hidden';
		},

		setText: function (message) {
			this.div.innerHTML = message;
		},

		queueMultipleText: function(texts) {
			var startTime = 0;
			var that = this;
			that.setText(texts[0].text);
			for(var i = 1; i < texts.length; i++) {
				var time = texts[i-1].time;
				var text = texts[i].text;

				var timeClosure = function(text) {
					return function() {
						that.setText(text);
					};
				};

				setTimeout(timeClosure(text), time + startTime);
				startTime += time;
			}
		},

		showTextFor: function (text, time, callback) {
			this.setText(text);
			setTimeout(function() {
				callback();
			}, time);
		},
		initializeProgressBar: function() {
			var progress = document.createElement('progress');
			this.progressBar = progress;
			this.progressBar.setAttribute('value', '22');
			this.progressBar.setAttribute('max', '100');
			this.progressBar.style.position = 'absolute';
			this.progressBar.style.width = '500px';
			this.progressBar.style.top = '50%';
			this.progressBar.style.left = '50%';
			this.progressBar.style.marginLeft = '-250px';            
			this.progressBar.style.textAlign = 'center';
			//this.progressBar.style.color = 'white';
			//this.progressBar.style.fontSize = 'xx-large';
			document.body.appendChild(this.progressBar);
			/*
			$('.marquee').marquee({
				direction: 'down',
				duration: 2000
			});
			*/
		}
	};

	return UI;
});
