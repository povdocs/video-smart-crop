(function (window) {
	var container = document.body,
		video = document.getElementById('video'),
		enabled = document.getElementById('enabled'),
		timecode = document.getElementById('timecode'),
		position = document.getElementById('position'),

		FRAME_RATE = 25,

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

	function fetch() {
		var xhr = new XMLHttpRequest();
		xhr.onload = function (evt) {
			var i = 0,
				j = 0,
				frame = 0,
				frameData,
				response,
				base;

			//for some reason this runs twice
			if (frames.length) {
				return;
			}

			response = xhr.responseText.split('\n');
			base = {
				x: video.videoWidth / 2,
				y: video.videoHeight / 2
			};

			for (i = 0; i < response.length; i++) {
				frameData = response[i].split(', ');
				frame = parseInt(frameData[0], 10);
				for (j = frames.length; j < frame; j++) {
					frames.push(base);
				}
				frames.push({
					x: parseFloat(frameData[1]),
					y: parseFloat(frameData[2])
				});
			}

			update();
		};
		xhr.open('GET', 'data/activist.csv');
		xhr.send();
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

	if (video.readyState) {
		fetch();
	} else {
		video.addEventListener('loadedmetadata', fetch, false);
	}

	window.addEventListener('resize', resize, false);
	window.addEventListener('orientationchange', resize, false);

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

	enabled.addEventListener('change', function () {
		x = -1;
		y = -1;
		update();
	});

	if (/iP(ad|hone|od)/g.test(navigator.userAgent)) {
		setInterval(resize, 500);
	}

	var player = new Play({
		media: video,
		playButton: 'playbutton',
		timeline: 'timeline'
	});

	displayTime();

}(window));
