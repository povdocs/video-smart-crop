(function (window) {
	'use strict';
	var video = document.getElementById('video'),
		enabled = document.getElementById('enabled'),
		timecode = document.getElementById('timecode'),
		position = document.getElementById('position'),
		box = document.getElementById('box'),
		boxdata = document.getElementById('boxdata'),

		FRAME_RATE = 23.976216,

		currentTime,

		popcorn,
		player,

		dragging = false,
		boxX = 0,
		boxY = 0,
		boxWidth = 0,
		boxHeight = 0;

	function fetch() {
		var xhr = new XMLHttpRequest();
		xhr.onload = function () {
			var response,
				base;

			base = {
				x: 0,
				y: 0,
				width: video.videoWidth,
				height: video.videoHeight
			};

			response = JSON.parse(xhr.responseText);
			response.forEach(function (scene) {
				var options = {
					start: scene.start,
					end: scene.end
				};
				['x', 'y', 'width', 'height'].forEach(function (field) {
					var val = scene[field],
						keyframes;

					if (typeof val === 'object') {
						keyframes = {};
						Popcorn.forEach(val, function (val, time) {
							if (isNaN(parseInt(time, 10))) {
								time = Popcorn.util.toSeconds(time, FRAME_RATE);
								time = (time - scene.start) / (scene.end - scene.start);
							}
							keyframes[time] = val;
						});
						options[field] = keyframes;
					} else {
						options[field] = val;
					}
				});
				popcorn.responsive(options);
			});
		};
		xhr.open('GET', 'data/boxer.json');
		xhr.send();
	}


	function calcCoords(clientX, clientY) {
		var parent = video,
			x = 0,
			y = 0;

		while (parent && parent !== document.body) {
			x += parent.offsetLeft;
			y += parent.offsetTop;
			parent = parent.offsetParent;
		}

		return {
			x: clientX - x,
			y: clientY - y
		};
	}

	function displayCoords(e) {
		var coords = calcCoords(e.clientX, e.clientY),
			scaleFactor = Math.max(window.innerWidth / video.videoWidth, window.innerHeight / video.videoHeight);

		position.innerHTML = Math.round(coords.x / scaleFactor) + ', ' +
			Math.round(coords.y / scaleFactor);
	}

	// for debugging/authoring
	function displayTime() {
		var h,
			m,
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
			m = t % 60;
			h = (t - m) / 60;

			timecode.innerHTML = h + ':' + twoDigits(m) + ':' + twoDigits(s) + ';' + twoDigits(f);
		}

		requestAnimationFrame(displayTime);
	}

	function updateBox() {
		var topLeft,
			scaleFactor;

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
		scaleFactor = Math.max(window.innerWidth / video.videoWidth, window.innerHeight / video.videoHeight);

		boxdata.innerHTML = [
			topLeft.x,
			Math.round(Math.abs(boxWidth) / scaleFactor),
			topLeft.y,
			Math.round(Math.abs(boxHeight) / scaleFactor)
		].join(', ');
	}

	video.addEventListener('mousedown', function (evt) {
		if (evt.which === 1) {
			dragging = true;
			boxX = evt.clientX;
			boxY = evt.clientY;
			boxWidth = 0;
			boxHeight = 0;
			box.style.display = 'block';
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
			box.style.display = '';
		}
	}, true);

	box.addEventListener('click', function () {
		dragging = false;
		boxWidth = 0;
		boxHeight = 0;
		box.style.display = '';
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

	/*
	if (/iP(ad|hone|od)/g.test(navigator.userAgent)) {
		setInterval(resize, 500);
	}
	*/

	player = new Play({
		media: video,
		playButton: 'playbutton',
		timeline: 'timeline'
	});

	if (video.readyState) {
		fetch();
	} else {
		video.addEventListener('loadedmetadata', fetch);
	}

	/*
	Cutie and the Boxer clip data
	*/
	popcorn = Popcorn('#video', {
		frameAnimation: true,
		framerate: FRAME_RATE
	});

	/*
	//skyline
	popcorn.responsive({
		start: 0,
		end: '3;21',
		x: 1280,
		y: 200
	});

	//bridge
	popcorn.responsive({
		start: '3;21',
		end: '7;07',
		x: 270,
		y: 620
	});

	//back rub
	popcorn.responsive({
		start: '7;07',
		end: '15;09',
		x: 850,
		y: 200
	});

	//putting gloves on
	popcorn.responsive({
		start: '15;09',
		end: '22;15',
		x: 779,
		y: 341
	});

	//cutie in studio with weird sculpture thingy
	popcorn.responsive({
		start: '22;15',
		end: '27;08',
		x: 983,
		y: 338
	});

	//punching and painting
	var start = Popcorn.util.toSeconds('27;08', FRAME_RATE),
		end = Popcorn.util.toSeconds('3:07;08', FRAME_RATE),
		xKeyframes = {
			from: 1280,
			timing: 'ease'
		},
		yKeyframes = {
			from: 391
		};

	function timeToFraction(t) {
		var time = Popcorn.util.toSeconds(t, FRAME_RATE);

		return (time - start) / (end - start);
	}

	xKeyframes[timeToFraction('32;11')] = 1280;
	xKeyframes[timeToFraction('33;23')] = 1200;
	xKeyframes[timeToFraction('40;19')] = 1200;
	xKeyframes[timeToFraction('43;17')] = 1100;
	xKeyframes[timeToFraction('47;09')] = 1100;
	xKeyframes[timeToFraction('49;21')] = 1280;
	xKeyframes[timeToFraction('53;00')] = 1280;
	xKeyframes[timeToFraction('55;00')] = 1100;

	//xKeyframes[timeToFraction('54;01')] = 1280;

	//xKeyframes[timeToFraction('56;19')] = 1280;

	popcorn.responsive({
		start: start,
		end: end,
		x: xKeyframes,
		y: yKeyframes
	});

	//title
	popcorn.responsive({
		start: '3:07;08',
		end: '3:12;12',
		x: 641,
		y: 353
	});

	//ceiling fan
	popcorn.responsive({
		start: '3:12;12',
		//end: '3:12;12',
		x: 975,
		y: 337
	});
	*/

	enabled.addEventListener('change', function () {
		if (enabled.checked) {
			popcorn.enable('responsive');
		} else {
			popcorn.disable('responsive');
		}
	});

	displayTime();

}(window));
