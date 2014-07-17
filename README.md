# Video Smart Cropping Experiment

Traditionally, film and video are composed with a fixed [aspect ratio](http://en.wikipedia.org/wiki/Aspect_ratio_%28image%29), but the video may not always be viewed on a device with the same aspect ratio as originally intended. For example, theatrical films are often presented at 1.85:1, while television is broadcast at 16:9 for high-definition or 4:3 for standard definition. There are typically two solutions to this challenge:

1. Publish platform specific versions of a video, cropped to the target aspect ratio. The original authors may or may not be involved in re-composing the frame appropriately.

2. Apply [letterbox](http://en.wikipedia.org/wiki/Letterboxing_%28filming%29) or [pillarbox](http://en.wikipedia.org/wiki/Pillarbox), i.e. add black bars to the top or side of the frame. The original image composition is preserved, but not all of the display device is used and the subject of the image may appear smaller than intended.

While these approaches mostly worked for cinema and television, they may no longer be optimal with the wider range of display devices and contexts in which video is likely to be viewed. With mobile devices that may be held horizontally or vertically and with the ability for desktop browser windows to be scaled to whatever size suits their user, the range of possible aspect ratios is almost infinite. It is impractical to publish a separate version of a video for every possible (or even likely) aspect ratio. And the negative effects of letterboxing are magnified on mobile devices held vertically or in tall and narrow browser windows.

This experiment is an attempt to test an alternate solution that allows a video to fill any screen or window, while preserving the intended composition of the frame and the full view of the subject. A video is paired with a data file that specifies a rectangle containing the minimum required area of the frame for each shot. As the video plays, the frame is cropped to fill the display area while guaranteeing that the subject remains in frame, as close to the original composition as possible. In extremely wide or tall displays, minimal letter/pillarboxing may be used to preserve large subject areas.

The intention is to serve the convenience of the viewer on whatever device they are using while granting the author a degree of control over the composition.

## Instructions

[View live demo](http://povdocs.github.io/video-smart-crop/)

To see smart cropping in action, use the start button or the play controls at the bottom to play the video. Resize the browser window or rotate your mobile device to trigger smart cropping for each shot.

To customize the experiment with your own video, point the video element to your own video files and edit the data file to specify the parameters for each shot.

### Changing the video

You'll need to host your own video files and change the `<source>` elements to point to those files, preferably one for WebM and one for MP4 so you can support all modern browsers. There is a single video element in the page with the source elements beneath it, so they should be easy to find.

It is advised to change the `FRAME_RATE` variable in `main.js` to the frame rate of your video so the time codes are parsed correctly. Unfortunately, the browser does not have a way to determine the frame rate of your video file on its own, so you have to specify it manually.

### Editing the data file

Shot data are stored in `data/shots.json`. As there is no graphical editor, parameters for each shot must be edited manually. However, there are some tools built in to make this process a little bit easier. There is an element called `#info` that is set to `display: none`. If you allow the display of this element, either in the CSS code or with your browser's developer tools, you can see the precise current time code of the video and the position of your mouse in pixels relative to the video. If you also enable the `#box` element, you can use your mouse to draw a rectangle on the screen and display reference coordinates to be used in your shot data.

Each shot is described as an object that looks like this:

	{
		"title": "cut to cutie - small",
		"start": "2:13;06",
		"end": "2:19;00",
		"x": 830,
		"width": 330,
		"y": 240,
		"height": 350,
		"maxAspect": 0.84
	},

`start` and `end` fields represent the starting and ending points in the video for that shot. You can use SMTP time code to get the exact frame, provided you specify the frame rate as above, or you can use a floating point number representing the time in seconds.

`x`, `y`, `width` and `height` represent the rectangle around the target area in that shot. The smart cropping code will make sure that no matter how the frame is stretched, everything inside the rectangle will remain visible. These values are in pixels, relative to the pixel dimensions of the unscaled video.

The rectangle values can be keyframe-animated by defining each value as an object. Refer to the [Popcorn Base documentation](https://github.com/brianchirls/popcorn-base#animate-param-options) for instructions on how these values are specified.

`minAspect` and `maxAspect` specify the minimum and maximum aspect ratios for each shot. If the window aspect ratio falls outside of this range, it will be ignored and another concurrent shot will be used. This is useful for pans or cuts that only make sense within a tight angle.

The `title` field is ignored, but it is useful as an annotation to make reading the data easier. (The JSON format does not allow comments.) You can add any additional fields you want as annotations, and they will be ignored.

## Technology

This experiment makes use of the following tools and technology:
- HTML video - playing video and manipulating it with CSS as part of the DOM
- [CSS Transforms](https://developer.mozilla.org/en-US/docs/Web/Guide/CSS/Using_CSS_transforms) - scaling and translating the video, [GPU accelerated](http://blog.teamtreehouse.com/increase-your-sites-performance-with-hardware-accelerated-css) for smooth motion
- [Popcorn.js](https://github.com/mozilla/popcorn-js) - manage timing of the aspect ratio data so each shot can have separate parameters
- [Popcorn Base Plugin](https://github.com/brianchirls/popcorn-base) - keyframe animation of shot parameters

## Roadmap
- Refine complex rules for which ranges get triggered for increasingly extreme aspect ratios
- Make a version for [Seriously.js](https://github.com/brianchirls/Seriously.js/), once WebGL is available on iOS
- Experiment with different types of shots
- Build/improve basic tools for generating, visualizing and saving shot data
- Support rules based on absolute pixel dimensions. i.e. a target rectangle may need to be zoomed in on low-res devices to be clear, such as text or a face.
- Experiment using Popcorn.js to dynamically position title text so it remains in frame

## Known Issues
This is an experimental prototype designed to test the smart cropping concept, so it's not a fully fleshed out and tested piece of software.

- Assumes only one video on a page, using the full window.
- There is currently no way to fully tear down attached event listeners.
- Does not work on iPhone. Mobile Safari on iPhone will only play videos at full screen. There is probably not a workaround for this without building a native app,
so make sure to account for this issue when building your video player.
- Shot transitions may be off by one frame, especially when seeking. The HTML video element reports its current time before it updates the display, so the wrong shot data may be used for a very short but noticeable period.
- Tested successfully on Firefox 30 (mobile and desktop), Chrome 35 (mobile and desktop), Safari 7, iPad Mobile Safari 7, Internet Explorer 10 and 11. Does not work on IE9.

## License
- Original code is made avalable under [MIT License](http://www.opensource.org/licenses/mit-license.php), Copyright (c) 2014 American Documentary Inc.
- Video clip from "Cutie and the Boxer" - Copyright 2014 Ex Lion Tamer, Inc. All rights reserved.
- [Popcorn.js](https://github.com/mozilla/popcorn-js#license) and [Popcorn Base plugin](https://github.com/brianchirls/popcorn-base#license) are each distributed here under license from their respective authors

## Authors
- Code, concept and design by [Brian Chirls](https://github.com/brianchirls), [POV](http://www.pbs.org/pov/) Digital Technology Fellow
- Video clip from "Cutie and the Boxer" by Zachary Heinzerling (Copyright Ex Lion Tamer, Inc.)
