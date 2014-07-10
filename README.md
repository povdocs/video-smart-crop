# Responsive Video Experiment

Traditionally, film and video are composed with a fixed [aspect ratio](http://en.wikipedia.org/wiki/Aspect_ratio_%28image%29), but the video may not always be viewed on a device with the same aspect ratio as originally intended. For example, theatrical films are often presented at 1.85:1, while television is broadcast at 16:9 for high-definition or 4:3 for standard definition. There are typically two solutions to this challenge:

1. Publish platform specific versions of a video, cropped to the target aspect ratio. The original authors may or may not be involved in re-composing the frame appropriately.

2. Apply [letterbox](http://en.wikipedia.org/wiki/Letterboxing_%28filming%29) or [pillarbox](http://en.wikipedia.org/wiki/Pillarbox), i.e. add black bars to the top or side of the frame. The original image composition is preserved, but not all of the display device is used and the subject of the image may appear smaller than intended.

While these approaches mostly worked for cinema and television, they may no longer be optimal with the wider range of display devices and contexts in which video is likely to be viewed. With mobile devices that may be held horizontally or vertically and with the ability for desktop browser windows to be scaled to whatever size suits their user, the range of possible aspect ratios is almost infinite. It is impractical to publish a separate version of a video for every possible (or even likely) aspect ratio. And the negative effects of letterboxing are magnified on mobile devices held vertically or in tall and narrow browser windows.

This experiment is an attempt to test an alternate solution that allows a video to fill any screen or window, while preserving the intended composition of the frame and the full view of the subject. A video is paired with a data file that specifies a rectangle containing the minimum required area of the frame for each shot. As the video plays, the frame is cropped to fill the display area while guaranteeing that the subject remains in frame, as close to the original composition as possible. In extremely wide or tall displays, minimal letter/pillarboxing may be used to preserve large subject areas.

The intention is to serve the convenience of the viewer on whatever device they are using while granting the author a degree of control over the composition.

## Known Issues
This is an experimental prototype designed to test the responsive video concept, so it's not a fully fleshed out and tested piece of software.

- Assumes only one video on a page, using the full window.
- There is currently no way to fully tear down attached event listeners.
- Does not work on iPhone. Mobile Safari on iPhone will only play videos at full screen. There is probably not a workaround for this without building a native app,
so make sure to account for this issue when building your video player.
- Shot transitions may be off by one frame, especially when seeking. The HTML video element reports its current time before it updates the display, so the wrong shot data may be used for a very short but noticeable period.

## License
Coming soon

- Code will be open source (POV)
- Video: all rights reserved

## Authors
[Brian Chirls](https://github.com/brianchirls)
