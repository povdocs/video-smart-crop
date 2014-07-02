(function (Popcorn) {

	'use strict';

	var instances = {},
		resizeTimeout,
		lastResize = 0,

		windowWidth = 0,
		windowHeight = 0;

	function resize(popcorn) {
		var instance = instances[popcorn.id],
			list,
			i,
			videoAspect,
			windowAspect,
			options,
			video;

		function adjustedCoord(pos, scaleFactor, videoDim, windowDim) {
			var fraction = pos / videoDim,
				scaledVideoDim = videoDim * scaleFactor,
				original = fraction * scaledVideoDim,
				adjusted = windowDim * fraction;

			return adjusted - original;
		}

		if (!instance) {
			return;
		}

		list = instance.events;

		//todo: loop, match min/max aspect. for (i = 0; )
		options = list[0];
		video = popcorn.media;
		if (options) {
			videoAspect = video.videoWidth / video.videoHeight;
			windowAspect = windowWidth / windowHeight;

			if (windowAspect > videoAspect) {
				//window is not tall enough
				instance.targetX = 0;
				instance.targetY = adjustedCoord(options.y, windowWidth / video.videoWidth, video.videoHeight, windowHeight);
				//instance.targetY = -options.y * (1 - videoAspect / windowAspect);
				video.style.width = '100%';
				video.style.height = windowWidth / videoAspect + 'px';
			} else {
				instance.targetX = adjustedCoord(options.x, windowHeight / video.videoHeight, video.videoWidth, windowWidth);
				//instance.targetX = -options.x * (1 - windowAspect / videoAspect);
				instance.targetY = 0;
				video.style.width = windowHeight * videoAspect + 'px';
				video.style.height = '100%';
			}

			if (instance.targetX !== instance.x) {
				instance.x = instance.targetX;
				video.style.left = instance.x + 'px'
			}

			if (instance.targetY !== instance.y) {
				instance.y = instance.targetY;
				video.style.top = instance.y + 'px'
			}
		} else {
			/*
			instance.x = -1;
			instance.y = -1;
			video.style.width = '';
			video.style.height = '';
			video.style.top = '';
			video.style.left = '';
			*/
		}
	}

	function resizeAll() {
		if (windowHeight === window.innerHeight &&
				windowWidth === window.innerWidth) {

			return;
		}

		windowHeight = window.innerHeight;
		windowWidth = window.innerWidth;

		Popcorn.instances.forEach(resize);
	}

	function resizeWindow() {
		if (!force || Date.now() - lastResize < 250) {
			clearTimeout(resizeTimeout);
			resizeTimeout = setTimeout(resizeTimeout, 250);
		} else {
			resizeAll();
		}
	}

	function sortEvents(a, b) {
		if (a.minAspect !== b.minAspect) {
			return b.minAspect - a.minAspect;
		}

		if (a.maxAspect !== b.maxAspect) {
			return b.minAspect - a.minAspect;
		}		
	}

	function addEvent(popcorn, event) {
		var instance = instances[popcorn.id];
		if (!instance) {
			instance = instances[popcorn.id] = {
				events: [],
				x: -1,
				y: -1,
				targetX: 0,
				targetY: 0
			};
			popcorn.on('loadedmetadata', function () {
				resize(popcorn);
			});
		}

		if (instance.events.indexOf(event) < 0) {
			instance.events.push(event);
			instance.events.sort(sortEvents);
			resize(popcorn);
		}
		return instance;
	}

	function removeEvent(popcorn, event) {
		var instance = instances[popcorn.id],
			list = instance && instance.events,
			index;

		if (list) {
			index = list.indexOf(event);
			if (index >= 0) {
				list.splice(index, 1);
				resize(popcorn);
			}
		}
	}

	/*
	todo: only attach these if there is at least one event,
	detach when the last event is destroyed
	*/
	window.addEventListener('resize', resizeAll, false);
	window.addEventListener('orientationchange', resizeAll, false);
	resizeAll();

	Popcorn.basePlugin('responsive', function (options, base) {
		var popcorn = base.popcorn,
			instance;

		base.animate('x', function (val) {
			resize(popcorn);
		});

		base.animate('y', function (val) {
		});

		return {
			start: function() {
				instance = addEvent(popcorn, base.options);
			},
			frame: function () {
				/*
				only update if this is the highest-priority active instance
				that matches 
				*/
			},
			end: function() {
				removeEvent(popcorn, base.options);
			}
		};
	}, {
		about: {
			name: 'Popcorn Responsive Video Plugin',
			version: '0.1',
			author: 'Brian Chirls, @bchirls',
			website: 'http://github.com/brianchirls'
		}
	});
}(window.Popcorn));
