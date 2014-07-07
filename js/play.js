(function () {
	'use strict';

	function touch(element, down, move, up) {
		function calcCoords(evt, clientX, clientY) {
			var parent = element,
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

		function mouseMove(e) {
			var coords = calcCoords(e, e.clientX, e.clientY);
			move(e || window.event, coords.x, coords.y);
		}

		function mouseUp(e) {
			if (e.which === 1) {
				if (up) {
					up(e || window.event);
				}
				document.removeEventListener('mousemove',mouseMove, false);
				document.removeEventListener('mouseup',mouseUp, false);
			}
		}

		function mouseDown(e) {
			var coords;
			if (e.which === 1) {
				if (down) {
					coords = calcCoords(e, e.clientX, e.clientY);
					if (down(e || window.event, coords.x, coords.y) && e.preventDefault) {
						e.preventDefault();
					} else {
						return;
					}
				}
				if (move) {
					document.addEventListener('mousemove',mouseMove, false);
				}
				document.addEventListener('mouseup',mouseUp, false);
			}
		}
		element.addEventListener('mousedown', mouseDown, false);
		
		element.addEventListener('touchstart', function (e) {
			var downCoords;

			function touchMove(e) {
				var moveCoords = calcCoords(e, e.touches[0].clientX, e.touches[0].clientY);
				move(e.touches[0] || window.event, moveCoords.x, moveCoords.y);

				if (e.preventDefault) {
					e.preventDefault();
				}
				return false;
			}

			function touchEnd() {
				if (up) {
					up();
				}
				document.removeEventListener('touchmove',touchMove, false);
				document.removeEventListener('touchend',touchEnd, false);
			}

			if (e.preventDefault) {
				e.preventDefault();
			}
			element.removeEventListener('mousedown',mouseDown, false);
		
			if (down) {
				downCoords = calcCoords(e, e.touches[0].clientX, e.touches[0].clientY);
				down(e.touches[0] || window.event, downCoords.x, downCoords.y);
			}
		
			if (move) {
				document.addEventListener('touchmove',touchMove, false);
			}
			document.addEventListener('touchend',touchEnd, false);
		
		});
	}

	function getElement(input, tags) {
		var element,
			tag;

		if (typeof input === 'string') {
			element = document.getElementById(input);
		} else if (!input) {
			return false;
		}

		if (input.tagName) {
			element = input;
		}

		if (!element) {
			return input;
		}

		tag = element.tagName.toLowerCase();
		if (tags && tags.indexOf(tag) < 0) {
			return input;
		}

		return element;
	}

	function Play(options) {
		var media,
			timeline,
			progress,
			playButton,
			container,

			hideTimeout,

			seeking = false;

		function hide() {
			if (container) {
				container.classList.add('hidden');
			}
		}

		function show() {
			if (container) {
				container.classList.remove('hidden');
			}
			clearTimeout(hideTimeout);
			if (media && !media.paused) {
				hideTimeout = setTimeout(hide, 2000);
			}
		}

		function updatePlayState() {
			if (playButton && !seeking) {
				if (media.paused) {
					playButton.classList.remove('playing');
				} else {
					playButton.classList.add('playing');
				}
			}
			show();
		}

		function updateProgress() {
			if (progress && media.duration) {
				progress.style.width = (100 * media.currentTime / media.duration) + '%';
			}
		}

		function clickPlay() {
			if (media.paused) {
				media.play();
			} else {
				media.pause();
			}
		}

		function initTimelineTouch() {
			var playing;

			touch(timeline, function (e, x) {
				var t = media.duration * x / timeline.offsetWidth;
				playing = !media.paused;
				seeking = true;
				media.pause();
				media.currentTime = t;
				updateProgress();
				return true;
			}, function (e, x) {
				var t = media.duration * x / timeline.offsetWidth;
				media.currentTime = t;
				updateProgress();
				return true;
			}, function (e) {
				seeking = false;
				if (playing) {
					media.play();
				}
				return true;
			});
		}

		if (!options) {
			throw new Error('Missing required options');
		}

		media = getElement(options.media, ['video', 'audio']);
		if (!media) {
			//nothing to do, why bother?
			return;
		}

		playButton = getElement(options.playButton);
		if (playButton && playButton instanceof HTMLElement) {
			playButton.addEventListener('click', clickPlay, false);
			media.addEventListener('pause', updatePlayState, false);
			media.addEventListener('play', updatePlayState, false);
		}

		timeline = getElement(options.timeline);
		if (timeline && timeline instanceof HTMLElement) {
			initTimelineTouch();
			if (timeline.firstElementChild) {
				progress = timeline.firstElementChild;
			}
			if (progress) {
				media.addEventListener('timeupdate', updateProgress, false);
			}
		}

		container = getElement(options.container);
		if (container && container instanceof HTMLElement) {
			window.addEventListener('mousemove', show, false);
			window.addEventListener('touchstart', show, false);
			show();
		}

		updateProgress();
		updatePlayState();
		media.addEventListener('durationchange', updateProgress, false);
	}

	window.Play = Play;
}());