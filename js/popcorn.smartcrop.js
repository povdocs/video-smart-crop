(function (Popcorn) {

	'use strict';

	var instances = {},
		resizeTimeout,
		lastResize = 0,

		windowWidth = 0,
		windowHeight = 0,

		RESIZE_THROTTLE = 30;

	function resize(popcorn) {
		var instance = instances[popcorn.id],
			list,
			videoAspect,
			windowAspect,
			options,
			video,

			scale,
			min,
			clipDim,
			videoWidth,
			videoHeight,
			transform = '',

			i;

		if (!instance) {
			return;
		}

		list = instance.events;
		video = popcorn.media;

		videoWidth = video.videoWidth;
		videoHeight = video.videoHeight;
		videoAspect = videoWidth / videoHeight;
		windowAspect = windowWidth / windowHeight;

		//todo: loop, match min/max aspect. for (i = 0; )
		for (i = 0; i < list.length; i++) {
			options = list[i];
			if (windowAspect > videoAspect) {
				//window is not tall enough
				if (!options.minAspect || windowAspect >= options.minAspect) {
					scale = windowWidth / videoWidth;
					min = options.y;

					clipDim = videoWidth / windowAspect;
					if (clipDim < options.height) {
						//window is REALLY not tall enough, so we need to pillarbox
						scale = windowHeight / options.height;
						transform = 'scale(' + scale + ') translate(' +
							(windowWidth - videoWidth * scale) / 2 / scale + 'px, ' +
							-min +
							'px)';
					} else {
						transform = 'scale(' + scale + ') translateY(' +
							-((videoHeight - clipDim) * min / (videoHeight - options.height)) +
							'px)';
					}
					break;
				}
			} else {
				//window is not wide enough
				if (!options.maxAspect || windowAspect <= options.maxAspect) {
					scale = windowHeight / videoHeight;
					min = options.x;

					clipDim = videoHeight * windowAspect;
					if (clipDim < options.width) {
						//window is REALLY not wide enough, so we need to letterbox
						scale = windowWidth / options.width;
						transform = 'scale(' + scale + ') translate(' +
							-min + 'px,' +
							(windowHeight - videoHeight * scale) / 2 / scale+
							'px)';
					} else {
						transform = 'scale(' + scale + ') translateX(' +
							-((videoWidth - clipDim) * min / (videoWidth - options.width)) +
							'px)';
					}
					break;
				}
			}
		}

		video.style.webkitTransform = transform;
		video.style.msTransform = transform;
		video.style.mozTransform = transform;
		video.style.transform = transform;
	}

	function resizeAll() {
		lastResize = Date.now();
		if (windowHeight === window.innerHeight &&
				windowWidth === window.innerWidth) {

			return;
		}

		windowHeight = window.innerHeight;
		windowWidth = window.innerWidth;

		/*
		Hack for mobile safari. Because video element is full size and only
		appears smaller because of CSS transforms, body enlarges to fit the
		full size video. We need to shrink it to correctly position the play
		controls.
		*/
		document.body.style.width = windowWidth + 'px';
		document.body.style.height = windowHeight + 'px';

		Popcorn.instances.forEach(resize);
	}

	function resizeWindow() {
		if (Date.now() - lastResize < RESIZE_THROTTLE) {
			clearTimeout(resizeTimeout);
			resizeTimeout = setTimeout(resizeTimeout, RESIZE_THROTTLE);
		} else {
			resizeAll();
		}
	}

	function sortEvents(a, b) {
		if (a.minAspect !== b.minAspect) {
			return (b.minAspect || 0) - (a.minAspect || 0);
		}

		if (a.maxAspect !== b.maxAspect) {
			return (a.maxAspect || Infinity) - (b.maxAspect || Infinity);
		}

		//prioritize whichever one is shorter
		return (a.end - a.start) - (b.end - b.start);
	}

	function addEvent(popcorn, event) {
		var instance = instances[popcorn.id];
		if (!instance) {
			instance = instances[popcorn.id] = {
				events: [],
				x: -1,
				y: -1
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
	window.addEventListener('resize', resizeWindow, false);
	window.addEventListener('orientationchange', resizeAll, false);
	resizeAll();

	Popcorn.basePlugin('smartcrop', function (options, base) {
		var popcorn = base.popcorn;

		base.animate('x', function () {
			resize(popcorn);
		});

		base.animate('y', function () {
			resize(popcorn);
		});

		base.animate('width', function () {
			resize(popcorn);
		});

		base.animate('height', function () {
			resize(popcorn);
		});

		return {
			start: function() {
				addEvent(popcorn, base.options);
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
