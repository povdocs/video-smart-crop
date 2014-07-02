(function (window) {
	var container = document.body,
		video = document.getElementById('video'),
		enabled = document.getElementById('enabled'),
		timecode = document.getElementById('timecode'),
		position = document.getElementById('position'),

		FRAME_RATE = 23.976216,

		centerX,
		centerY,
		x,
		y,
		currentTime = 0,

		lastResize = 0,
		windowWidth = 0,
		windowHeight = 0,
		resizeTimeout,

		frames = [];

	function resize(force) {
		function resizePlayer() {
			var windowAspect,
				videoAspect;
			return;
			if (windowHeight === window.innerHeight &&
					windowWidth === window.innerWidth &&
					centerX === x &&
					centerY === y) {

				return;
			}

			windowHeight = window.innerHeight;
			windowWidth = window.innerWidth;

			videoAspect = video.videoWidth / video.videoHeight;
			windowAspect = windowWidth / windowHeight;

			y = centerY;
			x = centerX;

			if (windowAspect > videoAspect) {
				//window is not tall enough
				video.style.width = '100%';
				video.style.height = '';
				video.style.left = '0';

				if (enabled.checked) {
					video.style.top = -centerY * (1 - videoAspect / windowAspect) + 'px';
				} else {
					video.style.top = -windowHeight / 2 * (1 - videoAspect / windowAspect) + 'px';
				}
			} else {
				//window is not wide enough
				video.style.width = '';
				video.style.height = '100%';
				video.style.top = '0';

				if (enabled.checked) {
					video.style.left = -centerX * (1 - windowAspect / videoAspect) + 'px';
				} else {
					video.style.left = -windowWidth / 2 * (1 - windowAspect / videoAspect) + 'px';
				}
			}
		}

		force = force === true;

		if (!force || Date.now() - lastResize < 250) {
			clearTimeout(resizeTimeout);
			resizeTimeout = setTimeout(resizeTimeout, 250);
		} else {
			resizePlayer();
		}
	}

	function update() {
		var frame = Math.floor(video.currentTime * FRAME_RATE),
			pos = frames[frame];

		if (pos) {
			centerX = pos.x;
			centerY = pos.y;
		} else {
			centerX = video.videoWidth / 2;
			centerY = video.videoHeight / 2;
		}

		resize(true);
		requestAnimationFrame(update);
	}

	function displayCoords(e) {
		function calcCoords(evt) {
			var parent = video,
				x = 0,
				y = 0;

			while (parent && parent !== document.body) {
				x += parent.offsetLeft;
				y += parent.offsetTop;
				parent = parent.offsetParent;
			}

			return {
				x: evt.clientX - x,
				y: evt.clientY - y
			};
		}

		var coords = calcCoords(e),
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
			var s;
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

	//video.addEventListener('loadedmetadata', fetch, false);
	//window.addEventListener('resize', resize, false);
	//window.addEventListener('orientationchange', resize, false);

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

	if (/iP(ad|hone|od)/g.test(navigator.userAgent)) {
		setInterval(resize, 500);
	}

	var player = new Play({
		media: video,
		playButton: 'playbutton',
		timeline: 'timeline'
	});

	/*
	Cutie and the Boxer clip data
	*/
	var popcorn = Popcorn('#video', {
		frameAnimation: true,
		framerate: FRAME_RATE
	});

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
	enabled.addEventListener('change', function () {
		if (enabled.checked) {
			popcorn.enable('responsive');
		} else {
			popcorn.disable('responsive');
		}
	});

	displayTime();

}(window));
