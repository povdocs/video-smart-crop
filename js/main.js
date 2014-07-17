(function (window) {
	'use strict';
	var video = document.getElementById('video'),
		enabled = document.getElementById('enabled'),
		timecode = document.getElementById('timecode'),
		position = document.getElementById('position'),
		box = document.getElementById('box'),
		boxdata = document.getElementById('boxdata'),
		start = document.getElementById('start'),

		// Customize this value for your specific video file
		FRAME_RATE = 23.976216,

		currentTime,

		popcorn,
		player,

		dragging = false,
		boxX = 0,
		boxY = 0,
		boxWidth = 0,
		boxHeight = 0;

	// Load scene data from JSON file on the server
	function fetch() {
		var xhr = new XMLHttpRequest();
		xhr.onload = function () {
			var response;

			response = JSON.parse(xhr.responseText);
			response.forEach(function (scene) {
				var options = {
					start: Popcorn.util.toSeconds(scene.start, FRAME_RATE),
					end: scene.end && Popcorn.util.toSeconds(scene.end, FRAME_RATE)
				};
				['x', 'y', 'width', 'height', 'minAspect', 'maxAspect'].forEach(function (field) {
					var val = scene[field],
						keyframes;

					if (typeof val === 'object') {
						keyframes = {};
						Popcorn.forEach(val, function (val, time) {
							if (/[;:]/.test(time)) {
								time = Popcorn.util.toSeconds(time, FRAME_RATE);
								time = (time - options.start) / (options.end - options.start);
							}
							keyframes[time] = val;
						});
						options[field] = keyframes;
					} else if (val !== undefined) {
						options[field] = val;
					}
				});
				popcorn.smartcrop(options);
			});
		};
		xhr.open('GET', 'data/shots.json');
		xhr.send();
	}

	// Calculate coordinates of a mouse event relative to an element
	function calcCoords(clientX, clientY) {
		var parent = video,
			x = 0,
			y = 0;

		while (parent && parent !== document.body) {
			x += parent.offsetLeft;
			y += parent.offsetTop;
			parent = parent.offsetParent;
		}

		x = clientX - x;
		y = clientY - y;

		return {
			x: x,
			y:  y
		};
	}

	// Get transformation matrix for an element that may use CSS transforms
	function elementMatrix(element) {
		var st = window.getComputedStyle(element, null),
			tr = st.getPropertyValue("transform") ||
				st.getPropertyValue("-webkit-transform") ||
				st.getPropertyValue("-moz-transform") ||
				st.getPropertyValue("-ms-transform") ||
				st.getPropertyValue("-o-transform");

		if (tr && tr !== 'none') {
			return tr.substr(7, tr.length - 8).split(', ').map(parseFloat);
		}

		return [1, 0, 0, 1, 0, 0];
	}

	// Display mouse coordinates relative to video
	function displayCoords(e) {
		var coords = calcCoords(e.clientX, e.clientY),
			m = elementMatrix(video),
			x, y;

		//undo the CSS transform. This won't work if there's a skew or rotation
		x = (coords.x - m[4]) / m[0];
		y = (coords.y - m[5]) / m[3];

		position.innerHTML = Math.round(x) + ', ' +
			Math.round(y);
	}

	// Display current timecode for debugging/authoring
	function displayTime() {
		var h,
			s,
			f,
			t;

		function twoDigits(n) {
			if (n < 10) {
				return '0' + n.toString();
			}

			return n.toString();
		}

		if (currentTime !== video.currentTime) {
			currentTime = video.currentTime;
			t = currentTime;
			f = Math.round((t % 1) * FRAME_RATE);
			t = Math.floor(t);
			s = t % 60;
			t = (t - s) / 60;

			timecode.innerHTML = t + ':' + twoDigits(s) + ';' + twoDigits(f);
		}

		requestAnimationFrame(displayTime);
	}

	// Display coordinates relative to video pixels of a rectangle drawn with mouse
	// For authoring
	function updateBox() {
		var topLeft,
			m = elementMatrix(video),
			top,
			left,
			width,
			height,
			bottom,
			right;


		if (boxWidth >= 0) {
			box.style.left = boxX + 'px';
			box.style.width = boxWidth + 'px';
		} else {
			box.style.left = boxX + boxWidth + 'px';
			box.style.width = -boxWidth + 'px';
		}

		if (boxHeight >= 0) {
			box.style.top = boxY + 'px';
			box.style.height = boxHeight + 'px';
		} else {
			box.style.top = boxY + boxHeight + 'px';
			box.style.height = -boxHeight + 'px';
		}

		topLeft = calcCoords(Math.min(boxX, boxX + boxWidth), Math.min(boxY, boxY + boxHeight));

		//undo the CSS transform. This won't work if there's a skew or rotation
		left = (topLeft.x - m[4]) / m[0];
		top = (topLeft.y - m[5]) / m[3];

		right = topLeft.x + Math.abs(boxWidth);
		bottom = topLeft.y + Math.abs(boxHeight);

		width = (right - m[4]) / m[0] - left;
		height = (bottom - m[5]) / m[3] - top;

		boxdata.innerHTML = [
			left, width, top, height
		].map(Math.round).join(', ');
	}

	video.addEventListener('mousedown', function (evt) {
		if (evt.which === 1) {
			dragging = true;
			boxX = evt.clientX;
			boxY = evt.clientY;
			boxWidth = 0;
			boxHeight = 0;
			box.style.display = '';
			updateBox();
			evt.preventDefault();
		}
	}, true);

	window.addEventListener('mousemove', function (evt) {
		if (dragging) {
			boxWidth = evt.clientX - boxX;
			boxHeight = evt.clientY - boxY;
			updateBox();
			evt.preventDefault();
		}
	}, true);

	window.addEventListener('mouseup', function () {
		dragging = false;
		if (!boxWidth || !boxHeight) {
			box.style.display = 'none';
		}
	}, true);

	box.addEventListener('click', function () {
		dragging = false;
		boxWidth = 0;
		boxHeight = 0;
		box.style.display = 'none';
	}, false);

	window.addEventListener('keyup', function(evt) {
		if (evt.which === 32) {
			if (video.paused) {
				video.play();
			} else {
				video.pause();
			}
		}
	}, true);

	window.addEventListener('keydown', function(evt) {
		if (video.paused) {
			if (evt.which === 37) {
				video.currentTime = video.currentTime - 1 / FRAME_RATE;
			} else if (evt.which === 39) {
				video.currentTime = video.currentTime + 1 / FRAME_RATE;
			}
		}
	}, true);

	window.addEventListener('mousemove', displayCoords, false);

	player = new Play({
		media: video,
		playButton: 'playbutton',
		timeline: 'timeline',
		container: 'video-player'
	});

	if (video.readyState) {
		fetch();
	} else {
		video.addEventListener('loadedmetadata', fetch);
	}

	popcorn = Popcorn('#video', { // jshint ignore:line
		frameAnimation: true,
		framerate: FRAME_RATE
	});

	// smart cropping effect can be turned on/off
	enabled.addEventListener('change', function () {
		if (enabled.checked) {
			popcorn.enable('smartcrop');
			video.className = '';
		} else {
			popcorn.disable('smartcrop');
			video.className = 'center';
		}
	});

	start.addEventListener('click', function () {
		video.play();
	});

	video.addEventListener('playing', function () {
		start.style.display = 'none';
		document.getElementById('video-player').style.display = '';
	});

	displayTime();

}(window));
