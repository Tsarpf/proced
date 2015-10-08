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

		update: function() {
			//oispa beer
			if(this.showBar) {
				var total = this.endTime - this.startTime;
				var current = performance.now();
				if(current > this.endTime) {
					this.showBar = false;
				}
				var progress  = (current - this.startTime) / total * 100;
				this.setProgress(progress);
			}
		},

		setProgress: function(value) {
			this.progressBar.setAttribute('value', '' + value);
		},

		// Some utility functions that can be called from other game scripts
		setVisibility: function (visible) {
			this.div.style.visibility = visible ? 'visible' : 'hidden';
		},

		startTime: 0,
		endTime: 0,
		showBar: false,
		showProgressBar: function(time) {
			this.startTime = performance.now();
			this.endTime = this.startTime + time;
			this.showBar = true;
		},

		setText: function (message, time) {
			if(time) {
				this.showProgressBar(time);
			}
			this.div.innerHTML = message;
		},
		queueMultipleText: function(texts) {
			var startTime = 0;
			var that = this;
			that.setText(texts[0].text, texts[0].time);
			for(var i = 1; i < texts.length; i++) {
				var time = texts[i-1].time;
				var text = texts[i].text;

				var timeClosure = function(text, time) {
					return function() {
						that.setText(text, time);
					};
				};

				setTimeout(timeClosure(text, texts[i].time), time + startTime);
				startTime += time;
			}
		},
		initializeProgressBar: function() {
			var progress = document.createElement('progress');
			this.progressBar = progress;
			this.setProgress(22);
			this.progressBar.setAttribute('max', '100');
			this.progressBar.style.position = 'absolute';
			this.progressBar.style.width = '500px';
			this.progressBar.style.height = '10px';
			this.progressBar.style.top = '40%';
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
